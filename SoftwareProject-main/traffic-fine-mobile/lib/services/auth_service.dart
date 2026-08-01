import 'package:firebase_auth/firebase_auth.dart';

/// NTFMS Mobile — Firebase Authentication Service
///
/// Handles officer sign-in / sign-out using Firebase Email/Password auth.
/// All officers must be registered in Firebase Console →
/// Authentication → Users before they can log in.
class AuthService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;

  // ── Auth State ─────────────────────────────────────────────────────

  /// Stream of auth state changes.
  /// Emits a [User] when signed in, null when signed out.
  static Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Returns the currently signed-in Firebase User, or null.
  static User? get currentUser => _auth.currentUser;

  /// Returns true if an officer is currently signed in.
  static bool get isAuthenticated => _auth.currentUser != null;

  // ── Sign In ────────────────────────────────────────────────────────

  /// Sign in with email and password.
  ///
  /// Returns the signed-in [User] on success.
  /// Throws a user-friendly [Exception] on failure.
  static Future<User> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email:    email.trim(),
        password: password,
      );
      return credential.user!;
    } on FirebaseAuthException catch (e) {
      throw Exception(_friendlyError(e.code));
    } catch (e) {
      throw Exception('Sign-in failed. Please try again.');
    }
  }

  // ── Sign Out ───────────────────────────────────────────────────────

  /// Sign out the current officer.
  static Future<void> signOut() async {
    await _auth.signOut();
  }

  // ── Password Reset ─────────────────────────────────────────────────

  /// Send a password reset email to the given address.
  static Future<void> sendPasswordReset(String email) async {
    if (email.trim().isEmpty) {
      throw Exception('Please enter your email address.');
    }
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
    } on FirebaseAuthException catch (e) {
      throw Exception(_friendlyError(e.code));
    }
  }

  // ── Error Code → Human Message ────────────────────────────────────
  static String _friendlyError(String code) {
    switch (code) {
      case 'invalid-email':
        return 'The email address is not valid.';
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'too-many-requests':
        return 'Too many failed attempts. Account temporarily locked. Please try again later.';
      case 'user-disabled':
        return 'This account has been disabled. Contact your administrator.';
      case 'network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}
