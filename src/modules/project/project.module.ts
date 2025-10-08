import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { SupabaseService } from 'src/shared/supabase.service';
import { PrismaService } from 'src/shared/prisma.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService,SupabaseService, PrismaService],
})
export class ProjectModule {}
