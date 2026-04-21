import { useMemo } from "react";
import { ArrowDownToLine, ArrowRight, BellRing, BookCopy, CalendarDays, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ActivityItem, Event, Notice, Review } from "@/lib/adminDashboard";
import type { AdminUser } from "@/lib/adminDashboard";
import type { DailyEngagement } from "@/lib/engagementAnalytics";
import { canAccessPermission } from "@/lib/adminDashboard";
import { buildDashboardSummaryText, downloadDashboardSummary } from "@/lib/dashboardSummary";

interface DashboardOverviewProps {
  user: AdminUser;
  stats: {
    totalNews: number;
    totalNotices: number;
    pendingReviews: number;
    pendingAdmissions: number;
    pendingGuardianRequests: number;
    activeManagers: number;
    monthlyFees: number;
    monthlyCollected: number;
    attendanceRate: number;
  };
  notices: Notice[];
  events: Event[];
  reviews: Review[];
  activityFeed: ActivityItem[];
  dailyEngagement: DailyEngagement[];
}

const DashboardOverview = ({ user, stats, notices, events, reviews, activityFeed, dailyEngagement }: DashboardOverviewProps) => {
  const { t, lang } = useLanguage();

  const statCards = [
    {
      key: "notices",
      titleBn: "লাইভ নোটিশ",
      titleEn: "Live Notices",
      value: stats.totalNotices,
      descriptionBn: "বর্তমানে প্রকাশিত নোটিশ",
      descriptionEn: "Currently published notices",
      icon: BellRing,
    },
    {
      key: "news",
      titleBn: "মোট সংবাদ",
      titleEn: "Total News",
      value: stats.totalNews,
      descriptionBn: "প্রকাশিত সংবাদ পোস্ট",
      descriptionEn: "Published news posts",
      icon: BookCopy,
    },
    {
      key: "reviews",
      titleBn: "অপেক্ষমান রিভিউ",
      titleEn: "Pending Reviews",
      value: stats.pendingReviews,
      descriptionBn: "অনুমোদনের অপেক্ষায় রিভিউ",
      descriptionEn: "Reviews waiting for approval",
      icon: ShieldCheck,
    },
    {
      key: "events",
      titleBn: "আসন্ন ইভেন্ট",
      titleEn: "Upcoming Events",
      value: events.length,
      descriptionBn: "তালিকাভুক্ত ইভেন্ট",
      descriptionEn: "Listed upcoming events",
      icon: CalendarDays,
    },
  ];

  const quickActions = [
    { key: "notice", labelBn: "নোটিশ প্রকাশ", labelEn: "Publish Notice", to: "/admin/notices", permission: "notices.manage" as const },
    { key: "news", labelBn: "সংবাদ যোগ করুন", labelEn: "Add News", to: "/admin/news", permission: "news.manage" as const },
    { key: "fees", labelBn: "ফি ম্যানেজমেন্ট", labelEn: "Manage Fees", to: "/admin/fees", permission: "fees.manage" as const },
    { key: "attendance", labelBn: "উপস্থিতি নিন", labelEn: "Take Attendance", to: "/admin/attendance", permission: "attendance.manage" as const },
    { key: "guardian-requests", labelBn: "গার্ডিয়ান রিকোয়েস্ট", labelEn: "Guardian Requests", to: "/admin/guardian-requests", permission: "guardianRequests.manage" as const },
    { key: "managers", labelBn: "ম্যানেজার অনুমতি", labelEn: "Manager Permissions", to: "/admin/managers", permission: "managers.manage" as const },
    { key: "ramadan", labelBn: "রমাদান মডিউল", labelEn: "Ramadan Module", to: "/admin/ramadan", permission: "ramadan.manage" as const },
  ].filter((action) => canAccessPermission(user, action.permission));

  const latestNotices = notices.slice(0, 4);
  const latestEvents = events.slice(0, 4);
  const pendingReviews = reviews.filter((item) => !item.approved).slice(0, 4);
  const approvedReviewsCount = Math.max(reviews.length - stats.pendingReviews, 0);
  const engagementTrend = useMemo(() => {
    const dayMap = new Map<string, DailyEngagement>();

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      dayMap.set(key, { dateKey: key, websiteVisitors: 0, appOpens: 0 });
    }

    dailyEngagement.forEach((item) => {
      const key = item.dateKey;
      if (dayMap.has(key)) {
        dayMap.set(key, item);
      }
    });

    return Array.from(dayMap.values()).map((value) => {
      const key = value.dateKey;
      const date = new Date(`${key}T00:00:00`);
      const label = date.toLocaleDateString("bn-BD", { weekday: "short" });
      return { label, websiteVisitors: value.websiteVisitors, appOpens: value.appOpens };
    });
  }, [dailyEngagement]);

  const feePieData = [
    { label: t("বকেয়া", "Due"), value: Math.max(stats.monthlyFees, 0), color: "#f59e0b" },
    { label: t("আদায়", "Collected"), value: Math.max(stats.monthlyCollected, 0), color: "#0f766e" },
  ];

  const handleDownloadSummary = () => {
    const summaryText = buildDashboardSummaryText({
      user,
      stats,
      notices,
      events,
      reviews,
      activityFeed,
      t,
      lang,
    });

    downloadDashboardSummary(summaryText);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-border/60 bg-white/95">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("ভিজিটর লাইন চার্ট", "Visitors Line Chart")}</CardTitle>
            <CardDescription className="font-bengali">{t("গত ৭ দিনের ওয়েবসাইট ভিজিট ও অ্যাপ ওপেন", "Last 7 days website visitors and app opens")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MiniEngagementLineChart points={engagementTrend} />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-white/95">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("ফি পাই চার্ট", "Fee Pie Chart")}</CardTitle>
            <CardDescription className="font-bengali">{t("মোট বকেয়া ও আদায়ের অনুপাত", "Due vs collected fee ratio")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MiniPieChart slices={feePieData} />
            <div className="space-y-2">
              {feePieData.map((item) => (
                <LegendRow key={item.label} label={item.label} value={item.value} color={item.color} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-white/95">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("পারফরম্যান্স ট্র্যাকার", "Performance Tracker")}</CardTitle>
            <CardDescription className="font-bengali">{t("উপস্থিতি ও বকেয়ার সারসংক্ষেপ", "Attendance and dues summary")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressMeter label={t("অনুমোদিত রিভিউ", "Approved Reviews")} value={(approvedReviewsCount / Math.max(reviews.length, 1)) * 100} suffix="%" />
            <ProgressMeter label={t("উপস্থিতির হার", "Attendance Rate")} value={stats.attendanceRate} suffix="%" />
            <ProgressMeter label={t("মোট বকেয়া ফি", "Outstanding Fees")} value={Math.min((stats.monthlyFees / 100000) * 100, 100)} suffix="%" display={`৳${stats.monthlyFees.toLocaleString("en-US")}`} />
            <ProgressMeter label={t("ম্যানেজার সক্রিয়তা", "Manager Activity")} value={Math.min((stats.activeManagers / 10) * 100, 100)} suffix="%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.key} className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
              <CardContent className="flex items-start justify-between p-6">
                <div className="space-y-2">
                  <p className="font-bengali text-sm text-muted-foreground">{t(card.titleBn, card.titleEn)}</p>
                  <h3 className="font-display text-3xl font-semibold text-foreground">{card.value}</h3>
                  <p className="font-bengali text-xs text-muted-foreground">{t(card.descriptionBn, card.descriptionEn)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-bengali text-xl">{t("দ্রুত অ্যাকশন", "Quick Actions")}</CardTitle>
              <CardDescription className="font-bengali">{t("গুরুত্বপূর্ণ কাজগুলো এখান থেকে দ্রুত শুরু করুন", "Start important workflows from here")}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">{t("আজকের কাজ", "Today")}</Badge>
              <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={handleDownloadSummary}>
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                {t("সামারি ডাউনলোড", "Download Summary")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => (
              <Button key={action.key} asChild variant="outline" className="h-auto justify-between rounded-2xl border-border/70 bg-background px-4 py-4 font-bengali">
                <Link to={action.to}>
                  {t(action.labelBn, action.labelEn)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-[0_20px_60px_-40px_rgba(13,87,73,0.65)]">
          <CardHeader>
            <CardTitle className="font-bengali text-xl">{t("অপারেশন স্ন্যাপশট", "Operation Snapshot")}</CardTitle>
            <CardDescription className="font-bengali text-primary-foreground/75">{t("ম্যানেজার, রিভিউ এবং কনটেন্ট অপারেশনের বর্তমান অবস্থা", "Live status of managers, reviews, and content operations")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SnapshotRow label={t("সক্রিয় ম্যানেজার", "Active Managers")} value={String(stats.activeManagers)} />
            <SnapshotRow label={t("পেন্ডিং ভর্তি", "Pending Admissions")} value={String(stats.pendingAdmissions)} />
            <SnapshotRow label={t("গার্ডিয়ান রিকোয়েস্ট", "Guardian Requests")} value={String(stats.pendingGuardianRequests)} />
            <SnapshotRow label={t("অপেক্ষমান রিভিউ", "Pending Reviews")} value={String(stats.pendingReviews)} />
            <SnapshotRow label={t("প্রকাশিত নোটিশ", "Published Notices")} value={String(stats.totalNotices)} />
            <SnapshotRow label={t("প্রকাশিত সংবাদ", "Published News")} value={String(stats.totalNews)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl border-border/60 bg-white/95 xl:col-span-1">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("সাম্প্রতিক নোটিশ", "Latest Notices")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestNotices.length === 0 ? (
              <p className="font-bengali text-sm text-muted-foreground">{t("এখনও কোনো নোটিশ নেই", "No notices yet")}</p>
            ) : (
              latestNotices.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                  <p className="font-bengali text-sm font-medium text-foreground">{item.titleBn}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("bn-BD")}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-white/95 xl:col-span-1">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("সাম্প্রতিক কার্যক্রম", "Recent Activity")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.length === 0 ? (
              <p className="font-bengali text-sm text-muted-foreground">{t("এখনও কোনো কার্যক্রম লগ নেই", "No activity logged yet")}</p>
            ) : (
              activityFeed.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bengali text-sm font-medium">{item.title}</p>
                    <Badge variant="secondary" className="rounded-full">{item.module}</Badge>
                  </div>
                  <p className="mt-1 font-bengali text-xs text-muted-foreground">{item.detail}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString("bn-BD")}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-white/95 xl:col-span-1">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("অপেক্ষমান কিউ", "Pending Queue")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QueueBlock title={t("রিভিউ অনুমোদন", "Review Approval")} items={pendingReviews.map((item) => item.name)} icon={<BookCopy className="h-4 w-4" />} />
            <QueueBlock title={t("আসন্ন ইভেন্ট", "Upcoming Events")} items={latestEvents.map((item) => item.titleBn)} icon={<CalendarDays className="h-4 w-4" />} />
            <QueueBlock title={t("সাম্প্রতিক নোটিশ", "Recent Notices")} items={latestNotices.map((item) => item.titleBn)} icon={<BellRing className="h-4 w-4" />} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SnapshotRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
    <span className="font-bengali text-sm">{label}</span>
    <span className="font-display text-xl font-semibold">{value}</span>
  </div>
);

const MiniEngagementLineChart = ({
  points,
}: {
  points: { label: string; websiteVisitors: number; appOpens: number }[];
}) => {
  const width = 360;
  const height = 140;
  const max = Math.max(
    ...points.map((point) => Math.max(point.websiteVisitors, point.appOpens)),
    1,
  );
  const stepX = points.length > 1 ? width / (points.length - 1) : width;
  const websiteLinePoints = points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point.websiteVisitors / max) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");
  const appLinePoints = points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point.appOpens / max) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full rounded-2xl bg-muted/30 p-2">
        <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="3" points={websiteLinePoints} strokeLinejoin="round" strokeLinecap="round" />
        <polyline fill="none" stroke="#f59e0b" strokeWidth="3" points={appLinePoints} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => {
          const x = index * stepX;
          const websiteY = height - (point.websiteVisitors / max) * (height - 20) - 10;
          const appY = height - (point.appOpens / max) * (height - 20) - 10;
          return (
            <g key={`${point.label}-${index}`}>
              <circle cx={x} cy={websiteY} r="3.5" fill="hsl(var(--primary))" />
              <circle cx={x} cy={appY} r="3.5" fill="#f59e0b" />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="font-bengali text-xs text-muted-foreground">Website Visitors</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="font-bengali text-xs text-muted-foreground">App Opens</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {points.map((point) => (
          <div key={point.label} className="text-center">
            <p className="font-bengali text-[10px] text-muted-foreground">{point.label}</p>
            <p className="font-display text-[11px] font-semibold text-foreground">
              {point.websiteVisitors}/{point.appOpens}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const MiniPieChart = ({ slices }: { slices: { label: string; value: number; color: string }[] }) => {
  const total = Math.max(slices.reduce((sum, item) => sum + item.value, 0), 1);
  let cumulative = 0;

  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 42 42" className="h-40 w-40">
        <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="7" />
        {slices.map((slice) => {
          const fraction = (slice.value / total) * 100;
          const segment = (
            <circle
              key={slice.label}
              cx="21"
              cy="21"
              r="15.9155"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="7"
              strokeDasharray={`${fraction} ${100 - fraction}`}
              strokeDashoffset={-cumulative}
              transform="rotate(-90 21 21)"
            />
          );
          cumulative += fraction;
          return segment;
        })}
        <text x="21" y="20" textAnchor="middle" className="fill-foreground text-[4px] font-semibold">{total}</text>
        <text x="21" y="25" textAnchor="middle" className="fill-muted-foreground text-[2.5px]">Pending</text>
      </svg>
    </div>
  );
};

const LegendRow = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2">
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-bengali text-xs text-foreground">{label}</span>
    </div>
    <span className="font-display text-sm font-semibold text-foreground">{value}</span>
  </div>
);

const ProgressMeter = ({
  label,
  value,
  suffix,
  display,
}: {
  label: string;
  value: number;
  suffix: string;
  display?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="font-bengali text-sm text-foreground">{label}</span>
      <span className="font-display text-sm font-semibold text-foreground">{display ?? `${Math.round(value)}${suffix}`}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  </div>
);

const QueueBlock = ({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) => (
  <div className="rounded-2xl border border-border/60 bg-background p-4">
    <div className="mb-3 flex items-center gap-2 font-bengali text-sm font-semibold text-foreground">
      <span className="text-primary">{icon}</span>
      <span>{title}</span>
    </div>
    {items.length === 0 ? (
      <p className="font-bengali text-xs text-muted-foreground">কোনো তথ্য নেই</p>
    ) : (
      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={item} className="rounded-xl bg-muted/60 px-3 py-2 font-bengali text-xs text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DashboardOverview;
