import { deleteApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  doc,
  where,
} from "firebase/firestore";
import { createSecondaryFirebaseApp, db } from "@/lib/firebase";

export type GuardianRelationship = "Father" | "Mother" | "Guardian";

export interface GuardianRegistrationInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  relationship: GuardianRelationship;
  address?: string;
  nid?: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  roll: number;
}

const USERS_COLLECTION = "users";
const GUARDIANS_COLLECTION = "guardians";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const findExistingGuardianByStudentId = async (studentId: string) => {
  const snapshot = await getDocs(
    query(collection(db, GUARDIANS_COLLECTION), where("studentId", "==", studentId.trim())),
  );

  return snapshot.docs[0] ?? null;
};

export const registerGuardian = async (values: GuardianRegistrationInput) => {
  const studentId = values.studentId.trim();
  const existingGuardian = await findExistingGuardianByStudentId(studentId);

  if (existingGuardian) {
    throw new Error("student-already-linked");
  }

  const appName = `guardian-register-${Date.now()}`;
  const secondaryApp = createSecondaryFirebaseApp(appName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credentials = await createUserWithEmailAndPassword(
      secondaryAuth,
      normalizeEmail(values.email),
      values.password,
    );

    const uid = credentials.user.uid;

    await setDoc(doc(db, USERS_COLLECTION, uid), {
      uid,
      fullName: values.fullName.trim(),
      email: normalizeEmail(values.email),
      phone: values.phone.trim(),
      role: "guardian",
      status: "pending",
      permissions: [],
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, GUARDIANS_COLLECTION, uid), {
      uid,
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      email: normalizeEmail(values.email),
      relationship: values.relationship,
      address: values.address?.trim() || "",
      nid: values.nid?.trim() || "",
      studentId,
      studentName: values.studentName.trim(),
      className: values.className.trim(),
      section: values.section.trim(),
      roll: Number(values.roll || 0),
      status: "pending",
      createdAt: serverTimestamp(),
    });

    return { uid };
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(secondaryApp).catch(() => undefined);
  }
};
