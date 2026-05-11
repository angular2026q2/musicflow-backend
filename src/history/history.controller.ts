import { AddHistoryDto } from '@/history/dto/add-history.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HistoryEntry, HistoryService } from '@/history/history.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@auth/strategies/jwt.strategy';

@ApiTags('History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /** @note Returns listening history for the current user.*/
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get listening history' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Listening history returned successfully',
  })
  async getHistory(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit: number,
  ): Promise<HistoryEntry[]> {
    return this.historyService.getHistory(user.id, limit);
  }

  /** @note Adds a track to the current user's listening history.*/
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add track to listening history' })
  @ApiResponse({
    status: 200,
    description: 'Track added to history successfully',
  })
  async addHistory(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddHistoryDto,
  ): Promise<HistoryEntry> {
    return this.historyService.addHistory(user.id, dto);
  }

  /** @note Removes a single history entry by record ID.*/
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove single history entry' })
  @ApiParam({ name: 'id', example: 'uuid-of-history-record' })
  @ApiResponse({
    status: 204,
    description: 'History entry removed successfully',
  })
  @ApiResponse({ status: 404, description: 'History entry not found' })
  async removeHistory(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.historyService.removeHistoryEntry(user.id, id);
  }

  /** @note Clears entire listening history for the current user.*/
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all listening history' })
  @ApiResponse({ status: 204, description: 'History cleared successfully' })
  async clearHistory(@CurrentUser() user: AuthUser): Promise<void> {
    return this.historyService.clearHistory(user.id);
  }
}
