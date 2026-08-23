import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';
import { config } from '../config/env';
import { AppError } from './error.middleware';

let rateLimiter: RateLimiterRedis | null = null;

export const initRateLimiter = async (): Promise<void> => {
  try {
    const redisClient = createClient({ url: config.redis.url });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();

    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'rl:',
      points: config.rateLimit.maxRequests,
      duration: Math.ceil(config.rateLimit.windowMs / 1000),
    });

    console.log('Rate limiter initialized');
  } catch (error) {
    console.warn('Rate limiter not available, running without rate limiting:', error);
  }
};

export const rateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!rateLimiter) {
    next();
    return;
  }

  try {
    const key = req.ip || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: unknown) {
    const error = rejRes as { msBeforeNext?: number };
    const secs = Math.round((error.msBeforeNext ?? 1000) / 1000) || 1;
    res.set('Retry-After', String(secs));
    next(new AppError('RATE_LIMIT_EXCEEDED', 'Too many requests', 429, { retryAfter: secs }));
  }
};