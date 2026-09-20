import { Request, Response, NextFunction } from 'express';
import { rateLimit, initRateLimiter } from '../middleware/rateLimit.middleware';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

// Mock dependencies
jest.mock('rate-limiter-flexible');
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
  })
}));
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }
}));

describe('Rate Limit Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockConsume: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    mockReq = {
      ip: '127.0.0.1',
    };
    mockRes = {
      set: jest.fn(),
    };
    mockNext = jest.fn();

    mockConsume = jest.fn();
    (RateLimiterRedis as jest.Mock).mockImplementation(() => ({
      consume: mockConsume,
    }));

    // Re-initialize rate limiter for tests to apply the mock
    await initRateLimiter();
  });

  it('should call next() on successful rate-limit consumption', async () => {
    mockConsume.mockResolvedValue({
      remainingPoints: 99,
      msBeforeNext: 1000,
      consumedPoints: 1,
      isFirstInDuration: true
    });

    await rateLimit(mockReq as Request, mockRes as Response, mockNext);

    expect(mockConsume).toHaveBeenCalledWith('127.0.0.1');
    expect(mockNext).toHaveBeenCalledWith(); // success
  });

  it('should return 429 AppError on actual rate-limit exhaustion', async () => {
    mockConsume.mockRejectedValue({
      remainingPoints: 0,
      msBeforeNext: 5000,
      consumedPoints: 100,
      isFirstInDuration: false
    });

    await rateLimit(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.set).toHaveBeenCalledWith('Retry-After', '5');
    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const errArg = (mockNext as jest.Mock).mock.calls[0][0];
    expect(errArg.statusCode).toBe(429);
    expect(errArg.message).toBe('Too many requests');
  });

  it('should fail open and call next() on Redis/integration failure', async () => {
    const infrastructureError = new Error('Redis connection is not ready');
    mockConsume.mockRejectedValue(infrastructureError);

    await rateLimit(mockReq as Request, mockRes as Response, mockNext);

    expect(logger.error).toHaveBeenCalledWith('Rate limiter infrastructure error', { error: 'Redis connection is not ready' });
    expect(mockNext).toHaveBeenCalledWith(); // fail open
  });
});
