import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const ie = (import.meta as { env?: Record<string, string | undefined> })?.env ?? {};
const pe =
  (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;

const fallback = {
  apiKey: "AIzaSyDc-gMLspzxFKvDlIlmPU2tFrcS2zwu_YY",
  authDomain: "lovable-project-45fbe.firebaseapp.com",
  databaseURL: "https://lovable-project-45fbe-default-rtdb.firebaseio.com",
  projectId: "lovable-project-45fbe",
  messagingSenderId: "331230824675",
  appId: "1:331230824675:web:7498c9386112d2fc721dd6",
  measurementId: "G-P7G1W3ELSM",
  storageBucket: "lovable-project-45fbe.firebasestorage.app",
};

export const firebaseConfig = {
  apiKey: ie.VITE_FIREBASE_API_KEY || pe.VITE_FIREBASE_API_KEY || fallback.apiKey,
  authDomain: ie.VITE_FIREBASE_AUTH_DOMAIN || pe.VITE_FIREBASE_AUTH_DOMAIN || fallback.authDomain,
  databaseURL: ie.VITE_FIREBASE_DATABASE_URL || pe.VITE_FIREBASE_DATABASE_URL || fallback.databaseURL,
  projectId: ie.VITE_FIREBASE_PROJECT_ID || pe.VITE_FIREBASE_PROJECT_ID || fallback.projectId,
  messagingSenderId:
    ie.VITE_FIREBASE_MESSAGING_SENDER_ID || pe.VITE_FIREBASE_MESSAGING_SENDER_ID || fallback.messagingSenderId,
  appId: ie.VITE_FIREBASE_APP_ID || pe.VITE_FIREBASE_APP_ID || fallback.appId,
  measurementId: ie.VITE_FIREBASE_MEASUREMENT_ID || pe.VITE_FIREBASE_MEASUREMENT_ID || fallback.measurementId,
  storageBucket: ie.VITE_FIREBASE_STORAGE_BUCKET || pe.VITE_FIREBASE_STORAGE_BUCKET || fallback.storageBucket,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);

const createAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return (await isSupported()) ? getAnalytics(app) : null;
  } catch {
    return null;
  }
};

export const analyticsPromise = createAnalytics();

export const trackAnalyticsEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>,
) => {
  const analytics = await analyticsPromise;

  if (!analytics) {
    return;
  }

  logEvent(analytics, eventName, params);
};

export const trackPageView = async (pagePath: string, pageTitle?: string) => {
  await trackAnalyticsEvent("page_view", {
    page_path: pagePath,
    page_title: pageTitle ?? (typeof document !== "undefined" ? document.title : pagePath),
    page_location: typeof window !== "undefined" ? window.location.href : pagePath,
  });
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

export const createSecondaryFirebaseApp = (name: string): FirebaseApp => initializeApp(firebaseConfig, name);
