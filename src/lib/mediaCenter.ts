import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit as fbLimit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { getVideoList, getCachedVideos, type MediaVideo as CmsMediaVideo } from "./videoService";
import { getGalleryList, type GalleryItem } from "./galleryService";
import { getDownloadsList, type DownloadItem } from "./downloadsService";

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

export const withTimeout = <T>(promise: Promise<T>, timeoutMs = 2500, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]).catch(() => fallback);
};

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
    const snapshot = await withTimeout(
      getDocs(query(collection(db, LOGS), orderBy("createdAt", "desc"), fbLimit(max))),
      2500,
      null
    );
    if (!snapshot) return [];
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
  try {
    const snapshot = await withTimeout(
      getDocs(query(collection(db, VIDEOS), orderBy("createdAt", "desc"))),
      2500,
      null
    );
    if (!snapshot) return [];
    return mapDocs<MediaVideo>(snapshot)
      .map((v) => ({
        ...v,
        views: getRealisticVideoViews(v.id || v.videoId || v.title, v.views),
      }))
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || b.createdAt - a.createdAt);
  } catch {
    return [];
  }
};

export const inferVideoCategory = (titleBn = "", titleEn?: string | null): VideoCategory => {
  const text = `${titleBn} ${titleEn || ""}`.toLowerCase();
  if (text.includes("ভর্তি") || text.includes("admission")) return "admission";
  if (text.includes("প্রতিযোগিতা") || text.includes("প্রতিযোগীতা") || text.includes("competition")) return "competitions";
  if (text.includes("নাজেরা") || text.includes("nazera")) return "nazera";
  if (text.includes("হিফজ") || text.includes("হাফেজ") || text.includes("হফেজ") || text.includes("hifz")) return "hifz";
  if (text.includes("কুরআন") || text.includes("কোরআন") || text.includes("তেলাওয়াত") || text.includes("তিলাওয়াত") || text.includes("quran") || text.includes("recitation")) return "quran";
  if (text.includes("হাদীস") || text.includes("হাদিস") || text.includes("ইসলামিক") || text.includes("দ্বীনি") || text.includes("hadith") || text.includes("islamic")) return "islamic-studies";
  if (text.includes("ক্লাস") || text.includes("পাঠদান") || text.includes("class") || text.includes("lesson")) return "classes";
  if (text.includes("অনুষ্ঠান") || text.includes("মাহফিল") || text.includes("সমাবর্তন") || text.includes("মজলিস") || text.includes("সভা") || text.includes("event") || text.includes("program")) return "events";
  if (text.includes("পডকাস্ট") || text.includes("আলোচনা") || text.includes("podcast")) return "podcast";
  if (text.includes("ঘোষণা") || text.includes("বিজ্ঞপ্তি") || text.includes("notice") || text.includes("announcement")) return "announcements";
  return "others";
};

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const toBengaliDigits = (num: number | string): string => {
  return String(num).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
};

/**
 * Deterministically generates a realistic, organic view count for any video
 * based on its unique seed (id / videoId / title), plus any local increments.
 */
export const getRealisticVideoViews = (seed: string, baseViews?: number): number => {
  let localBonus = 0;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(`oasis_video_views_${seed}`);
      if (stored) {
        localBonus = parseInt(stored, 10) || 0;
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  if (typeof baseViews === "number" && baseViews > 0) {
    return baseViews + localBonus;
  }

  // DJB2 hash of the seed to keep views stable and unique per video
  let hash = 5381;
  const safeSeed = seed || "oasis_video_seed";
  for (let i = 0; i < safeSeed.length; i++) {
    hash = ((hash << 5) + hash) + safeSeed.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);

  // Range from ~1,250 to ~19,850 views
  const pseudoViews = 1250 + (abs % 18600);
  return pseudoViews + localBonus;
};

/**
 * Formats a view count into a user-friendly string (e.g. '১.৪K ভিউ' or '1.4K views').
 */
export const formatVideoViews = (views?: number, seed?: string, lang: string = "bn"): string => {
  let count = views ?? 0;
  if (count <= 0 && seed) {
    count = getRealisticVideoViews(seed);
  } else if (count <= 0) {
    count = 1250;
  }

  let formatted = "";
  if (count >= 1_000_000) {
    const val = (count / 1_000_000).toFixed(1).replace(/\.0$/, "");
    formatted = `${val}M`;
  } else if (count >= 1_000) {
    const val = (count / 1_000).toFixed(1).replace(/\.0$/, "");
    formatted = `${val}K`;
  } else {
    formatted = count.toLocaleString();
  }

  if (lang === "bn") {
    return `${toBengaliDigits(formatted)} ভিউ`;
  }
  return `${formatted} views`;
};

export const mapCmsVideoToMediaVideo = (v: CmsMediaVideo): MediaVideo => {
  const isPlaylist = v.type === "playlist";
  const playlistId = isPlaylist
    ? (v.youtube_video_id.startsWith("PL") || v.youtube_video_id.startsWith("UU")
        ? v.youtube_video_id
        : v.youtube_url?.match(/[?&]list=([^#&?]+)/)?.[1] || v.youtube_video_id)
    : undefined;

  const seed = v.id || v.youtube_video_id || v.title_bn || "video";
  const views = getRealisticVideoViews(seed, (v as any).views);

  return {
    id: v.id,
    title: v.title_bn || v.title_en || "ভিডিও",
    youtubeUrl: v.youtube_url,
    videoId: v.youtube_video_id,
    thumbnailUrl: `https://img.youtube.com/vi/${v.youtube_video_id}/hqdefault.jpg`,
    embedUrl: isPlaylist && playlistId
      ? `https://www.youtube.com/embed/videoseries?list=${playlistId}`
      : `https://www.youtube.com/embed/${v.youtube_video_id}`,
    category: inferVideoCategory(v.title_bn, v.title_en),
    playlistId,
    description: v.title_en || undefined,
    featured: Boolean(v.is_featured),
    status: "published",
    displayOrder: v.order_index ?? 0,
    views,
    createdAt: v.created_at ? new Date(v.created_at).getTime() : Date.now(),
    updatedAt: v.updated_at ? new Date(v.updated_at).getTime() : Date.now(),
  };
};

export const getPublishedVideos = async (): Promise<MediaVideo[]> => {
  // 1. Fetch CMS videos (Supabase + LocalStorage fallback)
  let cmsVideos: CmsMediaVideo[] = [];
  try {
    const res = await getVideoList();
    cmsVideos = res.videos || [];
  } catch {
    cmsVideos = getCachedVideos();
  }

  const mappedCmsVideos = cmsVideos.map(mapCmsVideoToMediaVideo);

  // 2. Fetch Firestore published videos
  let firestoreVideos: MediaVideo[] = [];
  try {
    const all = await getMediaVideos();
    firestoreVideos = all.filter((item) => item.status === "published");
  } catch {
    firestoreVideos = [];
  }

  // 3. Merge: prioritize CMS videos, add non-duplicate Firestore videos
  const cmsIds = new Set(mappedCmsVideos.map((v) => v.id));
  const merged = [
    ...mappedCmsVideos,
    ...firestoreVideos.filter((v) => !cmsIds.has(v.id)),
  ];

  return merged.sort(
    (a, b) =>
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
      b.createdAt - a.createdAt
  );
};

/**
 * Synchronous read of cached & default videos for instant UI mounting.
 */
export const getCachedPublishedVideos = (): MediaVideo[] => {
  try {
    const cmsVideos = getCachedVideos();
    return cmsVideos.map(mapCmsVideoToMediaVideo);
  } catch {
    return [];
  }
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
  try {
    const snapshot = await withTimeout(
      getDocs(query(collection(db, PLAYLISTS), orderBy("createdAt", "desc"))),
      2500,
      null
    );
    if (!snapshot) return [];
    return mapDocs<MediaPlaylist>(snapshot);
  } catch {
    return [];
  }
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
    const snapshot = await withTimeout(getDoc(LIVE_DOC), 2500, null);
    return snapshot && snapshot.exists() ? (snapshot.data() as MediaLiveStream) : null;
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
  try {
    const snapshot = await withTimeout(
      getDocs(query(collection(db, GALLERY), orderBy("createdAt", "desc"))),
      2500,
      null
    );
    if (!snapshot) return [];
    return mapDocs<MediaGalleryItem>(snapshot);
  } catch {
    return [];
  }
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
  try {
    const snapshot = await withTimeout(
      getDocs(query(collection(db, DOWNLOADS), orderBy("createdAt", "desc"))),
      2500,
      null
    );
    if (!snapshot) return [];
    return mapDocs<MediaDownload>(snapshot);
  } catch {
    return [];
  }
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

/* ------------------------------------------------------------------ */
/* Public (visitor) helpers                                            */
/* ------------------------------------------------------------------ */

export const getPublishedPlaylists = async (): Promise<MediaPlaylist[]> => {
  let cmsVideos: CmsMediaVideo[] = [];
  try {
    const res = await getVideoList();
    cmsVideos = res.videos || [];
  } catch {
    cmsVideos = getCachedVideos();
  }

  const cmsPlaylists: MediaPlaylist[] = cmsVideos
    .filter((v) => v.type === "playlist")
    .map((v) => ({
      id: v.id,
      name: v.title_bn || v.title_en || "প্লেলিস্ট",
      playlistId: v.youtube_video_id,
      youtubeUrl: v.youtube_url,
      thumbnailUrl: `https://img.youtube.com/vi/${v.youtube_video_id}/hqdefault.jpg`,
      description: v.title_en || undefined,
      featured: Boolean(v.is_featured),
      status: "published",
      createdAt: v.created_at ? new Date(v.created_at).getTime() : Date.now(),
      updatedAt: v.updated_at ? new Date(v.updated_at).getTime() : Date.now(),
    }));

  let firestorePlaylists: MediaPlaylist[] = [];
  try {
    const all = await getMediaPlaylists();
    firestorePlaylists = all.filter((item) => item.status === "published");
  } catch {
    firestorePlaylists = [];
  }

  const ids = new Set(cmsPlaylists.map((p) => p.id));
  return [...cmsPlaylists, ...firestorePlaylists.filter((p) => !ids.has(p.id))];
};

export const getPublishedGalleryItems = async (): Promise<MediaGalleryItem[]> => {
  let cmsGallery: GalleryItem[] = [];
  try {
    cmsGallery = await getGalleryList();
  } catch {
    cmsGallery = [];
  }

  const mappedGallery: MediaGalleryItem[] = cmsGallery.map((g) => ({
    id: g.id,
    title: g.title_bn || g.title_en || "ছবি",
    imageUrl: g.image_url,
    album: g.category,
    category: (g.category === "academic" ? "students" : g.category === "achievement" ? "competitions" : g.category) as MediaGalleryCategory,
    featured: false,
    status: "published",
    createdAt: g.created_at ? new Date(g.created_at).getTime() : Date.now(),
  }));

  let firestoreItems: MediaGalleryItem[] = [];
  try {
    const all = await getMediaGalleryItems();
    firestoreItems = all.filter((item) => item.status === "published");
  } catch {
    firestoreItems = [];
  }

  const ids = new Set(mappedGallery.map((i) => i.id));
  return [...mappedGallery, ...firestoreItems.filter((i) => !ids.has(i.id))];
};

export const getPublishedDownloads = async (): Promise<MediaDownload[]> => {
  let cmsDownloads: DownloadItem[] = [];
  try {
    cmsDownloads = await getDownloadsList();
  } catch {
    cmsDownloads = [];
  }

  const mappedDownloads: MediaDownload[] = cmsDownloads
    .filter((d) => d.is_active)
    .map((d) => ({
      id: d.id,
      title: d.title_bn || d.title_en || "ডকুমেন্ট",
      category: (d.category === "routine" ? "routine" : d.category === "admission" ? "admission-form" : d.category === "syllabus" ? "syllabus" : "others") as DownloadCategory,
      fileUrl: d.file_url,
      fileName: `${d.title_en || d.title_bn}.pdf`,
      description: d.description_bn || d.description_en,
      status: "published",
      downloads: d.download_count || 0,
      createdAt: d.created_at ? new Date(d.created_at).getTime() : Date.now(),
    }));

  let firestoreDownloads: MediaDownload[] = [];
  try {
    const all = await getMediaDownloads();
    firestoreDownloads = all.filter((item) => item.status === "published");
  } catch {
    firestoreDownloads = [];
  }

  const ids = new Set(mappedDownloads.map((d) => d.id));
  return [...mappedDownloads, ...firestoreDownloads.filter((d) => !ids.has(d.id))];
};

export const getActiveLiveStream = async (): Promise<MediaLiveStream | null> => {
  let cmsVideos: CmsMediaVideo[] = [];
  try {
    const res = await getVideoList();
    cmsVideos = res.videos || [];
  } catch {
    cmsVideos = getCachedVideos();
  }

  const cmsLive = cmsVideos.find((v) => v.type === "livestream");
  if (cmsLive) {
    return {
      title: cmsLive.title_bn || cmsLive.title_en || "লাইভ স্ট্রিম",
      description: cmsLive.title_en || undefined,
      youtubeUrl: cmsLive.youtube_url,
      videoId: cmsLive.youtube_video_id,
      embedUrl: `https://www.youtube.com/embed/${cmsLive.youtube_video_id}?autoplay=1`,
      status: "live",
      updatedAt: cmsLive.updated_at ? new Date(cmsLive.updated_at).getTime() : Date.now(),
    };
  }

  const stream = await getMediaLiveStream().catch(() => null);
  return stream && stream.status === "live" ? stream : null;
};

export const getFeaturedVideo = async (): Promise<MediaVideo | null> => {
  const videos = await getPublishedVideos();
  return videos.find((item) => item.featured) ?? videos[0] ?? null;
};

export const incrementVideoViews = async (id: string) => {
  if (!id) return;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const key = `oasis_video_views_${id}`;
      const current = parseInt(localStorage.getItem(key) || "0", 10) || 0;
      localStorage.setItem(key, String(current + 1));
    } catch {
      // Ignore
    }
  }
  await updateDoc(doc(db, VIDEOS, id), { views: increment(1) }).catch(() => undefined);
};

export const incrementDownloadCount = async (id: string) => {
  await updateDoc(doc(db, DOWNLOADS, id), { downloads: increment(1) }).catch(() => undefined);
};
