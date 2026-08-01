jest.mock('../src/config/db', () => ({
  payment: { aggregate: jest.fn() },
  trafficFine: { count: jest.fn(), findMany: jest.fn(), aggregate: jest.fn() },
  district: { findMany: jest.fn() },
  fineCategory: { findMany: jest.fn() },
}));

const jwt = require('jsonwebtoken');
const request = require('supertest');
const prisma = require('../src/config/db');
const app = require('../src/app');

function adminToken() {
  return jwt.sign({ sub: 1, email: 'admin@police.lk', role: 'SUPER_ADMIN' }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

describe('Admin reporting routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects requests with no bearer token', async () => {
    const res = await request(app).get('/api/admin/reports/summary');
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await request(app).get('/api/admin/reports/summary').set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
  });

  it('returns dashboard summary for an authenticated admin', async () => {
    prisma.payment.aggregate.mockResolvedValue({ _sum: { amountPaid: 145000 } });
    prisma.trafficFine.count
      .mockResolvedValueOnce(542)
      .mockResolvedValueOnce(412)
      .mockResolvedValueOnce(130);
    prisma.trafficFine.aggregate.mockResolvedValue({ _sum: { amount: 35000 } });

    const res = await request(app)
      .get('/api/admin/reports/summary')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalCollections: 145000,
      totalFinesIssued: 542,
      paidFinesCount: 412,
      pendingFinesCount: 130,
      totalPending: 35000,
    });
  });

  it('paginates the fine explorer', async () => {
    prisma.trafficFine.findMany.mockResolvedValue([]);
    prisma.trafficFine.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/admin/fines')
      .query({ status: 'PENDING', page: 2, limit: 5 })
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination).toEqual({ page: 2, limit: 5, total: 0, totalPages: 0 });
  });
});
