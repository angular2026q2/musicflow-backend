import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '@supabase/supabase.service';
import { CreatePlaylistDto } from '@playlists/dto/create-playlist.dto';
import { UpdatePlaylistDto } from '@playlists/dto/update-playlist.dto';
import type { Tables } from '@/types/database.types';

export type Playlist = Tables<'playlists'>;
export type PlaylistTrack = Tables<'playlist_tracks'>;
export type PlaylistWithTracks = Playlist & { tracks: PlaylistTrack[] };

@Injectable()
export class PlaylistsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPlaylists(userId: string): Promise<PlaylistWithTracks[]> {
    const { data: playlists, error } = await this.supabaseService.db
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new NotFoundException('Failed to fetch playlists');

    if (!playlists || playlists.length === 0) return [];

    const playlistIds = playlists.map((p) => p.id);

    const { data: tracks, error: tracksError } = await this.supabaseService.db
      .from('playlist_tracks')
      .select('*')
      .in('playlist_id', playlistIds)
      .order('position', { ascending: true });

    if (tracksError)
      throw new NotFoundException('Failed to fetch playlist tracks');

    return playlists.map((playlist) => ({
      ...playlist,
      tracks: (tracks ?? []).filter((t) => t.playlist_id === playlist.id),
    }));
  }

  async createPlaylist(
    userId: string,
    dto: CreatePlaylistDto,
  ): Promise<PlaylistWithTracks> {
    const { data, error } = await this.supabaseService.db
      .from('playlists')
      .insert({
        user_id: userId,
        name: dto.name,
        description: dto.description ?? '',
      })
      .select()
      .single();

    if (error) throw new NotFoundException('Failed to create playlist');

    return { ...data, tracks: [] };
  }

  async updatePlaylist(
    userId: string,
    id: string,
    dto: UpdatePlaylistDto,
  ): Promise<PlaylistWithTracks> {
    const { data: existing, error: findError } = await this.supabaseService.db
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !existing)
      throw new NotFoundException('Playlist not found');

    if (existing.user_id !== userId)
      throw new ForbiddenException('You are not the owner of this playlist');

    const updatePayload: {
      name?: string;
      description?: string;
      updated_at?: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined)
      updatePayload.description = dto.description;

    const { data: updated, error: updateError } = await this.supabaseService.db
      .from('playlists')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updated)
      throw new NotFoundException('Failed to update playlist');

    if (dto.tracks !== undefined) {
      await this.supabaseService.db
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', id);

      if (dto.tracks.length > 0) {
        const rows = dto.tracks.map((t, index) => ({
          playlist_id: id,
          track_id: t.track_id,
          track_name: t.track_name,
          artist_name: t.artist_name,
          album_name: t.album_name,
          album_image: t.album_image,
          audio: t.audio,
          duration: t.duration,
          position: index,
        }));

        await this.supabaseService.db.from('playlist_tracks').insert(rows);
      }
    }

    const { data: tracks } = await this.supabaseService.db
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', id)
      .order('position', { ascending: true });

    return { ...updated, tracks: tracks ?? [] };
  }

  async deletePlaylist(userId: string, id: string): Promise<void> {
    const { data: existing, error: findError } = await this.supabaseService.db
      .from('playlists')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (findError || !existing)
      throw new NotFoundException('Playlist not found');

    if (existing.user_id !== userId)
      throw new ForbiddenException('You are not the owner of this playlist');

    const { error } = await this.supabaseService.db
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException('Failed to delete playlist');
  }
}
