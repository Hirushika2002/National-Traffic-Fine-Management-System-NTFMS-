import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/driver_model.dart';

/// Driver Repository
///
/// Coordinates profile persistence inside the Firestore 'drivers' collection.
class DriverRepository {
  final CollectionReference _driversCol = FirebaseFirestore.instance.collection('drivers');

  /// Fetch a driver profile by UID.
  /// Returns null if profile is not found in the database.
  Future<DriverModel?> getDriverProfile(String uid) async {
    try {
      final snap = await _driversCol.doc(uid).get();
      if (!snap.exists) return null;
      return DriverModel.fromJson(snap.data() as Map<String, dynamic>, snap.id);
    } catch (e) {
      throw Exception('Failed to load driver profile: $e');
    }
  }

  /// Save or update a driver profile.
  Future<void> saveDriverProfile(DriverModel driver) async {
    try {
      await _driversCol.doc(driver.uid).set(driver.toJson());
    } catch (e) {
      throw Exception('Failed to save driver profile: $e');
    }
  }

  /// Automatically create profile on first sign-in if not present.
  Future<DriverModel> ensureProfileExists({
    required String uid,
    required String email,
    required String displayName,
  }) async {
    try {
      final profile = await getDriverProfile(uid);
      if (profile != null) return profile;

      // Create new profile
      final newProfile = DriverModel(
        uid: uid,
        email: email,
        name: displayName,
        licenseNumber: '',
        vehicleNo: '',
        phoneNumber: '',
        address: '',
        createdAt: DateTime.now(),
      );

      await saveDriverProfile(newProfile);
      return newProfile;
    } catch (e) {
      throw Exception('Failed to initialize driver profile: $e');
    }
  }
}
