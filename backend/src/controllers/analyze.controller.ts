import { Response } from 'express';
import { analysisService } from '../services/analysis.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';
import { logger } from '../utils/logger';

export class AnalyzeController {
  async analyze(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { inputType, text, url, userProfile } = req.body;
      const userId = req.user?.id;

      let result;
      if (inputType === 'text') {
        if (!text || text.trim().length === 0) {
          const response: ApiResponse<null> = {
            success: false,
            error: { code: 'INVALID_INPUT', message: 'Text is required for text input type' },
          };
          res.status(400).json(response);
          return;
        }
        result = await analysisService.analyzeText(text, userId);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'NOT_IMPLEMENTED', message: `${inputType} input type is not yet implemented` },
        };
        res.status(501).json(response);
        return;
      }

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.json(response);
    } catch (error) {
      logger.error('Analysis error', { error: (error as Error).message });
      throw error;
    }
  }

  async getReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await analysisService.getReportById(id);
      
      if (!report) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Report not found' },
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof report> = {
        success: true,
        data: report,
      };
      res.json(response);
    } catch (error) {
      logger.error('Get report error', { error: (error as Error).message });
      throw error;
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await analysisService.getHistory(userId, page, limit);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.json(response);
    } catch (error) {
      logger.error('Get history error', { error: (error as Error).message });
      throw error;
    }
  }
}

export const analyzeController = new AnalyzeController();