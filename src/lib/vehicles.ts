
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { getAuthenticatedUser } from '@/lib/auth-server';
import type { Vehicle } from './types';
import { revalidatePath } from 'next/cache';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';


// This function now runs on the client to fetch vehicles for the current user
export async function getVehiclesClientSide(): Promise<Vehicle[]> {
  const user = auth.currentUser;
  if (!user) return [];
  
  const vehiclesCollection = collection(db, 'vehicles');
  const q = query(vehiclesCollection, where('userId', '==', user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
}


// This function now runs on the client to fetch a single vehicle
export async function getVehicleClientSide(id: string): Promise<Vehicle | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const docRef = doc(db, 'vehicles', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const vehicle = { id: docSnap.id, ...docSnap.data() } as Vehicle;
        // Security check: ensure the user owns this vehicle
        if (vehicle.userId === user.uid) {
        return vehicle;
        }
    }
    return null;
}


// CREATE (Server Action)
export async function addVehicle(idToken: string, vehicleData: Omit<Vehicle, 'id' | 'userId'>) {
  const { uid } = await getAuthenticatedUser(idToken);
  const adminDb = getAdminDb();
  const vehiclesCollection = adminDb.collection('vehicles');
  const docRef = await vehiclesCollection.add({
    ...vehicleData,
    userId: uid,
  });

  revalidatePath('/vehicles');
  return docRef.id;
}


// UPDATE (Server Action)
export async function updateVehicle(idToken: string, id: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'userId'>>) {
   const { uid } = await getAuthenticatedUser(idToken);
   const adminDb = getAdminDb();
  const docRef = adminDb.collection('vehicles').doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Vehicle not found.");
  }

  if (docSnap.data()?.userId !== uid) {
    throw new Error("You don't have permission to update this vehicle.");
  }
  
  await docRef.update(vehicleData);

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${id}`);
}

// DELETE (Server Action)
export async function deleteVehicle(idToken: string, id: string) {
  const { uid } = await getAuthenticatedUser(idToken);
  const adminDb = getAdminDb();
  const docRef = adminDb.collection('vehicles').doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Vehicle not found.");
  }

  if (docSnap.data()?.userId !== uid) {
    throw new Error("You don't have permission to delete this vehicle.");
  }

  // Also delete associated compliance records
  const complianceQuery = adminDb.collection('complianceRecords').where('vehicleId', '==', id);
  const complianceSnapshot = await complianceQuery.get();
  const deletePromises = complianceSnapshot.docs.map(doc => doc.ref.delete());
  await Promise.all(deletePromises);
  
  // Finally, delete the vehicle itself
  await docRef.delete();

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${id}`);
}
