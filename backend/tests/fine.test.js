jest.mock('../src/config/db', () => ({
  trafficFine: { findFirst: jest.fn(), create: jest.fn() },
  fineCategory: { findUnique: jest.fn() },
}));

const request = require('supertest');
const prisma = require('../src/config/db');
const app = require('../src/app');

describe('GET /api/fines/lookup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns fine details when a match exists', async () => {
    prisma.trafficFine.findFirst.mockResolvedValue({
      id: 1,
      referenceNo: 'SLP-2026-000001',
      categoryId: 1,
      status: 'PENDING',
    });

    const res = await request(app)
      .get('/api/fines/lookup')
      .query({ referenceNo: 'SLP-2026-000001', categoryId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.referenceNo).toBe('SLP-2026-000001');
  });

  it('returns 404 when no fine matches', async () => {
    prisma.trafficFine.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/fines/lookup').query({ referenceNo: 'MISSING', categoryId: 1 });

    expect(res.status).toBe(404);
  });

  it('returns 400 when categoryId is missing', async () => {
    const res = await request(app).get('/api/fines/lookup').query({ referenceNo: 'MISSING' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/fines/mock', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a pending fine priced at the category base amount', async () => {
    prisma.fineCategory.findUnique.mockResolvedValue({ id: 2, baseAmount: 2500 });
    prisma.trafficFine.create.mockResolvedValue({
      id: 10,
      referenceNo: 'SLP-2026-000123',
      amount: 2500,
      status: 'PENDING',
    });

    const res = await request(app).post('/api/fines/mock').send({
      categoryId: 2,
      officerId: 1,
      districtId: 3,
      vehicleNo: 'WP-CAB-8976',
      driverLicenseNo: 'B9876543',
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
    expect(prisma.trafficFine.create).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when the category does not exist', async () => {
    prisma.fineCategory.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/fines/mock').send({
      categoryId: 999,
      officerId: 1,
      districtId: 3,
      vehicleNo: 'WP-CAB-8976',
      driverLicenseNo: 'B9876543',
    });

    expect(res.status).toBe(404);
  });
});
