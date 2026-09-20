import { analysisService } from '../services/analysis.service';

describe('Opportunity Extraction (Deterministic)', () => {
  it('extracts role without slicing first character and sets correct type', () => {
    const text = "Congratulations! You have been selected for a software development internship. Pay ₹1,999 as a registration and training fee to confirm your seat.";
    const result = (analysisService as any).basicExtraction(text);
    
    // 1. "software development internship" -> INTERNSHIP
    expect(result.type).toBe('INTERNSHIP');
    // 3. extracted title must not lose its first character
    expect(result.role).toContain('software development internship');
  });

  it('correctly classifies a fee instead of a stipend', () => {
    const text = "Congratulations! You have been selected for a software development internship. Pay ₹1,999 as a registration and training fee to confirm your seat.";
    const result = (analysisService as any).basicExtraction(text);
    
    // 2. "Pay ₹1,999 as a registration and training fee" -> fee/payment, NOT stipend
    expect(result.stipend).toBeUndefined();
    expect(result.fees).toBeDefined();
    expect(result.fees.registration).toBe(1999);
  });

  it('credibility evidence must retain the expected evidence object shape', async () => {
    const mlCred = {
      score: 50,
      evidence: [{ claim: 'Website URL', status: 'NOT_FOUND', details: 'No website URL provided' }]
    };
    
    // We mock mlClient to return this to test the mapping in analysisService
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { mlClient } = require('../services/mlClient.service');
    mlClient.extractOpportunity = jest.fn().mockResolvedValue({});
    mlClient.analyzeRisk = jest.fn().mockResolvedValue({ score: 0, level: 'LOW', indicators: [] });
    mlClient.analyzeCredibility = jest.fn().mockResolvedValue(mlCred);
    mlClient.verifyPayment = jest.fn().mockResolvedValue({ required: false, amount: null, status: 'NOT_FOUND', evidence: [] });
    mlClient.analyzeSuitability = jest.fn().mockResolvedValue({ status: 'INSUFFICIENT_PROFILE_DATA' });
    mlClient.findAlternatives = jest.fn().mockResolvedValue({ alternatives: [] });

    // Mock models to prevent DB writes
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Opportunity } = require('../models/Opportunity');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Report } = require('../models/Report');
    Opportunity.create = jest.fn().mockResolvedValue({ _id: '123' });
    Report.create = jest.fn().mockResolvedValue({ _id: '456', createdAt: new Date() });

    const report = await analysisService.analyzeText('test');
    
    // 4. credibility evidence must retain the expected evidence object shape
    expect(report.credibility.evidence[0]).toHaveProperty('claim', 'Website URL');
    expect(report.credibility.evidence[0]).toHaveProperty('status', 'NOT_FOUND');
    expect(report.credibility.evidence[0]).not.toHaveProperty('checkedAt'); // Original mlCred object doesn't have it, we just pass it through
  });
});
