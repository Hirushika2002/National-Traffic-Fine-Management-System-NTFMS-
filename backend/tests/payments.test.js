jest.mock('../src/config/db', () => {
  const payment = { create: jest.fn() };
  const trafficFineTx = { update: jest.fn() };
  return {
    trafficFine: { findUnique: jest.fn(), update: trafficFineTx.update },
    payment,
    smsLog: { create: jest.fn() },
    $transaction: jest.fn(async (callback) => callback({ payment, trafficFine: trafficFineTx })),
  };
});

const request = require('supertest');
const prisma = require('../src/config/db');
const app = require('../src/app');

const validPaymentBody = {
  fineId: 1,
  amount: 2500,
  paymentMethod: 'CREDIT_CARD',
  channel: 'ANDROID',
  payerName: 'A. B. Perera',
  payerContact: '0771234567',
  cardNumber: '4111222233334444',
  expiryDate: '12/30',
  cvv: '123',
};

describe('POST /api/payments', () => {
  beforeEach(() => jest.clearAllMocks());

  it('processes a valid payment, marks the fine PAID, and logs the SMS notification', async () => {
    prisma.trafficFine.findUnique.mockResolvedValue({
      id: 1,
      amount: 2500,
      status: 'PENDING',
      referenceNo: 'SLP-2026-000001',
      vehicleNo: 'WP-CAB-8976',
      officer: { phoneNo: '+94771234567' },
    });
    prisma.payment.create.mockResolvedValue({ id: 100, transactionRef: 'TXN-1', fineId: 1 });

    const res = await request(app).post('/api/payments').send(validPaymentBody);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('transactionRef', 'TXN-1');
    expect(prisma.smsLog.create).toHaveBeenCalledTimes(1);
  });

  it('rejects payment for a fine that is already paid', async () => {
    prisma.trafficFine.findUnique.mockResolvedValue({ id: 1, amount: 2500, status: 'PAID' });

    const res = await request(app).post('/api/payments').send(validPaymentBody);

    expect(res.status).toBe(400);
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it('rejects a payment amount that does not match the fine amount', async () => {
    prisma.trafficFine.findUnique.mockResolvedValue({ id: 1, amount: 9999, status: 'PENDING' });

    const res = await request(app).post('/api/payments').send(validPaymentBody);

    expect(res.status).toBe(400);
  });

  it('returns 404 when the fine does not exist', async () => {
    prisma.trafficFine.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/payments').send(validPaymentBody);

    expect(res.status).toBe(404);
  });

  it('rejects malformed card details before touching the database', async () => {
    const res = await request(app)
      .post('/api/payments')
      .send({ ...validPaymentBody, cardNumber: 'not-a-card' });

    expect(res.status).toBe(400);
    expect(prisma.trafficFine.findUnique).not.toHaveBeenCalled();
  });
});
