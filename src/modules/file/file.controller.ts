import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FolderGuard } from '../auth/chooser.guard';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileService } from './file.service';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseService } from 'src/shared/supabase.service';

class FileUploadResponseDto {
  @ApiProperty({
    description: 'URL to access the uploaded file',
    example: 'https://cdn.example.com/project-bucket/path/to/file.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'Original filename of the uploaded file',
    example: 'file.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'File path within the storage bucket',
    example: 'path/to/file.pdf',
  })
  filepath: string;

  @ApiProperty({
    description: 'MIME type of the uploaded file',
    example: 'application/pdf',
  })
  mimetype: string;

  @ApiProperty({
    description: 'Size of the uploaded file in bytes',
    example: 102400,
  })
  size: number;
}

class FileUrlResponseDto {
  @ApiProperty({
    description: 'A URL to access the file',
    example: 'https://cdn.example.com/project-bucket/path/to/file.pdf',
  })
  url: string;

  @ApiPropertyOptional({
    description: 'Expiration date/time for the URL (if applicable)',
    example: '2024-06-15T10:00:00Z',
  })
  expiresAt?: string;
}

class FileUpdateResponseDto {
  @ApiProperty({
    description: 'Indicates if the file update was successful',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'List of fields that were updated',
    example: ['filename', 'filepath'],
  })
  updatedFields?: string[];
}

class FileDeleteResponseDto {
  @ApiProperty({
    description: 'Indicates if the file deletion was successful',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Optional message describing the result of the deletion',
    example: 'File deleted successfully.',
  })
  message?: string;
}

@ApiTags('file')
@ApiBearerAuth('JWT-auth')
@Controller('file')
@UseGuards(FolderGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload data',
    type: CreateFileDto,
    schema: {
      type: 'object',
      properties: {
        ...Object.assign(
          {},
          ...Object.entries(CreateFileDto.prototype).map(([key]) => ({
            [key]: { type: 'string' },
          })),
        ),
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded successfully',
    type: FileUploadResponseDto,
    schema: {
      example: {
        url: 'https://cdn.example.com/project-bucket/path/to/file.pdf',
        filename: 'file.pdf',
        filepath: 'path/to/file.pdf',
        mimetype: 'application/pdf',
        size: 102400,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No file uploaded or invalid input',
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file, @Body() createFileDto: CreateFileDto) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Merge file info into DTO and call service
    const dto = {
      ...createFileDto,
      file: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      // Optionally add filepath if needed, e.g. from req.body or elsewhere
    };
    return this.fileService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get a file URL' })
  @ApiQuery({
    name: 'filepath',
    required: true,
    type: String,
    description: 'Path of the file in the bucket',
  })
  @ApiQuery({
    name: 'project',
    required: true,
    type: String,
    description: 'Name of the storage bucket/project',
  })
  @ApiOkResponse({
    description: 'File URL returned',
    type: FileUrlResponseDto,
    schema: {
      example: {
        url: 'https://cdn.example.com/project-bucket/folder/file.txt',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  Getfile(
    @Query('filepath') filepath: string,
    @Query('project') project: string,
  ) {
    return this.fileService.GetUrl({ filepath, project });
  }

  @Patch()
  @ApiOperation({ summary: 'Update an existing file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File update data',
    type: UpdateFileDto,
    schema: {
      type: 'object',
      properties: {
        ...Object.assign(
          {},
          ...Object.entries(UpdateFileDto.prototype).map(([key]) => ({
            [key]: { type: 'string' },
          })),
        ),
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional file to update',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'File updated successfully',
    type: FileUpdateResponseDto,
    schema: {
      example: {
        success: true,
        updatedFields: ['filename', 'file', 'mimetype'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UseInterceptors(FileInterceptor('file'))
  async update(@UploadedFile() file, @Body() updateFileDto: UpdateFileDto) {
    if (file) {
      updateFileDto.filename = file.originalname;
      updateFileDto.file = file.buffer;
      updateFileDto.mimetype = file.mimetype;
    }
    return await this.fileService.update(updateFileDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a file' })
  @ApiBody({
    description: 'Specify the file to delete',
    type: UpdateFileDto,
    schema: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'Path of the file in the bucket',
        },
        project: {
          type: 'string',
          description: 'Name of the storage bucket/project',
        },
      },
      required: ['filepath', 'project'],
    },
  })
  @ApiOkResponse({
    description: 'File deleted successfully',
    type: FileDeleteResponseDto,
    schema: {
      example: {
        success: true,
        message: 'File deleted from project-bucket/folder/file.txt',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'filepath or bucketName is required to delete a file.',
  })
  remove(@Body(new ValidationPipe()) updateFileDto: UpdateFileDto) {
    if (!updateFileDto.filepath) {
      throw new BadRequestException('filepath is required to delete a file.');
    }
    if (!updateFileDto.project) {
      throw new BadRequestException('bucketName is required to delete a file.');
    }
    return this.fileService.remove(
      updateFileDto.project,
      updateFileDto.filepath,
    );
  }
}

@ApiTags('project')
@ApiBearerAuth('JWT-auth')
@Controller('project')
@UseGuards(FolderGuard)
export class ProjectController {
  constructor(private readonly supabaseService: SupabaseService) {}
  @Get()
  @ApiOperation({ summary: 'List all buckets (projects)' })
  async AllProject() {
    const buckets = await this.supabaseService.listBuckets();
    return buckets;
  }

  @Get(':bucketName')
  @ApiOperation({
    summary: 'List all files and folders in a specific bucket (project)',
  })
  @ApiParam({
    name: 'bucketName',
    description: 'The name of the bucket/project',
  })
  async listAllFilesInBucket(@Param('bucketName') bucketName: string) {
    if (!bucketName) {
      throw new BadRequestException('bucketName param is required');
    }
    const elements = await this.supabaseService.listBucketElements(bucketName);
    return elements;
  }

  @ApiOperation({
    summary:
      'List all files and folders within a folder in a specific bucket (project)',
  })
  @ApiParam({
    name: 'bucketName',
    description: 'The name of the bucket/project',
  })
  @ApiParam({
    name: 'folder',
    description: 'Path to the folder inside the bucket',
    required: true,
    type: 'string',
  })
  @Get(':bucketName/folder')
  async listElementsInFolder(
    @Param('bucketName') bucketName: string,
    @Query('path') folderPath: string,
  ) {
    if (!folderPath)
      throw new BadRequestException('folder path query param is required');
    return this.supabaseService.listElementsInFolder(bucketName, folderPath);
  }
}
