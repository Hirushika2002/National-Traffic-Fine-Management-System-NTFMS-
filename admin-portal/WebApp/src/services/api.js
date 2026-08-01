/**
 * NTFMS Admin Portal — API Service Layer
 *
 * All data operations use Firebase Firestore via firebaseService.js.
 * Authentication is handled separately by authService.js (Firebase Auth).
 *
 * Analytics helpers (getDashboardMetrics, getDistrictWiseCollections, etc.)
 * remain pure JS functions that operate on the fetched fines array.
 */

import {
  getAllFines      as fbGetAllFines,
  getFine         as fbGetFine,
  createFine      as fbCreateFine,
  updateFine      as fbUpdateFine,
  deleteFine      as fbDeleteFine,
  getCategories   as fbGetCategories,
  addCategory     as fbAddCategory,
  updateCategory  as fbUpdateCategory,
  deleteCategory  as fbDeleteCategory,
} from './firebaseService';


// ── 25 Districts of Sri Lanka ──────────────────────────────────
export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Mannar', 'Vavuniya',
  'Mullaitivu', 'Kilinochchi', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

// ── Fines & Analytics APIs ─────────────────────────────────────

export const apiService = {
  // ── Core Firestore-backed methods ─────────────────────────────

  /** Fetch all fines from Firestore (ordered by issuedAt desc). */
  getAllFines: () => fbGetAllFines(),

  /** Fetch a single fine by refNo. */
  getFine: (refNo) => fbGetFine(refNo),

  /** Get all categories from Firestore. */
  getCategories: () => fbGetCategories(),

  /**
   * Search & Filter Fines.
   * Fetches all fines from Firestore then filters client-side.
   * (For a large dataset, push filters to Firestore queries.)
   */
  getFines: async (filters = {}) => {
    let fines = await fbGetAllFines();
    const { search, district, category, status, dateRange } = filters;

    if (search) {
      const q = search.toLowerCase();
      fines = fines.filter(f =>
        f.refNo.toLowerCase().includes(q) ||
        f.driverLicense.toLowerCase().includes(q) ||
        f.driverName.toLowerCase().includes(q) ||
        f.vehicleNo.toLowerCase().includes(q) ||
        f.officerId.toLowerCase().includes(q)
      );
    }

    if (district) fines = fines.filter(f => f.district === district);
    if (category) fines = fines.filter(f => f.category === category);
    if (status)   fines = fines.filter(f => f.status   === status);

    if (dateRange?.start) {
      const start = new Date(dateRange.start);
      fines = fines.filter(f => new Date(f.issuedAt) >= start);
    }

    if (dateRange?.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      fines = fines.filter(f => new Date(f.issuedAt) <= end);
    }

    return fines.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  },

  /** Pay a fine from the Admin Portal (marks as Paid in Firestore). */
  payFine: async (refNo, _paymentDetails) => {
    await fbUpdateFine(refNo, {
      status:        'Paid',
      paymentMethod: 'Web Portal',
      paidAt:        new Date().toISOString(),
      smsSent:       true,
    });
    const fine = await fbGetFine(refNo);

    const message =
      `[NTFMS CONFIRMATION] Fine Ref ${refNo} for License ${fine.driverLicense} ` +
      `has been SETTLED successfully via Web Portal. You may return the driving license to the motorist.`;
    console.log(
      `%c[SMS TRANSMITTED] To: ${fine.officerName} (${fine.officerPhone})\nMessage: ${message}`,
      'background: #002244; color: #d4af37; padding: 6px; font-weight: bold; border-radius: 4px;'
    );

    return { success: true, smsReceipt: { to: fine.officerPhone, officer: fine.officerName, message, timestamp: new Date().toISOString() }, fine };
  },

  /**
   * Issue a new fine (from Admin Portal / mobile officer).
   * Writes the new document to Firestore.
   */
  issueFine: async (fineData) => {
    const categories = await fbGetCategories();
    const cat = categories.find(c => c.id === fineData.category);
    if (!cat) throw new Error('Invalid Traffic Fine Category.');

    const refNo = `SLP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newFine = {
      refNo,
      category:      fineData.category,
      amount:        cat.amount,
      driverName:    fineData.driverName,
      driverLicense: fineData.driverLicense,
      vehicleNo:     fineData.vehicleNo,
      officerId:     fineData.officerId    || 'OF-8821',
      officerName:   fineData.officerName  || 'Sgt. Bandara',
      officerPhone:  fineData.officerPhone || '+94771234567',
      district:      fineData.district,
      location:      fineData.location     || `${fineData.district} Patrol Area`,
      issuedAt:      new Date().toISOString(),
      status:        fineData.status       || 'Pending',
      paymentMethod: fineData.status === 'Paid' ? 'Mobile App' : null,
      paidAt:        fineData.status === 'Paid' ? new Date().toISOString() : null,
      smsSent:       fineData.status === 'Paid',
    };

    await fbCreateFine(newFine);

    if (newFine.status === 'Paid') {
      const msg = `[NTFMS CONFIRMATION] On-the-spot Payment Successful. Fine Ref ${refNo} for License ${newFine.driverLicense} settled. Return license immediately.`;
      console.log(`%c[SMS TRANSMITTED] To: ${newFine.officerName} (${newFine.officerPhone})\nMessage: ${msg}`, 'background: #002244; color: #10b981; padding: 6px; font-weight: bold; border-radius: 4px;');
    }

    return newFine;
  },

  /** Update any fields on a fine. */
  updateFine: (refNo, updates) => fbUpdateFine(refNo, updates),

  /** Delete a fine. */
  deleteFine: (refNo) => fbDeleteFine(refNo),

  /** Add a new fine category to Firestore. */
  addCategory: async (catData) => {
    const categories = await fbGetCategories();
    if (categories.some(c => c.id === catData.id)) {
      throw new Error(`Category ID ${catData.id} already exists.`);
    }
    const newCat = {
      id:            catData.id.toUpperCase(),
      name:          catData.name,
      amount:        parseFloat(catData.amount),
      penaltyPoints: parseInt(catData.penaltyPoints) || 0,
    };
    await fbAddCategory(newCat);
    return newCat;
  },

  /** Delete a fine category from Firestore. */
  deleteCategory: (catId) => fbDeleteCategory(catId),

  // ── Aggregate Analytics Helpers for Dashboard ─────────────────
  // These are pure JS — they operate on the fines array returned from Firestore.

  getDashboardMetrics: async () => {
    const fines = await fbGetAllFines();

    let totalCollected = 0, totalPending = 0;
    let paidCount = 0, pendingCount = 0, overdueCount = 0;

    fines.forEach(f => {
      if (f.status === 'Paid') {
        totalCollected += f.amount;
        paidCount++;
      } else if (f.status === 'Pending') {
        totalPending += f.amount;
        pendingCount++;
      } else if (f.status === 'Overdue') {
        totalPending += f.amount;
        overdueCount++;
      }
    });

    const total          = fines.length;
    const collectionRate = total > 0 ? ((paidCount / total) * 100).toFixed(1) : 0;

    return { totalCollected, totalPending, totalFinesCount: total, paidCount, pendingCount, overdueCount, collectionRate };
  },

  getDistrictWiseCollections: async () => {
    const fines = await fbGetAllFines();
    const dict  = {};

    DISTRICTS.forEach(d => { dict[d] = { district: d, collected: 0, count: 0, totalAmount: 0 }; });

    fines.forEach(f => {
      const dObj = dict[f.district] || { district: f.district, collected: 0, count: 0, totalAmount: 0 };
      dObj.count++;
      dObj.totalAmount += f.amount;
      if (f.status === 'Paid') dObj.collected += f.amount;
      dict[f.district] = dObj;
    });

    return Object.values(dict).sort((a, b) => b.collected - a.collected);
  },

  getCategoryBreakdown: async () => {
    const fines      = await fbGetAllFines();
    const categories = await fbGetCategories();
    const catMap     = {};

    categories.forEach(c => { catMap[c.id] = { id: c.id, name: c.name, collected: 0, count: 0, totalAmount: 0 }; });

    fines.forEach(f => {
      let cObj = catMap[f.category];
      if (!cObj) { cObj = { id: f.category, name: 'Other Violations', collected: 0, count: 0, totalAmount: 0 }; catMap[f.category] = cObj; }
      cObj.count++;
      cObj.totalAmount += f.amount;
      if (f.status === 'Paid') cObj.collected += f.amount;
    });

    return Object.values(catMap).sort((a, b) => b.collected - a.collected);
  },

  getMonthlyTrend: async () => {
    const fines  = await fbGetAllFines();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    // Pre-seed Mar–Jun 2026
    const currentYear = 2026;
    for (let m = 2; m <= 5; m++) {
      const key = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
      monthlyMap[key] = { name: `${months[m]} ${currentYear}`, collected: 0, tickets: 0 };
    }

    fines.forEach(f => {
      const date = new Date(f.issuedAt);
      if (isNaN(date)) return;
      const y   = date.getFullYear();
      const mIdx = date.getMonth();
      const key  = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { name: `${months[mIdx]} ${y}`, collected: 0, tickets: 0 };
      monthlyMap[key].tickets++;
      if (f.status === 'Paid') monthlyMap[key].collected += f.amount;
    });

    return Object.keys(monthlyMap).sort().map(k => monthlyMap[k]);
  },
};
