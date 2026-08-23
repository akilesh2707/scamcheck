import { analysisService } from './analysis.service';

export const reportService = {
  getById: (id: string) => analysisService.getReportById(id),
  getHistory: (userId: string, page?: number, limit?: number) => analysisService.getHistory(userId, page, limit),
};