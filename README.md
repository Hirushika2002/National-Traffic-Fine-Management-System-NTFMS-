# 🚔 National Traffic Fine Management System (NTFMS)

> **Assignment 1 — Information Security | Semester 6**  
> Software Architecture Document for the Sri Lanka Police Traffic Fine Digitalization Initiative

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Assignment Context](#-assignment-context)
- [System Architecture](#-system-architecture)
- [Applications Built](#-applications-built)
  - [Admin Web Portal](#-admin-web-portal)
  - [Driver Mobile App](#-driver-mobile-app)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [API Endpoints](#-api-endpoints)
- [Data Flow](#-data-flow)
- [Getting Started](#-getting-started)
- [Assumptions & Architecture Decisions](#-assumptions--architecture-decisions)
- [Author](#-author)

---

## 📌 Project Overview

The **National Traffic Fine Management System (NTFMS)** is a full-stack software system designed to modernize traffic fine payments for the **Sri Lanka Police Department**. It eliminates the inefficiencies in traditional traffic fine settlement processes and reduces the inconvenience faced by motorists.

The system consists of **three separate applications** as required:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend REST API** | Node.js / Express *(planned)* | Central data layer for all clients |
| **Admin Web Portal** | React + Vite | Senior official monitoring dashboard |
| **Driver Mobile App** | Flutter (Android) | Motorist fine payment portal |

---

## 🎓 Assignment Context

**Assignment 1 — Individual Assignment (10 Marks)**

**Task:** Prepare a software architecture document for the Sri Lanka Police Department's traffic fine digitalization initiative, using the C4 model to visualize the architecture, clearly stating assumptions and justifying architectural decisions (technology selection, containers, scaling strategy, etc.).

### User Requirements Summary

1. **Traffic Police Officers** issue fine sheets containing:
   - A unique **Fine Reference Number**
   - A **Traffic Fine Category Identifier**

2. **Drivers** can:
   - Pay **on-the-spot** via mobile app using the fine reference number + category ID
   - Pay **later** via the dedicated web portal using the same credentials
   - Upon successful payment, an **SMS is sent to the traffic officer** to enable license return

3. **Senior Officials** can:
   - Monitor traffic fine collections **nationwide** via the admin web portal
   - View **district-wise total collections**
   - View **breakdowns by fine categories**
   - Access real-time insights for decision-making

---

## 🏗 System Architecture

The system follows a **microservices-inspired layered architecture** with a central REST API serving all client applications.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                          │
│                                                                     │
│  ┌──────────────────────────┐    ┌──────────────────────────────┐  │
│  │   Admin Web Portal       │    │   Driver Mobile App          │  │
│  │   React + Vite           │    │   Flutter (Android/iOS)      │  │
│  │   (Senior Officials)     │    │   (Motorists)                │  │
│  └────────────┬─────────────┘    └──────────────┬───────────────┘  │
└───────────────┼──────────────────────────────────┼─────────────────┘
                │         HTTPS REST API            │
                └────────────────┬──────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                      BACKEND REST API SERVER                        │
│                                                                     │
│   GET  /api/fines          → Lookup fine by reference + category   │
│   POST /api/payments        → Process payment & trigger SMS        │
│   GET  /api/districts       → District-wise collection stats       │
│   GET  /api/categories      → Fine categories & breakdown          │
│   POST /api/auth/login      → Admin authentication                 │
│                                                                     │
│   ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│   │ Fine Management │  │ Payment Gateway  │  │ SMS Service     │  │
│   │ Service         │  │ (Card Processing)│  │ (Officer Notify)│  │
│   └─────────────────┘  └──────────────────┘  └─────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │            DATABASE LAYER            │
              │    PostgreSQL / MongoDB (planned)     │
              │   • Fine Records                     │
              │   • Payment Transactions             │
              │   • User/Officer Data                │
              └──────────────────────────────────────┘
```

### C4 Model — Container Diagram

```
[Sri Lanka Police System - NTFMS]

  Person: Driver/Motorist
    → uses → [Flutter Mobile App]

  Person: Traffic Police Officer
    → receives SMS from → [SMS Gateway]

  Person: Senior Police Official
    → uses → [Admin React Web Portal]

  System Boundary: NTFMS
    Container: Admin Web Portal   [React + Vite, JS]
    Container: Driver Mobile App  [Flutter, Dart]
    Container: REST API Server    [Node.js + Express]
    Container: Database           [PostgreSQL]
    Container: SMS Gateway        [Twilio / Dialog SMS]
```

---

## 💻 Applications Built

### 🖥 Admin Web Portal

**Path:** `WebApp/`  
**Technology:** React 19 + Vite 8 + Recharts + Lucide React

A fully-featured administration dashboard for senior Sri Lanka Police officials to monitor national traffic fine operations in real time.

#### Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Login** | JWT-based admin authentication with session persistence |
| 📊 **KPI Dashboard** | Real-time metrics: Total Settlements, Fines Issued, Outstanding Balance, Collection Efficiency % |
| 🗺 **District Analytics** | Bar chart of top 7 district-wise LKR collections across Sri Lanka |
| 🍩 **Category Breakdown** | Donut pie chart showing fine distribution by offense type (Speeding, Overloading, etc.) |
| 📈 **Monthly Revenue Trends** | Area chart with gradient showing monthly LKR collection over time |
| 📡 **Live Event Stream** | Real-time national event ticker simulating fine issuances and online payments every 12 seconds |
| 📋 **Fines Management** | Sortable, filterable table of all national fines with Ref No, District, Officer, Amount, Status |
| 🏙 **Districts View** | District-level breakdown with individual collection stats |
| 🏷 **Categories View** | Fine category management and statistics |
| 🌙 **Dark/Light Theme** | Theme toggle with localStorage persistence |

#### Admin Portal Screenshots — Component Summary

```
NTFMSAdminApp (React)
│
├── Login (JWT Auth)
├── Sidebar (Navigation + Theme Toggle)
│
└── Main Content
    ├── Dashboard
    │   ├── Metrics Grid (4 KPI Cards)
    │   ├── Bar Chart (District Collections)
    │   ├── Pie Chart (Category Breakdown)
    │   ├── Area Chart (Monthly Revenue Trend)
    │   ├── Live Event Ticker (National Stream)
    │   └── Recent Fines Table
    ├── FinesList (Full fine records + filter)
    ├── Districts (District analytics)
    └── Categories (Category management)
```

---

### 📱 Driver Mobile App

**Path:** `MobileApp/`  
**Technology:** Flutter 3 + Dart 3 (Android-first)

A clean, Material Design 3 mobile application that allows motorists to look up and pay their traffic fines instantly using their fine reference number and category ID from their physical ticket.

#### Features

| Feature | Description |
|---------|-------------|
| 🔍 **Fine Lookup** | Enter Fine Reference Number + Category ID to retrieve fine details from backend API |
| 📄 **Fine Details Display** | Shows violator name, license number, violation type, issued date, location, and amount |
| 💳 **Secure Card Payment** | Full credit/debit card payment form with real-time Luhn algorithm validation |
| ✅ **Payment Confirmation** | Displays confirmation number and transaction ID on success |
| 📲 **SMS Notification** | Backend triggers an SMS to the traffic officer upon successful payment |
| 🎨 **Status Badges** | Color-coded status: Pending (Amber), Paid (Emerald), Overdue (Red) |
| ⚠️ **Error Handling** | Friendly error messages for network failures, card declines, and duplicate payments |
| ♻️ **Form Reset** | One-tap reset to process the next fine without restarting the app |

#### Mobile App Architecture

```
NTFMSApp (MaterialApp)
│
└── FinePaymentScreen (StatefulWidget)
    │
    ├── [State: IDLE] → _buildHeader()
    │                 → _buildFineReferenceForm()
    │                     ├── TextFormField (Reference Number)
    │                     ├── TextFormField (Category ID)
    │                     └── ElevatedButton → _fetchFineDetails()
    │
    ├── [State: FINE_FETCHED] → _buildFineDetailsCard()
    │                            ├── Status Badge
    │                            ├── Fine Amount (LKR)
    │                            ├── Violator Info rows
    │                            └── ElevatedButton (Proceed to Pay)
    │
    ├── [State: PAYMENT_FORM] → _buildPaymentForm()
    │                            ├── Card Number (Luhn formatted)
    │                            ├── Cardholder Name
    │                            ├── Expiry MM / YY
    │                            ├── CVV (obscured)
    │                            └── ElevatedButton → _processPayment()
    │
    ├── [Conditional] → _buildErrorMessage()
    └── [Conditional] → _buildSuccessMessage()
```

---

## 🛠 Technology Stack

### Admin Web Portal

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | ^19.2.6 |
| Build Tool | Vite | ^8.0.12 |
| Charts | Recharts | ^3.8.1 |
| Icons | Lucide React | ^1.18.0 |
| Styling | Vanilla CSS (CSS Variables) | — |
| State | React Hooks (useState, useEffect) | — |

### Driver Mobile App

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Flutter | SDK ≥3.0.0 |
| Language | Dart | ≥3.0.0 |
| HTTP Client | http | ^1.1.0 |
| HTTP (Alt) | Dio | ^5.3.0 |
| State | Provider | ^6.0.0 |
| Formatting | intl | ^0.19.0 |
| UI | Material Design 3 | — |
| Validation | Luhn Algorithm (custom) | — |

### Backend REST API *(Architecture Design)*

| Category | Technology |
|----------|-----------|
| Runtime | Node.js + Express *(planned)* |
| Database | PostgreSQL / MongoDB *(planned)* |
| Auth | JWT (JSON Web Tokens) |
| SMS | Twilio / Dialog SMS Gateway |
| Hosting | AWS / DigitalOcean / Render |

---

## 📁 Project Structure

```
National-Traffic-Fine-Management-System-NTFMS-/
└── admin-portal/
    ├── Git-Readme.md                    ← This file
    │
    ├── WebApp/                          ← Admin Web Portal (React + Vite)
    │   ├── index.html
    │   ├── package.json
    │   ├── vite.config.js
    │   └── src/
    │       ├── main.jsx
    │       ├── App.jsx                  ← Root + Routing + Auth
    │       ├── index.css                ← Design system (CSS variables, themes)
    │       ├── components/
    │       │   ├── Login.jsx            ← Admin authentication screen
    │       │   ├── Sidebar.jsx          ← Navigation + theme toggle
    │       │   ├── Dashboard.jsx        ← KPI cards + charts + live ticker
    │       │   ├── FinesList.jsx        ← All fines management table
    │       │   ├── Districts.jsx        ← District-wise analytics
    │       │   └── Categories.jsx       ← Fine category management
    │       └── services/
    │           └── api.js               ← API service layer (simulated + real)
    │
    └── MobileApp/                       ← Driver Mobile App (Flutter)
        ├── pubspec.yaml
        ├── README.md
        ├── ARCHITECTURE_DIAGRAMS.md     ← C4 & UML diagrams (ASCII)
        ├── IMPLEMENTATION_GUIDE.md      ← Developer guide
        ├── QUICK_REFERENCE.md           ← API & code quick reference
        └── lib/
            ├── main.dart                ← App entry point + theme
            ├── screens/
            │   └── fine_payment_screen.dart  ← Main driver UI
            ├── models/
            │   └── fine_model.dart           ← Fine data model
            ├── services/
            │   └── api_service.dart          ← REST API communication
            └── utils/
                └── app_theme.dart            ← Material 3 theme config
```

---

## ✨ Key Features

### Security Features

- 🔐 **Admin JWT Authentication** — Session-based login with token expiry
- 🔒 **Card Number Masking** — Card numbers are masked in all displays (`**** **** **** 1234`)
- ✅ **Luhn Algorithm Validation** — Client-side card number validation before API submission
- 🛡 **Input Sanitization** — All form inputs are trimmed and validated before API calls
- 🔑 **CVV Obscured** — CVV field uses `obscureText` mode on mobile

### Operational Features

- 📡 **Real-time Dashboard** — Simulated live event ticker (12-second polling) for national fine activity
- 📱 **Cross-platform Mobile** — Flutter supports Android, iOS, and Web from a single codebase
- 🌍 **District-level Reporting** — All 25 Sri Lanka districts tracked individually
- 📊 **Multiple Chart Types** — Bar, Pie (Donut), Area charts for comprehensive analytics
- 🌙 **Theme Persistence** — Dark/light mode stored in localStorage

---

## 🔌 API Endpoints

The mobile app and web portal communicate with the backend via the following REST API:

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| `GET` | `/api/fines` | Lookup fine by `referenceNumber` + `categoryId` | Mobile App |
| `POST` | `/api/payments` | Process fine payment with card details | Mobile App |
| `POST` | `/api/auth/login` | Admin login (returns JWT) | Web Portal |
| `GET` | `/api/dashboard/metrics` | KPI totals (collected, pending, count) | Web Portal |
| `GET` | `/api/districts` | District-wise collection breakdown | Web Portal |
| `GET` | `/api/categories` | Fine categories and offense stats | Web Portal |
| `GET` | `/api/fines/all` | Paginated list of all fines (admin) | Web Portal |

### Request/Response Example — Fine Lookup

**Request:**
```http
GET /api/fines?referenceNumber=TFM-2024-001234&categoryId=SPEED001
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": {
    "fineReferenceNumber": "TFM-2024-001234",
    "categoryId": "SPEED001",
    "violatorName": "Rohan Silva",
    "violatorLicenseNumber": "B12345678",
    "violationType": "Speeding (>50km/h over limit)",
    "fineAmount": 7500.00,
    "issuedDate": "2024-06-10",
    "locationDescription": "Colombo - Kandy Road, Kegalle",
    "status": "Pending"
  }
}
```

### Request/Response Example — Process Payment

**Request:**
```http
POST /api/payments
Content-Type: application/json

{
  "fineReferenceNumber": "TFM-2024-001234",
  "categoryId": "SPEED001",
  "paymentMethod": "card",
  "amount": 7500.00,
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "cardHolderName": "ROHAN SILVA",
    "expiryMonth": "12",
    "expiryYear": "25",
    "cvv": "123"
  },
  "timestamp": "2024-06-14T04:30:00.000Z"
}
```

**Response (201 Created):**
```json
{
  "message": "Payment processed successfully",
  "confirmationNumber": "CONF-2024-56789",
  "transactionId": "TXN-987654",
  "smsStatus": "sent"
}
```

---

## 🔄 Data Flow

### Driver Payment Flow

```
Driver
  │
  ▼
[Enter Fine Ref # + Category ID]
  │
  ▼
[Mobile App validates inputs]
  │
  ├── Invalid → Show validation error
  │
  ▼
[GET /api/fines?referenceNumber=X&categoryId=Y]
  │
  ├── 404 → "Fine not found. Verify details."
  ├── 400 → "Invalid input."
  ├── 500 → "Server error. Try again later."
  │
  ▼ 200 OK
[Display Fine Details Card]
  │ Amount, Name, License, Violation Type, Date, Location
  │
  ▼
[Driver clicks "Proceed to Payment"]
  │
  ▼
[Enter Card Details → Luhn Algorithm Validation]
  │
  ├── Invalid Card → Show error, block submission
  │
  ▼
[POST /api/payments]
  │
  ├── 402 → "Card declined."
  ├── 409 → "Already paid."
  ├── 500 → "Processing error."
  │
  ▼ 200/201 OK
[Show: "Payment successful! Conf #CONF-2024-56789"]
  │
  ▼
[Backend triggers SMS to Traffic Officer]
[Officer returns driver's license]
  │
  ▼
[Form resets for next fine]
```

### Admin Monitoring Flow

```
Senior Official
  │
  ▼
[Login with credentials → JWT Token issued]
  │
  ▼
[Admin Dashboard loads]
  │
  ├── [GET /api/dashboard/metrics]   → KPI Cards
  ├── [GET /api/districts]           → District Bar Chart
  ├── [GET /api/categories]          → Category Pie Chart
  ├── [GET monthly trend data]       → Revenue Area Chart
  └── [GET /api/fines/all?limit=5]   → Recent Activity Table
  │
  ▼
[Live Event Ticker — Simulated every 12 seconds]
  │
  ├── New fine issued by officer → "Warning" event
  └── Online payment received   → "Success" event
```

---

## 🚀 Getting Started

### Admin Web Portal

```bash
# Navigate to the web app directory
cd WebApp

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser: http://localhost:5173
```

**Default Admin Credentials** *(development)*:
```
Username: admin
Password: admin123
```

---

### Driver Mobile App

```bash
# Navigate to the mobile app directory
cd MobileApp

# Get Flutter dependencies
flutter pub get

# Run on connected Android device or emulator
flutter run

# Run on specific device
flutter run -d <device-id>

# Build APK for distribution
flutter build apk --release
```

**Backend Configuration** (`lib/services/api_service.dart`):
```dart
// Android Emulator (uses 10.0.2.2 to reach host localhost)
static final String baseUrl = Platform.isAndroid
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api';
```

> ⚠️ Change the `baseUrl` in `api_service.dart` to point to your deployed backend before building for production.

---

## 📐 Assumptions & Architecture Decisions

### Technology Choices

| Decision | Choice | Justification |
|----------|--------|---------------|
| **Mobile Framework** | Flutter | Single codebase for Android + iOS. Excellent Material Design 3 support. Required for Android by the assignment. |
| **Web Framework** | React + Vite | Industry standard. Fast dev server. Component-based architecture for complex dashboards. |
| **Charts Library** | Recharts | React-native, responsive, supports Bar, Pie, Area charts needed for district and category analytics. |
| **State Management (Web)** | React Hooks | Sufficient for this scope. No need for Redux/Zustand at this scale. |
| **State Management (Mobile)** | Provider + StatefulWidget | Lightweight for the single-screen app scope. |
| **Card Validation** | Luhn Algorithm | Industry-standard credit card number validation. Prevents obvious fake card submissions. |
| **API Architecture** | REST over HTTP | Simpler than GraphQL for this use case. Well-understood by police IT teams. Easier to debug. |
| **Auth Method** | JWT (stateless) | Scalable. No server-side session storage needed. Token expiry enforces re-authentication. |

### Assumptions Made

1. **Backend exists separately** — This repository contains front-end applications only. A backend REST API (Node.js/Express + PostgreSQL) must be deployed at the configured URL.
2. **SMS is handled server-side** — The Flutter app receives `smsStatus: "sent"` in the payment response; the actual SMS is triggered by the backend using a gateway like Twilio or Dialog.
3. **Card processing is external** — The system integrates with an external payment gateway (e.g., PayHere, Stripe). Raw card data should never be stored — only tokenized references.
4. **Admin users are pre-created** — No self-registration. Senior officials are given credentials by a system administrator.
5. **Fine reference numbers are unique** — Generated by the police ticketing system and never reused.
6. **All monetary values are in Sri Lankan Rupees (LKR)**.
7. **Network connectivity is assumed** — The mobile app requires active data connection to process payments.

### Scaling Considerations

- **Horizontal Scaling**: The REST API is stateless (JWT auth), allowing multiple backend instances behind a load balancer.
- **Database**: PostgreSQL with read replicas for high-read analytics workloads.
- **CDN**: The React admin portal can be served via CDN (Cloudflare/AWS CloudFront) for low latency.
- **SMS Queue**: Payment-triggered SMS notifications should use a message queue (e.g., RabbitMQ) to decouple the payment response from SMS delivery latency.

---

## 👨‍💻 Author

**Hirushika** — Information Security, Semester 6  
GitHub: [@Hirushika2002](https://github.com/Hirushika2002)

---

## 📄 License

This project is developed as part of an academic assignment for educational purposes only.

---

*Last Updated: June 2026*
