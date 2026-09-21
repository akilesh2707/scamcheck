import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { ExternalServiceError, NotImplementedError } from '../utils/errors';
import { ExtractedOpportunity } from '../types/opportunity';
import { RiskIndicator, EvidenceStatus, Evidence } from '../types/evidence';
import { RiskAnalysis, CredibilityAnalysis, PaymentVerification, SuitabilityAnalysis, Alternative } from '../types/report';

interface MLRiskResponse {
  score: number;
  level: string;
  indicators: RiskIndicator[];
}

interface MLCredibilityResponse {
  score: number;
  website: CredibilityAnalysis['website'];
  company: CredibilityAnalysis['company'];
  evidence: Evidence[];
}

interface MLPaymentResponse {
  required: boolean | null;
  amount: number | null;
  status: string;
  confidence: number;
  evidence: Evidence[];
}

interface MLAlternativesResponse {
  alternatives: Alternative[];
}

export class MLClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.mlService.url,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = 2;
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await operation();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const isTransient =
            error.code === 'ECONNABORTED' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNREFUSED' ||
            (error.response && [502, 503, 504].includes(error.response.status));

          if (isTransient && attempt < maxRetries) {
            attempt++;
            const backoff = 500 * Math.pow(2, attempt - 1) + Math.random() * 100;
            logger.warn(`ML Service transient error, retrying attempt ${attempt}`, { code: error.code, status: error.response?.status, backoff });
            await new Promise(resolve => setTimeout(resolve, backoff));
            continue;
          }
        }
        throw error;
      }
    }
    throw new Error('Unreachable');
  }

  private mapError(error: unknown, fallbackMessage: string): never {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new NotImplementedError(fallbackMessage);
      }
      logger.error('ML Service error', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new ExternalServiceError('ML Service', error.message, error.response?.data);
    }
    throw error;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async extractOpportunity(text: string): Promise<ExtractedOpportunity> {
    try {
      const response = await this.withRetry(() => this.client.post<{ opportunity: ExtractedOpportunity }>('/extract/opportunity', { text }));
      return response.data.opportunity;
    } catch (error) {
      this.mapError(error, 'Opportunity extraction');
    }
  }

  async analyzeRisk(opportunity: ExtractedOpportunity): Promise<MLRiskResponse> {
    try {
      const response = await this.withRetry(() => this.client.post<MLRiskResponse>('/risk/analyze', { opportunity }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'Risk analysis');
    }
  }

  async analyzeCredibility(opportunity: ExtractedOpportunity): Promise<MLCredibilityResponse> {
    try {
      const response = await this.withRetry(() => this.client.post<MLCredibilityResponse>('/credibility/website', { opportunity }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'Credibility analysis');
    }
  }

  async verifyPayment(opportunity: ExtractedOpportunity): Promise<MLPaymentResponse> {
    try {
      const response = await this.withRetry(() => this.client.post<MLPaymentResponse>('/payment/verify', { opportunity }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'Payment verification');
    }
  }

  async analyzeSuitability(opportunity: ExtractedOpportunity, userProfile: any): Promise<SuitabilityAnalysis> {
    try {
      const response = await this.withRetry(() => this.client.post<SuitabilityAnalysis>('/suitability/analyze', { opportunity, userProfile }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'Suitability analysis');
    }
  }

  async analyzeSkillGap(requiredSkills: string[], userSkills: string[]): Promise<any> {
    try {
      const response = await this.withRetry(() => this.client.post('/skill-gap/analyze', { requiredSkills, userSkills }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'Skill gap analysis');
    }
  }

  async findAlternatives(opportunity: ExtractedOpportunity, userProfile?: any): Promise<MLAlternativesResponse> {
    try {
      const response = await this.withRetry(() => this.client.post<MLAlternativesResponse>('/alternatives/find', { opportunity, userProfile }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'Alternative discovery');
    }
  }

  async extractCurriculum(text: string): Promise<any> {
    try {
      const response = await this.withRetry(() => this.client.post('/extract/curriculum', { text }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'Curriculum extraction');
    }
  }

  async ocrExtract(fileBase64: string, mimeType: string): Promise<{ text: string }> {
    try {
      const response = await this.withRetry(() => this.client.post('/ocr', { file: fileBase64, mimeType }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'OCR extraction');
    }
  }

  async extractPdf(fileBase64: string, mimeType: string): Promise<{ text: string, confidence: number, method: string }> {
    try {
      const response = await this.withRetry(() => this.client.post('/extract/pdf', { file: fileBase64, mimeType }));
      return response.data;
    } catch (error) {
      this.mapError(error, 'PDF extraction');
    }
  }
}

export const mlClient = new MLClient();