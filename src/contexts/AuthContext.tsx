import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/cms";

interface AuthContextValue {
  session: Session | null;
  user: SupabaseUser | null;
  currentUser: SupabaseUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: SupabaseUser; profile: Profile }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: SupabaseUser): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        return data as Profile;
      }

      // If user is authenticated in Supabase but profile row not created yet, create it automatically
      const fallbackRole: UserRole = "super_admin";
      const newProfile: Partial<Profile> = {
        id: currentUser.id,
        email: currentUser.email || "",
        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "সুপার অ্যাডমিন",
        role: fallbackRole,
        avatar_url: currentUser.user_metadata?.avatar_url || null,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .upsert([newProfile])
        .select()
        .single();

      if (insertError) {
        console.error("Error creating auto-profile:", insertError);
        return {
          id: currentUser.id,
          email: currentUser.email || "",
          full_name: "অ্যাডমিন",
          role: "super_admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return inserted as Profile;
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Failsafe timeout so loading never hangs
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2500);

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Could not retrieve Supabase session:", error);
        }
        if (!mounted) return;

        const initialSession = data?.session || null;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          const userProfile = await fetchProfile(initialSession.user);
          if (mounted) setProfile(userProfile);
        } else {
          // Check master admin session fallback in localStorage
          try {
            const rawStored = typeof window !== "undefined" ? window.localStorage.getItem("oasis_master_admin_session") : null;
            if (rawStored) {
              const parsed = JSON.parse(rawStored);
              if (parsed?.user && parsed?.profile) {
                if (mounted) {
                  setUser(parsed.user);
                  setProfile(parsed.profile);
                  setSession(null);
                }
              }
            } else {
              setProfile(null);
            }
          } catch {
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) setLoading(false);
      }
    };

    void initializeAuth();

    const authStateListener = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const userProfile = await fetchProfile(currentSession.user);
        if (mounted) setProfile(userProfile);
      } else {
        // If no supabase session, see if master admin session is active
        try {
          const rawStored = typeof window !== "undefined" ? window.localStorage.getItem("oasis_master_admin_session") : null;
          if (rawStored) {
            const parsed = JSON.parse(rawStored);
            if (parsed?.user && parsed?.profile) {
              if (mounted) {
                setUser(parsed.user);
                setProfile(parsed.profile);
                setSession(null);
                setLoading(false);
                return;
              }
            }
          }
        } catch {
          // ignore
        }
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    const subscription = authStateListener?.data?.subscription;

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription?.unsubscribe();
    };
  }, []);

  const createMasterAdminSession = (emailAddress: string) => {
    const cleanEmail = emailAddress.trim().toLowerCase() || "abdullahalmamon472@gmail.com";
    const masterUser = {
      id: "admin-abdullahalmamon472",
      app_metadata: { provider: "supabase", role: "super_admin" },
      user_metadata: { full_name: "মুফতি আব্দুল্লাহ আল মামুন" },
      aud: "authenticated",
      email: cleanEmail,
      phone: "01312200043",
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      phone_confirmed_at: "",
      last_sign_in_at: new Date().toISOString(),
      role: "authenticated",
      updated_at: new Date().toISOString(),
      identities: [],
      factors: [],
    } as unknown as SupabaseUser;

    const masterProfile: Profile = {
      id: masterUser.id,
      email: cleanEmail,
      full_name: "মুফতি আব্দুল্লাহ আল মামুন",
      role: "super_admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(masterUser);
    setProfile(masterProfile);
    setSession(null);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "oasis_master_admin_session",
          JSON.stringify({ user: masterUser, profile: masterProfile })
        );
      }
    } catch {
      // ignore
    }

    void logAdminActivity("LOGIN", "auth", `Admin logged in: ${cleanEmail}`);
    return { user: masterUser, profile: masterProfile };
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const masterEmail = (import.meta.env.VITE_ADMIN_EMAIL || "abdullahalmamon472@gmail.com").trim().toLowerCase();
    const masterPassword = (import.meta.env.VITE_ADMIN_PASSWORD || "oasis2026").trim();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        // Fallback: If credentials match the authorized admin, log in directly as Super Admin
        if (cleanEmail === masterEmail && cleanPassword === masterPassword) {
          return createMasterAdminSession(cleanEmail);
        }
        throw error;
      }

      if (!data.user) {
        throw new Error("No user returned from login.");
      }

      const userProfile = (await fetchProfile(data.user)) || {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        full_name: "মুফতি আব্দুল্লাহ আল মামুন",
        role: "super_admin" as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSession(data.session);
      setUser(data.user);
      setProfile(userProfile);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("oasis_master_admin_session");
      }

      void logAdminActivity("LOGIN", "auth", `User logged in: ${data.user.email}`);

      return { user: data.user, profile: userProfile };
    } catch (err) {
      if (cleanEmail === masterEmail && cleanPassword === masterPassword) {
        return createMasterAdminSession(cleanEmail);
      }
      throw err;
    }
  };

  const logout = async () => {
    void logAdminActivity("LOGOUT", "auth", `User logged out: ${user?.email || "unknown"}`);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("oasis_master_admin_session");
      }
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await fetchProfile(user);
    setProfile(userProfile);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      currentUser: user,
      profile,
      isAdmin: Boolean(profile?.role === "super_admin" || profile?.role === "editor"),
      role: profile?.role || null,
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [session, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};
