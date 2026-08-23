import { Response, NextFunction } from 'express';
import { mlClient } from '../services/mlClient.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';
import { logger } from '../utils/logger';
import { NotImplementedError } from '../utils/errors';

export class SuitabilityController {
  async analyze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { opportunityId, opportunity, userProfile } = req.body;

      if (!opportunityId && !opportunity) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Either opportunityId or opportunity must be provided' },
        };
        res.status(400).json(response);
        return;
      }

      const opp = opportunity;
      if (opportunityId) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'NOT_IMPLEMENTED', message: 'Fetching opportunity by ID not yet implemented' },
        };
        res.status(501).json(response);
        return;
      }

      try {
        const result = await mlClient.analyzeSuitability(opp, userProfile);
        const response: ApiResponse<typeof result> = {
          success: true,
          data: result,
        };
        res.json(response);
      } catch (error) {
        if (error instanceof NotImplementedError) {
          const response: ApiResponse<null> = {
            success: false,
            error: { code: 'NOT_IMPLEMENTED', message: 'Suitability analysis not yet implemented' },
          };
          res.status(501).json(response);
          return;
        }
        next(error);
      }
    } catch (error) {
      logger.error('Suitability analysis error', { error: (error as Error).message });
      next(error);
    }
  }
}

export const suitabilityController = new SuitabilityController();