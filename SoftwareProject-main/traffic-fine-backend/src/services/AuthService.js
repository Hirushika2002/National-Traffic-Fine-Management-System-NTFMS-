const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const { ApiError } = require('../middleware/errorHandler');

function signAccessToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email, role: admin.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

function signRefreshToken(admin) {
  return jwt.sign({ sub: admin.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

class AuthService {
  static async login(email, password) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password');
    }

    return {
      accessToken: signAccessToken(admin),
      refreshToken: signRefreshToken(admin),
      admin: { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role },
    };
  }

  static async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    return { accessToken: signAccessToken(admin) };
  }
}

module.exports = AuthService;
