import { IsIP, IsOptional, IsString } from 'class-validator';




export class SignUpDto {
 
  @IsString()
  username : string

  @IsString()
  password : string

  @IsIP()
  @IsOptional()
  IpAddress : string;
  
}
