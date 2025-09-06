
import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import type { ComplianceRecord } from './types';
import { addDays } from 'date-fns';
import { getVehiclesClientSide } from './vehicles';

// This file is now deprecated and will be removed in a future step.
// Logic has been moved to /lib/repos/complianceRepo.ts

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

// READ (upcoming for the current user)
export async function getUpcomingComplianceRecords(days: number): Promise<ComplianceRecord[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const userVehicles = await getVehiclesClientSide();
    if (userVehicles.length === 0) return [];

    const vehicleIds = userVehicles.map(v => v.id);
    const today = new Date();
    const futureDate = addDays(today, days);

    // Firestore 'in' queries are limited to 30 items. 
    // If a user has more than 30 vehicles, we need to batch the queries.
    const batches: Promise<ComplianceRecord[]>[] = [];
    for (let i = 0; i < vehicleIds.length; i += 30) {
        const batchIds = vehicleIds.slice(i, i + 30);
        
        const q = query(
            complianceCollection,
            where('vehicleId', 'in', batchIds),
            where('expiryDate', '>=', today.toISOString()),
            where('expiryDate', '<=', futureDate.toISOString()),
            orderBy('expiryDate', 'asc')
        );
        
        batches.push(getDocs(q).then(snapshot => 
            snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ComplianceRecord))
        ));
    }

    const results = await Promise.all(batches);
    return results.flat();
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
