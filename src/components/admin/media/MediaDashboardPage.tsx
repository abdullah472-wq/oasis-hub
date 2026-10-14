import { Download, Images, ListVideo, PlayCircle, Radio, Star, Video as VideoIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
import { MediaSectionCard, MediaStatCard, MediaStatusBadge } from "@/components/admin/media/MediaPrimitives";
import type { MediaCenterState } from "@/hooks/useMediaCenter";
import { VIDEO_CATEGORY_LABELS } from "@/lib/mediaCenter";

const MediaDashboardPage = ({ state }: { state: MediaCenterState }) => {
  const { loading, stats, videos, gallery, downloads, liveStream, logs } = state;
  const featured = videos.find((item) => item.featured);
  const recentVideos = [...videos].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  const recentImages = gallery.slice(0, 6);
  const recentDownloads = downloads.slice(0, 5);

  return (
    <ModuleShell
      title="মিডিয়া সেন্টার"
      description="Videos, playlists, live stream, gallery and downloadable resources in one place."
      icon={<PlayCircle className="h-5 w-5" />}
      helperText={liveStream?.status === "live" ? "Live stream is on air" : undefined}
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MediaStatCard label="Total videos" value={stats.totalVideos} icon={VideoIcon} hint={`${stats.publishedVideos} published`} />
          <MediaStatCard label="Featured videos" value={stats.featuredVideos} icon={Star} accent="accent" />
          <MediaStatCard label="Playlists" value={stats.totalPlaylists} icon={ListVideo} accent="muted" />
          <MediaStatCard label="Gallery images" value={stats.galleryImages} icon={Images} />
          <MediaStatCard label="Downloads" value={stats.downloads} icon={Download} accent="muted" />
          <MediaStatCard label="Total views" value={stats.totalViews} icon={Radio} accent="accent" hint="Ready for YouTube API sync" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MediaSectionCard
          title="Featured video"
          description="Shown on the public homepage"
          action={
            <Link to="/admin/media/videos">
              <Button size="sm" variant="outline" className="rounded-xl">Manage</Button>
            </Link>
          }
        >
          {loading ? (
            <Skeleton className="aspect-video w-full rounded-2xl" />
          ) : featured ? (
            <div className="space-y-3">
              <div className="aspect-video w-full overflow-hidden rounded-2xl">
                <iframe src={featured.embedUrl} title={featured.title} allowFullScreen className="h-full w-full" />
              </div>
              <p className="font-bengali font-semibold text-foreground">{featured.title}</p>
              <Badge variant="outline" className="rounded-full">
                {VIDEO_CATEGORY_LABELS[featured.category]?.en ?? featured.category}
              </Badge>
            </div>
          ) : (
            <p className="font-bengali text-sm text-muted-foreground">No featured video selected yet.</p>
          )}
        </MediaSectionCard>

        <MediaSectionCard
          title="Recently added videos"
          action={
            <Link to="/admin/media/videos">
              <Button size="sm" variant="outline" className="rounded-xl">View all</Button>
            </Link>
          }
        >
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : recentVideos.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground">No videos added yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentVideos.map((video) => (
                <li key={video.id} className="flex items-center gap-3 rounded-2xl border border-border/60 p-2">
                  <img src={video.thumbnailUrl} alt={video.title} className="h-12 w-20 rounded-xl object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bengali text-sm font-medium text-foreground">{video.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MediaStatusBadge status={video.status} />
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </MediaSectionCard>

        <MediaSectionCard
          title="Latest gallery images"
          action={
            <Link to="/admin/media/gallery">
              <Button size="sm" variant="outline" className="rounded-xl">Manage</Button>
            </Link>
          }
        >
          {recentImages.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {recentImages.map((image) => (
                <img
                  key={image.id}
                  src={image.imageUrl}
                  alt={image.title}
                  loading="lazy"
                  className="aspect-square w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          )}
        </MediaSectionCard>

        <MediaSectionCard
          title="Recent downloads"
          action={
            <Link to="/admin/media/downloads">
              <Button size="sm" variant="outline" className="rounded-xl">Manage</Button>
            </Link>
          }
        >
          {recentDownloads.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground">No resources uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentDownloads.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-3">
                  <span className="truncate font-bengali text-sm">{item.title}</span>
                  <MediaStatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </MediaSectionCard>
      </div>

      <MediaSectionCard title="Activity log" description="Who changed what, and when">
        {logs.length === 0 ? (
          <p className="font-bengali text-sm text-muted-foreground">No media activity recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 p-3 text-sm">
                <span className="font-medium text-foreground">{log.action.replace(".", " ")}</span>
                <span className="truncate text-muted-foreground">{log.target}</span>
                <span className="text-xs text-muted-foreground">
                  {log.userName} · {new Date(log.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </MediaSectionCard>
    </ModuleShell>
  );
};

export default MediaDashboardPage;
