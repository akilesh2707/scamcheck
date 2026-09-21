export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('SCAMCHECK_INVALID_INPUT', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('SCAMCHECK_UNAUTHORIZED', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super('SCAMCHECK_FORBIDDEN', message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super('SCAMCHECK_NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super('SCAMCHECK_RATE_LIMIT', message, 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    // Determine if it's a timeout
    const code = (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('econnrefused'))
      ? 'SCAMCHECK_SERVICE_TIMEOUT'
      : 'SCAMCHECK_SERVICE_ERROR';
    super(code, `${service}: ${message}`, 502, details);
    this.name = 'ExternalServiceError';
  }
}

export class NotImplementedError extends AppError {
  constructor(feature: string) {
    super('NOT_IMPLEMENTED', `${feature} is not yet implemented`, 501);
    this.name = 'NotImplementedError';
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};