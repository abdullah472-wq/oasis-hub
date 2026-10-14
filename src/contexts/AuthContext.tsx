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
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user) {
          const userProfile = await fetchProfile(initialSession.user);
          if (mounted) setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) setLoading(false);
      }
    };

    void initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        const userProfile = await fetchProfile(currentSession.user);
        if (mounted) setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("No user returned from login.");
    }

    const userProfile = (await fetchProfile(data.user)) || {
      id: data.user.id,
      email: data.user.email || "",
      full_name: "অ্যাডমিন",
      role: "super_admin" as UserRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSession(data.session);
    setUser(data.user);
    setProfile(userProfile);

    void logAdminActivity("LOGIN", "auth", `User logged in: ${data.user.email}`);

    return { user: data.user, profile: userProfile };
  };

  const logout = async () => {
    void logAdminActivity("LOGOUT", "auth", `User logged out: ${user?.email || "unknown"}`);
    await supabase.auth.signOut();
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
