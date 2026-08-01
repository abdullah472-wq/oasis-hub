import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebase";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MediaStatus = "draft" | "published";

export const VIDEO_CATEGORIES = [
  "admission",
  "classes",
  "quran",
  "hifz",
  "nazera",
  "islamic-studies",
  "events",
  "competitions",
  "podcast",
  "announcements",
  "others",
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export const VIDEO_CATEGORY_LABELS: Record<VideoCategory, { bn: string; en: string }> = {
  admission: { bn: "ভর্তি", en: "Admission" },
  classes: { bn: "ক্লাস", en: "Classes" },
  quran: { bn: "কুরআন", en: "Quran" },
  hifz: { bn: "হিফজ", en: "Hifz" },
  nazera: { bn: "নাজেরা", en: "Nazera" },
  "islamic-studies": { bn: "ইসলামিক স্টাডিজ", en: "Islamic Studies" },
  events: { bn: "অনুষ্ঠান", en: "Events" },
  competitions: { bn: "প্রতিযোগিতা", en: "Competitions" },
  podcast: { bn: "পডকাস্ট", en: "Podcast" },
  announcements: { bn: "ঘোষণা", en: "Announcements" },
  others: { bn: "অন্যান্য", en: "Others" },
};

export const GALLERY_CATEGORIES = [
  "campus",
  "students",
  "teachers",
  "events",
  "competitions",
  "hifz",
  "others",
] as const;

export type MediaGalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_CATEGORY_LABELS: Record<MediaGalleryCategory, { bn: string; en: string }> = {
  campus: { bn: "ক্যাম্পাস", en: "Campus" },
  students: { bn: "শিক্ষার্থী", en: "Students" },
  teachers: { bn: "শিক্ষক", en: "Teachers" },
  events: { bn: "অনুষ্ঠান", en: "Events" },
  competitions: { bn: "প্রতিযোগিতা", en: "Competitions" },
  hifz: { bn: "হিফজ", en: "Hifz" },
  others: { bn: "অন্যান্য", en: "Others" },
};

export const DOWNLOAD_CATEGORIES = [
  "routine",
  "prospectus",
  "admission-form",
  "syllabus",
  "result-sheet",
  "others",
] as const;

export type DownloadCategory = (typeof DOWNLOAD_CATEGORIES)[number];

export const DOWNLOAD_CATEGORY_LABELS: Record<DownloadCategory, { bn: string; en: string }> = {
  routine: { bn: "রুটিন", en: "Routine" },
  prospectus: { bn: "প্রসপেক্টাস", en: "Prospectus" },
  "admission-form": { bn: "ভর্তি ফরম", en: "Admission Form" },
  syllabus: { bn: "সিলেবাস", en: "Syllabus" },
  "result-sheet": { bn: "ফলাফল শিট", en: "Result Sheet" },
  others: { bn: "অন্যান্য", en: "Others" },
};

export interface MediaVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  thumbnailUrl: string;
  embedUrl: string;
  category: VideoCategory;
  playlistId?: string;
  description?: string;
  duration?: string;
  featured: boolean;
  status: MediaStatus;
  displayOrder: number;
  views: number;
  createdAt: number;
  updatedAt: number;
}

export interface MediaPlaylist {
  id: string;
  name: string;
  youtubeUrl?: string;
  playlistId?: string;
  description?: string;
  thumbnailUrl?: string;
  featured: boolean;
  status: MediaStatus;
  createdAt: number;
  updatedAt: number;
}

export interface MediaLiveStream {
  title: string;
  description?: string;
  youtubeUrl: string;
  videoId: string;
  embedUrl: string;
  status: "live" | "offline";
  updatedAt: number;
}

export interface MediaGalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  album: string;
  category: MediaGalleryCategory;
  featured: boolean;
  status: MediaStatus;
  createdAt: number;
}

export interface MediaDownload {
  id: string;
  title: string;
  category: DownloadCategory;
  fileUrl: string;
  fileName?: string;
  description?: string;
  status: MediaStatus;
  downloads: number;
  createdAt: number;
}

export type MediaActivityAction =
  | "video.added"
  | "video.updated"
  | "video.deleted"
  | "playlist.created"
  | "playlist.updated"
  | "playlist.deleted"
  | "gallery.updated"
  | "gallery.deleted"
  | "download.uploaded"
  | "download.deleted"
  | "live.updated";

export interface MediaActivityLog {
  id: string;
  action: MediaActivityAction;
  target: string;
  userId: string;
  userName: string;
  createdAt: number;
}

/* ------------------------------------------------------------------ */
/* YouTube helpers (no API key required)                               */
/* ------------------------------------------------------------------ */

export const extractYouTubeVideoId = (url: string): string => {
  const value = (url || "").trim();
  if (!value) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
};

export const extractYouTubePlaylistId = (url: string): string => {
  const value = (url || "").trim();
  if (!value) return "";
  if (/^(PL|UU|LL|FL|OL)[a-zA-Z0-9_-]{10,}$/.test(value)) return value;
  const match = value.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? "";
};

export const getYouTubeThumbnail = (videoId: string, quality: "hq" | "max" = "hq"): string =>
  videoId ? `https://img.youtube.com/vi/${videoId}/${quality === "max" ? "maxresdefault" : "hqdefault"}.jpg` : "";

export const getYouTubeEmbedUrl = (videoId: string): string =>
  videoId ? `https://www.youtube.com/embed/${videoId}` : "";

export const getYouTubePlaylistEmbedUrl = (playlistId: string): string =>
  playlistId ? `https://www.youtube.com/embed/videoseries?list=${playlistId}` : "";

export const getYouTubeWatchUrl = (videoId: string): string =>
  videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";

/** Resolves everything derivable from a pasted YouTube URL. */
export const resolveYouTubeMeta = (url: string) => {
  const videoId = extractYouTubeVideoId(url);
  return {
    videoId,
    thumbnailUrl: getYouTubeThumbnail(videoId),
    embedUrl: getYouTubeEmbedUrl(videoId),
    watchUrl: getYouTubeWatchUrl(videoId),
    valid: Boolean(videoId),
  };
};

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

const VIDEOS = "media_videos";
const PLAYLISTS = "media_playlists";
const GALLERY = "media_gallery";
const DOWNLOADS = "media_downloads";
const LOGS = "media_activity_logs";
const LIVE_DOC = doc(db, "site_settings", "media_live_stream");

const mapDocs = <T,>(snapshot: { docs: Array<{ id: string; data: () => unknown }> }): T[] =>
  snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Record<string, unknown>) })) as T[];

/* ------------------------------------------------------------------ */
/* Activity logs                                                       */
/* ------------------------------------------------------------------ */

export const logMediaActivity = async (action: MediaActivityAction, target: string) => {
  try {
    await addDoc(collection(db, LOGS), {
      action,
      target,
      userId: auth.currentUser?.uid ?? "system",
      userName: auth.currentUser?.email ?? "system",
      createdAt: Date.now(),
    });
  } catch {
    /* logging must never break the action */
  }
};

export const getMediaActivityLogs = async (max = 25): Promise<MediaActivityLog[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, LOGS), orderBy("createdAt", "desc"), fbLimit(max)));
    return mapDocs<MediaActivityLog>(snapshot);
  } catch {
    return [];
  }
};

/* ------------------------------------------------------------------ */
/* Videos                                                              */
/* ------------------------------------------------------------------ */

export type MediaVideoDraft = Omit<MediaVideo, "id" | "createdAt" | "updatedAt" | "views"> & { views?: number };

export const getMediaVideos = async (): Promise<MediaVideo[]> => {
  const snapshot = await getDocs(query(collection(db, VIDEOS), orderBy("createdAt", "desc")));
  return mapDocs<MediaVideo>(snapshot).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || b.createdAt - a.createdAt);
};

export const getPublishedVideos = async (): Promise<MediaVideo[]> => {
  const videos = await getMediaVideos().catch(() => [] as MediaVideo[]);
  return videos.filter((item) => item.status === "published");
};

const clearOtherFeaturedVideos = async (keepId?: string) => {
  const snapshot = await getDocs(query(collection(db, VIDEOS), where("featured", "==", true)));
  const batch = writeBatch(db);
  let count = 0;
  snapshot.docs.forEach((item) => {
    if (item.id === keepId) return;
    batch.update(doc(db, VIDEOS, item.id), { featured: false, updatedAt: Date.now() });
    count += 1;
  });
  if (count > 0) await batch.commit();
};

export const createMediaVideo = async (draft: MediaVideoDraft): Promise<MediaVideo> => {
  const now = Date.now();
  const payload = { ...draft, views: draft.views ?? 0, createdAt: now, updatedAt: now };
  const ref = await addDoc(collection(db, VIDEOS), payload);
  if (draft.featured) await clearOtherFeaturedVideos(ref.id);
  await logMediaActivity("video.added", draft.title);
  return { ...payload, id: ref.id } as MediaVideo;
};

export const updateMediaVideo = async (id: string, updates: Partial<MediaVideoDraft>, title = "") => {
  await updateDoc(doc(db, VIDEOS, id), { ...updates, updatedAt: Date.now() });
  if (updates.featured) await clearOtherFeaturedVideos(id);
  await logMediaActivity("video.updated", title || id);
};

export const deleteMediaVideo = async (id: string, title = "") => {
  await deleteDoc(doc(db, VIDEOS, id));
  await logMediaActivity("video.deleted", title || id);
};

/* ------------------------------------------------------------------ */
/* Playlists                                                           */
/* ------------------------------------------------------------------ */

export type MediaPlaylistDraft = Omit<MediaPlaylist, "id" | "createdAt" | "updatedAt">;

export const getMediaPlaylists = async (): Promise<MediaPlaylist[]> => {
  const snapshot = await getDocs(query(collection(db, PLAYLISTS), orderBy("createdAt", "desc")));
  return mapDocs<MediaPlaylist>(snapshot);
};

export const createMediaPlaylist = async (draft: MediaPlaylistDraft): Promise<MediaPlaylist> => {
  const now = Date.now();
  const payload = { ...draft, createdAt: now, updatedAt: now };
  const ref = await addDoc(collection(db, PLAYLISTS), payload);
  await logMediaActivity("playlist.created", draft.name);
  return { ...payload, id: ref.id };
};

export const updateMediaPlaylist = async (id: string, updates: Partial<MediaPlaylistDraft>, name = "") => {
  await updateDoc(doc(db, PLAYLISTS, id), { ...updates, updatedAt: Date.now() });
  await logMediaActivity("playlist.updated", name || id);
};

export const deleteMediaPlaylist = async (id: string, name = "") => {
  await deleteDoc(doc(db, PLAYLISTS, id));
  await logMediaActivity("playlist.deleted", name || id);
};

/* ------------------------------------------------------------------ */
/* Live stream                                                         */
/* ------------------------------------------------------------------ */

export const getMediaLiveStream = async (): Promise<MediaLiveStream | null> => {
  try {
    const snapshot = await getDoc(LIVE_DOC);
    return snapshot.exists() ? (snapshot.data() as MediaLiveStream) : null;
  } catch {
    return null;
  }
};

export const saveMediaLiveStream = async (stream: Omit<MediaLiveStream, "updatedAt">) => {
  const payload: MediaLiveStream = { ...stream, updatedAt: Date.now() };
  await setDoc(LIVE_DOC, payload, { merge: true });
  await logMediaActivity("live.updated", stream.title);
  return payload;
};

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export type MediaGalleryDraft = Omit<MediaGalleryItem, "id" | "createdAt">;

export const getMediaGalleryItems = async (): Promise<MediaGalleryItem[]> => {
  const snapshot = await getDocs(query(collection(db, GALLERY), orderBy("createdAt", "desc")));
  return mapDocs<MediaGalleryItem>(snapshot);
};

export const createMediaGalleryItem = async (draft: MediaGalleryDraft): Promise<MediaGalleryItem> => {
  const payload = { ...draft, createdAt: Date.now() };
  const ref = await addDoc(collection(db, GALLERY), payload);
  await logMediaActivity("gallery.updated", draft.title);
  return { ...payload, id: ref.id };
};

export const updateMediaGalleryItem = async (id: string, updates: Partial<MediaGalleryDraft>, title = "") => {
  await updateDoc(doc(db, GALLERY, id), updates);
  await logMediaActivity("gallery.updated", title || id);
};

export const deleteMediaGalleryItem = async (id: string, title = "") => {
  await deleteDoc(doc(db, GALLERY, id));
  await logMediaActivity("gallery.deleted", title || id);
};

/* ------------------------------------------------------------------ */
/* Downloads                                                           */
/* ------------------------------------------------------------------ */

export type MediaDownloadDraft = Omit<MediaDownload, "id" | "createdAt" | "downloads"> & { downloads?: number };

export const getMediaDownloads = async (): Promise<MediaDownload[]> => {
  const snapshot = await getDocs(query(collection(db, DOWNLOADS), orderBy("createdAt", "desc")));
  return mapDocs<MediaDownload>(snapshot);
};

export const createMediaDownload = async (draft: MediaDownloadDraft): Promise<MediaDownload> => {
  const payload = { ...draft, downloads: draft.downloads ?? 0, createdAt: Date.now() };
  const ref = await addDoc(collection(db, DOWNLOADS), payload);
  await logMediaActivity("download.uploaded", draft.title);
  return { ...payload, id: ref.id } as MediaDownload;
};

export const updateMediaDownload = async (id: string, updates: Partial<MediaDownloadDraft>) => {
  await updateDoc(doc(db, DOWNLOADS, id), updates);
};

export const deleteMediaDownload = async (id: string, title = "") => {
  await deleteDoc(doc(db, DOWNLOADS, id));
  await logMediaActivity("download.deleted", title || id);
};
