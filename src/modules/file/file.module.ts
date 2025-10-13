import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { SupabaseService } from 'src/shared/supabase.service';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { RedisService } from 'src/shared/redis.service';
import { UserService } from '../user/user.service';


@Module({
  controllers: [FileController],
  providers: [FileService, SupabaseService, JwtAuthService, RedisService, UserService],
})
export class FileModule {}
