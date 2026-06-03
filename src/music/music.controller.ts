import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { MusicService } from '@music/music.service';
import { MusicQueryDto } from '@music/dto/music-query.dto';
import type {
  JamendoAlbum,
  JamendoAlbumTrack,
  JamendoArtist,
  JamendoArtistAlbum,
  JamendoArtistTrack,
  JamendoTrack,
  PaginatedResult,
} from '@music/dto/jamendo.interfaces';

@ApiTags('Music')
@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  /**
   * @note Returns a list of tracks, optionally filtered by search and tags.
   */
  @Get('tracks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tracks list' })
  @ApiResponse({ status: 200, description: 'Tracks list returned' })
  async getTracks(
    @Query() query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoTrack>> {
    return this.musicService.getTracks(query);
  }

  /**
   * @note Return a single track by Jamendo ID
   */
  @Get('track/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get track by ID' })
  @ApiParam({ name: 'id', example: '1161940' })
  @ApiResponse({ status: 200, description: 'Track returned by id' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  async getTrackById(@Param('id') id: string): Promise<JamendoTrack> {
    return this.musicService.getTrackById(id);
  }

  /**
   * @note Returns a list of albums, optionally filtered by search params
   */
  @Get('albums')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get albums list' })
  @ApiResponse({ status: 200, description: 'Albums list returned' })
  async getAlbums(
    @Query() query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoAlbum>> {
    return this.musicService.getAlbums(query);
  }

  /**
   * @note Returns a single album by Jamendo ID
   */
  @Get('albums/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get album by ID' })
  @ApiParam({ name: 'id', example: '139585' })
  @ApiResponse({ status: 200, description: 'Album returned by id' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  async getAlbumById(@Param('id') id: string): Promise<JamendoAlbum> {
    return this.musicService.getAlbumById(id);
  }

  /**
   * @note Returns tracks for a specific album by Jamendo album ID.
   */
  @Get('albums/:id/tracks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get album tracks by album ID' })
  @ApiParam({ name: 'id', example: '139585' })
  @ApiResponse({ status: 200, description: 'Album tracks returned' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  async getAlbumTracks(@Param('id') id: string): Promise<JamendoAlbumTrack[]> {
    return this.musicService.getAlbumTracks(id);
  }

  /**
   * @note Returns a list of artists, optionally filtered by search param
   */
  @Get('artists')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get artists list' })
  @ApiResponse({ status: 200, description: 'Artists list returned' })
  async getArtists(
    @Query() query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoArtist>> {
    return this.musicService.getArtists(query);
  }

  /**
   * @note Returns a single artist by Jamendo ID
   */
  @Get('artists/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get artist by ID' })
  @ApiParam({ name: 'id', example: '357890' })
  @ApiResponse({ status: 200, description: 'Artist returned' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  async getArtistById(@Param('id') id: string): Promise<JamendoArtist> {
    return this.musicService.getArtistById(id);
  }

  /**
   * @note Returns tracks for a specific artist by Jamendo artist ID.
   */
  @Get('artists/:id/tracks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get artist tracks by artist ID' })
  @ApiParam({ name: 'id', example: '357890' })
  @ApiResponse({ status: 200, description: 'Artist tracks returned' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  async getArtistTracks(
    @Param('id') id: string,
    @Query() query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoArtistTrack>> {
    return this.musicService.getArtistTracks(id, query);
  }

  /**
   * @note Returns albums for a specific artist by Jamendo artist ID.
   */
  @Get('artists/:id/albums')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get artist albums by artist ID' })
  @ApiParam({ name: 'id', example: '357890' })
  @ApiResponse({ status: 200, description: 'Artist albums returned' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  async getArtistAlbums(
    @Param('id') id: string,
    @Query() query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoArtistAlbum>> {
    return this.musicService.getArtistAlbums(id, query);
  }

  /**
   * @note Returns a list iof featured tracks
   */
  @Get('featured')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get featured tracks list' })
  @ApiResponse({ status: 200, description: 'Featured tracks list returned' })
  async getFeaturedTracks(
    @Query() query: MusicQueryDto,
  ): Promise<PaginatedResult<JamendoTrack>> {
    return this.musicService.getFeaturedTracks(query);
  }

  /**
   * @note Returns available music genres from Jamendo
   */
  @Get('genres')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get available genres' })
  @ApiResponse({ status: 200, description: 'Genres returned' })
  async getGenres(): Promise<string[]> {
    return this.musicService.getGenres();
  }
}
