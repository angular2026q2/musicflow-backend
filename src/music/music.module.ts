import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';

@Module({
  imports: [HttpModule],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule {}
