/// Fine Data Model
/// Maps incoming fine details from the REST API backend
class FineModel {
  final String fineReferenceNumber;
  final String categoryId;
  final double fineAmount;
  final String violatorName;
  final String violatorLicenseNumber;
  final String violationType;
  final DateTime issuedDate;
  final String status; // 'pending', 'paid', 'overdue'
  final String? locationDescription;
  final String? officerContactNumber;

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
  });

  /// Factory constructor to create FineModel from JSON
  /// This handles deserialization from the backend REST API response
  factory FineModel.fromJson(Map<String, dynamic> json) {
    return FineModel(
      fineReferenceNumber: json['fineReferenceNumber'] as String? ?? '',
      categoryId: json['categoryId'] as String? ?? '',
      fineAmount: (json['fineAmount'] as num?)?.toDouble() ?? 0.0,
      violatorName: json['violatorName'] as String? ?? '',
      violatorLicenseNumber: json['violatorLicenseNumber'] as String? ?? '',
      violationType: json['violationType'] as String? ?? '',
      issuedDate: _parseDateTime(json['issuedDate']),
      status: json['status'] as String? ?? 'pending',
      locationDescription: json['locationDescription'] as String?,
      officerContactNumber: json['officerContactNumber'] as String?,
    );
  }

  /// Convert FineModel to JSON for API requests
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
    };
  }

  /// Parse datetime string from JSON
  static DateTime _parseDateTime(dynamic dateValue) {
    if (dateValue is String) {
      try {
        return DateTime.parse(dateValue);
      } catch (e) {
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
  }) {
    return FineModel(
      fineReferenceNumber: fineReferenceNumber ?? this.fineReferenceNumber,
      categoryId: categoryId ?? this.categoryId,
      fineAmount: fineAmount ?? this.fineAmount,
      violatorName: violatorName ?? this.violatorName,
      violatorLicenseNumber:
          violatorLicenseNumber ?? this.violatorLicenseNumber,
      violationType: violationType ?? this.violationType,
      issuedDate: issuedDate ?? this.issuedDate,
      status: status ?? this.status,
      locationDescription: locationDescription ?? this.locationDescription,
      officerContactNumber: officerContactNumber ?? this.officerContactNumber,
    );
  }
}
