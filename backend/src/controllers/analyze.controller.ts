import { Response, NextFunction } from 'express';
import { analysisService } from '../services/analysis.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';
import { logger } from '../utils/logger';
import { mlClient } from '../services/mlClient.service';
import { fetchUrlSafely, FetchError } from '../utils/urlFetcher';
import { ValidationError, ExternalServiceError, NotImplementedError } from '../utils/errors';

export class AnalyzeController {
  async analyze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { inputType, text, url, userProfile } = req.body;
      const userId = req.user?.id;

      let result;
      if (inputType === 'text') {
        if (!text || text.trim().length === 0) {
          throw new ValidationError('Text is required for text input type');
        }
        result = await analysisService.analyzeText(text, userId, userProfile);
      } else if (inputType === 'url') {
        if (!url || url.trim().length === 0) {
          throw new ValidationError('URL is required for url input type');
        }

        try {
          const fetchResult = await fetchUrlSafely(url);
          // Prepend title and URL context so it gets extracted
          const combinedText = `[URL: ${url}]\n[Title: ${fetchResult.title}]\n\n${fetchResult.text}`;
          result = await analysisService.analyzeText(combinedText, userId, userProfile);
        } catch (fetchError: any) {
          if (fetchError.code === 'SSRF_BLOCKED') {
            throw new ValidationError(fetchError.message || 'Blocked unsafe URL');
          }
          throw new ExternalServiceError('URL Fetch', fetchError.message || 'Failed to fetch the provided URL');
        }
      } else if (inputType === 'screenshot') {
        if (!req.file) {
          throw new ValidationError('Image file is required for screenshot input type');
        }

        try {
          const fileBase64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype;
          const ocrResult = await mlClient.ocrExtract(fileBase64, mimeType);

          if (!ocrResult.text || ocrResult.text.trim().length === 0) {
            throw new Error('OCR failed to extract text from the image');
          }

          const combinedText = `[Source: screenshot_ocr]\n\n${ocrResult.text}`;
          result = await analysisService.analyzeText(combinedText, userId, userProfile);
        } catch (error: any) {
          throw new ExternalServiceError('OCR Service', error.message || 'Failed to extract text from screenshot');
        }
      } else if (inputType === 'pdf') {
        if (!req.file) {
          throw new ValidationError('PDF file is required for pdf input type');
        }

        try {
          const fileBase64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype;
          const pdfResult = await mlClient.extractPdf(fileBase64, mimeType);

          if (!pdfResult.text || pdfResult.text.trim().length === 0) {
            throw new Error('Failed to extract text from the PDF');
          }

          const combinedText = `[Source: pdf_extraction (${pdfResult.method})]\n\n${pdfResult.text}`;
          result = await analysisService.analyzeText(combinedText, userId, userProfile);
        } catch (error: any) {
          throw new ExternalServiceError('PDF Extraction Service', error.message || 'Failed to extract text from PDF');
        }
      } else {
        throw new NotImplementedError(`${inputType} input type`);
      }

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.json(response);
    } catch (error) {
      logger.error('Analysis error', { error: (error as Error).message });
      next(error);
    }
  }

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
      logger.error('Get report error', { error: (error as Error).message });
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
      logger.error('Get history error', { error: (error as Error).message });
      next(error);
    }
  }
}

export const analyzeController = new AnalyzeController();