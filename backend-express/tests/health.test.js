const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('returns 200 with an ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Unknown route', () => {
  it('returns 404 with a JSON error envelope', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
