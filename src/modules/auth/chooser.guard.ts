import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { SupabaseService } from 'src/shared/supabase.service';
import { JwtPayload } from 'src/shared/jwt/jwtInterface';
import { RedisService } from 'src/shared/redis.service';

@Injectable()
export class FolderGuard implements CanActivate {
  constructor(private jwtService: JwtAuthService, private supabaseService : SupabaseService, private redis : RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verifyToken(token) as JwtPayload;
      request.user = payload;
      const IP = payload.IpAddress;


     
      return await this.redis.listContains("White-List", IP);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
