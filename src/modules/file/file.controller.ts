import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ValidationPipe,UseInterceptors, UploadedFile, BadRequestException, UsePipes} from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FolderGuard } from '../auth/chooser.guard';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('file')
@UseGuards(FolderGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
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
  Getfile(@Body() { filepath, project }: { filepath: string, project: string }){
    return this.fileService.GetUrl({ filepath, project });
  }


  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  async update( 
    @UploadedFile() file,
    @Body() updateFileDto: UpdateFileDto,
  ) {
   
    if (file) {
      updateFileDto.filename = file.originalname
      updateFileDto.file = file.buffer;
      updateFileDto.mimetype = file.mimetype;
      
    }
    

    return await this.fileService.update(updateFileDto);
  }

  @Delete()
  remove(@Body(new ValidationPipe()) updateFileDto: UpdateFileDto) {
    if (!updateFileDto.filepath) {
      throw new BadRequestException('filepath is required to delete a file.');
    }

    if (!updateFileDto.project) {
      throw new BadRequestException('bucketName is required to delete a file.');
    }

    return this.fileService.remove(updateFileDto.project, updateFileDto.filepath);
  }


}
