# Local Development Guide

This guide explains how to set up and run the Kaitiaki Ara application locally using the Firebase Local Emulator Suite.

## Prerequisites

- Node.js
- Firebase CLI (`npm install -g firebase-tools`)

## First-Time Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Log in to Firebase**:
    ```bash
    firebase login
    ```

3.  **Initialize Emulators**:
    If you haven't already, you may need to initialize the emulators. This will download the necessary binaries.
    ```bash
    firebase emulators:start
    ```
    The first time you run this, it will download the emulator components. Let it finish, then you can stop it with `Ctrl+C`.

## Running the App Locally

To run the app, you will need two separate terminal windows.

**Terminal 1: Start the Firebase Emulators**

```bash
npm run emulators
```

This will start the local emulators for Authentication, Firestore, and Storage. You can view the Emulator UI at [http://127.0.0.1:4000](http://127.0.0.1:4000).

**Terminal 2: Start the Next.js Development Server**

```bash
npm run dev
```

This script automatically sets `NEXT_PUBLIC_USE_EMULATORS=true`, which configures the app to connect to the local emulators you started in the first terminal.

The application will be available at [http://localhost:9002](http://localhost:9002).

## Seeding Data

To populate the emulators with initial test data (e.g., a test user, vehicles), run the seed script in a new terminal while the emulators are running.

```bash
npm run emulators:seed
```

This script will add pre-defined data to the Firestore emulator, allowing you to test the application's features with a consistent dataset. You can view this data in the Emulator UI.
