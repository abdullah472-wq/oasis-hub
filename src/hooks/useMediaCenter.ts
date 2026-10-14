import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  createMediaDownload,
  createMediaGalleryItem,
  createMediaPlaylist,
  createMediaVideo,
  deleteMediaDownload,
  deleteMediaGalleryItem,
  deleteMediaPlaylist,
  deleteMediaVideo,
  getMediaActivityLogs,
  getMediaDownloads,
  getMediaGalleryItems,
  getMediaLiveStream,
  getMediaPlaylists,
  getMediaVideos,
  saveMediaLiveStream,
  updateMediaDownload,
  updateMediaGalleryItem,
  updateMediaPlaylist,
  updateMediaVideo,
  type MediaActivityLog,
  type MediaDownload,
  type MediaDownloadDraft,
  type MediaGalleryDraft,
  type MediaGalleryItem,
  type MediaLiveStream,
  type MediaPlaylist,
  type MediaPlaylistDraft,
  type MediaVideo,
  type MediaVideoDraft,
} from "@/lib/mediaCenter";

export interface MediaCenterState {
  loading: boolean;
  videos: MediaVideo[];
  playlists: MediaPlaylist[];
  gallery: MediaGalleryItem[];
  downloads: MediaDownload[];
  liveStream: MediaLiveStream | null;
  logs: MediaActivityLog[];
  stats: {
    totalVideos: number;
    publishedVideos: number;
    featuredVideos: number;
    totalPlaylists: number;
    galleryImages: number;
    downloads: number;
    totalViews: number;
  };
  refresh: () => Promise<void>;
  actions: {
    saveVideo: (draft: MediaVideoDraft, id?: string) => Promise<void>;
    deleteVideo: (video: MediaVideo) => Promise<void>;
    toggleVideoStatus: (video: MediaVideo) => Promise<void>;
    toggleVideoFeatured: (video: MediaVideo) => Promise<void>;
    savePlaylist: (draft: MediaPlaylistDraft, id?: string) => Promise<void>;
    deletePlaylist: (playlist: MediaPlaylist) => Promise<void>;
    saveLiveStream: (stream: Omit<MediaLiveStream, "updatedAt">) => Promise<void>;
    saveGalleryItem: (draft: MediaGalleryDraft, id?: string) => Promise<void>;
    deleteGalleryItem: (item: MediaGalleryItem) => Promise<void>;
    saveDownload: (draft: MediaDownloadDraft, id?: string) => Promise<void>;
    deleteDownload: (item: MediaDownload) => Promise<void>;
  };
}

export const useMediaCenter = (enabled = true): MediaCenterState => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [playlists, setPlaylists] = useState<MediaPlaylist[]>([]);
  const [gallery, setGallery] = useState<MediaGalleryItem[]>([]);
  const [downloads, setDownloads] = useState<MediaDownload[]>([]);
  const [liveStream, setLiveStream] = useState<MediaLiveStream | null>(null);
  const [logs, setLogs] = useState<MediaActivityLog[]>([]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const [videoList, playlistList, galleryList, downloadList, live, logList] = await Promise.all([
        getMediaVideos().catch(() => [] as MediaVideo[]),
        getMediaPlaylists().catch(() => [] as MediaPlaylist[]),
        getMediaGalleryItems().catch(() => [] as MediaGalleryItem[]),
        getMediaDownloads().catch(() => [] as MediaDownload[]),
        getMediaLiveStream().catch(() => null),
        getMediaActivityLogs().catch(() => [] as MediaActivityLog[]),
      ]);
      setVideos(videoList);
      setPlaylists(playlistList);
      setGallery(galleryList);
      setDownloads(downloadList);
      setLiveStream(live);
      setLogs(logList);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void refresh();
  }, [enabled, refresh]);

  const run = useCallback(
    async (task: () => Promise<void>, successMessage: string) => {
      try {
        await task();
        await refresh();
        toast({ title: successMessage });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Action failed",
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    },
    [refresh, toast],
  );

  const actions = useMemo(
    () => ({
      saveVideo: (draft: MediaVideoDraft, id?: string) =>
        run(async () => {
          if (id) await updateMediaVideo(id, draft, draft.title);
          else await createMediaVideo(draft);
        }, id ? "Video updated" : "Video added"),
      deleteVideo: (video: MediaVideo) => run(() => deleteMediaVideo(video.id, video.title), "Video deleted"),
      toggleVideoStatus: (video: MediaVideo) =>
        run(
          () => updateMediaVideo(video.id, { status: video.status === "published" ? "draft" : "published" }, video.title),
          video.status === "published" ? "Video unpublished" : "Video published",
        ),
      toggleVideoFeatured: (video: MediaVideo) =>
        run(() => updateMediaVideo(video.id, { featured: !video.featured }, video.title), "Featured video updated"),
      savePlaylist: (draft: MediaPlaylistDraft, id?: string) =>
        run(async () => {
          if (id) await updateMediaPlaylist(id, draft, draft.name);
          else await createMediaPlaylist(draft);
        }, id ? "Playlist updated" : "Playlist created"),
      deletePlaylist: (playlist: MediaPlaylist) =>
        run(() => deleteMediaPlaylist(playlist.id, playlist.name), "Playlist deleted"),
      saveLiveStream: (stream: Omit<MediaLiveStream, "updatedAt">) =>
        run(async () => {
          await saveMediaLiveStream(stream);
        }, "Live stream saved"),
      saveGalleryItem: (draft: MediaGalleryDraft, id?: string) =>
        run(async () => {
          if (id) await updateMediaGalleryItem(id, draft, draft.title);
          else await createMediaGalleryItem(draft);
        }, id ? "Image updated" : "Image uploaded"),
      deleteGalleryItem: (item: MediaGalleryItem) =>
        run(() => deleteMediaGalleryItem(item.id, item.title), "Image deleted"),
      saveDownload: (draft: MediaDownloadDraft, id?: string) =>
        run(async () => {
          if (id) await updateMediaDownload(id, draft);
          else await createMediaDownload(draft);
        }, id ? "Resource updated" : "Resource uploaded"),
      deleteDownload: (item: MediaDownload) => run(() => deleteMediaDownload(item.id, item.title), "Resource deleted"),
    }),
    [run],
  );

  const stats = useMemo(
    () => ({
      totalVideos: videos.length,
      publishedVideos: videos.filter((item) => item.status === "published").length,
      featuredVideos: videos.filter((item) => item.featured).length,
      totalPlaylists: playlists.length,
      galleryImages: gallery.length,
      downloads: downloads.length,
      totalViews: videos.reduce((sum, item) => sum + (item.views ?? 0), 0),
    }),
    [downloads.length, gallery.length, playlists.length, videos],
  );

  return { loading, videos, playlists, gallery, downloads, liveStream, logs, stats, refresh, actions };
};
