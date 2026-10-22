import { config } from '../config/env';

config.nodeEnv = 'test';
config.port = 5001;
config.mongodb.uri = process.env.MONGODB_URI || `mongodb://localhost:27017/scamcheck_test_${process.env.JEST_WORKER_ID || '1'}`;
config.mlService.url = 'http://localhost:8001';
config.jwt.secret = 'test-secret';
config.rateLimit.windowMs = 1000;
config.rateLimit.maxRequests = 1000;

import mongoose from 'mongoose';
import { closeAuthRedis } from '../services/auth.service';

jest.setTimeout(20000);

afterAll(async () => {
  try {
    await closeAuthRedis();
  } catch (e) {
    void e;
  }
  try {
    const { closeRateLimiter } = await import('../middleware/rateLimit.middleware');
    await closeRateLimiter();
  } catch (e) {
    void e;
  }
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (e) {
    void e;
  }
});