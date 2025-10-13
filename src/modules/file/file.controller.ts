import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ValidationPipe,UseInterceptors, UploadedFile, BadRequestException, UsePipes} from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FolderGuard } from '../auth/chooser.guard';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseGuards(FolderGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file,
    @Body()  createFileDto : CreateFileDto,
    ){
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
  findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
