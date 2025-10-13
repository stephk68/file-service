import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { LoginDto, SignUpDto } from './dto/login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jwtService : JwtAuthService) {}

  // @Post()
  // create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Post('/signUp')
  Login(@Body(new ValidationPipe()) signUp: SignUpDto) {
    return this.jwtService.Authenticate(signUp);
  }
  

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':name')
  update(@Param('name') name: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(name, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
