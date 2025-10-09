import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from "../../shared/redis.service";
import {hash, compare} from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly redisService: RedisService) {}

 async create(createUserDto: CreateUserDto) {
    
    const userOb = {username :createUserDto.username , password : await this.hashPassword(createUserDto.password)}

  const User = this.redisService.jsonSet(createUserDto.username, ".", userOb)
    return User;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  //###################################################Utile######################################

  private async hashPassword(password: string) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

    private async isPasswordValid(
    password: string,
    hashedPassword: String) {
    const isPasswordValid = await compare(password, hashedPassword);
    return isPasswordValid;
  }
}
