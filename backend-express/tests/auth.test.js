const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

const email = `test-${Date.now()}@example.com`;

describe('Auth flow', () => {
  afterAll(async () => {
    await db.pool.end();
  });

  it('registers a new student', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Student', email, password: 'Test@1234', role: 'student' });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.role).toBe('student');
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Student', email, password: 'Test@1234', role: 'student' });
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'Test@1234' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'WrongPassword' });
    expect(res.status).toBe(401);
  });

  it('protects a private route without a token', async () => {
    const res = await request(app).get('/api/v1/students/profile');
    expect(res.status).toBe(401);
  });
});
