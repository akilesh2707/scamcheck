import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';

export class CompanyController {
  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, website } = req.body;

      const response: ApiResponse<null> = {
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Company verification not yet implemented' },
      };
      res.status(501).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();