import type { Vehicle, ComplianceRecord } from './types';
import { subDays, addDays, addMonths } from 'date-fns';

const today = new Date();

// This file is now deprecated. Data is fetched from Firestore.
// See /lib/vehicles.ts and /lib/compliance.ts

export const vehicles: Vehicle[] = [];

export const complianceRecords: ComplianceRecord[] = [];
