/// Role Enum
enum UserRole { officer, driver, none }

/// Mock Auth Repository to avoid Firebase dependencies
class AuthRepository {
  /// Stream of user auth state changes
  Stream<dynamic> get authStateChanges => Stream.empty();

  /// Get current user
  dynamic get currentUser => null;

  /// Check current user's role
  UserRole get currentRole => UserRole.none;

  // ── Officer Sign In ────────────────────────────────────────────────
  Future<dynamic> signInOfficer(String email, String password) async {
    return null;
  }

  // ── Driver Sign In (Google Sign-In) ────────────────────────────────
  Future<dynamic> signInDriverWithGoogle() async {
    return null;
  }

  // ── Common Auth Operations ─────────────────────────────────────────
  Future<void> signOut() async {
    // No-op
  }

  Future<void> sendPasswordReset(String email) async {
    // No-op
  }
}
