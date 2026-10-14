import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Radio, Search } from "lucide-react";
import WaveDivider from "@/components/WaveDivider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { springIn } from "@/lib/animations";
import { downloadFile } from "@/lib/upload";
import { GuardianMediaWidget, StudentMediaWidget } from "@/components/media/MediaWidgets";
import {
  DOWNLOAD_CATEGORY_LABELS,
  GALLERY_CATEGORY_LABELS,
  VIDEO_CATEGORIES,
  VIDEO_CATEGORY_LABELS,
  getActiveLiveStream,
  getPublishedDownloads,
  getPublishedGalleryItems,
  getPublishedPlaylists,
  getPublishedVideos,
  getYouTubePlaylistEmbedUrl,
  incrementDownloadCount,
  incrementVideoViews,
  type MediaDownload,
  type MediaGalleryItem,
  type MediaLiveStream,
  type MediaPlaylist,
  type MediaVideo,
} from "@/lib/mediaCenter";

const MediaCenter = () => {
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [playlists, setPlaylists] = useState<MediaPlaylist[]>([]);
  const [gallery, setGallery] = useState<MediaGalleryItem[]>([]);
  const [downloads, setDownloads] = useState<MediaDownload[]>([]);
  const [liveStream, setLiveStream] = useState<MediaLiveStream | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [activeVideo, setActiveVideo] = useState<MediaVideo | null>(null);
  const [lightbox, setLightbox] = useState<MediaGalleryItem | null>(null);

  useEffect(() => {
    Promise.all([
      getPublishedVideos(),
      getPublishedPlaylists(),
      getPublishedGalleryItems(),
      getPublishedDownloads(),
      getActiveLiveStream(),
    ])
      .then(([v, p, g, d, live]) => {
        setVideos(v);
        setPlaylists(p);
        setGallery(g);
        setDownloads(d);
        setLiveStream(live);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();
    return videos.filter(
      (item) =>
        (category === "all" || item.category === category) &&
        (!term || item.title.toLowerCase().includes(term) || (item.description ?? "").toLowerCase().includes(term)),
    );
  }, [category, search, videos]);

  const openVideo = (video: MediaVideo) => {
    setActiveVideo(video);
    void incrementVideoViews(video.id);
  };

  const handleDownload = async (item: MediaDownload) => {
    void incrementDownloadCount(item.id);
    await downloadFile(item.fileUrl, item.fileName || item.title);
  };

  return (
    <div>
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-primary md:h-64">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("মিডিয়া সেন্টার", "Media Center")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-12">
        <div className="container mx-auto space-y-10 px-4">
          {liveStream && (
            <Card className="overflow-hidden rounded-3xl border-destructive/40">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 animate-pulse text-destructive" />
                  <Badge variant="destructive" className="rounded-full">
                    {t("লাইভ", "LIVE")}
                  </Badge>
                  <h2 className="font-bengali text-xl font-semibold text-foreground">{liveStream.title}</h2>
                </div>
                <div className="aspect-video overflow-hidden rounded-2xl">
                  <iframe
                    src={liveStream.embedUrl}
                    title={liveStream.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="mx-auto flex w-full max-w-2xl flex-wrap justify-center rounded-full">
              <TabsTrigger value="videos" className="font-bengali">{t("ভিডিও", "Videos")}</TabsTrigger>
              <TabsTrigger value="playlists" className="font-bengali">{t("প্লেলিস্ট", "Playlists")}</TabsTrigger>
              <TabsTrigger value="gallery" className="font-bengali">{t("গ্যালারি", "Gallery")}</TabsTrigger>
              <TabsTrigger value="downloads" className="font-bengali">{t("ডাউনলোড", "Downloads")}</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-8 space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("ভিডিও খুঁজুন...", "Search videos...")}
                    className="rounded-full pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", ...VIDEO_CATEGORIES].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    className={`rounded-full px-4 py-1.5 font-bengali text-sm transition-colors ${
                      category === value ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent/20"
                    }`}
                  >
                    {value === "all"
                      ? t("সকল", "All")
                      : lang === "bn"
                        ? VIDEO_CATEGORY_LABELS[value as keyof typeof VIDEO_CATEGORY_LABELS].bn
                        : VIDEO_CATEGORY_LABELS[value as keyof typeof VIDEO_CATEGORY_LABELS].en}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-56 w-full rounded-3xl" />
                  ))}
                </div>
              ) : filteredVideos.length === 0 ? (
                <p className="py-12 text-center font-bengali text-muted-foreground">
                  {t("কোনো ভিডিও পাওয়া যায়নি", "No videos found")}
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredVideos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => openVideo(video)}
                      className="group overflow-hidden rounded-3xl border border-border/60 bg-card text-left transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {video.duration && (
                          <span className="absolute bottom-2 right-2 rounded-md bg-foreground/80 px-2 py-0.5 text-xs text-background">
                            {video.duration}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 p-4">
                        <h3 className="font-bengali font-semibold text-foreground line-clamp-2">{video.title}</h3>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="rounded-full text-xs">
                            {lang === "bn" ? VIDEO_CATEGORY_LABELS[video.category]?.bn : VIDEO_CATEGORY_LABELS[video.category]?.en}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{video.views ?? 0} {t("ভিউ", "views")}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="playlists" className="mt-8">
              {playlists.length === 0 ? (
                <p className="py-12 text-center font-bengali text-muted-foreground">{t("কোনো প্লেলিস্ট নেই", "No playlists yet")}</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {playlists.map((playlist) => (
                    <Card key={playlist.id} className="overflow-hidden rounded-3xl">
                      <CardContent className="space-y-3 p-0">
                        <div className="aspect-video">
                          {playlist.playlistId ? (
                            <iframe
                              src={getYouTubePlaylistEmbedUrl(playlist.playlistId)}
                              title={playlist.name}
                              allowFullScreen
                              className="h-full w-full"
                            />
                          ) : (
                            <img src={playlist.thumbnailUrl} alt={playlist.name} className="h-full w-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="space-y-1 p-4">
                          <h3 className="font-bengali font-semibold text-foreground">{playlist.name}</h3>
                          <p className="font-bengali text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {videos.filter((item) => item.playlistId === playlist.id).length} {t("ভিডিও", "videos")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="mt-8">
              {gallery.length === 0 ? (
                <p className="py-12 text-center font-bengali text-muted-foreground">{t("কোনো ছবি নেই", "No images yet")}</p>
              ) : (
                <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
                  {gallery.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLightbox(item)}
                      className="mb-6 block w-full break-inside-avoid overflow-hidden rounded-3xl"
                    >
                      <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full object-cover transition-transform duration-500 hover:scale-105" />
                      <span className="mt-2 block text-left font-bengali text-sm text-muted-foreground">
                        {item.title} · {lang === "bn" ? GALLERY_CATEGORY_LABELS[item.category]?.bn : GALLERY_CATEGORY_LABELS[item.category]?.en}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="downloads" className="mt-8">
              {downloads.length === 0 ? (
                <p className="py-12 text-center font-bengali text-muted-foreground">{t("কোনো ফাইল নেই", "No files yet")}</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {downloads.map((item) => (
                    <Card key={item.id} className="rounded-3xl">
                      <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="min-w-0">
                          <h3 className="truncate font-bengali font-semibold text-foreground">{item.title}</h3>
                          <p className="font-bengali text-xs text-muted-foreground">
                            {lang === "bn" ? DOWNLOAD_CATEGORY_LABELS[item.category]?.bn : DOWNLOAD_CATEGORY_LABELS[item.category]?.en}
                          </p>
                        </div>
                        <Button size="sm" className="rounded-full" onClick={() => void handleDownload(item)}>
                          <Download className="mr-1 h-4 w-4" />
                          {t("ডাউনলোড", "Download")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="grid gap-6 lg:grid-cols-2">
            <StudentMediaWidget onSelect={openVideo} />
            <GuardianMediaWidget onSelect={openVideo} />
          </div>
        </div>
      </section>

      <Dialog open={Boolean(activeVideo)} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali">{activeVideo?.title}</DialogTitle>
          </DialogHeader>
          {activeVideo && (
            <div className="aspect-video overflow-hidden rounded-2xl">
              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}
          {activeVideo?.description && <p className="font-bengali text-sm text-muted-foreground">{activeVideo.description}</p>}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(lightbox)} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali">{lightbox?.title}</DialogTitle>
          </DialogHeader>
          {lightbox && <img src={lightbox.imageUrl} alt={lightbox.title} className="w-full rounded-2xl object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaCenter;
