/**
 * NTFMS Driver Portal — API Service Layer
 * 
 * Shares the same localStorage keys as the Admin Portal so that
 * payments processed here are immediately visible in the admin dashboard.
 * 
 * When a real backend is deployed, replace localStorage calls with
 * fetch() requests to the REST API endpoints.
 */

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

// ── Initial Fine Categories ────────────────────────────────────
const INITIAL_CATEGORIES = [
  { id: 'CAT-01', name: 'Speeding', amount: 3000, penaltyPoints: 3 },
  { id: 'CAT-02', name: 'Reckless Driving', amount: 5000, penaltyPoints: 5 },
  { id: 'CAT-03', name: 'Drunk Driving', amount: 10000, penaltyPoints: 8 },
  { id: 'CAT-04', name: 'No Valid Driving License', amount: 8000, penaltyPoints: 0 },
  { id: 'CAT-05', name: 'Traffic Light Violation', amount: 2500, penaltyPoints: 2 },
  { id: 'CAT-06', name: 'Wrong-way Driving', amount: 3000, penaltyPoints: 3 },
  { id: 'CAT-07', name: 'Seatbelt Violation', amount: 1500, penaltyPoints: 1 },
  { id: 'CAT-08', name: 'Mobile Phone Use While Driving', amount: 4000, penaltyPoints: 4 },
  { id: 'CAT-09', name: 'Invalid Insurance/Revenue License', amount: 5000, penaltyPoints: 0 }
];

// ── Seed Data ──────────────────────────────────────────────────
const SEED_FINES = [
  {
    refNo: 'SLP-2026-9812',
    category: 'CAT-01',
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
    refNo: 'SLP-2026-9813',
    category: 'CAT-03',
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
    refNo: 'SLP-2026-9814',
    category: 'CAT-02',
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
    refNo: 'SLP-2026-9815',
    category: 'CAT-05',
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
    refNo: 'SLP-2026-9816',
    category: 'CAT-07',
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
    refNo: 'SLP-2026-9817',
    category: 'CAT-08',
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
  },
  {
    refNo: 'SLP-2026-9818',
    category: 'CAT-01',
    amount: 3000,
    driverName: 'Kasun Rathnayake',
    driverLicense: 'B6677882',
    vehicleNo: 'CP-CAD-7890',
    officerId: 'OF-2341',
    officerName: 'Sgt. Jayawardene',
    officerPhone: '+94723344556',
    district: 'Matale',
    location: 'Kandy Road, Matale',
    issuedAt: '2026-06-12T16:50:00Z',
    status: 'Paid',
    paymentMethod: 'Mobile App',
    paidAt: '2026-06-12T16:52:00Z',
    smsSent: true
  },
  {
    refNo: 'SLP-2026-9819',
    category: 'CAT-06',
    amount: 3000,
    driverName: 'Saman Edirisinghe',
    driverLicense: 'B4433119',
    vehicleNo: 'SG-KX-5678',
    officerId: 'OF-9011',
    officerName: 'Sgt. Rathnayake',
    officerPhone: '+94759900112',
    district: 'Ratnapura',
    location: 'Colombo Rd, Ratnapura',
    issuedAt: '2026-06-09T09:30:00Z',
    status: 'Paid',
    paymentMethod: 'Web Portal',
    paidAt: '2026-06-10T10:15:00Z',
    smsSent: true
  },
  {
    refNo: 'SLP-2026-9820',
    category: 'CAT-04',
    amount: 8000,
    driverName: 'Devinda Alwis',
    driverLicense: 'B3388441',
    vehicleNo: 'WP-LH-2211',
    officerId: 'OF-1022',
    officerName: 'IP. Senanayake',
    officerPhone: '+94775566778',
    district: 'Kurunegala',
    location: 'Dambulla Rd, Kurunegala',
    issuedAt: '2026-06-05T15:20:00Z',
    status: 'Overdue',
    paymentMethod: null,
    paidAt: null,
    smsSent: false
  },
  {
    refNo: 'SLP-2026-9821',
    category: 'CAT-02',
    amount: 5000,
    driverName: 'Nuwan Samaranayake',
    driverLicense: 'B8844220',
    vehicleNo: 'WP-PA-8822',
    officerId: 'OF-8821',
    officerName: 'Sgt. Bandara',
    officerPhone: '+94771234567',
    district: 'Colombo',
    location: 'Borella Junction, Colombo 08',
    issuedAt: '2026-06-13T18:30:00Z',
    status: 'Pending',
    paymentMethod: null,
    paidAt: null,
    smsSent: false
  },
  {
    refNo: 'SLP-2026-9822',
    category: 'CAT-09',
    amount: 5000,
    driverName: 'Chathura Gunawardena',
    driverLicense: 'B6622110',
    vehicleNo: 'UP-LD-4422',
    officerId: 'OF-7788',
    officerName: 'Sgt. Herath',
    officerPhone: '+94711122233',
    district: 'Badulla',
    location: 'Passara Rd, Badulla',
    issuedAt: '2026-06-11T11:45:00Z',
    status: 'Paid',
    paymentMethod: 'Web Portal',
    paidAt: '2026-06-12T14:30:00Z',
    smsSent: true
  },
  {
    refNo: 'SLP-2026-9823',
    category: 'CAT-01',
    amount: 3000,
    driverName: 'Nisansala Jayasinghe',
    driverLicense: 'B9090123',
    vehicleNo: 'WP-CBA-1122',
    officerId: 'OF-5566',
    officerName: 'Sgt. Fernando',
    officerPhone: '+94778899100',
    district: 'Gampaha',
    location: 'Kadawatha Expressway Exit',
    issuedAt: '2026-06-13T14:15:00Z',
    status: 'Paid',
    paymentMethod: 'Mobile App',
    paidAt: '2026-06-13T14:17:00Z',
    smsSent: true
  }
];

// ── Generate Historical Fines (matching admin portal logic) ────
const generateHistoricalFines = () => {
  const fines = [];
  const startDay = new Date('2026-03-01T00:00:00Z');
  const endDay = new Date('2026-06-09T23:59:59Z');
  const diffTime = Math.abs(endDay - startDay);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const names = ['Ravi', 'Tharindu', 'Shenal', 'Mahela', 'Kusal', 'Kavindi', 'Dilshan', 'Jehan', 'Ruwan', 'Dinuka', 'Shalini', 'Ashok'];
  const lastnames = ['Silva', 'Fernando', 'Wickramasinghe', 'Gunarathne', 'Dissanayake', 'Alwis', 'Bandara', 'Perera', 'Jayasekara', 'Cooray'];
  const vehicles = ['WP-CAR-1234', 'WP-CAD-8899', 'WP-PE-4455', 'CP-CAB-1020', 'SP-KX-4829', 'WP-LL-9921', 'NP-CAS-1122', 'EP-LD-8891'];

  const officers = [
    { id: 'OF-8821', name: 'Sgt. Bandara', phone: '+94771234567' },
    { id: 'OF-1092', name: 'IP. Wijesinghe', phone: '+94719876543' },
    { id: 'OF-3401', name: 'IP. Kumara', phone: '+94701122334' },
    { id: 'OF-5566', name: 'Sgt. Fernando', phone: '+94778899100' }
  ];

  for (let i = 0; i < 50; i++) {
    const randomDayOffset = Math.floor(Math.random() * diffDays);
    const issueDate = new Date(startDay.getTime() + randomDayOffset * 24 * 60 * 60 * 1000 + Math.random() * 12 * 60 * 60 * 1000);
    const cat = INITIAL_CATEGORIES[Math.floor(Math.random() * INITIAL_CATEGORIES.length)];
    const district = DISTRICTS[Math.floor(Math.random() * 8)];
    const driver = `${names[Math.floor(Math.random() * names.length)]} ${lastnames[Math.floor(Math.random() * lastnames.length)]}`;
    const license = 'B' + Math.floor(10000000 + Math.random() * 90000000);
    const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const officer = officers[Math.floor(Math.random() * officers.length)];

    const isPaid = Math.random() > 0.15;
    const isOverdue = !isPaid && (new Date() - issueDate > 14 * 24 * 60 * 60 * 1000);
    const status = isPaid ? 'Paid' : (isOverdue ? 'Overdue' : 'Pending');

    const paymentMethod = isPaid ? (Math.random() > 0.4 ? 'Web Portal' : 'Mobile App') : null;
    const paidAt = isPaid ? new Date(issueDate.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString() : null;

    fines.push({
      refNo: `SLP-2026-${1000 + i}`,
      category: cat.id,
      amount: cat.amount,
      driverName: driver,
      driverLicense: license,
      vehicleNo: vehicle,
      officerId: officer.id,
      officerName: officer.name,
      officerPhone: officer.phone,
      district,
      location: `${district} Town Area`,
      issuedAt: issueDate.toISOString(),
      status,
      paymentMethod,
      paidAt,
      smsSent: isPaid
    });
  }

  return fines;
};

// ── Initialize Database (seeds if empty) ───────────────────────
const initializeDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEY_FINES)) {
    const baseFines = [...SEED_FINES];
    const historicalFines = generateHistoricalFines();
    localStorage.setItem(STORAGE_KEY_FINES, JSON.stringify([...baseFines, ...historicalFines]));
  }
};

// Execute on import
initializeDatabase();

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
  const year = parseInt('20' + cleaned.slice(2), 10);
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const expDate = new Date(year, month); // First day of NEXT month
  return expDate > now;
};

// ══════════════════════════════════════════════════════════════
//  PUBLIC API SERVICE
// ══════════════════════════════════════════════════════════════

export const apiService = {
  /**
   * Look up a fine by reference number and category ID.
   * Simulates GET /api/fines?referenceNumber=X&categoryId=Y
   */
  lookupFine: async (referenceNumber, categoryId) => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const fines = JSON.parse(localStorage.getItem(STORAGE_KEY_FINES)) || [];
    const refUpper = referenceNumber.trim().toUpperCase();
    const catUpper = categoryId.trim().toUpperCase();

    const fine = fines.find(
      f => f.refNo.toUpperCase() === refUpper && f.category.toUpperCase() === catUpper
    );

    if (!fine) {
      throw {
        code: 404,
        message: 'Fine not found. Please verify the Reference Number and Category ID from your fine sheet and try again.'
      };
    }

    // Resolve category name
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES)) || [];
    const cat = categories.find(c => c.id === fine.category);

    return {
      ...fine,
      categoryName: cat ? cat.name : 'Unknown Category',
      penaltyPoints: cat ? cat.penaltyPoints : 0
    };
  },

  /**
   * Process payment for a fine.
   * Simulates POST /api/payments
   */
  processPayment: async (refNo, cardDetails) => {
    // Simulate bank processing latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const fines = JSON.parse(localStorage.getItem(STORAGE_KEY_FINES)) || [];
    const idx = fines.findIndex(f => f.refNo === refNo);

    if (idx === -1) {
      throw {
        code: 404,
        message: `Fine reference ${refNo} not found in the national register.`
      };
    }

    if (fines[idx].status === 'Paid') {
      throw {
        code: 409,
        message: `Fine ${refNo} has already been settled. No duplicate payment is required.`
      };
    }

    // Validate card with Luhn
    const cleanCard = cardDetails.cardNumber.replace(/\s+/g, '');
    if (!luhnValidate(cleanCard)) {
      throw {
        code: 400,
        message: 'Invalid card number. Please check your card details and try again.'
      };
    }

    // Validate expiry
    if (!validateExpiry(cardDetails.expiry)) {
      throw {
        code: 400,
        message: 'Card has expired or expiry date is invalid.'
      };
    }

    // Update fine status in localStorage
    fines[idx].status = 'Paid';
    fines[idx].paymentMethod = 'Web Portal';
    fines[idx].paidAt = new Date().toISOString();
    fines[idx].smsSent = true;

    localStorage.setItem(STORAGE_KEY_FINES, JSON.stringify(fines));

    // Generate confirmation details
    const confirmationNumber = `CONF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    // Simulate SMS to traffic police officer
    const fine = fines[idx];
    const smsMessage = `[NTFMS CONFIRMATION] Fine Ref ${fine.refNo} for License ${fine.driverLicense} has been SETTLED successfully via Web Portal. You may return the driving license to the motorist.`;

    console.log(
      `%c[SMS TRANSMITTED] To: ${fine.officerName} (${fine.officerPhone})\nMessage: ${smsMessage}`,
      'background: #002244; color: #d4af37; padding: 8px; font-weight: bold; border-radius: 4px;'
    );

    return {
      success: true,
      confirmationNumber,
      transactionId,
      paidAt: fine.paidAt,
      amount: fine.amount,
      smsReceipt: {
        to: fine.officerPhone,
        officer: fine.officerName,
        message: smsMessage,
        timestamp: new Date().toISOString(),
        status: 'delivered'
      },
      fine
    };
  },

  /**
   * Get all fine categories
   */
  getCategories: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES)) || [];
  }
};
