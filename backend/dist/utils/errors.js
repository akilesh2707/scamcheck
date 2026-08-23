"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAppError = exports.NotImplementedError = exports.ExternalServiceError = exports.RateLimitError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super('VALIDATION_ERROR', message, 400, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super('UNAUTHORIZED', message, 401);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super('FORBIDDEN', message, 403);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super('NOT_FOUND', message, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class RateLimitError extends AppError {
    constructor(message = 'Too many requests', retryAfter) {
        super('RATE_LIMIT_EXCEEDED', message, 429, { retryAfter });
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class ExternalServiceError extends AppError {
    constructor(service, message, details) {
        super('EXTERNAL_SERVICE_ERROR', `${service}: ${message}`, 502, details);
        this.name = 'ExternalServiceError';
    }
}
exports.ExternalServiceError = ExternalServiceError;
class NotImplementedError extends AppError {
    constructor(feature) {
        super('NOT_IMPLEMENTED', `${feature} is not yet implemented`, 501);
        this.name = 'NotImplementedError';
    }
}
exports.NotImplementedError = NotImplementedError;
const isAppError = (error) => {
    return error instanceof AppError;
};
exports.isAppError = isAppError;
//# sourceMappingURL=errors.js.map