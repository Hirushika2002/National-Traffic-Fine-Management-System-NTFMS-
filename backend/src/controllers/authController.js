const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const { authLoginSchema, authRefreshSchema } = require('../validators/authValidators');
const { ApiError } = require('../middleware/errorHandler');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseDuration(duration) {
  const unit = duration.slice(-1);
  const value = Number(duration.slice(0, -1));

  if (Number.isNaN(value)) {
    throw new Error(`Invalid JWT duration format: ${duration}`);
  }

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported JWT duration unit: ${unit}`);
  }
}

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      type: user.type,
      email: user.email,
      badgeNo: user.badgeNo,
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn },
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      type: user.type,
      email: user.email,
      badgeNo: user.badgeNo,
    },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn },
  );
}

async function storeRefreshToken(refreshToken, user, userType) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDuration(env.jwt.refreshExpiresIn));

  const relation = userType === 'admin'
    ? { admin: { connect: { id: user.id } } }
    : { officer: { connect: { id: user.id } } };

  return prisma.refreshToken.create({
    data: {
      tokenHash,
      expiresAt,
      userType,
      ...relation,
    },
  });
}

async function login(req, res, next) {
  try {
    const { type, identifier, password } = authLoginSchema.parse(req.body);

    const user = type === 'admin'
      ? await prisma.admin.findUnique({ where: { email: identifier } })
      : await prisma.officer.findUnique({ where: { badgeNo: identifier } });

    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const tokenUser = {
      id: user.id,
      role: user.role,
      type,
      email: user.email,
      badgeNo: user.badgeNo,
    };

    const accessToken = createAccessToken(tokenUser);
    const refreshToken = createRefreshToken(tokenUser);
    await storeRefreshToken(refreshToken, user, type);

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        type,
        email: user.email,
        badgeNo: user.badgeNo,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = authRefreshSchema.parse(req.body);
    let payload;

    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = payload.type === 'admin'
      ? await prisma.admin.findUnique({ where: { id: payload.sub } })
      : await prisma.officer.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const tokenUser = {
      id: user.id,
      role: user.role,
      type: payload.type,
      email: user.email,
      badgeNo: user.badgeNo,
    };

    const newAccessToken = createAccessToken(tokenUser);
    const newRefreshToken = createRefreshToken(tokenUser);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { tokenHash },
        data: { revoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          tokenHash: hashToken(newRefreshToken),
          expiresAt: new Date(Date.now() + parseDuration(env.jwt.refreshExpiresIn)),
          userType: payload.type,
          ...(payload.type === 'admin'
            ? { admin: { connect: { id: user.id } } }
            : { officer: { connect: { id: user.id } } }),
        },
      }),
    ]);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = authRefreshSchema.parse(req.body);
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true },
    });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, refresh, logout };