import { Tables } from '@/types/database.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '@supabase/supabase.service';
import { UpdateProfileDto } from '@users/dto/update-profile.dto';

export type UserProfile = Tables<'profiles'>;

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

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
}
