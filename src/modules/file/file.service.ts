import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { SupabaseService } from 'src/shared/supabase.service';
import { PrismaService } from 'src/shared/prisma.service';
import { readFileSync } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {

  constructor(private readonly supabaseService: SupabaseService, 
    private readonly prisma : PrismaService,
    private readonly config : ConfigService
  ) {}

  async create(createFileDto: CreateFileDto) {
    // const user = await this.prisma.project.findUnique({ where: { id } });
    if(createFileDto.filepath && !createFileDto.filepath.endsWith("/")){
      createFileDto.filepath = createFileDto.filepath + "/"
    }
    const filename = createFileDto.filename;
    const filePath = createFileDto.filepath + filename;
  const data =  await this.supabaseService.uploadFile(
      'File1',
      filePath,
       createFileDto.file,
      {
        contentType: createFileDto.mimetype,
        upsert: true,
      }
    );

  // const Record = await this.prisma.file.create({
  //   data: {
  //     url : (await data).URL,
  //     mimeType : (await data).options?.contentType,
  //     ProjectId : id
  //   },
  // });

  return data;
  }

  findAll() {
    return `This action returns all file`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
