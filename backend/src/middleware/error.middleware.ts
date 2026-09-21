import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../types/api';
import { ZodError } from 'zod';
import { config } from '../config/env';

import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SCAMCHECK_INVALID_INPUT',
        message: 'Invalid request data',
        details: err.errors,
      },
    };
    res.status(400).json(response);
    return;
  }

  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
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

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A record with this value already exists',
      },
    };
    res.status(409).json(response);
    return;
  }

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.nodeEnv === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  };
  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  };
  res.status(404).json(response);
};
