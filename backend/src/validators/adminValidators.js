const { z } = require('zod');

const fineExplorerQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID']).optional(),
  districtId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

module.exports = { fineExplorerQuerySchema };
