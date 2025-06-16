import { Module } from '@nestjs/common';
import { MongooseRepositoryModule } from 'nestjs-mongoose-repository-module';

import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { Todo, TodoSchema } from '../schemas/todo.schema';

@Module({
  imports: [
    MongooseRepositoryModule.forFeature({
      name: Todo.name,
      schema: TodoSchema,
    }),
    // MongooseRepositoryModule.forFeatureAsync({
    //   name: Todo.name,
    //   imports: [],
    //   inject: [],
    //   useFactory: () => {
    //     const schema = TodoSchema;
    //     // some hooks
    //     return schema;
    //   },
    // }),
  ],
  providers: [TodosService],
  controllers: [TodosController],
  exports: [],
})
export class TodosModule {}
