import { IsIP, IsString } from 'class-validator';

export class CreateUserDto {

   @IsIP()
   IpAddress: string;

   

}