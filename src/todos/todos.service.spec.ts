import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryService } from 'nestjs-mongoose-repository-module';
import { NotFoundException } from '@nestjs/common';
import { FilterQuery, Document } from 'mongoose';
import { TodosService } from './todos.service';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/uptdate-todo.dto';
import { Todo } from '../schemas/todo.schema';

// Define a type for MongoDB documents with Todo properties
type TodoDocument = Document;

describe('TodosService', () => {
  let service: TodosService;
  let repositoryMock: Partial<RepositoryService<TodoDocument>>;

  // Define mock user ID for testing
  const mockUserId = 'user123';

  // Define fixed dates for testing to avoid time-specific issues
  const mockCreatedAt = new Date('2023-01-01T00:00:00.000Z');
  const mockUpdatedAt = new Date('2023-01-01T00:00:00.000Z');

  // Define mock todo as a simple object with the necessary properties
  const mockTodo = {
    _id: 'todo123',
    userId: mockUserId,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  };

  const mockTodoArray = [
    mockTodo,
    {
      ...mockTodo,
      _id: 'todo456',
      title: 'Second Todo',
      completed: true,
    },
  ];

  beforeEach(async () => {
    // Create a properly typed mock repository
    const mockExecutableTodoRepository: Partial<
      RepositoryService<TodoDocument>
    > = {
      find: jest.fn().mockImplementation(() => Promise.resolve([])),
      findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
      create: jest.fn().mockImplementation(() => Promise.resolve({})),
      findOneAndUpdate: jest
        .fn()
        .mockImplementation(() => Promise.resolve(null)),
      findOneAndDelete: jest
        .fn()
        .mockImplementation(() => Promise.resolve(null)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'TodoRepository',
          useValue: mockExecutableTodoRepository,
        },
        TodosService,
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repositoryMock = mockExecutableTodoRepository;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find', () => {
    it('should return an array of todos', async () => {
      const filter = { userId: mockUserId };
      (repositoryMock.find as jest.Mock).mockResolvedValue(mockTodoArray);

      const result = await service.find(filter);

      expect(result).toEqual(mockTodoArray);
      expect(repositoryMock.find).toHaveBeenCalledWith(filter);
    });

    it('should return an empty array when no todos found', async () => {
      const filter = { userId: 'nonexistent' };
      (repositoryMock.find as jest.Mock).mockResolvedValue([]);

      const result = await service.find(filter);

      expect(result).toEqual([]);
      expect(repositoryMock.find).toHaveBeenCalledWith(filter);
    });
  });

  describe('create', () => {
    it('should successfully create a todo', async () => {
      const userId = mockUserId;
      const createTodoDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Description',
      };

      const expectedTodo = {
        ...createTodoDto,
        userId,
        _id: 'newtodo123',
        completed: false,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      };

      const mockCreatedTodo = {
        ...expectedTodo,
        _id: 'newtodo123',
        createdAt: mockCreatedAt,
        updatedAt: mockUpdatedAt,
      };

      (repositoryMock.create as jest.Mock).mockResolvedValue(mockCreatedTodo);

      const result = await service.create(userId, createTodoDto);

      expect(result).toEqual(expectedTodo);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        ...createTodoDto,
        userId,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single todo when found', async () => {
      const filter = { _id: 'todo123', userId: mockUserId };
      (repositoryMock.findOne as jest.Mock).mockResolvedValue(mockTodo);

      const result = await service.findOne(filter);

      expect(result).toEqual(mockTodo);
      expect(repositoryMock.findOne).toHaveBeenCalledWith(filter);
    });

    it('should throw NotFoundException when todo not found', async () => {
      const filter = { _id: 'nonexistent', userId: 'user123' };
      (repositoryMock.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(filter)).rejects.toThrow(NotFoundException);
      expect(repositoryMock.findOne).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOneAndUpdate', () => {
    it('should update and return todo when found', async () => {
      const filter = { _id: 'todo123', userId: mockUserId };
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Title',
        completed: true,
      };

      const updatedTodo = {
        ...mockTodo,
        ...updateTodoDto,
      };

      (repositoryMock.findOneAndUpdate as jest.Mock).mockResolvedValue(
        updatedTodo,
      );

      const result = await service.findOneAndUpdate(filter, updateTodoDto);

      expect(result).toEqual(updatedTodo);
      expect(repositoryMock.findOneAndUpdate).toHaveBeenCalledWith(
        filter,
        updateTodoDto,
      );
    });

    it('should throw NotFoundException when todo not found for update', async () => {
      const filter = { _id: 'nonexistent', userId: mockUserId };
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Title',
      };

      (repositoryMock.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOneAndUpdate(filter, updateTodoDto),
      ).rejects.toThrow(NotFoundException);
      expect(repositoryMock.findOneAndUpdate).toHaveBeenCalledWith(
        filter,
        updateTodoDto,
      );
    });
  });

  describe('findOneAndDelete', () => {
    it('should delete and return todo when found', async () => {
      const filter = { _id: 'todo123', userId: mockUserId };
      (repositoryMock.findOneAndDelete as jest.Mock).mockResolvedValue(
        mockTodo,
      );

      const result = await service.findOneAndDelete(filter);

      expect(result).toEqual(mockTodo);
      expect(repositoryMock.findOneAndDelete).toHaveBeenCalledWith(filter);
    });

    it('should throw NotFoundException when todo not found for deletion', async () => {
      const filter: FilterQuery<Todo> = {
        _id: 'nonexistent',
        userId: 'user123',
      };
      (repositoryMock.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(service.findOneAndDelete(filter)).rejects.toThrow(
        NotFoundException,
      );
      expect(repositoryMock.findOneAndDelete).toHaveBeenCalledWith(filter);
    });
  });
});
