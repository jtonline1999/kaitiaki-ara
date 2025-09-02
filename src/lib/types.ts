export type Vehicle = {
  id: string;
  userId: string; // Added to associate vehicle with a user
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  imageUrl: string;
};

export type ComplianceRecord = {
  id: string;
  vehicleId: string;
  type: 'Registration' | 'WOF' | 'RUC' | 'Insurance';
  expiryDate: string; // ISO 8601 string
  predictedExpiryDate?: string; // ISO 8601 string, for RUC
};
