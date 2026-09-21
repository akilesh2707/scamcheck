import { analysisService } from './analysis.service';

export const reportService = {
  getById: (id: string, userId: string) => analysisService.getReportById(id, userId),
  getHistory: (userId: string, page?: number, limit?: number) => analysisService.getHistory(userId, page, limit),
};