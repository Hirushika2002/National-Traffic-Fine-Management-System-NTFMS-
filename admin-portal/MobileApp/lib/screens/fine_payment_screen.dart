import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/fine_model.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

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
        title: const Text(
          'NTFMS OFFICER PORTAL',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_outlined),
            tooltip: 'Sign Out',
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Sign Out'),
                  content: const Text('Are you sure you want to sign out?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('Sign Out', style: TextStyle(color: Colors.redAccent)),
                    ),
                  ],
                ),
              );
              if (confirm == true) {
                await AuthService.signOut();
                // Auth gate in main.dart automatically routes back to LoginScreen
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
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
                    icon: const Icon(Icons.payment_outlined),
                    label: const Text('PROCEED TO PAYMENT'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981), // Emerald Green
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      elevation: 4,
                      shadowColor: const Color(0xFF10B981).withOpacity(0.3),
                    ),
                  ),

                // Payment form
                if (_showPaymentForm) ...[
                  const SizedBox(height: 12),
                  _buildPaymentForm(),
                ],

                // Reset button
                const SizedBox(height: 16),
                TextButton.icon(
                  onPressed: _resetForm,
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Back / Cancel Payment'),
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
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
                ),
              ),
              child: Icon(
                Icons.shield_outlined,
                color: Theme.of(context).colorScheme.secondary,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Motorist Fine Portal',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Theme.of(context).colorScheme.secondary,
                    letterSpacing: 0.5,
                  ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          'Enter the fine reference number and category code from your traffic ticket to retrieve details and process instant payment.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                height: 1.5,
              ),
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
            decoration: const InputDecoration(
              labelText: 'Fine Reference Number',
              hintText: 'e.g., TFM-2024-001234',
              prefixIcon: Icon(Icons.receipt_long_outlined),
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
            decoration: const InputDecoration(
              labelText: 'Traffic Violation Category ID',
              hintText: 'e.g., SPEED001',
              prefixIcon: Icon(Icons.gavel_outlined),
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
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _fetchFineDetails,
              icon: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Icon(Icons.search_outlined),
              label: Text(_isLoading ? 'RETRIEVING RECORD...' : 'LOOKUP FINE DETAILS'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
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
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Fine Ticket Record',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                _buildStatusBadge(_fetchedFine!.status),
              ],
            ),
            const Divider(height: 28),

            // Fine amount (highlighted with gold border)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.secondary.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: Theme.of(context).colorScheme.secondary.withOpacity(0.3),
                  width: 1.5,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'TOTAL PENALTY AMOUNT:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      letterSpacing: 0.5,
                      color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                    ),
                  ),
                  Text(
                    'Rs. ${_fetchedFine!.fineAmount.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

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
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
          ),
          const SizedBox(width: 16),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
            ),
          ),
        ],
      ),
    );
  }

  /// Build status badge (Matches WebApp style)
  Widget _buildStatusBadge(String status) {
    Color color;
    IconData icon;

    switch (status.toLowerCase()) {
      case 'paid':
        color = const Color(0xFF10B981); // Emerald
        icon = Icons.check_circle_outline;
        break;
      case 'overdue':
        color = const Color(0xFFEF4444); // Danger
        icon = Icons.error_outline;
        break;
      default:
        color = const Color(0xFFF59E0B); // Amber
        icon = Icons.schedule_outlined;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.25), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            status.toUpperCase(),
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 11,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  /// Build payment form
  Widget _buildPaymentForm() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.lock_outline,
                  color: Theme.of(context).colorScheme.secondary,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Encrypted Card Payment',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const Divider(height: 24),

            // Card number field
            TextFormField(
              controller: _cardNumberController,
              decoration: const InputDecoration(
                labelText: 'Card Number',
                hintText: '1234 5678 9012 3456',
                prefixIcon: Icon(Icons.credit_card_outlined),
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [CardNumberFormatter()],
              enabled: !_isPaymentProcessing,
            ),
            const SizedBox(height: 16),

            // Cardholder name field
            TextFormField(
              controller: _cardHolderController,
              decoration: const InputDecoration(
                labelText: 'Cardholder Name',
                hintText: 'JOHN DOE',
                prefixIcon: Icon(Icons.person_outline),
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
                    decoration: const InputDecoration(
                      labelText: 'MM',
                      hintText: '12',
                      counterText: '',
                    ),
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 2,
                    enabled: !_isPaymentProcessing,
                  ),
                ),
                const SizedBox(width: 10),

                // Expiry Year
                Expanded(
                  child: TextFormField(
                    controller: _expiryYearController,
                    decoration: const InputDecoration(
                      labelText: 'YY',
                      hintText: '25',
                      counterText: '',
                    ),
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 2,
                    enabled: !_isPaymentProcessing,
                  ),
                ),
                const SizedBox(width: 10),

                // CVV
                Expanded(
                  child: TextFormField(
                    controller: _cvvController,
                    decoration: const InputDecoration(
                      labelText: 'CVV',
                      hintText: '123',
                      counterText: '',
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
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isPaymentProcessing ? null : _processPayment,
                icon: _isPaymentProcessing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Icon(Icons.payment_outlined),
                label: Text(
                  _isPaymentProcessing ? 'AUTHORIZING TRANSACTION...' : 'CONFIRM SETTLEMENT',
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981), // Emerald Green
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  elevation: 4,
                  shadowColor: const Color(0xFF10B981).withOpacity(0.3),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build error message widget (Premium translucent styling)
  Widget _buildErrorMessage() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.25), width: 1),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.error_outline, color: Color(0xFFEF4444), size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _errorMessage ?? '',
              style: const TextStyle(
                color: Color(0xFFEF4444),
                fontWeight: FontWeight.w600,
                fontSize: 14,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Build success message widget (Premium translucent styling)
  Widget _buildSuccessMessage() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981).withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.25), width: 1),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _successMessage ?? '',
              style: const TextStyle(
                color: Color(0xFF10B981),
                fontWeight: FontWeight.w600,
                fontSize: 14,
                height: 1.4,
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
