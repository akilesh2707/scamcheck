"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.initRateLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const redis_1 = require("redis");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
let rateLimiter = null;
const initRateLimiter = async () => {
    try {
        const redisClient = (0, redis_1.createClient)({ url: env_1.config.redis.url });
        redisClient.on('error', (err) => console.error('Redis error:', err));
        await redisClient.connect();
        rateLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'rl:',
            points: env_1.config.rateLimit.maxRequests,
            duration: Math.ceil(env_1.config.rateLimit.windowMs / 1000),
        });
        console.log('Rate limiter initialized');
    }
    catch (error) {
        console.warn('Rate limiter not available, running without rate limiting:', error);
    }
};
exports.initRateLimiter = initRateLimiter;
const rateLimit = async (req, res, next) => {
    if (!rateLimiter) {
        next();
        return;
    }
    try {
        const key = req.ip || 'unknown';
        await rateLimiter.consume(key);
        next();
    }
    catch (rejRes) {
        const error = rejRes;
        const secs = Math.round((error.msBeforeNext ?? 1000) / 1000) || 1;
        res.set('Retry-After', String(secs));
        next(new errors_1.AppError('RATE_LIMIT_EXCEEDED', 'Too many requests', 429, { retryAfter: secs }));
    }
};
exports.rateLimit = rateLimit;
//# sourceMappingURL=rateLimit.middleware.js.map