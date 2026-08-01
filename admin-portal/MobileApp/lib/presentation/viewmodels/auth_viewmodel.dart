import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/driver_repository.dart';
import '../../data/models/driver_model.dart';

/// Auth View Model
///
/// Controls sign-in state, user profiles, roles, loading states, and error handling.
class AuthViewModel with ChangeNotifier {
  final AuthRepository _authRepo = AuthRepository();
  final DriverRepository _driverRepo = DriverRepository();

  User? _user;
  UserRole _role = UserRole.none;
  DriverModel? _driverProfile;
  bool _isLoading = false;
  String _errorMessage = '';

  // Getters
  User? get user => _user;
  UserRole get role => _role;
  DriverModel? get driverProfile => _driverProfile;
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;
  bool get isAuthenticated => _user != null;

  AuthViewModel() {
    // Listen to Firebase Auth state changes
    _authRepo.authStateChanges.listen((User? user) async {
      _user = user;
      if (user != null) {
        _role = _authRepo.currentRole;
        if (_role == UserRole.driver) {
          // Prefetch driver details
          await _loadDriverProfile(user.uid);
        }
      } else {
        _role = UserRole.none;
        _driverProfile = null;
      }
      notifyListeners();
    });
  }

  /// Sign in Officer (Email/Password)
  Future<bool> signInOfficer(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      _user = await _authRepo.signInOfficer(email, password);
      _role = UserRole.officer;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Sign in Driver (Google Sign-In)
  Future<bool> signInDriver() async {
    _setLoading(true);
    _clearError();

    try {
      final User motorist = await _authRepo.signInDriverWithGoogle();
      _user = motorist;
      _role = UserRole.driver;

      // Automatically initialize profile if it's their first login
      _driverProfile = await _driverRepo.ensureProfileExists(
        uid: motorist.uid,
        email: motorist.email ?? '',
        displayName: motorist.displayName ?? 'Motorist',
      );

      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Update Driver profile details (license, vehicle, phone)
  Future<bool> updateDriverProfile({
    required String licenseNumber,
    required String vehicleNo,
    required String phoneNumber,
    required String address,
  }) async {
    if (_driverProfile == null) return false;
    _setLoading(true);
    _clearError();

    try {
      final updated = _driverProfile!.copyWith(
        licenseNumber: licenseNumber.trim().toUpperCase(),
        vehicleNo: vehicleNo.trim().toUpperCase(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      );

      await _driverRepo.saveDriverProfile(updated);
      _driverProfile = updated;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Sign out
  Future<void> signOut() async {
    _setLoading(true);
    try {
      await _authRepo.signOut();
    } finally {
      _setLoading(false);
    }
  }

  // ── Private Helpers ────────────────────────────────────────────────

  Future<void> _loadDriverProfile(String uid) async {
    try {
      _driverProfile = await _driverRepo.getDriverProfile(uid);
    } catch (e) {
      debugPrint('Error loading driver profile details: $e');
    }
  }

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  void _setError(String msg) {
    _errorMessage = msg.replaceFirst('Exception: ', '');
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = '';
  }
}
