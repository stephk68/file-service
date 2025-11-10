import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Req} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { SignUpDto } from './dto/login.dto';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jwtService : JwtAuthService) {}

  

  


  @Post('/signUp')
  @ApiOperation({ summary: 'Sign up or login a user and authenticate', description: 'Enregistre un nouvelle utilisateur dans la White-List' })
  @ApiBody({ type: SignUpDto, description: 'User signup/login data' })
  @ApiResponse({ status: 201, description: 'Successfully authenticated'})
  @ApiResponse({ status: 400, description: 'Invalid input' })
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
