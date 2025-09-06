/**
 * @fileoverview Seeds the local Firestore emulator with a consistent set of test data.
 *
 * This script is designed to be run via the `npm run emulators:seed` command.
 * It connects to the running Firestore emulator and populates it with:
 * - A test user
 * - Several vehicles owned by that test user
 * - Compliance records for those vehicles
 *
 * This ensures that the local development environment is in a predictable state,
 * making it easier to test features and UI components.
 */

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { addDays } from 'date-fns';

// --- Configuration ---
// This is a pre-determined UID for the test user. Using a fixed UID
// allows us to have predictable data relationships. This UID must match
// the UID used in the Auth emulator export if you want to log in as this user.
const TEST_USER_UID = 'test-user-12345';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123'; // Simple password for local dev only

// --- Initialization ---
// Connect to the emulators
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
initializeApp({ projectId: 'kaitiaki-ara' }); // Use a dummy project ID

const auth = getAuth();
const db = getFirestore();

// --- Seeding Logic ---

/**
 * Creates or updates the test user in the Auth emulator.
 */
async function seedAuthUser() {
  console.log(`Creating test user in Auth emulator...`);
  try {
    // Check if the user already exists
    await auth.getUser(TEST_USER_UID);
    console.log(`User ${TEST_USER_UID} already exists. Updating...`);
    await auth.updateUser(TEST_USER_UID, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      displayName: 'Tāne Mahuta',
      disabled: false,
    });
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`User ${TEST_USER_UID} not found. Creating...`);
      await auth.createUser({
        uid: TEST_USER_UID,
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        displayName: 'Tāne Mahuta',
      });
    } else {
      throw error; // Re-throw other errors
    }
  }
  console.log('Test user created/updated successfully.');
}

/**
 * Clears existing data for the test user and seeds new data.
 */
async function seedFirestore() {
  console.log('Seeding Firestore data...');
  const now = Timestamp.now();

  // 1. User Profile
  console.log(' - Seeding user profile...');
  await db.collection('users').doc(TEST_USER_UID).set({
    uid: TEST_USER_UID,
    email: TEST_USER_EMAIL,
    displayName: 'Tāne Mahuta',
    createdAt: now,
    updatedAt: now,
  });

  // 2. Vehicles
  console.log(' - Seeding vehicles...');
  const vehicles = [
    {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Hilux',
      year: 2022,
      plateNumber: 'HILUX1',
      vin: '12345ABCDEF',
      color: 'Silver',
      imageUrl: 'https://picsum.photos/600/400',
    },
    {
      id: 'vehicle-2',
      make: 'Ford',
      model: 'Ranger',
      year: 2021,
      plateNumber: 'RNGR22',
      vin: '67890GHIJKL',
      color: 'Blue',
      imageUrl: 'https://picsum.photos/600/401',
    },
  ];

  const vehicleBatch = db.batch();
  for (const vehicle of vehicles) {
    const docRef = db.collection('vehicles').doc(vehicle.id);
    vehicleBatch.set(docRef, { ...vehicle, ownerUid: TEST_USER_UID });
  }
  await vehicleBatch.commit();

  // 3. Compliance Records
  console.log(' - Seeding compliance records...');
  const today = new Date();
  const complianceRecords = [
    // Vehicle 1 records
    { vehicleId: 'vehicle-1', type: 'WOF', expiryDate: addDays(today, 15).toISOString() }, // Expiring soon
    { vehicleId: 'vehicle-1', type: 'Registration', expiryDate: addDays(today, 90).toISOString() },
    { vehicleId: 'vehicle-1', type: 'RUC', expiryDate: addDays(today, 5).toISOString() }, // Expiring very soon
    // Vehicle 2 records
    { vehicleId: 'vehicle-2', type: 'WOF', expiryDate: addDays(today, -20).toISOString() }, // Expired
    { vehicleId: 'vehicle-2', type: 'Registration', expiryDate: addDays(today, 300).toISOString() },
  ];

  const complianceBatch = db.batch();
  for (const record of complianceRecords) {
    const docRef = db.collection('complianceRecords').doc(); // Auto-generate ID
    complianceBatch.set(docRef, { ...record, ownerUid: TEST_USER_UID });
  }
  await complianceBatch.commit();

  console.log('Firestore seeded successfully.');
}

/**
 * Main function to run the seeding process.
 */
async function main() {
  try {
    await seedAuthUser();
    await seedFirestore();
    console.log('\n✅ Emulator seeding complete!');
    console.log(`\nLog in with:\n  Email: ${TEST_USER_EMAIL}\n  Password: ${TEST_USER_PASSWORD}`);
  } catch (error) {
    console.error('❌ Error during emulator seeding:', error);
    process.exit(1);
  }
}

main();
