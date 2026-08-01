const rateLimit = require('express-rate-limit');

// Throttle fine lookups to slow down sequential reference-number scraping.
const lookupRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many lookup attempts. Please try again in a minute.' },
});

module.exports = { lookupRateLimiter };
