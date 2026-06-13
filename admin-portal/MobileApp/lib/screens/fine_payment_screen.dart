import 'package:flutter/material.dart';
import '../models/fine_model.dart';
import '../services/api_service.dart';

/// Fine Payment Screen
/// Main UI screen for drivers to enter fine details and process payment
class FinePaymentScreen extends StatefulWidget {
  const FinePaymentScreen({Key? key}) : super(key: key);

  @override
  State<FinePaymentScreen> createState() => _FinePaymentScreenState();
}

class _FinePaymentScreenState extends State<FinePaymentScreen> {
  // Form and payment state management
  final _formKey = GlobalKey<FormState>();
  final _referenceNumberController = TextEditingController();
  final _categoryIdController = TextEditingController();

  // Payment card details
  final _cardNumberController = TextEditingController();
  final _cardHolderController = TextEditingController();
  final _expiryMonthController = TextEditingController();
  final _expiryYearController = TextEditingController();
  final _cvvController = TextEditingController();

  // UI state variables
  FineModel? _fetchedFine;
  bool _isLoading = false;
  bool _isPaymentProcessing = false;
  bool _showPaymentForm = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    // Clean up controllers
    _referenceNumberController.dispose();
    _categoryIdController.dispose();
    _cardNumberController.dispose();
    _cardHolderController.dispose();
    _expiryMonthController.dispose();
    _expiryYearController.dispose();
    _cvvController.dispose();
    super.dispose();
  }

  /// Fetch fine details from the backend API
  Future<void> _fetchFineDetails() async {
    // Clear previous messages
    setState(() {
      _errorMessage = null;
      _successMessage = null;
    });

    // Validate form inputs
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final fine = await ApiService.fetchFineDetails(
        fineReferenceNumber: _referenceNumberController.text.trim(),
        categoryId: _categoryIdController.text.trim(),
      );

      setState(() {
        _fetchedFine = fine;
        _showPaymentForm = false;
        _errorMessage = null;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _fetchedFine = null;
        _isLoading = false;
      });
    }
  }

  /// Process the fine payment
  Future<void> _processPayment() async {
    if (_fetchedFine == null) {
      setState(() {
        _errorMessage = 'Please fetch fine details first';
      });
      return;
    }

    // Validate payment form
    if (!_validatePaymentForm()) {
      return;
    }

    setState(() {
      _isPaymentProcessing = true;
      _errorMessage = null;
    });

    try {
      // Prepare payment details
      final paymentDetails = {
        'amount': _fetchedFine!.fineAmount,
        'paymentMethod': 'card',
        'cardNumber': _cardNumberController.text.replaceAll(RegExp(r'\s'), ''),
        'cardHolderName': _cardHolderController.text,
        'expiryMonth': _expiryMonthController.text,
        'expiryYear': _expiryYearController.text,
        'cvv': _cvvController.text,
      };

      // Process payment through API
      final response = await ApiService.processPayment(
        fineReferenceNumber: _fetchedFine!.fineReferenceNumber,
        categoryId: _fetchedFine!.categoryId,
        paymentDetails: paymentDetails,
      );

      setState(() {
        _isPaymentProcessing = false;
        _successMessage =
            'Payment successful! Confirmation #${response['confirmationNumber']}';
        _showPaymentForm = false;
        _fetchedFine = null;
        // Clear form fields
        _referenceNumberController.clear();
        _categoryIdController.clear();
        _cardNumberController.clear();
        _cardHolderController.clear();
        _expiryMonthController.clear();
        _expiryYearController.clear();
        _cvvController.clear();
      });

      // Show success snackbar
      _showSuccessSnackbar('Payment processed successfully!');
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isPaymentProcessing = false;
      });
    }
  }

  /// Validate card details
  bool _validatePaymentForm() {
    // Card number validation
    if (_cardNumberController.text.isEmpty) {
      setState(() => _errorMessage = 'Card number is required');
      return false;
    }

    if (!ApiService.isValidCardNumber(_cardNumberController.text)) {
      setState(() => _errorMessage = 'Invalid card number');
      return false;
    }

    // Cardholder name validation
    if (_cardHolderController.text.isEmpty) {
      setState(() => _errorMessage = 'Cardholder name is required');
      return false;
    }

    // Expiry date validation
    if (_expiryMonthController.text.isEmpty ||
        _expiryYearController.text.isEmpty) {
      setState(() => _errorMessage = 'Expiry date is required');
      return false;
    }

    final month = int.tryParse(_expiryMonthController.text) ?? 0;
    final year = int.tryParse(_expiryYearController.text) ?? 0;

    if (month < 1 || month > 12) {
      setState(() => _errorMessage = 'Invalid expiry month (01-12)');
      return false;
    }

    // CVV validation
    if (_cvvController.text.isEmpty || _cvvController.text.length < 3) {
      setState(() => _errorMessage = 'Invalid CVV');
      return false;
    }

    return true;
  }

  /// Show success snackbar notification
  void _showSuccessSnackbar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Reset the form and state
  void _resetForm() {
    setState(() {
      _referenceNumberController.clear();
      _categoryIdController.clear();
      _cardNumberController.clear();
      _cardHolderController.clear();
      _expiryMonthController.clear();
      _expiryYearController.clear();
      _cvvController.clear();
      _fetchedFine = null;
      _showPaymentForm = false;
      _errorMessage = null;
      _successMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fine Payment'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.blueAccent,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header section
              _buildHeader(),
              const SizedBox(height: 24),

              // Success message
              if (_successMessage != null) _buildSuccessMessage(),

              // Error message
              if (_errorMessage != null) _buildErrorMessage(),

              // Fine reference form
              if (_fetchedFine == null) ...[
                _buildFineReferenceForm(),
              ] else ...[
                // Fine details display
                _buildFineDetailsCard(),
                const SizedBox(height: 20),

                // Show payment form button
                if (!_showPaymentForm)
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() => _showPaymentForm = true);
                    },
                    icon: const Icon(Icons.payment),
                    label: const Text('Proceed to Payment'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),

                // Payment form
                if (_showPaymentForm) ...[
                  const SizedBox(height: 20),
                  _buildPaymentForm(),
                ],

                // Reset button
                const SizedBox(height: 16),
                TextButton.icon(
                  onPressed: _resetForm,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Start New Payment'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  /// Build header section
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'NTFMS Mobile Payment',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.blueAccent,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Enter your fine reference number and category ID to proceed',
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
        ),
      ],
    );
  }

  /// Build fine reference form
  Widget _buildFineReferenceForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Fine Reference Number field
          TextFormField(
            controller: _referenceNumberController,
            decoration: InputDecoration(
              labelText: 'Fine Reference Number',
              hintText: 'e.g., TFM-2024-001234',
              prefixIcon: const Icon(Icons.receipt),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              filled: true,
              fillColor: Colors.grey[50],
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Fine Reference Number is required';
              }
              if (value.length < 5) {
                return 'Reference Number must be at least 5 characters';
              }
              return null;
            },
            enabled: !_isLoading,
          ),
          const SizedBox(height: 16),

          // Category ID field
          TextFormField(
            controller: _categoryIdController,
            decoration: InputDecoration(
              labelText: 'Traffic Fine Category ID',
              hintText: 'e.g., SPEED001',
              prefixIcon: const Icon(Icons.category),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              filled: true,
              fillColor: Colors.grey[50],
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Category ID is required';
              }
              if (value.length < 3) {
                return 'Category ID must be at least 3 characters';
              }
              return null;
            },
            enabled: !_isLoading,
          ),
          const SizedBox(height: 24),

          // Fetch Fine button
          ElevatedButton.icon(
            onPressed: _isLoading ? null : _fetchFineDetails,
            icon: _isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Colors.white.withOpacity(0.7),
                      ),
                    ),
                  )
                : const Icon(Icons.search),
            label: Text(_isLoading ? 'Fetching...' : 'Fetch Fine Details'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blueAccent,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ],
      ),
    );
  }

  /// Build fine details display card
  Widget _buildFineDetailsCard() {
    if (_fetchedFine == null) return const SizedBox.shrink();

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Fine Details',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                _buildStatusBadge(_fetchedFine!.status),
              ],
            ),
            const Divider(height: 20),

            // Fine amount (highlighted)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange, width: 2),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Fine Amount:',
                    style: TextStyle(fontWeight: FontWeight.w500, fontSize: 16),
                  ),
                  Text(
                    'Rs. ${_fetchedFine!.fineAmount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: Colors.orangeAccent,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Violator information
            _buildDetailRow('Violator Name', _fetchedFine!.violatorName),
            _buildDetailRow(
              'License Number',
              _fetchedFine!.violatorLicenseNumber,
            ),
            _buildDetailRow('Violation Type', _fetchedFine!.violationType),
            _buildDetailRow(
              'Issued Date',
              '${_fetchedFine!.issuedDate.day}/${_fetchedFine!.issuedDate.month}/${_fetchedFine!.issuedDate.year}',
            ),

            if (_fetchedFine!.locationDescription != null) ...[
              const SizedBox(height: 8),
              _buildDetailRow(
                'Location',
                _fetchedFine!.locationDescription ?? '',
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Build detail row for fine information
  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  /// Build status badge
  Widget _buildStatusBadge(String status) {
    Color backgroundColor;
    Color textColor;
    IconData icon;

    switch (status.toLowerCase()) {
      case 'paid':
        backgroundColor = Colors.green[100] ?? Colors.green;
        textColor = Colors.green[700] ?? Colors.green;
        icon = Icons.check_circle;
        break;
      case 'overdue':
        backgroundColor = Colors.red[100] ?? Colors.red;
        textColor = Colors.red[700] ?? Colors.red;
        icon = Icons.warning;
        break;
      default:
        backgroundColor = Colors.amber[100] ?? Colors.amber;
        textColor = Colors.amber[700] ?? Colors.amber;
        icon = Icons.schedule;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: textColor),
          const SizedBox(width: 4),
          Text(
            status.toUpperCase(),
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  /// Build payment form
  Widget _buildPaymentForm() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Card Payment Details',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Card number field
            TextFormField(
              controller: _cardNumberController,
              decoration: InputDecoration(
                labelText: 'Card Number',
                hintText: '1234 5678 9012 3456',
                prefixIcon: const Icon(Icons.credit_card),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey[50],
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [CardNumberFormatter()],
              enabled: !_isPaymentProcessing,
            ),
            const SizedBox(height: 16),

            // Cardholder name field
            TextFormField(
              controller: _cardHolderController,
              decoration: InputDecoration(
                labelText: 'Cardholder Name',
                hintText: 'JOHN DOE',
                prefixIcon: const Icon(Icons.person),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey[50],
              ),
              textCapitalization: TextCapitalization.characters,
              enabled: !_isPaymentProcessing,
            ),
            const SizedBox(height: 16),

            // Expiry and CVV row
            Row(
              children: [
                // Expiry Month
                Expanded(
                  child: TextFormField(
                    controller: _expiryMonthController,
                    decoration: InputDecoration(
                      labelText: 'MM',
                      hintText: '12',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.grey[50],
                    ),
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 2,
                    enabled: !_isPaymentProcessing,
                  ),
                ),
                const SizedBox(width: 8),

                // Expiry Year
                Expanded(
                  child: TextFormField(
                    controller: _expiryYearController,
                    decoration: InputDecoration(
                      labelText: 'YY',
                      hintText: '25',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.grey[50],
                    ),
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 2,
                    enabled: !_isPaymentProcessing,
                  ),
                ),
                const SizedBox(width: 8),

                // CVV
                Expanded(
                  child: TextFormField(
                    controller: _cvvController,
                    decoration: InputDecoration(
                      labelText: 'CVV',
                      hintText: '123',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.grey[50],
                    ),
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 4,
                    obscureText: true,
                    enabled: !_isPaymentProcessing,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Payment button
            ElevatedButton.icon(
              onPressed: _isPaymentProcessing ? null : _processPayment,
              icon: _isPaymentProcessing
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Colors.white.withOpacity(0.7),
                        ),
                      ),
                    )
                  : const Icon(Icons.check_circle),
              label: Text(
                _isPaymentProcessing ? 'Processing...' : 'Confirm Payment',
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build error message widget
  Widget _buildErrorMessage() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red, width: 1),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red[700]),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _errorMessage ?? '',
              style: TextStyle(
                color: Colors.red[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Build success message widget
  Widget _buildSuccessMessage() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.green[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.green, width: 1),
      ),
      child: Row(
        children: [
          Icon(Icons.check_circle_outline, color: Colors.green[700]),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _successMessage ?? '',
              style: TextStyle(
                color: Colors.green[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Custom formatter for card number input
class CardNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    String input = newValue.text.replaceAll(' ', '');

    if (input.length > 19) {
      input = input.substring(0, 19);
    }

    StringBuffer buffer = StringBuffer();
    for (int i = 0; i < input.length; i++) {
      buffer.write(input[i]);
      if ((i + 1) % 4 == 0 && i + 1 != input.length) {
        buffer.write(' ');
      }
    }

    return TextEditingValue(
      text: buffer.toString(),
      selection: TextSelection.collapsed(offset: buffer.length),
    );
  }
}
