import { Tables } from '@/types/database.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '@supabase/supabase.service';
import { UpdateProfileDto } from '@users/dto/update-profile.dto';

export type UserProfile = Tables<'profiles'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @note Deletes the user's custom avatar from Supabase Storage
   * and assigns a new random default avatar to their profile.
   * @param userId - The UUID of the user
   * @returns The updated profile record with the new default avatar_url
   * @throws ConflictException if the deletion or profile update fails
   */
  async deleteAvatar(userId: string): Promise<UserProfile> {
    const filePath = `${userId}/avatar.jpg`;

    const { error: deleteError } = await this.supabaseService.db.storage
      .from('avatars')
      .remove([filePath]);

    if (deleteError) {
      throw new ConflictException({
        error: deleteError.message,
        message: `An error occurred while deleting avatar`,
      });
    }

    const defaultAvatarUrl = await this.getRandomDefaultAvatarUrl();

    const { data, error: updateError } = await this.supabaseService.db
      .from('profiles')
      .update({
        avatar_url: defaultAvatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError ?? !data) {
      throw new ConflictException(
        'Failed to update profile after avatar deletion',
      );
    }

    return data;
  }

  /**
   * @notes Retrieves a user profile by ID.
   * @param userId - The UUID of the user
   * @returns The user's profile record from the `profiles` table
   * @throws NotFoundException if the profile does not exist
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabaseService.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error ?? !data) {
      throw new NotFoundException('User profile not found');
    }

    return data;
  }

  /**
   * @notes Updates a user's profile fields (username, full_name).
   * @notes Checks for username uniqueness before applying changes.
   * @param userId - The UUID of the user to update
   * @param dto - Partial profile fields to update
   * @returns The updated profile record
   * @throws ConflictException if the username is already taken by another user
   * @throws NotFoundException if the update operation fails
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    if (dto.username) {
      const { data: existing } = await this.supabaseService.db
        .from('profiles')
        .select('id')
        .eq('username', dto.username)
        .neq('id', userId)
        .single();

      if (existing) {
        throw new ConflictException('Username already exists');
      }
    }

    const { data, error } = await this.supabaseService.db
      .from('profiles')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error ?? !data) {
      throw new NotFoundException('Failed to update profile');
    }

    return data;
  }

  /**
   * @Notes Uploads a user's avatar image to Supabase Storage.
   * @Notes Stores the file at path `{userId}/avatar.{ext}` in the `avatars` bucket.
   * @Notes Updates the `avatar_url` field in the user's profile after upload.
   * @param userId - The UUID of the user
   * @param file - The uploaded file buffer from multer
   * @returns The updated profile record with the new avatar_url
   * @throws ConflictException if the upload or profile update fails
   */
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UserProfile> {
    const ext = (file.originalname.split('.').pop() ?? 'jpg').toLowerCase();
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await this.supabaseService.db.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new ConflictException({
        message: 'Failed to upload avatar',
        error: uploadError,
      });
    }

    const { data: urlData } = this.supabaseService.db.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { data, error: updateError } = await this.supabaseService.db
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError ?? !data) {
      throw new ConflictException({
        message: 'Failed to update avatar URL in profile',
        error: updateError,
      });
    }

    return data;
  }

  /**
   * @notes Permanently deletes a user account from Supabase Auth.
   * @notes All related data (profiles, favorites, history) is removed
   * automatically via ON DELETE CASCADE constraints in the DB.
   * @param userId - The UUID of the user to delete
   * @throws NotFoundException if the deletion fails
   */
  async deleteProfile(userId: string): Promise<void> {
    const { error } =
      await this.supabaseService.db.auth.admin.deleteUser(userId);

    if (error) {
      throw new NotFoundException('Failed to delete account');
    }
  }

  /**
   * @notes Returns a random default avatar URL.
   * @notes Used externally by AuthService during user registration.
   */
  async getDefaultAvatarUrl(): Promise<string> {
    return this.getRandomDefaultAvatarUrl();
  }

  /**
   * @notes Fetches the list of default avatars from the `default_avatars` bucket
   * and returns a random one's public URL.
   * @notes Automatically adapts to however many files are stored in the bucket.
   * @throws ConflictException if the bucket is empty or unavailable
   */
  private async getRandomDefaultAvatarUrl(): Promise<string> {
    const { data, error } = await this.supabaseService.db.storage
      .from('default_avatars')
      .list();

    if (error ?? !data) {
      throw new ConflictException('Default avatars not available');
    }

    const random = data[Math.floor(Math.random() * data.length)];

    const { data: urlData } = this.supabaseService.db.storage
      .from('default_avatars')
      .getPublicUrl(random.name);

    return urlData.publicUrl;
  }
}
