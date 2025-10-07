import { IsString, IsOptional, IsNotEmpty, MaxLength, IsArray, IsMimeType } from 'class-validator';

export class CreateFileDto {


  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  filePath: string;

  
  

  @IsString()
  @IsOptional()
  @IsMimeType()
  mimetype: string;
}
