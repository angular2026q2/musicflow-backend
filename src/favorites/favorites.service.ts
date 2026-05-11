import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '@supabase/supabase.service';
import { AddFavoriteDto } from '@favorites/dto/add-favorite.dto';
import type { Tables } from '@/types/database.types';

export type Favorite = Tables<'favorites'>;

@Injectable()
export class FavoritesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * @note Returns all favorites for a given user, ordered by creation date descending.
   * @param userId - The UUID of the user
   * @returns Array of Favorite records
   * @throws NotFoundException if failed to fetch
   */
  async getFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await this.supabaseService.db
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new NotFoundException('Failed to fetch favorites');
    }

    return data ?? [];
  }

  /**
   * @notes Adds a track to the user's favorites.
   * @notes Throws if the track is already in favorites (unique constraint).
   * @param userId - The UUID of the user
   * @param dto - Track data to save
   * @returns The created Favorite record
   * @throws ConflictException if the track is already in favorites
   */
  async addFavorite(userId: string, dto: AddFavoriteDto): Promise<Favorite> {
    const { data, error } = await this.supabaseService.db
      .from('favorites')
      .insert({
        user_id: userId,
        track_id: dto.track_id,
        track_name: dto.track_name,
        artist_name: dto.artist_name,
        album_name: dto.album_name,
        album_image: dto.album_image,
        audio: dto.audio,
        duration: dto.duration,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException(' Track is already in favorites');
      }
      throw new ConflictException('Failed to add favorite');
    }

    return data;
  }

  /**
   * @note Removes a track from the user's favorites by track_id.
   * @param userId - The UUID of the user
   * @param trackId - The Jamendo track ID to remove
   * @throws NotFoundException if the favorite does not exist
   */
  async removeFavorite(userId: string, trackId: string): Promise<void> {
    const { error, count } = await this.supabaseService.db
      .from('favorites')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('track_id', trackId);

    if (error) {
      throw new NotFoundException('Failed to remove favorite');
    }

    if (count === 0) {
      throw new ConflictException(`Track ${trackId} not found in favorites`);
    }
  }

  /**
   * @note Checks whether a specific track is in the user's favorites.
   * @param userId - The UUID of the user
   * @param trackId - The Jamendo track ID to check
   * @returns Object with a single boolean field `is_favorite`
   */
  async isFavorite(
    userId: string,
    trackId: string,
  ): Promise<{ is_favorite: boolean }> {
    const { data } = await this.supabaseService.db
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single();

    return { is_favorite: !!data };
  }
}
