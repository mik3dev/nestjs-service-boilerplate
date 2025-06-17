import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/uptdate-todo.dto';
import { UserPayload } from '../interfaces/user-payload.interface';
import { JwtClientAuthGuard } from 'nestjs-authentication-module';
import { NotFoundException } from '@nestjs/common';

// Mock the JwtClientAuthGuard to automatically pass validation
class MockJwtClientAuthGuard {
  canActivate() {
    return true;
  }
}

// For type safety, define the mock service
type MockedTodoService = {
  [K in keyof TodosService]: jest.Mock;
};

describe('TodosController', () => {
  let controller: TodosController;
  let todosService: MockedTodoService;

  const mockUser: UserPayload = {
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockTodo = {
    _id: 'todo123',
    userId: mockUser.id,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTodos = [
    mockTodo,
    {
      ...mockTodo,
      _id: 'todo456',
      title: 'Second Todo',
      completed: true,
    },
  ];

  beforeEach(async () => {
    // Create mock of TodosService with all required methods
    todosService = {
      find: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TodosService,
          useValue: todosService,
        },
      ],
      controllers: [TodosController],
    })
      .overrideGuard(JwtClientAuthGuard)
      .useClass(MockJwtClientAuthGuard)
      .compile();

    controller = module.get<TodosController>(TodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should return all todos for the user', async () => {
      todosService.find.mockResolvedValue(mockTodos);

      const result = await controller.find(mockUser);

      expect(result).toEqual(mockTodos);
      expect(todosService.find).toHaveBeenCalledWith({ userId: mockUser.id });
    });

    it('should return empty array when no todos found', async () => {
      todosService.find.mockResolvedValue([]);

      const result = await controller.find(mockUser);

      expect(result).toEqual([]);
      expect(todosService.find).toHaveBeenCalledWith({ userId: mockUser.id });
    });
  });

  describe('create', () => {
    it('should create and return a new todo', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Todo Description',
      };

      const expectedTodo = {
        ...createTodoDto,
        _id: 'newtodo123',
        userId: mockUser.id,
        completed: false,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      };

      todosService.create.mockResolvedValue(expectedTodo);

      const result = await controller.create(createTodoDto, mockUser);

      expect(result).toEqual(expectedTodo);
      expect(todosService.create).toHaveBeenCalledWith(
        mockUser.id,
        createTodoDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      todosService.findOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne('todo123', mockUser);

      expect(result).toEqual(mockTodo);
      expect(todosService.findOne).toHaveBeenCalledWith({
        _id: 'todo123',
        userId: mockUser.id,
      });
    });

    it('should throw NotFoundException when todo not found', async () => {
      todosService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );

      expect(todosService.findOne).toHaveBeenCalledWith({
        _id: 'nonexistent',
        userId: mockUser.id,
      });
    });
  });

  describe('updateOne', () => {
    it('should update and return the todo', async () => {
      const updateTodoDto: UpdateTodoDto = { completed: true };
      const updatedTodo = {
        ...mockTodo,
        ...updateTodoDto,
        updatedAt: new Date(),
      };

      todosService.findOneAndUpdate.mockResolvedValue(updatedTodo);

      const result = await controller.updateOne(
        'todo123',
        updateTodoDto,
        mockUser,
      );

      expect(result).toEqual(updatedTodo);
      expect(todosService.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'todo123', userId: mockUser.id },
        updateTodoDto,
      );
    });

    it('should throw NotFoundException when todo not found for update', async () => {
      const updateTodoDto: UpdateTodoDto = { completed: true };

      todosService.findOneAndUpdate.mockRejectedValue(new NotFoundException());

      await expect(
        controller.updateOne('nonexistent', updateTodoDto, mockUser),
      ).rejects.toThrow(NotFoundException);

      expect(todosService.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'nonexistent', userId: mockUser.id },
        updateTodoDto,
      );
    });
  });

  describe('delete', () => {
    it('should delete and return the todo', async () => {
      todosService.findOneAndDelete.mockResolvedValue(mockTodo);

      const result = await controller.delete('todo123', mockUser);

      expect(result).toEqual(mockTodo);
      expect(todosService.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'todo123',
        userId: mockUser.id,
      });
    });

    it('should throw NotFoundException when todo not found for deletion', async () => {
      todosService.findOneAndDelete.mockRejectedValue(new NotFoundException());

      await expect(controller.delete('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );

      expect(todosService.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'nonexistent',
        userId: mockUser.id,
      });
    });
  });
});
