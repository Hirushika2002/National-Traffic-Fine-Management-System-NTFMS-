import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/fine_model.dart';
import '../utils/constants.dart';

/// NTFMS Mobile — API Service Layer
///
/// Communicates with the Express REST API backend on port 4000.
class ApiService {
  
  /// Helper to convert user category string inputs into integer IDs
  static int _mapCategoryToId(String cat) {
    final clean = cat.trim().toUpperCase();
    if (clean == '1' || clean == 'CAT-01' || clean == 'SEC_140') return 1;
    if (clean == '2' || clean == 'CAT-02' || clean == 'SEC_151') return 2;
    if (clean == '3' || clean == 'CAT-03' || clean == 'SEC_119' || clean == 'CAT-05') return 3;
    if (clean == '4' || clean == 'CAT-04' || clean == 'SEC_128') return 4;
    if (clean == '5' || clean == 'CAT-05' || clean == 'SEC_160' || clean == 'CAT-07' || clean == 'CAT-09') return 5;
    
    // Pattern matches
    if (clean.contains('01') || clean.contains('140')) return 1;
    if (clean.contains('02') || clean.contains('151')) return 2;
    if (clean.contains('03') || clean.contains('119') || clean.contains('05')) return 3;
    if (clean.contains('04') || clean.contains('128')) return 4;
    if (clean.contains('07') || clean.contains('160') || clean.contains('09')) return 5;
    
    return int.tryParse(clean) ?? 1;
  }

  /// Parses error message from REST API response
  static String _parseErrorMessage(String body) {
    try {
      final decoded = json.decode(body);
      return decoded['error'] as String? ?? 'An error occurred';
    } catch (_) {
      return 'Request failed';
    }
  }

  // ── Fine Operations ──────────────────────────────────────────────

  /// Fetch fine details by reference number and category ID.
  /// Hits the REST API `/fines/lookup`.
  static Future<FineModel> fetchFineDetails({
    required String fineReferenceNumber,
    required String categoryId,
  }) async {
    final catId = _mapCategoryToId(categoryId);
    final ref = fineReferenceNumber.trim().toUpperCase();
    final url = Uri.parse('${AppConstants.apiBaseUrl}/fines/lookup?referenceNo=$ref&categoryId=$catId');

    try {
      final response = await http.get(url, headers: {'Content-Type': 'application/json'});
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return FineModel.fromJson(data);
      } else {
        throw Exception(_parseErrorMessage(response.body));
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Could not connect to the Police server: $e');
    }
  }

  /// Process fine payment (hits REST API `/payments`).
  static Future<Map<String, dynamic>> processPayment({
    required String fineReferenceNumber,
    required String categoryId,
    required Map<String, dynamic> paymentDetails,
  }) async {
    final url = Uri.parse('${AppConstants.apiBaseUrl}/payments');

    try {
      // 1. First lookup fine to obtain the integer database ID
      final fine = await fetchFineDetails(
        fineReferenceNumber: fineReferenceNumber,
        categoryId: categoryId,
      );

      if (fine.id == null) {
        throw Exception('Fine registry ID is missing.');
      }

      // 2. Prepare payload matching createPaymentSchema (paymentValidators.js)
      final cardNo = (paymentDetails['cardNumber'] as String).replaceAll(RegExp(r'\s'), '');
      
      // Pad expiry month/year with leading zeros/formatting
      final expMonth = (paymentDetails['expiryMonth'] as String).padLeft(2, '0');
      final expYearRaw = paymentDetails['expiryYear'] as String;
      final expYear = expYearRaw.length > 2 ? expYearRaw.substring(expYearRaw.length - 2) : expYearRaw.padLeft(2, '0');
      
      final payload = {
        'fineId': fine.id,
        'amount': fine.fineAmount,
        'paymentMethod': 'CREDIT_CARD', // Maps to paymentMethod enum
        'channel': 'ANDROID', // Maps to Android channel enum
        'payerName': paymentDetails['cardHolderName'] ?? 'Motorist Payer',
        'payerContact': '0771234567', // Sri Lankan mobile fallback for SMS notify
        'cardNumber': cardNo,
        'expiryDate': '$expMonth/$expYear', // MM/YY
        'cvv': paymentDetails['cvv'] ?? '123',
      };

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'message': 'Payment processed successfully',
          'confirmationNumber': data['transactionRef'] ?? 'CONF-OK',
          'transactionId': data['id']?.toString() ?? 'TXN-OK',
          'smsStatus': 'sent',
        };
      } else {
        throw Exception(_parseErrorMessage(response.body));
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Payment transaction failed: $e');
    }
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
