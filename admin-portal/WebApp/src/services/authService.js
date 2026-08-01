/**
 * NTFMS Admin Portal — Firebase Authentication Service
 *
 * Handles all authentication operations using Firebase Auth
 * (Email / Password provider).
 *
 * Usage:
 *   import { authService } from './authService';
 *   await authService.login(email, password);
 */

import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';

// ── User profile helper ────────────────────────────────────────────
// Maps a Firebase User object to a clean profile object used by the UI.
function buildUserProfile(firebaseUser) {
  const email    = firebaseUser.email || '';
  const username = email.split('@')[0];

  return {
    uid:      firebaseUser.uid,
    email,
    username,
    name:     firebaseUser.displayName || 'Administrator',
    role:     'Senior Police Administrator',
    district: 'Colombo Headquarters',
  };
}

// ── Auth Service ──────────────────────────────────────────────────

export const authService = {
  /**
   * Sign in with email and password.
   * @returns {{ success: boolean, user: object }}
   * @throws  Error with a human-readable message on failure
   */
  login: async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user       = buildUserProfile(credential.user);
      return { success: true, user };
    } catch (err) {
      // Convert Firebase error codes to user-friendly messages
      throw new Error(getFriendlyError(err.code));
    }
  },

  /**
   * Sign out the current user.
   */
  logout: async () => {
    await signOut(auth);
  },

  /**
   * Get the currently signed-in user profile (sync).
   * Returns null if no user is signed in.
   */
  getCurrentUser: () => {
    const u = auth.currentUser;
    return u ? buildUserProfile(u) : null;
  },

  /**
   * Returns true if a user is currently signed in.
   */
  isAuthenticated: () => !!auth.currentUser,

  /**
   * Subscribe to auth state changes.
   * Calls callback(user) whenever sign-in / sign-out happens.
   * Returns the unsubscribe function.
   *
   * @param {(user: object|null) => void} callback
   */
  onAuthStateChanged: (callback) => {
    return fbOnAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? buildUserProfile(firebaseUser) : null);
    });
  },

  /**
   * Send a password reset email.
   * @param {string} email
   */
  sendPasswordReset: async (email) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw new Error(getFriendlyError(err.code));
    }
  },
};

// ── Firebase Error Code → Human Message ──────────────────────────
function getFriendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Account temporarily locked. Please try again later or reset your password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact your system administrator.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
