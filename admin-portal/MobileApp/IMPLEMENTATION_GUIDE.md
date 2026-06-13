# NTFMS Mobile App - Implementation Guide

## Overview

This document provides a comprehensive guide to the NTFMS Mobile Application architecture, implementation details, and usage patterns. It's designed for developers maintaining and extending the codebase.

---

## Project Initialization

### Initial Setup Commands

```bash
# 1. Navigate to the MobileApp directory
cd MobileApp

# 2. Create Flutter project structure (if not already done)
flutter create . --org lk.gov.ntfms --project-name ntfms_mobile

# 3. Install all dependencies
flutter pub get

# 4. Run code generation (if using build_runner)
flutter pub run build_runner build --delete-conflicting-outputs

# 5. Launch the app
flutter run
```

---

## File Structure Explanation

### `lib/main.dart`
**Purpose:** Application entry point and theme configuration.

**Key Components:**
- `main()`: Starts the Flutter app
- `NTFMSApp`: Root MaterialApp widget
- Theme configuration with Material Design 3
- Global route definitions

**Example Usage:**
```dart
void main() {
  runApp(const NTFMSApp());
}
```

### `lib/models/fine_model.dart`
**Purpose:** Data model for fine information from backend API.

**Key Methods:**
- `FineModel.fromJson()`: Parse JSON from API
- `toJson()`: Convert model to JSON for requests
- `copyWith()`: Create modified copies

**Example Usage:**
```dart
// Parse API response
final fine = FineModel.fromJson(jsonData);

// Get specific data
print(fine.fineAmount); // 5000.00
print(fine.status);      // 'pending'
```

### `lib/services/api_service.dart`
**Purpose:** REST API communication layer with error handling.

**Core Methods:**

1. **fetchFineDetails()**
   ```dart
   try {
     final fine = await ApiService.fetchFineDetails(
       fineReferenceNumber: 'TFM-2024-001',
       categoryId: 'SPEED001',
     );
     // Use the fine data
   } catch (e) {
     print('Error: $e');
   }
   ```

2. **processPayment()**
   ```dart
   final response = await ApiService.processPayment(
     fineReferenceNumber: 'TFM-2024-001',
     categoryId: 'SPEED001',
     paymentDetails: {
       'amount': 5000.00,
       'cardNumber': '4111111111111111',
       'cardHolderName': 'JOHN DOE',
       'expiryMonth': '12',
       'expiryYear': '25',
       'cvv': '123',
     },
   );
   ```

**Helper Methods:**
- `isValidCardNumber()`: Validates card using Luhn algorithm
- `maskCardNumber()`: Hides sensitive digits

### `lib/screens/fine_payment_screen.dart`
**Purpose:** Main user interface for payment workflow.

**UI States:**
1. **Idle State**: User enters reference number and category ID
2. **Loading State**: Fetching fine details from API
3. **Fine Fetched**: Displays fine information
4. **Payment Form**: Card details input
5. **Processing**: Payment submission in progress
6. **Success**: Confirmation message displayed

**Component Widgets:**
- `_buildFineReferenceForm()`: Reference input fields
- `_buildFineDetailsCard()`: Display fetched fine info
- `_buildPaymentForm()`: Card input fields
- `_buildErrorMessage()`: Error display
- `_buildSuccessMessage()`: Success confirmation
- `_buildStatusBadge()`: Visual status indicator

### `lib/utils/constants.dart`
**Purpose:** Global constants and utility functions.

**Contents:**
- `AppConstants`: API URLs, endpoints, timeout settings
- `ValidationUtils`: Input validation methods
- `AppLogger`: Debug logging utilities
- `AppException`: Custom exception class

**Example Usage:**
```dart
// Use constants
if (!ValidationUtils.isValidCategoryId(input)) {
  AppLogger.error('Invalid category ID');
}

// Log operations
AppLogger.logApiRequest('/fines', 'GET');
```

### `lib/utils/app_theme.dart`
**Purpose:** Centralized theme, colors, and styling.

**Exports:**
- `AppColors`: Color palette
- `AppTextStyles`: Text style definitions
- `AppSpacing`: Spacing constants
- `AppTheme`: Material theme
- `ResponsiveUtils`: Screen size utilities

**Example Usage:**
```dart
Container(
  color: AppColors.success,
  padding: const EdgeInsets.all(AppSpacing.lg),
  child: Text('Payment Complete', style: AppTextStyles.titleLarge),
)
```

---

## Data Flow Architecture

### Step 1: User Input
```
User enters Reference Number & Category ID
        ↓
    Form Validation
        ↓
    Input State Stored
```

### Step 2: Fine Fetching
```
_fetchFineDetails() called
        ↓
ApiService.fetchFineDetails() makes GET request
        ↓
Backend validates and returns fine details
        ↓
FineModel.fromJson() deserializes response
        ↓
UI displays fine information
```

### Step 3: Payment Processing
```
User enters card details
        ↓
Form Validation (Luhn, expiry, CVV)
        ↓
_processPayment() called
        ↓
ApiService.processPayment() makes POST request
        ↓
Backend processes payment & triggers SMS
        ↓
Success confirmation displayed
        ↓
Form cleared, ready for next payment
```

---

## State Management Pattern

### Local State (StatefulWidget)
```dart
class _FinePaymentScreenState extends State<FinePaymentScreen> {
  FineModel? _fetchedFine;
  bool _isLoading = false;
  String? _errorMessage;
  
  // State updates trigger rebuild
  setState(() {
    _fetchedFine = fine;
    _isLoading = false;
  });
}
```

### TextEditingControllers for Form Fields
```dart
final _referenceNumberController = TextEditingController();
final _cardNumberController = TextEditingController();

// Dispose to free resources
@override
void dispose() {
  _referenceNumberController.dispose();
  super.dispose();
}
```

### Error Handling Pattern
```dart
try {
  // API call or operation
  final result = await apiCall();
} on SocketException {
  // Network error
  setState(() => _errorMessage = 'Network error');
} on FormatException {
  // JSON parsing error
  setState(() => _errorMessage = 'Invalid response format');
} catch (e) {
  // Generic error
  setState(() => _errorMessage = e.toString());
}
```

---

## API Integration Workflow

### 1. Configure Base URL
```dart
// lib/services/api_service.dart
static const String baseUrl = 'http://your-backend-url.com/api';
```

### 2. Update for Production
```dart
// Add to .env or platform channels for dynamic configuration
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:5000/api',
);
```

### 3. Handling Different Response Formats
```dart
// If backend returns wrapped response
factory FineModel.fromJson(Map<String, dynamic> json) {
  return FineModel(
    // Parse from json['data'] or root level
    fineReferenceNumber: json['data']['fineReferenceNumber'] ?? json['fineReferenceNumber'],
    // ... other fields
  );
}
```

---

## Validation Rules

### Card Number Validation
```dart
// Uses Luhn algorithm (industry standard)
ApiService.isValidCardNumber('4111111111111111'); // true
ApiService.isValidCardNumber('invalid');        // false
```

### Reference Number Validation
```dart
// Must be alphanumeric with optional hyphens
ValidationUtils.isValidReferenceNumber('TFM-2024-001'); // true
ValidationUtils.isValidReferenceNumber('');             // false
```

### Category ID Validation
```dart
// Must be alphanumeric, minimum 3 characters
ValidationUtils.isValidCategoryId('SPEED001'); // true
ValidationUtils.isValidCategoryId('S1');       // false
```

---

## UI Patterns

### Loading State
```dart
if (_isLoading)
  ElevatedButton(
    onPressed: null, // Disabled
    child: SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(strokeWidth: 2),
    ),
  )
```

### Error Display
```dart
if (_errorMessage != null)
  Container(
    padding: EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.red[50],
      border: Border.all(color: Colors.red),
    ),
    child: Row(
      children: [
        Icon(Icons.error_outline, color: Colors.red[700]),
        SizedBox(width: 12),
        Expanded(child: Text(_errorMessage)),
      ],
    ),
  )
```

### Success Message
```dart
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(
    content: Text('Payment successful!'),
    backgroundColor: Colors.green,
    duration: Duration(seconds: 3),
  ),
);
```

---

## Extending the Application

### Adding a New Payment Method

1. **Update Model** (if needed):
   ```dart
   // lib/models/fine_model.dart
   // Add new field if required
   ```

2. **Add API Method**:
   ```dart
   // lib/services/api_service.dart
   Future<Map<String, dynamic>> processWalletPayment({
     required String fineReferenceNumber,
     required String walletId,
   }) async {
     // Implementation
   }
   ```

3. **Update UI**:
   ```dart
   // lib/screens/fine_payment_screen.dart
   ElevatedButton(
     onPressed: () => _selectPaymentMethod(),
     child: Text('Select Payment Method'),
   )
   ```

### Adding Transaction History

1. **Create New Model**:
   ```dart
   // lib/models/transaction_model.dart
   class TransactionModel {
     // Transaction details
   }
   ```

2. **Add API Method**:
   ```dart
   // lib/services/api_service.dart
   Future<List<TransactionModel>> fetchTransactionHistory() async {
     // Implementation
   }
   ```

3. **Create New Screen**:
   ```dart
   // lib/screens/transaction_history_screen.dart
   class TransactionHistoryScreen extends StatefulWidget {
     // Implementation
   }
   ```

4. **Update Navigation**:
   ```dart
   // lib/main.dart
   routes: {
     '/payment': (context) => const FinePaymentScreen(),
     '/history': (context) => const TransactionHistoryScreen(),
   }
   ```

---

## Performance Optimization

### Image Loading
```dart
Image.network(
  'https://example.com/image.png',
  cacheHeight: 300,
  cacheWidth: 300,
)
```

### List Performance
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ListItem(items[index]),
)
```

### Debouncing Rapid Requests
```dart
Timer? _debounce;

void _onSearchChanged(String query) {
  _debounce?.cancel();
  _debounce = Timer(Duration(milliseconds: 500), () {
    _performSearch(query);
  });
}
```

---

## Testing

### Unit Test Example
```dart
// test/services/api_service_test.dart
void main() {
  test('fetchFineDetails returns FineModel', () async {
    final service = ApiService();
    final fine = await service.fetchFineDetails(
      fineReferenceNumber: 'TFM-2024-001',
      categoryId: 'SPEED001',
    );
    expect(fine.fineAmount, greaterThan(0));
  });
}
```

### Widget Test Example
```dart
// test/screens/fine_payment_screen_test.dart
void main() {
  testWidgets('FinePaymentScreen renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const NTFMSApp());
    expect(find.byType(FinePaymentScreen), findsOneWidget);
  });
}
```

---

## Troubleshooting

### Common Issues

**Issue:** "Device not found"
```bash
# Solution: Check connected devices
flutter devices
```

**Issue:** "Dependency conflicts"
```bash
# Solution: Clean and reinstall
flutter clean
flutter pub get
```

**Issue:** "Hot reload not working"
```bash
# Solution: Full restart
flutter run
```

**Issue:** "API connection failed"
```dart
// Check base URL configuration
// Verify backend is running
// Check network connectivity
```

---

## Git Workflow

### Branch Structure
```
main (protected)
  ↑
  └── mobileApp (development)
```

### Commit Convention
```
feat: Add new payment method
fix: Resolve card validation issue
docs: Update API documentation
refactor: Simplify error handling
```

### Before Committing
```bash
flutter analyze      # Check code quality
flutter format .    # Format all files
flutter test        # Run tests
```

---

## Deployment Checklist

- [ ] Update API base URL for production
- [ ] Disable debug prints (use Flutter logger)
- [ ] Run `flutter analyze` for warnings
- [ ] Test on both Android and iOS
- [ ] Verify payment processing works
- [ ] Check error handling
- [ ] Build release APK/IPA
- [ ] Test on real devices
- [ ] Update version in pubspec.yaml

---

## Additional Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Material Design 3](https://material.io/blog/announcing-material-you)
- [HTTP Package Guide](https://pub.dev/packages/http)
- [Provider Package](https://pub.dev/packages/provider)

---

**Document Version:** 1.0  
**Last Updated:** June 2026
