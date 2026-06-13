# National Traffic Fine Management System (NTFMS) - Mobile Application

The official cross-platform mobile application designed for motorists to perform quick, secure, and on-the-spot traffic fine settlements. Built with Flutter and Dart, this app allows drivers to enter fine reference details, process payments instantly, and trigger real-time notifications to traffic officers.

**Branch:** `mobileApp` (Isolated from web application codebase)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Architecture & Design](#architecture--design)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Development Workflow](#development-workflow)
- [Testing & Debugging](#testing--debugging)

---

## ✨ Features

### 💳 **On-the-Spot Payments**
- **Instant Reference Lookup**: Drivers enter the unique fine reference number and fine category identifier.
- **Real-Time Validation**: Immediate backend verification of fine details.
- **Payment Processing**: Secure simulation for capturing payment information (credit/debit cards).
- **Instant Confirmation**: Real-time verification loop with the central REST API.

### 🔔 **Real-Time Notifications**
- **Officer SMS Trigger**: Automatic SMS dispatch to the issuing officer's registered mobile upon successful payment.
- **Digital Receipt**: Payment confirmation screen acts as proof of settlement.
- **Transaction Tracking**: Confirmation number and transaction ID for reference.

### 🎨 **User Interface & Experience**
- **Intuitive Forms**: Simple, error-validated input fields for stress-free roadside entry.
- **Responsive Layout**: Optimized UI scaling for various Android and iOS screen sizes.
- **Clear Visual States**: Loading spinners, success checkmarks, and error messages.
- **Accessibility**: High contrast text, readable font sizes, and touch-friendly buttons.

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Flutter** | Cross-Platform UI Framework | 3.x+ |
| **Dart** | Programming Language | 3.x+ |
| **Http** | REST API Client | ^1.1.0 |
| **Dio** | Alternative HTTP Library | ^5.3.0 |
| **Provider** | State Management (Optional) | ^6.0.0 |
| **Material Design 3** | UI Design System | Included |

---

## ⚙️ Prerequisites

Ensure the following are installed on your development machine:

- **Flutter SDK**: v3.0.0 or higher
  - Download from [flutter.dev](https://flutter.dev/docs/get-started/install)
  - Verify installation: `flutter --version`

- **Dart SDK**: Automatically included with Flutter
  - Verify: `dart --version`

- **Android Development**:
  - Android Studio (for emulator and toolchain)
  - Android SDK 21+ (minimum API level)
  - Android Emulator or connected device

- **VS Code Extensions**:
  - `Flutter` (by Dart Code) - Essential
  - `Dart` (by Dart Code) - Essential
  - `Dart Data Class Generator` (Optional, for model generation)

- **Git**: For version control and branch management

---

## 🚀 Installation & Setup

### Step 1: Set Up Flutter Project

If initializing this folder for the first time:

```bash
# Navigate to the MobileApp directory
cd MobileApp

# Create Flutter project with organizational identifier
flutter create . --org lk.gov.ntfms --project-name ntfms_mobile
```

### Step 2: Install Dependencies

```bash
# Fetch all dependencies from pubspec.yaml
flutter pub get

# Verify all packages are installed
flutter pub get
```

### Step 3: Configure Your IDE

1. Open VS Code
2. Open the entire **admin-portal** workspace folder
3. Navigate to `MobileApp/lib/main.dart`
4. Verify Dart Analysis shows no errors

### Step 4: Launch the Application

**On Emulator:**
```bash
# List available emulators
flutter emulators

# Launch default emulator
flutter emulators --launch Pixel_4_API_30

# Run the app (from MobileApp directory)
flutter run
```

**On Physical Device:**
```bash
# Enable USB Debugging on your Android/iOS device
# Connect device via USB

# List connected devices
flutter devices

# Run the app
flutter run -d <device-id>
```

**From VS Code:**
- Press `F5` to start debugging
- Or press `Ctrl+F5` to run without debugging

---

## 📁 Project Structure

```
MobileApp/
├── lib/
│   ├── main.dart                      # Application entry point
│   ├── models/
│   │   └── fine_model.dart            # Data model for fine details
│   ├── screens/
│   │   └── fine_payment_screen.dart   # Main payment UI screen
│   ├── services/
│   │   └── api_service.dart           # REST API communication layer
│   └── utils/
│       └── constants.dart             # App constants and utilities
├── pubspec.yaml                       # Flutter dependencies & configuration
├── pubspec.lock                       # Locked dependency versions
├── .gitignore                         # Git ignore rules
├── android/                           # Android native code
├── ios/                               # iOS native code
├── test/                              # Unit tests
└── README.md                          # This file
```

---

## 🏗️ Architecture & Design

### **Clean Architecture Principles**

The project follows clean code architecture with clear separation of concerns:

```
┌─────────────────────┐
│   UI Layer          │  (fine_payment_screen.dart)
│   (Flutter Widgets) │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Business Logic     │  (State Management, Validation)
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Service Layer      │  (api_service.dart)
│  (API Integration)  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Data Layer         │  (Models, API Responses)
│  (fine_model.dart)  │
└─────────────────────┘
```

### **State Management Pattern**

- **StatefulWidget**: For local UI state management
- **Provider (Optional)**: For global state sharing across screens
- **Error Handling**: Comprehensive try-catch with user-friendly error messages

---

## 🔑 Key Components

### 1. **FineModel** (`lib/models/fine_model.dart`)

Data class representing fine information from the backend.

**Key Fields:**
- `fineReferenceNumber`: Unique ticket identifier
- `categoryId`: Traffic violation category
- `fineAmount`: Penalty amount
- `violatorName` & `violatorLicenseNumber`: Driver details
- `status`: Payment status (pending, paid, overdue)

**Methods:**
- `fromJson()`: Deserialize from API response
- `toJson()`: Serialize for API requests
- `copyWith()`: Create modified copies

### 2. **ApiService** (`lib/services/api_service.dart`)

REST API integration layer with two core methods:

**`fetchFineDetails(fineReferenceNumber, categoryId)`**
- GET request to retrieve fine information
- Input validation
- Error handling with descriptive messages

**`processPayment(fineReferenceNumber, categoryId, paymentDetails)`**
- POST request to process payment
- Card number validation (Luhn algorithm)
- Response parsing and SMS trigger confirmation

**Helper Methods:**
- `isValidCardNumber()`: Luhn algorithm validation
- `maskCardNumber()`: Secure display of card digits

### 3. **FinePaymentScreen** (`lib/screens/fine_payment_screen.dart`)

Main Flutter StatefulWidget with complete UI and business logic.

**Workflows:**
1. **Input Phase**: User enters reference number and category ID
2. **Fetch Phase**: Backend lookup displays fine details
3. **Payment Phase**: Modal form for card details
4. **Confirmation Phase**: Success/error feedback

**UI Components:**
- Form fields with validation
- Card details section with automatic formatting
- Status badges (pending/paid/overdue)
- Loading and error states
- Success confirmation

---

## 🌐 API Integration

### Base URL Configuration

Edit `lib/services/api_service.dart`:
```dart
static const String baseUrl = 'http://localhost:5000/api';
```

### Expected API Endpoints

#### **1. Fetch Fine Details**
```
GET /api/fines?referenceNumber=TFM-2024-001&categoryId=SPEED001

Response (200 OK):
{
  "data": {
    "fineReferenceNumber": "TFM-2024-001",
    "categoryId": "SPEED001",
    "fineAmount": 5000.00,
    "violatorName": "John Doe",
    "violatorLicenseNumber": "BL123456",
    "violationType": "Exceeding Speed Limit",
    "issuedDate": "2024-06-10T14:30:00Z",
    "status": "pending",
    "locationDescription": "Colombo Main Road"
  }
}

Response (404 Not Found):
{
  "error": "Fine not found"
}
```

#### **2. Process Payment**
```
POST /api/payments

Request Body:
{
  "fineReferenceNumber": "TFM-2024-001",
  "categoryId": "SPEED001",
  "paymentMethod": "card",
  "amount": 5000.00,
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "cardHolderName": "JOHN DOE",
    "expiryMonth": "12",
    "expiryYear": "25",
    "cvv": "123"
  },
  "timestamp": "2024-06-14T10:15:00Z"
}

Response (200 OK):
{
  "success": true,
  "message": "Payment processed successfully",
  "confirmationNumber": "CONF-2024-001234",
  "transactionId": "TXN-2024-5678",
  "smsStatus": "sent"
}

Response (409 Conflict):
{
  "error": "This fine has already been paid"
}
```

---

## 💻 Development Workflow

### Adding New Features

1. **Create Model Classes** (if needed)
   ```bash
   # Add to lib/models/
   ```

2. **Add API Methods**
   ```dart
   // In lib/services/api_service.dart
   Future<SomeModel> newApiMethod() async {
     try {
       // Implementation
     } catch (e) {
       throw Exception('Error: $e');
     }
   }
   ```

3. **Create UI Screen**
   ```dart
   // In lib/screens/
   class NewScreen extends StatefulWidget {
     // Implementation
   }
   ```

4. **Wire Navigation**
   ```dart
   // In lib/main.dart routes
   '/newRoute': (context) => const NewScreen(),
   ```

### Code Standards

- **Dart Style Guide**: Follow [Effective Dart](https://dart.dev/guides/language/effective-dart)
- **Comments**: Use `///` for public documentation
- **Error Handling**: Always include try-catch blocks in async operations
- **Null Safety**: Use non-null assertions carefully, prefer null-coalescing
- **Widget Naming**: Suffix all Widgets with `Widget` or screen name

---

## 🧪 Testing & Debugging

### Debug Mode
```bash
flutter run -v  # Verbose logging
```

### Hot Reload
```bash
# While app is running, press 'r' in terminal to hot reload
# Preserves app state, updates code changes instantly
```

### Debugging in VS Code

1. Set breakpoints by clicking left of line numbers
2. Press `F5` to start debugging
3. Use Debug Console to inspect variables
4. Press `F10` (Step Over) or `F11` (Step Into)

### Logcat Monitoring
```bash
flutter logs
```

### Device Logs
```bash
adb logcat | grep flutter
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Device not detected | Enable USB Debugging on device |
| Dependency conflict | Run `flutter pub get --offline` or `flutter clean` |
| Hot reload fails | Do full rebuild with `flutter run` |
| API connection fails | Check baseUrl in `api_service.dart` |
| Payment validation error | Verify card format and expiry date |

---

## 📦 Dependency Management

### Adding New Package

```bash
flutter pub add package_name
```

### Updating Packages

```bash
flutter pub upgrade
```

### Checking for Vulnerabilities

```bash
flutter pub outdated
```

---

## 🔒 Security Considerations

1. **Card Details**:
   - Never log sensitive card information
   - Use HTTPS for all API communication
   - Consider PCI DSS compliance for production
   - Mask card numbers in display (`**** **** **** 1111`)

2. **API Keys**:
   - Store in environment variables, not in code
   - Use `.env` file (excluded from git)

3. **Input Validation**:
   - All user inputs validated client-side
   - Server-side validation also required
   - Prevent SQL injection via parameterized queries

---

## 📝 Git Workflow

```bash
# Create/switch to mobileApp branch
git checkout -b mobileApp

# Make changes
git add .
git commit -m "feat: add payment functionality"

# Push to branch
git push origin mobileApp

# Create Pull Request to main (after web team review)
```

### Branch Rules
- Keep `main` branch protected
- Never commit sensitive data
- Use `.gitignore` to exclude build artifacts
- Include meaningful commit messages

---

## 📞 Support & Troubleshooting

For issues specific to this project:
1. Check existing Flutter documentation: [flutter.dev](https://flutter.dev)
2. Review error messages in VS Code Problems panel
3. Check `flutter doctor` for environment issues
4. Review API response logs in Debug Console

---

## 📄 License & Attribution

This is part of the National Traffic Fine Management System (NTFMS) - Academic Project.
All rights reserved.

**Last Updated:** June 2026

---

## 📁 Project Structure

