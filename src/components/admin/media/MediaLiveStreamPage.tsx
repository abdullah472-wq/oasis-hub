import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
import { mediaCardClass } from "@/components/admin/media/MediaPrimitives";
import { resolveYouTubeMeta, type MediaLiveStream } from "@/lib/mediaCenter";

interface Props {
  liveStream: MediaLiveStream | null;
  loading: boolean;
  canManage: boolean;
  onSave: (stream: Omit<MediaLiveStream, "updatedAt">) => Promise<void>;
}

const MediaLiveStreamPage = ({ liveStream, loading, canManage, onSave }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(liveStream?.title ?? "");
    setDescription(liveStream?.description ?? "");
    setYoutubeUrl(liveStream?.youtubeUrl ?? "");
    setIsLive(liveStream?.status === "live");
  }, [liveStream]);

  const meta = resolveYouTubeMeta(youtubeUrl);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !meta.valid) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        youtubeUrl: youtubeUrl.trim(),
        videoId: meta.videoId,
        embedUrl: meta.embedUrl,
        status: isLive ? "live" : "offline",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleShell
      title="লাইভ স্ট্রিম"
      description="One active live stream. When offline, the homepage section hides automatically."
      icon={<Radio className="h-5 w-5" />}
      helperText={liveStream?.status === "live" ? "Currently live" : "Offline"}
    >
      {loading ? (
        <Skeleton className="h-72 w-full rounded-3xl" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className={mediaCardClass}>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bengali">Live title</Label>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-2xl" required disabled={!canManage} maxLength={140} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">YouTube live URL</Label>
                  <Input
                    value={youtubeUrl}
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    className="rounded-2xl"
                    placeholder="https://www.youtube.com/live/..."
                    required
                    disabled={!canManage}
                  />
                  {youtubeUrl && !meta.valid ? (
                    <p className="text-xs text-destructive">Could not detect a YouTube video ID.</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="rounded-2xl"
                    rows={3}
                    disabled={!canManage}
                    maxLength={600}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="live-status" checked={isLive} onCheckedChange={setIsLive} disabled={!canManage} />
                  <Label htmlFor="live-status" className="font-bengali">Live now</Label>
                </div>
                {canManage ? (
                  <Button type="submit" className="rounded-2xl font-bengali" disabled={saving || !meta.valid}>
                    {saving ? "Saving..." : "Save live stream"}
                  </Button>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card className={mediaCardClass}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <Badge variant={isLive ? "default" : "secondary"} className="rounded-full">
                  {isLive ? "🔴 LIVE NOW" : "Offline"}
                </Badge>
                <span className="font-bengali text-sm text-muted-foreground">Preview</span>
              </div>
              {meta.valid ? (
                <div className="aspect-video w-full overflow-hidden rounded-2xl">
                  <iframe src={meta.embedUrl} title={title || "Live preview"} allowFullScreen className="h-full w-full" />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-2xl bg-muted font-bengali text-sm text-muted-foreground">
                  Paste a YouTube live link to preview
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ModuleShell>
  );
};

export default MediaLiveStreamPage;
