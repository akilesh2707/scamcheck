import { createApp } from '../app';
import request from 'supertest';
import { Report } from '../models/Report';
import { User } from '../models/User';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';

let app: any;
let user1Token: string;
let user2Token: string;
let user1Id: mongoose.Types.ObjectId;
let user2Id: mongoose.Types.ObjectId;
let reportId: mongoose.Types.ObjectId;
let anonReportId: mongoose.Types.ObjectId;
const anonRawToken = crypto.randomBytes(32).toString('hex');
const anonTokenHash = crypto.createHash('sha256').update(anonRawToken).digest('hex');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongodb.uri);
  }
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

  const anonReport = await Report.create({
    accessKeyHash: anonTokenHash,
    opportunityId: new mongoose.Types.ObjectId(),
    inputType: 'text',
    normalizedOpportunity: { title: 'Anonymous Opportunity Report' },
  });
  anonReportId = anonReport._id;
});

describe('IDOR Prevention & Report Access Control', () => {
  it('should allow user1 to fetch their own report', async () => {
    const res = await request(app)
      .get(`/api/analyze/${reportId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.opportunity.title).toBe('Secret Report');
  });

  it('should return 404 when user2 attempts to fetch user1s report', async () => {
    const res = await request(app)
      .get(`/api/analyze/${reportId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  
  it('should block unauthenticated access without token to user report', async () => {
    const res = await request(app).get(`/api/analyze/${reportId}`);
    expect(res.status).toBe(401);
  });

  it('should allow anonymous user to fetch anonymous report via X-Report-Token header', async () => {
    const res = await request(app)
      .get(`/api/analyze/${anonReportId}`)
      .set('X-Report-Token', anonRawToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.opportunity.title).toBe('Anonymous Opportunity Report');
  });

  it('should allow anonymous user to fetch anonymous report via query token param', async () => {
    const res = await request(app)
      .get(`/api/analyze/${anonReportId}?token=${anonRawToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.opportunity.title).toBe('Anonymous Opportunity Report');
  });

  it('should reject anonymous fetch with invalid token with 404', async () => {
    const res = await request(app)
      .get(`/api/analyze/${anonReportId}`)
      .set('X-Report-Token', 'wrong-token-value');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should reject anonymous fetch without token with 401', async () => {
    const res = await request(app).get(`/api/analyze/${anonReportId}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow an authenticated user to open an anonymous report with a valid header token', async () => {
    const res = await request(app)
      .get(`/api/analyze/${anonReportId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .set('X-Report-Token', anonRawToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.opportunity.title).toBe('Anonymous Opportunity Report');
  });

  it('should allow an authenticated user to open an anonymous report with a valid query token', async () => {
    const res = await request(app)
      .get(`/api/analyze/${anonReportId}?token=${anonRawToken}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.opportunity.title).toBe('Anonymous Opportunity Report');
  });

  it('should deny an authenticated user access to another users report even with a token', async () => {
    const res = await request(app)
      .get(`/api/analyze/${reportId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .set('X-Report-Token', anonRawToken);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should reject authenticated user request for anonymous report when token is invalid', async () => {
    const res = await request(app)
      .get(`/api/analyze/${anonReportId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .set('X-Report-Token', 'wrong-token-value');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should not allow access to authenticated user report even if passing an anonymous token', async () => {
    const res = await request(app)
      .get(`/api/analyze/${reportId}`)
      .set('X-Report-Token', anonRawToken);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
