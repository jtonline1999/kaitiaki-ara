
'use server';

import type { ComplianceRecord } from './types';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from './auth-server';
import { addComplianceRecordForUser, deleteComplianceRecordForUser, getComplianceRecordsForVehicleForUser, getUpcomingComplianceRecordsForUser, updateComplianceRecordForUser } from './repos/complianceRepo';
import { auth } from './firebase';

// This file now contains a mix of client-callable functions and server actions.
// Client-callable functions delegate to the repository layer and require a UID.
// Server actions handle authentication and then delegate to the repository layer.

// --- Client-Callable Functions ---

export async function getComplianceRecordsForVehicle(uid: string, vehicleId: string): Promise<ComplianceRecord[]> {
  return getComplianceRecordsForVehicleForUser(uid, vehicleId);
}

export async function getUpcomingComplianceRecords(uid: string, days: number): Promise<ComplianceRecord[]> {
  return getUpcomingComplianceRecordsForUser(uid, days);
}

// --- Server Actions ---

export async function addComplianceRecord(idToken: string, recordData: Omit<ComplianceRecord, 'id' | 'ownerUid'>) {
  const { uid } = await getAuthenticatedUser(idToken);
  const recordId = await addComplianceRecordForUser(uid, recordData);
  revalidatePath(`/vehicles/${recordData.vehicleId}`);
  return recordId;
}

export async function updateComplianceRecord(idToken: string, id: string, recordData: Partial<Omit<ComplianceRecord, 'id' | 'ownerUid'>>) {
  const { uid } = await getAuthenticatedUser(idToken);
  await updateComplianceRecordForUser(uid, id, recordData);
  if (recordData.vehicleId) {
    revalidatePath(`/vehicles/${recordData.vehicleId}`);
  }
}

export async function deleteComplianceRecord(idToken: string, id: string) {
  const { uid } = await getAuthenticatedUser(idToken);
  // We need to find the vehicleId before deleting to revalidate the path
  // NOTE: In a real app, you might pass vehicleId to the action or have the repo return the deleted doc.
  // For simplicity, we just revalidate the generic /vehicles path.
  await deleteComplianceRecordForUser(uid, id);
  revalidatePath('/vehicles');
}
