import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KeepAliveTask {
  private readonly logger = new Logger(KeepAliveTask.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async pingRailway(): Promise<void> {
    const baseUrl = this.configService.getOrThrow<string>(
      'APP_URL',
      'https://musicflow-backend-production.up.railway.app',
    );

    try {
      await firstValueFrom(this.httpService.get(`${baseUrl}/api/v1/health`));
      this.logger.log('Keep-alive ping to Railway successful');
    } catch (error) {
      this.logger.error('Keep-alive ping to Railway failed', error);
    }
  }
}
