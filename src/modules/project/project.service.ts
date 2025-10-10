import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SupabaseService } from 'src/shared/supabase.service';
import { PrismaService } from 'src/shared/prisma.service';
import {hash, compare} from 'bcrypt';
@Injectable()
export class ProjectService {
  constructor(private readonly supabase : SupabaseService,
    private readonly prisma : PrismaService
  ){}

 async create(createProjectDto: CreateProjectDto) {
    if(await this.supabase.bucketExists(createProjectDto.name)){
      throw new ConflictException("This Project already exist")
    }
    console.log("Project does not exist lets create one")
      const hashed = await this.hashPassword(createProjectDto.password);
     const project = this.supabase.createBucket(createProjectDto.name)
    this.supabase.saveBucketKey(createProjectDto.name, hashed );
      return project;
  
   
  }

  async findAll() {
    return await this.prisma.project.findMany({});
  }

  async findOne(id: number) {
    return await this.prisma.project.findUnique({ where: { id } });
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, name?: string) {
    let project;
    if (name) {
      project = await this.prisma.project.findFirst({ where: { name } });
    } else {
      project = await this.prisma.project.findUnique({ where: { id } });
    }

    if(!project){
      throw new NotFoundException("Could not found this project")
    }


    if(updateProjectDto.password){
      const hashed = await this.hashPassword(updateProjectDto.password)
      project = await this.prisma.project.update({
        where: { id: project.id },
        data: { password: hashed}
      });
    }
    return project;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  //############################################### USEFUL METHOD #############################################################

  private async hashPassword(password: string) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

    private async isPasswordValid(
    password: string,
    hashedPassword: String) {
    const isPasswordValid = await compare(password, hashedPassword);
    return isPasswordValid;
  }
}
