import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// Role Enum
enum UserRole { officer, driver, none }

/// Auth Repository
///
/// Encapsulates Firebase Email/Password login (Officer) and Google Sign-In (Driver).
class AuthRepository {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email']);

  /// Stream of user auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Get current firebase user
  User? get currentUser => _auth.currentUser;

  /// Check current user's role
  ///
  /// - If signed in via google.com provider, they are a Driver.
  /// - If signed in via password (email/password), they are an Officer.
  UserRole get currentRole {
    final user = _auth.currentUser;
    if (user == null) return UserRole.none;

    for (final userInfo in user.providerData) {
      if (userInfo.providerId == 'google.com') {
        return UserRole.driver;
      }
    }
    // Default to officer for email/password login
    return UserRole.officer;
  }

  // ── Officer Sign In ────────────────────────────────────────────────

  /// Authenticate Officer using email & password
  Future<User> signInOfficer(String email, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      return credential.user!;
    } on FirebaseAuthException catch (e) {
      throw Exception(_mapFirebaseError(e.code));
    } catch (_) {
      throw Exception('An error occurred during authentication.');
    }
  }

  // ── Driver Sign In (Google Sign-In) ────────────────────────────────

  /// Authenticate Driver using Google Account
  Future<User> signInDriverWithGoogle() async {
    try {
      // Trigger Google flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception('Google Sign-In cancelled by user.');
      }

      // Obtain auth details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Create credential
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase
      final UserCredential userCredential = await _auth.signInWithCredential(credential);
      return userCredential.user!;
    } on FirebaseAuthException catch (e) {
      throw Exception(_mapFirebaseError(e.code));
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  // ── Common Auth Operations ─────────────────────────────────────────

  /// Sign out from Firebase and Google Services
  Future<void> signOut() async {
    await _auth.signOut();
    if (await _googleSignIn.isSignedIn()) {
      await _googleSignIn.signOut();
    }
  }

  /// Send password reset email
  Future<void> sendPasswordReset(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
    } on FirebaseAuthException catch (e) {
      throw Exception(_mapFirebaseError(e.code));
    }
  }

  // ── Friendly Error Messages ───────────────────────────────────────
  String _mapFirebaseError(String code) {
    switch (code) {
      case 'invalid-email':
        return 'The email address is invalid.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential':
        return 'Incorrect email or password. Please verify details.';
      case 'account-exists-with-different-credential':
        return 'An account already exists with the same email but different login method.';
      case 'too-many-requests':
        return 'Too many attempts. Account locked temporarily. Try again later.';
      case 'network-request-failed':
        return 'Network issue. Check your internet connection.';
      default:
        return 'Authentication failed. Code: $code';
    }
  }
}
