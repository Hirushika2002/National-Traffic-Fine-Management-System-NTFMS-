const prisma = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { generateTransactionRef } = require('../utils/refGenerator');
const SmsService = require('./SmsService');

const PRISMA_UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

class PaymentService {
  static async payFine(input) {
    const fine = await prisma.trafficFine.findUnique({
      where: { id: input.fineId },
      include: { officer: true },
    });

    if (!fine) {
      throw new ApiError(404, 'Fine not found');
    }

    if (fine.status === 'PAID') {
      throw new ApiError(400, 'Fine already paid');
    }

    if (Number(fine.amount) !== Number(input.amount)) {
      throw new ApiError(400, 'Payment amount does not match the fine amount');
    }

    const transactionRef = generateTransactionRef();
    const paidAt = new Date();

    let payment;
    try {
      payment = await prisma.$transaction(async (tx) => {
        const createdPayment = await tx.payment.create({
          data: {
            fineId: fine.id,
            amountPaid: input.amount,
            paymentMethod: input.paymentMethod,
            transactionRef,
            channel: input.channel,
            payerName: input.payerName,
            payerContact: input.payerContact,
            paidAt,
          },
        });

        await tx.trafficFine.update({
          where: { id: fine.id },
          data: { status: 'PAID' },
        });

        return createdPayment;
      });
    } catch (err) {
      if (err.code === PRISMA_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ApiError(400, 'Fine already paid');
      }
      throw err;
    }

    await SmsService.notifyOfficerOfPayment({
      paymentId: payment.id,
      officerPhone: fine.officer.phoneNo,
      fine,
    });

    return payment;
  }
}

module.exports = PaymentService;
