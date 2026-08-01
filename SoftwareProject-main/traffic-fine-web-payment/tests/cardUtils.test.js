import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatCardNumber, formatExpiryDate, isExpiryInFuture, formatCvv, formatPhone } from '../src/utils/cardUtils';

describe('formatCardNumber', () => {
  it('groups digits in blocks of 4', () => {
    expect(formatCardNumber('4111222233334444')).toBe('4111 2222 3333 4444');
  });

  it('strips non-digit characters', () => {
    expect(formatCardNumber('4111-2222 3333/4444')).toBe('4111 2222 3333 4444');
  });

  it('caps at 19 digits', () => {
    expect(formatCardNumber('1'.repeat(30)).replace(/\s/g, '')).toHaveLength(19);
  });
});

describe('formatExpiryDate', () => {
  it('inserts a slash after the month', () => {
    expect(formatExpiryDate('1230')).toBe('12/30');
  });

  it('does not insert a slash for 2 or fewer digits', () => {
    expect(formatExpiryDate('1')).toBe('1');
    expect(formatExpiryDate('12')).toBe('12');
  });
});

describe('isExpiryInFuture', () => {
  const fixedNow = new Date('2026-07-19T00:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a future expiry date', () => {
    expect(isExpiryInFuture('12/30')).toBe(true);
  });

  it('rejects a past expiry date', () => {
    expect(isExpiryInFuture('01/20')).toBe(false);
  });

  it('rejects a malformed value', () => {
    expect(isExpiryInFuture('13/30')).toBe(false);
    expect(isExpiryInFuture('abcd')).toBe(false);
  });
});

describe('formatCvv', () => {
  it('keeps only up to 4 digits', () => {
    expect(formatCvv('12a3b45')).toBe('1234');
  });
});

describe('formatPhone', () => {
  it('keeps digits and a leading plus sign', () => {
    expect(formatPhone('+94 77-123 4567')).toBe('+94771234567');
  });
});
