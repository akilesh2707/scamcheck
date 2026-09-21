import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export const requestContext = new AsyncLocalStorage<string>();

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let requestId = req.headers['x-request-id'] as string;
  
  // Safely validate existing request ID to prevent injection
  if (!requestId || !/^[a-zA-Z0-9-]+$/.test(requestId) || requestId.length > 50) {
    requestId = randomUUID();
  }

  res.setHeader('X-Request-Id', requestId);

  requestContext.run(requestId, () => {
    next();
  });
};
