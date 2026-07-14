import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/fine_model.dart';
import '../models/officer_stats_model.dart';

/// Fine Repository
///
/// Handles CRUD operations and filters on the 'fines' Firestore collection.
class FineRepository {
  final CollectionReference _finesCol = FirebaseFirestore.instance.collection('fines');

  /// Parse dynamic Date to DateTime
  DateTime _parseDate(dynamic val) {
    if (val == null) return DateTime.now();
    if (val is Timestamp) return val.toDate();
    if (val is String) {
      return DateTime.tryParse(val) ?? DateTime.now();
    }
    return DateTime.now();
  }

  /// Map Firestore Document to FineModel
  FineModel _docToFine(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FineModel(
      fineReferenceNumber: doc.id,
      categoryId: data['category'] as String? ?? '',
      fineAmount: (data['amount'] as num?)?.toDouble() ?? 0.0,
      violatorName: data['driverName'] as String? ?? '',
      violatorLicenseNumber: data['driverLicense'] as String? ?? '',
      violationType: data['category'] as String? ?? '',
      issuedDate: _parseDate(data['issuedAt']),
      status: data['status'] as String? ?? 'Pending',
      locationDescription: data['location'] as String?,
      officerContactNumber: data['officerPhone'] as String?,
    );
  }

  // ── Officer Methods ────────────────────────────────────────────────

  /// Retrieve all fines from Firestore
  Future<List<FineModel>> getAllFines() async {
    try {
      final snap = await _finesCol.orderBy('issuedAt', descending: true).get();
      return snap.docs.map(_docToFine).toList();
    } catch (e) {
      throw Exception('Failed to load all fines: $e');
    }
  }

  /// Fetch dashboard aggregates for the Officer role
  Future<OfficerStatsModel> getOfficerDashboardStats() async {
    try {
      final fines = await getAllFines();
      
      int totalIssued = fines.length;
      int totalPaid = 0;
      int pending = 0;
      int todaysCount = 0;
      double monthlyRevenue = 0.0;

      final now = DateTime.now();
      final todayStart = DateTime(now.year, now.month, now.day);
      final currentMonthStart = DateTime(now.year, now.month, 1);

      for (final f in fines) {
        if (f.status.toLowerCase() == 'paid') {
          totalPaid++;
          // Sum revenue for payments processed in the current calendar month
          if (f.issuedDate.isAfter(currentMonthStart)) {
            monthlyRevenue += f.fineAmount;
          }
        } else if (f.status.toLowerCase() == 'pending') {
          pending++;
        }

        // Today's tickets
        if (f.issuedDate.isAfter(todayStart)) {
          todaysCount++;
        }
      }

      return OfficerStatsModel(
        totalFinesIssued: totalIssued,
        totalFinesPaid: totalPaid,
        pendingFines: pending,
        todaysFinesCount: todaysCount,
        monthlyRevenue: monthlyRevenue,
      );
    } catch (e) {
      throw Exception('Failed to calculate officer stats: $e');
    }
  }

  // ── Driver Methods ─────────────────────────────────────────────────

  /// Fetch all fines associated with a driver's license number
  Future<List<FineModel>> getFinesForDriver(String licenseNumber) async {
    if (licenseNumber.trim().isEmpty) return [];
    try {
      // Query fines matching driver license number
      final snap = await _finesCol
          .where('driverLicense', isEqualTo: licenseNumber.trim().toUpperCase())
          .get();
      
      final list = snap.docs.map(_docToFine).toList();
      // Sort locally by date descending
      list.sort((a, b) => b.issuedDate.compareTo(a.issuedDate));
      return list;
    } catch (e) {
      throw Exception('Failed to load driver fines: $e');
    }
  }

  /// Mark fine as paid in Firestore
  Future<void> payFine(String refNo, String paymentMethod) async {
    try {
      await _finesCol.doc(refNo).update({
        'status': 'Paid',
        'paymentMethod': paymentMethod,
        'paidAt': FieldValue.serverTimestamp(),
        'smsSent': true,
      });
    } catch (e) {
      throw Exception('Failed to complete payment transaction: $e');
    }
  }
}
