import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.status(201).json(response);
    } catch (error) {
      logger.error('Register error', { error: (error as Error).message });
      next(error);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.json(response);
    } catch (error) {
      logger.error('Login error', { error: (error as Error).message });
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        };
        res.status(401).json(response);
        return;
      }

      const user = await authService.getMe(userId);

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };
      res.json(response);
    } catch (error) {
      logger.error('Get me error', { error: (error as Error).message });
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        };
        res.status(401).json(response);
        return;
      }

      const user = await authService.updateProfile(userId, req.body);

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };
      res.json(response);
    } catch (error) {
      logger.error('Update profile error', { error: (error as Error).message });
      next(error);
    }
  }

  async updateUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        };
        res.status(401).json(response);
        return;
      }

      const profile = await authService.updateUserProfile(userId, req.body);

      const response: ApiResponse<typeof profile> = {
        success: true,
        data: profile,
      };
      res.json(response);
    } catch (error) {
      logger.error('Update user profile error', { error: (error as Error).message });
      next(error);
    }
  }

  async getUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        };
        res.status(401).json(response);
        return;
      }

      const profile = await authService.getUserProfile(userId);

      const response: ApiResponse<typeof profile> = {
        success: true,
        data: profile,
      };
      res.json(response);
    } catch (error) {
      logger.error('Get user profile error', { error: (error as Error).message });
      next(error);
    }
  }
  async getExtensionPairingCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        };
        res.status(401).json(response);
        return;
      }

      const code = await authService.generatePairingCode(userId);
      const response: ApiResponse<{ code: string }> = {
        success: true,
        data: { code },
      };
      res.json(response);
    } catch (error) {
      logger.error('Pairing code generation error', { error: (error as Error).message });
      next(error);
    }
  }

  async exchangeExtensionPairingCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.body;
      if (!code) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Pairing code is required' },
        };
        res.status(400).json(response);
        return;
      }

      const token = await authService.exchangePairingCode(code);
      const response: ApiResponse<{ token: string }> = {
        success: true,
        data: { token },
      };
      res.json(response);
    } catch (error) {
      logger.error('Pairing code exchange error', { error: (error as Error).message });
      next(error);
    }
  }
}

export const authController = new AuthController();