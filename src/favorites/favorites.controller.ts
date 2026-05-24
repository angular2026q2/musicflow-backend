import { AddFavoriteDto } from '@favorites/dto/add-favorite.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Favorite, FavoritesService } from '@favorites/favorites.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@auth/strategies/jwt.strategy';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /** @note Returns all favorites for the current user. */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all favorites' })
  @ApiResponse({ status: 200, description: 'Favorites returned' })
  async getFavorites(@CurrentUser() user: AuthUser): Promise<Favorite[]> {
    return this.favoritesService.getFavorites(user.id);
  }

  /** @note Adds a track to the current user's favorites. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add track to favorites' })
  @ApiResponse({ status: 201, description: 'Track added to favorites' })
  @ApiResponse({ status: 409, description: 'Track already in favorites' })
  async addFavorite(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddFavoriteDto,
  ): Promise<Favorite> {
    return this.favoritesService.addFavorite(user.id, dto);
  }

  /** @note Removes a track from the current user's favorites.*/
  @Delete(':trackId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove track from favorites' })
  @ApiParam({ name: 'trackId', example: '1161940' })
  @ApiResponse({ status: 204, description: 'Track removed from favorites' })
  @ApiResponse({ status: 404, description: 'Track not found in favorites' })
  async removeFavorite(
    @CurrentUser() user: AuthUser,
    @Param('trackId') trackId: string,
  ): Promise<void> {
    return this.favoritesService.removeFavorite(user.id, trackId);
  }

  /** @note Checks if a specific track is in the current user's favorites.*/
  @Get(':trackId/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if track is in favorites' })
  @ApiParam({ name: 'trackId', example: '1161940' })
  @ApiResponse({ status: 200, description: 'Returns is_favorite boolean' })
  async isFavorite(
    @CurrentUser() user: AuthUser,
    @Param('trackId') trackId: string,
  ): Promise<{ is_favorite: boolean }> {
    return this.favoritesService.isFavorite(user.id, trackId);
  }
}
