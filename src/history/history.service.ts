import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Tables } from '@/types/database.types';
import { SupabaseService } from '@supabase/supabase.service';
import { AddHistoryDto } from '@/history/dto/add-history.dto';

export type HistoryEntry = Tables<'listening_history'>;

@Injectable()
export class HistoryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * @note Returns listening history for a given user, ordered by played_at descending.
   * @param userId - The UUID of the user
   * @param limit - Maximum number of records to return (default 50)
   * @returns Array of HistoryEntry records
   * @throws NotFoundException if failed to fetch listening history
   */
  async getHistory(userId: string, limit = 50): Promise<HistoryEntry[]> {
    const { data, error } = await this.supabaseService.db
      .from('listening_history')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new NotFoundException('Failed to fetch listening history');
    }

    return data ?? [];
  }

  /**
   * @notes Adds a track to the user's listening history.
   * @notes Duplicate entries are allowed - same track can appear multiple times.
   * @param userId - The UUID of the user
   * @param dto - Track data to save
   * @returns The created HistoryEntry record
   */
  async addHistory(userId: string, dto: AddHistoryDto): Promise<HistoryEntry> {
    const { data, error } = await this.supabaseService.db
      .from('listening_history')
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

    if (error ?? !data) {
      throw new ConflictException('Failed to add to listening history');
    }

    return data;
  }

  /**
   * @notes Removes a single history entry by its record ID.
   * @param userId - The UUID of the user
   * @param id - The UUID of the history record to remove
   * @throws NotFoundException if the record does not exist
   */
  async removeHistoryEntry(userId: string, id: string): Promise<void> {
    const { error, count } = await this.supabaseService.db
      .from('listening_history')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('track_id', id);

    if (error) {
      throw new NotFoundException('Failed to remove history entry');
    }

    if (count === 0) {
      throw new NotFoundException(`History entry ${id} not found`);
    }
  }

  /**
   * @note Clears the entire listening history for a given user.
   * @param userId - The UUID of the user
   * @throws ConflictException if the operation fails
   */
  async clearHistory(userId: string): Promise<void> {
    const { error } = await this.supabaseService.db
      .from('listening_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new ConflictException('Failed to clear listening history');
    }
  }
}
