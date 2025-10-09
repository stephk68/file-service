import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthService } from 'src/shared/jwt/jwt.service';
import { JwtAuthGuard } from '../auth/auth.guard';


@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService, private readonly jwtService : JwtAuthService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createProjectDto: CreateProjectDto) {
    return await this.projectService.create(createProjectDto);
  }

  @Post("/login")
  Login(@Body(new ValidationPipe()) createProjectDto: CreateProjectDto){
    return this.jwtService.Authenticate(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body(new ValidationPipe()) updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
