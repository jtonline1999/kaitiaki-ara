
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { getAuthenticatedUser } from '@/lib/auth-server';
import type { Vehicle } from './types';
import { revalidatePath } from 'next/cache';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { addVehicleForUser, deleteVehicleForUser, getVehicleForUser, getVehiclesForUser, updateVehicleForUser } from './repos/vehiclesRepo';


// This function now runs on the client to fetch vehicles for the current user
// DEPRECATED: Use getVehiclesForUser from vehiclesRepo instead
export async function getVehiclesClientSide(): Promise<Vehicle[]> {
  const user = auth.currentUser;
  if (!user) return [];
  return getVehiclesForUser(user.uid);
}


// This function now runs on the client to fetch a single vehicle
// DEPRECATED: Use getVehicleForUser from vehiclesRepo instead
export async function getVehicleClientSide(id: string): Promise<Vehicle | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return getVehicleForUser(user.uid, id);
}


// CREATE (Server Action) - This remains a server action to demonstrate the pattern.
// It now delegates its logic to the new repository layer.
export async function addVehicle(idToken: string, vehicleData: Omit<Vehicle, 'id' | 'ownerUid'>) {
  const { uid } = await getAuthenticatedUser(idToken);
  
  // Delegate to the repository function
  const vehicleId = await addVehicleForUser(uid, vehicleData);

  revalidatePath('/vehicles');
  return vehicleId;
}


// UPDATE (Server Action) - Delegates to repository
export async function updateVehicle(idToken: string, id: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'ownerUid'>>) {
   const { uid } = await getAuthenticatedUser(idToken);
  
   // The repository function handles the ownership check
   await updateVehicleForUser(uid, id, vehicleData);

   revalidatePath('/vehicles');
   revalidatePath(`/vehicles/${id}`);
}

// DELETE (Server Action) - Delegates to repository
export async function deleteVehicle(idToken: string, id: string) {
  const { uid } = await getAuthenticatedUser(idToken);
  
  // The repository function handles ownership check and cascading deletes
  await deleteVehicleForUser(uid, id);

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${id}`);
}
