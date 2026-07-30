const { z } = require('zod');

const lookupQuerySchema = z.object({
  referenceNo: z.string().min(1, 'referenceNo is required'),
  categoryId: z.coerce.number().int().positive('categoryId must be a positive integer'),
});

const mockFineSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  officerId: z.coerce.number().int().positive(),
  districtId: z.coerce.number().int().positive(),
  vehicleNo: z.string().min(3).max(20),
  driverLicenseNo: z.string().min(3).max(50),
});

module.exports = { lookupQuerySchema, mockFineSchema };
