const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ApiError } = require('./errorHandler');

function getBearerToken(header) {
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Missing or malformed Authorization header');
  }
  return token;
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.accessSecret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
}

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = getBearerToken(header);
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
      type: payload.type,
      email: payload.email,
      badgeNo: payload.badgeNo,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

function requireAdminAuth(req, res, next) {
  requireAuth(req, res, (authErr) => {
    if (authErr) {
      return next(authErr);
    }
    if (req.user.type !== 'admin') {
      return next(new ApiError(403, 'Admin access required'));
    }
    return next();
  });
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    requireAuth(req, res, (authErr) => {
      if (authErr) {
        return next(authErr);
      }
      if (!allowedRoles.includes(req.user.role)) {
        return next(new ApiError(403, 'Forbidden'));
      }
      return next();
    });
  };
}

function requireOfficerAuth(req, res, next) {
  requireAuth(req, res, (authErr) => {
    if (authErr) {
      return next(authErr);
    }
    if (req.user.type !== 'officer') {
      return next(new ApiError(403, 'Officer access required'));
    }
    return next();
  });
}

module.exports = { requireAuth, requireAdminAuth, requireRole, requireOfficerAuth };
