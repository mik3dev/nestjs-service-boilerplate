import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { GetUser, JwtAuthGuard } from 'nestjs-authentication-module';
import { UserPayload } from '../interfaces/user-payload.interface';
import { CreateTodoDto } from 'src/dtos/create-todo.dto';
import { UpdateTodoDto } from 'src/dtos/uptdate-todo.dto';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async find(@GetUser<UserPayload>() user: UserPayload) {
    return await this.todosService.find({ userId: user.id });
  }

  @Post()
  async create(
    @Body() createDto: CreateTodoDto,
    @GetUser<UserPayload>() user: UserPayload,
  ) {
    return await this.todosService.create(user.id, createDto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser<UserPayload>() user: UserPayload,
  ) {
    return await this.todosService.findOne({ userId: user.id, _id: id });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateTodoDto,
    @GetUser<UserPayload>() user: UserPayload,
  ) {
    return await this.todosService.findOneAndUpdate(
      { _id: id, userId: user.id },
      updateDto,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetUser<UserPayload>() user: UserPayload,
  ) {
    return await this.todosService.findOneAndDelete({
      _id: id,
      userId: user.id,
    });
  }
}
