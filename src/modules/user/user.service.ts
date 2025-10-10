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

  if(await this.redisService.exists(createUserDto.username)){
    throw new ConflictException("This User already exists")
  }

    const ValidList = await this.AccesslistChecker(createUserDto.AccessList);
    const userOb = {username :createUserDto.username , password : await this.hashPassword(createUserDto.password), AccessList : ValidList}

  const User = await this.redisService.jsonSet(createUserDto.username, ".", userOb)
    return User;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(name: string, updateUserDto: UpdateUserDto){

    if (await !this.redisService.exists(name)){
      throw new NotFoundException("This User does not exist");
    }

    const user = await this.redisService.get(name);

    const currentAccessList = (await user)?.AccessList || [];
    const password = (await user)?.password;
    const toAdd = (updateUserDto.AccessList || []).filter(bucket => !currentAccessList.includes(bucket));
    const Accesslist = await this.AccesslistChecker(toAdd);
    const NewAccessList = currentAccessList.concat(Accesslist);

    const userOb = {username : name , password : password, AccessList : NewAccessList}
    const User = this.redisService.jsonSet(name, ".", userOb)
    return User;
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

  private async AccesslistChecker(accessList: string[]) {
    let ValidList: string[] = [];
    let seen = new Set<string>();
    for (const bucketName of accessList) {
      if (seen.has(bucketName)) {
        // Skip duplicate bucket names
        continue;
      }
      seen.add(bucketName);

      const exists = await this.supabaseService.bucketExists(bucketName);
      if (!exists) {
        console.log("Project named " + bucketName + " does not exist");
        continue;
      }

      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      // Promisified question
      const question = (query: string) => new Promise<string>(resolve => rl.question(query, resolve));

      console.log(`Project named "${bucketName}" exists. Please enter your credential to proceed.`);
      const password = await question('Enter the password: ');

      rl.close();

      const project = await this.supabaseService.getBucketKeyByName(bucketName);

      if (await this.isPasswordValid(password, await project.key)) {
        console.log("Right answer!!")
        ValidList.push(bucketName);
        continue;
      } else {
        console.log("Invalid creditentials for ", bucketName, " You can always edit the the AccessList later");
      }
    }
    return ValidList;
  }
}
