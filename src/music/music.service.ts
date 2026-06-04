import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type {
  JamendoTrack,
  JamendoAlbum,
  JamendoArtist,
  JamendoResponse,
  PaginatedResult,
  JamendoAlbumTrack,
  JamendoAlbumWithTracks,
  JamendoArtistTrack,
  JamendoArtistAlbum,
  JamendoArtistWithTracks,
  JamendoArtistWithAlbums,
} from './dto/jamendo.interfaces';
import type { MusicQueryDto } from './dto/music-query.dto';

@Injectable()
export class MusicService {
  private readonly baseUrl: string;
  private readonly clientId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('JAMENDO_BASE_URL');
    this.clientId = this.configService.getOrThrow<string>('JAMENDO_CLIENT_ID');
  }

  /**
   * @description Fetches a list of tracks from Jamendo API.
   * @description Supports search by name, genre tags, pagination.
   * @param query - Query parameters (search, tags, limit, offset)
   * @returns Array of JamendoTrack objects
   */
  async getTracks(
    query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoTrack>> {
    const url = this.buildUrl('/tracks', {
      search: query.search,
      tags: query.tags,
      limit: query.limit,
      offset: query.offset,
    });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoTrack>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch tracks from Jamendo',
      );
    });

    return this.paginate(response.data, response.data.results, query);
  }

  /**
   * @description Fetches a single track by its Jamendo ID.
   * @param id - Jamendo track ID
   * @returns A single JamendoTrack object
   * @throws NotFoundException if track does not exist
   */
  async getTrackById(id: string): Promise<JamendoTrack> {
    const url = this.buildUrl('/tracks', { id, limit: 1 });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoTrack>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch track from Jamendo',
      );
    });

    const track = response.data.results[0];
    if (!track) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }

    return track;
  }

  /**
   * @description Fetches a list of albums from Jamendo API.
   * @param query - Query parameters (search, limit, offset)
   * @returns Array of JamendoAlbum objects
   */
  async getAlbums(
    query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoAlbum>> {
    const url = this.buildUrl('/albums', {
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoAlbum>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch albums from Jamendo',
      );
    });

    return this.paginate(response.data, response.data.results, query);
  }

  /**
   * @description Fetches a single album by its Jamendo ID.
   * @param id - Jamendo album ID
   * @returns A single JamendoAlbum object
   * @throws NotFoundException if album does not exist
   */
  async getAlbumById(id: string): Promise<JamendoAlbum> {
    const url = this.buildUrl('/albums', { id, limit: 1 });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoAlbum>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch album from Jamendo',
      );
    });

    const album = response.data.results[0];
    if (!album) {
      throw new NotFoundException(`Album with id ${id} not found`);
    }

    return album;
  }

  /**
   * @description Fetches tracks for a specific album from Jamendo API.
   * @param albumId - Jamendo album ID
   * @returns Array of AlbumTrack objects
   * @throws NotFoundException if album does not exist
   */
  async getAlbumTracks(albumId: string): Promise<JamendoAlbumTrack[]> {
    const url = this.buildUrl('/albums/tracks', { id: albumId });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoAlbumWithTracks>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch album tracks from Jamendo',
      );
    });

    const album = response.data.results[0];
    if (!album) {
      throw new NotFoundException(`Album with id ${albumId} not found`);
    }

    return album.tracks;
  }

  /**
   * @description Fetches a list of artists from Jamendo API
   * @param query - Query params (search, limit, offset
   * @returns Array of JamendoArtists objects
   */
  async getArtists(
    query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoArtist>> {
    const url = this.buildUrl('/artists', {
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoArtist>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch artists from Jamendo',
      );
    });

    return this.paginate(response.data, response.data.results, query);
  }

  /**
   * @description Fetches a single artist by their Jamendo ID
   * @param id - Jamendo artist ID
   * @returns A single JamendoArtist object
   * @throws NotFoundException if artist does not exist
   */
  async getArtistById(id: string): Promise<JamendoArtist> {
    const url = this.buildUrl('/artists', { id, limit: 1 });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoArtist>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch artist from Jamendo',
      );
    });

    const artist = response.data.results[0];
    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }

    return artist;
  }

  /** @description Fetches tracks for a specific artist from Jamendo API.
   * @param artistId - Jamendo artist ID
   * @param query - Query params (limit, offset)
   * @returns Paginated list of JamendoArtistTrack objects
   * @throws NotFoundException if artist does not exist
   */
  async getArtistTracks(
    artistId: string,
    query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoArtistTrack>> {
    const url = this.buildUrl('/artists/tracks', {
      id: artistId,
      limit: 1,
    });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoArtistWithTracks>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch artist tracks from Jamendo',
      );
    });

    const artist = response.data.results[0];
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${artistId} not found`);
    }

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const data = artist.tracks.slice(offset, offset + limit);

    return {
      data,
      meta: {
        results_count: artist.tracks.length,
        has_more: offset + data.length < artist.tracks.length,
        next: null,
      },
    };
  }

  /** @description Fetches albums for a specific artist from Jamendo API.
   * @param artistId - Jamendo artist ID
   * @param query - Query params (limit, offset)
   * @returns Paginated list of JamendoArtistAlbum objects
   * @throws NotFoundException if artist does not exist
   */
  async getArtistAlbums(
    artistId: string,
    query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoArtistAlbum>> {
    const url = this.buildUrl(`/artists/albums`, {
      id: artistId,
      limit: 1,
    });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoArtistWithAlbums>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch artist albums from Jamendo',
      );
    });

    const artist = response.data.results[0];
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${artistId} not found`);
    }

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const data = artist.albums.slice(offset, offset + limit);

    return {
      data,
      meta: {
        results_count: artist.albums.length,
        has_more: offset + data.length < artist.albums.length,
        next: null,
      },
    };
  }

  /**
   * @description Fetches featured tracks from Jamendo API.
   * @param query - Query parameters (limit, offset)
   * @returns Array of featured JamendoTrack objects
   */
  async getFeaturedTracks(
    query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoTrack>> {
    const url = this.buildUrl('/tracks', {
      featured: 1,
      limit: query.limit,
      offset: query.offset,
    });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<JamendoTrack>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        'Failed to fetch featured tracks from Jamendo',
      );
    });

    return this.paginate(response.data, response.data.results, query);
  }

  /**
   * @description Fetches available music genres (tags) from Jamendo API.
   * @returns Array of genre name strings
   */
  async getGenres(): Promise<string[]> {
    const FALLBACK_GENRES = [
      'rock',
      'electronic',
      'classical',
      'ambient',
      'pop',
      'jazz',
      'hiphop',
      'metal',
      'folk',
      'soundtrack',
      'chillout',
      'lounge',
      'acoustic',
      'instrumental',
      'world',
    ];

    try {
      const url = this.buildUrl('/tags', { limit: 20 });
      const response = await firstValueFrom(
        this.httpService.get<JamendoResponse<{ id: string; name: string }>>(
          url,
        ),
      );

      const genres = response.data.results.map((tag) => tag.name);

      return genres.length > 0 ? genres : FALLBACK_GENRES;
    } catch {
      return FALLBACK_GENRES;
    }
  }

  /**
   * @description Builds a URL with common Jamendo query params (client_id, format, limit, offset).
   * @param endpoint - Jamendo API endpoint path (e.g. '/tracks'
   * @param params - Additional query params
   */
  private buildUrl(
    endpoint: string,
    params: Record<string, string | number | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('format', 'json');

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  /**
   * @description Wraps Jamendo response into a PaginatedResult.
   * @param response - Raw Jamendo API response
   * @param data - Parsed results array
   * @param query - Query parameters (limit, offset)
   * @returns PaginatedResult object containing data and meta-info
   */
  private paginate<T>(
    response: JamendoResponse<T>,
    data: T[],
    query: MusicQueryDto,
  ): PaginatedResult<T> {
    const offset = query.offset ?? 0;
    const results_count = response.headers.results_count;

    return {
      data,
      meta: {
        results_count,
        has_more: offset + data.length < results_count,
        next: null,
      },
    };
  }
}
