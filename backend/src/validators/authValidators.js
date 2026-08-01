const { z } = require('zod');

const authLoginSchema = z.object({
  type: z.enum(['admin', 'officer']),
  identifier: z.string().trim().min(1),
  password: z.string().min(8),
});

const authRefreshSchema = z.object({
  refreshToken: z.string().trim().min(1),
});

module.exports = { authLoginSchema, authRefreshSchema };
