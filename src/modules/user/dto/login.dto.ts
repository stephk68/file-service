import { IsIP, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ description: 'Username for authentication', example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password for authentication', example: 'strongpassword123' })
  @IsString()
  password: string;

  // @ApiPropertyOptional({ description: 'IP address of the user (optional)', example: '192.168.1.1' })
  @IsIP()
  @IsOptional()
  IpAddress: string;
}
