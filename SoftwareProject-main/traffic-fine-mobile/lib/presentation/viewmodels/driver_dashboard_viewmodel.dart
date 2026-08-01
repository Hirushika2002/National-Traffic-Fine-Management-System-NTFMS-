import 'package:flutter/material.dart';
import '../../models/fine_model.dart';
import '../../data/repositories/fine_repository.dart';
import '../../services/notification_service.dart';
import '../../services/pdf_service.dart';

/// Driver Dashboard View Model
///
/// Handles motorist specific fine lookup, total due calculations, payments, and PDF receipts.
class DriverDashboardViewModel with ChangeNotifier {
  final FineRepository _fineRepo = FineRepository();

  List<FineModel> _fines = [];
  bool _isLoading = false;
  String _errorMessage = '';

  // Getters
  List<FineModel> get fines => _fines;
  List<FineModel> get pendingFines => _fines.where((f) => f.status.toLowerCase() == 'pending').toList();
  List<FineModel> get paidFines => _fines.where((f) => f.status.toLowerCase() == 'paid').toList();
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;

  // Stats
  double get totalAmountDue {
    return pendingFines.fold(0.0, (sum, item) => sum + item.fineAmount);
  }

  /// Load fines matching motorist's license plate/number
  Future<void> loadDriverFines(String licenseNumber) async {
    if (licenseNumber.trim().isEmpty) {
      _fines = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      _fines = await _fineRepo.getFinesForDriver(licenseNumber);
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Process fine payment online (simulated bank gateway update)
  Future<bool> payFineOnline(BuildContext context, FineModel fine, Map<String, dynamic> cardDetails) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      // 1. Process database state update in Firestore
      await _fineRepo.payFine(fine.fineReferenceNumber, 'Mobile Card Payment');

      // 2. Dispatch simulated system notification
      if (context.mounted) {
        NotificationService.simulateLocalNotification(
          context,
          title: 'Payment Successful ✅',
          body: 'LKR ${fine.fineAmount.toStringAsFixed(2)} settled for fine ${fine.fineReferenceNumber}.',
        );
      }

      // 3. Reload fines list to refresh dashboard
      await loadDriverFines(fine.violatorLicenseNumber);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Generate and export payment receipt PDF
  Future<void> sharePaymentReceipt(FineModel fine) async {
    try {
      await PdfService.generateAndShareReceipt(fine);
    } catch (e) {
      _errorMessage = 'Failed to generate PDF receipt: $e';
      notifyListeners();
    }
  }
}
