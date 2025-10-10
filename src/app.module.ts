import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './shared/supabase.service';

import { FileModule } from './modules/file/file.module';
import { ProjectModule } from './modules/project/project.module';
import { UserModule } from './modules/user/user.module';

import { FileController } from './modules/file/file.controller';
import { JwtAuthService } from './shared/jwt/jwt.service';
import { RedisService } from './shared/redis.service';
import { FileService } from './modules/file/file.service';
import { PrismaService } from './shared/prisma.service';

@Module({

  
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FileModule,
    ProjectModule,
    UserModule,
   
  ],
  controllers: [AppController,FileController],
  providers: [AppService, SupabaseService,JwtAuthService, RedisService, FileService, PrismaService],
})

export class AppModule {
}
