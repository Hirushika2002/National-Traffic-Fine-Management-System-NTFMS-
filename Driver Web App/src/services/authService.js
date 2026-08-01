/**
 * NTFMS Driver Web Portal — Google Authentication Service
 */
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  /**
   * Trigger Google Sign-In via Popup
   */
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Auto initialize driver profile record in Firestore
      const driverRef = doc(db, 'drivers', user.uid);
      const driverSnap = await getDoc(driverRef);

      if (!driverSnap.exists()) {
        await setDoc(driverRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Motorist',
          licenseNumber: '',
          vehicleNo: '',
          phoneNumber: '',
          address: '',
          createdAt: new Date().toISOString(),
        });
      }

      return user;
    } catch (error) {
      throw new Error(error.message || 'Google authentication failed.');
    }
  },

  /**
   * Sign out the driver
   */
  logout: async () => {
    await signOut(auth);
  },

  /**
   * Listen to auth state transitions
   */
  onAuthStateChanged: (callback) => {
    return fbOnAuthStateChanged(auth, callback);
  },

  /**
   * Fetch current driver details from Firestore
   */
  getDriverProfile: async (uid) => {
    const docSnap = await getDoc(doc(db, 'drivers', uid));
    return docSnap.exists() ? docSnap.data() : null;
  },

  /**
   * Update driver profile details
   */
  updateDriverProfile: async (uid, profileData) => {
    const driverRef = doc(db, 'drivers', uid);
    await setDoc(driverRef, profileData, { merge: true });
  }
};
