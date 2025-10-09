import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

// This DTO is designed for use with form-data (multipart/form-data), not JSON.
// The 'file' property is expected to be populated by a file upload middleware like Multer.

export class CreateFileDto {
  @IsNotEmpty()
  file: Buffer; // Ensure this is the file buffer, not the whole Multer file object

  @IsString()
  filename: string;

  @IsString()
  @IsOptional()
  filepath?: string;

  @IsString()
  mimetype: string;
}
