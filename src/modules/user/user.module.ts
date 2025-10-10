import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RedisService } from 'src/shared/redis.service';
import { SupabaseService } from 'src/shared/supabase.service';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';

@Module({
  controllers: [UserController],
  providers: [UserService, RedisService, SupabaseService, JwtAuthService],
})
export class UserModule {}
