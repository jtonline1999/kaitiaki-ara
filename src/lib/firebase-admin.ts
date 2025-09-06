import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

function initializeAdminApp() {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        } catch (error) {
            console.error('Firebase Admin initialization error', error);
            throw new Error('Failed to initialize Firebase Admin SDK.');
        }
    }
}

export function getAdminAuth(): Auth {
    initializeAdminApp();
    return admin.auth();
}

export function getAdminDb(): Firestore {
    initializeAdminApp();
    return admin.firestore();
}
