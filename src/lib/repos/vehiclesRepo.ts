import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Vehicle } from '@/lib/types';
import { deleteAllComplianceRecordsForVehicle } from './complianceRepo';

const vehiclesCollection = collection(db, 'vehicles');

/**
 * Fetches all vehicles for a given user.
 * @param uid The user's ID.
 * @returns A promise that resolves to an array of vehicles.
 */
export async function getVehiclesForUser(uid: string): Promise<Vehicle[]> {
  const q = query(vehiclesCollection, where('ownerUid', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
}

/**
 * Fetches a single vehicle for a given user, ensuring ownership.
 * @param uid The user's ID.
 * @param id The vehicle's ID.
 * @returns A promise that resolves to the vehicle or null if not found or not owned.
 */
export async function getVehicleForUser(uid: string, id: string): Promise<Vehicle | null> {
    const docRef = doc(db, 'vehicles', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const vehicle = { id: docSnap.id, ...docSnap.data() } as Vehicle;
        if (vehicle.ownerUid === uid) {
            return vehicle;
        }
    }
    return null;
}

/**
 * Adds a new vehicle for a user.
 * @param uid The owner's user ID.
 * @param vehicleData The data for the new vehicle.
 * @returns A promise that resolves to the new vehicle's ID.
 */
export async function addVehicleForUser(uid: string, vehicleData: Omit<Vehicle, 'id' | 'ownerUid'>) {
  const docRef = await addDoc(vehiclesCollection, {
    ...vehicleData,
    ownerUid: uid,
  });
  return docRef.id;
}

/**
 * Updates an existing vehicle, ensuring the user has ownership.
 * @param uid The user's ID.
 * @param id The vehicle's ID to update.
 * @param vehicleData The partial data to update.
 */
export async function updateVehicleForUser(uid: string, id: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'ownerUid'>>) {
   const docRef = doc(db, 'vehicles', id);
   const docSnap = await getDoc(docRef);

   if (!docSnap.exists() || docSnap.data().ownerUid !== uid) {
     throw new Error("Permission denied or vehicle not found.");
   }
  
   await updateDoc(docRef, vehicleData);
}

/**
 * Deletes a vehicle and all its associated compliance records, ensuring ownership.
 * @param uid The user's ID.
 * @param id The vehicle's ID to delete.
 */
export async function deleteVehicleForUser(uid: string, id: string) {
  const docRef = doc(db, 'vehicles', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists() || docSnap.data().ownerUid !== uid) {
    throw new Error("Permission denied or vehicle not found.");
  }

  // Delete associated compliance records first
  await deleteAllComplianceRecordsForVehicle(id);
  
  // Finally, delete the vehicle itself
  await deleteDoc(docRef);
}
