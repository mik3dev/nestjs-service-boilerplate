import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class Todo {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Boolean, default: false })
  completed: boolean;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
