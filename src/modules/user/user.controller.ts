import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { LoginDto, SignUpDto } from './dto/login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jwtService : JwtAuthService) {}

  

  @Post('/signUp')
  Login(@Body(new ValidationPipe()) signUp: SignUpDto) {
    return this.jwtService.Authenticate(signUp);
  }
  


}
