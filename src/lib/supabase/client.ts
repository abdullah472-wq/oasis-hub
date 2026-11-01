import { createClient } from "@supabase/supabase-js";
import type { ActivityLog } from "@/types/cms";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://tmhjuznymgzkzxkfnlzn.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaGp1em55bWd6a3p4a2ZubHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MDY5NDYsImV4cCI6MjEwOTA4Mjk0Nn0.7Hi-ykQrai8ECAO_KlVTO4mtcRLa9X3Rl3X9DTpniow";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Upload a file to a specific Supabase storage bucket and return the public URL.
 */
export const uploadCmsFile = async (
  bucket: "cms-notices" | "cms-gallery" | "cms-downloads" | "cms-branding",
  file: File,
  folder = "uploads"
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const fileName = `${folder}/${Date.now()}_${cleanBaseName}.${fileExt}`;

  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrlData.publicUrl;
};

/**
 * Ensures that the Supabase client has an active authenticated session.
 * If not authenticated, automatically authenticates with admin credentials
 * so that RLS-protected CMS writes (faculty, notices, etc.) succeed.
 * @param forceRefresh If true, forces a re-login even if a session is present.
 */
export const ensureSupabaseAdminAuth = async (forceRefresh: boolean = false): Promise<boolean> => {
  try {
    if (!forceRefresh) {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      const now = Math.floor(Date.now() / 1000);
      // Valid session that does not expire within next 60 seconds
      if (session?.user && session.expires_at && session.expires_at > now + 60) {
        return true;
      }
    }
    const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "abdullahalmamon472@gmail.com").trim();
    const adminPassword = (import.meta.env.VITE_ADMIN_PASSWORD || "oasis2026").trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (error) {
      console.warn("Auto-authenticating admin failed:", error.message);
      return false;
    }
    return !!data?.session;
  } catch (err) {
    console.warn("ensureSupabaseAdminAuth error:", err);
    return false;
  }
};

/**
 * Log an administrative activity for audit purposes.
 */
export const logAdminActivity = async (
  action: ActivityLog["action"],
  module: ActivityLog["module"],
  details: string
): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    const userEmail = user?.email || "anonymous_admin";
    const userId = user?.id || null;

    await supabase.from("activity_logs").insert([
      {
        user_id: userId,
        user_email: userEmail,
        action,
        module,
        details,
      },
    ]);
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
};
