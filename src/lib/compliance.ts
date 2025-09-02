import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import type { ComplianceRecord } from './types';
import { addDays, formatISO } from 'date-fns';

const complianceCollection = collection(db, 'complianceRecords');

// CREATE
export async function addComplianceRecord(recordData: Omit<ComplianceRecord, 'id'>) {
  const docRef = await addDoc(complianceCollection, recordData);
  return docRef.id;
}

// READ (for a specific vehicle)
export async function getComplianceRecordsForVehicle(vehicleId: string): Promise<ComplianceRecord[]> {
  const q = query(complianceCollection, where('vehicleId', '==', vehicleId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ComplianceRecord));
}

// READ (upcoming)
export async function getUpcomingComplianceRecords(days: number): Promise<ComplianceRecord[]> {
  const today = new Date();
  const futureDate = addDays(today, days);

  const q = query(
    complianceCollection,
    where('expiryDate', '>=', today.toISOString()),
    where('expiryDate', '<=', futureDate.toISOString()),
    orderBy('expiryDate', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ComplianceRecord));
}


// READ (one)
export async function getComplianceRecord(id: string): Promise<ComplianceRecord | null> {
  const docRef = doc(db, 'complianceRecords', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ComplianceRecord;
  }
  return null;
}

// UPDATE
export async function updateComplianceRecord(id: string, recordData: Partial<ComplianceRecord>) {
  const docRef = doc(db, 'complianceRecords', id);
  await updateDoc(docRef, recordData);
}

// DELETE
export async function deleteComplianceRecord(id: string) {
  const docRef = doc(db, 'complianceRecords', id);
  await deleteDoc(docRef);
}
