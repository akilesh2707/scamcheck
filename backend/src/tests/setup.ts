import { config } from '../config/env';

config.nodeEnv = 'test';
config.port = 5001;
config.mongodb.uri = 'mongodb://localhost:27017/scamcheck_test';
config.mlService.url = 'http://localhost:8001';
config.jwt.secret = 'test-secret';
config.rateLimit.windowMs = 1000;
config.rateLimit.maxRequests = 1000;

import mongoose from 'mongoose';
import { closeAuthRedis } from '../services/auth.service';

afterAll(async () => {
  await closeAuthRedis();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});