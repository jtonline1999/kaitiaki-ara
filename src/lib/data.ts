import type { Vehicle, ComplianceRecord } from './types';
import { subDays, addDays, addMonths } from 'date-fns';

const today = new Date();

export const vehicles: Vehicle[] = [
  {
    id: '1',
    plateNumber: 'KIWI1',
    vin: '123ABC456DEF789GHI',
    make: 'Toyota',
    model: 'Hilux',
    year: 2022,
    color: 'White',
    imageUrl: 'https://picsum.photos/600/400',
  },
  {
    id: '2',
    plateNumber: 'PUKEKO',
    vin: 'JKL123MNO456PQR789',
    make: 'Ford',
    model: 'Ranger',
    year: 2021,
    color: 'Black',
    imageUrl: 'https://picsum.photos/601/400',
  },
  {
    id: '3',
    plateNumber: 'TUI',
    vin: 'STU789VWX123YZA456',
    make: 'Mitsubishi',
    model: 'Triton',
    year: 2023,
    color: 'Silver',
    imageUrl: 'https://picsum.photos/600/401',
  },
];

export const complianceRecords: ComplianceRecord[] = [
  // Vehicle 1
  {
    id: 'rec1',
    vehicleId: '1',
    type: 'WOF',
    expiryDate: addDays(today, 25).toISOString(),
  },
  {
    id: 'rec2',
    vehicleId: '1',
    type: 'Registration',
    expiryDate: addMonths(today, 3).toISOString(),
  },
  {
    id: 'rec3',
    vehicleId: '1',
    type: 'RUC',
    expiryDate: addDays(today, 5).toISOString(),
    predictedExpiryDate: addDays(today, 3).toISOString(),
  },
  {
    id: 'rec4',
    vehicleId: '1',
    type: 'Insurance',
    expiryDate: addMonths(today, 6).toISOString(),
  },
  // Vehicle 2
  {
    id: 'rec5',
    vehicleId: '2',
    type: 'WOF',
    expiryDate: subDays(today, 10).toISOString(),
  },
  {
    id: 'rec6',
    vehicleId: '2',
    type: 'Registration',
    expiryDate: addDays(today, 15).toISOString(),
  },
   // Vehicle 3
  {
    id: 'rec7',
    vehicleId: '3',
    type: 'WOF',
    expiryDate: addDays(today, 150).toISOString(),
  },
  {
    id: 'rec8',
    vehicleId: '3',
    type: 'Insurance',
    expiryDate: addDays(today, 2).toISOString(),
  }
];
