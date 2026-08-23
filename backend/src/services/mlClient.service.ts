import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { ExternalServiceError, NotImplementedError } from '../utils/errors';
import { ExtractedOpportunity } from '../types/opportunity';
import { RiskIndicator, EvidenceStatus } from '../types/evidence';
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
  evidence: EvidenceStatus[];
}

interface MLPaymentResponse {
  required: boolean | null;
  amount: number | null;
  status: string;
  confidence: number;
  evidence: EvidenceStatus[];
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

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        logger.error('ML Service error', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        throw new ExternalServiceError('ML Service', error.message, error.response?.data);
      }
    );
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
      const response = await this.client.post<{ opportunity: ExtractedOpportunity }>('/extract/opportunity', { text });
      return response.data.opportunity;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('Opportunity extraction');
      }
      throw error;
    }
  }

  async analyzeRisk(opportunity: ExtractedOpportunity): Promise<MLRiskResponse> {
    try {
      const response = await this.client.post<MLRiskResponse>('/risk/analyze', { opportunity });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('Risk analysis');
      }
      throw error;
    }
  }

  async analyzeCredibility(opportunity: ExtractedOpportunity): Promise<MLCredibilityResponse> {
    try {
      const response = await this.client.post<MLCredibilityResponse>('/credibility/website', { opportunity });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('Credibility analysis');
      }
      throw error;
    }
  }

  async verifyPayment(opportunity: ExtractedOpportunity): Promise<MLPaymentResponse> {
    try {
      const response = await this.client.post<MLPaymentResponse>('/payment/verify', { opportunity });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('Payment verification');
      }
      throw error;
    }
  }

  async analyzeSuitability(opportunity: ExtractedOpportunity, userProfile: any): Promise<SuitabilityAnalysis> {
    try {
      const response = await this.client.post<SuitabilityAnalysis>('/suitability/analyze', { opportunity, userProfile });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('Suitability analysis');
      }
      throw error;
    }
  }

  async analyzeSkillGap(requiredSkills: string[], userSkills: string[]): Promise<any> {
    try {
      const response = await this.client.post('/skill-gap/analyze', { requiredSkills, userSkills });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('Skill gap analysis');
      }
      throw error;
    }
  }

  async findAlternatives(opportunity: ExtractedOpportunity, userProfile?: any): Promise<MLAlternativesResponse> {
    try {
      const response = await this.client.post<MLAlternativesResponse>('/alternatives/find', { opportunity, userProfile });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('Alternative discovery');
      }
      throw error;
    }
  }

  async extractCurriculum(text: string): Promise<any> {
    try {
      const response = await this.client.post('/extract/curriculum', { text });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('Curriculum extraction');
      }
      throw error;
    }
  }

  async ocrExtract(fileBase64: string, mimeType: string): Promise<{ text: string }> {
    try {
      const response = await this.client.post('/ocr', { file: fileBase64, mimeType });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotImplementedError('OCR extraction');
      }
      throw error;
    }
  }
}

export const mlClient = new MLClient();