import { IsIP, IsString } from 'class-validator';

export class LoginDto {
 

  @IsIP()
  IpAddress : string;
  
}

export class SignUpDto {
 
  @IsString()
  username : string

  @IsString()
  password : string

  @IsIP()
  IpAddress : string;
  
}
