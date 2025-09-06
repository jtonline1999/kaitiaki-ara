'use client';

import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { Vehicle } from '@/lib/types';
import { deleteAllComplianceRecordsForVehicle } from './complianceRepo';

const VEHICLES_COLLECTION = 'vehicles';

/** List vehicles owned by the current user (most recently updated first). */
export async function listVehicles(): Promise<Vehicle[]> {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in, cannot fetch vehicles.');
    return [];
  }

  const ref = collection(db, VEHICLES_COLLECTION);
  const q = query(
    ref,
    where('ownerUid', '==', user.uid),
    orderBy('updatedAt', 'desc')
  );

  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle));
  } catch (err) {
    console.error('Error listing vehicles:', err);
    // This can occur if a composite index is missing.
    return [];
  }
}

/** Get a single vehicle (verifies ownership after fetch). */
export async function getVehicle(id: string): Promise<Vehicle | null> {
  const user = auth.currentUser;
  if (!user) {
      console.warn('No user logged in, cannot fetch vehicle.');
      return null;
  }

  try {
    const docRef = doc(db, VEHICLES_COLLECTION, id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    const vehicle = { id: snap.id, ...snap.data() } as Vehicle;
    if (vehicle.ownerUid && vehicle.ownerUid !== user.uid) {
      console.warn('User does not have permission to access this vehicle.');
      return null;
    }
    return vehicle;
  } catch (err) {
    console.error('Error getting vehicle:', err);
    return null;
  }
}

/** Create a new vehicle (sets ownerUid and timestamps). */
export async function createVehicle(
  data: Partial<Omit<Vehicle, 'id'>>
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to create a vehicle.');
  }

  try {
    const ref = collection(db, VEHICLES_COLLECTION);
    const docData = {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '',
      vin: '',
      color: '',
      imageUrl: '',
      ...data,
      ownerUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const created = await addDoc(ref, docData);
    return created.id;
  } catch (err) {
    console.error('Error creating vehicle:', err);
    throw err;
  }
}

/** Update a vehicle (verifies ownership; updates timestamp). */
export async function updateVehicle(
  id: string,
  patch: Partial<Vehicle>
): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User must be authenticated to update a vehicle.');
    }

  try {
    const vehicle = await getVehicle(id);
    if (!vehicle || (vehicle.ownerUid && vehicle.ownerUid !== user.uid)) {
      throw new Error('User does not have permission to update this vehicle.');
    }
    const docRef = doc(db, VEHICLES_COLLECTION, id);
    await updateDoc(docRef, {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error updating vehicle:', err);
    throw err;
  }
}

/** Delete a vehicle (verifies ownership; cascade delete related records). */
export async function deleteVehicle(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to delete a vehicle.');
  }

  try {
    const vehicle = await getVehicle(id);
    if (!vehicle || (vehicle.ownerUid && vehicle.ownerUid !== user.uid)) {
      throw new Error('User does not have permission to delete this vehicle.');
    }

    // Cascade delete compliance records
    await deleteAllComplianceRecordsForVehicle(id);

    const docRef = doc(db, VEHICLES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    throw err;
  }
}
