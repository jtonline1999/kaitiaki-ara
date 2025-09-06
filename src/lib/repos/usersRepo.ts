import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

/**
 * Represents the user profile stored in Firestore.
 */
export type UserProfile = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
}

/**
 * Creates or updates a user's profile in the `users` collection.
 * This is designed to be called after a user signs up or signs in.
 * @param user The Firebase Auth user object.
 */
export async function upsertUserProfile(user: FirebaseUser): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    const userData: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        updatedAt: serverTimestamp(),
    };

    if (user.photoURL) {
        userData.photoURL = user.photoURL;
    }

    if (!userDoc.exists()) {
        userData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userData, { merge: true });
}

/**
 * Retrieves a user's profile from Firestore.
 * @param uid The user's ID.
 * @returns The user profile object or null if not found.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
    }
    return null;
}
