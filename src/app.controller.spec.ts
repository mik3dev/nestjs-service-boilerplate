import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getInfo: jest.fn().mockReturnValue({
              name: 'test',
              version: '1.0.0',
              timestamp: '123',
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return application info', () => {
      expect(appController.getInfo()).toEqual({
        name: 'test',
        version: '1.0.0',
        timestamp: '123',
      });
    });
  });
});
