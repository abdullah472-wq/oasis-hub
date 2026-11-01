import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { MediaVideo, MediaType } from "@/types/cms";

export type { MediaVideo, MediaType };

export const VIDEOS_CACHE_KEY = "oasis_media_videos_cache_v2";
export const VIDEOS_UPDATED_EVENT = "oasis_videos_updated";

/**
 * Default curated video list used for initial display & offline/fallback mode.
 */
export const defaultVideosList: MediaVideo[] = [];

/**
 * Extracts YouTube ID based on whether it is a video, playlist, or livestream.
 */
export function extractYouTubeId(url: string, preferredType?: MediaType): string {
  if (!url) return "";
  const trimmed = url.trim();

  // If playlist type is explicitly targeted or link has list=
  const listMatch = trimmed.match(/[?&]list=([^#&?]+)/);
  if (preferredType === "playlist" && listMatch && listMatch[1]) {
    return listMatch[1];
  }

  // Standard video, shorts, youtu.be, or embed match
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?\/]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }

  // If no 11-char ID found but list exists
  if (listMatch && listMatch[1]) {
    return listMatch[1];
  }

  // User pasted plain ID
  if (trimmed.length >= 11 && !trimmed.includes("/")) {
    return trimmed;
  }

  return "";
}

/**
 * Local cache read
 */
export const getCachedVideos = (): MediaVideo[] => {
  if (typeof window === "undefined") return defaultVideosList;
  try {
    const raw = localStorage.getItem(VIDEOS_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(VIDEOS_CACHE_KEY, JSON.stringify(defaultVideosList));
      return defaultVideosList;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultVideosList;
  } catch (err) {
    console.warn("Failed to read media videos from cache:", err);
    return defaultVideosList;
  }
};

/**
 * Local cache write & dispatch event
 */
export const saveVideosToCache = (items: MediaVideo[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VIDEOS_CACHE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(VIDEOS_UPDATED_EVENT, { detail: items }));
    window.dispatchEvent(new StorageEvent("storage", { key: VIDEOS_CACHE_KEY }));
  } catch (err) {
    console.warn("Failed to save media videos to cache:", err);
  }
};

export interface FetchVideosResult {
  videos: MediaVideo[];
  isTableMissing: boolean;
}

/**
 * Checks if the media_videos table is missing in Supabase schema cache
 */
function isTableMissingError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const code = err.code || "";
  return (
    code === "PGRST205" ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache") ||
    msg.includes("relation \"public.media_videos\" does not exist")
  );
}

/**
 * Fetch all videos: Supabase first, fallback to LocalStorage cache
 */
export async function getVideoList(): Promise<FetchVideosResult> {
  try {
    const { data, error } = await supabase
      .from("media_videos")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      const isMissing = isTableMissingError(error);
      if (isMissing) {
        console.warn("Supabase 'media_videos' table not found in schema cache. Using local cache.");
      } else {
        console.warn("Supabase fetch error for media_videos:", error.message);
      }
      return { videos: getCachedVideos(), isTableMissing: isMissing };
    }

    if (!data || data.length === 0) {
      // If table exists but empty, check if cache has items
      const cached = getCachedVideos();
      return { videos: cached, isTableMissing: false };
    }

    const mapped: MediaVideo[] = data.map((item: any, idx: number) => ({
      id: item.id || `vid-${idx}`,
      title_bn: item.title_bn || "",
      title_en: item.title_en || null,
      youtube_url: item.youtube_url || "",
      youtube_video_id: item.youtube_video_id || "",
      type: (item.type as MediaType) || "video",
      is_featured: Boolean(item.is_featured),
      order_index: item.order_index ?? idx + 1,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    }));

    saveVideosToCache(mapped);
    return { videos: mapped, isTableMissing: false };
  } catch (err: any) {
    const isMissing = isTableMissingError(err);
    console.warn("Failed to fetch videos from Supabase:", err);
    return { videos: getCachedVideos(), isTableMissing: isMissing };
  }
}

export interface SaveVideoResult {
  success: boolean;
  item: MediaVideo;
  isTableMissing: boolean;
  error?: string;
}

/**
 * Save / Update a video with immediate local cache persistence and Supabase synchronization
 */
export async function saveVideoItem(
  formData: {
    id?: string;
    title_bn: string;
    title_en?: string | null;
    youtube_url: string;
    youtube_video_id: string;
    type: MediaType;
    is_featured: boolean;
    order_index: number;
  }
): Promise<SaveVideoResult> {
  const current = getCachedVideos();
  const isEditing = Boolean(formData.id);
  const targetId = formData.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `vid-${Date.now()}`);

  const prepared: MediaVideo = {
    id: targetId,
    title_bn: formData.title_bn.trim(),
    title_en: formData.title_en?.trim() || null,
    youtube_url: formData.youtube_url.trim(),
    youtube_video_id: formData.youtube_video_id.trim(),
    type: formData.type || "video",
    is_featured: Boolean(formData.is_featured),
    order_index: Number(formData.order_index) || 0,
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Immediately update Local Cache so the user never loses their changes
  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [prepared, ...current];

  saveVideosToCache(updatedList);

  // 2. Sync to Supabase
  let isTableMissing = false;
  try {
    const payload = {
      title_bn: prepared.title_bn,
      title_en: prepared.title_en,
      youtube_url: prepared.youtube_url,
      youtube_video_id: prepared.youtube_video_id,
      type: prepared.type,
      is_featured: prepared.is_featured,
      order_index: prepared.order_index,
      updated_at: prepared.updated_at,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("media_videos")
        .update(payload)
        .eq("id", targetId);

      if (error) {
        if (isTableMissingError(error)) {
          isTableMissing = true;
          console.warn("Supabase 'media_videos' table missing during update. Data kept in local cache.");
        } else {
          console.warn("Supabase update error:", error);
        }
      }
    } else {
      // Check if targetId is valid UUID for insert
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
      const insertPayload = isValidUuid ? { id: targetId, ...payload } : payload;

      const { data, error } = await supabase
        .from("media_videos")
        .insert([insertPayload])
        .select()
        .maybeSingle();

      if (error) {
        if (isTableMissingError(error)) {
          isTableMissing = true;
          console.warn("Supabase 'media_videos' table missing during insert. Data kept in local cache.");
        } else {
          console.warn("Supabase insert error:", error);
        }
      } else if (data && data.id) {
        // If Supabase returned generated UUID, update ID in cache
        prepared.id = data.id;
        const syncedList = updatedList.map((c) => (c.id === targetId ? prepared : c));
        saveVideosToCache(syncedList);
      }
    }

    void logAdminActivity(
      isEditing ? "UPDATE" : "CREATE",
      "media_videos",
      `${isEditing ? "ভিডিও আপডেট" : "নতুন ভিডিও যুক্ত"}: "${prepared.title_bn}"`
    );
  } catch (err: any) {
    if (isTableMissingError(err)) {
      isTableMissing = true;
    }
    console.warn("Supabase synchronization error, local cache retained:", err);
  }

  return { success: true, item: prepared, isTableMissing };
}

/**
 * Delete a video item
 */
export async function deleteVideoItem(id: string): Promise<void> {
  const current = getCachedVideos();
  const deletedItem = current.find((c) => c.id === id);

  try {
    await supabase.from("media_videos").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete video error, relying on local cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveVideosToCache(filtered);

  if (deletedItem) {
    void logAdminActivity(
      "DELETE",
      "media_videos",
      `ভিডিও ডিলিট: "${deletedItem.title_bn}"`
    );
  }
}

/**
 * Toggle featured status
 */
export async function toggleVideoFeatured(video: MediaVideo): Promise<boolean> {
  const current = getCachedVideos();
  const updatedStatus = !video.is_featured;

  try {
    await supabase
      .from("media_videos")
      .update({ is_featured: updatedStatus, updated_at: new Date().toISOString() })
      .eq("id", video.id);
  } catch (err) {
    console.warn("Supabase toggle featured error, updating local cache:", err);
  }

  const updatedList = current.map((v) =>
    v.id === video.id ? { ...v, is_featured: updatedStatus } : v
  );
  saveVideosToCache(updatedList);

  void logAdminActivity(
    "UPDATE",
    "media_videos",
    `ফিচার স্ট্যাটাস পরিবর্তন: "${video.title_bn}" -> ${updatedStatus ? "Featured" : "Regular"}`
  );

  return updatedStatus;
}
