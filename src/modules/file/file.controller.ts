import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ValidationPipe } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FolderGuard } from '../auth/chooser.guard';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseGuards(FolderGuard)
  create(@Body(new ValidationPipe()) createFileDto: CreateFileDto, @Req() req) {
    const userId = req.user.sub;
    const userName = req.user.name;
    return this.fileService.create(createFileDto, userId, userName);
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
