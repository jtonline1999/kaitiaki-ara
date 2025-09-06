import type { Timestamp } from 'firebase/firestore';

export type Vehicle = {
  id: string;
  ownerUid: string;
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  imageUrl: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ComplianceRecord = {
  id: string;
  vehicleId: string;
  ownerUid: string;
  type: 'Registration' | 'WOF' | 'RUC' | 'Insurance';
  expiryDate: Timestamp; // Changed from string to Timestamp
  predictedExpiryDate?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
