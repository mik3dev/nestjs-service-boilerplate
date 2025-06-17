import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { GetUser, JwtClientAuthGuard } from 'nestjs-authentication-module';
import { UserPayload } from './interfaces/user-payload.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getInfo();
  }

  @UseGuards(JwtClientAuthGuard)
  @Get('auth/me')
  me(@GetUser<UserPayload>() user: UserPayload) {
    return user;
  }
}
