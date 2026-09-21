import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from '../utils/errors';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    type?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      type?: string;
      aud?: string;
    };

    // Explicitly reject extension tokens from normal authenticated routes
    if (decoded.type === 'extension' || decoded.aud === 'scamcheck-extension') {
      throw new AppError('FORBIDDEN', 'Extension credentials cannot access this endpoint', 403);
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      throw new AppError('UNAUTHORIZED', 'User not found', 401);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      type: decoded.type,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('UNAUTHORIZED', 'Invalid token', 401));
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('UNAUTHORIZED', 'Token expired', 401));
      return;
    }
    next(new AppError('UNAUTHORIZED', 'Authentication failed', 401));
  }
};

export const authenticateAllowExtension = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      type?: string;
    };

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      throw new AppError('UNAUTHORIZED', 'User not found', 401);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      type: decoded.type,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('UNAUTHORIZED', 'Invalid token', 401));
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('UNAUTHORIZED', 'Token expired', 401));
      return;
    }
    next(new AppError('UNAUTHORIZED', 'Authentication failed', 401));
  }
};

export const optionalAuthAllowExtension = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      type?: string;
    };

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        type: decoded.type,
      };
    }

    next();
  } catch {
    next();
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      type?: string;
      aud?: string;
    };

    // If it's an extension token, pretend there's no auth for routes that don't allow it explicitly
    // Or we could reject, but optionalAuth usually implies "if valid, attach; if not, ignore".
    // For safety, let's ignore it so it acts as unauthenticated.
    if (decoded.type === 'extension' || decoded.aud === 'scamcheck-extension') {
      next();
      return;
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        type: decoded.type,
      };
    }

    next();
  } catch {
    next();
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('FORBIDDEN', 'Insufficient permissions', 403));
      return;
    }

    next();
  };
};