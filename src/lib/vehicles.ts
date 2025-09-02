'use server';

import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Vehicle } from './types';
import { revalidatePath } from 'next/cache';

const vehiclesCollection = collection(db, 'vehicles');

// CREATE
export async function addVehicle(vehicleData: Omit<Vehicle, 'id' | 'userId'>) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in to add a vehicle.');

  const docRef = await addDoc(vehiclesCollection, {
    ...vehicleData,
    userId: user.uid,
  });
  revalidatePath('/vehicles');
  return docRef.id;
}

// READ (all for current user)
export async function getVehicles(): Promise<Vehicle[]> {
  const user = auth.currentUser;
  if (!user) return [];
  
  const q = query(vehiclesCollection, where('userId', '==', user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
}

// READ (one)
export async function getVehicle(id: string): Promise<Vehicle | null> {
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

// UPDATE
export async function updateVehicle(id: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'userId'>>) {
   const user = auth.currentUser;
   if (!user) throw new Error('You must be logged in to update a vehicle.');

  // Ensure user owns the vehicle before updating
  const existingVehicle = await getVehicle(id);
  if (existingVehicle?.userId !== user.uid) {
    throw new Error("You don't have permission to update this vehicle.");
  }

  const docRef = doc(db, 'vehicles', id);
  await updateDoc(docRef, vehicleData);
  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${id}`);
}

// DELETE
export async function deleteVehicle(id: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in to delete a vehicle.');

  // Ensure user owns the vehicle before deleting
  const existingVehicle = await getVehicle(id);
  if (existingVehicle?.userId !== user.uid) {
    throw new Error("You don't have permission to delete this vehicle.");
  }

  // Also delete associated compliance records
  const complianceQuery = query(collection(db, 'complianceRecords'), where('vehicleId', '==', id));
  const complianceSnapshot = await getDocs(complianceQuery);
  const deletePromises = complianceSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  // Finally, delete the vehicle itself
  const docRef = doc(db, 'vehicles', id);
  await deleteDoc(docRef);

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${id}`);
}
