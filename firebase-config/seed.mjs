/**
 * NTFMS Firebase Firestore — Seed Script
 *
 * Populates the Firestore database with:
 *   - 9 fine categories
 *   - 12 named seed fines
 *   - ~53 generated historical fines
 *
 * Run once:  node firebase-config/seed.mjs
 *
 * Requirements:
 *   npm install firebase   (in this directory or project root)
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

// ── Firebase Config ───────────────────────────────────────────────
const firebaseConfig = {
  apiKey: 'AIzaSyDQxa2ysMhzpPNTsbA2TKxXEFIiAETXxQQ',
  authDomain: 'ntfms2026.firebaseapp.com',
  projectId: 'ntfms2026',
  storageBucket: 'ntfms2026.firebasestorage.app',
  messagingSenderId: '395993702197',
  appId: '1:395993702197:web:01f1388c5697660784f67c',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Data Definitions ─────────────────────────────────────────────

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Mannar', 'Vavuniya',
  'Mullaitivu', 'Kilinochchi', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle',
];

const CATEGORIES = [
  { id: 'CAT-01', name: 'Speeding',                          amount: 3000,  penaltyPoints: 3 },
  { id: 'CAT-02', name: 'Reckless Driving',                  amount: 5000,  penaltyPoints: 5 },
  { id: 'CAT-03', name: 'Drunk Driving',                     amount: 10000, penaltyPoints: 8 },
  { id: 'CAT-04', name: 'No Valid Driving License',           amount: 8000,  penaltyPoints: 0 },
  { id: 'CAT-05', name: 'Traffic Light Violation',            amount: 2500,  penaltyPoints: 2 },
  { id: 'CAT-06', name: 'Wrong-way Driving',                  amount: 3000,  penaltyPoints: 3 },
  { id: 'CAT-07', name: 'Seatbelt Violation',                 amount: 1500,  penaltyPoints: 1 },
  { id: 'CAT-08', name: 'Mobile Phone Use While Driving',     amount: 4000,  penaltyPoints: 4 },
  { id: 'CAT-09', name: 'Invalid Insurance/Revenue License',  amount: 5000,  penaltyPoints: 0 },
];

const OFFICERS = [
  { id: 'OF-8821', name: 'Sgt. Bandara',        phone: '+94771234567' },
  { id: 'OF-1092', name: 'IP. Wijesinghe',       phone: '+94719876543' },
  { id: 'OF-3401', name: 'IP. Kumara',           phone: '+94701122334' },
  { id: 'OF-4512', name: 'Sgt. Thilakarathne',   phone: '+94762233445' },
  { id: 'OF-5566', name: 'Sgt. Fernando',        phone: '+94778899100' },
  { id: 'OF-7788', name: 'Sgt. Herath',          phone: '+94711122233' },
  { id: 'OF-9011', name: 'Sgt. Rathnayake',      phone: '+94759900112' },
  { id: 'OF-2341', name: 'Sgt. Jayawardene',     phone: '+94723344556' },
  { id: 'OF-1022', name: 'IP. Senanayake',       phone: '+94775566778' },
];

// Named seed fines (exact reference numbers for demo/testing)
const SEED_FINES = [
  {
    refNo: 'SLP-2026-9812', category: 'CAT-01', amount: 3000,
    driverName: 'Hiruni Perera',        driverLicense: 'B9823412', vehicleNo: 'WP-CAS-4921',
    officerId: 'OF-8821', officerName: 'Sgt. Bandara',      officerPhone: '+94771234567',
    district: 'Colombo',    location: 'Galle Road, Colombo 03',
    issuedAt: '2026-06-12T10:30:00Z',
    status: 'Paid', paymentMethod: 'Mobile App', paidAt: '2026-06-12T10:32:00Z', smsSent: true,
  },
  {
    refNo: 'SLP-2026-9813', category: 'CAT-03', amount: 10000,
    driverName: 'Mohamed Aslam',        driverLicense: 'B8234912', vehicleNo: 'WP-KB-9081',
    officerId: 'OF-1092', officerName: 'IP. Wijesinghe',    officerPhone: '+94719876543',
    district: 'Kandy',      location: 'Peradeniya Rd, Kandy',
    issuedAt: '2026-06-11T21:15:00Z',
    status: 'Paid', paymentMethod: 'Web Portal', paidAt: '2026-06-12T15:45:00Z', smsSent: true,
  },
  {
    refNo: 'SLP-2026-9814', category: 'CAT-02', amount: 5000,
    driverName: 'Suresh Kumar',         driverLicense: 'B7123490', vehicleNo: 'NP-HN-3829',
    officerId: 'OF-4512', officerName: 'Sgt. Thilakarathne',officerPhone: '+94762233445',
    district: 'Jaffna',     location: 'A9 Road, Chavakachcheri',
    issuedAt: '2026-06-13T08:45:00Z',
    status: 'Pending', paymentMethod: null, paidAt: null, smsSent: false,
  },
  {
    refNo: 'SLP-2026-9815', category: 'CAT-05', amount: 2500,
    driverName: 'Nipuna De Silva',      driverLicense: 'B9934102', vehicleNo: 'WP-CAR-7711',
    officerId: 'OF-8821', officerName: 'Sgt. Bandara',      officerPhone: '+94771234567',
    district: 'Colombo',    location: 'Lotus Road, Colombo 01',
    issuedAt: '2026-06-10T14:20:00Z',
    status: 'Paid', paymentMethod: 'Web Portal', paidAt: '2026-06-11T09:10:00Z', smsSent: true,
  },
  {
    refNo: 'SLP-2026-9816', category: 'CAT-07', amount: 1500,
    driverName: 'Anil Wickramasinghe', driverLicense: 'B8543210', vehicleNo: 'SP-PE-1102',
    officerId: 'OF-3401', officerName: 'IP. Kumara',         officerPhone: '+94701122334',
    district: 'Galle',      location: 'Karapitiya Bypass, Galle',
    issuedAt: '2026-06-08T16:00:00Z',
    status: 'Overdue', paymentMethod: null, paidAt: null, smsSent: false,
  },
  {
    refNo: 'SLP-2026-9817', category: 'CAT-08', amount: 4000,
    driverName: 'Priya Ranasinghe',    driverLicense: 'B9123847', vehicleNo: 'WP-PF-8910',
    officerId: 'OF-5566', officerName: 'Sgt. Fernando',     officerPhone: '+94778899100',
    district: 'Gampaha',    location: 'Negombo Road, Kurana',
    issuedAt: '2026-06-13T12:00:00Z',
    status: 'Pending', paymentMethod: null, paidAt: null, smsSent: false,
  },
  {
    refNo: 'SLP-2026-9818', category: 'CAT-01', amount: 3000,
    driverName: 'Kasun Rathnayake',    driverLicense: 'B6677882', vehicleNo: 'CP-CAD-7890',
    officerId: 'OF-2341', officerName: 'Sgt. Jayawardene',  officerPhone: '+94723344556',
    district: 'Matale',     location: 'Kandy Road, Matale',
    issuedAt: '2026-06-12T16:50:00Z',
    status: 'Paid', paymentMethod: 'Mobile App', paidAt: '2026-06-12T16:52:00Z', smsSent: true,
  },
  {
    refNo: 'SLP-2026-9819', category: 'CAT-06', amount: 3000,
    driverName: 'Saman Edirisinghe',   driverLicense: 'B4433119', vehicleNo: 'SG-KX-5678',
    officerId: 'OF-9011', officerName: 'Sgt. Rathnayake',   officerPhone: '+94759900112',
    district: 'Ratnapura',  location: 'Colombo Rd, Ratnapura',
    issuedAt: '2026-06-09T09:30:00Z',
    status: 'Paid', paymentMethod: 'Web Portal', paidAt: '2026-06-10T10:15:00Z', smsSent: true,
  },
  {
    refNo: 'SLP-2026-9820', category: 'CAT-04', amount: 8000,
    driverName: 'Devinda Alwis',       driverLicense: 'B3388441', vehicleNo: 'WP-LH-2211',
    officerId: 'OF-1022', officerName: 'IP. Senanayake',    officerPhone: '+94775566778',
    district: 'Kurunegala', location: 'Dambulla Rd, Kurunegala',
    issuedAt: '2026-06-05T15:20:00Z',
    status: 'Overdue', paymentMethod: null, paidAt: null, smsSent: false,
  },
  {
    refNo: 'SLP-2026-9821', category: 'CAT-02', amount: 5000,
    driverName: 'Nuwan Samaranayake',  driverLicense: 'B8844220', vehicleNo: 'WP-PA-8822',
    officerId: 'OF-8821', officerName: 'Sgt. Bandara',      officerPhone: '+94771234567',
    district: 'Colombo',    location: 'Borella Junction, Colombo 08',
    issuedAt: '2026-06-13T18:30:00Z',
    status: 'Pending', paymentMethod: null, paidAt: null, smsSent: false,
  },
  {
    refNo: 'SLP-2026-9822', category: 'CAT-09', amount: 5000,
    driverName: 'Chathura Gunawardena',driverLicense: 'B6622110', vehicleNo: 'UP-LD-4422',
    officerId: 'OF-7788', officerName: 'Sgt. Herath',       officerPhone: '+94711122233',
    district: 'Badulla',    location: 'Passara Rd, Badulla',
    issuedAt: '2026-06-11T11:45:00Z',
    status: 'Paid', paymentMethod: 'Web Portal', paidAt: '2026-06-12T14:30:00Z', smsSent: true,
  },
  {
    refNo: 'SLP-2026-9823', category: 'CAT-01', amount: 3000,
    driverName: 'Nisansala Jayasinghe',driverLicense: 'B9090123', vehicleNo: 'WP-CBA-1122',
    officerId: 'OF-5566', officerName: 'Sgt. Fernando',     officerPhone: '+94778899100',
    district: 'Gampaha',    location: 'Kadawatha Expressway Exit',
    issuedAt: '2026-06-13T14:15:00Z',
    status: 'Paid', paymentMethod: 'Mobile App', paidAt: '2026-06-13T14:17:00Z', smsSent: true,
  },
];

// ── Utility ──────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function generateHistoricalFines(count = 53) {
  const names = ['Ravi', 'Tharindu', 'Shenal', 'Mahela', 'Kusal', 'Kavindi', 'Dilshan', 'Jehan', 'Ruwan', 'Dinuka', 'Shalini', 'Ashok', 'Chamara', 'Nadeesha', 'Gayan', 'Ishara'];
  const lastnames = ['Silva', 'Fernando', 'Wickramasinghe', 'Gunarathne', 'Dissanayake', 'Alwis', 'Bandara', 'Perera', 'Jayasekara', 'Cooray', 'Senanayake', 'Herath', 'Gunasekara'];
  const vehiclePrefixes = ['WP', 'CP', 'SP', 'NP', 'EP', 'UP', 'SG'];
  const vehicleTypes = ['CAR', 'CAD', 'CAS', 'KB', 'LH', 'PA', 'PE'];
  const locations = [
    'Galle Road Junction', 'Kandy Road, Town Center', 'Expressway Exit', 'Main Street Junction',
    'Bypass Road', 'Hospital Road', 'Railway Station Road', 'Market Junction', 'Bridge Area',
    'School Zone', 'Roundabout', 'Highway Entry Point',
  ];

  const fines = [];
  const startDay = new Date('2026-03-01T00:00:00Z');
  const endDay   = new Date('2026-06-09T23:59:59Z');
  const diffMs   = endDay - startDay;

  for (let i = 0; i < count; i++) {
    const cat      = rand(CATEGORIES);
    const officer  = rand(OFFICERS);
    const district = rand(DISTRICTS);
    const prefix   = rand(vehiclePrefixes);
    const vtype    = rand(vehicleTypes);
    const vnum     = Math.floor(1000 + Math.random() * 9000);
    const driver   = `${rand(names)} ${rand(lastnames)}`;
    const license  = 'B' + Math.floor(10000000 + Math.random() * 90000000);
    const issueMs  = startDay.getTime() + Math.random() * diffMs;
    const issuedAt = new Date(issueMs);

    const isPaid   = Math.random() > 0.2;
    const ageMs    = Date.now() - issuedAt.getTime();
    const isOverdue = !isPaid && ageMs > 14 * 24 * 60 * 60 * 1000;
    const status   = isPaid ? 'Paid' : (isOverdue ? 'Overdue' : 'Pending');
    const paidAt   = isPaid ? new Date(issueMs + Math.random() * 48 * 60 * 60 * 1000) : null;
    const method   = isPaid ? (Math.random() > 0.4 ? 'Web Portal' : 'Mobile App') : null;

    fines.push({
      refNo:        `SLP-2026-${1000 + i}`,
      category:     cat.id,
      amount:       cat.amount,
      driverName:   driver,
      driverLicense:license,
      vehicleNo:    `${prefix}-${vtype}-${vnum}`,
      officerId:    officer.id,
      officerName:  officer.name,
      officerPhone: officer.phone,
      district,
      location:     `${rand(locations)}, ${district}`,
      issuedAt:     issuedAt.toISOString(),
      status,
      paymentMethod:method,
      paidAt:       paidAt ? paidAt.toISOString() : null,
      smsSent:      isPaid,
    });
  }

  return fines;
}

// ── Helpers ───────────────────────────────────────────────────────
function toTimestamp(isoString) {
  return isoString ? Timestamp.fromDate(new Date(isoString)) : null;
}

function prepareFirestoreFine(fine) {
  return {
    ...fine,
    issuedAt: toTimestamp(fine.issuedAt),
    paidAt:   toTimestamp(fine.paidAt),
  };
}

async function clearCollection(collName) {
  const snap = await getDocs(collection(db, collName));
  const deletes = snap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);
  console.log(`  🗑  Cleared ${snap.size} docs from "${collName}"`);
}

// ── Main ──────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🔥 NTFMS Firestore Seed Script\n');

  // 1. Clear existing data
  console.log('Step 1: Clearing existing collections...');
  await clearCollection('categories');
  await clearCollection('fines');

  // 2. Seed categories
  console.log('\nStep 2: Seeding categories...');
  for (const cat of CATEGORIES) {
    await setDoc(doc(db, 'categories', cat.id), cat);
    console.log(`  ✅  Category: ${cat.id} — ${cat.name}`);
  }

  // 3. Seed fines
  console.log('\nStep 3: Seeding fines...');
  const allFines = [...SEED_FINES, ...generateHistoricalFines(53)];

  for (const fine of allFines) {
    await setDoc(doc(db, 'fines', fine.refNo), prepareFirestoreFine(fine));
    console.log(`  ✅  Fine: ${fine.refNo} [${fine.status}] — ${fine.driverName}`);
  }

  // 4. Summary
  console.log('\n─────────────────────────────────────────');
  console.log(`✅  Seeding complete!`);
  console.log(`    Categories : ${CATEGORIES.length}`);
  console.log(`    Fines      : ${allFines.length} (${SEED_FINES.length} named + ${allFines.length - SEED_FINES.length} historical)`);
  console.log(`\n🔗  View data: https://console.firebase.google.com/project/ntfms2026/firestore\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
