import request from 'supertest';
import { createApp } from '../app';
const app = createApp();
import path from 'path';
import fs from 'fs';

import { analysisService } from '../services/analysis.service';

jest.mock('../services/analysis.service', () => ({
  analysisService: {
    analyzeText: jest.fn().mockResolvedValue({
      id: 'mocked-id',
      risk: { level: 'LOW' },
      createdAt: new Date().toISOString()
    }),
  }
}));

// Mock mlClient to isolate network boundaries but keep Express middleware/logic real
jest.mock('../services/mlClient.service', () => ({
  mlClient: {
    healthCheck: jest.fn().mockResolvedValue(true),
    extractOpportunity: jest.fn().mockResolvedValue({ text: 'Mocked extract' }),
    analyzeRisk: jest.fn().mockResolvedValue({ level: 'LOW' }),
    analyzeCredibility: jest.fn().mockResolvedValue({ status: 'VERIFIED' }),
    verifyPayment: jest.fn().mockResolvedValue({ status: 'VERIFIED' }),
    analyzeSuitability: jest.fn().mockResolvedValue({ score: 100 }),
    analyzeSkillGap: jest.fn().mockResolvedValue({}),
    findAlternatives: jest.fn().mockResolvedValue([]),
    extractCurriculum: jest.fn().mockResolvedValue({}),
    ocrExtract: jest.fn().mockResolvedValue({ text: 'Extracted text from screenshot' })
  }
}));

// We only want to test HTTP boundaries and SSRF logic, not external APIs
describe('Integration Tests (E2E API Boundaries)', () => {
  describe('SSRF Protection', () => {
    it('should reject localhost URLs', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          inputType: 'url',
          url: 'http://localhost:3000/test'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('SSRF_BLOCKED');
    });

    it('should reject private IP URLs', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          inputType: 'url',
          url: 'http://192.168.1.5'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('SSRF_BLOCKED');
    });

    it('should reject loopback URLs', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          inputType: 'url',
          url: 'http://127.0.0.1'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('SSRF_BLOCKED');
    });
  });

  describe('Screenshot Upload API', () => {
    it('should reject invalid mime types', async () => {
      const dummyFilePath = path.join(__dirname, 'dummy.txt');
      fs.writeFileSync(dummyFilePath, 'Not an image');

      const response = await request(app)
        .post('/api/analyze')
        .field('inputType', 'screenshot')
        .attach('file', dummyFilePath);

      fs.unlinkSync(dummyFilePath);

      // Multer will throw error if not png/jpg
      expect(response.status).toBe(500); 
    });

    it('should require file for screenshot inputType', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .field('inputType', 'screenshot');

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Image file is required');
    });

    it('should accept a valid simulated image upload', async () => {
      const dummyFilePath = path.join(__dirname, 'dummy.png');
      fs.writeFileSync(dummyFilePath, 'dummy image data');

      const response = await request(app)
        .post('/api/analyze')
        .field('inputType', 'screenshot')
        .attach('file', dummyFilePath, { contentType: 'image/png' });

      fs.unlinkSync(dummyFilePath);

      if (response.status !== 200) {
        console.error('Test failed, response body:', response.body);
      }
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify that analysisService was called with the combined text
      expect(analysisService.analyzeText).toHaveBeenCalledWith(
        expect.stringContaining('[Source: screenshot_ocr]\n\nExtracted text from screenshot'),
        undefined,
        undefined
      );
    }, 15000);
  });
});
