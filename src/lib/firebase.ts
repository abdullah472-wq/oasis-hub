import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDc-gMLspzxFKvDlIlmPU2tFrcS2zwu_YY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lovable-project-45fbe.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lovable-project-45fbe",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lovable-project-45fbe.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "331230824675",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:331230824675:web:e2611cd70d6d0509721dd6",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
