# Kaitiaki Ara Refactor Plan

This document outlines the step-by-step plan to refactor the Kaitiaki Ara application to a more robust and scalable architecture based on client-side SDK usage, repository patterns, and strong Firestore security rules.

## 1. Current State Inventory

- **Firebase Client Initialization**: `src/lib/firebase.ts` contains a basic client-side initialization. It will be upgraded.
- **Firebase Admin Initialization**: `src/lib/firebase-admin.ts` exists for server-side operations but has caused initialization issues. It will be simplified for token verification only.
- **Authentication State**: `src/contexts/auth-context.tsx` manages auth state using a React Context. This will be replaced by a more modern `useAuth` hook.
- **Data Access**: Data fetching is spread across `lib/vehicles.ts` and `lib/compliance.ts`, mixing client-side and server-action logic. This will be centralized into dedicated repository files.
- **Server Actions**: `src/lib/vehicles.ts` contains server actions (`addVehicle`, `updateVehicle`, `deleteVehicle`) that use the Admin SDK. These will be kept temporarily but adapted to use the new repository logic.
- **Data Shapes**:
    - `users`: Implicitly created by Firebase Auth, with a corresponding document in Firestore.
    - `vehicles`: Contains `userId`. This will be renamed to `ownerUid` for consistency.
    - `complianceRecords`: Contains `vehicleId`. `ownerUid` will be added for direct scoping.

## 2. Refactoring Sequence

The refactor is broken down into minimal, non-breaking steps. The application should remain runnable after each step.

**Step 1: Centralize Firebase SDK & Configuration**
- **Goal**: Create a single, reliable entry point for the Firebase client SDK with emulator support.
- **Files to Modify**: `src/lib/firebase.ts`.
- **Files to Add**: `docs/local-dev.md`, update `package.json` scripts.
- **Outcome**: All client-side code will import `db`, `auth` from one place. Local development will safely use emulators.

**Step 2: Implement Modern Auth Hook & Gate**
- **Goal**: Replace the existing Auth Context with a cleaner `useAuth` hook and a declarative `AuthGate` component.
- **Files to Add**: `src/hooks/use-auth.ts`, `src/components/auth/AuthGate.tsx`.
- **Files to Modify**: `src/contexts/auth-context.tsx` (will be removed), `src/app/(app)/layout.tsx`, `src/app/(auth)/layout.tsx`.
- **Outcome**: A single, reliable hook for auth state and a component to protect routes, simplifying layouts.

**Step 3: Introduce Owner-Scoped Repositories**
- **Goal**: Abstract all Firestore queries into a dedicated repository layer that automatically handles data ownership.
- **Files to Add**: `src/lib/repos/usersRepo.ts`, `src/lib/repos/vehiclesRepo.ts`, `src/lib/repos/complianceRepo.ts`.
- **Files to Modify**: All components and pages that currently fetch data directly (e.g., `vehicles/page.tsx`, `dashboard/page.tsx`, forms).
- **Outcome**: Data logic is removed from UI components, making them cleaner and ensuring all data access is properly scoped to the logged-in user.

**Step 4: Implement Profile Upsert & Data Migrations**
- **Goal**: Ensure every authenticated user has a corresponding profile document in Firestore and that existing data conforms to the new ownership model.
- **Files to Modify**: `src/components/auth/signup-form.tsx`.
- **Files to Add**: `scripts/migrations/001-backfill-ownerUid.ts`, `scripts/seed/emulators-seed.ts`.
- **Outcome**: User profiles are created atomically on sign-up. A clear path exists to migrate existing data and seed emulators.

**Step 5: Harden Security Rules**
- **Goal**: Implement defense-in-depth security at the Firestore level.
- **Files to Modify**: `firestore.rules`.
- **Outcome**: The database is secured against unauthorized access, preventing users from reading or writing data that doesn't belong to them, even if client-side code has a bug.

## 3. Rollback Notes

- Each step is designed to be a small, logical change. Git commits will align with each step.
- To roll back, revert the commit for the corresponding step.
- The most significant changes are in Step 2 and 3. Pay close attention to UI components to ensure they correctly adapt to the new data-loading patterns. If issues arise, the previous `auth-context.tsx` and direct query patterns can be restored by reverting the changes in the affected components.
