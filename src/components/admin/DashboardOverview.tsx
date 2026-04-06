import { ArrowDownToLine, ArrowRight, BellRing, BookCopy, BookOpenCheck, CreditCard, UserCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ActivityItem, AdmissionForm, Event, GuardianRequest, Notice, Review } from "@/lib/adminDashboard";
import type { AdminUser } from "@/lib/adminDashboard";
import { canAccessPermission } from "@/lib/adminDashboard";
import type { FeeEntry } from "@/lib/feeEntries";
import type { FeeSummary } from "@/lib/feeHelpers";
import { buildDashboardSummaryText, downloadDashboardSummary } from "@/lib/dashboardSummary";

interface DashboardOverviewProps {
  user: AdminUser;
  stats: {
    totalNews: number;
    totalNotices: number;
    pendingReviews: number;
    pendingAdmissions: number;
    activeManagers: number;
    pendingGuardianRequests: number;
    monthlyFees: number;
    attendanceRate: number;
  };
  notices: Notice[];
  events: Event[];
  admissions: AdmissionForm[];
  reviews: Review[];
  guardianRequests: GuardianRequest[];
  feeEntries: FeeEntry[];
  feeSummary: FeeSummary;
  activityFeed: ActivityItem[];
}

const DashboardOverview = ({
  user,
  stats,
  notices,
  events,
  admissions,
  reviews,
  guardianRequests,
  feeEntries,
  feeSummary,
  activityFeed,
}: DashboardOverviewProps) => {
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
      key: "fees",
      titleBn: "মোট বকেয়া",
      titleEn: "Total Due",
      value: `৳${stats.monthlyFees.toLocaleString("en-US")}`,
      descriptionBn: "সব শিক্ষার্থীর মোট বকেয়া",
      descriptionEn: "Total due across students",
      icon: CreditCard,
    },
    {
      key: "attendance",
      titleBn: "উপস্থিতির হার",
      titleEn: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      descriptionBn: "সর্বশেষ রেকর্ডের উপর ভিত্তি করে",
      descriptionEn: "Based on latest records",
      icon: UserCheck,
    },
    {
      key: "requests",
      titleBn: "অপেক্ষমান অনুরোধ",
      titleEn: "Pending Requests",
      value: stats.pendingGuardianRequests,
      descriptionBn: "গার্ডিয়ান সাপোর্ট ইনবক্স",
      descriptionEn: "Guardian support inbox",
      icon: Users,
    },
  ];

  const quickActions = [
    { key: "notice", labelBn: "নোটিশ প্রকাশ", labelEn: "Publish Notice", to: "/admin/notices", permission: "notices.manage" as const },
    { key: "admission", labelBn: "ভর্তি আবেদন দেখুন", labelEn: "Review Admissions", to: "/admin/admissions", permission: "admissions.manage" as const },
    { key: "managers", labelBn: "ম্যানেজার অনুমতি", labelEn: "Manager Permissions", to: "/admin/managers", permission: "managers.manage" as const },
    { key: "fees", labelBn: "ফি মডিউল", labelEn: "Fees Module", to: "/admin/fees", permission: "fees.manage" as const },
  ].filter((action) => canAccessPermission(user, action.permission));

  const latestNotices = notices.slice(0, 4);
  const latestEvents = events.slice(0, 4);
  const pendingAdmissions = admissions.filter((item) => item.status === "pending").slice(0, 4);
  const pendingReviews = reviews.filter((item) => !item.approved).slice(0, 4);
  const pendingRequests = guardianRequests.filter((item) => item.status !== "resolved").slice(0, 4);
  const latestFees = feeEntries.slice(0, 4);

  const handleDownloadSummary = () => {
    const summaryText = buildDashboardSummaryText({
      user,
      stats,
      notices,
      events,
      admissions,
      reviews,
      guardianRequests,
      feeEntries,
      feeSummary,
      activityFeed,
      t,
      lang,
    });

    downloadDashboardSummary(summaryText);
  };

  return (
    <div className="space-y-6">
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
            <CardDescription className="font-bengali text-primary-foreground/75">{t("ম্যানেজার, ভর্তি, রিভিউ এবং ফি-এর বর্তমান অবস্থা", "Live status of managers, admissions, reviews, and fees")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SnapshotRow label={t("সক্রিয় ম্যানেজার", "Active Managers")} value={String(stats.activeManagers)} />
            <SnapshotRow label={t("অপেক্ষমান ভর্তি", "Pending Admissions")} value={String(stats.pendingAdmissions)} />
            <SnapshotRow label={t("অপেক্ষমান রিভিউ", "Pending Reviews")} value={String(stats.pendingReviews)} />
            <SnapshotRow label={t("মোট পরিশোধ", "Fees Paid")} value={`৳${feeSummary.totalPaid.toLocaleString("en-US")}`} />
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
            <QueueBlock title={t("গার্ডিয়ান অনুরোধ", "Guardian Requests")} items={pendingRequests.map((item) => item.topic)} icon={<Users className="h-4 w-4" />} />
            <QueueBlock title={t("ভর্তি আবেদন", "Admissions")} items={pendingAdmissions.map((item) => item.studentNameBn || item.studentName)} icon={<BookOpenCheck className="h-4 w-4" />} />
            <QueueBlock title={t("রিভিউ অনুমোদন", "Review Approval")} items={pendingReviews.map((item) => item.name)} icon={<BookCopy className="h-4 w-4" />} />
            <QueueBlock title={t("ফি সারাংশ", "Fee Summary")} items={latestFees.map((item) => `${item.studentName} - ${item.title} - ৳${item.dueAmount}`)} icon={<CreditCard className="h-4 w-4" />} />
            <QueueBlock title={t("আসন্ন ইভেন্ট", "Upcoming Events")} items={latestEvents.map((item) => item.titleBn)} icon={<BellRing className="h-4 w-4" />} />
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
