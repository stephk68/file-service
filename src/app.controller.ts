import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService
  ) {}

  // @Get()
  // getWorking() {
  //   return this.appService.getHello;
  // }

  // @Get('health')
  // getWorking2() {
  //   return this.appService.getHello;
  // }



}