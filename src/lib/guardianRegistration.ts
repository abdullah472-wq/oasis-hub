import { deleteApp } from "firebase/app";
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getFirestore,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { createSecondaryFirebaseApp, db } from "@/lib/firebase";
import { syncStudentRecord } from "@/lib/students";

export type GuardianRelationship = "Father" | "Mother" | "Guardian";
const FEMALE_STUDENT_PREFIX = "G-";
export const GUARDIAN_CLASS_OPTIONS = ["Play", "Nursery", ...Array.from({ length: 10 }, (_, index) => String(index + 1))];
export const GUARDIAN_SECTION_OPTIONS = ["Nurani", "Nazera", "Hifzul Quran"];

export interface GuardianRegistrationInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  gender: "male" | "female";
  relationship: GuardianRelationship;
  address?: string;
  nid?: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  roll?: number;
  monthlyFee?: number;
}

export type GuardianAccountStatus = "pending" | "active";

const USERS_COLLECTION = "users";
const GUARDIANS_COLLECTION = "guardians";
const STUDENT_LINKS_COLLECTION = "student_guardian_links";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const stripFemaleStudentPrefix = (studentId: string) => studentId.trim().replace(/^G-\s*/i, "").trim();

export const normalizeGuardianStudentId = (
  studentId: string,
  gender: GuardianRegistrationInput["gender"],
) => {
  const baseStudentId = stripFemaleStudentPrefix(studentId);
  if (gender === "female") {
    return baseStudentId ? `${FEMALE_STUDENT_PREFIX}${baseStudentId}` : FEMALE_STUDENT_PREFIX;
  }

  return baseStudentId;
};

export const createGuardianAccountByAdmin = async (
  values: GuardianRegistrationInput,
  status: GuardianAccountStatus = "active",
) => {
  const studentId = normalizeGuardianStudentId(values.studentId, values.gender);
  if (!stripFemaleStudentPrefix(studentId)) {
    throw new Error("student-id-required");
  }
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
      gender: values.gender,
      relationship: values.relationship,
      address: values.address?.trim() || "",
      nid: values.nid?.trim() || "",
      studentId,
      studentName: values.studentName.trim(),
      className: values.className.trim(),
      section: values.section.trim(),
      roll: Number(values.roll || 0),
      monthlyFee: Number(values.monthlyFee || 0),
      status,
      createdAt: serverTimestamp(),
    });

    if (status === "active") {
      await syncStudentRecord({
        studentId,
        studentName: values.studentName,
        className: values.className,
        section: values.section,
        roll: Number(values.roll || 0),
        monthlyFee: Number(values.monthlyFee || 0),
        guardianUid: uid,
        guardianName: values.fullName,
        guardianPhone: values.phone,
        status: "active",
      }).catch(() => undefined);
    }

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

export const registerGuardian = async (values: GuardianRegistrationInput) => {
  const studentId = normalizeGuardianStudentId(values.studentId, values.gender);
  if (!stripFemaleStudentPrefix(studentId)) {
    throw new Error("student-id-required");
  }

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

    const existingStudentLink = await getDoc(studentLinkRef);
    if (existingStudentLink.exists()) {
      throw new Error("student-already-linked");
    }

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
      gender: values.gender,
      relationship: values.relationship,
      address: values.address?.trim() || "",
      nid: values.nid?.trim() || "",
      studentId,
      studentName: values.studentName.trim(),
      className: values.className.trim(),
      section: values.section.trim(),
      roll: Number(values.roll || 0),
      monthlyFee: Number(values.monthlyFee || 0),
      status: "pending",
      createdAt: serverTimestamp(),
    });

    return { uid };
  } catch (error) {
    if (createdUser) {
      await deleteDoc(doc(secondaryDb, STUDENT_LINKS_COLLECTION, studentId)).catch(() => undefined);
      await deleteDoc(doc(secondaryDb, USERS_COLLECTION, createdUser.uid)).catch(() => undefined);
      await deleteDoc(doc(secondaryDb, GUARDIANS_COLLECTION, createdUser.uid)).catch(() => undefined);
      await deleteUser(createdUser).catch(() => undefined);
    }

    throw error;
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(secondaryApp).catch(() => undefined);
  }
};

export interface ActivateGuardianAccountInput {
  guardianUid: string;
  studentId: string;
  guardianName?: string;
  guardianPhone?: string;
  studentName?: string;
  className?: string;
  section?: string;
}

export const activateGuardianAccount = async (payload: ActivateGuardianAccountInput) => {
  const guardianUid = payload.guardianUid.trim();
  const studentId = payload.studentId.trim();

  if (!guardianUid || !studentId) return;

  const userRef = doc(db, USERS_COLLECTION, guardianUid);
  const guardianRef = doc(db, GUARDIANS_COLLECTION, guardianUid);
  const studentLinkRef = doc(db, STUDENT_LINKS_COLLECTION, studentId);

  await Promise.all([
    setDoc(userRef, { status: "active" }, { merge: true }),
    setDoc(guardianRef, { status: "active" }, { merge: true }),
    setDoc(studentLinkRef, { studentId, guardianUid, status: "active" }, { merge: true }),
  ]);

  const guardianSnapshot = await getDoc(guardianRef).catch(() => null);
  const guardianData = guardianSnapshot?.exists() ? guardianSnapshot.data() : null;

  await syncStudentRecord({
    studentId,
    studentName: payload.studentName?.trim() || String(guardianData?.studentName ?? ""),
    className: payload.className?.trim() || String(guardianData?.className ?? ""),
    section: payload.section?.trim() || String(guardianData?.section ?? ""),
    roll: Number(guardianData?.roll ?? 0),
    monthlyFee: Number(guardianData?.monthlyFee ?? 0),
    guardianUid,
    guardianName: payload.guardianName?.trim() || String(guardianData?.fullName ?? ""),
    guardianPhone: payload.guardianPhone?.trim() || String(guardianData?.phone ?? ""),
    status: "active",
  }).catch(() => undefined);
};
