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
   * @notes Fetches a list of tracks from Jamendo API.
   * @notes Supports search by name, genre tags, pagination.
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

    return this.paginate(response.data, response.data.results);
  }

  /**
   * @note Fetches a single track by its Jamendo ID.
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
   * @note Fetches a list of albums from Jamendo API.
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

    return this.paginate(response.data, response.data.results);
  }

  /**
   * @note Fetches a single album by its Jamendo ID.
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
   * @note Fetches a list of artists from Jamendo API
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

    return this.paginate(response.data, response.data.results);
  }

  /**
   * @note Fetches a single artist by their Jamendo ID
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

  /**
   * @note Fetches featured tracks from Jamendo API.
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
        'Failed to fetch fetured tracks from Jamendo',
      );
    });

    return this.paginate(response.data, response.data.results);
  }

  /**
   * @note Fetches available music genres (tags) from Jamendo API.
   * @returns Array of genre name strings
   */
  async getGenres(): Promise<string[]> {
    const url = this.buildUrl('/tags', { limit: 20 });

    const response = await firstValueFrom(
      this.httpService.get<JamendoResponse<{ id: string; name: string }>>(url),
    ).catch(() => {
      throw new InternalServerErrorException(
        '' + 'Failed to fetch genres from Jamendo',
      );
    });

    return response.data.results.map((tag) => tag.name);
  }

  /**
   * @note Builds a URL with common Jamendo query params (client_id, format, limit, offset).
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
   * @note Wraps Jamendo response into a PaginatedResult.
   * @param response - Raw Jamendo API response
   * @param data - Parsed results array
   */
  private paginate<T>(
    response: JamendoResponse<T>,
    data: T[],
  ): PaginatedResult<T> {
    return {
      data,
      meta: {
        results_count: response.headers.results_count,
        next: response.headers.next ?? null,
      },
    };
  }
}
