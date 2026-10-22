import { Response, NextFunction } from 'express';
import { analysisService } from '../services/analysis.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';

export class ReportController {
  async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const reportToken = (req.headers['x-report-token'] as string) || (req.query.token as string);

      if (!userId && !reportToken) {
        const response: ApiResponse<null> = {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication or report access token required' },
        };
        res.status(401).json(response);
        return;
      }
      const report = await analysisService.getReportById(id, userId, reportToken);

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

      let page = parseInt(req.query.page as string, 10);
      if (isNaN(page) || page < 1) page = 1;

      let limit = parseInt(req.query.limit as string, 10);
      if (isNaN(limit) || limit < 1) limit = 20;
      limit = Math.min(limit, 50);

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