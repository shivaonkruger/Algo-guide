/**
 * Firebase Web SDK Configuration
 * 
 * This file initializes Firebase for the frontend.
 * All values here are PUBLIC and safe to expose in frontend code.
 * 
 * For backend: use firebase-admin SDK with service account credentials
 * For frontend: use firebase web SDK with public config (this file)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration (public - safe for frontend)
// Get these values from: Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCqisfl8t8WUdpNYB7i8dUfQ_NcJ-drtbs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'algoguide-1ba9f.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'algoguide-1ba9f',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'algoguide-1ba9f.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '377097212965',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:377097212965:web:9b36e6e6d711baa5f3dbcc',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Connect to emulator in development (if running locally)
if (import.meta.env.DEV) {
  try {
    // Check if running on localhost (development environment)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Firestore Emulator
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✓ Connected to Firestore Emulator');
      } catch (error) {
        // Emulator may not be running - that's okay in development
        console.log('ℹ Firestore Emulator not running (using live Firestore)');
      }

      // Auth Emulator
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('✓ Connected to Auth Emulator');
      } catch (error) {
        // Emulator may not be running - that's okay in development
        console.log('ℹ Auth Emulator not running (using live Firebase Auth)');
      }
    }
  } catch (error) {
    console.warn('Could not connect to Firebase emulators:', error.message);
  }
}

export default app;
