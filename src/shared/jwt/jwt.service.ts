// src/modules/auth/jwt.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Token,JwtPayload } from './jwtInterface';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from 'src/modules/project/dto/create-project.dto';
import {compare} from "bcrypt"

@Injectable()
export class JwtAuthService {
    private readonly jwtSecret :string
    constructor(private readonly config : ConfigService,
        private prisma: PrismaService){this.jwtSecret = this.config.get<string>("JWT_SECRET")?? "";}
  
  private readonly refreshSecret = 'dev-super-secure-refresh-secret-key-2024-for-testing-only';

  async Authenticate(project : CreateProjectDto) {
    const name = project.name;
    const password = project.password;

    const existingUser = await this.prisma.project.findFirst({
      where: { name },
    });

    if (!existingUser) {
      throw new NotFoundException("This user does not exist");
    }

    const isPasswordValid = await compare(password, existingUser.password);
    
    if (!isPasswordValid) {
      throw new BadRequestException("Incorrect Password");
    }

    console.log(`This user name is ${existingUser.name}`);

    const payload = {
      name: existingUser.name,
      sub: existingUser.id
    };

    const tokenResult = await this.generateToken(payload);

    
    return {
      access_token: tokenResult.access_token,
      refresh_token : tokenResult.refresh_token,
      
    };
  }


  async generateToken(payload: JwtPayload): Promise<Token> {
    try {
      const jwtPayload = { 

        name: payload.name, 
        sub: payload.sub
      };
      
      const token = jwt.sign(jwtPayload, this.jwtSecret, { 
        expiresIn: '15m' 
      });
      const refreshToken = jwt.sign(jwtPayload, this.refreshSecret, { 
        expiresIn: '1d' 
      });
      
      return { access_token: token ,
        refresh_token : refreshToken
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