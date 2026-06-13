import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io' show Platform;
import '../models/fine_model.dart';

/// API Service Layer
/// Handles all REST API communication with the backend for fine management
class ApiService {
  // Base API URL - Configure this based on your backend environment
  static final String baseUrl = Platform.isAndroid
      ? 'http://10.0.2.2:5000/api'
      : 'http://localhost:5000/api';
  static final String finesEndpoint = '$baseUrl/fines';
  static final String paymentsEndpoint = '$baseUrl/payments';

  // HTTP timeout duration
  static const Duration timeoutDuration = Duration(seconds: 30);

  /// Fetch fine details from the backend API
  ///
  /// Parameters:
  ///   - fineReferenceNumber: The unique identifier printed on the physical ticket
  ///   - categoryId: The traffic fine category identifier
  ///
  /// Returns: FineModel containing complete fine details
  /// Throws: Exception if the fine is not found or API request fails
  static Future<FineModel> fetchFineDetails({
    required String fineReferenceNumber,
    required String categoryId,
  }) async {
    try {
      // Validate inputs
      if (fineReferenceNumber.trim().isEmpty || categoryId.trim().isEmpty) {
        throw Exception('Fine Reference Number and Category ID are required');
      }

      // Construct query parameters
      final queryParams = {
        'referenceNumber': fineReferenceNumber.trim(),
        'categoryId': categoryId.trim(),
      };

      // Build the full URL with query parameters
      final uri = Uri.parse(
        finesEndpoint,
      ).replace(queryParameters: queryParams);

      // Make the GET request to fetch fine details
      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          )
          .timeout(timeoutDuration);

      // Handle different HTTP status codes
      if (response.statusCode == 200) {
        // Successful response - parse and return FineModel
        final jsonData = jsonDecode(response.body);
        return FineModel.fromJson(jsonData['data'] ?? jsonData);
      } else if (response.statusCode == 404) {
        throw Exception(
          'Fine not found. Please verify the Reference Number and Category ID.',
        );
      } else if (response.statusCode == 400) {
        throw Exception('Invalid input. Please check your entries.');
      } else if (response.statusCode == 500) {
        throw Exception('Server error. Please try again later.');
      } else {
        throw Exception('Failed to fetch fine details: ${response.statusCode}');
      }
    } on http.ClientException catch (e) {
      throw Exception('Network error: ${e.message}');
    } on FormatException catch (e) {
      throw Exception('Invalid response format: ${e.message}');
    } catch (e) {
      throw Exception('An unexpected error occurred: $e');
    }
  }

  /// Process fine payment through the backend API
  ///
  /// Parameters:
  ///   - fineReferenceNumber: The fine reference number
  ///   - categoryId: The category identifier
  ///   - paymentDetails: Map containing payment information (amount, card details, etc.)
  ///
  /// Returns: Map with payment response data including confirmation number
  /// Throws: Exception if payment processing fails
  static Future<Map<String, dynamic>> processPayment({
    required String fineReferenceNumber,
    required String categoryId,
    required Map<String, dynamic> paymentDetails,
  }) async {
    try {
      // Validate required inputs
      if (fineReferenceNumber.trim().isEmpty ||
          categoryId.trim().isEmpty ||
          paymentDetails.isEmpty) {
        throw Exception('Missing required payment information');
      }

      // Construct payment payload
      final paymentPayload = {
        'fineReferenceNumber': fineReferenceNumber.trim(),
        'categoryId': categoryId.trim(),
        'paymentMethod': paymentDetails['paymentMethod'] ?? 'card',
        'amount': paymentDetails['amount'],
        'cardDetails': {
          'cardNumber': paymentDetails['cardNumber'] ?? '',
          'cardHolderName': paymentDetails['cardHolderName'] ?? '',
          'expiryMonth': paymentDetails['expiryMonth'] ?? '',
          'expiryYear': paymentDetails['expiryYear'] ?? '',
          'cvv': paymentDetails['cvv'] ?? '',
        },
        'timestamp': DateTime.now().toIso8601String(),
      };

      // Make POST request to process payment
      final response = await http
          .post(
            Uri.parse(paymentsEndpoint),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode(paymentPayload),
          )
          .timeout(timeoutDuration);

      // Handle different HTTP status codes
      if (response.statusCode == 200 || response.statusCode == 201) {
        // Successful payment - parse response
        final jsonData = jsonDecode(response.body);
        return {
          'success': true,
          'message': jsonData['message'] ?? 'Payment processed successfully',
          'confirmationNumber': jsonData['confirmationNumber'] ?? '',
          'transactionId': jsonData['transactionId'] ?? '',
          'smsStatus':
              jsonData['smsStatus'] ?? 'sent', // SMS to traffic officer
        };
      } else if (response.statusCode == 400) {
        throw Exception(
          'Invalid payment details. Please verify and try again.',
        );
      } else if (response.statusCode == 402) {
        throw Exception(
          'Payment declined. Please try a different payment method.',
        );
      } else if (response.statusCode == 409) {
        throw Exception('This fine has already been paid.');
      } else if (response.statusCode == 500) {
        throw Exception('Payment processing error. Please try again later.');
      } else {
        throw Exception('Payment failed: ${response.statusCode}');
      }
    } on http.ClientException catch (e) {
      throw Exception('Network error during payment: ${e.message}');
    } on FormatException catch (e) {
      throw Exception('Invalid payment response format: ${e.message}');
    } catch (e) {
      throw Exception('Payment processing failed: $e');
    }
  }

  /// Helper method to validate card number format (Luhn algorithm)
  static bool isValidCardNumber(String cardNumber) {
    // Remove spaces and non-digit characters
    final cleanNumber = cardNumber.replaceAll(RegExp(r'\D'), '');

    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    // Luhn algorithm implementation
    int sum = 0;
    bool isEven = false;

    for (int i = cleanNumber.length - 1; i >= 0; i--) {
      int digit = int.parse(cleanNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 == 0;
  }

  /// Mask sensitive card information for display
  static String maskCardNumber(String cardNumber) {
    final cleanNumber = cardNumber.replaceAll(RegExp(r'\D'), '');
    if (cleanNumber.length < 4) return '****';
    return '**** **** **** ${cleanNumber.substring(cleanNumber.length - 4)}';
  }
}
