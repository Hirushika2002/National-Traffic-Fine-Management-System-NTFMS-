/// Driver Model
/// Stores driver profile details, driving license, and vehicle details
class DriverModel {
  final String uid;
  final String email;
  final String name;
  final String licenseNumber;
  final String vehicleNo;
  final String phoneNumber;
  final String address;
  final DateTime? createdAt;

  DriverModel({
    required this.uid,
    required this.email,
    required this.name,
    this.licenseNumber = '',
    this.vehicleNo = '',
    this.phoneNumber = '',
    this.address = '',
    this.createdAt,
  });

  /// Factory constructor to create DriverModel from Map/JSON
  factory DriverModel.fromJson(Map<String, dynamic> json, String documentId) {
    return DriverModel(
      uid: json['uid'] as String? ?? documentId,
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? '',
      licenseNumber: json['licenseNumber'] as String? ?? '',
      vehicleNo: json['vehicleNo'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      address: json['address'] as String? ?? '',
      createdAt: json['createdAt'] != null 
          ? DateTime.tryParse(json['createdAt'] as String) 
          : null,
    );
  }

  /// Convert DriverModel to JSON map for Firestore writes
  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'licenseNumber': licenseNumber,
      'vehicleNo': vehicleNo,
      'phoneNumber': phoneNumber,
      'address': address,
      'createdAt': createdAt?.toIso8601String() ?? DateTime.now().toIso8601String(),
    };
  }

  /// Copy with overrides
  DriverModel copyWith({
    String? uid,
    String? email,
    String? name,
    String? licenseNumber,
    String? vehicleNo,
    String? phoneNumber,
    String? address,
    DateTime? createdAt,
  }) {
    return DriverModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      name: name ?? this.name,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      vehicleNo: vehicleNo ?? this.vehicleNo,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      address: address ?? this.address,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  /// Returns true if the driver's profile is fully set up
  bool get isProfileComplete => licenseNumber.isNotEmpty && vehicleNo.isNotEmpty;
}
