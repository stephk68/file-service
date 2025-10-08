import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config : ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // false = token will expire
      secretOrKey: config.get<string>("JWT_SECRET")?? "", // same key used when signing tokens
    });
  }

  async validate(payload: any) {
    // payload = decoded JWT { sub: userId, username: string, ... }
    return { Id: payload.sub, name: payload.name};
  }
}
