import { Response, NextFunction } from 'express';
import { mlClient } from '../services/mlClient.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';
import { logger } from '../utils/logger';
import { NotImplementedError } from '../utils/errors';

export class SkillGapController {
  async analyze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { opportunityId, requiredSkills, userSkills } = req.body;

      if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'requiredSkills array is required' },
        };
        res.status(400).json(response);
        return;
      }

      try {
        const result = await mlClient.analyzeSkillGap(requiredSkills, userSkills || []);
        const response: ApiResponse<typeof result> = {
          success: true,
          data: result,
        };
        res.json(response);
      } catch (error) {
        if (error instanceof NotImplementedError) {
          const response: ApiResponse<null> = {
            success: false,
            error: { code: 'NOT_IMPLEMENTED', message: 'Skill gap analysis not yet implemented' },
          };
          res.status(501).json(response);
          return;
        }
        next(error);
      }
    } catch (error) {
      logger.error('Skill gap analysis error', { error: (error as Error).message });
      next(error);
    }
  }
}

export const skillGapController = new SkillGapController();