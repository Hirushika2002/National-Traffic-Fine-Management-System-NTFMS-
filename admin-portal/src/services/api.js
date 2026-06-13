// Simulated API Service with LocalStorage persistence for NTFMS Admin Portal

const STORAGE_KEY_FINES = 'ntfms_fines';
const STORAGE_KEY_CATEGORIES = 'ntfms_categories';
const STORAGE_KEY_TOKEN = 'ntfms_jwt_token';
const STORAGE_KEY_USER = 'ntfms_user';

// 25 Districts of Sri Lanka
export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Mannar', 'Vavuniya',
  'Mullaitivu', 'Kilinochchi', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

// Initial Fine Categories List
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

// Seed Data for Traffic Fines
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
    paymentMethod: 'Mobile App', // Paid on the spot
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
    paymentMethod: 'Web Portal', // Paid later
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

// Helper to seed localStorage
const initializeDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEY_FINES)) {
    // Generate additional simulated historical fines to make charts look beautiful
    const baseFines = [...SEED_FINES];
    const historicalFines = generateHistoricalFines();
    localStorage.setItem(STORAGE_KEY_FINES, JSON.stringify([...baseFines, ...historicalFines]));
  }
};

// Generates 40+ extra historical fines over the last few months for rich charts
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
    // Pick random values
    const randomDayOffset = Math.floor(Math.random() * diffDays);
    const issueDate = new Date(startDay.getTime() + randomDayOffset * 24 * 60 * 60 * 1000 + Math.random() * 12 * 60 * 60 * 1000);
    const cat = INITIAL_CATEGORIES[Math.floor(Math.random() * INITIAL_CATEGORIES.length)];
    const district = DISTRICTS[Math.floor(Math.random() * 8)]; // Focus on 8 main districts for clear visuals
    const driver = `${names[Math.floor(Math.random() * names.length)]} ${lastnames[Math.floor(Math.random() * lastnames.length)]}`;
    const license = 'B' + Math.floor(10000000 + Math.random() * 90000000);
    const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const officer = officers[Math.floor(Math.random() * officers.length)];
    
    // Most historical fines are paid
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

// Execute Seeding
initializeDatabase();

// --- Authentication APIs ---

export const authService = {
  login: async (username, password) => {
    // Simulate API network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (username === 'admin' && password === 'admin123') {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNFTklPUl9PRkZJQ0VSIiwiaWF0IjoxNzE4Mjk5ODAwfQ';
      const mockUser = {
        username: 'admin',
        name: 'Senior Supt. Wickramasinghe',
        role: 'Senior Police Administrator',
        district: 'Colombo Headquarters'
      };

      localStorage.setItem(STORAGE_KEY_TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
      return { success: true, token: mockToken, user: mockUser };
    }

    throw new Error('Invalid Administrator Credentials. Please check username/password.');
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  getCurrentUser: () => {
    const user = localStorage.getItem(STORAGE_KEY_USER);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEY_TOKEN);
  }
};

// --- Fines & Analytics APIs ---

export const apiService = {
  // Get all fines
  getAllFines: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_FINES)) || [];
  },

  // Get categories
  getCategories: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES)) || [];
  },

  // Search & Filter Fines
  getFines: (filters = {}) => {
    let fines = apiService.getAllFines();
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

    if (district) {
      fines = fines.filter(f => f.district === district);
    }

    if (category) {
      fines = fines.filter(f => f.category === category);
    }

    if (status) {
      fines = fines.filter(f => f.status === status);
    }

    if (dateRange && dateRange.start) {
      const start = new Date(dateRange.start);
      fines = fines.filter(f => new Date(f.issuedAt) >= start);
    }

    if (dateRange && dateRange.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      fines = fines.filter(f => new Date(f.issuedAt) <= end);
    }

    // Sort newest first
    return fines.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  },

  // Pay Fine Online (Web Portal Simulation)
  payFine: async (refNo, paymentDetails) => {
    await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate bank processing latency
    
    const fines = apiService.getAllFines();
    const idx = fines.findIndex(f => f.refNo === refNo);
    
    if (idx === -1) {
      throw new Error(`Fine reference ${refNo} not found in the national register.`);
    }
    
    if (fines[idx].status === 'Paid') {
      throw new Error(`Fine ${refNo} has already been settled.`);
    }

    // Update Status
    fines[idx].status = 'Paid';
    fines[idx].paymentMethod = 'Web Portal';
    fines[idx].paidAt = new Date().toISOString();
    fines[idx].smsSent = true;
    
    localStorage.setItem(STORAGE_KEY_FINES, JSON.stringify(fines));

    // Simulate SMS Trigger to Traffic Police Officer
    const officerName = fines[idx].officerName;
    const officerPhone = fines[idx].officerPhone;
    const ref = fines[idx].refNo;
    const driverLic = fines[idx].driverLicense;
    const message = `[NTFMS CONFIRMATION] Fine Ref ${ref} for License ${driverLic} has been SETTLED successfully via Web Portal. You may return the driving license to the motorist.`;
    
    console.log(`%c[SMS TRANSMITTED] To: ${officerName} (${officerPhone})\nMessage: ${message}`, 'background: #002244; color: #d4af37; padding: 6px; font-weight: bold; border-radius: 4px;');

    return {
      success: true,
      smsReceipt: {
        to: officerPhone,
        officer: officerName,
        message,
        timestamp: new Date().toISOString()
      },
      fine: fines[idx]
    };
  },

  // Issue New Fine (Mobile App Simulation)
  issueFine: (fineData) => {
    const fines = apiService.getAllFines();
    const categories = apiService.getCategories();
    const cat = categories.find(c => c.id === fineData.category);

    if (!cat) {
      throw new Error('Invalid Traffic Fine Category.');
    }

    const refNo = `SLP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newFine = {
      refNo,
      category: fineData.category,
      amount: cat.amount,
      driverName: fineData.driverName,
      driverLicense: fineData.driverLicense,
      vehicleNo: fineData.vehicleNo,
      officerId: fineData.officerId || 'OF-8821',
      officerName: fineData.officerName || 'Sgt. Bandara',
      officerPhone: fineData.officerPhone || '+94771234567',
      district: fineData.district,
      location: fineData.location || `${fineData.district} Patrol Area`,
      issuedAt: new Date().toISOString(),
      status: fineData.status || 'Pending',
      paymentMethod: fineData.status === 'Paid' ? 'Mobile App' : null,
      paidAt: fineData.status === 'Paid' ? new Date().toISOString() : null,
      smsSent: fineData.status === 'Paid'
    };

    fines.unshift(newFine); // Add to top
    localStorage.setItem(STORAGE_KEY_FINES, JSON.stringify(fines));

    // If paid on the spot via mobile app, trigger confirmation SMS to officer
    if (newFine.status === 'Paid') {
      const msg = `[NTFMS CONFIRMATION] On-the-spot Payment Successful. Fine Ref ${refNo} for License ${newFine.driverLicense} settled. Return license immediately.`;
      console.log(`%c[SMS TRANSMITTED] To: ${newFine.officerName} (${newFine.officerPhone})\nMessage: ${msg}`, 'background: #002244; color: #10b981; padding: 6px; font-weight: bold; border-radius: 4px;');
    }

    return newFine;
  },

  // Add Custom Category (Admin Panel functionality)
  addCategory: (catData) => {
    const categories = apiService.getCategories();
    if (categories.some(c => c.id === catData.id)) {
      throw new Error(`Category ID ${catData.id} already exists.`);
    }

    const newCat = {
      id: catData.id.toUpperCase(),
      name: catData.name,
      amount: parseFloat(catData.amount),
      penaltyPoints: parseInt(catData.penaltyPoints) || 0
    };

    categories.push(newCat);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    return newCat;
  },

  // --- Aggregate Analytics Helpers for Dashboard ---

  getDashboardMetrics: () => {
    const fines = apiService.getAllFines();
    
    let totalCollected = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

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

    const totalFinesCount = fines.length;
    const collectionRate = totalFinesCount > 0 ? ((paidCount / totalFinesCount) * 100).toFixed(1) : 0;

    return {
      totalCollected,
      totalPending,
      totalFinesCount,
      paidCount,
      pendingCount,
      overdueCount,
      collectionRate
    };
  },

  // Get collection amounts and ticket counts grouped by District
  getDistrictWiseCollections: () => {
    const fines = apiService.getAllFines();
    const dict = {};

    // Initialize all 25 districts with zero values
    DISTRICTS.forEach(d => {
      dict[d] = { district: d, collected: 0, count: 0, totalAmount: 0 };
    });

    fines.forEach(f => {
      const dObj = dict[f.district] || { district: f.district, collected: 0, count: 0, totalAmount: 0 };
      dObj.count++;
      dObj.totalAmount += f.amount;
      if (f.status === 'Paid') {
        dObj.collected += f.amount;
      }
      dict[f.district] = dObj;
    });

    // Return list sorted by collection performance
    return Object.values(dict).sort((a, b) => b.collected - a.collected);
  },

  // Get collections grouped by Fine Categories
  getCategoryBreakdown: () => {
    const fines = apiService.getAllFines();
    const categories = apiService.getCategories();
    
    const catMap = {};
    categories.forEach(c => {
      catMap[c.id] = { id: c.id, name: c.name, collected: 0, count: 0, totalAmount: 0 };
    });

    fines.forEach(f => {
      let cObj = catMap[f.category];
      if (!cObj) {
        cObj = { id: f.category, name: 'Other Violations', collected: 0, count: 0, totalAmount: 0 };
        catMap[f.category] = cObj;
      }
      cObj.count++;
      cObj.totalAmount += f.amount;
      if (f.status === 'Paid') {
        cObj.collected += f.amount;
      }
    });

    return Object.values(catMap).sort((a, b) => b.collected - a.collected);
  },

  // Get collections over time (grouped by Month for line/area chart)
  getMonthlyTrend: () => {
    const fines = apiService.getAllFines();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Aggregate by Year-Month
    const monthlyMap = {};
    
    // Seed the map with recent months (e.g. Mar, Apr, May, Jun 2026)
    const currentYear = 2026;
    for (let m = 2; m <= 5; m++) { // Mar (2) to Jun (5)
      const key = `${currentYear}-${String(m+1).padStart(2, '0')}`;
      monthlyMap[key] = {
        name: `${months[m]} ${currentYear}`,
        collected: 0,
        tickets: 0
      };
    }

    fines.forEach(f => {
      const date = new Date(f.issuedAt);
      if (isNaN(date)) return;
      
      const year = date.getFullYear();
      const monthIdx = date.getMonth();
      const key = `${year}-${String(monthIdx+1).padStart(2, '0')}`;
      
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          name: `${months[monthIdx]} ${year}`,
          collected: 0,
          tickets: 0
        };
      }
      
      monthlyMap[key].tickets++;
      if (f.status === 'Paid') {
        monthlyMap[key].collected += f.amount;
      }
    });

    // Sort by key chronologically
    return Object.keys(monthlyMap)
      .sort()
      .map(k => monthlyMap[k]);
  }
};
