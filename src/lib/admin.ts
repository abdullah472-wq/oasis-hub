import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile, upsertUserProfile } from "./adminUsers";
import { ADMIN_PERMISSION_KEYS, type AdminUser } from "./adminDashboard";

const enableAdminPanel = import.meta.env.VITE_ENABLE_ADMIN_PANEL === "true";
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD?.trim() || "";
const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() || "admin@annoor.local");

export const isAdminEnabled = enableAdminPanel;

export const validateAdminPassword = (value: string): boolean => {
  return isAdminEnabled && adminPassword.length > 0 && value.trim() === adminPassword;
};

const isRecoverableAdminSignInError = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  const code = String((error as { code?: string }).code || "");
  return code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/invalid-login-credentials";
};

export const ensureAdminAuthSession = async (password: string): Promise<AdminUser> => {
  if (!validateAdminPassword(password)) {
    throw new Error("invalid-admin-password");
  }

  let credentials;

  try {
    credentials = await signInWithEmailAndPassword(auth, adminEmail, password.trim());
  } catch (error) {
    if (!isRecoverableAdminSignInError(error)) {
      throw error;
    }

    credentials = await createUserWithEmailAndPassword(auth, adminEmail, password.trim());
  }

  await upsertUserProfile(credentials.user.uid, {
    fullName: "সুপার অ্যাডমিন",
    email: adminEmail,
    role: "admin",
    status: "active",
    permissions: [...ADMIN_PERMISSION_KEYS],
  });

  const profile = await getUserProfile(credentials.user.uid);
  if (!profile) {
    throw new Error("admin-profile-not-found");
  }

  return profile;
};
