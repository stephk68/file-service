// src/modules/auth/jwt.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Token,JwtPayload } from './jwtInterface';
import { ConfigService } from '@nestjs/config';
import {compare,hash} from "bcrypt"
import { CreateUserDto} from "src/modules/user/dto/create-user.dto"
import { RedisService} from "../redis.service";
import { SignUpDto } from 'src/modules/user/dto/login.dto';
import { UserService } from 'src/modules/user/user.service';
import { CreateFileDto } from 'src/modules/file/dto/create-file.dto';

@Injectable()
export class JwtAuthService {
    private readonly jwtSecret :string
    constructor(private readonly config : ConfigService,
       private readonly redisService : RedisService, private readonly UserService : UserService ){this.jwtSecret = this.config.get<string>("JWT_SECRET")?? "";}
  

  async Authenticate(project : SignUpDto) {
    const username = project.username
    const password = project.password;
    const IP = project.IpAddress;
    

  
const existingUser = await this.redisService.jsonGet("Creditentials");

    

    if (!existingUser) {
      throw new NotFoundException("Debug purpose");
    }



    const isPasswordValid = await compare(password, existingUser.password);
    
    if (!isPasswordValid  || username.localeCompare(existingUser.username) !=0) {
      throw new BadRequestException("Incorrect creditentials");
    }

    console.log(`Welcome to  ${existingUser.username}`);
    

    const payload = {
      IpAddress : IP,
    };

    const tokenResult = await this.generateToken(payload);

    
    return {
      access_token: tokenResult.access_token,
      message : await this.UserService.create({...CreateFileDto, IpAddress : IP})
      
    };
  }


  async generateToken(payload: JwtPayload): Promise<Token> {
    try {
      const jwtPayload = { 
        IpAddress : payload.IpAddress,
      };
      
      const token = jwt.sign(jwtPayload, this.jwtSecret);
      
      return { access_token: token 
      };
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}