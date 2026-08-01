const twilio = require('twilio');
const env = require('../config/env');
const prisma = require('../config/db');

class SmsService {
  static async send(to, message) {
    if (env.sms.provider === 'twilio') {
      const client = twilio(env.sms.twilioAccountSid, env.sms.twilioAuthToken);
      return client.messages.create({
        body: message,
        from: env.sms.twilioPhoneNumber,
        to,
      });
    }

    // eslint-disable-next-line no-console
    console.log(`[SMS MOCK] To: ${to} | Msg: ${message}`);
    return { sid: 'mock_sid_success' };
  }

  // Sends the officer notification and always records the outcome in sms_logs,
  // without ever letting an SMS failure surface as a payment failure.
  static async notifyOfficerOfPayment({ paymentId, officerPhone, fine }) {
    const message = `Receipt confirmation for Ref ${fine.referenceNo}. Value: LKR ${fine.amount}. Status: Ok.`;

    let status = 'SUCCESS';
    try {
      await SmsService.send(officerPhone, message);
    } catch (err) {
      status = 'FAILED';
      console.error('SMS notification failed:', err.message);
    }

    await prisma.smsLog.create({
      data: {
        paymentId,
        officerPhone,
        message,
        status,
        sentAt: new Date(),
      },
    });

    return status;
  }
}

module.exports = SmsService;
