import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Vehicle } from './types';

const vehiclesCollection = collection(db, 'vehicles');

// CREATE
export async function addVehicle(vehicleData: Omit<Vehicle, 'id'>) {
  const docRef = await addDoc(vehiclesCollection, vehicleData);
  return docRef.id;
}

// READ (all)
export async function getVehicles(): Promise<Vehicle[]> {
  const snapshot = await getDocs(vehiclesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
}

// READ (one)
export async function getVehicle(id: string): Promise<Vehicle | null> {
  const docRef = doc(db, 'vehicles', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Vehicle;
  }
  return null;
}

// UPDATE
export async function updateVehicle(id: string, vehicleData: Partial<Vehicle>) {
  const docRef = doc(db, 'vehicles', id);
  await updateDoc(docRef, vehicleData);
}

// DELETE
export async function deleteVehicle(id: string) {
  const docRef = doc(db, 'vehicles', id);
  await deleteDoc(docRef);
  // Also delete associated compliance records
  const complianceQuery = query(collection(db, 'complianceRecords'), where('vehicleId', '==', id));
  const complianceSnapshot = await getDocs(complianceQuery);
  const deletePromises = complianceSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}
