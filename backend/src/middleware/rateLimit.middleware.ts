import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';
import { config } from '../config/env';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

let rateLimiter: RateLimiterRedis | null = null;
let rateLimiterRedisClient: any = null;

export const closeRateLimiter = async (): Promise<void> => {
  try {
    if (rateLimiterRedisClient) {
      const client = rateLimiterRedisClient as any;
      if (typeof client.quit === 'function' && client.isOpen) {
        await client.quit();
      } else if (typeof client.disconnect === 'function') {
        await client.disconnect();
      }
      rateLimiterRedisClient = null;
    }
    rateLimiter = null;
  } catch (e) {
    void e;
  }
};

export const initRateLimiter = async (): Promise<void> => {
  try {
    if (rateLimiterRedisClient) {
      await closeRateLimiter();
    }
    const redisClient = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return new Error('Redis connection retries exhausted');
          }
          return Math.min(retries * 50, 500);
        }
      }
    });
    redisClient.on('error', (err) => logger.error('Redis error', { error: err.message }));
    await redisClient.connect();

    rateLimiterRedisClient = redisClient;
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      useRedisPackage: true,
      keyPrefix: 'rl:',
      points: config.rateLimit.maxRequests,
      duration: Math.ceil(config.rateLimit.windowMs / 1000),
    });

    logger.info('Rate limiter initialized');
  } catch (error) {
    logger.warn('Rate limiter not available, running without rate limiting', { error: (error as Error).message });
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
    if (rejRes instanceof Error) {
      logger.error('Rate limiter infrastructure error', { error: rejRes.message });
      next();
    } else {
      const error = rejRes as { msBeforeNext?: number };
      const secs = Math.round((error.msBeforeNext ?? 1000) / 1000) || 1;
      res.set('Retry-After', String(secs));
      next(new AppError('SCAMCHECK_RATE_LIMIT', 'Too many requests', 429, { retryAfter: secs }));
    }
  }
};