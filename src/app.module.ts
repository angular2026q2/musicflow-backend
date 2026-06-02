import { KeepAliveTask } from '@common/tasks/keep-alive.task';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from '@supabase/supabase.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { MusicModule } from '@music/music.module';
import { FavoritesModule } from '@favorites/favorites.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    MusicModule,
    FavoritesModule,
    HistoryModule,
  ],
  controllers: [],
  providers: [KeepAliveTask],
})
export class AppModule {}
