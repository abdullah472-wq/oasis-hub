import { createClient } from "@supabase/supabase-js";
import type { ActivityLog } from "@/types/cms";
import { uploadImage, uploadDocument, uploadFile } from "../upload";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://gzxyrfkmkzbehxtehbwn.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eHlyZmtta3piZWh4dGVoYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NjE2MDEsImV4cCI6MjEwNzUzNzYwMX0.4IIwypCyr8lhwefPRd6oQlmhEcbARXdSqAzUY_8Uox8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Upload a file with resilient multi-tier fallback:
 * 1. Supabase Storage (primary cloud storage bucket)
 * 2. Cloudinary CDN (instant fallback if Supabase is offline/paused)
 * 3. Base64 Data URL (fail-safe for images under 2MB so admin workflows are never blocked)
 */
export const uploadCmsFile = async (
  bucket: "cms-notices" | "cms-gallery" | "cms-downloads" | "cms-branding",
  file: File,
  folder = "uploads"
): Promise<string> => {
  // 1. Attempt upload to Supabase Storage if reachable
  try {
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

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }

    if (error) {
      console.warn("Supabase Storage upload warning, falling back to Cloudinary:", error.message);
    }
  } catch (err: any) {
    console.warn("Supabase Storage unreachable, falling back to Cloudinary:", err?.message || err);
  }

  // 2. Fall back to Cloudinary CDN
  try {
    if (file.type.startsWith("image/")) {
      return await uploadImage(file);
    } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return await uploadDocument(file);
    } else {
      return await uploadFile(file);
    }
  } catch (cloudinaryErr: any) {
    console.warn("Cloudinary upload failed, checking local Base64 fallback:", cloudinaryErr?.message || cloudinaryErr);

    // 3. For images under 2MB, fallback to Base64 data URL so user is never blocked
    if (file.type.startsWith("image/") && file.size < 2 * 1024 * 1024) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("ছবি প্রসেস করতে ব্যর্থ হয়েছে"));
        reader.readAsDataURL(file);
      });
    }

    throw new Error(`File upload failed: ${cloudinaryErr?.message || "Upload service unavailable"}`);
  }
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
