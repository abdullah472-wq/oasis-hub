import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Eye, EyeOff, PlayCircle, Search, Star, Trash2, Video as VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
import {
  MediaEmptyState,
  MediaGridSkeleton,
  MediaPagination,
  MediaStatusBadge,
  mediaCardClass,
  usePaged,
} from "@/components/admin/media/MediaPrimitives";
import {
  VIDEO_CATEGORIES,
  VIDEO_CATEGORY_LABELS,
  resolveYouTubeMeta,
  type MediaPlaylist,
  type MediaVideo,
  type MediaVideoDraft,
  type VideoCategory,
} from "@/lib/mediaCenter";

const PAGE_SIZE = 9;

const emptyDraft = () => ({
  title: "",
  youtubeUrl: "",
  category: "others" as VideoCategory,
  playlistId: "",
  description: "",
  duration: "",
  featured: false,
  status: "published" as "draft" | "published",
  displayOrder: 0,
});

interface Props {
  videos: MediaVideo[];
  playlists: MediaPlaylist[];
  loading: boolean;
  canManage: boolean;
  onSave: (draft: MediaVideoDraft, id?: string) => Promise<void>;
  onDelete: (video: MediaVideo) => Promise<void>;
  onToggleStatus: (video: MediaVideo) => Promise<void>;
  onToggleFeatured: (video: MediaVideo) => Promise<void>;
}

const MediaVideosPage = ({
  videos,
  playlists,
  loading,
  canManage,
  onSave,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<MediaVideo | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [playlistFilter, setPlaylistFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("latest");
  const [page, setPage] = useState(1);

  const meta = resolveYouTubeMeta(form.youtubeUrl);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = videos.filter((item) => {
      if (term && !item.title.toLowerCase().includes(term)) return false;
      if (category !== "all" && item.category !== category) return false;
      if (playlistFilter !== "all" && (item.playlistId || "") !== playlistFilter) return false;
      if (featuredFilter !== "all" && String(Boolean(item.featured)) !== featuredFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });

    const sorted = [...list];
    if (sort === "latest") sorted.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "oldest") sorted.sort((a, b) => a.createdAt - b.createdAt);
    if (sort === "views") sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    if (sort === "order") sorted.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return sorted;
  }, [category, featuredFilter, playlistFilter, search, sort, statusFilter, videos]);

  const { pageItems, pageCount, safePage } = usePaged(filtered, page, PAGE_SIZE);

  const openCreate = () => {
    setEditingId(undefined);
    setForm(emptyDraft());
    setOpen(true);
  };

  const openEdit = (video: MediaVideo) => {
    setEditingId(video.id);
    setForm({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      category: video.category,
      playlistId: video.playlistId ?? "",
      description: video.description ?? "",
      duration: video.duration ?? "",
      featured: video.featured,
      status: video.status,
      displayOrder: video.displayOrder ?? 0,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !meta.valid) return;
    setSaving(true);
    try {
      await onSave(
        {
          title: form.title.trim(),
          youtubeUrl: form.youtubeUrl.trim(),
          videoId: meta.videoId,
          thumbnailUrl: meta.thumbnailUrl,
          embedUrl: meta.embedUrl,
          category: form.category,
          playlistId: form.playlistId || "",
          description: form.description.trim(),
          duration: form.duration.trim(),
          featured: form.featured,
          status: form.status,
          displayOrder: Number(form.displayOrder) || 0,
        },
        editingId,
      );
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleShell
      title="ভিডিও ম্যানেজমেন্ট"
      description="YouTube links only — no video files are stored on the server."
      icon={<VideoIcon className="h-5 w-5" />}
      recordCount={videos.length}
      recordLabel="Videos"
      actionLabel={canManage ? "নতুন ভিডিও" : undefined}
      onAction={canManage ? openCreate : undefined}
    >
      <Card className={mediaCardClass}>
        <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by title"
              className="rounded-2xl pl-9"
              aria-label="Search videos by title"
            />
          </div>
          <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1); }}>
            <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {VIDEO_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>{VIDEO_CATEGORY_LABELS[item].en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={playlistFilter} onValueChange={(value) => { setPlaylistFilter(value); setPage(1); }}>
            <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Playlist" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All playlists</SelectItem>
              {playlists.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={featuredFilter} onValueChange={(value) => { setFeaturedFilter(value); setPage(1); }}>
            <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Featured" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Featured: any</SelectItem>
              <SelectItem value="true">Featured only</SelectItem>
              <SelectItem value="false">Not featured</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3 xl:col-span-1">
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="views">Most viewed</SelectItem>
                <SelectItem value="order">Display order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <MediaGridSkeleton />
      ) : pageItems.length === 0 ? (
        <MediaEmptyState
          icon={VideoIcon}
          title="কোনো ভিডিও পাওয়া যায়নি"
          description="Add a YouTube link and the thumbnail, video ID and embed URL are generated automatically."
          actionLabel={canManage ? "নতুন ভিডিও" : undefined}
          onAction={canManage ? openCreate : undefined}
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={`${mediaCardClass} group overflow-hidden`}>
                  <button
                    type="button"
                    onClick={() => setPreview(video)}
                    className="relative block w-full overflow-hidden"
                    aria-label={`Watch ${video.title}`}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      loading="lazy"
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-foreground/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <PlayCircle className="h-12 w-12 text-background" />
                    </span>
                    {video.duration ? (
                      <span className="absolute bottom-2 right-2 rounded-md bg-foreground/80 px-2 py-0.5 text-xs text-background">
                        {video.duration}
                      </span>
                    ) : null}
                    {video.featured ? (
                      <Badge className="absolute left-2 top-2 rounded-full">Featured</Badge>
                    ) : null}
                  </button>
                  <CardContent className="space-y-3 p-5">
                    <div className="space-y-1">
                      <h3 className="line-clamp-2 font-bengali font-semibold text-foreground">{video.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="rounded-full">
                          {VIDEO_CATEGORY_LABELS[video.category]?.en ?? video.category}
                        </Badge>
                        <MediaStatusBadge status={video.status} />
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => setPreview(video)}>
                        <PlayCircle className="mr-1.5 h-4 w-4" /> Watch
                      </Button>
                      {canManage ? (
                        <>
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openEdit(video)}>
                            <Edit3 className="mr-1.5 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => void onToggleStatus(video)}
                            aria-label={video.status === "published" ? "Unpublish video" : "Publish video"}
                          >
                            {video.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => void onToggleFeatured(video)}
                            aria-label="Toggle featured video"
                          >
                            <Star className={`h-4 w-4 ${video.featured ? "fill-current text-primary" : ""}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-xl text-destructive"
                            onClick={() => void onDelete(video)}
                            aria-label="Delete video"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <MediaPagination page={safePage} pageCount={pageCount} onChange={setPage} />
        </>
      )}

      <Dialog open={Boolean(preview)} onOpenChange={(value) => !value && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali">{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview ? (
            <div className="aspect-video w-full overflow-hidden rounded-2xl">
              <iframe
                src={preview.embedUrl}
                title={preview.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bengali">{editingId ? "ভিডিও সম্পাদনা" : "নতুন ভিডিও"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bengali">Video title</Label>
              <Input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="rounded-2xl"
                required
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">YouTube URL</Label>
              <Input
                value={form.youtubeUrl}
                onChange={(event) => setForm((current) => ({ ...current, youtubeUrl: event.target.value }))}
                className="rounded-2xl"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              {form.youtubeUrl && !meta.valid ? (
                <p className="text-xs text-destructive">Could not detect a YouTube video ID from this link.</p>
              ) : null}
            </div>
            {meta.valid ? (
              <div className="flex items-center gap-4 rounded-2xl border border-border/60 p-3">
                <img src={meta.thumbnailUrl} alt="Auto generated thumbnail" className="h-16 w-28 rounded-xl object-cover" />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Video ID: <span className="font-mono text-foreground">{meta.videoId}</span></p>
                  <p className="break-all">Embed: {meta.embedUrl}</p>
                </div>
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-bengali">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value as VideoCategory }))}>
                  <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VIDEO_CATEGORIES.map((item) => (
                      <SelectItem key={item} value={item}>{VIDEO_CATEGORY_LABELS[item].en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">Playlist</Label>
                <Select
                  value={form.playlistId || "none"}
                  onValueChange={(value) => setForm((current) => ({ ...current, playlistId: value === "none" ? "" : value }))}
                >
                  <SelectTrigger className="rounded-2xl"><SelectValue placeholder="No playlist" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No playlist</SelectItem>
                    {playlists.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">Duration (optional)</Label>
                <Input
                  value={form.duration}
                  onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                  className="rounded-2xl"
                  placeholder="12:34"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">Display order</Label>
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))}
                  className="rounded-2xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="rounded-2xl"
                rows={3}
                maxLength={1000}
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(value) => setForm((current) => ({ ...current, featured: value }))}
                  id="video-featured"
                />
                <Label htmlFor="video-featured" className="font-bengali">Featured video</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.status === "published"}
                  onCheckedChange={(value) => setForm((current) => ({ ...current, status: value ? "published" : "draft" }))}
                  id="video-status"
                />
                <Label htmlFor="video-status" className="font-bengali">Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="rounded-2xl font-bengali" disabled={saving || !meta.valid}>
                {saving ? "Saving..." : editingId ? "Update video" : "Add video"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
};

export default MediaVideosPage;
