/**
 * NTFMS Driver Portal — API Service Layer
 *
 * Data operations are delegated to Firestore via firebaseService.js.
 * All three apps (Admin Web, Driver Web, Mobile) share the same
 * Firebase project so data is live and consistent across platforms.
 *
 * Card validation helpers (Luhn, expiry, formatters) remain here
 * as they are pure JS utilities with no backend dependency.
 */

import {
  lookupFine    as fbLookupFine,
  markFinePaid  as fbMarkFinePaid,
  getCategories as fbGetCategories,
} from './firebaseService';

// ── 25 Districts of Sri Lanka ──────────────────────────────────
export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Mannar', 'Vavuniya',
  'Mullaitivu', 'Kilinochchi', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

// ── Luhn Algorithm — Credit Card Validation ────────────────────
export const luhnValidate = (cardNumber) => {
  const digits = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
};

// ── Detect Card Type by Number ─────────────────────────────────
export const detectCardType = (number) => {
  const cleaned = number.replace(/\s+/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return 'unknown';
};

// ── Format Card Number with Spaces ─────────────────────────────
export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

// ── Format Expiry MM/YY ────────────────────────────────────────
export const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 2) + ' / ' + cleaned.slice(2);
  }
  return cleaned;
};

// ── Validate Expiry ────────────────────────────────────────────
export const validateExpiry = (expiry) => {
  const cleaned = expiry.replace(/\s+/g, '').replace('/', '');
  if (cleaned.length !== 4) return false;

  const month = parseInt(cleaned.slice(0, 2), 10);
  const year  = parseInt('20' + cleaned.slice(2), 10);

  if (month < 1 || month > 12) return false;

  const now     = new Date();
  const expDate = new Date(year, month); // First day of NEXT month
  return expDate > now;
};

// ══════════════════════════════════════════════════════════════
//  PUBLIC API SERVICE
// ══════════════════════════════════════════════════════════════

export const apiService = {
  /**
   * Look up a fine by reference number and category ID.
   * Delegates to Firestore — GET /fines/{refNo} equivalent.
   */
  lookupFine: async (referenceNumber, categoryId) => {
    return fbLookupFine(referenceNumber, categoryId);
  },

  /**
   * Process payment for a fine.
   * Validates card client-side, then marks fine as Paid in Firestore.
   */
  processPayment: async (refNo, cardDetails) => {
    // Validate card with Luhn
    const cleanCard = cardDetails.cardNumber.replace(/\s+/g, '');
    if (!luhnValidate(cleanCard)) {
      throw {
        code: 400,
        message: 'Invalid card number. Please check your card details and try again.',
      };
    }

    // Validate expiry
    if (!validateExpiry(cardDetails.expiry)) {
      throw {
        code: 400,
        message: 'Card has expired or expiry date is invalid.',
      };
    }

    // Mark fine as Paid in Firestore
    const fine = await fbMarkFinePaid(refNo, 'Web Portal');

    // Generate confirmation identifiers
    const confirmationNumber = `CONF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId      = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    // Simulate SMS notification to traffic police officer
    const smsMessage =
      `[NTFMS CONFIRMATION] Fine Ref ${fine.refNo} for License ${fine.driverLicense} ` +
      `has been SETTLED successfully via Web Portal. You may return the driving license to the motorist.`;

    console.log(
      `%c[SMS TRANSMITTED] To: ${fine.officerName} (${fine.officerPhone})\nMessage: ${smsMessage}`,
      'background: #002244; color: #d4af37; padding: 8px; font-weight: bold; border-radius: 4px;'
    );

    return {
      success: true,
      confirmationNumber,
      transactionId,
      paidAt:  fine.paidAt,
      amount:  fine.amount,
      smsReceipt: {
        to:        fine.officerPhone,
        officer:   fine.officerName,
        message:   smsMessage,
        timestamp: new Date().toISOString(),
        status:    'delivered',
      },
      fine,
    };
  },

  /**
   * Get all fine categories from Firestore.
   */
  getCategories: () => fbGetCategories(),
};
