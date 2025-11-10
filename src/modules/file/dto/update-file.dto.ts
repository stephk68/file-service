import { PartialType } from '@nestjs/mapped-types';
import { CreateFileDto } from './create-file.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFileDto extends PartialType(CreateFileDto) {

  file: Buffer;

 
  filename: string;

  @ApiProperty({
    description: 'Optional file path inside the bucket',
    example: 'folder1/file.txt',
  })
  filepath: string;

 
  mimetype: string;

  @ApiProperty({
    description: 'Name of the storage bucket/project',
    example: 'my-project-bucket',
  })
  project: string;
}
