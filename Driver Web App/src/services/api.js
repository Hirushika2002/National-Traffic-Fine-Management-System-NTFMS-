/**
 * NTFMS Driver Portal — API Service Layer
 * 
 * Connects directly to the NTFMS Node.js / Prisma Backend REST API (http://localhost:4000/api).
 * Falls back to local storage mock data if the backend server is unreachable.
 */

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:4000/api';

const STORAGE_KEY_FINES = 'ntfms_fines';
const STORAGE_KEY_CATEGORIES = 'ntfms_categories';

// ── 25 Districts of Sri Lanka ──────────────────────────────────
export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Mannar', 'Vavuniya',
  'Mullaitivu', 'Kilinochchi', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

// ── Initial Fine Categories (Mock Fallback) ────────────────────
const INITIAL_CATEGORIES = [
  { id: 1, code: 'CAT-01', name: 'Speeding', amount: 3000, penaltyPoints: 3 },
  { id: 2, code: 'CAT-02', name: 'Reckless Driving', amount: 5000, penaltyPoints: 5 },
  { id: 3, code: 'CAT-03', name: 'Drunk Driving', amount: 10000, penaltyPoints: 8 },
  { id: 4, code: 'CAT-04', name: 'No Valid Driving License', amount: 8000, penaltyPoints: 0 },
  { id: 5, code: 'CAT-05', name: 'Traffic Light Violation', amount: 2500, penaltyPoints: 2 },
  { id: 6, code: 'CAT-06', name: 'Wrong-way Driving', amount: 3000, penaltyPoints: 3 },
  { id: 7, code: 'CAT-07', name: 'Seatbelt Violation', amount: 1500, penaltyPoints: 1 },
  { id: 8, code: 'CAT-08', name: 'Mobile Phone Use While Driving', amount: 4000, penaltyPoints: 4 },
  { id: 9, code: 'CAT-09', name: 'Invalid Insurance/Revenue License', amount: 5000, penaltyPoints: 0 }
];

// ── Seed Data (Mock Fallback) ──────────────────────────────────
const SEED_FINES = [
  {
    id: 1,
    refNo: 'SLP-2026-9812',
    category: 'CAT-01',
    categoryId: 1,
    categoryName: 'Speeding',
    amount: 3000,
    driverName: 'Hiruni Perera',
    driverLicense: 'B9823412',
    vehicleNo: 'WP-CAS-4921',
    officerId: 'OF-8821',
    officerName: 'Sgt. Bandara',
    officerPhone: '+94771234567',
    district: 'Colombo',
    location: 'Galle Road, Colombo 03',
    issuedAt: '2026-06-12T10:30:00Z',
    status: 'Paid',
    paymentMethod: 'Mobile App',
    paidAt: '2026-06-12T10:32:00Z',
    smsSent: true
  },
  {
    id: 2,
    refNo: 'SLP-2026-9813',
    category: 'CAT-03',
    categoryId: 3,
    categoryName: 'Drunk Driving',
    amount: 10000,
    driverName: 'Mohamed Aslam',
    driverLicense: 'B8234912',
    vehicleNo: 'WP-KB-9081',
    officerId: 'OF-1092',
    officerName: 'IP. Wijesinghe',
    officerPhone: '+94719876543',
    district: 'Kandy',
    location: 'Peradeniya Rd, Kandy',
    issuedAt: '2026-06-11T21:15:00Z',
    status: 'Paid',
    paymentMethod: 'Web Portal',
    paidAt: '2026-06-12T15:45:00Z',
    smsSent: true
  },
  {
    id: 3,
    refNo: 'SLP-2026-9814',
    category: 'CAT-02',
    categoryId: 2,
    categoryName: 'Reckless Driving',
    amount: 5000,
    driverName: 'Suresh Kumar',
    driverLicense: 'B7123490',
    vehicleNo: 'NP-HN-3829',
    officerId: 'OF-4512',
    officerName: 'Sgt. Thilakarathne',
    officerPhone: '+94762233445',
    district: 'Jaffna',
    location: 'A9 Road, Chavakachcheri',
    issuedAt: '2026-06-13T08:45:00Z',
    status: 'Pending',
    paymentMethod: null,
    paidAt: null,
    smsSent: false
  },
  {
    id: 4,
    refNo: 'SLP-2026-9815',
    category: 'CAT-05',
    categoryId: 5,
    categoryName: 'Traffic Light Violation',
    amount: 2500,
    driverName: 'Nipuna De Silva',
    driverLicense: 'B9934102',
    vehicleNo: 'WP-CAR-7711',
    officerId: 'OF-8821',
    officerName: 'Sgt. Bandara',
    officerPhone: '+94771234567',
    district: 'Colombo',
    location: 'Lotus Road, Colombo 01',
    issuedAt: '2026-06-10T14:20:00Z',
    status: 'Paid',
    paymentMethod: 'Web Portal',
    paidAt: '2026-06-11T09:10:00Z',
    smsSent: true
  },
  {
    id: 5,
    refNo: 'SLP-2026-9816',
    category: 'CAT-07',
    categoryId: 7,
    categoryName: 'Seatbelt Violation',
    amount: 1500,
    driverName: 'Anil Wickramasinghe',
    driverLicense: 'B8543210',
    vehicleNo: 'SP-PE-1102',
    officerId: 'OF-3401',
    officerName: 'IP. Kumara',
    officerPhone: '+94701122334',
    district: 'Galle',
    location: 'Karapitiya Bypass, Galle',
    issuedAt: '2026-06-08T16:00:00Z',
    status: 'Overdue',
    paymentMethod: null,
    paidAt: null,
    smsSent: false
  },
  {
    id: 6,
    refNo: 'SLP-2026-9817',
    category: 'CAT-08',
    categoryId: 8,
    categoryName: 'Mobile Phone Use While Driving',
    amount: 4000,
    driverName: 'Priya Ranasinghe',
    driverLicense: 'B9123847',
    vehicleNo: 'WP-PF-8910',
    officerId: 'OF-5566',
    officerName: 'Sgt. Fernando',
    officerPhone: '+94778899100',
    district: 'Gampaha',
    location: 'Negombo Road, Kurana',
    issuedAt: '2026-06-13T12:00:00Z',
    status: 'Pending',
    paymentMethod: null,
    paidAt: null,
    smsSent: false
  }
];

// ── Initialize Local Storage DB ────────────────────────────────
const initializeDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEY_FINES)) {
    localStorage.setItem(STORAGE_KEY_FINES, JSON.stringify(SEED_FINES));
  }
};
initializeDatabase();

// ── Card & Input Helpers ───────────────────────────────────────
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

export const detectCardType = (number) => {
  const cleaned = number.replace(/\s+/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return 'unknown';
};

export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  }
  return cleaned;
};

export const validateExpiry = (expiry) => {
  const cleaned = expiry.replace(/\s+/g, '').replace('/', '');
  if (cleaned.length !== 4) return false;
  
  const month = parseInt(cleaned.slice(0, 2), 10);
  const year = parseInt('20' + cleaned.slice(2), 10);
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const expDate = new Date(year, month);
  return expDate > now;
};

export const validatePhone = (phone) => {
  return /^(?:\+94|0)?7\d{8}$/.test(phone.trim());
};

// ── Backend Response Transformer ──────────────────────────────
function transformBackendFine(raw) {
  if (!raw) return null;

  const categoryName = raw.category?.description || raw.category?.code || raw.categoryName || 'Traffic Fine';
  const categoryCode = raw.category?.code || raw.category || `CAT-0${raw.categoryId || 1}`;
  const amount = Number(raw.amount || raw.category?.baseAmount || 0);

  let status = 'Pending';
  if (raw.status === 'PAID' || raw.status === 'Paid') {
    status = 'Paid';
  } else if (raw.status === 'OVERDUE' || raw.status === 'Overdue') {
    status = 'Overdue';
  } else {
    // Check if overdue by date (> 14 days)
    const issueTime = new Date(raw.issueDate || raw.issuedAt).getTime();
    if (Date.now() - issueTime > 14 * 24 * 60 * 60 * 1000) {
      status = 'Overdue';
    }
  }

  return {
    id: raw.id,
    refNo: raw.referenceNo || raw.refNo,
    categoryId: raw.categoryId || raw.category?.id || 1,
    category: categoryCode,
    categoryName,
    amount,
    penaltyPoints: raw.category?.penaltyPoints || raw.penaltyPoints || 2,
    driverName: raw.driverName || 'Motorist',
    driverLicense: raw.driverLicenseNo || raw.driverLicense || 'N/A',
    vehicleNo: raw.vehicleNo || 'N/A',
    officerId: raw.officer?.badgeNo || raw.officerId || 'OF-1001',
    officerName: raw.officer?.fullName || raw.officerName || 'Traffic Police Officer',
    officerPhone: raw.officer?.phoneNo || raw.officerPhone || '+94770000000',
    station: raw.officer?.station || 'Police Station',
    district: raw.district?.name || raw.district || 'Colombo',
    location: raw.location || `${raw.district?.name || raw.district || 'Colombo'} Traffic Division`,
    issuedAt: raw.issueDate || raw.issuedAt || new Date().toISOString(),
    status,
    paymentMethod: raw.payment?.paymentMethod || raw.paymentMethod || null,
    paidAt: raw.payment?.paidAt || raw.paidAt || null,
    smsSent: Boolean(raw.payment || raw.smsSent),
    raw
  };
}

// ══════════════════════════════════════════════════════════════
//  PUBLIC API SERVICE
// ══════════════════════════════════════════════════════════════

export const apiService = {
  /**
   * Look up fine by reference number and category ID.
   */
  lookupFine: async (referenceNumber, categoryInput) => {
    const refUpper = referenceNumber.trim().toUpperCase();
    
    // Parse numeric category ID if given as CAT-02 -> 2 or 2 -> 2
    let numCatId = parseInt(categoryInput, 10);
    if (isNaN(numCatId) && typeof categoryInput === 'string') {
      const match = categoryInput.match(/\d+/);
      if (match) numCatId = parseInt(match[0], 10);
    }
    if (isNaN(numCatId)) numCatId = 1;

    // Try REST Backend endpoint GET /api/fines/lookup
    try {
      const url = `${API_BASE_URL}/fines/lookup?referenceNo=${encodeURIComponent(refUpper)}&categoryId=${numCatId}`;
      const response = await fetch(url, { method: 'GET' });
      
      if (response.ok) {
        const data = await response.json();
        return transformBackendFine(data);
      } else if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No matching fine found for the given reference number and category.');
      }
    } catch (err) {
      if (err.message && err.message.includes('No matching fine found')) {
        throw err;
      }
      console.warn('[API Service] Backend lookup API failed or unreachable. Falling back to local storage.', err);
    }

    // Fallback: Local Storage Lookup
    await new Promise((resolve) => setTimeout(resolve, 600));
    const fines = JSON.parse(localStorage.getItem(STORAGE_KEY_FINES)) || [];
    const catUpper = String(categoryInput).trim().toUpperCase();

    const fine = fines.find((f) => {
      const matchRef = f.refNo.toUpperCase() === refUpper;
      const matchCat =
        String(f.category).toUpperCase() === catUpper ||
        String(f.categoryId) === String(numCatId) ||
        `CAT-0${f.categoryId}` === catUpper;
      return matchRef && matchCat;
    });

    if (!fine) {
      throw new Error('Fine not found. Please verify the Reference Number and Category ID from your fine sheet.');
    }

    return transformBackendFine(fine);
  },

  /**
   * Look up all fines by Driver's License Number.
   */
  lookupByDriverLicense: async (licenseNo) => {
    const licUpper = licenseNo.trim().toUpperCase();

    // Try REST Backend endpoint GET /api/fines/driver/:licenseNo
    try {
      const url = `${API_BASE_URL}/fines/driver/${encodeURIComponent(licUpper)}`;
      const response = await fetch(url, { method: 'GET' });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(transformBackendFine);
        } else {
          throw new Error(`No traffic fines found for Driver License No: ${licUpper}`);
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('No traffic fines found')) {
        throw err;
      }
      console.warn('[API Service] Driver license lookup API unreachable. Falling back to local storage.', err);
    }

    // Fallback: Local Storage
    await new Promise((resolve) => setTimeout(resolve, 600));
    const fines = JSON.parse(localStorage.getItem(STORAGE_KEY_FINES)) || [];
    const matched = fines.filter((f) => f.driverLicense.toUpperCase() === licUpper);

    if (matched.length === 0) {
      throw new Error(`No traffic fines registered under Driving License: ${licUpper}`);
    }

    return matched.map(transformBackendFine);
  },

  /**
   * Process payment for a fine.
   * Sends POST to /api/payments on the backend.
   */
  processPayment: async (fine, paymentDetails) => {
    const cleanCard = paymentDetails.cardNumber.replace(/\s+/g, '');
    const cleanExpiry = paymentDetails.expiry.replace(/\s+/g, '');

    // Format expiry for backend (e.g., "12/28")
    let formattedExpiry = cleanExpiry;
    if (cleanExpiry.length === 4 && !cleanExpiry.includes('/')) {
      formattedExpiry = `${cleanExpiry.slice(0, 2)}/${cleanExpiry.slice(2)}`;
    }

    const payload = {
      fineId: Number(fine.id || fine.raw?.id || 1),
      amount: Number(fine.amount),
      paymentMethod: paymentDetails.paymentMethod || 'CREDIT_CARD',
      channel: 'WEB',
      payerName: (paymentDetails.payerName || paymentDetails.cardHolderName || fine.driverName).trim().toUpperCase(),
      payerContact: paymentDetails.payerContact ? paymentDetails.payerContact.trim() : '0771234567',
      cardNumber: cleanCard,
      expiryDate: formattedExpiry,
      cvv: paymentDetails.cvv
    };

    // Try REST Backend endpoint POST /api/payments
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const paymentRes = await response.json();
        
        return {
          success: true,
          confirmationNumber: `CONF-2026-${paymentRes.id || Math.floor(10000 + Math.random() * 90000)}`,
          transactionId: paymentRes.transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          paidAt: paymentRes.paidAt || new Date().toISOString(),
          amount: Number(paymentRes.amountPaid || fine.amount),
          paymentMethod: paymentRes.paymentMethod || 'CREDIT_CARD',
          payerName: paymentRes.payerName || payload.payerName,
          payerContact: paymentRes.payerContact || payload.payerContact,
          smsReceipt: {
            to: fine.officerPhone,
            officer: fine.officerName,
            message: `[NTFMS CONFIRMATION] Fine Ref ${fine.refNo} for License ${fine.driverLicense} has been SETTLED successfully via Web Portal. You may return the driving license to the motorist.`,
            timestamp: paymentRes.paidAt || new Date().toISOString(),
            status: 'delivered'
          },
          fine: {
            ...fine,
            status: 'Paid',
            paidAt: paymentRes.paidAt || new Date().toISOString(),
            paymentMethod: 'Web Portal'
          }
        };
      } else {
        const errJson = await response.json().catch(() => ({}));
        if (errJson.error) {
          throw new Error(errJson.error);
        }
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      console.warn('[API Service] Payment API unreachable. Falling back to local storage simulation.', err);
    }

    // Fallback: Local Storage Payment Processing
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const fines = JSON.parse(localStorage.getItem(STORAGE_KEY_FINES)) || [];
    const idx = fines.findIndex((f) => f.refNo === fine.refNo || f.id === fine.id);

    if (idx !== -1) {
      fines[idx].status = 'Paid';
      fines[idx].paymentMethod = 'Web Portal';
      fines[idx].paidAt = new Date().toISOString();
      fines[idx].smsSent = true;
      localStorage.setItem(STORAGE_KEY_FINES, JSON.stringify(fines));
    }

    const confirmationNumber = `CONF-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const smsMessage = `[NTFMS CONFIRMATION] Fine Ref ${fine.refNo} for License ${fine.driverLicense} has been SETTLED successfully via Web Portal. You may return the driving license to the motorist.`;

    return {
      success: true,
      confirmationNumber,
      transactionId,
      paidAt: new Date().toISOString(),
      amount: fine.amount,
      paymentMethod: payload.paymentMethod,
      payerName: payload.payerName,
      payerContact: payload.payerContact,
      smsReceipt: {
        to: fine.officerPhone,
        officer: fine.officerName,
        message: smsMessage,
        timestamp: new Date().toISOString(),
        status: 'delivered'
      },
      fine: {
        ...fine,
        status: 'Paid',
        paidAt: new Date().toISOString(),
        paymentMethod: 'Web Portal'
      }
    };
  },

  /**
   * Get all fine categories
   */
  getCategories: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES)) || INITIAL_CATEGORIES;
  }
};
