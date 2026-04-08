import { deleteApp } from "firebase/app";
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
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

export type GuardianAccountStatus = "pending" | "active";

const USERS_COLLECTION = "users";
const GUARDIANS_COLLECTION = "guardians";
const STUDENT_LINKS_COLLECTION = "student_guardian_links";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const registerGuardian = async (values: GuardianRegistrationInput) => {
  const studentId = values.studentId.trim();
  const appName = `guardian-register-${Date.now()}`;
  const secondaryApp = createSecondaryFirebaseApp(appName);
  const secondaryAuth = getAuth(secondaryApp);
  const secondaryDb = getFirestore(secondaryApp);
  let createdUser: Awaited<ReturnType<typeof createUserWithEmailAndPassword>>["user"] | null = null;

  try {
    const credentials = await createUserWithEmailAndPassword(
      secondaryAuth,
      normalizeEmail(values.email),
      values.password,
    );
    createdUser = credentials.user;

    const uid = credentials.user.uid;
    const userRef = doc(secondaryDb, USERS_COLLECTION, uid);
    const guardianRef = doc(secondaryDb, GUARDIANS_COLLECTION, uid);
    const studentLinkRef = doc(secondaryDb, STUDENT_LINKS_COLLECTION, studentId);

    await setDoc(studentLinkRef, {
      studentId,
      guardianUid: uid,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    await setDoc(userRef, {
      uid,
      fullName: values.fullName.trim(),
      email: normalizeEmail(values.email),
      phone: values.phone.trim(),
      role: "guardian",
      status: "pending",
      permissions: [],
      createdAt: serverTimestamp(),
    });

    await setDoc(guardianRef, {
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
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (createdUser && (code === "permission-denied" || error instanceof Error)) {
      const studentLinkRef = doc(secondaryDb, STUDENT_LINKS_COLLECTION, studentId);
      await deleteDoc(studentLinkRef).catch(() => undefined);
      await deleteUser(createdUser).catch(() => undefined);
    }

    if (code === "permission-denied") {
      throw new Error("permission-denied");
    }

    throw error;
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(secondaryApp).catch(() => undefined);
  }
};

export const createGuardianAccountByAdmin = async (
  values: GuardianRegistrationInput,
  status: GuardianAccountStatus = "active",
) => {
  const studentId = values.studentId.trim();
  const appName = `guardian-admin-create-${Date.now()}`;
  const secondaryApp = createSecondaryFirebaseApp(appName);
  const secondaryAuth = getAuth(secondaryApp);
  let createdUser: Awaited<ReturnType<typeof createUserWithEmailAndPassword>>["user"] | null = null;

  try {
    const studentLinkRef = doc(db, STUDENT_LINKS_COLLECTION, studentId);
    const existingStudentLink = await getDoc(studentLinkRef);

    if (existingStudentLink.exists()) {
      throw new Error("student-already-linked");
    }

    const credentials = await createUserWithEmailAndPassword(
      secondaryAuth,
      normalizeEmail(values.email),
      values.password,
    );
    createdUser = credentials.user;

    const uid = credentials.user.uid;
    const userRef = doc(db, USERS_COLLECTION, uid);
    const guardianRef = doc(db, GUARDIANS_COLLECTION, uid);

    await setDoc(studentLinkRef, {
      studentId,
      guardianUid: uid,
      status,
      createdAt: serverTimestamp(),
    });

    await setDoc(userRef, {
      uid,
      fullName: values.fullName.trim(),
      email: normalizeEmail(values.email),
      phone: values.phone.trim(),
      role: "guardian",
      status,
      permissions: [],
      createdAt: serverTimestamp(),
    });

    await setDoc(guardianRef, {
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
      status,
      createdAt: serverTimestamp(),
    });

    return { uid };
  } catch (error) {
    if (createdUser) {
      await deleteDoc(doc(db, STUDENT_LINKS_COLLECTION, studentId)).catch(() => undefined);
      await deleteDoc(doc(db, USERS_COLLECTION, createdUser.uid)).catch(() => undefined);
      await deleteDoc(doc(db, GUARDIANS_COLLECTION, createdUser.uid)).catch(() => undefined);
      await deleteUser(createdUser).catch(() => undefined);
    }

    throw error;
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(secondaryApp).catch(() => undefined);
  }
};
