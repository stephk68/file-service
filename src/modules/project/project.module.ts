import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { SupabaseService } from 'src/shared/supabase.service';
import { PrismaService } from 'src/shared/prisma.service';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { RedisService } from 'src/shared/redis.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService,SupabaseService, PrismaService, JwtAuthService, RedisService, UserService],
})
export class ProjectModule {}
