import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisService } from "../../shared/redis.service";
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






}
