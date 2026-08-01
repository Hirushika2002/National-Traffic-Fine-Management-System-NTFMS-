# Traffic Fine Backend

Node.js + Express + Prisma (MySQL) REST API for the Digital Traffic Fine Payment System.

## 1. Prerequisites

- Node.js 18+ (tested on Node 24)
- A local MySQL server (8.x recommended). Any of these work:
  - MySQL Community Server installed directly on Windows
  - XAMPP / WAMP's bundled MySQL/MariaDB
  - A MySQL instance running elsewhere you can reach over the network

No MySQL server was detected running on this machine yet (nothing listening on port 3306). Install/start one before running migrations.

## 2. Create the database

Connect with your MySQL client (e.g. `mysql -u root -p`) and run:

```sql
CREATE DATABASE traffic_fine_db CHARACTER SET utf8mb4;
```

## 3. Configure environment variables

A `.env` file has already been created (copied from `.env.example`) with randomly generated JWT secrets. **Edit `DATABASE_URL`** to match your local MySQL user/password:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/traffic_fine_db"
```

Leave `SMS_PROVIDER=mock` for local development — it just logs the SMS text to the console instead of calling Twilio. Switch it to `twilio` and fill in the `TWILIO_*` values only when you want to send real SMS (see section 6 of the project plan for the free-trial verified-caller-ID requirement).

## 4. Install dependencies (already done)

```bash
npm install
```

## 5. Run migrations and seed data

```bash
npm run prisma:migrate   # creates the 7 tables from prisma/schema.prisma
npm run prisma:seed      # seeds districts, fine categories, 2 sample officers, 1 admin
```

The seeded admin login is whatever is set in `.env` under `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults to `admin@police.lk` / `ChangeMe123!`).

## 6. Run the API

```bash
npm run dev     # nodemon, auto-restart
# or
npm start
```

The server listens on `PORT` (default `4000`). Check `GET http://localhost:4000/health`.

## 7. Run tests

```bash
npm test
```

Tests are unit-level (Jest + Supertest) and mock the Prisma client, so they run without a live database — useful for quickly verifying business logic (auth, lookup, payment idempotency, admin reports, rate limiting) in CI or before MySQL is set up.

## 8. Manual demo flow

1. `POST /api/fines/mock` with a body like:
   ```json
   { "categoryId": 1, "officerId": 1, "districtId": 1, "vehicleNo": "WP-CAR-7890", "driverLicenseNo": "B1234567" }
   ```
   Note the returned `referenceNo` and `categoryId`.
2. `GET /api/fines/lookup?referenceNo=<referenceNo>&categoryId=<categoryId>` to confirm the fine details.
3. `POST /api/payments` with that `fineId`, the fine's `amount`, and a test card:
   ```json
   {
     "fineId": 1,
     "amount": 2500.00,
     "paymentMethod": "CREDIT_CARD",
     "channel": "WEB",
     "payerName": "A. B. Perera",
     "payerContact": "0771234567",
     "cardNumber": "4111222233334444",
     "expiryDate": "12/30",
     "cvv": "123"
   }
   ```
4. Confirm the fine's `status` is now `PAID`, a `[SMS MOCK]` line appears in the server console, and a `sms_logs` row was written.
5. Repeat step 3 — it should now return `400 Fine already paid`.
6. `POST /api/auth/admin/login` with the seeded admin credentials, then call `GET /api/admin/reports/summary` with `Authorization: Bearer <accessToken>`.

## Project layout

```
src/
  config/      env + Prisma client singleton
  middleware/  JWT auth, rate limiter, error handler
  routes/      Express routers
  controllers/ request parsing / response shaping
  services/    business logic (Auth, Sms, Payment, Report)
  validators/  Zod schemas
prisma/
  schema.prisma  the 7-table schema
  seed.js        dev seed data
tests/           Jest + Supertest unit tests (mocked Prisma)
```
