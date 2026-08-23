import { config } from '../config/env';

config.nodeEnv = 'test';
config.port = 5001;
config.mongodb.uri = 'mongodb://localhost:27017/scamcheck_test';
config.mlService.url = 'http://localhost:8001';
config.jwt.secret = 'test-secret';
config.rateLimit.windowMs = 1000;
config.rateLimit.maxRequests = 1000;