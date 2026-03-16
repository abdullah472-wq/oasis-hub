import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDc-gMLspzxFKvDlIlmPU2tFrcS2zwu_YY",
  authDomain: "lovable-project-45fbe.firebaseapp.com",
  projectId: "lovable-project-45fbe",
  storageBucket: "lovable-project-45fbe.firebasestorage.app",
  messagingSenderId: "331230824675",
  appId: "1:331230824675:web:e2611cd70d6d0509721dd6"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
