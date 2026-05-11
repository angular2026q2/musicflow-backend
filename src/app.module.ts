import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '@supabase/supabase.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { MusicModule } from '@music/music.module';
import { FavoritesModule } from '@favorites/favorites.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
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
  providers: [],
})
export class AppModule {}
