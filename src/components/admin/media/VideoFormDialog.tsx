import { useState, useEffect } from "react";
import { Loader2, Video, Film, Radio, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MediaVideo, MediaType } from "@/types/cms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function extractYouTubeId(url: string): string {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  // Check playlist pattern
  const listMatch = url.match(/[?&]list=([^#&?]+)/);
  if (listMatch && listMatch[1]) {
    return listMatch[1];
  }
  // Fallback if user pastes only the ID
  if (url.trim().length === 11) return url.trim();
  return "";
}

interface VideoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoToEdit?: MediaVideo | null;
  onSuccess: () => void;
}

export const VideoFormDialog = ({
  isOpen,
  onClose,
  videoToEdit,
  onSuccess,
}: VideoFormDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title_bn: "",
    title_en: "",
    youtube_url: "",
    youtube_video_id: "",
    type: "video" as MediaType,
    is_featured: false,
    order_index: 0,
  });

  useEffect(() => {
    if (videoToEdit) {
      setFormData({
        title_bn: videoToEdit.title_bn,
        title_en: videoToEdit.title_en || "",
        youtube_url: videoToEdit.youtube_url,
        youtube_video_id: videoToEdit.youtube_video_id,
        type: videoToEdit.type || "video",
        is_featured: videoToEdit.is_featured,
        order_index: videoToEdit.order_index || 0,
      });
    } else {
      setFormData({
        title_bn: "",
        title_en: "",
        youtube_url: "",
        youtube_video_id: "",
        type: "video",
        is_featured: false,
        order_index: 0,
      });
    }
  }, [videoToEdit, isOpen]);

  const handleUrlChange = (url: string) => {
    const extractedId = extractYouTubeId(url);
    const isPlaylist = url.includes("list=");
    setFormData((prev) => ({
      ...prev,
      youtube_url: url,
      youtube_video_id: extractedId || prev.youtube_video_id,
      type: isPlaylist ? "playlist" : prev.type,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_bn.trim()) {
      toast.error(t("বাংলা শিরোনাম আবশ্যক", "Bangla title is required"));
      return;
    }

    if (!formData.youtube_url.trim()) {
      toast.error(t("ইউটিউব লিংক আবশ্যক", "YouTube URL is required"));
      return;
    }

    const videoId = formData.youtube_video_id || extractYouTubeId(formData.youtube_url);
    if (!videoId) {
      toast.error(t("সঠিক ইউটিউব ভিডিও বা প্লেলিস্ট লিংক দিন", "Please provide a valid YouTube URL or Video ID"));
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title_bn: formData.title_bn.trim(),
        title_en: formData.title_en.trim() || null,
        youtube_url: formData.youtube_url.trim(),
        youtube_video_id: videoId,
        type: formData.type,
        is_featured: formData.is_featured,
        order_index: Number(formData.order_index) || 0,
        updated_at: new Date().toISOString(),
      };

      if (videoToEdit) {
        const { error } = await supabase
          .from("media_videos")
          .update(payload)
          .eq("id", videoToEdit.id);

        if (error) throw error;

        await logAdminActivity(
          "UPDATE",
          "media_videos",
          `ভিডিও আপডেট: "${payload.title_bn}"`
        );
        toast.success(t("ভিডিও সফলভাবে আপডেট করা হয়েছে", "Video updated successfully"));
      } else {
        const { error } = await supabase
          .from("media_videos")
          .insert([payload]);

        if (error) throw error;

        await logAdminActivity(
          "CREATE",
          "media_videos",
          `নতুন ভিডিও যুক্ত: "${payload.title_bn}"`
        );
        toast.success(t("নতুন ভিডিও সফলভাবে যুক্ত করা হয়েছে", "Video added successfully"));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving media video:", err);
      toast.error(err.message || t("ভিডিও সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save video"));
    } finally {
      setLoading(false);
    }
  };

  const previewThumbnail = formData.youtube_video_id && formData.type !== "playlist"
    ? `https://img.youtube.com/vi/${formData.youtube_video_id}/hqdefault.jpg`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Video className="h-5 w-5 text-red-600" />
            {videoToEdit
              ? t("ভিডিও তথ্য সম্পাদনা করুন", "Edit Video Information")
              : t("নতুন ইউটিউব ভিডিও যোগ করুন", "Add New YouTube Video")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "প্রতিষ্ঠানের ইউটিউব ভিডিও, লাইভ স্ট্রিম বা প্লেলিস্ট যুক্ত করুন",
              "Embed official YouTube videos, live streams, or playlists"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title BN */}
          <div className="space-y-1.5">
            <Label htmlFor="title_bn" className="font-semibold">
              {t("ভিডিও শিরোনাম (বাংলা) *", "Video Title (Bangla) *")}
            </Label>
            <Input
              id="title_bn"
              value={formData.title_bn}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
              placeholder={t("যেমন: বার্ষিক পুরস্কার বিতরণী ও অভিভাবক সম্মেলন", "e.g. Annual Prize Giving Ceremony")}
              required
            />
          </div>

          {/* Title EN */}
          <div className="space-y-1.5">
            <Label htmlFor="title_en">
              {t("ভিডিও শিরোনাম (ইংরেজি)", "Video Title (English)")}
            </Label>
            <Input
              id="title_en"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="e.g. Annual Prize Giving & Parents Conference"
            />
          </div>

          {/* YouTube URL */}
          <div className="space-y-1.5">
            <Label htmlFor="youtube_url" className="font-semibold">
              {t("ইউটিউব ভিডিও / প্লেলিস্ট লিংক *", "YouTube Video / Playlist URL *")}
            </Label>
            <Input
              id="youtube_url"
              value={formData.youtube_url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=XXXXX or https://youtu.be/XXXXX"
              required
            />
            {formData.youtube_video_id && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                {t("শনাক্তকৃত আইডি:", "Detected ID:")} <span className="font-mono font-medium text-foreground">{formData.youtube_video_id}</span>
              </p>
            )}
          </div>

          {/* Thumbnail preview */}
          {previewThumbnail && (
            <div className="rounded-lg border border-border/60 overflow-hidden bg-black/5 p-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t("অটো-থাম্বনেইল প্রিভিউ:", "Auto Thumbnail Preview:")}
              </p>
              <div className="relative aspect-video w-full rounded-md overflow-hidden bg-black/20">
                <img
                  src={previewThumbnail}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // fallback if hqdefault is not available
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${formData.youtube_video_id}/0.jpg`;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="h-10 w-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                    <Video className="h-5 w-5 ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Type & Order Index */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold">{t("মিডিয়া ধরন", "Media Type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(val: MediaType) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">{t("একক ভিডিও", "Single Video")}</SelectItem>
                  <SelectItem value="playlist">{t("প্লেলিস্ট", "Playlist")}</SelectItem>
                  <SelectItem value="livestream">{t("লাইভ স্ট্রিম", "Live Stream")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order_index">{t("সিরিয়াল ক্রম", "Display Order")}</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-card">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">{t("হোমপেজে ফিচার করুন", "Feature on Homepage")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("অন করলে ভিডিওটি ওয়েবসাইটের মূল ভিডিও সেকশনে শীর্ষে দেখাবে", "Pin this video prominently on the public homepage")}
              </p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-primary">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {videoToEdit ? t("আপডেট করুন", "Save Changes") : t("সংরক্ষণ করুন", "Add Video")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
