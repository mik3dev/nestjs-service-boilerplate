import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { RepositoryService } from 'nestjs-mongoose-repository-module';
import { Todo, TodoDocument } from '../schemas/todo.schema';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/uptdate-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @Inject('TodoRepository')
    private readonly todoRepository: RepositoryService<TodoDocument>,
  ) {}

  async find(filter: FilterQuery<Todo>) {
    return await this.todoRepository.find(filter);
  }

  async create(createDto: CreateTodoDto) {
    return await this.todoRepository.create(createDto);
  }

  async findOne(filter: FilterQuery<Todo>) {
    const todo = await this.todoRepository.findOne(filter);
    if (!todo) throw new NotFoundException();
    return todo;
  }

  async findOneAndUpdate(filter: FilterQuery<Todo>, updateDto: UpdateTodoDto) {
    const todo = await this.todoRepository.findOneAndUpdate(filter, updateDto);
    if (!todo) throw new NotFoundException();
    return todo;
  }

  async findOneAndDelete(filter: FilterQuery<Todo>) {
    const todo = await this.todoRepository.findOneAndDelete(filter);
    if (!todo) throw new NotFoundException();
    return todo;
  }
}
