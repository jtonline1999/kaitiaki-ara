import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { upsertUserProfile } from './repos/usersRepo';


export const signUp = async (fullName: string, email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update the user's profile in Firebase Auth
  await updateProfile(user, { displayName: fullName });

  // Create or update the user's profile in Firestore via the repo
  await upsertUserProfile(user);
  
  return user;
};

export const logIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};
