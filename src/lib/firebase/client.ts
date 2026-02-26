import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
};

export const isFirebaseConfigured = Object.values(requiredFirebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0,
);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let firebaseAnalyticsPromise: Promise<Analytics | null> | null = null;

function ensureFirebaseConfigured() {
  if (isFirebaseConfigured) {
    return;
  }

  throw new Error(
    "Firebase env vars are missing. Configure NEXT_PUBLIC_FIREBASE_* values.",
  );
}

export function getFirebaseApp() {
  ensureFirebaseConfigured();

  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
}

export function getFirebaseAuthClient() {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = getFirebaseApp();
  firebaseAuth = getAuth(app);

  if (typeof window !== "undefined") {
    void setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
      // Ignore persistence errors and continue with default behavior.
    });
  }

  return firebaseAuth;
}

export function getFirebaseFirestoreClient() {
  if (firebaseDb) {
    return firebaseDb;
  }

  firebaseDb = getFirestore(getFirebaseApp());
  return firebaseDb;
}

export function getFirebaseStorageClient() {
  if (firebaseStorage) {
    return firebaseStorage;
  }

  firebaseStorage = getStorage(getFirebaseApp());
  return firebaseStorage;
}

export function getFirebaseAnalyticsClient() {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (!firebaseConfig.measurementId) {
    return Promise.resolve(null);
  }

  if (firebaseAnalyticsPromise) {
    return firebaseAnalyticsPromise;
  }

  firebaseAnalyticsPromise = (async () => {
    const { getAnalytics, isSupported } = await import("firebase/analytics");

    const analyticsSupported = await isSupported().catch(() => false);
    if (!analyticsSupported) {
      return null;
    }

    return getAnalytics(getFirebaseApp());
  })();

  return firebaseAnalyticsPromise;
}
