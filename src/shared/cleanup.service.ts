import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisService } from './redis.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly redis: RedisService) {}

  // Runs every day at midnight (00:00)
  @Cron('0 0 * * *')
  async trimList() {
    try {
      const key = 'White-List'; // your list key name
      await this.redis.client.lTrim(key, 0, 0);
      this.logger.log(`✅ Trimmed list "${key}" to keep only first element`);
    } catch (error) {
      this.logger.error('❌ Error while trimming Redis list', error);
    }
  }
}
