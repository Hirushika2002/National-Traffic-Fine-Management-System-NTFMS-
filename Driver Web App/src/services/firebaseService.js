/**
 * NTFMS Driver Portal — Firestore Service Layer
 *
 * Replaces localStorage calls with Firestore operations.
 * The Admin Web Portal and Mobile App use the same collections,
 * so all three apps share live data automatically.
 *
 * Collections:
 *   fines       — Traffic fine records (doc ID = refNo)
 *   categories  — Fine category definitions (doc ID = category ID)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

const finesCol      = collection(db, 'fines');
const categoriesCol = collection(db, 'categories');

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Convert a Firestore Timestamp (or ISO string) to a JS Date ISO string.
 * Falls back to null gracefully.
 */
function normaliseDate(val) {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return null;
}

/**
 * Normalise a raw Firestore fine document so downstream components
 * receive plain JS objects with ISO date strings (same shape as before).
 */
function normaliseFine(data) {
  return {
    ...data,
    issuedAt: normaliseDate(data.issuedAt),
    paidAt:   normaliseDate(data.paidAt),
  };
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Look up a fine by reference number AND category ID.
 * Returns the fine document enriched with category name & penalty points.
 * Throws a structured error if not found.
 */
export async function lookupFine(referenceNumber, categoryId) {
  const refUpper = referenceNumber.trim().toUpperCase();
  const catUpper = categoryId.trim().toUpperCase();

  // Fine doc ID = refNo (set during seeding)
  const fineRef  = doc(finesCol, refUpper);
  const fineSnap = await getDoc(fineRef);

  if (!fineSnap.exists()) {
    throw {
      code: 404,
      message:
        'Fine not found. Please verify the Reference Number and Category ID from your fine sheet and try again.',
    };
  }

  const fineData = fineSnap.data();

  // Verify category matches
  if (fineData.category.toUpperCase() !== catUpper) {
    throw {
      code: 404,
      message:
        'Fine not found. Please verify the Reference Number and Category ID from your fine sheet and try again.',
    };
  }

  // Fetch category details for name + penaltyPoints
  const catRef  = doc(categoriesCol, fineData.category);
  const catSnap = await getDoc(catRef);
  const catData = catSnap.exists() ? catSnap.data() : {};

  return {
    ...normaliseFine(fineData),
    categoryName:  catData.name          ?? 'Unknown Category',
    penaltyPoints: catData.penaltyPoints ?? 0,
  };
}

/**
 * Mark a fine as Paid in Firestore.
 * Called after card validation succeeds in api.js.
 *
 * @param {string} refNo  — Fine reference number (e.g. "SLP-2026-9814")
 * @param {string} method — Payment method label ("Web Portal")
 * @returns {object} Updated fine data
 */
export async function markFinePaid(refNo, method = 'Web Portal') {
  const fineRef  = doc(finesCol, refNo);
  const fineSnap = await getDoc(fineRef);

  if (!fineSnap.exists()) {
    throw { code: 404, message: `Fine reference ${refNo} not found in the national register.` };
  }

  const fineData = fineSnap.data();

  if (fineData.status === 'Paid') {
    throw { code: 409, message: `Fine ${refNo} has already been settled. No duplicate payment is required.` };
  }

  const paidAt = Timestamp.now();

  await updateDoc(fineRef, {
    status:        'Paid',
    paymentMethod: method,
    paidAt,
    smsSent:       true,
  });

  return normaliseFine({
    ...fineData,
    status:        'Paid',
    paymentMethod: method,
    paidAt,
    smsSent:       true,
  });
}

/**
 * Fetch all fine categories.
 * @returns {Array} Array of category objects
 */
export async function getCategories() {
  const snap = await getDocs(categoriesCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch all fines associated with a driver's license number.
 */
export async function getFinesByLicense(licenseNumber) {
  if (!licenseNumber || licenseNumber.trim() === '') return [];
  const q = query(finesCol, where('driverLicense', '==', licenseNumber.trim().toUpperCase()));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => {
    return {
      refNo: d.id,
      ...normaliseFine(d.data())
    };
  });
  list.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  return list;
}

