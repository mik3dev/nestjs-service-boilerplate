import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable, of, throwError, lastValueFrom } from 'rxjs';

type LoggerMock = { debug: jest.Mock; error: jest.Mock };
import { LoggerInterceptor } from './logger.interceptor';

describe('LoggerInterceptor', () => {
  let interceptor: LoggerInterceptor;
  let logger: LoggerMock;

  // Reusable mocks
  const createMockContext = () => {
    const mockRequest = {
      ip: '127.0.0.1',
      method: 'get',
      path: '/test',
      query: {},
      body: {},
      get: jest.fn().mockReturnValue(''),
    } as unknown;

    const mockResponse = {
      statusCode: 200,
      get: jest.fn().mockReturnValue('123'),
    } as unknown;

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      getClass: () => ({ name: 'TestController' }),
      getHandler: () => ({ name: 'testHandler' }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    interceptor = new LoggerInterceptor();
    // Stub the internal logger to avoid noisy console output and to allow expectations
    logger = {
      debug: jest.fn(),
      error: jest.fn(),
    };
    (interceptor as unknown as { logger: LoggerMock }).logger = logger;
  });

  it('should pass data through and log on success', async () => {
    const ctx = createMockContext();
    const resultData: { ok: boolean } = { ok: true };
    const callHandler: CallHandler = {
      handle: () => of(resultData),
    } as CallHandler;

    const result = await lastValueFrom(
      interceptor.intercept(ctx, callHandler) as Observable<{ ok: boolean }>,
    );
    expect(result).toEqual(resultData);
    // Ensure at least one debug log happened
    expect(logger.debug).toHaveBeenCalled();
  });

  it('should log error on failure', async () => {
    const ctx = createMockContext();
    const callHandler: CallHandler = {
      handle: () => throwError(() => new Error('fail')),
    } as CallHandler;

    await expect(
      lastValueFrom(interceptor.intercept(ctx, callHandler)),
    ).rejects.toThrow('fail');
    expect(logger.error).toHaveBeenCalled();
  });
});
