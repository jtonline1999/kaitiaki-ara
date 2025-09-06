export type Vehicle = {
  id: string;
  ownerUid: string; // Renamed from userId for clarity and consistency
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  imageUrl: string;
  createdAt?: any; // From serverTimestamp
  updatedAt?: any; // From serverTimestamp
};

export type ComplianceRecord = {
  id: string;
  vehicleId: string;
  ownerUid: string; // Added to enable owner-scoped rules and queries
  type: 'Registration' | 'WOF' | 'RUC' | 'Insurance';
  expiryDate: string; // ISO 8601 string
  predictedExpiryDate?: string; // ISO 8601 string, for RUC
};
