// src/modules/auth/jwt.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Token,JwtPayload } from './jwtInterface';
import { ConfigService } from '@nestjs/config';
import {compare} from "bcrypt"
import { CreateUserDto} from "src/modules/user/dto/create-user.dto"
import { RedisService} from "../redis.service";
import { LoginDto } from 'src/modules/user/dto/login.dto';

@Injectable()
export class JwtAuthService {
    private readonly jwtSecret :string
    constructor(private readonly config : ConfigService,
       private readonly redisService : RedisService ){this.jwtSecret = this.config.get<string>("JWT_SECRET")?? "";}
  

  async Authenticate(project : LoginDto) {
    const name = project.username;
    const password = project.password;

  
const existingUser = await this.redisService.jsonGet(name);

    

    if (!existingUser) {
      throw new NotFoundException("This user does not exist");
    }


    const isPasswordValid = await compare(password, existingUser.password);
    
    if (!isPasswordValid) {
      throw new BadRequestException("Incorrect Password");
    }

    console.log(`This user name is ${existingUser.username}`);

    const payload = {
      name: existingUser.username,
      AccessList : existingUser.AccessList,
    };

    const tokenResult = await this.generateToken(payload);

    
    return {
      access_token: tokenResult.access_token
      
    };
  }


  async generateToken(payload: JwtPayload): Promise<Token> {
    try {
      const jwtPayload = { 

        name: payload.name,
        AccessList : payload.AccessList,
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