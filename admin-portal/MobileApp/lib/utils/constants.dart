import 'dart:io' show Platform;

/// Constants and configuration for the NTFMS Mobile Application
class AppConstants {
  // API Configuration
  static final String apiBaseUrl = Platform.isAndroid
      ? 'http://10.0.2.2:5000/api'
      : 'http://localhost:5000/api';
  static const int apiTimeoutSeconds = 30;

  // Endpoints
  static const String finesEndpoint = '/fines';
  static const String paymentsEndpoint = '/payments';

  // Fine Status
  static const String statusPending = 'pending';
  static const String statusPaid = 'paid';
  static const String statusOverdue = 'overdue';

  // Payment Methods
  static const String paymentMethodCard = 'card';
  static const String paymentMethodMobileWallet = 'wallet';

  // Error Messages
  static const String errorNetworkFailure = 'Network connection failed';
  static const String errorServerError = 'Server error occurred';
  static const String errorInvalidInput = 'Invalid input provided';
  static const String errorFineNotFound = 'Fine not found';
  static const String errorPaymentFailed = 'Payment processing failed';

  // Success Messages
  static const String successPaymentComplete = 'Payment completed successfully';
  static const String successFineRetrieved = 'Fine details retrieved';

  // UI Configuration
  static const double defaultPadding = 16.0;
  static const double defaultBorderRadius = 8.0;
  static const Duration animationDuration = Duration(milliseconds: 300);

  // Validation Rules
  static const int minReferenceNumberLength = 5;
  static const int minCategoryIdLength = 3;
  static const int cardNumberLength = 16;
  static const int cvvLength = 3;
}

/// Application exceptions
class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic originalException;

  AppException({required this.message, this.code, this.originalException});

  @override
  String toString() => message;
}

/// Validation utilities
class ValidationUtils {
  /// Validate fine reference number format
  static bool isValidReferenceNumber(String value) {
    if (value.isEmpty || value.length < AppConstants.minReferenceNumberLength) {
      return false;
    }
    // Allow alphanumeric and hyphens
    return RegExp(r'^[a-zA-Z0-9-]+$').hasMatch(value);
  }

  /// Validate category ID format
  static bool isValidCategoryId(String value) {
    if (value.isEmpty || value.length < AppConstants.minCategoryIdLength) {
      return false;
    }
    // Allow alphanumeric and underscores
    return RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(value);
  }

  /// Validate card holder name
  static bool isValidCardHolderName(String value) {
    if (value.isEmpty) return false;
    // Allow letters and spaces only
    return RegExp(r'^[a-zA-Z\s]+$').hasMatch(value);
  }

  /// Validate expiry date
  static bool isValidExpiryDate(String month, String year) {
    try {
      final m = int.parse(month);
      final y = int.parse(year);

      if (m < 1 || m > 12) return false;

      // Check if card has expired
      final now = DateTime.now();
      final expiryDate = DateTime(2000 + y, m);

      return expiryDate.isAfter(now);
    } catch (e) {
      return false;
    }
  }

  /// Validate CVV
  static bool isValidCvv(String value) {
    return value.isNotEmpty &&
        value.length >= 3 &&
        value.length <= 4 &&
        RegExp(r'^\d+$').hasMatch(value);
  }
}

/// Logger utility for debugging
class AppLogger {
  static const String _tag = '[NTFMS]';

  /// Log info message
  static void info(String message) {
    print('$_tag INFO: $message');
  }

  /// Log error message
  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    print('$_tag ERROR: $message');
    if (error != null) print('Error: $error');
    if (stackTrace != null) print('StackTrace: $stackTrace');
  }

  /// Log debug message
  static void debug(String message) {
    print('$_tag DEBUG: $message');
  }

  /// Log API request
  static void logApiRequest(String endpoint, String method) {
    print('$_tag API REQUEST: $method $endpoint');
  }

  /// Log API response
  static void logApiResponse(String endpoint, int statusCode) {
    print('$_tag API RESPONSE: $endpoint - Status: $statusCode');
  }
}
