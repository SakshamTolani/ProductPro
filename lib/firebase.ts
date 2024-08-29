// lib/firebase.ts

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
} catch (error) {
  throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable. Ensure it is a valid JSON string.');
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const storage = getStorage();

export { storage };
