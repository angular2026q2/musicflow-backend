import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@auth/strategies/jwt.strategy';
import {
  PlaylistsService,
  PlaylistWithTracks,
} from '@playlists/playlists.service';
import { CreatePlaylistDto } from '@playlists/dto/create-playlist.dto';
import { UpdatePlaylistDto } from '@playlists/dto/update-playlist.dto';

@ApiTags('Playlists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all playlists for current user' })
  @ApiResponse({ status: 200, description: 'Playlists returned' })
  async getPlaylists(
    @CurrentUser() user: AuthUser,
  ): Promise<PlaylistWithTracks[]> {
    return this.playlistsService.getPlaylists(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiResponse({ status: 201, description: 'Playlist created' })
  async createPlaylist(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePlaylistDto,
  ): Promise<PlaylistWithTracks> {
    return this.playlistsService.createPlaylist(user.id, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update playlist name, description or track order' })
  @ApiParam({ name: 'id', description: 'Playlist UUID' })
  @ApiResponse({ status: 200, description: 'Playlist updated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async updatePlaylist(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePlaylistDto,
  ): Promise<PlaylistWithTracks> {
    return this.playlistsService.updatePlaylist(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a playlist' })
  @ApiParam({ name: 'id', description: 'Playlist UUID' })
  @ApiResponse({ status: 204, description: 'Playlist deleted' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async deletePlaylist(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.playlistsService.deletePlaylist(user.id, id);
  }
}
