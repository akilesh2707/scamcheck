"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../config/env");
env_1.config.nodeEnv = 'test';
env_1.config.port = 5001;
env_1.config.mongodb.uri = 'mongodb://localhost:27017/scamcheck_test';
env_1.config.mlService.url = 'http://localhost:8001';
env_1.config.jwt.secret = 'test-secret';
env_1.config.rateLimit.windowMs = 1000;
env_1.config.rateLimit.maxRequests = 1000;
//# sourceMappingURL=setup.js.map