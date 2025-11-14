import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './shared/supabase.service';

import { FileModule } from './modules/file/file.module';

import { UserModule } from './modules/user/user.module';

import {
  FileController,
  ProjectController,
} from './modules/file/file.controller';
import { FileService } from './modules/file/file.service';
import { UserService } from './modules/user/user.service';
import { JwtAuthService } from './shared/jwt/jwt.service';
import { RedisService } from './shared/redis.service';

import { ScheduleModule } from '@nestjs/schedule';
import { BucketExistsConstraint } from './shared/decorators/BucketExists.decorator';

import { BootstrapService } from './shared/bootstrap.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    FileModule,
    UserModule,
  ],
  controllers: [AppController, FileController, ProjectController],
  providers: [
    AppService,
    SupabaseService,
    JwtAuthService,
    RedisService,
    FileService,
    UserService,
    BucketExistsConstraint,
    BootstrapService, // Service d'initialisation au démarrage
  ],
  exports: [BucketExistsConstraint],
})
export class AppModule {}
