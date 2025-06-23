import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { GetUser, JwtClientAuthGuard } from 'nestjs-authentication-module';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getInfo();
  }

  @UseGuards(JwtClientAuthGuard)
  @Get('auth/me')
  me(@GetUser<Record<string, unknown>>() user: Record<string, unknown>) {
    return user;
  }
}
