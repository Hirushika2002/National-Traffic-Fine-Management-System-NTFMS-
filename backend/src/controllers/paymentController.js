const { createPaymentSchema } = require('../validators/paymentValidators');
const PaymentService = require('../services/PaymentService');

async function createPayment(req, res, next) {
  try {
    const input = createPaymentSchema.parse(req.body);
    // cardNumber/expiryDate/cvv are validated for format only and are never persisted.
    const payment = await PaymentService.payFine(input);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

module.exports = { createPayment };
