import { deleteApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { createSecondaryFirebaseApp, db } from "@/lib/firebase";
import type { AdminPermission, AdminRole, AdminStatus, AdminUser } from "@/lib/adminDashboard";

const USERS_COLLECTION = "users";

export interface FirestoreUserProfile extends AdminUser {
  phone?: string;
  createdAt?: unknown;
}

export interface ManagerFormValues {
  uid?: string;
  fullName: string;
  email: string;
  password: string;
  role: Extract<AdminRole, "manager" | "guardian">;
  status: AdminStatus;
  permissions: AdminPermission[];
}

const toUserProfile = (uid: string, data: Record<string, unknown>): FirestoreUserProfile => ({
  uid,
  fullName: String(data.fullName ?? ""),
  email: String(data.email ?? ""),
  phone: data.phone ? String(data.phone) : undefined,
  role: (data.role as AdminRole) ?? "guardian",
  status: (data.status as AdminStatus) ?? "inactive",
  permissions: Array.isArray(data.permissions) ? (data.permissions as AdminPermission[]) : [],
  createdAt: data.createdAt,
});

export const getUserProfile = async (uid: string): Promise<FirestoreUserProfile | null> => {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snapshot.exists()) return null;
  return toUserProfile(snapshot.id, snapshot.data());
};

export const listUsersByRole = async (role: AdminRole): Promise<FirestoreUserProfile[]> => {
  const snapshot = await getDocs(query(collection(db, USERS_COLLECTION), where("role", "==", role), orderBy("createdAt", "desc")));
  return snapshot.docs.map((item) => toUserProfile(item.id, item.data()));
};

export const upsertUserProfile = async (uid: string, payload: Omit<FirestoreUserProfile, "uid" | "createdAt">) => {
  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    {
      ...payload,
      email: payload.email.trim().toLowerCase(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const createManagedUser = async (values: ManagerFormValues): Promise<FirestoreUserProfile> => {
  const appName = `manager-create-${Date.now()}`;
  const secondaryApp = createSecondaryFirebaseApp(appName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credentials = await createUserWithEmailAndPassword(
      secondaryAuth,
      values.email.trim().toLowerCase(),
      values.password,
    );

    const profile: Omit<FirestoreUserProfile, "uid" | "createdAt"> = {
      fullName: values.fullName,
      email: values.email.trim().toLowerCase(),
      role: values.role,
      status: values.status,
      permissions: values.permissions,
    };

    await upsertUserProfile(credentials.user.uid, profile);

    return {
      uid: credentials.user.uid,
      ...profile,
    };
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(secondaryApp).catch(() => undefined);
  }
};

export const updateManagedUser = async (uid: string, values: Omit<ManagerFormValues, "uid" | "password">) => {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    fullName: values.fullName,
    email: values.email.trim().toLowerCase(),
    role: values.role,
    status: values.status,
    permissions: values.permissions,
  });
};

export const deactivateManagedUser = async (uid: string, status: AdminStatus) => {
  await updateDoc(doc(db, USERS_COLLECTION, uid), { status });
};

export const deleteManagedUserProfile = async (uid: string) => {
  await deleteDoc(doc(db, USERS_COLLECTION, uid));
};
