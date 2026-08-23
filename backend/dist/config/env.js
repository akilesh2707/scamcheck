"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/scamcheck',
    },
    mlService: {
        url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    llm: {
        apiKey: process.env.LLM_API_KEY || '',
    },
    embedding: {
        apiKey: process.env.EMBEDDING_API_KEY || '',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
};
//# sourceMappingURL=env.js.map