import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BellRing,
  BookCopy,
  CalendarDays,
  FileCheck2,
  MessageSquare,
  MoreVertical,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canAccessPermission, type ActivityItem, type AdminUser, type GuardianRequest } from "@/lib/adminDashboard";
import type { DailyEngagement } from "@/lib/engagementAnalytics";
import type { Notice } from "@/lib/notices";
import type { Event } from "@/lib/events";
import type { Review } from "@/lib/reviews";
import type { AdmissionForm } from "@/lib/admission";
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
  admissions: AdmissionForm[];
  guardianRequests: GuardianRequest[];
  reviews: Review[];
  activityFeed: ActivityItem[];
  dailyEngagement: DailyEngagement[];
}

type EngagementRange = "7d" | "30d" | "12m";
type HistoryRange = "7d" | "30d" | "all";
const HISTORY_ITEMS_PER_PAGE = 8;

interface EngagementChartPoint {
  key: string;
  label: string;
  websiteVisitors: number;
  appOpens: number;
}

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

const formatDateTime = (lang: "bn" | "en") =>
  new Date().toLocaleString(lang === "bn" ? "bn-BD" : "en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const formatItemTime = (value: number, lang: "bn" | "en") =>
  new Date(value).toLocaleString(lang === "bn" ? "bn-BD" : "en-BD", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const buildEngagementTrend = (
  dailyEngagement: DailyEngagement[],
  range: EngagementRange,
  locale: string,
): EngagementChartPoint[] => {
  const dailyMap = new Map<string, DailyEngagement>();

  dailyEngagement.forEach((item) => {
    dailyMap.set(item.dateKey, item);
  });

  if (range === "12m") {
    const today = startOfDay(new Date());
    const monthMap = new Map<string, EngagementChartPoint>();

    for (let i = 11; i >= 0; i -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = getMonthKey(date);
      monthMap.set(key, {
        key,
        label: date.toLocaleDateString(locale, { month: "short" }),
        websiteVisitors: 0,
        appOpens: 0,
      });
    }

    dailyEngagement.forEach((item) => {
      const monthKey = item.dateKey.slice(0, 7);
      const current = monthMap.get(monthKey);
      if (!current) return;

      current.websiteVisitors += item.websiteVisitors;
      current.appOpens += item.appOpens;
    });

    return Array.from(monthMap.values());
  }

  const totalDays = range === "30d" ? 30 : 7;
  const points: EngagementChartPoint[] = [];
  const today = startOfDay(new Date());

  for (let i = totalDays - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = getDateKey(date);
    const item = dailyMap.get(key);
    const label =
      range === "30d"
        ? date.toLocaleDateString(locale, { day: "numeric", month: "short" })
        : date.toLocaleDateString(locale, { weekday: "short" });

    points.push({
      key,
      label,
      websiteVisitors: item?.websiteVisitors ?? 0,
      appOpens: item?.appOpens ?? 0,
    });
  }

  return points;
};

const DashboardOverview = ({
  user,
  stats,
  notices,
  events,
  admissions,
  guardianRequests,
  reviews,
  activityFeed,
  dailyEngagement,
}: DashboardOverviewProps) => {
  const { t, lang } = useLanguage();
  const [engagementRange, setEngagementRange] = useState<EngagementRange>("7d");
  const [historyRange, setHistoryRange] = useState<HistoryRange>("7d");
  const [historyPage, setHistoryPage] = useState(1);

  const chartLocale = lang === "bn" ? "bn-BD" : "en-US";
  const engagementTrend = useMemo(
    () => buildEngagementTrend(dailyEngagement, engagementRange, chartLocale),
    [chartLocale, dailyEngagement, engagementRange],
  );

  const engagementDescription = useMemo(() => {
    switch (engagementRange) {
      case "30d":
        return t("গত ১ মাসের ওয়েবসাইট ভিজিট ও অ্যাপ ওপেন", "Last month website visitors and app opens");
      case "12m":
        return t("গত ১ বছরের ওয়েবসাইট ভিজিট ও অ্যাপ ওপেন", "Last year website visitors and app opens");
      default:
        return t("গত ৭ দিনের ওয়েবসাইট ভিজিট ও অ্যাপ ওপেন", "Last 7 days website visitors and app opens");
    }
  }, [engagementRange, t]);

  const engagementFilters = [
    { key: "7d" as const, label: t("শেষ ৭ দিন", "Last 7 days") },
    { key: "30d" as const, label: t("শেষ ১ মাস", "Last month") },
    { key: "12m" as const, label: t("শেষ ১ বছর", "Last year") },
  ];

  const feePieData = [
    { label: t("বকেয়া", "Due"), value: Math.max(stats.monthlyFees, 0), color: "#f59e0b" },
    { label: t("আদায়", "Collected"), value: Math.max(stats.monthlyCollected, 0), color: "#0f766e" },
  ];

  const feeCollectionPercent = useMemo(() => {
    const totalAmount = stats.monthlyFees + stats.monthlyCollected;
    if (totalAmount <= 0) return 0;
    return (stats.monthlyCollected / totalAmount) * 100;
  }, [stats.monthlyCollected, stats.monthlyFees]);

  const engagementTotals = useMemo(
    () =>
      engagementTrend.reduce(
        (totals, point) => ({
          websiteVisitors: totals.websiteVisitors + point.websiteVisitors,
          appOpens: totals.appOpens + point.appOpens,
        }),
        { websiteVisitors: 0, appOpens: 0 },
      ),
    [engagementTrend],
  );

  const pendingAdmissionItems = admissions.filter((item) => item.status === "pending").slice(0, 3);
  const openGuardianRequests = guardianRequests.filter((item) => item.status !== "resolved").slice(0, 3);
  const pendingReviewItems = reviews.filter((item) => !item.approved).slice(0, 3);
  const latestNotices = notices.slice(0, 4);
  const latestEvents = events.slice(0, 4);
  const priorityTaskCount = pendingReviewItems.length + pendingAdmissionItems.length + openGuardianRequests.length;

  const kpiCards = [
    {
      key: "reviews",
      title: t("পেন্ডিং রিভিউ", "Pending Reviews"),
      value: stats.pendingReviews,
      description:
        stats.pendingReviews > 0
          ? t("নতুন মতামত অনুমোদনের অপেক্ষায় আছে", "New feedback is waiting for approval")
          : t("রিভিউ কিউ আপাতত খালি", "The review queue is currently clear"),
      actionLabel: stats.pendingReviews > 0 ? t("Resolve now", "Resolve now") : t("View details", "View details"),
      to: "/admin/reviews",
      permission: "reviews.manage" as const,
      icon: BookCopy,
      accentClass: "from-rose-500/12 to-rose-100",
      iconClass: "bg-rose-100 text-rose-700",
      badgeLabel: stats.pendingReviews > 0 ? t("জরুরি", "Urgent") : t("স্বাভাবিক", "Stable"),
    },
    {
      key: "admissions",
      title: t("পেন্ডিং ভর্তি", "Pending Admissions"),
      value: stats.pendingAdmissions,
      description:
        stats.pendingAdmissions > 0
          ? t("নতুন আবেদন যাচাই করা দরকার", "New applications need review")
          : t("ভর্তি কিউ নিয়ন্ত্রণে আছে", "Admissions are under control"),
      actionLabel: t("View details", "View details"),
      to: "/admin/admissions",
      permission: "admissions.manage" as const,
      icon: FileCheck2,
      accentClass: "from-amber-500/12 to-amber-100",
      iconClass: "bg-amber-100 text-amber-700",
      badgeLabel: stats.pendingAdmissions > 0 ? t("চেক করুন", "Needs review") : t("ক্লিয়ার", "Clear"),
    },
    {
      key: "guardian-requests",
      title: t("পেন্ডিং গার্ডিয়ান রিকোয়েস্ট", "Pending Guardian Requests"),
      value: stats.pendingGuardianRequests,
      description:
        stats.pendingGuardianRequests > 0
          ? t("অভিভাবক সাপোর্ট কিউতে খোলা অনুরোধ আছে", "There are open items in the guardian support queue")
          : t("সব গার্ডিয়ান রিকোয়েস্ট সমাধান হয়েছে", "All guardian requests are resolved"),
      actionLabel: stats.pendingGuardianRequests > 0 ? t("Resolve now", "Resolve now") : t("View details", "View details"),
      to: "/admin/guardian-requests",
      permission: "guardianRequests.manage" as const,
      icon: MessageSquare,
      accentClass: "from-sky-500/12 to-sky-100",
      iconClass: "bg-sky-100 text-sky-700",
      badgeLabel: stats.pendingGuardianRequests > 0 ? t("নতুন", "New") : t("স্বাভাবিক", "Stable"),
    },
    {
      key: "attendance",
      title: t("উপস্থিতির হার", "Attendance Rate"),
      value: `${Math.round(stats.attendanceRate)}%`,
      description:
        stats.attendanceRate < 90
          ? t("উপস্থিতির হার নজরে রাখা দরকার", "Attendance should be monitored closely")
          : t("এ মাসের উপস্থিতি সন্তোষজনক", "Attendance looks healthy this month"),
      actionLabel: t("View details", "View details"),
      to: "/admin/attendance",
      permission: "attendance.manage" as const,
      icon: UserCheck,
      accentClass: "from-emerald-500/12 to-emerald-100",
      iconClass: "bg-emerald-100 text-emerald-700",
      badgeLabel: stats.attendanceRate < 90 ? t("মনোযোগ", "Watch") : t("ভালো", "Healthy"),
    },
  ].filter((card) => canAccessPermission(user, card.permission));

  const quickActionGroups = [
    {
      key: "urgent",
      title: t("Urgent", "Urgent"),
      description: t("যেগুলো আগে দেখা দরকার", "What needs attention first"),
      items: [
        {
          key: "review-queue",
          label: t("রিভিউ কিউ", "Review Queue"),
          helper: t(`${stats.pendingReviews}টি অপেক্ষমাণ`, `${stats.pendingReviews} pending`),
          to: "/admin/reviews",
          permission: "reviews.manage" as const,
          permissionHint: "reviews.manage",
          visible: stats.pendingReviews > 0,
        },
        {
          key: "admission-queue",
          label: t("ভর্তি কিউ", "Admissions Queue"),
          helper: t(`${stats.pendingAdmissions}টি অপেক্ষমাণ`, `${stats.pendingAdmissions} pending`),
          to: "/admin/admissions",
          permission: "admissions.manage" as const,
          permissionHint: "admissions.manage",
          visible: stats.pendingAdmissions > 0,
        },
        {
          key: "guardian-queue",
          label: t("গার্ডিয়ান কিউ", "Guardian Queue"),
          helper: t(`${stats.pendingGuardianRequests}টি খোলা`, `${stats.pendingGuardianRequests} open`),
          to: "/admin/guardian-requests",
          permission: "guardianRequests.manage" as const,
          permissionHint: "guardianRequests.manage",
          visible: stats.pendingGuardianRequests > 0,
        },
      ],
    },
    {
      key: "content",
      title: t("Content", "Content"),
      description: t("দৈনিক কনটেন্ট workflow", "Everyday content workflow"),
      items: [
        {
          key: "notice",
          label: t("নোটিশ প্রকাশ", "Publish Notice"),
          helper: t("স্কুল আপডেট দিন", "Share a school update"),
          to: "/admin/notices",
          permission: "notices.manage" as const,
          permissionHint: "notices.manage",
          visible: true,
        },
        {
          key: "news",
          label: t("সংবাদ যোগ", "Add News"),
          helper: t("সর্বশেষ খবর দিন", "Publish the latest story"),
          to: "/admin/news",
          permission: "news.manage" as const,
          permissionHint: "news.manage",
          visible: true,
        },
        {
          key: "results",
          label: t("ফলাফল আপডেট", "Update Results"),
          helper: t("রেজাল্ট সেকশন ঠিক রাখুন", "Keep result publishing on track"),
          to: "/admin/results",
          permission: "results.manage" as const,
          permissionHint: "results.manage",
          visible: true,
        },
      ],
    },
    {
      key: "operations",
      title: t("Operations", "Operations"),
      description: t("দৈনন্দিন অপারেশনস", "Routine operational tasks"),
      items: [
        {
          key: "attendance",
          label: t("উপস্থিতি নিন", "Take Attendance"),
          helper: t("আজকের উপস্থিতি আপডেট করুন", "Update today's attendance"),
          to: "/admin/attendance",
          permission: "attendance.manage" as const,
          permissionHint: "attendance.manage",
          visible: true,
        },
        {
          key: "students",
          label: t("শিক্ষার্থী তালিকা", "Student List"),
          helper: t("তথ্য খুঁজুন বা যাচাই করুন", "Look up or verify records"),
          to: "/admin/students",
          permission: "attendance.manage" as const,
          permissionHint: "attendance.manage",
          visible: true,
        },
        {
          key: "mobile-notifications",
          label: t("মোবাইল নোটিফিকেশন", "Mobile Notifications"),
          helper: t("Guardian app-এ বার্তা পাঠান", "Send a message to the guardian app"),
          to: "/admin/mobile-notifications",
          permission: "notices.manage" as const,
          permissionHint: "notices.manage",
          visible: true,
        },
      ],
    },
  ]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.visible && canAccessPermission(user, item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  const whatsNewItems = [
    ...activityFeed.slice(0, 2).map((item) => ({
      key: item.id,
      title: item.title,
      detail: item.detail,
      meta: formatItemTime(item.createdAt, lang),
    })),
    ...latestNotices.slice(0, 2).map((item) => ({
      key: item.id ?? String(item.createdAt),
      title: lang === "bn" ? item.titleBn : item.titleEn,
      detail: t("নতুন নোটিশ প্রকাশ হয়েছে", "A new notice has been published"),
      meta: formatItemTime(item.createdAt, lang),
    })),
  ].slice(0, 4);

  const snapshotCards = [
    {
      key: "today",
      title: t("আজকের পেন্ডিং টাস্ক", "Today's Pending Tasks"),
      value: priorityTaskCount,
      tone: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      key: "approvals",
      title: t("রিসেন্ট approval দরকার", "Recent Approvals Required"),
      value: pendingReviewItems.length + pendingAdmissionItems.length,
      tone: "text-rose-700 bg-rose-50 border-rose-200",
    },
    {
      key: "alerts",
      title: t("সর্বশেষ সিস্টেম এলার্ট", "Latest System Alerts"),
      value: Math.min(activityFeed.length, 3),
      tone: "text-sky-700 bg-sky-50 border-sky-200",
    },
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

    void downloadDashboardSummary(summaryText, "dashboard-summary");
  };

  const historyFilters = [
    { key: "7d" as const, label: t("শেষ ৭ দিন", "Last 7 days") },
    { key: "30d" as const, label: t("শেষ ১ মাস", "Last month") },
    { key: "all" as const, label: t("সব সময়", "All time") },
  ];

  const filteredHistoryItems = useMemo(() => {
    const now = Date.now();
    const threshold =
      historyRange === "7d"
        ? now - 7 * 24 * 60 * 60 * 1000
        : historyRange === "30d"
          ? now - 30 * 24 * 60 * 60 * 1000
          : 0;

    return activityFeed.filter((item) => item.createdAt >= threshold);
  }, [activityFeed, historyRange]);

  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistoryItems.length / HISTORY_ITEMS_PER_PAGE));

  const paginatedHistoryItems = useMemo(() => {
    const startIndex = (historyPage - 1) * HISTORY_ITEMS_PER_PAGE;
    return filteredHistoryItems.slice(startIndex, startIndex + HISTORY_ITEMS_PER_PAGE);
  }, [filteredHistoryItems, historyPage]);

  const historyPageNumbers = useMemo(() => {
    if (totalHistoryPages <= 5) {
      return Array.from({ length: totalHistoryPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, totalHistoryPages, historyPage - 1, historyPage, historyPage + 1]);
    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalHistoryPages)
      .sort((a, b) => a - b);
  }, [historyPage, totalHistoryPages]);

  useEffect(() => {
    setHistoryPage(1);
  }, [historyRange]);

  useEffect(() => {
    setHistoryPage((current) => Math.min(current, totalHistoryPages));
  }, [totalHistoryPages]);

  const handleDownloadHistory = (range: HistoryRange) => {
    const now = Date.now();
    const threshold =
      range === "7d"
        ? now - 7 * 24 * 60 * 60 * 1000
        : range === "30d"
          ? now - 30 * 24 * 60 * 60 * 1000
          : 0;

    const rangeItems = activityFeed.filter((item) => item.createdAt >= threshold);
    const rangeLabel =
      range === "7d"
        ? t("শেষ ৭ দিন", "Last 7 days")
        : range === "30d"
          ? t("শেষ ১ মাস", "Last month")
          : t("সব সময়", "All time");

    const lines = [
      t("সর্বশেষ আপডেট হিস্টোরি", "Latest Update History"),
      `${t("ডাউনলোড সময়", "Downloaded at")}: ${formatDateTime(lang)}`,
      `${t("রেঞ্জ", "Range")}: ${rangeLabel}`,
      "",
      rangeItems.length === 0
        ? t("কোনো আপডেট পাওয়া যায়নি", "No updates found")
        : "",
      ...rangeItems.map(
        (item) =>
          `- ${item.title} • ${item.detail} • ${item.module} • ${formatItemTime(item.createdAt, lang)}`,
      ),
    ].filter(Boolean);

    void downloadDashboardSummary(lines.join("\n"), `update-history-${range}`);
  };

  const handleDownloadEngagementSummary = () => {
    const rangeLabel =
      engagementRange === "30d"
        ? t("শেষ ১ মাস", "Last month")
        : engagementRange === "12m"
          ? t("শেষ ১ বছর", "Last year")
          : t("শেষ ৭ দিন", "Last 7 days");

    const lines = [
      t("ভিজিটর লাইন চার্ট সারাংশ", "Visitors Line Chart Summary"),
      `${t("ডাউনলোড সময়", "Downloaded at")}: ${formatDateTime(lang)}`,
      `${t("নির্বাচিত সময়", "Selected range")}: ${rangeLabel}`,
      `${t("মোট ওয়েবসাইট ভিজিট", "Total website visitors")}: ${engagementTotals.websiteVisitors}`,
      `${t("মোট অ্যাপ ওপেন", "Total app opens")}: ${engagementTotals.appOpens}`,
      "",
      t("ডেটা পয়েন্ট", "Data Points"),
      ...engagementTrend.map(
        (point) => `- ${point.label}: ${t("ভিজিট", "Visitors")} ${point.websiteVisitors}, ${t("অ্যাপ ওপেন", "App Opens")} ${point.appOpens}`,
      ),
    ];

    void downloadDashboardSummary(lines.join("\n"), "visitor-chart-summary");
  };

  const handleDownloadFeeSummary = () => {
    const lines = [
      t("ফি পাই চার্ট সারাংশ", "Fee Pie Chart Summary"),
      `${t("ডাউনলোড সময়", "Downloaded at")}: ${formatDateTime(lang)}`,
      `${t("মোট বকেয়া", "Total due")}: ৳${stats.monthlyFees.toLocaleString("en-US")}`,
      `${t("মোট আদায়", "Total collected")}: ৳${stats.monthlyCollected.toLocaleString("en-US")}`,
      `${t("কালেকশন রেট", "Collection rate")}: ${Math.round(feeCollectionPercent)}%`,
      "",
      t("বিস্তারিত", "Breakdown"),
      ...feePieData.map((item) => `- ${item.label}: ${item.value}`),
    ];

    void downloadDashboardSummary(lines.join("\n"), "fee-chart-summary");
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="grid gap-6 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <Card className="overflow-hidden rounded-[28px] border-border/60 bg-white/95 lg:col-span-2">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="font-bengali text-lg">{t("ভিজিটর লাইন চার্ট", "Visitors Line Chart")}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground"
                    aria-label={t("চার্ট ফিল্টার অপশন", "Chart filter options")}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel className="font-bengali">
                    {t("ভিজিটর চার্ট ফিল্টার", "Visitor chart filter")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={engagementRange} onValueChange={(value) => setEngagementRange(value as EngagementRange)}>
                    {engagementFilters.map((filter) => (
                      <DropdownMenuRadioItem key={filter.key} value={filter.key} className="font-bengali">
                        {filter.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="font-bengali" onClick={handleDownloadEngagementSummary}>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    {t("সারাংশ ডাউনলোড", "Download Summary")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="font-bengali">{engagementDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MiniEngagementLineChart points={engagementTrend} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[28px] border-border/60 bg-white/95">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="font-bengali text-lg">{t("ফি পাই চার্ট", "Fee Pie Chart")}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground"
                    aria-label={t("ফি চার্ট অপশন", "Fee chart options")}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel className="font-bengali">
                    {t("ফি চার্ট অপশন", "Fee chart options")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="font-bengali" onClick={handleDownloadFeeSummary}>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    {t("সারাংশ ডাউনলোড", "Download Summary")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="font-bengali">{t("এ মাসের বকেয়া বনাম আদায়", "Due versus collected for the current period")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MiniPieChart slices={feePieData} />
            <ProgressMeter
              label={t("কালেকশন রেট", "Collection rate")}
              value={feeCollectionPercent}
              suffix="%"
            />
            <div className="space-y-2">
              {feePieData.map((item) => (
                <LegendRow key={item.label} label={item.label} value={item.value} color={item.color} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.key}>
              <Card className={`overflow-hidden rounded-[28px] border-border/60 bg-gradient-to-br ${card.accentClass} shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]`}>
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1 font-bengali">
                        {card.badgeLabel}
                      </Badge>
                      <p className="font-bengali text-sm text-muted-foreground">{card.title}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-3xl font-semibold text-foreground">{card.value}</h3>
                    <p className="font-bengali text-xs leading-5 text-muted-foreground">{card.description}</p>
                  </div>

                  <Button asChild variant="outline" className="w-full rounded-2xl bg-white/70 font-bengali">
                    <Link to={card.to}>
                      {card.actionLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bengali text-xl font-semibold text-foreground">{t("দ্রুত অ্যাকশন", "Quick Actions")}</h3>
            <p className="font-bengali text-sm text-muted-foreground">
              {t("বারবার ব্যবহৃত কাজগুলো group করে রাখা হয়েছে", "Frequently used actions are grouped to reduce scanning")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {quickActionGroups.map((group) => (
            <Card key={group.key} className="rounded-[28px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
              <CardHeader className="space-y-2">
                <CardTitle className="font-bengali text-lg">{group.title}</CardTitle>
                <CardDescription className="font-bengali">{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.items.map((item) => (
                  <Button
                    key={item.key}
                    asChild
                    variant="outline"
                    className="h-auto w-full justify-between rounded-2xl border-border/70 bg-background px-4 py-4 font-bengali"
                  >
                    <Link
                      to={item.to}
                      title={user.role === "manager" ? `Permission: ${item.permissionHint}` : item.label}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.helper}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.26 }}
      >
        <Card className="rounded-[28px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <CardTitle className="font-bengali text-lg">{t("সর্বশেষ আপডেট হিস্টোরি", "Latest Update History")}</CardTitle>
                <CardDescription className="font-bengali">
                  {t("সাম্প্রতিক অ্যাডমিন আপডেট, পরিবর্তন আর লগ এক জায়গায় দেখুন", "Review recent admin updates, changes, and logs in one place")}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground"
                    aria-label={t("হিস্টোরি ডাউনলোড অপশন", "History download options")}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel className="font-bengali">
                    {t("হিস্টোরি ডাউনলোড", "Download history")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {historyFilters.map((filter) => (
                    <DropdownMenuItem
                      key={filter.key}
                      className="font-bengali"
                      onClick={() => handleDownloadHistory(filter.key)}
                    >
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      {filter.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2">
              {historyFilters.map((filter) => (
                <Button
                  key={filter.key}
                  type="button"
                  variant={historyRange === filter.key ? "default" : "outline"}
                  className="rounded-full font-bengali"
                  onClick={() => setHistoryRange(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredHistoryItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-4 py-5">
                <p className="font-bengali text-sm text-muted-foreground">
                  {t("এই রেঞ্জে কোনো আপডেট পাওয়া যায়নি", "No updates were found in this range")}
                </p>
              </div>
            ) : (
              paginatedHistoryItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-bengali text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 font-bengali text-xs leading-5 text-muted-foreground">{item.detail}</p>
                    </div>
                    <Badge variant="secondary" className="w-fit rounded-full font-bengali">
                      {item.module}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">{formatItemTime(item.createdAt, lang)}</p>
                </div>
              ))
            )}

            {filteredHistoryItems.length > HISTORY_ITEMS_PER_PAGE && (
              <div className="space-y-3 pt-2">
                <p className="text-center font-bengali text-xs text-muted-foreground">
                  {t("পৃষ্ঠা", "Page")} {historyPage} / {totalHistoryPages}
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={historyPage === 1}
                        className={historyPage === 1 ? "pointer-events-none opacity-50" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          setHistoryPage((current) => Math.max(1, current - 1));
                        }}
                      />
                    </PaginationItem>

                    {historyPageNumbers.map((page, index) => {
                      const previousPage = historyPageNumbers[index - 1];
                      const showEllipsis = previousPage !== undefined && page - previousPage > 1;

                      return (
                        <Fragment key={page}>
                          {showEllipsis ? (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : null}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              isActive={historyPage === page}
                              onClick={(event) => {
                                event.preventDefault();
                                setHistoryPage(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </Fragment>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        aria-disabled={historyPage === totalHistoryPages}
                        className={historyPage === totalHistoryPages ? "pointer-events-none opacity-50" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          setHistoryPage((current) => Math.min(totalHistoryPages, current + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="grid gap-6 xl:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.34 }}
      >
        <Card className="rounded-[28px] border-border/60 bg-white/95">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("What's New", "What's New")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {whatsNewItems.length === 0 ? (
              <p className="font-bengali text-sm text-muted-foreground">{t("এখনো নতুন আপডেট নেই", "No recent updates yet")}</p>
            ) : (
              whatsNewItems.map((item) => (
                <div key={item.key} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                  <p className="font-bengali text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 font-bengali text-xs text-muted-foreground">{item.detail}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{item.meta}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/60 bg-white/95">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("সাম্প্রতিক নোটিশ", "Latest Notices")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestNotices.length === 0 ? (
              <p className="font-bengali text-sm text-muted-foreground">{t("এখনও কোনো নোটিশ নেই", "No notices yet")}</p>
            ) : (
              latestNotices.map((item) => (
                <div key={item.id ?? item.createdAt} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                  <p className="font-bengali text-sm font-medium text-foreground">{lang === "bn" ? item.titleBn : item.titleEn}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{formatItemTime(item.createdAt, lang)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/60 bg-white/95">
          <CardHeader>
            <CardTitle className="font-bengali text-lg">{t("Pending Queue", "Pending Queue")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QueueBlock
              title={t("রিভিউ অনুমোদন", "Review Approval")}
              items={pendingReviewItems.map((item) => item.name)}
              icon={<BookCopy className="h-4 w-4" />}
            />
            <QueueBlock
              title={t("আসন্ন ইভেন্ট", "Upcoming Events")}
              items={latestEvents.map((item) => (lang === "bn" ? item.titleBn : item.titleEn))}
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <QueueBlock
              title={t("গার্ডিয়ান রিকোয়েস্ট", "Guardian Requests")}
              items={openGuardianRequests.map((item) => item.topic)}
              icon={<BellRing className="h-4 w-4" />}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const MiniEngagementLineChart = ({ points }: { points: EngagementChartPoint[] }) => {
  const width = Math.max(360, points.length * 28);
  const height = 180;
  const max = Math.max(...points.map((point) => Math.max(point.websiteVisitors, point.appOpens)), 1);
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
      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: `${width}px` }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full rounded-2xl bg-muted/30 p-2">
            <motion.polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              points={websiteLinePoints}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              points={appLinePoints}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
            />
            {points.map((point, index) => {
              const x = index * stepX;
              const websiteY = height - (point.websiteVisitors / max) * (height - 20) - 10;
              const appY = height - (point.appOpens / max) * (height - 20) - 10;

              return (
                <g key={`${point.label}-${index}`}>
                  <motion.circle
                    cx={x}
                    cy={websiteY}
                    r="3.5"
                    fill="hsl(var(--primary))"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                  />
                  <motion.circle
                    cx={x}
                    cy={appY}
                    r="3.5"
                    fill="#f59e0b"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 + index * 0.05 }}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

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

      <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-1"
          style={{
            minWidth: `${width}px`,
            gridTemplateColumns: `repeat(${Math.max(points.length, 1)}, minmax(0, 1fr))`,
          }}
        >
          {points.map((point, index) => (
            <motion.div
              key={point.key}
              className="min-w-0 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.5 + index * 0.05 }}
            >
              <p className="font-bengali text-[10px] text-muted-foreground">{point.label}</p>
              <p className="font-display text-[11px] font-semibold text-foreground">
                {point.websiteVisitors}/{point.appOpens}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MiniPieChart = ({ slices }: { slices: { label: string; value: number; color: string }[] }) => {
  const total = Math.max(slices.reduce((sum, item) => sum + item.value, 0), 1);
  let cumulative = 0;

  return (
    <div className="flex items-center justify-center">
      <motion.svg
        viewBox="0 0 42 42"
        className="h-40 w-40"
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
      >
        <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="7" />
        {slices.map((slice, index) => {
          const fraction = (slice.value / total) * 100;
          const currentOffset = -cumulative;
          cumulative += fraction;

          return (
            <motion.circle
              key={slice.label}
              cx="21"
              cy="21"
              r="15.9155"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="7"
              strokeDasharray={`${fraction} ${100 - fraction}`}
              strokeDashoffset={currentOffset}
              transform="rotate(-90 21 21)"
              initial={{ strokeDasharray: `0 ${100}` }}
              animate={{ strokeDasharray: `${fraction} ${100 - fraction}` }}
              transition={{ duration: 1, delay: 0.3 + index * 0.2, ease: "easeOut" }}
            />
          );
        })}
        <motion.text
          x="21"
          y="20"
          textAnchor="middle"
          className="fill-foreground text-[4px] font-semibold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          {total}
        </motion.text>
        <motion.text
          x="21"
          y="25"
          textAnchor="middle"
          className="fill-muted-foreground text-[2.5px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        >
          Total
        </motion.text>
      </motion.svg>
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
}: {
  label: string;
  value: number;
  suffix: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="font-bengali text-sm text-foreground">{label}</span>
      <span className="font-display text-sm font-semibold text-foreground">{`${Math.round(value)}${suffix}`}</span>
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
