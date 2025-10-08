import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthService } from './jwt.service';

@Module({
  imports: [ConfigModule],
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtModule {}
