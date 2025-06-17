/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { AppService } from '../app.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: any;
  let mongooseHealth: any;
  let diskHealth: any;
  let memoryHealth: any;
  let appService: any;

  beforeEach(async () => {
    // Create mocks with jest.fn()
    healthCheckService = {
      check: jest.fn(),
    };

    mongooseHealth = {
      pingCheck: jest.fn(),
    };

    diskHealth = {
      checkStorage: jest.fn(),
    };

    memoryHealth = {
      checkHeap: jest.fn(),
      checkRSS: jest.fn(),
    };

    appService = {
      getInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: MongooseHealthIndicator, useValue: mongooseHealth },
        { provide: DiskHealthIndicator, useValue: diskHealth },
        { provide: MemoryHealthIndicator, useValue: memoryHealth },
        { provide: AppService, useValue: appService },
      ],
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should perform all health checks', async () => {
      const mockHealthCheckResult = {
        status: 'up',
        info: {
          database: { status: 'up' },
          disk: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          disk: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      };

      // Mock all health check methods
      mongooseHealth.pingCheck.mockResolvedValue({
        database: { status: 'up' },
      });

      diskHealth.checkStorage.mockResolvedValue({
        disk: { status: 'up' },
      });

      memoryHealth.checkHeap.mockResolvedValue({
        memory_heap: { status: 'up' },
      });

      memoryHealth.checkRSS.mockResolvedValue({
        memory_rss: { status: 'up' },
      });

      healthCheckService.check.mockResolvedValue(mockHealthCheckResult);

      const result = await controller.check();

      expect(result).toEqual(mockHealthCheckResult);
      expect(healthCheckService.check).toHaveBeenCalled();

      // Verify that the health check service is called with an array of functions
      const checkArg = healthCheckService.check.mock.calls[0][0];
      expect(Array.isArray(checkArg)).toBe(true);
      expect(checkArg.length).toBe(4);
    });
  });

  describe('liveness', () => {
    it('should return service status information', () => {
      // Use a fixed date for testing
      const mockDateISOString = '2023-01-01T12:00:00.000Z';
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue(mockDateISOString);

      appService.getInfo.mockReturnValue({
        name: 'aw-payments-payouts-service',
        version: '1.0.0',
        timestamp: mockDateISOString,
      });

      const result = controller.liveness();

      expect(result).toEqual({
        status: 'ok',
        service: 'aw-payments-payouts-service',
        version: '1.0.0',
        timestamp: mockDateISOString,
      });

      expect(appService.getInfo).toHaveBeenCalled();

      // Restore original Date.prototype.toISOString
      jest.restoreAllMocks();
    });
  });
});
