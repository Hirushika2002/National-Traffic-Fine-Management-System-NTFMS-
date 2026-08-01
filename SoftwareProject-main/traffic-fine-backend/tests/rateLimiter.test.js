jest.mock('../src/config/db', () => ({
  trafficFine: { findFirst: jest.fn().mockResolvedValue(null) },
}));

const request = require('supertest');
const app = require('../src/app');

describe('Fine lookup rate limiting', () => {
  it('blocks lookups once the per-minute limit is exceeded', async () => {
    let lastStatus;
    for (let i = 0; i < 16; i += 1) {
      // Sequential by design: the limiter tracks a rolling count for one client.
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app)
        .get('/api/fines/lookup')
        .query({ referenceNo: `REF${i}`, categoryId: 1 });
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});
