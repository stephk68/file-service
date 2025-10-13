import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from "../../shared/redis.service";
import {hash, compare} from 'bcrypt';
import { SupabaseService } from 'src/shared/supabase.service';

@Injectable()
export class UserService {
  constructor(private readonly redisService: RedisService, private readonly supabaseService: SupabaseService) {}

 async create(createUserDto: CreateUserDto) {
    const ipAddress = createUserDto.IpAddress;
    if (!ipAddress) {
      throw new ConflictException('IP address is required');
    }
   
    await this.redisService.lpush('White-List', ipAddress);
    return { message: `IP address : ${ipAddress} added to white list` };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(name: string, updateUserDto: UpdateUserDto){

   
}

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  //################################################### Utile #########################################

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
