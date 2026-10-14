import { createClient } from "@supabase/supabase-js";
import type { ActivityLog } from "@/types/cms";

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
