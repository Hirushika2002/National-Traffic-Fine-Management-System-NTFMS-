/// Fine Data Model
/// Maps incoming fine details from the Firestore and REST APIs
class FineModel {
  final String fineReferenceNumber;
  final String categoryId;
  final double fineAmount;
  final String violatorName;
  final String violatorLicenseNumber;
  final String violationType;
  final DateTime issuedDate;
  final String status; // 'Pending', 'Paid', 'Overdue'
  final String? locationDescription;
  final String? officerContactNumber;
  final String vehicleNo;

  FineModel({
    required this.fineReferenceNumber,
    required this.categoryId,
    required this.fineAmount,
    required this.violatorName,
    required this.violatorLicenseNumber,
    required this.violationType,
    required this.issuedDate,
    required this.status,
    this.locationDescription,
    this.officerContactNumber,
    this.vehicleNo = '',
  });

  /// Factory constructor to create FineModel from JSON/Map
  factory FineModel.fromJson(Map<String, dynamic> json) {
    return FineModel(
      fineReferenceNumber: json['fineReferenceNumber'] as String? ?? json['refNo'] as String? ?? '',
      categoryId: json['categoryId'] as String? ?? json['category'] as String? ?? '',
      fineAmount: (json['fineAmount'] as num?)?.toDouble() ?? (json['amount'] as num?)?.toDouble() ?? 0.0,
      violatorName: json['violatorName'] as String? ?? json['driverName'] as String? ?? '',
      violatorLicenseNumber: json['violatorLicenseNumber'] as String? ?? json['driverLicense'] as String? ?? '',
      violationType: json['violationType'] as String? ?? json['category'] as String? ?? '',
      issuedDate: _parseDateTime(json['issuedDate'] ?? json['issuedAt']),
      status: json['status'] as String? ?? 'Pending',
      locationDescription: json['locationDescription'] as String? ?? json['location'] as String?,
      officerContactNumber: json['officerContactNumber'] as String? ?? json['officerPhone'] as String?,
      vehicleNo: json['vehicleNo'] as String? ?? '',
    );
  }

  /// Convert FineModel to JSON map
  Map<String, dynamic> toJson() {
    return {
      'fineReferenceNumber': fineReferenceNumber,
      'categoryId': categoryId,
      'fineAmount': fineAmount,
      'violatorName': violatorName,
      'violatorLicenseNumber': violatorLicenseNumber,
      'violationType': violationType,
      'issuedDate': issuedDate.toIso8601String(),
      'status': status,
      'locationDescription': locationDescription,
      'officerContactNumber': officerContactNumber,
      'vehicleNo': vehicleNo,
    };
  }

  /// Parse datetime string or Timestamp
  static DateTime _parseDateTime(dynamic dateValue) {
    if (dateValue == null) return DateTime.now();
    if (dateValue is String) {
      try {
        return DateTime.parse(dateValue);
      } catch (_) {
        return DateTime.now();
      }
    }
    return DateTime.now();
  }

  /// Create a copy of this model with optional field overrides
  FineModel copyWith({
    String? fineReferenceNumber,
    String? categoryId,
    double? fineAmount,
    String? violatorName,
    String? violatorLicenseNumber,
    String? violationType,
    DateTime? issuedDate,
    String? status,
    String? locationDescription,
    String? officerContactNumber,
    String? vehicleNo,
  }) {
    return FineModel(
      fineReferenceNumber: fineReferenceNumber ?? this.fineReferenceNumber,
      categoryId: categoryId ?? this.categoryId,
      fineAmount: fineAmount ?? this.fineAmount,
      violatorName: violatorName ?? this.violatorName,
      violatorLicenseNumber: violatorLicenseNumber ?? this.violatorLicenseNumber,
      violationType: violationType ?? this.violationType,
      issuedDate: issuedDate ?? this.issuedDate,
      status: status ?? this.status,
      locationDescription: locationDescription ?? this.locationDescription,
      officerContactNumber: officerContactNumber ?? this.officerContactNumber,
      vehicleNo: vehicleNo ?? this.vehicleNo,
    );
  }
}
