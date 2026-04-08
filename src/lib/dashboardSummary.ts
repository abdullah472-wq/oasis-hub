import type { ActivityItem, Event, Notice, Review } from "@/lib/adminDashboard";
import type { AdminUser } from "@/lib/adminDashboard";

interface DashboardSummaryPayload {
  user: AdminUser;
  stats: {
    totalNews: number;
    totalNotices: number;
    pendingReviews: number;
    activeManagers: number;
  };
  notices: Notice[];
  events: Event[];
  reviews: Review[];
  activityFeed: ActivityItem[];
  t: (bn: string, en: string) => string;
  lang: "bn" | "en";
}

const formatDateTime = (lang: "bn" | "en") =>
  new Date().toLocaleString(lang === "bn" ? "bn-BD" : "en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const createSection = (title: string, lines: string[]) => ["", title, ...lines].join("\n");

export const buildDashboardSummaryText = ({ user, stats, notices, events, reviews, activityFeed, t, lang }: DashboardSummaryPayload) => {
  const pendingReviews = reviews.filter((item) => !item.approved).slice(0, 5);
  const latestNotices = notices.slice(0, 5);
  const latestEvents = events.slice(0, 5);
  const latestActivity = activityFeed.slice(0, 6);

  const lines = [
    t("আননূর ড্যাশবোর্ড সামারি", "Annoor Dashboard Summary"),
    `${t("ডাউনলোড সময়", "Downloaded at")}: ${formatDateTime(lang)}`,
    `${t("রিপোর্ট প্রস্তুত করেছেন", "Prepared by")}: ${user.fullName} (${user.role})`,
    createSection(t("মূল পরিসংখ্যান", "Key Statistics"), [
      `- ${t("প্রকাশিত সংবাদ", "Published News")}: ${stats.totalNews}`,
      `- ${t("লাইভ নোটিশ", "Live Notices")}: ${stats.totalNotices}`,
      `- ${t("অপেক্ষমান রিভিউ", "Pending Reviews")}: ${stats.pendingReviews}`,
      `- ${t("সক্রিয় ম্যানেজার", "Active Managers")}: ${stats.activeManagers}`,
    ]),
    createSection(
      t("সাম্প্রতিক নোটিশ", "Latest Notices"),
      latestNotices.length === 0
        ? [`- ${t("কোনো নোটিশ নেই", "No notices found")}`]
        : latestNotices.map((item) => `- ${item.titleBn}`),
    ),
    createSection(
      t("আসন্ন ইভেন্ট", "Upcoming Events"),
      latestEvents.length === 0
        ? [`- ${t("কোনো ইভেন্ট নেই", "No events found")}`]
        : latestEvents.map((item) => `- ${item.titleBn} (${item.startDate})`),
    ),
    createSection(
      t("অপেক্ষমান রিভিউ", "Pending Reviews"),
      pendingReviews.length === 0
        ? [`- ${t("কোনো অপেক্ষমান রিভিউ নেই", "No pending reviews")}`]
        : pendingReviews.map((item) => `- ${item.name}`),
    ),
    createSection(
      t("সাম্প্রতিক কার্যক্রম", "Recent Activity"),
      latestActivity.length === 0
        ? [`- ${t("কোনো কার্যক্রম লগ নেই", "No activity logged")}`]
        : latestActivity.map((item) => `- ${item.title} • ${item.detail}`),
    ),
  ];

  return lines.join("\n");
};

export const downloadDashboardSummary = (text: string) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `dashboard-summary-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
