import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Req} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { SignUpDto } from './dto/login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jwtService : JwtAuthService) {}

  

  @Post('/signUp')
  Login(@Body(new ValidationPipe()) signUp: SignUpDto, @Req() req) {

    const rawIp =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.connection?.remoteAddress;
  const IP = Array.isArray(rawIp)
    ? rawIp[0]
    : rawIp?.split(',')[0].trim().replace('::ffff:', '');

    const dto = {
      ...signUp,
      IpAddress: IP,
    };

    return this.jwtService.Authenticate(dto);
  }
  


}
