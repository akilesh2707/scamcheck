import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';
import { NotImplementedError } from '../utils/errors';

export class WebsiteController {
  async analyze(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'URL is required' },
        };
        res.status(400).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Website analysis not yet implemented' },
      };
      res.status(501).json(response);
    } catch (error) {
      throw error;
    }
  }
}

export const websiteController = new WebsiteController();