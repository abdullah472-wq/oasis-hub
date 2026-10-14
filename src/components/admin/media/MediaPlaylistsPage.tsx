import { useMemo, useState } from "react";
import { Edit3, ListVideo, PlayCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
import {
  MediaEmptyState,
  MediaGridSkeleton,
  MediaStatusBadge,
  mediaCardClass,
} from "@/components/admin/media/MediaPrimitives";
import {
  extractYouTubePlaylistId,
  getYouTubePlaylistEmbedUrl,
  type MediaPlaylist,
  type MediaPlaylistDraft,
  type MediaVideo,
} from "@/lib/mediaCenter";

const emptyForm = () => ({
  name: "",
  youtubeUrl: "",
  description: "",
  thumbnailUrl: "",
  featured: false,
  status: "published" as "draft" | "published",
});

interface Props {
  playlists: MediaPlaylist[];
  videos: MediaVideo[];
  loading: boolean;
  canManage: boolean;
  onSave: (draft: MediaPlaylistDraft, id?: string) => Promise<void>;
  onDelete: (playlist: MediaPlaylist) => Promise<void>;
}

const MediaPlaylistsPage = ({ playlists, videos, loading, canManage, onSave, onDelete }: Props) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<MediaPlaylist | null>(null);

  const playlistId = extractYouTubePlaylistId(form.youtubeUrl);
  const videosByPlaylist = useMemo(() => {
    const map = new Map<string, MediaVideo[]>();
    videos.forEach((video) => {
      if (!video.playlistId) return;
      map.set(video.playlistId, [...(map.get(video.playlistId) ?? []), video]);
    });
    return map;
  }, [videos]);

  const openCreate = () => {
    setEditingId(undefined);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (playlist: MediaPlaylist) => {
    setEditingId(playlist.id);
    setForm({
      name: playlist.name,
      youtubeUrl: playlist.youtubeUrl ?? "",
      description: playlist.description ?? "",
      thumbnailUrl: playlist.thumbnailUrl ?? "",
      featured: playlist.featured,
      status: playlist.status,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(
        {
          name: form.name.trim(),
          youtubeUrl: form.youtubeUrl.trim(),
          playlistId,
          description: form.description.trim(),
          thumbnailUrl: form.thumbnailUrl.trim(),
          featured: form.featured,
          status: form.status,
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
      title="প্লেলিস্ট"
      description="Group videos into playlists and link YouTube playlist URLs."
      icon={<ListVideo className="h-5 w-5" />}
      recordCount={playlists.length}
      recordLabel="Playlists"
      actionLabel={canManage ? "নতুন প্লেলিস্ট" : undefined}
      onAction={canManage ? openCreate : undefined}
    >
      {loading ? (
        <MediaGridSkeleton count={3} />
      ) : playlists.length === 0 ? (
        <MediaEmptyState
          icon={ListVideo}
          title="কোনো প্লেলিস্ট নেই"
          description="Create your first playlist to organise videos by topic or course."
          actionLabel={canManage ? "নতুন প্লেলিস্ট" : undefined}
          onAction={canManage ? openCreate : undefined}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => {
            const related = videosByPlaylist.get(playlist.id) ?? [];
            const cover = playlist.thumbnailUrl || related[0]?.thumbnailUrl;

            return (
              <Card key={playlist.id} className={`${mediaCardClass} overflow-hidden`}>
                <button type="button" onClick={() => setActive(playlist)} className="block w-full text-left">
                  {cover ? (
                    <img src={cover} alt={playlist.name} loading="lazy" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-muted">
                      <ListVideo className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </button>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bengali font-semibold text-foreground">{playlist.name}</h3>
                    {playlist.featured ? <Badge className="rounded-full">Featured</Badge> : null}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MediaStatusBadge status={playlist.status} />
                    <span>{related.length} videos</span>
                  </div>
                  {playlist.description ? (
                    <p className="line-clamp-2 font-bengali text-sm text-muted-foreground">{playlist.description}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => setActive(playlist)}>
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Open
                    </Button>
                    {canManage ? (
                      <>
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openEdit(playlist)}>
                          <Edit3 className="mr-1.5 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl text-destructive"
                          onClick={() => void onDelete(playlist)}
                          aria-label="Delete playlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(active)} onOpenChange={(value) => !value && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bengali">{active?.name}</DialogTitle>
          </DialogHeader>
          {active?.playlistId ? (
            <div className="aspect-video w-full overflow-hidden rounded-2xl">
              <iframe
                src={getYouTubePlaylistEmbedUrl(active.playlistId)}
                title={active.name}
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {(videosByPlaylist.get(active?.id ?? "") ?? []).map((video) => (
              <div key={video.id} className="flex gap-3 rounded-2xl border border-border/60 p-3">
                <img src={video.thumbnailUrl} alt={video.title} className="h-16 w-28 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="line-clamp-2 font-bengali text-sm font-medium">{video.title}</p>
                  <MediaStatusBadge status={video.status} />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bengali">{editingId ? "প্লেলিস্ট সম্পাদনা" : "নতুন প্লেলিস্ট"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bengali">Playlist name</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="rounded-2xl"
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">YouTube playlist URL</Label>
              <Input
                value={form.youtubeUrl}
                onChange={(event) => setForm((current) => ({ ...current, youtubeUrl: event.target.value }))}
                className="rounded-2xl"
                placeholder="https://www.youtube.com/playlist?list=..."
              />
              {form.youtubeUrl ? (
                <p className="text-xs text-muted-foreground">
                  {playlistId ? `Playlist ID: ${playlistId}` : "No playlist ID detected in this link."}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">Thumbnail URL (optional)</Label>
              <Input
                value={form.thumbnailUrl}
                onChange={(event) => setForm((current) => ({ ...current, thumbnailUrl: event.target.value }))}
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="rounded-2xl"
                rows={3}
                maxLength={600}
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  id="playlist-featured"
                  checked={form.featured}
                  onCheckedChange={(value) => setForm((current) => ({ ...current, featured: value }))}
                />
                <Label htmlFor="playlist-featured" className="font-bengali">Featured</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="playlist-status"
                  checked={form.status === "published"}
                  onCheckedChange={(value) => setForm((current) => ({ ...current, status: value ? "published" : "draft" }))}
                />
                <Label htmlFor="playlist-status" className="font-bengali">Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="rounded-2xl font-bengali" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update playlist" : "Create playlist"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
};

export default MediaPlaylistsPage;
