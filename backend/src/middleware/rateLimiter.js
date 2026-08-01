const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const lookupRateLimiter = rateLimit({
  windowMs: env.rateLimit.lookupWindowMs,
  max: env.rateLimit.lookupMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many lookup requests. Try again later.' },
});

const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.authWindowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
});

module.exports = { lookupRateLimiter, authRateLimiter };
