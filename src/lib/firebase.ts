import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const ie = (import.meta as { env?: Record<string, string | undefined> })?.env ?? {};
const pe =
  (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;

const fallback = {
  apiKey: "AIzaSyDc-gMLspzxFKvDlIlmPU2tFrcS2zwu_YY",
  authDomain: "lovable-project-45fbe.firebaseapp.com",
  projectId: "lovable-project-45fbe",
  messagingSenderId: "331230824675",
  appId: "1:331230824675:web:e2611cd70d6d0509721dd6",
  storageBucket: "lovable-project-45fbe.firebasestorage.app",
};

export const firebaseConfig = {
  apiKey: ie.VITE_FIREBASE_API_KEY || pe.VITE_FIREBASE_API_KEY || fallback.apiKey,
  authDomain: ie.VITE_FIREBASE_AUTH_DOMAIN || pe.VITE_FIREBASE_AUTH_DOMAIN || fallback.authDomain,
  projectId: ie.VITE_FIREBASE_PROJECT_ID || pe.VITE_FIREBASE_PROJECT_ID || fallback.projectId,
  messagingSenderId:
    ie.VITE_FIREBASE_MESSAGING_SENDER_ID || pe.VITE_FIREBASE_MESSAGING_SENDER_ID || fallback.messagingSenderId,
  appId: ie.VITE_FIREBASE_APP_ID || pe.VITE_FIREBASE_APP_ID || fallback.appId,
  storageBucket: ie.VITE_FIREBASE_STORAGE_BUCKET || pe.VITE_FIREBASE_STORAGE_BUCKET || fallback.storageBucket,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

export const createSecondaryFirebaseApp = (name: string): FirebaseApp => initializeApp(firebaseConfig, name);
