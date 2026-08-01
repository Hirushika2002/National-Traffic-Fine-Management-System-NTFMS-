jest.mock('../src/config/db', () => ({
  admin: { findUnique: jest.fn() },
}));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const bcrypt = require('bcrypt');
const request = require('supertest');
const prisma = require('../src/config/db');
const app = require('../src/app');

describe('POST /api/auth/admin/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns access and refresh tokens for valid credentials', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 1,
      email: 'admin@police.lk',
      fullName: 'System Administrator',
      role: 'SUPER_ADMIN',
      passwordHash: 'hashed',
    });
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@police.lk', password: 'ChangeMe123!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.admin.email).toBe('admin@police.lk');
  });

  it('rejects an unknown email', async () => {
    prisma.admin.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'nobody@police.lk', password: 'whatever' });

    expect(res.status).toBe(401);
  });

  it('rejects a wrong password', async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 1, email: 'admin@police.lk', passwordHash: 'hashed' });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@police.lk', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('validates the request body', async () => {
    const res = await request(app).post('/api/auth/admin/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});
