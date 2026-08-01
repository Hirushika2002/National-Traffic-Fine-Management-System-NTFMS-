require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DISTRICTS = ['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala'];

const FINE_CATEGORIES = [
  { code: 'SEC_140', description: 'Exceeding speed limits', baseAmount: 2500.0 },
  { code: 'SEC_151', description: 'Drunk driving', baseAmount: 25000.0 },
  { code: 'SEC_119', description: 'Failing to obey traffic signal', baseAmount: 2000.0 },
  { code: 'SEC_128', description: 'Driving without a valid license', baseAmount: 5000.0 },
  { code: 'SEC_160', description: 'Riding without a helmet', baseAmount: 1500.0 },
];

async function main() {
  console.log('Seeding districts...');
  const districts = {};
  for (const name of DISTRICTS) {
    districts[name] = await prisma.district.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeding fine categories...');
  for (const category of FINE_CATEGORIES) {
    await prisma.fineCategory.upsert({
      where: { code: category.code },
      update: { description: category.description, baseAmount: category.baseAmount },
      create: category,
    });
  }

  console.log('Seeding sample officers...');
  await prisma.officer.upsert({
    where: { badgeNo: 'SLP-0001' },
    update: {},
    create: {
      badgeNo: 'SLP-0001',
      fullName: 'W. K. Silva',
      phoneNo: '+94713807097',
      station: 'Colombo Fort Police Station',
      districtId: districts['Colombo'].id,
    },
  });
  await prisma.officer.upsert({
    where: { badgeNo: 'SLP-0002' },
    update: {},
    create: {
      badgeNo: 'SLP-0002',
      fullName: 'R. M. Fernando',
      phoneNo: '+94713807097',
      station: 'Kandy City Police Station',
      districtId: districts['Kandy'].id,
    },
  });

  console.log('Seeding admin account...');
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@police.lk';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      fullName: 'System Administrator',
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Seeding sample traffic fines...');
  await prisma.trafficFine.upsert({
    where: { referenceNo: 'SLP-2026-9814' },
    update: {},
    create: {
      referenceNo: 'SLP-2026-9814',
      categoryId: 2, // Drunk driving
      officerId: 1, // W. K. Silva
      districtId: districts['Colombo'].id,
      vehicleNo: 'WP-CAS-4921',
      driverLicenseNo: 'B7123490',
      issueDate: new Date('2026-07-18T10:30:00Z'),
      amount: 25000.0,
      status: 'PENDING',
    },
  });

  await prisma.trafficFine.upsert({
    where: { referenceNo: 'SLP-2026-9816' },
    update: {},
    create: {
      referenceNo: 'SLP-2026-9816',
      categoryId: 1, // Speeding
      officerId: 2, // R. M. Fernando
      districtId: districts['Kandy'].id,
      vehicleNo: 'WP-CAB-8976',
      driverLicenseNo: 'B9876543',
      issueDate: new Date('2026-07-17T14:45:00Z'),
      amount: 2500.0,
      status: 'PENDING',
    },
  });

  await prisma.trafficFine.upsert({
    where: { referenceNo: 'SLP-2026-9817' },
    update: {},
    create: {
      referenceNo: 'SLP-2026-9817',
      categoryId: 3, // Traffic signal
      officerId: 1, // W. K. Silva
      districtId: districts['Colombo'].id,
      vehicleNo: 'WP-KB-9081',
      driverLicenseNo: 'B8234912',
      issueDate: new Date('2026-07-19T08:15:00Z'),
      amount: 2000.0,
      status: 'PENDING',
    },
  });

  console.log(`Seed complete. Admin login: ${adminEmail} / (password from SEED_ADMIN_PASSWORD)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
