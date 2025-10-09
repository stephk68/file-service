import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly configService : ConfigService){}
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    const redisPassword = this.configService.get<string>('REDIS_PW');

    this.client = createClient({
        username: 'default',
        password: redisPassword,
        socket: {
            host: redisHost,
            port: redisPort
        }
    });

    this.client.on('connect', () => this.logger.log('Redis connected ✅'));
    this.client.on('error', (err) => this.logger.error('Redis error ❌', err));

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /** 📥 Set a key with optional expiration (in seconds) */
  async set(key: string, value: any, ttlSeconds?: number) {
    const val = typeof value === 'object' ? JSON.stringify(value) : value;
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, val);
    } else {
      await this.client.set(key, val);
    }
  }

  /** 📤 Get a key */
  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /** 
   * Set a value at a specific path in a JSON key using RedisJSON (if available).
   * Requires RedisJSON module.
   * @param key Redis key
   * @param path JSON path (default: '.')
   * @param value Value to set
   */
  async jsonSet(key: string, path: string, value: any) {
    // RedisJSON uses the "JSON.SET" command
    // path should be '.' for root, or e.g. '.foo.bar'
    const val = typeof value === 'object' ? JSON.stringify(value) : value;
    // @ts-ignore
    return await this.client.sendCommand(['JSON.SET', key, path, val]);
  }

  /** ❌ Delete a specific key */
  async delete(key: string) {
    return await this.client.del(key);
  }

  /** 🧹 Delete all keys with a given namespace/prefix */
  async deleteNamespace(prefix: string) {
    const pattern = `${prefix}:*`;
    let deletedCount = 0;

    for await (const key of this.client.scanIterator({ MATCH: pattern })) {
      await this.client.del(key);
      deletedCount++;
    }

    this.logger.log(`Deleted ${deletedCount} keys from namespace "${prefix}"`);
    return deletedCount;
  }

  /** 🧾 Check if a key exists */
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }

  /** 🚮 Flush entire Redis database (use with caution) */
  async flushAll() {
    await this.client.flushDb();
    this.logger.warn('Redis database flushed');
  }
}
