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
  writeBatch,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { ComplianceRecord } from '@/lib/types';

const COMPLIANCE_COLLECTION = 'complianceRecords';
const VEHICLES_COLLECTION = 'vehicles';

/** List compliance records owned by the current user. */
export async function listComplianceRecords(options?: {
  vehicleId?: string;
}): Promise<ComplianceRecord[]> {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in, cannot fetch compliance records.');
    return [];
  }

  const ref = collection(db, COMPLIANCE_COLLECTION);
  const clauses = [where('ownerUid', '==', user.uid)];
  if (options?.vehicleId) clauses.push(where('vehicleId', '==', options.vehicleId));

  const q = query(ref, ...clauses, orderBy('expiryDate', 'desc'));

  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ComplianceRecord));
  } catch (err) {
    console.error('Error listing compliance records:', err);
    return [];
  }
}

/** Sets up a real-time listener for compliance records. */
export function listenToListComplianceRecords(
  callback: (records: ComplianceRecord[]) => void,
  options?: { vehicleId?: string }
): Unsubscribe {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in, cannot listen to compliance records.');
    return () => {};
  }

  const ref = collection(db, COMPLIANCE_COLLECTION);
  const clauses = [where('ownerUid', '==', user.uid)];
  if (options?.vehicleId) {
    clauses.push(where('vehicleId', '==', options.vehicleId));
  }

  const q = query(ref, ...clauses, orderBy('expiryDate', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const records = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ComplianceRecord));
    callback(records);
  }, (error) => {
    console.error('Error listening to compliance records:', error);
  });

  return unsubscribe;
}


/** Get a single compliance record (verifies ownership after fetch). */
export async function getComplianceRecord(id: string): Promise<ComplianceRecord | null> {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in, cannot fetch compliance record.');
    return null;
  }
  try {
    const docRef = doc(db, COMPLIANCE_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const record = { id: snap.id, ...snap.data() } as ComplianceRecord;
    if (record.ownerUid && record.ownerUid !== user.uid) {
      console.warn('User does not have permission to access this record.');
      return null;
    }
    return record;
  } catch (err) {
    console.error('Error getting compliance record:', err);
    return null;
  }
}

/** Create a new compliance record (verifies vehicle ownership; sets ownerUid and timestamps). */
export async function createComplianceRecord(
  data: Partial<Omit<ComplianceRecord, 'id'>> & { vehicleId: string }
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated to create a compliance record.');

  try {
    // Verify the vehicle exists and belongs to the current user
    const vehicleRef = doc(db, VEHICLES_COLLECTION, data.vehicleId);
    const vehicleSnap = await getDoc(vehicleRef);
    if (!vehicleSnap.exists() || (vehicleSnap.data() as any).ownerUid !== user.uid) {
      throw new Error('Permission denied: You do not own the vehicle.');
    }

    const ref = collection(db, COMPLIANCE_COLLECTION);
    const docData: any = {
      ...data,
      ownerUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    if (data.predictedExpiryDate === undefined) {
      delete docData.predictedExpiryDate;
    }

    const created = await addDoc(ref, docData);
    return created.id;
  } catch (err) {
    console.error('Error creating compliance record:', err);
    throw err;
  }
}

/** Update a compliance record (verifies ownership; updates timestamp). */
export async function updateComplianceRecord(
  id: string,
  patch: Partial<ComplianceRecord>
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated to update a compliance record.');

  try {
    const current = await getComplianceRecord(id);
    if (!current || (current.ownerUid && current.ownerUid !== user.uid)) {
      throw new Error('Permission denied or record not found.');
    }

    if (patch.vehicleId && patch.vehicleId !== current.vehicleId) {
      const newVeh = await getDoc(doc(db, VEHICLES_COLLECTION, patch.vehicleId));
      if (!newVeh.exists() || (newVeh.data() as any).ownerUid !== user.uid) {
        throw new Error('Permission denied: You do not own the new vehicle.');
      }
    }

    const docRef = doc(db, COMPLIANCE_COLLECTION, id);
    await updateDoc(docRef, {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error updating compliance record:', err);
    throw err;
  }
}

/** Delete a compliance record (verifies ownership). */
export async function deleteComplianceRecord(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated to delete a compliance record.');

  try {
    const current = await getComplianceRecord(id);
    if (!current || (current.ownerUid && current.ownerUid !== user.uid)) {
      throw new Error('Permission denied or record not found.');
    }
    const docRef = doc(db, COMPLIANCE_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting compliance record:', err);
    throw err;
  }
}

/** Delete all compliance records for a vehicle (scoped to current user for safety). */
export async function deleteAllComplianceRecordsForVehicle(vehicleId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated to delete records.');

  try {
    const ref = collection(db, COMPLIANCE_COLLECTION);
    const q = query(ref, where('ownerUid', '==', user.uid), where('vehicleId', '==', vehicleId));
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.error('Error batch-deleting compliance records:', err);
    throw err;
  }
}

/** Upcoming records within N days. Uses Firestore Timestamps. */
export async function listUpcomingComplianceRecords(days: number): Promise<ComplianceRecord[]> {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in, cannot fetch upcoming compliance records.');
    return [];
  }

  const now = new Date();
  const start = Timestamp.fromDate(now);
  const end = Timestamp.fromDate(new Date(now.getTime() + days * 24 * 60 * 60 * 1000));

  const ref = collection(db, COMPLIANCE_COLLECTION);
  const q = query(
    ref,
    where('ownerUid', '==', user.uid),
    where('expiryDate', '>=', start),
    where('expiryDate', '<=', end),
    orderBy('expiryDate', 'asc')
  );

  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ComplianceRecord));
  } catch (err) {
    console.error('Error listing upcoming compliance records:', err);
    return [];
  }
}

/** Sets up a real-time listener for upcoming compliance records within N days. */
export function listenToUpcomingComplianceRecords(
  days: number,
  callback: (records: ComplianceRecord[]) => void
): Unsubscribe {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in, cannot listen to upcoming compliance records.');
    return () => {};
  }

  const now = new Date();
  const start = Timestamp.fromDate(now);
  const end = Timestamp.fromDate(new Date(now.getTime() + days * 24 * 60 * 60 * 1000));

  const ref = collection(db, COMPLIANCE_COLLECTION);
  const q = query(
    ref,
    where('ownerUid', '==', user.uid),
    where('expiryDate', '>=', start),
    where('expiryDate', '<=', end),
    orderBy('expiryDate', 'asc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const records = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ComplianceRecord));
    callback(records);
  }, (error) => {
    console.error('Error listening to upcoming compliance records:', error);
  });

  return unsubscribe;
}
