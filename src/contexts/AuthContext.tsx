import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/adminUsers";
import type { AdminPermission, AdminUser } from "@/lib/adminDashboard";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  currentUser: AdminUser | null;
  permissions: AdminPermission[];
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const isPermissionDenied = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "permission-denied";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (user: FirebaseUser | null) => {
    if (!user) {
      setFirebaseUser(null);
      setCurrentUser(null);
      return;
    }

    setFirebaseUser(user);
    let profile: AdminUser | null = null;

    try {
      profile = await getUserProfile(user.uid);
    } catch (error) {
      if (isPermissionDenied(error)) {
        await signOut(auth);
        setFirebaseUser(null);
        setCurrentUser(null);
        return;
      }

      throw error;
    }

    if (!profile) {
      await signOut(auth);
      setFirebaseUser(null);
      setCurrentUser(null);
      return;
    }

    setCurrentUser(profile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        await loadProfile(user);
      } catch (error) {
        console.error("Failed to load auth profile:", error);
        setFirebaseUser(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const credentials = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    let profile: AdminUser | null = null;

    try {
      profile = await getUserProfile(credentials.user.uid);
    } catch (error) {
      if (isPermissionDenied(error)) {
        await signOut(auth);
        throw new Error("permission-denied");
      }

      throw error;
    }

    if (!profile) {
      await signOut(auth);
      throw new Error("Account profile not found.");
    }

    setFirebaseUser(credentials.user);
    setCurrentUser(profile);
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setCurrentUser(null);
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const profile = await getUserProfile(auth.currentUser.uid);
      setCurrentUser(profile);
    } catch (error) {
      if (isPermissionDenied(error)) {
        await signOut(auth);
        setFirebaseUser(null);
        setCurrentUser(null);
        return;
      }

      throw error;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      currentUser,
      permissions: currentUser?.permissions ?? [],
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [currentUser, firebaseUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
