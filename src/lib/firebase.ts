
'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { useEmulators } from './env';

const firebaseConfig = {
  apiKey:        process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:     process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  appId:         process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const emailProvider = EmailAuthProvider.PROVIDER_ID;


if (useEmulators) {
    console.log('Connecting to Firebase emulators');
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
}
