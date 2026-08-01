import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, HeartHandshake, PlayCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPublishedVideos, type MediaVideo, VIDEO_CATEGORY_LABELS } from "@/lib/mediaCenter";

const VideoRow = ({ videos, onSelect }: { videos: MediaVideo[]; onSelect: (video: MediaVideo) => void }) => (
  <ul className="space-y-3">
    {videos.map((video) => (
      <li key={video.id}>
        <button
          type="button"
          onClick={() => onSelect(video)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 p-2 text-left transition-colors hover:bg-muted/50"
        >
          <img src={video.thumbnailUrl} alt={video.title} loading="lazy" className="h-12 w-20 rounded-xl object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bengali text-sm font-medium text-foreground">{video.title}</span>
            <Badge variant="outline" className="mt-1 rounded-full text-[10px]">
              {VIDEO_CATEGORY_LABELS[video.category]?.en ?? video.category}
            </Badge>
          </span>
          <PlayCircle className="h-5 w-5 shrink-0 text-primary" />
        </button>
      </li>
    ))}
  </ul>
);

const useVideos = () => {
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedVideos()
      .then(setVideos)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return { videos, loading };
};

const WidgetShell = ({
  title,
  icon,
  loading,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  loading: boolean;
  children: React.ReactNode;
}) => (
  <Card className="rounded-3xl border-border/60 bg-card/95">
    <CardContent className="space-y-4 p-6">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h3 className="font-bengali text-lg font-semibold text-foreground">{title}</h3>
      </div>
      {loading ? <Skeleton className="h-32 w-full rounded-2xl" /> : children}
    </CardContent>
  </Card>
);

/** Student dashboard widget: recommended, teacher's latest and revision videos. */
export const StudentMediaWidget = ({ onSelect }: { onSelect: (video: MediaVideo) => void }) => {
  const { t } = useLanguage();
  const { videos, loading } = useVideos();

  const recommended = videos.filter((item) => ["classes", "quran", "hifz", "nazera"].includes(item.category)).slice(0, 3);
  const teacherLatest = videos.filter((item) => item.category === "classes").slice(0, 2);
  const revision = videos.filter((item) => ["islamic-studies", "nazera", "quran"].includes(item.category)).slice(0, 3);

  return (
    <WidgetShell title={t("শিক্ষার্থীদের জন্য", "For students")} icon={<GraduationCap className="h-5 w-5" />} loading={loading}>
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="font-bengali text-sm text-muted-foreground">{t("আজকের প্রস্তাবিত ভিডিও", "Today's recommended videos")}</p>
          {recommended.length ? <VideoRow videos={recommended} onSelect={onSelect} /> : <p className="font-bengali text-sm text-muted-foreground">—</p>}
        </div>
        <div className="space-y-2">
          <p className="font-bengali text-sm text-muted-foreground">{t("শিক্ষকের সর্বশেষ ভিডিও", "Teacher's latest video")}</p>
          {teacherLatest.length ? <VideoRow videos={teacherLatest} onSelect={onSelect} /> : <p className="font-bengali text-sm text-muted-foreground">—</p>}
        </div>
        <div className="space-y-2">
          <p className="font-bengali text-sm text-muted-foreground">{t("রিভিশন ভিডিও", "Revision videos")}</p>
          {revision.length ? <VideoRow videos={revision} onSelect={onSelect} /> : <p className="font-bengali text-sm text-muted-foreground">—</p>}
        </div>
      </div>
    </WidgetShell>
  );
};

/** Guardian dashboard widget: activities, events and programs. */
export const GuardianMediaWidget = ({ onSelect }: { onSelect: (video: MediaVideo) => void }) => {
  const { t } = useLanguage();
  const { videos, loading } = useVideos();

  const activities = videos.slice(0, 3);
  const events = videos.filter((item) => item.category === "events").slice(0, 3);
  const programs = videos.filter((item) => ["competitions", "announcements"].includes(item.category)).slice(0, 3);

  return (
    <WidgetShell title={t("অভিভাবকদের জন্য", "For guardians")} icon={<HeartHandshake className="h-5 w-5" />} loading={loading}>
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="font-bengali text-sm text-muted-foreground">{t("সর্বশেষ কার্যক্রম", "Latest activities")}</p>
          {activities.length ? <VideoRow videos={activities} onSelect={onSelect} /> : <p className="font-bengali text-sm text-muted-foreground">—</p>}
        </div>
        <div className="space-y-2">
          <p className="font-bengali text-sm text-muted-foreground">{t("স্কুল ইভেন্ট", "School events")}</p>
          {events.length ? <VideoRow videos={events} onSelect={onSelect} /> : <p className="font-bengali text-sm text-muted-foreground">—</p>}
        </div>
        <div className="space-y-2">
          <p className="font-bengali text-sm text-muted-foreground">{t("বার্ষিক অনুষ্ঠান ও প্রোগ্রাম", "Programs & annual functions")}</p>
          {programs.length ? <VideoRow videos={programs} onSelect={onSelect} /> : <p className="font-bengali text-sm text-muted-foreground">—</p>}
        </div>
      </div>
    </WidgetShell>
  );
};
