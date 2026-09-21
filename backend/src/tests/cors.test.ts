import request from 'supertest';
import { createApp } from '../app';

describe('CORS Configuration', () => {
  const app = createApp();

  describe('Allowed Origins', () => {
    it('should allow http://localhost', async () => {
      const res = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'http://localhost')
        .set('Access-Control-Request-Method', 'POST');
      
      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow http://localhost:5173', async () => {
      const res = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');
      
      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow chrome-extension:// origins', async () => {
      const res = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'chrome-extension://abcdefghijklmnop')
        .set('Access-Control-Request-Method', 'POST');
      
      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('chrome-extension://abcdefghijklmnop');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Rejected Origins', () => {
    it('should reject http://evil.example', async () => {
      const res = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'http://evil.example')
        .set('Access-Control-Request-Method', 'POST');
      
      expect(res.status).toBe(500);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
