"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err instanceof zod_1.ZodError) {
        const response = {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: err.errors,
            },
        };
        res.status(400).json(response);
        return;
    }
    if (err instanceof errors_1.AppError) {
        const response = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        };
        res.status(err.statusCode).json(response);
        return;
    }
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const response = {
            success: false,
            error: {
                code: 'DUPLICATE_ENTRY',
                message: 'A record with this value already exists',
            },
        };
        res.status(409).json(response);
        return;
    }
    const response = {
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: env_1.config.nodeEnv === 'production'
                ? 'An unexpected error occurred'
                : err.message,
        },
    };
    res.status(500).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const response = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    };
    res.status(404).json(response);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map