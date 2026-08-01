jest.mock('../src/config/db', () => ({
  smsLog: {
    create: jest.fn(),
  },
}));

const prisma = require('../src/config/db');
const SmsService = require('../src/services/SmsService');

describe('SmsService Integration & sms_logs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records an smsLog entry with status SUCCESS when notification succeeds', async () => {
    prisma.smsLog.create.mockResolvedValue({ id: 1 });

    const sampleFine = {
      referenceNo: 'SLP-2026-999999',
      amount: 2500,
    };

    const status = await SmsService.notifyOfficerOfPayment({
      paymentId: 10,
      officerPhone: '+94711234567',
      fine: sampleFine,
    });

    expect(status).toBe('SUCCESS');
    expect(prisma.smsLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.smsLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: 10,
        officerPhone: '+94711234567',
        message: 'Receipt confirmation for Ref SLP-2026-999999. Value: LKR 2500. Status: Ok.',
        status: 'SUCCESS',
        sentAt: expect.any(Date),
      }),
    });
  });

  it('records an smsLog entry with status FAILED when SMS dispatch throws an error', async () => {
    prisma.smsLog.create.mockResolvedValue({ id: 2 });
    const sendSpy = jest.spyOn(SmsService, 'send').mockRejectedValueOnce(new Error('Network error'));

    const sampleFine = {
      referenceNo: 'SLP-2026-888888',
      amount: 5000,
    };

    const status = await SmsService.notifyOfficerOfPayment({
      paymentId: 11,
      officerPhone: '+94711234567',
      fine: sampleFine,
    });

    expect(status).toBe('FAILED');
    expect(prisma.smsLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.smsLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: 11,
        officerPhone: '+94711234567',
        status: 'FAILED',
      }),
    });

    sendSpy.mockRestore();
  });

  it('returns mock SID when provider is mock', async () => {
    const res = await SmsService.send('+94711234567', 'Test message');
    expect(res).toEqual({ sid: 'mock_sid_success' });
  });
});
