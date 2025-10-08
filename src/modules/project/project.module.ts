import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { SupabaseService } from 'src/shared/supabase.service';
import { PrismaService } from 'src/shared/prisma.service';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService,SupabaseService, PrismaService, JwtAuthService],
})
export class ProjectModule {}
