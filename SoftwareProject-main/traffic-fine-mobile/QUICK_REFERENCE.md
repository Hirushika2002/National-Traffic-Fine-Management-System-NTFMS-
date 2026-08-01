# NTFMS Mobile App - Quick Reference Guide

## 📂 Complete File Structure

```
MobileApp/
├── lib/
│   ├── main.dart                           ✅ Entry point, App theme
│   ├── models/
│   │   └── fine_model.dart                 ✅ Fine data model
│   ├── screens/
│   │   └── fine_payment_screen.dart        ✅ Main payment UI
│   ├── services/
│   │   └── api_service.dart                ✅ REST API client
│   └── utils/
│       ├── constants.dart                  ✅ App constants & validation
│       └── app_theme.dart                  ✅ Theme & styling
├── pubspec.yaml                            ✅ Dependencies
├── .gitignore                              ✅ Git exclusions
├── README.md                               ✅ Setup & features guide
├── IMPLEMENTATION_GUIDE.md                 ✅ Developer workflow
└── ARCHITECTURE_DIAGRAMS.md                ✅ System architecture
```

## 🚀 Getting Started in 30 Seconds

```bash
# 1. Navigate to project
cd MobileApp

# 2. Install dependencies
flutter pub get

# 3. Run app
flutter run

# Done! 🎉
```

## 🔧 Key File Quick Reference

### I need to...

**...understand the data model?**
→ Read: `lib/models/fine_model.dart`
→ Key Methods: `fromJson()`, `toJson()`, `copyWith()`

**...call the backend API?**
→ Read: `lib/services/api_service.dart`
→ Key Methods: `fetchFineDetails()`, `processPayment()`
→ Helpers: `isValidCardNumber()`, `maskCardNumber()`

**...modify the UI?**
→ Read: `lib/screens/fine_payment_screen.dart`
→ Key Methods: `_buildFineReferenceForm()`, `_buildPaymentForm()`, `_buildFineDetailsCard()`

**...add validation rules?**
→ Read: `lib/utils/constants.dart`
→ Class: `ValidationUtils`

**...change colors/fonts/spacing?**
→ Read: `lib/utils/app_theme.dart`
→ Classes: `AppColors`, `AppTextStyles`, `AppSpacing`

**...set up deployment?**
→ Read: `README.md` → "Deployment Checklist"

---

## 🔌 API Configuration

**File:** `lib/services/api_service.dart`

**Change base URL (line 9):**
```dart
static const String baseUrl = 'YOUR_API_URL';
```

**Expected Endpoints:**
- `GET /api/fines?referenceNumber=X&categoryId=Y`
- `POST /api/payments`

---

## ✅ Common Tasks Checklist

### Setup Environment
- [ ] Flutter SDK installed (v3.0+)
- [ ] VS Code with Flutter/Dart extensions
- [ ] Android Emulator or device connected
- [ ] `flutter doctor` shows all green

### Configure Application
- [ ] Update API base URL in `api_service.dart`
- [ ] Configure backend endpoints
- [ ] Test API connectivity
- [ ] Update theme colors in `app_theme.dart`

### Development Workflow
- [ ] Run `flutter pub get` after changes
- [ ] Use `flutter format .` before committing
- [ ] Run `flutter analyze` for linting
- [ ] Press `r` for hot reload during development
- [ ] Use `flutter run -v` for debugging

### Before Deployment
- [ ] Run `flutter analyze` (no errors)
- [ ] Test on physical device
- [ ] Test payment flow end-to-end
- [ ] Update version in `pubspec.yaml`
- [ ] Build release APK/IPA
- [ ] Test on multiple screen sizes

---

## 🐛 Debugging Tips

### View Logs
```bash
flutter logs
```

### Verbose Output
```bash
flutter run -v
```

### Debug Breakpoints
1. Set breakpoint by clicking line number in VS Code
2. Press `F5` to start debugging
3. Inspect variables in Debug Console
4. Press `F10` to step over, `F11` to step into

### Check API Calls
- Add print statements in `ApiService` methods
- Use Postman to test backend endpoints
- Check backend logs for errors

### Device Connection Issues
```bash
flutter devices          # List devices
flutter clean           # Clean build
flutter pub get         # Fresh dependencies
```

---

## 📝 Code Style Guidelines

### Naming Conventions
```dart
// Variables: camelCase
String fineReferenceNumber;

// Classes: PascalCase
class FineModel {}

// Constants: lowercase with underscores
const int minPasswordLength = 8;

// Private members: leading underscore
String _privateVariable;
```

### Comments
```dart
/// Public API documentation (///)
///
/// Can span multiple lines with examples
void publicMethod() {}

// Regular comment for implementation details
var result = expensive();

// TODO: Fix this later
// FIXME: This needs improvement
```

### Error Handling Pattern
```dart
try {
  final result = await apiCall();
  // Use result
} on SocketException catch (e) {
  // Network-specific handling
} on FormatException catch (e) {
  // JSON parsing error
} catch (e) {
  // Generic error
  AppLogger.error('Error: $e');
}
```

---

## 🎨 UI Components Pattern

### Text with Style
```dart
Text(
  'Hello',
  style: AppTextStyles.titleLarge,
)
```

### Button
```dart
ElevatedButton(
  onPressed: () => _handlePress(),
  child: const Text('Click Me'),
)
```

### Form Field
```dart
TextFormField(
  controller: _controller,
  decoration: InputDecoration(
    labelText: 'Label',
    hintText: 'Hint text',
    prefixIcon: Icon(Icons.something),
  ),
  validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
)
```

### Error Message
```dart
Container(
  padding: const EdgeInsets.all(AppSpacing.md),
  decoration: BoxDecoration(
    color: Colors.red[50],
    border: Border.all(color: Colors.red),
    borderRadius: BorderRadius.circular(AppRadii.md),
  ),
  child: Text(errorMessage, style: AppTextStyles.errorText),
)
```

### Loading State
```dart
_isLoading
    ? const CircularProgressIndicator()
    : ElevatedButton(
        onPressed: _handleAction,
        child: const Text('Action'),
      )
```

---

## 🔐 Security Checklist

- [ ] Never log card numbers or CVV
- [ ] Use HTTPS for all API calls (not HTTP)
- [ ] Validate all user inputs
- [ ] Don't commit `.env` or secrets
- [ ] Mask card numbers in display
- [ ] Use Luhn validation for cards
- [ ] Implement rate limiting on API calls
- [ ] Handle errors without exposing backend details
- [ ] Store sensitive data securely
- [ ] Keep dependencies updated

---

## 📊 Performance Optimization

### For Large Lists
```dart
ListView.builder(  // Not ListView with children
  itemCount: items.length,
  itemBuilder: (context, index) => ListTile(...),
)
```

### Image Caching
```dart
Image.network(
  url,
  cacheHeight: 300,
  cacheWidth: 300,
)
```

### Avoid Rebuilds
```dart
// Use const where possible
const Text('Static text')

// Use const constructors
const SizedBox(width: 16, height: 16)
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Setup instructions, features, tech stack |
| `IMPLEMENTATION_GUIDE.md` | Developer workflow, patterns, extending |
| `ARCHITECTURE_DIAGRAMS.md` | Visual system design and data flow |
| This file | Quick reference for common tasks |

---

## 🆘 Getting Help

### Flutter Docs
- https://flutter.dev/docs
- https://dart.dev/guides

### Packages Used
- **http**: https://pub.dev/packages/http
- **dio**: https://pub.dev/packages/dio
- **provider**: https://pub.dev/packages/provider

### Project Resources
- Web App: `../WebApp/` (React, DO NOT MODIFY)
- API Backend: Configure in `lib/services/api_service.dart`

---

## 📋 Deployment Checklist

```bash
# Before deployment
flutter analyze          # ✅ No errors
flutter test            # ✅ All tests pass
flutter pub upgrade     # ✅ Latest packages
flutter clean          # ✅ Clean build

# Build for Android
flutter build apk --release

# Build for iOS
flutter build ios --release

# After deployment
# ✅ Test on real device
# ✅ Verify API connectivity
# ✅ Test payment flow
# ✅ Monitor error logs
```

---

## 🎯 Project Status

**✅ Completed:**
- Core project structure
- Models and data mapping
- API service layer with error handling
- Main payment UI screen
- Form validation
- Constants and utilities
- Material Design 3 theming
- Comprehensive documentation

**🔄 Next Steps:**
1. Configure API base URL
2. Test with mock backend
3. Implement additional payment methods (optional)
4. Add transaction history (optional)
5. Write unit tests
6. Deploy to TestFlight/Play Store

---

**Quick Links:**
- 📖 Setup: See `README.md`
- 🛠️ Development: See `IMPLEMENTATION_GUIDE.md`
- 🏗️ Architecture: See `ARCHITECTURE_DIAGRAMS.md`
- ⚙️ API: Configure `lib/services/api_service.dart`
- 🎨 Theme: Customize `lib/utils/app_theme.dart`

**Last Updated:** June 2026
