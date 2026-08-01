const { z } = require('zod');

const phoneRegex = /^(?:\+94|0)?7\d{8}$/;
const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;

function isExpiryInFuture(expiryDate) {
  const match = expiryRegex.exec(expiryDate);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expiry = new Date(year, month, 1); // first day of the month AFTER expiry
  return expiry.getTime() > Date.now();
}

const createPaymentSchema = z.object({
  fineId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD']),
  channel: z.enum(['ANDROID', 'WEB']),
  payerName: z.string().min(1).max(255),
  payerContact: z.string().regex(phoneRegex, 'payerContact must be a valid Sri Lankan mobile number'),
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, 'cardNumber must be 13-19 digits'),
  expiryDate: z
    .string()
    .regex(expiryRegex, 'expiryDate must be in MM/YY format')
    .refine(isExpiryInFuture, 'card has expired'),
  cvv: z.string().regex(/^\d{3,4}$/, 'cvv must be 3-4 digits'),
});

module.exports = { createPaymentSchema };
