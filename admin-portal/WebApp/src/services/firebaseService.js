/**
 * NTFMS Admin Portal — Firestore Service Layer
 *
 * Provides full CRUD for fines and categories via Firestore.
 * Shared database with Driver Web Portal and Mobile App.
 *
 * Collections:
 *   fines       — Traffic fine records (doc ID = refNo, e.g. "SLP-2026-9812")
 *   categories  — Fine category definitions (doc ID = "CAT-01" … "CAT-09")
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const finesCol      = collection(db, 'fines');
const categoriesCol = collection(db, 'categories');

// ── Helpers ───────────────────────────────────────────────────────

function normaliseDate(val) {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return null;
}

function normaliseFine(id, data) {
  return {
    ...data,
    refNo:    id,   // ensure refNo is always present
    issuedAt: normaliseDate(data.issuedAt),
    paidAt:   normaliseDate(data.paidAt),
  };
}

function prepareWrite(fineObj) {
  const { refNo, ...rest } = fineObj;
  return {
    ...rest,
    issuedAt: rest.issuedAt ? Timestamp.fromDate(new Date(rest.issuedAt)) : Timestamp.now(),
    paidAt:   rest.paidAt   ? Timestamp.fromDate(new Date(rest.paidAt))   : null,
  };
}

// ── Fines ─────────────────────────────────────────────────────────

/**
 * Fetch all fines ordered by issuedAt descending.
 * @returns {Array} Array of normalised fine objects
 */
export async function getAllFines() {
  const q    = query(finesCol, orderBy('issuedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => normaliseFine(d.id, d.data()));
}

/**
 * Fetch a single fine by its reference number.
 * @returns {object|null}
 */
export async function getFine(refNo) {
  const snap = await getDoc(doc(finesCol, refNo));
  if (!snap.exists()) return null;
  return normaliseFine(snap.id, snap.data());
}

/**
 * Create a new fine in Firestore.
 * Uses refNo as the document ID so lookups are O(1).
 * @param {object} fineData  — Must include `refNo`
 */
export async function createFine(fineData) {
  const { refNo } = fineData;
  if (!refNo) throw new Error('refNo is required when creating a fine');
  await setDoc(doc(finesCol, refNo), prepareWrite(fineData));
  return fineData;
}

/**
 * Update specific fields on an existing fine.
 * @param {string} refNo
 * @param {object} updates  — Partial fine object (any fields to change)
 */
export async function updateFine(refNo, updates) {
  const fineRef = doc(finesCol, refNo);

  // Convert date strings to Timestamps if present
  const prepared = { ...updates };
  if (prepared.issuedAt) prepared.issuedAt = Timestamp.fromDate(new Date(prepared.issuedAt));
  if (prepared.paidAt)   prepared.paidAt   = Timestamp.fromDate(new Date(prepared.paidAt));

  await updateDoc(fineRef, prepared);
}

/**
 * Delete a fine from Firestore.
 * @param {string} refNo
 */
export async function deleteFine(refNo) {
  await deleteDoc(doc(finesCol, refNo));
}

// ── Categories ────────────────────────────────────────────────────

/**
 * Fetch all fine categories.
 * @returns {Array} Array of category objects
 */
export async function getCategories() {
  const snap = await getDocs(categoriesCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Add a new fine category.
 * @param {object} categoryData  — { id, name, amount, penaltyPoints }
 */
export async function addCategory(categoryData) {
  const { id, ...rest } = categoryData;
  await setDoc(doc(categoriesCol, id), rest);
  return categoryData;
}

/**
 * Update a category's fields.
 * @param {string} catId
 * @param {object} updates
 */
export async function updateCategory(catId, updates) {
  await updateDoc(doc(categoriesCol, catId), updates);
}

/**
 * Delete a category.
 * @param {string} catId
 */
export async function deleteCategory(catId) {
  await deleteDoc(doc(categoriesCol, catId));
}
