import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';
import { User } from '../models/User';
import { config } from '../config/env';

describe('Auth Registration API', () => {
  const app = createApp();

  beforeAll(async () => {
    await mongoose.connect(config.mongodb.uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /api/auth/register', () => {
    beforeEach(async () => {
      await User.deleteMany({ email: /@example\.com$/ });
    });

    it('should successfully register a user with a valid payload', async () => {
      const payload = {
        email: `e2e-register-${Date.now()}@example.com`,
        password: 'ValidPassword123!',
        name: 'Test Valid User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(payload.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject registration with an invalid password (no special character)', async () => {
      const payload = {
        email: `e2e-register-invalid-${Date.now()}@example.com`,
        password: 'InvalidPassword123', // Missing special character
        name: 'Test Invalid User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      
      // Verify that the details contain the password constraint failure
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Password must contain at least one special character',
            path: ['body', 'password'],
          })
        ])
      );
    });

    it('should gracefully handle missing optional fields', async () => {
      const payload = {
        email: `e2e-register-no-name-${Date.now()}@example.com`,
        password: 'ValidPassword123!',
        // name omitted
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(payload.email);
    });
  });
});
