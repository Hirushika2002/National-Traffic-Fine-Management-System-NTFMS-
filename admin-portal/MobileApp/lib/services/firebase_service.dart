import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/fine_model.dart';

/// NTFMS Mobile — Firestore Service Layer
///
/// Reads from and writes to the shared Firestore database (project: ntfms2026).
/// The same database is used by the Admin Web Portal and Driver Web Portal,
/// so all three apps see live, consistent data.
///
/// Collections:
///   fines       — Traffic fine records   (doc ID = refNo, e.g. "SLP-2026-9814")
///   categories  — Fine category metadata (doc ID = "CAT-01" … "CAT-09")
class FirebaseService {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;
  static final CollectionReference _finesCol      = _db.collection('fines');
  static final CollectionReference _categoriesCol = _db.collection('categories');

  // ── Helpers ─────────────────────────────────────────────────────

  /// Convert a Firestore Timestamp or ISO string to DateTime.
  static DateTime _parseDate(dynamic val) {
    if (val == null) return DateTime.now();
    if (val is Timestamp) return val.toDate();
    if (val is String) {
      try { return DateTime.parse(val); } catch (_) { return DateTime.now(); }
    }
    return DateTime.now();
  }

  /// Convert a Firestore document snapshot to a FineModel.
  static FineModel _docToFine(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FineModel(
      fineReferenceNumber:  doc.id,
      categoryId:           data['category']      as String? ?? '',
      fineAmount:           (data['amount']        as num?)?.toDouble() ?? 0.0,
      violatorName:         data['driverName']     as String? ?? '',
      violatorLicenseNumber:data['driverLicense']  as String? ?? '',
      violationType:        data['category']       as String? ?? '',
      issuedDate:           _parseDate(data['issuedAt']),
      status:               data['status']         as String? ?? 'Pending',
      locationDescription:  data['location']       as String?,
      officerContactNumber: data['officerPhone']   as String?,
      vehicleNo:            data['vehicleNo']      as String? ?? '',
    );
  }

  // ── Public API ───────────────────────────────────────────────────

  /// Fetch fine details by reference number AND category ID.
  ///
  /// Uses the document ID (= refNo) for an O(1) Firestore read.
  /// Throws if the fine doesn't exist or the category doesn't match.
  static Future<FineModel> fetchFineDetails({
    required String fineReferenceNumber,
    required String categoryId,
  }) async {
    if (fineReferenceNumber.trim().isEmpty || categoryId.trim().isEmpty) {
      throw Exception('Fine Reference Number and Category ID are required');
    }

    final refUpper = fineReferenceNumber.trim().toUpperCase();
    final catUpper = categoryId.trim().toUpperCase();

    final snap = await _finesCol.doc(refUpper).get();

    if (!snap.exists) {
      throw Exception(
        'Fine not found. Please verify the Reference Number and Category ID.',
      );
    }

    final data = snap.data() as Map<String, dynamic>;
    final storedCategory = (data['category'] as String? ?? '').toUpperCase();

    if (storedCategory != catUpper) {
      throw Exception(
        'Fine not found. Please verify the Reference Number and Category ID.',
      );
    }

    return _docToFine(snap);
  }

  /// Mark a fine as Paid in Firestore and return the updated model.
  ///
  /// Called after client-side card validation succeeds.
  static Future<Map<String, dynamic>> processPayment({
    required String fineReferenceNumber,
    required String categoryId,
    required Map<String, dynamic> paymentDetails,
  }) async {
    if (fineReferenceNumber.trim().isEmpty ||
        categoryId.trim().isEmpty ||
        paymentDetails.isEmpty) {
      throw Exception('Missing required payment information');
    }

    final refUpper = fineReferenceNumber.trim().toUpperCase();
    final docRef   = _finesCol.doc(refUpper);
    final snap     = await docRef.get();

    if (!snap.exists) {
      throw Exception('Fine reference $refUpper not found in the national register.');
    }

    final data   = snap.data() as Map<String, dynamic>;
    final status = data['status'] as String? ?? '';

    if (status == 'Paid') {
      throw Exception('This fine has already been paid.');
    }

    // Mark as Paid in Firestore
    final paidAt = Timestamp.now();
    await docRef.update({
      'status':        'Paid',
      'paymentMethod': paymentDetails['paymentMethod'] ?? 'Mobile App',
      'paidAt':        paidAt,
      'smsSent':       true,
    });

    // Generate confirmation identifiers
    final confirmationNumber = 'CONF-${DateTime.now().year}-${(10000 + DateTime.now().millisecondsSinceEpoch % 90000).toInt()}';
    final transactionId      = 'TXN-${(100000 + DateTime.now().millisecondsSinceEpoch % 900000).toInt()}';

    return {
      'success':            true,
      'message':            'Payment processed successfully',
      'confirmationNumber': confirmationNumber,
      'transactionId':      transactionId,
      'smsStatus':          'sent',
    };
  }

  /// Fetch all fine categories from Firestore.
  static Future<List<Map<String, dynamic>>> getCategories() async {
    final snap = await _categoriesCol.get();
    return snap.docs.map((d) {
      final data = d.data() as Map<String, dynamic>;
      return { 'id': d.id, ...data };
    }).toList();
  }
}
