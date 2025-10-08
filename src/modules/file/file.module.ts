import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { SupabaseService } from 'src/shared/supabase.service';
import { PrismaService } from 'src/shared/prisma.service';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';

@Module({
  controllers: [FileController],
  providers: [FileService, SupabaseService, PrismaService, JwtAuthService],
})
export class FileModule {}
