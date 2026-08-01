// NTFMS — Firebase App Initialisation (Admin Web Portal)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyDQxa2ysMhzpPNTsbA2TKxXEFIiAETXxQQ',
  authDomain:        'ntfms2026.firebaseapp.com',
  projectId:         'ntfms2026',
  storageBucket:     'ntfms2026.firebasestorage.app',
  messagingSenderId: '395993702197',
  appId:             '1:395993702197:web:01f1388c5697660784f67c',
};

const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
