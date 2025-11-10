import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BucketExists } from 'src/shared/decorators/BucketExists.decorator';

// This DTO is designed for use with form-data (multipart/form-data), not JSON.
// The 'file' property is expected to be populated by a file upload middleware like Multer.

export class CreateFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to upload',
  })
  // @IsNotEmpty()
  file: Buffer; // Ensure this is the file buffer, not the whole Multer file object

  filename: string;

  @ApiPropertyOptional({
    description: 'Optional file path inside the bucket',
    example: 'folder1/file.txt',
  })
  @IsString()
  @IsOptional()
  filepath?: string;

  mimetype: string;

  @ApiProperty({
    description: 'Name of the storage bucket/project',
    example: 'my-project-bucket',
  })
  @IsString()
  @IsNotEmpty()
  @BucketExists({ message: 'Project bucket does not exist' })
  project: string;
}
