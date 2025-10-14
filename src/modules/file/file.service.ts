import { Injectable , ConflictException} from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { SupabaseService } from 'src/shared/supabase.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {

  constructor(private readonly supabaseService: SupabaseService, 
    private readonly config : ConfigService
  ) {}

  async create(createFileDto: CreateFileDto) {
    // Normalize filepath
    createFileDto.filepath = createFileDto.filepath ?? '';
    if (createFileDto.filepath && !createFileDto.filepath.endsWith("/")) {
      createFileDto.filepath = createFileDto.filepath + "/";
    }
  
    // Extract filename parts
    const originalFilename = createFileDto.filename;
    const lastDotIndex = originalFilename.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex > 0 
      ? originalFilename.substring(0, lastDotIndex) 
      : originalFilename;
    const extension = lastDotIndex > 0 
      ? originalFilename.substring(lastDotIndex) 
      : '';
  
    // Find unique filename
    let filename = originalFilename;
    let count = 0;
    
    while (await this.supabaseService.fileExists(
      createFileDto.project, 
      filename, 
      createFileDto.filepath
    )) {
      count++;
      filename = `${nameWithoutExt} (${count})${extension}`;
    }
  
    const filePath = createFileDto.filepath + filename;
    
    const data = await this.supabaseService.uploadFile(
      createFileDto.project,
      filePath,
      createFileDto.file,
      {
        contentType: createFileDto.mimetype,
        upsert: true,
      }
    );
  
    return data;
  }


  async update(updateFileDto: UpdateFileDto) {
   

    if (!updateFileDto.project || !updateFileDto.filepath || !updateFileDto.file || !updateFileDto.mimetype) {
      throw new Error('Missing required fields: project, filepath, file, or mimetype.');
    }

  let data;
    try {
    
    data = await this.supabaseService.replaceFile(
      updateFileDto.project,
      updateFileDto.filepath,
      updateFileDto.file,
      { contentType: updateFileDto.mimetype }
    );}
    catch(error){
      throw new ConflictException("Error replacing the file")
    }
    // After replacing the file, rename it with updateFileDto.filename if it is different from the current filepath
    try {
    if (updateFileDto.filename && updateFileDto.filename !== updateFileDto.filepath) {
      const pathParts = updateFileDto.filepath.split('/');
      pathParts[pathParts.length - 1] = updateFileDto.filename;
      const newFilePath = pathParts.join('/');
      await this.supabaseService.moveFile(
        updateFileDto.project,
        updateFileDto.filepath,
        newFilePath
      );

    }}
    catch(err){
      throw new ConflictException("This resource already exists")
    }


    return {
      message: `File at "${updateFileDto.filepath}" in bucket "${updateFileDto.project}" has been replaced by ${updateFileDto.filename}`,
      data,
    };
  }

  async remove(bucketName: string, filepath: string) {
    if (!bucketName) {
      throw new Error('Bucket name is required to delete a file.');
    }
    if (!filepath) {
      throw new Error('Filepath is required to delete a file.');
    }
try {
    await this.supabaseService.deleteFiles(bucketName, [filepath]);}
    catch(err){
      throw new ConflictException("Could not delete this file")
    }

    return { message: `File at path "${filepath}" in bucket "${bucketName}" has been deleted.` };
  }
}
