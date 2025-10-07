import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './shared/supabase.service';

import { FileModule } from './modules/file/file.module';
import { ProjectModule } from './modules/project/project.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FileModule,
    ProjectModule,
   
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
