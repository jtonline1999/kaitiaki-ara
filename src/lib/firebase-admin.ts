import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

function getAdminAuth(): Auth {
    return admin.auth();
}

function getAdminDb(): Firestore {
    return admin.firestore();
}

export const adminAuth = getAdminAuth();
export const adminDb = getAdminDb();
