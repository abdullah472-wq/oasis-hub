import type { LucideIcon } from "lucide-react";
import {
  Award,
  BellRing,
  BookOpen,
  CalendarDays,
  CalendarCheck2,
  CreditCard,
  FileCheck2,
  FileText,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { getSiteDateInputValue } from "./siteDate";
import { createClientId } from "./uuid";

export type AdminRole = "admin" | "manager" | "guardian";
export type AdminStatus = "pending" | "active" | "inactive";

export const ADMIN_PERMISSION_KEYS = [
  "dashboard.view",
  "news.manage",
  "gallery.manage",
  "events.manage",
  "notices.manage",
  "results.manage",
  "reviews.manage",
  "achievements.manage",
  "teachers.manage",
  "virtualTours.manage",
  "admissions.manage",
  "ramadan.manage",
  "fees.manage",
  "attendance.manage",
  "guardianRequests.manage",
  "managers.manage",
  "settings.manage",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSION_KEYS)[number];

export interface AdminUser {
  uid: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: AdminPermission[];
}

export interface ManagerDraft {
  uid?: string;
  fullName: string;
  email: string;
  password: string;
  role: "manager" | "guardian";
  status: AdminStatus;
  permissions: AdminPermission[];
}

export interface FeeRecord {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  campus: "boys" | "girls" | "both";
  status: "draft" | "published" | "closed";
  note?: string;
  createdAt: number;
}

export interface AttendanceRecord {
  id: string;
  label: string;
  date: string;
  campus: "boys" | "girls" | "both";
  presentCount: number;
  absentCount: number;
  createdAt: number;
}

export interface GuardianRequest {
  id: string;
  guardianUid?: string;
  studentId?: string;
  guardianPhone?: string;
  className?: string;
  section?: string;
  guardianName: string;
  studentName: string;
  topic: string;
  message: string;
  status: "pending" | "in-review" | "resolved";
  createdAt: number;
}

export interface RunningNoticeItem {
  id: string;
  textBn: string;
  textEn: string;
  link?: string;
  publishDate: string;
  priority: number;
  active: boolean;
}

export interface DashboardSettings {
  institutionName: string;
  supportEmail: string;
  supportPhone: string;
  notifyManagersByEmail: boolean;
  admissionsOpen: boolean;
  runningNoticeEnabled: boolean;
  runningNoticeBn: string;
  runningNoticeEn: string;
  runningNotices: RunningNoticeItem[];
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  module: string;
  createdAt: number;
}

export interface SidebarItem {
  key: string;
  labelBn: string;
  labelEn: string;
  path: string;
  permission?: AdminPermission;
  icon: LucideIcon;
  badge?: string;
}

export interface SidebarGroup {
  key: string;
  labelBn: string;
  labelEn: string;
  items: SidebarItem[];
}

const FEES_STORAGE_KEY = "oasis_fee_records_v1";
const ATTENDANCE_STORAGE_KEY = "oasis_attendance_records_v1";
const GUARDIAN_REQUESTS_STORAGE_KEY = "oasis_guardian_requests_v1";
const SETTINGS_STORAGE_KEY = "oasis_dashboard_settings_v1";
const ACTIVITY_STORAGE_KEY = "oasis_admin_activity_v1";

export const permissionCatalog: Array<{
  groupKey: string;
  groupLabelBn: string;
  groupLabelEn: string;
  items: Array<{ key: AdminPermission; labelBn: string; labelEn: string }>;
}> = [
  {
    groupKey: "overview",
    groupLabelBn: "ওভারভিউ",
    groupLabelEn: "Overview",
    items: [{ key: "dashboard.view", labelBn: "ড্যাশবোর্ড", labelEn: "Dashboard" }],
  },
  {
    groupKey: "content",
    groupLabelBn: "কনটেন্ট ম্যানেজমেন্ট",
    groupLabelEn: "Content Management",
    items: [
      { key: "news.manage", labelBn: "সংবাদ", labelEn: "News" },
      { key: "gallery.manage", labelBn: "গ্যালারি", labelEn: "Gallery" },
      { key: "events.manage", labelBn: "ইভেন্ট", labelEn: "Events" },
      { key: "notices.manage", labelBn: "নোটিশ", labelEn: "Notices" },
      { key: "results.manage", labelBn: "ফলাফল", labelEn: "Results" },
      { key: "reviews.manage", labelBn: "রিভিউ", labelEn: "Reviews" },
      { key: "achievements.manage", labelBn: "অর্জন", labelEn: "Achievements" },
      { key: "teachers.manage", labelBn: "শিক্ষক", labelEn: "Teachers" },
      { key: "virtualTours.manage", labelBn: "ভার্চুয়াল ট্যুর", labelEn: "Virtual Tours" },
      { key: "admissions.manage", labelBn: "ভর্তি", labelEn: "Admissions" },
      { key: "ramadan.manage", labelBn: "রমাদান", labelEn: "Ramadan" },
    ],
  },
  {
    groupKey: "operations",
    groupLabelBn: "অপারেশনস",
    groupLabelEn: "Operations",
    items: [
      { key: "fees.manage", labelBn: "ফি", labelEn: "Fees" },
      { key: "attendance.manage", labelBn: "উপস্থিতি", labelEn: "Attendance" },
      { key: "guardianRequests.manage", labelBn: "গার্ডিয়ান রিকোয়েস্ট", labelEn: "Guardian Requests" },
    ],
  },
  {
    groupKey: "users",
    groupLabelBn: "ইউজার ম্যানেজমেন্ট",
    groupLabelEn: "User Management",
    items: [
      { key: "managers.manage", labelBn: "ম্যানেজারস", labelEn: "Managers" },
      { key: "settings.manage", labelBn: "সেটিংস", labelEn: "Settings" },
    ],
  },
];

export const sidebarGroups: SidebarGroup[] = [
  {
    key: "overview",
    labelBn: "ওভারভিউ",
    labelEn: "Overview",
    items: [
      { key: "dashboard", labelBn: "ড্যাশবোর্ড", labelEn: "Dashboard", path: "/admin/dashboard", permission: "dashboard.view", icon: LayoutDashboard },
    ],
  },
  {
    key: "content",
    labelBn: "কনটেন্ট ম্যানেজমেন্ট",
    labelEn: "Content Management",
    items: [
      { key: "news", labelBn: "সংবাদ", labelEn: "News", path: "/admin/news", permission: "news.manage", icon: FileText },
      { key: "gallery", labelBn: "গ্যালারি", labelEn: "Gallery", path: "/admin/gallery", permission: "gallery.manage", icon: ImageIcon },
      { key: "events", labelBn: "ইভেন্ট", labelEn: "Events", path: "/admin/events", permission: "events.manage", icon: CalendarDays },
      { key: "notices", labelBn: "নোটিশ", labelEn: "Notices", path: "/admin/notices", permission: "notices.manage", icon: BellRing },
      { key: "results", labelBn: "ফলাফল", labelEn: "Results", path: "/admin/results", permission: "results.manage", icon: FileCheck2 },
      { key: "reviews", labelBn: "রিভিউ", labelEn: "Reviews", path: "/admin/reviews", permission: "reviews.manage", icon: MessageSquareQuote },
      { key: "achievements", labelBn: "অর্জন", labelEn: "Achievements", path: "/admin/achievements", permission: "achievements.manage", icon: Award },
      { key: "teachers", labelBn: "শিক্ষক", labelEn: "Teachers", path: "/admin/teachers", permission: "teachers.manage", icon: GraduationCap },
      { key: "virtual-tours", labelBn: "ভার্চুয়াল ট্যুর", labelEn: "Virtual Tours", path: "/admin/virtual-tours", permission: "virtualTours.manage", icon: Video },
      { key: "admissions", labelBn: "ভর্তি", labelEn: "Admissions", path: "/admin/admissions", permission: "admissions.manage", icon: BookOpen },
      { key: "ramadan", labelBn: "রমাদান", labelEn: "Ramadan", path: "/admin/ramadan", permission: "ramadan.manage", icon: CalendarDays },
    ],
  },
  {
    key: "operations",
    labelBn: "অপারেশনস",
    labelEn: "Operations",
    items: [
      { key: "fees", labelBn: "ফি", labelEn: "Fees", path: "/admin/fees", permission: "fees.manage", icon: CreditCard },
      { key: "students", labelBn: "শিক্ষার্থী তালিকা", labelEn: "Student List", path: "/admin/students", permission: "attendance.manage", icon: Users },
      { key: "mobile-notifications", labelBn: "মোবাইল নোটিফিকেশন", labelEn: "Mobile Notifications", path: "/admin/mobile-notifications", permission: "notices.manage", icon: BellRing },
      { key: "attendance", labelBn: "উপস্থিতি", labelEn: "Attendance", path: "/admin/attendance", permission: "attendance.manage", icon: CalendarCheck2 },
      { key: "guardian-requests", labelBn: "গার্ডিয়ান রিকোয়েস্ট", labelEn: "Guardian Requests", path: "/admin/guardian-requests", permission: "guardianRequests.manage", icon: MessageSquare },
    ],
  },
  {
    key: "users",
    labelBn: "ইউজার ম্যানেজমেন্ট",
    labelEn: "User Management",
    items: [
      { key: "managers", labelBn: "ম্যানেজারস", labelEn: "Managers", path: "/admin/managers", permission: "managers.manage", icon: ShieldCheck },
    ],
  },
  {
    key: "system",
    labelBn: "সিস্টেম",
    labelEn: "System",
    items: [
      { key: "settings", labelBn: "সেটিংস", labelEn: "Settings", path: "/admin/settings", permission: "settings.manage", icon: Settings },
      { key: "logout", labelBn: "লগআউট", labelEn: "Logout", path: "/admin/logout", icon: FileText },
    ],
  },
];

export const createAdminUser = (): AdminUser => ({
  uid: "admin-root",
  fullName: "সুপার অ্যাডমিন",
  email: "admin@annoor.local",
  role: "admin",
  status: "active",
  permissions: [...ADMIN_PERMISSION_KEYS],
});

export const canAccessPermission = (user: AdminUser | null, permission?: AdminPermission): boolean => {
  if (!user || user.status !== "active") return false;
  if (user.role === "admin") return true;
  if (!permission) return true;
  return user.permissions.includes(permission);
};

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

const createDefaultRunningNotices = (): RunningNoticeItem[] => [
  {
    id: createClientId(),
    textBn: "ভর্তি চলছে ২০২৬ শিক্ষাবর্ষের জন্য। বিস্তারিত জানতে অফিসে যোগাযোগ করুন।",
    textEn: "Admissions are now open for the 2026 academic year. Contact the office for details.",
    link: "/admission",
    publishDate: getSiteDateInputValue(),
    priority: 1,
    active: true,
  },
];

const normalizeDashboardSettings = (settings: DashboardSettings): DashboardSettings => {
  const fallbackItems = settings.runningNotices?.length
    ? settings.runningNotices
    : settings.runningNoticeBn || settings.runningNoticeEn
      ? [
          {
            id: createClientId(),
            textBn: settings.runningNoticeBn,
            textEn: settings.runningNoticeEn,
            link: "",
            publishDate: getSiteDateInputValue(),
            priority: 1,
            active: true,
          },
        ]
      : createDefaultRunningNotices();

  return {
    ...settings,
    runningNotices: fallbackItems.map((item, index) => ({
      id: item.id || createClientId(),
      textBn: item.textBn || "",
      textEn: item.textEn || "",
      link: item.link || "",
      publishDate: item.publishDate || getSiteDateInputValue(),
      priority: typeof item.priority === "number" ? item.priority : index + 1,
      active: item.active ?? true,
    })),
  };
};

export const createManagerDraft = (): ManagerDraft => ({
  fullName: "",
  email: "",
  password: "",
  role: "manager",
  status: "active",
  permissions: ["dashboard.view", "notices.manage"],
});

export const getFeeRecords = (): FeeRecord[] =>
  readStorage<FeeRecord[]>(FEES_STORAGE_KEY, [
    {
      id: createClientId(),
      title: "এপ্রিল মাসিক বেতন",
      amount: 1800,
      dueDate: new Date().toISOString().slice(0, 10),
      campus: "both",
      status: "published",
      note: "সব শ্রেণির জন্য প্রযোজ্য",
      createdAt: Date.now() - 86_400_000,
    },
  ]);

export const saveFeeRecords = (records: FeeRecord[]) => writeStorage(FEES_STORAGE_KEY, records);

export const getAttendanceRecords = (): AttendanceRecord[] =>
  readStorage<AttendanceRecord[]>(ATTENDANCE_STORAGE_KEY, [
    {
      id: createClientId(),
      label: "আজকের উপস্থিতি",
      date: new Date().toISOString().slice(0, 10),
      campus: "both",
      presentCount: 428,
      absentCount: 23,
      createdAt: Date.now() - 3_600_000,
    },
  ]);

export const saveAttendanceRecords = (records: AttendanceRecord[]) => writeStorage(ATTENDANCE_STORAGE_KEY, records);

export const getGuardianRequests = (): GuardianRequest[] =>
  readStorage<GuardianRequest[]>(GUARDIAN_REQUESTS_STORAGE_KEY, [
    {
      id: createClientId(),
      guardianName: "মোঃ রহমান",
      studentName: "আব্দুল্লাহ",
      topic: "বকেয়া বেতন",
      message: "বকেয়া ফি কিস্তিতে দেওয়ার সুযোগ চাই।",
      status: "pending",
      createdAt: Date.now() - 7_200_000,
    },
    {
      id: createClientId(),
      guardianName: "ফাতেমা বেগম",
      studentName: "আয়েশা",
      topic: "ফলাফল কপি",
      message: "বার্ষিক ফলাফলের পিডিএফ কপি প্রয়োজন।",
      status: "in-review",
      createdAt: Date.now() - 172_800_000,
    },
  ]);

export const saveGuardianRequests = (records: GuardianRequest[]) => writeStorage(GUARDIAN_REQUESTS_STORAGE_KEY, records);

export const getDashboardSettings = (): DashboardSettings =>
  normalizeDashboardSettings(readStorage<DashboardSettings>(SETTINGS_STORAGE_KEY, {
    institutionName: "আননূর শিক্ষা পরিবার",
    supportEmail: "support@annoor.local",
    supportPhone: "01820-811511",
    notifyManagersByEmail: true,
    admissionsOpen: true,
    runningNoticeEnabled: true,
    runningNoticeBn: "ভর্তি চলছে ২০২৬ শিক্ষাবর্ষের জন্য। বিস্তারিত জানতে অফিসে যোগাযোগ করুন।",
    runningNoticeEn: "Admissions are now open for the 2026 academic year. Contact the office for details.",
    runningNotices: createDefaultRunningNotices(),
  }));

export const saveDashboardSettings = (settings: DashboardSettings) => {
  const normalized = normalizeDashboardSettings(settings);
  writeStorage(SETTINGS_STORAGE_KEY, normalized);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dashboard-settings-updated", { detail: normalized }));
  }
};

export const getActivityFeed = (): ActivityItem[] => readStorage<ActivityItem[]>(ACTIVITY_STORAGE_KEY, []);

export const logActivity = (item: Omit<ActivityItem, "id" | "createdAt">) => {
  const nextActivity = [
    {
      ...item,
      id: createClientId(),
      createdAt: Date.now(),
    },
    ...getActivityFeed(),
  ].slice(0, 12);

  writeStorage(ACTIVITY_STORAGE_KEY, nextActivity);
};

export const getDefaultRouteForUser = (user: AdminUser | null): string => {
  if (!user) return "/admin";
  if (user.role === "guardian") return "/guardian";
  if (user.role === "admin") return "/admin/dashboard";

  const firstAllowed = sidebarGroups
    .flatMap((group) => group.items)
    .find((item) => item.key !== "logout" && canAccessPermission(user, item.permission));

  return firstAllowed?.path ?? "/admin/dashboard";
};

export const findSidebarItem = (path: string): SidebarItem | undefined =>
  sidebarGroups.flatMap((group) => group.items).find((item) => path.startsWith(item.path));
