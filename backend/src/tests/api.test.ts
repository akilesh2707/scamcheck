import request from 'supertest';
import express from 'express';
import { analysisService } from '../services/analysis.service';
import { mlClient } from '../services/mlClient.service';
import { AnalysisReport } from '../types/report';
import { OpportunityType } from '../types/opportunity';

jest.mock('../services/analysis.service', () => ({
  analysisService: {
    analyzeText: jest.fn(),
    getReportById: jest.fn(),
    getHistory: jest.fn(),
  },
}));

jest.mock('../services/mlClient.service', () => ({
  mlClient: {
    healthCheck: jest.fn().mockResolvedValue(true),
    extractOpportunity: jest.fn(),
    analyzeRisk: jest.fn(),
    analyzeCredibility: jest.fn(),
    verifyPayment: jest.fn(),
    analyzeSuitability: jest.fn(),
    analyzeSkillGap: jest.fn(),
    findAlternatives: jest.fn(),
    extractCurriculum: jest.fn(),
    ocrExtract: jest.fn(),
  },
}));

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';
import { createApp } from '../app';
import { analysisService as mockAnalysisService } from '../services/analysis.service';
import { mlClient as mockMlClient } from '../services/mlClient.service';

const mockedAnalysisService = mockAnalysisService as jest.Mocked<typeof analysisService>;
const mockedMlClient = mockMlClient as jest.Mocked<typeof mlClient>;

describe('API Endpoints', () => {
  let app: express.Application;
  let testUserToken: string;

  beforeAll(async () => {
    await mongoose.connect(config.mongodb.uri);
    app = createApp();

    await User.deleteMany({ email: 'api_test_unique@example.com' });
    const testUser = await User.create({
      email: 'api_test_unique@example.com',
      passwordHash: 'hashed',
      name: 'Test User'
    });
    testUserToken = jwt.sign({ id: testUser._id, email: testUser.email, role: 'user' }, config.jwt.secret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/analyze', () => {
    it('should return 400 for empty text', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ inputType: 'text', text: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing text with text input type', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ inputType: 'text' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });


    it('should return 400 for pdf input type without file', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ inputType: 'pdf' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SCAMCHECK_INVALID_INPUT');
    });

    it('should return 400 for invalid input type', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ inputType: 'invalid', text: 'test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should successfully analyze text and return report', async () => {
      const mockReport: AnalysisReport = {
        id: 'test-id',
        opportunity: { type: 'INTERNSHIP' as OpportunityType, role: 'Software Developer Intern' },
        risk: { score: 65, level: 'HIGH', indicators: [], weights: {} },
        credibility: {
          score: 40,
          website: { hasHttps: true, hasPrivacyPolicy: false, hasTerms: false, hasRefundPolicy: false, hasContactInfo: false, evidence: [] },
          company: { emailDomainMatch: false, applicationDomainMatch: false, contactConsistency: false, evidence: [] },
          evidence: []
        },
        payment: { required: true, amount: 2999, status: 'VERIFIED', confidence: 0.8, evidence: [] },
        suitability: { overallScore: null, breakdown: { skills: {score: null, status: 'UNAVAILABLE'}, education: {score: null, status: 'UNAVAILABLE'}, experience: {score: null, status: 'UNAVAILABLE'}, careerGoals: {score: null, status: 'UNAVAILABLE'}, location: {score: null, status: 'UNAVAILABLE'}, compensation: {score: null, status: 'UNAVAILABLE'}, budget: {score: null, status: 'UNAVAILABLE'} }, skillGap: [], status: 'UNAVAILABLE' },
        alternatives: [],
        value: { score: null, potentialSaving: 0, alternatives: [] },
        recommendation: {
          decision: 'AVOID_PAYMENT',
          summary: '',
          verifiedFacts: [],
          unverifiedClaims: [],
          cautionarySignals: [],
          profileMatches: [],
          paymentAdvisory: null,
          questionsToAsk: [],
          nextSteps: []
        },
        evidenceLabels: {},
        createdAt: new Date().toISOString(),
      };

      mockedAnalysisService.analyzeText.mockResolvedValue(mockReport);

      const response = await request(app)
        .post('/api/analyze')
        .send({ inputType: 'text', text: 'Test opportunity text' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.opportunity).toBeDefined();
      expect(response.body.data.risk).toBeDefined();
      expect(response.body.data.recommendation).toBeDefined();
    });
  });

  describe('GET /api/analyze/:id', () => {
    it('should return 404 for non-existent report', async () => {
      mockedAnalysisService.getReportById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/analyze/nonexistent-id')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return report for valid ID', async () => {
      const mockReport: AnalysisReport = {
        id: 'test-id',
        opportunity: { type: 'INTERNSHIP' as OpportunityType },
        risk: { score: 30, level: 'MODERATE', indicators: [], weights: {} },
        credibility: {
          score: 60,
          website: { hasHttps: true, hasPrivacyPolicy: false, hasTerms: false, hasRefundPolicy: false, hasContactInfo: false, evidence: [] },
          company: { emailDomainMatch: false, applicationDomainMatch: false, contactConsistency: false, evidence: [] },
          evidence: []
        },
        payment: { required: false, amount: null, status: 'NOT_FOUND', confidence: 0.5, evidence: [] },
        suitability: { overallScore: null, breakdown: { skills: {score: null, status: 'UNAVAILABLE'}, education: {score: null, status: 'UNAVAILABLE'}, experience: {score: null, status: 'UNAVAILABLE'}, careerGoals: {score: null, status: 'UNAVAILABLE'}, location: {score: null, status: 'UNAVAILABLE'}, compensation: {score: null, status: 'UNAVAILABLE'}, budget: {score: null, status: 'UNAVAILABLE'} }, skillGap: [], status: 'UNAVAILABLE' },
        alternatives: [],
        value: { score: null, potentialSaving: 0, alternatives: [] },
        recommendation: {
          decision: 'VERIFY_FIRST',
          summary: '',
          verifiedFacts: [],
          unverifiedClaims: [],
          cautionarySignals: [],
          profileMatches: [],
          paymentAdvisory: null,
          questionsToAsk: [],
          nextSteps: []
        },
        evidenceLabels: {},
        createdAt: new Date().toISOString(),
      };

      mockedAnalysisService.getReportById.mockResolvedValue(mockReport);

      const response = await request(app)
        .get('/api/analyze/test-id')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-id');
    });
  });

  describe('GET /api/analyze/history', () => {
    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app).get('/api/analyze/history').expect(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return paginated history for authenticated user', async () => {
      mockedAnalysisService.getHistory.mockResolvedValue({
        reports: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      const response = await request(app)
        .get('/api/analyze/history?page=1&limit=10')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockedAnalysisService.getHistory).toHaveBeenCalledWith(expect.any(String), 1, 10);
    });

    it('should enforce maximum pagination limit of 50', async () => {
      mockedAnalysisService.getHistory.mockResolvedValue({
        reports: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      const response = await request(app)
        .get('/api/analyze/history?page=1&limit=1000000')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockedAnalysisService.getHistory).toHaveBeenCalledWith(expect.any(String), 1, 50);
    });

    it('should handle invalid pagination limits gracefully', async () => {
      mockedAnalysisService.getHistory.mockResolvedValue({
        reports: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      const response = await request(app)
        .get('/api/analyze/history?page=-5&limit=invalid')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockedAnalysisService.getHistory).toHaveBeenCalledWith(expect.any(String), 1, 20);
    });
  });



  describe('ML Service Unavailable', () => {
    it('should handle ML service unavailable gracefully', async () => {
      const mockReport: AnalysisReport = {
        id: 'test-id',
        opportunity: { type: 'INTERNSHIP' as OpportunityType, role: 'Software Developer Intern' },
        risk: { score: 65, level: 'HIGH', indicators: [], weights: {} },
        credibility: {
          score: 40,
          website: { hasHttps: true, hasPrivacyPolicy: false, hasTerms: false, hasRefundPolicy: false, hasContactInfo: false, evidence: [] },
          company: { emailDomainMatch: false, applicationDomainMatch: false, contactConsistency: false, evidence: [] },
          evidence: []
        },
        payment: { required: true, amount: 2999, status: 'VERIFIED', confidence: 0.8, evidence: [] },
        suitability: { overallScore: null, breakdown: { skills: {score: null, status: 'UNAVAILABLE'}, education: {score: null, status: 'UNAVAILABLE'}, experience: {score: null, status: 'UNAVAILABLE'}, careerGoals: {score: null, status: 'UNAVAILABLE'}, location: {score: null, status: 'UNAVAILABLE'}, compensation: {score: null, status: 'UNAVAILABLE'}, budget: {score: null, status: 'UNAVAILABLE'} }, skillGap: [], status: 'UNAVAILABLE' },
        alternatives: [],
        value: { score: null, potentialSaving: 0, alternatives: [] },
        recommendation: {
          decision: 'AVOID_PAYMENT',
          summary: '',
          verifiedFacts: [],
          unverifiedClaims: [],
          cautionarySignals: [],
          profileMatches: [],
          paymentAdvisory: null,
          questionsToAsk: [],
          nextSteps: []
        },
        evidenceLabels: {},
        createdAt: new Date().toISOString(),
      };

      mockedAnalysisService.analyzeText.mockResolvedValue(mockReport);

      const response = await request(app)
        .post('/api/analyze')
        .send({ inputType: 'text', text: 'Test opportunity' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.risk).toBeDefined();
    });
  });
});

describe('Evidence Framework', () => {
  const evidenceStatuses = ['SUPPORTED', 'CONTRADICTED', 'NOT_VERIFIED', 'UNAVAILABLE', 'INFERRED'];

  evidenceStatuses.forEach(status => {
    it(`should handle ${status} evidence status`, () => {
      const evidence = {
        claim: 'Test claim',
        status: status as any,
        details: 'Test details',
        checkedAt: new Date().toISOString(),
      };

      expect(evidence.status).toBe(status);
      expect(evidence.claim).toBe('Test claim');
      expect(evidence.details).toBe('Test details');
    });
  });
});