import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { SupabaseService } from 'src/shared/supabase.service';

interface JwtPayload {
  AccessList: string[];
  // Add other fields as needed
}

@Injectable()
export class FolderGuard implements CanActivate {
  constructor(private jwtService: JwtAuthService, private supabaseService : SupabaseService) {}

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

      const accessList = payload.AccessList
     const project =
        request.params?.project ??
        request.body?.project ??
        request.query?.project;
      request.project = project;

      // if(await this.supabaseService.bucketExists(project)){
      //   throw new NotFoundException("project " + project + " does not exist")
      // }
     
      return Array.isArray(accessList) && accessList.includes(project);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
