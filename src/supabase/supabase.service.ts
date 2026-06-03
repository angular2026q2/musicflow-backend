import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient<Database>;
  private readonly userClient: SupabaseClient<Database>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    const anonKey = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');

    this.client = createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.userClient = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  get db(): SupabaseClient<Database> {
    return this.client;
  }
  get userAuth(): SupabaseClient<Database> {
    return this.userClient;
  }
}
