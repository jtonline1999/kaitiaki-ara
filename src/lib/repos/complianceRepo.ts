import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import type { ComplianceRecord, Vehicle } from '@/lib/types';
import { addDays } from 'date-fns';
import { getVehiclesForUser } from './vehiclesRepo';

/**
 * Adds a new compliance record for a vehicle, ensuring the current user owns the vehicle.
 */
export async function addComplianceRecordForUser(uid: string, recordData: Omit<ComplianceRecord, 'id' | 'ownerUid'>) {
  // Security check: does the user own the vehicle they're adding a record for?
  const vehicleDoc = await getDoc(doc(db, 'vehicles', recordData.vehicleId));
  if (!vehicleDoc.exists() || vehicleDoc.data().ownerUid !== uid) {
    throw new Error("Permission denied: You do not own the vehicle.");
  }

  const dataWithOwner = {
    ...recordData,
    ownerUid: uid,
  };

  const docRef = await addDoc(collection(db, 'complianceRecords'), dataWithOwner);
  return docRef.id;
}

/**
 * Retrieves all compliance records for a specific vehicle, if the user owns it.
 */
export async function getComplianceRecordsForVehicleForUser(uid: string, vehicleId: string): Promise<ComplianceRecord[]> {
  // We can query directly on ownerUid for security and indexing benefits.
  const q = query(
    collection(db, 'complianceRecords'), 
    where('ownerUid', '==', uid),
    where('vehicleId', '==', vehicleId),
    orderBy('expiryDate', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ComplianceRecord));
}

/**
 * Retrieves upcoming compliance records for all vehicles owned by the user.
 */
export async function getUpcomingComplianceRecordsForUser(uid: string, days: number): Promise<ComplianceRecord[]> {
    const today = new Date();
    const futureDate = addDays(today, days);

    const q = query(
        collection(db, 'complianceRecords'),
        where('ownerUid', '==', uid),
        where('expiryDate', '>=', today.toISOString()),
        where('expiryDate', '<=', futureDate.toISOString()),
        orderBy('expiryDate', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ComplianceRecord));
}


/**
 * Updates a compliance record, ensuring the user owns the associated vehicle.
 */
export async function updateComplianceRecordForUser(uid: string, id: string, recordData: Partial<Omit<ComplianceRecord, 'id' | 'ownerUid'>>) {
  const docRef = doc(db, 'complianceRecords', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists() || docSnap.data().ownerUid !== uid) {
    throw new Error("Permission denied or record not found.");
  }
  await updateDoc(docRef, recordData);
}

/**
 * Deletes a compliance record, ensuring the user owns the associated vehicle.
 */
export async function deleteComplianceRecordForUser(uid: string, id: string) {
  const docRef = doc(db, 'complianceRecords', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists() || docSnap.data().ownerUid !== uid) {
    throw new Error("Permission denied or record not found.");
  }
  await deleteDoc(docRef);
}

/**
 * Deletes all compliance records associated with a specific vehicle ID.
 * Intended for use when deleting a vehicle.
 */
export async function deleteAllComplianceRecordsForVehicle(vehicleId: string) {
    const q = query(collection(db, 'complianceRecords'), where('vehicleId', '==', vehicleId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}
