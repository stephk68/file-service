import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
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




  /**
   * Get a value at a specific path in a JSON key using RedisJSON (if available).
   * Requires RedisJSON module.
   * @param key Redis key
   * @param path JSON path (default: '.')
   * @returns The value at the specified path, or null if not found.
   */
  async jsonGet<T = any>(key: string, path: string = '.'): Promise<T | null> {
    // @ts-ignore
    const result = await this.client.sendCommand(['JSON.GET', key, path]);
  
    if (typeof result !== 'string') return null; // handle null or other types
  
    try {
      return JSON.parse(result) as T;
    } catch {
      return result as unknown as T; // fallback if it's not valid JSON
    }
  }

  /**
   * Push one or more values to the left of a Redis list.
   * @param key List key
   * @param values Value or values to insert
   * @returns Length of the list after push
   */
  async lpush(key: string, ...values: any[]): Promise<number> {
    // Convert non-string values to JSON strings
    const parsedValues = values.map(val =>
      typeof val === 'object' ? JSON.stringify(val) : String(val)
    );
    return await this.client.lPush(key, parsedValues);
  }
  
  /**
   * Check if a value exists in a Redis list.
   * @param key The Redis list key
   * @param value The value to check for
   * @returns True if the value exists in the list, otherwise false
   */
  async listContains(key: string, value: any): Promise<boolean> {
    // Get all list members (be cautious with very large lists)
    const values = await this.client.lRange(key, 0, -1);
    // If value is an object, stringify for comparison
    const compareVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return values.some((item: string) => item === compareVal);
  }
  
  /**
   * Get all elements from a Redis list.
   * @param key The Redis list key
   * @returns Array of all elements in the list
   */
  async listElements(key: string): Promise<string[]> {
    return await this.client.lRange(key, 0, -1);
  }


 

 


}
