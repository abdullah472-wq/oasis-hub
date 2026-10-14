import { useState, useEffect, useMemo } from "react";
import {
  Video,
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  Play,
  RotateCw,
  Film,
  Radio,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MediaVideo, MediaType } from "@/types/cms";
import { VideoFormDialog } from "./VideoFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const VideoManager = () => {
  const { t } = useLanguage();
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<MediaVideo | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<MediaVideo | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("media_videos")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos((data as MediaVideo[]) || []);
    } catch (err: any) {
      console.error("Error fetching media videos:", err);
      toast.error(t("ভিডিও তালিকা লোড করতে সমস্যা হয়েছে", "Failed to load videos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleToggleFeatured = async (video: MediaVideo) => {
    try {
      const updatedStatus = !video.is_featured;
      const { error } = await supabase
        .from("media_videos")
        .update({ is_featured: updatedStatus, updated_at: new Date().toISOString() })
        .eq("id", video.id);

      if (error) throw error;

      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, is_featured: updatedStatus } : v))
      );

      await logAdminActivity(
        "UPDATE",
        "media_videos",
        `ফিচার স্ট্যাটাস পরিবর্তন: "${video.title_bn}" -> ${updatedStatus ? "Featured" : "Regular"}`
      );

      toast.success(
        updatedStatus
          ? t("ভিডিওটি হোমপেজে ফিচার করা হয়েছে", "Video marked as featured")
          : t("ফিচার সরানো হয়েছে", "Removed from featured")
      );
    } catch (err: any) {
      console.error("Error toggling featured status:", err);
      toast.error(t("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে", "Failed to update status"));
    }
  };

  const handleDelete = async () => {
    if (!deletingVideo) return;

    try {
      const { error } = await supabase
        .from("media_videos")
        .delete()
        .eq("id", deletingVideo.id);

      if (error) throw error;

      await logAdminActivity(
        "DELETE",
        "media_videos",
        `ভিডিও ডিলিট: "${deletingVideo.title_bn}"`
      );

      toast.success(t("ভিডিও সফলভাবে মুছে ফেলা হয়েছে", "Video deleted successfully"));
      setVideos((prev) => prev.filter((v) => v.id !== deletingVideo.id));
      setDeletingVideo(null);
    } catch (err: any) {
      console.error("Error deleting video:", err);
      toast.error(t("ভিডিও মুছতে সমস্যা হয়েছে", "Failed to delete video"));
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch =
        !searchQuery.trim() ||
        video.title_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.title_en && video.title_en.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === "all" || video.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [videos, searchQuery, typeFilter]);

  const getTypeBadge = (type: MediaType) => {
    switch (type) {
      case "playlist":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 gap-1">
            <Film className="h-3 w-3" />
            {t("প্লেলিস্ট", "Playlist")}
          </Badge>
        );
      case "livestream":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 gap-1 animate-pulse">
            <Radio className="h-3 w-3" />
            {t("লাইভ", "Live")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-500/10 text-red-600 gap-1">
            <Video className="h-3 w-3" />
            {t("ভিডিও", "Video")}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("ভিডিও খুঁজুন...", "Search videos...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={t("ধরন", "Type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("সকল ধরন", "All Types")}</SelectItem>
              <SelectItem value="video">{t("ভিডিও", "Single Video")}</SelectItem>
              <SelectItem value="playlist">{t("প্লেলিস্ট", "Playlist")}</SelectItem>
              <SelectItem value="livestream">{t("লাইভ স্ট্রিম", "Live Stream")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchVideos}
            disabled={loading}
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => {
              setSelectedVideo(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{t("ভিডিও যোগ করুন", "Add Video")}</span>
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-64 bg-muted/40" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
          <Video className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h4 className="text-base font-semibold">{t("কোনো ভিডিও পাওয়া যায়নি", "No videos found")}</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t(
              "প্রতিষ্ঠানের ইউটিউব চ্যানেল থেকে গুরুত্বপূর্ণ ভিডিও বা প্লেলিস্ট লিংক এখানে যোগ করুন।",
              "Add official YouTube video or playlist links to show them in the media center."
            )}
          </p>
          <Button
            onClick={() => {
              setSelectedVideo(null);
              setIsFormOpen(true);
            }}
            variant="outline"
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("প্রথম ভিডিও যোগ করুন", "Add First Video")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => {
            const thumbnail =
              video.type !== "playlist"
                ? `https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`
                : null;

            return (
              <Card
                key={video.id}
                className="overflow-hidden border-border/70 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Player Preview Clickable */}
                  <div
                    onClick={() => setPreviewVideo(video)}
                    className="relative aspect-video w-full bg-black/10 cursor-pointer overflow-hidden"
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={video.title_bn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_video_id}/0.jpg`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-300">
                        <Film className="h-10 w-10 mb-2 opacity-60" />
                        <span className="text-xs uppercase tracking-wider font-semibold">
                          YouTube Playlist
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl">
                        <Play className="h-6 w-6 ml-1 fill-white" />
                      </div>
                    </div>

                    <div className="absolute top-2 left-2 flex gap-1">
                      {getTypeBadge(video.type)}
                      {video.is_featured && (
                        <Badge className="bg-amber-500 text-white gap-1 shadow-xs">
                          <Sparkles className="h-3 w-3" />
                          {t("ফিচার্ড", "Featured")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <CardContent className="p-4 space-y-2">
                    <h3
                      className="font-semibold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer"
                      onClick={() => setPreviewVideo(video)}
                      title={video.title_bn}
                    >
                      {video.title_bn}
                    </h3>
                    {video.title_en && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {video.title_en}
                      </p>
                    )}
                  </CardContent>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-0 border-t border-border/40 mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {t("হোমপেজে পিন:", "Pin:")}
                    </span>
                    <Switch
                      checked={video.is_featured}
                      onCheckedChange={() => handleToggleFeatured(video)}
                      aria-label="Toggle featured"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => window.open(video.youtube_url, "_blank")}
                      title={t("ইউটিউবে খুলুন", "Open in YouTube")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setSelectedVideo(video);
                        setIsFormOpen(true);
                      }}
                      title={t("সম্পাদনা", "Edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                      onClick={() => setDeletingVideo(video)}
                      title={t("মুছে ফেলুন", "Delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Video Form Dialog */}
      <VideoFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        videoToEdit={selectedVideo}
        onSuccess={fetchVideos}
      />

      {/* Interactive Video Preview Modal */}
      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="max-w-3xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="line-clamp-1">{previewVideo?.title_bn}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black mt-2">
            {previewVideo && (
              <iframe
                src={
                  previewVideo.type === "playlist"
                    ? `https://www.youtube.com/embed/videoseries?list=${previewVideo.youtube_video_id}`
                    : `https://www.youtube.com/embed/${previewVideo.youtube_video_id}?autoplay=1`
                }
                title={previewVideo.title_bn}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingVideo}
        onOpenChange={(open) => !open && setDeletingVideo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("ভিডিওটি মুছে ফেলতে চান?", "Delete this video?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `"${deletingVideo?.title_bn}" ভিডিওটি মিডিয়া সেন্টার থেকে স্থায়ীভাবে মুছে ফেলা হবে।`,
                `"${deletingVideo?.title_bn}" will be permanently removed from the media center.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("হ্যাঁ, মুছে ফেলুন", "Yes, Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
