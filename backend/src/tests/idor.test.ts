import { createApp } from '../app';
import request from 'supertest';
import { Report } from '../models/Report';
import { User } from '../models/User';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { initRateLimiter } from '../middleware/rateLimit.middleware';

let app: any;
let user1Token: string;
let user2Token: string;
let user1Id: mongoose.Types.ObjectId;
let user2Id: mongoose.Types.ObjectId;
let reportId: mongoose.Types.ObjectId;

beforeAll(async () => {
  await mongoose.connect(config.mongodb.uri);
  await initRateLimiter();
  app = createApp();

  await User.deleteMany({});
  await Report.deleteMany({});

  const user1 = await User.create({
    email: 'user1@example.com',
    passwordHash: 'password123',
    name: 'User 1'
  });
  user1Id = user1._id;

  const user2 = await User.create({
    email: 'user2@example.com',
    passwordHash: 'password123',
    name: 'User 2'
  });
  user2Id = user2._id;

  user1Token = jwt.sign({ id: user1Id, email: 'user1@example.com', role: 'user' }, config.jwt.secret, { expiresIn: '1h' });
  user2Token = jwt.sign({ id: user2Id, email: 'user2@example.com', role: 'user' }, config.jwt.secret, { expiresIn: '1h' });

  const report = await Report.create({
    userId: user1Id,
    opportunityId: new mongoose.Types.ObjectId(),
    inputType: 'text',
    normalizedOpportunity: { title: 'Secret Report' },
  });
  reportId = report._id;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('IDOR Prevention', () => {
  it('should allow user1 to fetch their own report', async () => {
    const res = await request(app)
      .get(`/api/analyze/${reportId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.opportunity.title).toBe('Secret Report');
  });

  it('should return 404/403 when user2 attempts to fetch user1s report', async () => {
    const res = await request(app)
      .get(`/api/analyze/${reportId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  
  it('should block unauthenticated access', async () => {
    const res = await request(app).get(`/api/analyze/${reportId}`);
    expect(res.status).toBe(401);
  });
});
