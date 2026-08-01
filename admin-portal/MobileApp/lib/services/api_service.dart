import '../models/fine_model.dart';
import 'firebase_service.dart';

/// NTFMS Mobile — API Service Layer
///
/// All data operations are now handled by FirebaseService (Firestore).
/// The HTTP REST API stubs have been replaced.
///
/// Card validation helpers (Luhn algorithm, card masking) are kept here
/// as they are pure Dart utilities with no network dependency.
class ApiService {
  // ── Fine Operations ──────────────────────────────────────────────

  /// Fetch fine details by reference number and category ID.
  /// Delegates to FirebaseService → Firestore.
  static Future<FineModel> fetchFineDetails({
    required String fineReferenceNumber,
    required String categoryId,
  }) async {
    return FirebaseService.fetchFineDetails(
      fineReferenceNumber: fineReferenceNumber,
      categoryId:          categoryId,
    );
  }

  /// Process fine payment (marks fine as Paid in Firestore).
  static Future<Map<String, dynamic>> processPayment({
    required String fineReferenceNumber,
    required String categoryId,
    required Map<String, dynamic> paymentDetails,
  }) async {
    return FirebaseService.processPayment(
      fineReferenceNumber: fineReferenceNumber,
      categoryId:          categoryId,
      paymentDetails:      paymentDetails,
    );
  }

  // ── Validation Helpers ────────────────────────────────────────────

  /// Luhn algorithm — validates a credit card number.
  static bool isValidCardNumber(String cardNumber) {
    final cleanNumber = cardNumber.replaceAll(RegExp(r'\D'), '');

    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

    int sum     = 0;
    bool isEven = false;

    for (int i = cleanNumber.length - 1; i >= 0; i--) {
      int digit = int.parse(cleanNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum    += digit;
      isEven = !isEven;
    }

    return sum % 10 == 0;
  }

  /// Mask a card number for safe display (shows only last 4 digits).
  static String maskCardNumber(String cardNumber) {
    final cleanNumber = cardNumber.replaceAll(RegExp(r'\D'), '');
    if (cleanNumber.length < 4) return '****';
    return '**** **** **** ${cleanNumber.substring(cleanNumber.length - 4)}';
  }
}
