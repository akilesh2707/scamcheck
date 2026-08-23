import { Response, NextFunction } from 'express';
import { analysisService } from '../services/analysis.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';

export class ReportController {
  async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }
}

export const reportController = new ReportController();