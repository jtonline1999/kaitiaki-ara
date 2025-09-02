import 'server-only';
import { adminAuth } from '@/lib/firebase-admin';

export async function getAuthenticatedUser(idToken: string) {
  if (!idToken) {
    throw new Error('ID token is required.');
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('User not authenticated.');
  }
}
