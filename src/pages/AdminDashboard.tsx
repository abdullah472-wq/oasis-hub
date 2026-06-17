import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ensureAdminAuthSession, isAdminEnabled, validateAdminPassword } from "@/lib/admin";
import AdminLayout, { type AdminNotificationItem, type AdminTodoItem } from "@/components/admin/AdminLayout";
import PermissionGuard from "@/components/admin/PermissionGuard";
import DashboardOverview from "@/components/admin/DashboardOverview";
import ManagersPage from "@/components/admin/ManagersPage";
import {
  canAccessPermission,
  findSidebarItem,
  getDefaultRouteForUser,
  getStoredSession,
  saveSession,
  sidebarGroups,
  type AdminUser,
} from "@/lib/adminDashboard";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AchievementsManagerPage,
  EventsManagerPage,
  GalleryManagerPage,
  NewsManagerPage,
  NoticesManagerPage,
  ReviewsManagerPage,
} from "@/components/admin/AdminContentPages";
import ResultsManagerPage from "@/components/admin/results/ResultsManagerPage";
import ResultDashboard from "@/components/admin/results/ResultDashboard";
import MarksEntryPage from "@/components/admin/results/MarksEntryPage";
import ExamManagerPage from "@/components/admin/results/ExamManagerPage";
import MeritListPage from "@/components/admin/results/MeritListPage";
import GradingSystemPage from "@/components/admin/results/GradingSystemPage";
import SubjectDashboard from "@/components/admin/results/SubjectDashboard";
import SubjectManagerPage from "@/components/admin/results/SubjectManagerPage";
import SubjectGroupsPage from "@/components/admin/results/SubjectGroupsPage";
import ClassSubjectsManagerPage from "@/components/admin/results/ClassSubjectsManagerPage";
import ClassRoutineManagerPage from "@/components/admin/classRoutine/ClassRoutineManagerPage";
import {
  AdmissionsManagerPage,
  GuardianRequestsPage,
  MobileNotificationsPage,
  SettingsPage,
  StudentListPage,
  TeachersManagerPage,
  VirtualToursManagerPage,
} from "@/components/admin/AdminOperationsPages";
import AttendancePage from "@/components/admin/attendance/AttendancePage";
import RamadanManagerPage from "@/components/admin/ramadan/RamadanManagerPage";
import AccountingPage from "@/components/admin/accounting/AccountingPage";

const TODO_STORAGE_KEY = "oasis_admin_dashboard_todos_v1";
const LAST_LOGIN_STORAGE_KEY = "oasis_admin_last_login_at_v1";

const normalizeTodoItem = (item: Partial<AdminTodoItem>, index: number): AdminTodoItem => ({
  id: typeof item.id === "string" && item.id ? item.id : `todo-${Date.now()}-${index}`,
  text: typeof item.text === "string" ? item.text : "",
  completed: Boolean(item.completed),
  createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now() - index,
  visibility: item.visibility === "public" ? "public" : "personal",
  ownerUid: typeof item.ownerUid === "string" && item.ownerUid ? item.ownerUid : "admin-root",
  ownerName: typeof item.ownerName === "string" && item.ownerName ? item.ownerName : "Legacy admin",
});

const readTodoStorage = (): AdminTodoItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<AdminTodoItem>[];
    return Array.isArray(parsed) ? parsed.map(normalizeTodoItem).filter((item) => item.text.trim().length > 0) : [];
  } catch {
    return [];
  }
};

const readLastLoginStorage = () => {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(LAST_LOGIN_STORAGE_KEY);
  const parsed = Number(raw || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const moduleRoutes: Record<string, string> = {
  news: "/admin/news",
  notices: "/admin/notices",
  results: "/admin/results",
  "marks-entry": "/admin/marks-entry",
  exams: "/admin/exams",
  "merit-list": "/admin/merit-list",
  "grading-system": "/admin/grading-system",
  "result-dashboard": "/admin/results/dashboard",
  "subject-dashboard": "/admin/subject-dashboard",
  subjects: "/admin/subjects",
  "subject-groups": "/admin/subject-groups",
  "class-subjects": "/admin/class-subjects",
  accounting: "/admin/accounting",
  fees: "/admin/accounting/fees",
  reviews: "/admin/reviews",
  achievements: "/admin/achievements",
  teachers: "/admin/teachers",
  admissions: "/admin/admissions",
  guardianRequests: "/admin/guardian-requests",
  "mobile-notifications": "/admin/mobile-notifications",
  managers: "/admin/managers",
  ramadan: "/admin/ramadan",
  settings: "/admin/settings",
};

const normalizeAdminPath = (pathname: string) => {
  if (!pathname) return "/admin";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "");
  }
  return pathname;
};

const AdminDashboardPage = () => {
  const { t } = useLanguage();
  const { currentUser: authUser, login: loginManager, logout: logoutManager, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [localAdminSession, setLocalAdminSession] = useState<AdminUser | null>(() => getStoredSession());
  const [role, setRole] = useState<"admin" | "manager">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [todoDraft, setTodoDraft] = useState("");
  const [todos, setTodos] = useState<AdminTodoItem[]>(() => readTodoStorage());
  const [todoVisibility, setTodoVisibility] = useState<"public" | "personal">("personal");
  const [, setLastLoginAt] = useState(() => readLastLoginStorage());
  const currentUser = localAdminSession ?? (authUser && authUser.role !== "guardian" ? authUser : null);
  const data = useAdminDashboardData(Boolean(currentUser) && !authLoading);
  const normalizedPathname = normalizeAdminPath(location.pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (!currentUser) return;
    if (normalizedPathname === "/admin") {
      navigate(getDefaultRouteForUser(currentUser), { replace: true });
    }
  }, [currentUser, navigate, normalizedPathname]);

  useEffect(() => {
    if (normalizedPathname === "/admin/logout") {
      saveSession(null);
      setLocalAdminSession(null);
      setPassword("");
      setEmail("");
      void logoutManager().catch(() => undefined);
      navigate("/admin", { replace: true });
    }
  }, [logoutManager, navigate, normalizedPathname]);

  useEffect(() => {
    if (normalizedPathname === "/admin/fees") {
      navigate("/admin/accounting/fees", { replace: true });
    }
  }, [navigate, normalizedPathname]);

  const handleLogout = () => {
    saveSession(null);
    setLocalAdminSession(null);
    setPassword("");
    setEmail("");
    void logoutManager().catch(() => undefined);
    navigate("/admin", { replace: true });
  };

  const handleAddTodo = () => {
    const trimmed = todoDraft.trim();
    if (!trimmed || !currentUser) return;

    setTodos((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
        visibility: todoVisibility,
        ownerUid: currentUser.uid,
        ownerName: currentUser.fullName,
      },
      ...current,
    ]);
    setTodoDraft("");
  };

  const handleToggleTodo = (id: string) => {
    setTodos((current) => current.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const handleRemoveTodo = (id: string) => {
    setTodos((current) => current.filter((item) => item.id !== id));
  };

  const visibleTodos = useMemo(() => {
    if (!currentUser) return [];
    return todos.filter((item) => item.visibility === "public" || item.ownerUid === currentUser.uid);
  }, [currentUser, todos]);

  const accessibleSidebarGroups = useMemo(() => {
    if (!currentUser) return sidebarGroups;

    return sidebarGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.key === "logout" || canAccessPermission(currentUser, item.permission)),
      }))
      .filter((group) => group.items.length > 0);
  }, [currentUser]);

  const notificationCount =
    data.dashboardStats.pendingAdmissions +
    data.dashboardStats.pendingGuardianRequests +
    data.dashboardStats.pendingReviews;

  const badgeMap = useMemo(
    () => ({
      admissions: data.dashboardStats.pendingAdmissions,
      reviews: data.dashboardStats.pendingReviews,
      "guardian-requests": data.dashboardStats.pendingGuardianRequests,
      "mobile-notifications": notificationCount,
    }),
    [
      data.dashboardStats.pendingAdmissions,
      data.dashboardStats.pendingGuardianRequests,
      data.dashboardStats.pendingReviews,
      notificationCount,
    ],
  );

  const filteredGroups = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    return accessibleSidebarGroups
      .map((group) => {
        const nextItems = group.items
          .map((item) => {
            const accessibleChildren = item.children?.filter((child) => canAccessPermission(currentUser, child.permission));
            const childEntries = accessibleChildren?.map((child) => ({
              child,
              matches: [child.labelBn, child.labelEn, child.key]
                .map((value) => String(value || "").toLowerCase())
                .some((value) => value.includes(term)),
            }));
            const parentMatches =
              !term ||
              [item.labelBn, item.labelEn, item.key]
                .map((value) => String(value || "").toLowerCase())
                .some((value) => value.includes(term));
            const childItems = !term || parentMatches ? accessibleChildren : childEntries?.filter((entry) => entry.matches).map((entry) => entry.child);
            const itemMatches = !term || parentMatches || Boolean(childItems?.length);

            if (!itemMatches) return null;

            const badgeValue = badgeMap[item.key as keyof typeof badgeMap];

            return {
              ...item,
              badge: badgeValue && badgeValue > 0 ? String(badgeValue) : undefined,
              children: childItems,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        return { ...group, items: nextItems };
      })
      .filter((group) => group.items.length > 0);
  }, [accessibleSidebarGroups, badgeMap, currentUser, searchValue]);

  const currentItem = findSidebarItem(normalizedPathname);
  const currentGroup = accessibleSidebarGroups.find((group) => group.items.some((item) => item.key === currentItem?.key));
  const pageTitle = currentItem ? t(currentItem.labelBn, currentItem.labelEn) : t("ড্যাশবোর্ড", "Dashboard");
  const sectionLabel = currentGroup ? t(currentGroup.labelBn, currentGroup.labelEn) : t("ওভারভিউ", "Overview");

  const notifications = useMemo<AdminNotificationItem[]>(() => {
    const items: AdminNotificationItem[] = [];

    if (currentUser && canAccessPermission(currentUser, "admissions.manage") && data.dashboardStats.pendingAdmissions > 0) {
      const latestAdmission = data.admissions.find((item) => item.status === "pending");
      items.push({
        id: "pending-admissions",
        title: t(
          `${data.dashboardStats.pendingAdmissions}টি ভর্তি আবেদন অপেক্ষমাণ`,
          `${data.dashboardStats.pendingAdmissions} admissions need review`,
        ),
        detail: latestAdmission
          ? t(`সর্বশেষ: ${latestAdmission.studentNameBn || latestAdmission.studentName}`, `Latest: ${latestAdmission.studentName}`)
          : t("নতুন আবেদনগুলো যাচাই করুন", "Review the latest applications"),
        href: "/admin/admissions",
        createdAt: latestAdmission?.createdAt ?? Date.now(),
        tone: "high",
      });
    }

    if (currentUser && canAccessPermission(currentUser, "reviews.manage") && data.dashboardStats.pendingReviews > 0) {
      const latestReview = data.reviews.find((item) => !item.approved);
      items.push({
        id: "pending-reviews",
        title: t(
          `${data.dashboardStats.pendingReviews}টি রিভিউ অপেক্ষমাণ`,
          `${data.dashboardStats.pendingReviews} reviews are waiting`,
        ),
        detail: latestReview
          ? t(`সর্বশেষ: ${latestReview.name}`, `Latest from ${latestReview.name}`)
          : t("নতুন রিভিউগুলো অনুমোদন দিন", "Approve the latest reviews"),
        href: "/admin/reviews",
        createdAt: latestReview?.createdAt ?? Date.now(),
        tone: "high",
      });
    }

    if (currentUser && canAccessPermission(currentUser, "guardianRequests.manage") && data.dashboardStats.pendingGuardianRequests > 0) {
      const latestRequest = data.guardianRequests.find((item) => item.status !== "resolved");
      items.push({
        id: "pending-guardian-requests",
        title: t(
          `${data.dashboardStats.pendingGuardianRequests}টি গার্ডিয়ান রিকোয়েস্ট খোলা আছে`,
          `${data.dashboardStats.pendingGuardianRequests} guardian requests are open`,
        ),
        detail: latestRequest
          ? t(`সর্বশেষ: ${latestRequest.topic}`, `Latest: ${latestRequest.topic}`)
          : t("অভিভাবক সাপোর্ট কিউ চেক করুন", "Check the guardian support queue"),
        href: "/admin/guardian-requests",
        createdAt: latestRequest?.createdAt ?? Date.now(),
        tone: "high",
      });
    }

    data.activityFeed.slice(0, 3).forEach((item) => {
      items.push({
        id: item.id,
        title: item.title,
        detail: item.detail,
        href: moduleRoutes[item.module],
        createdAt: item.createdAt,
        tone: "muted",
      });
    });

    return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  }, [
    currentUser,
    data.activityFeed,
    data.admissions,
    data.dashboardStats.pendingAdmissions,
    data.dashboardStats.pendingGuardianRequests,
    data.dashboardStats.pendingReviews,
    data.guardianRequests,
    data.reviews,
    t,
  ]);

  const renderCurrentPage = () => {
    const renderAccountingPage = (initialTab?: "dashboard" | "accounts" | "journal" | "donations" | "banks" | "fees") => (
      <AccountingPage
        initialTab={initialTab}
        accounts={data.accounts}
        journals={data.journals}
        donations={data.donations}
        bankAccounts={data.bankAccounts}
        feeEntries={data.feeEntries}
        feeStudents={data.feeStudents}
        budgets={[]}
        onSaveAccount={data.actions.saveAccountItem}
        onDeleteAccount={data.actions.deleteAccountItem}
        onSaveJournal={data.actions.saveJournalItem}
        onDeleteJournal={data.actions.deleteJournalItem}
        onUpdateJournalStatus={data.actions.updateJournalStatusItem}
        onSaveDonation={data.actions.saveDonationItem}
        onSaveBank={data.actions.saveBankItem}
        onDeleteBank={data.actions.deleteBankItem}
        onCreateFeeBatch={data.actions.addFeeBatchItems}
        onCreateFeeBulk={data.actions.addFeeBulkBatchItems}
        onUpdateFeeEntry={data.actions.updateFeeEntryItem}
        onUpdateFeePayment={data.actions.updateFeePaymentItem}
        onDeleteFeeEntry={data.actions.removeFeeEntryItem}
      />
    );

    switch (normalizedPathname) {
      case "/admin/dashboard":
        return (
          <DashboardOverview
            user={currentUser!}
            stats={data.dashboardStats}
            notices={data.notices}
            events={data.events}
            admissions={data.admissions}
            guardianRequests={data.guardianRequests}
            reviews={data.reviews}
            activityFeed={data.activityFeed}
            dailyEngagement={data.dailyEngagement}
          />
        );
      case "/admin/news":
        return <NewsManagerPage items={data.newsPosts} onSave={data.actions.saveNewsItem} onDelete={data.actions.removeNews} />;
      case "/admin/gallery":
        return <GalleryManagerPage items={data.galleryImages} onCreate={data.actions.addGalleryItem} onDelete={data.actions.removeGalleryItem} />;
      case "/admin/events":
        return <EventsManagerPage items={data.events} onCreate={data.actions.addEventItem} onDelete={data.actions.removeEventItem} />;
      case "/admin/notices":
        return (
          <NoticesManagerPage
            items={data.notices}
            onCreate={data.actions.addNoticeItem}
            onDelete={data.actions.removeNoticeItem}
            noticeSettings={data.runningNoticeSettings}
            onSaveNoticeSettings={data.actions.saveRunningNoticeSettingsItem}
          />
        );
      case "/admin/results/dashboard":
        return <ResultDashboard items={data.results} />;
      case "/admin/results":
        return (
          <ResultsManagerPage
            items={data.results}
            students={data.attendanceStudents}
            classSubjectConfigs={data.classSubjectConfigs}
            onCreate={data.actions.addResultItem}
            onCreateBatch={data.actions.addResultBatchItems}
            onDelete={data.actions.removeResultItem}
          />
        );
      case "/admin/marks-entry":
        return (
          <MarksEntryPage
            items={data.results}
            students={data.attendanceStudents}
            classSubjectConfigs={data.classSubjectConfigs}
            onCreate={data.actions.addResultItem}
            onCreateBatch={data.actions.addResultBatchItems}
          />
        );
      case "/admin/exams":
        return (
          <ExamManagerPage
            exams={data.exams}
            onSave={data.actions.saveExamItem}
            onDelete={data.actions.removeExamItem}
            onUpdateStatus={data.actions.updateExamStatusItem}
          />
        );
      case "/admin/merit-list":
        return <MeritListPage items={data.results} />;
      case "/admin/grading-system":
        return (
          <GradingSystemPage
            systems={data.gradingSystems}
            onSave={data.actions.saveGradingSystemItem}
            onDelete={data.actions.removeGradingSystemItem}
          />
        );
      case "/admin/subject-dashboard":
        return (
          <SubjectDashboard
            subjects={data.subjects}
            subjectGroups={data.subjectGroups}
            classConfigs={data.classSubjectConfigs}
          />
        );
      case "/admin/subjects":
        return (
          <SubjectManagerPage
            subjects={data.subjects}
            subjectGroups={data.subjectGroups}
            onSave={data.actions.saveSubjectItem}
            onDelete={data.actions.deleteSubjectItem}
            onUpdateStatus={data.actions.updateSubjectStatusItem}
            onUpdateOrder={data.actions.updateSubjectOrderItem}
          />
        );
      case "/admin/subject-groups":
        return (
          <SubjectGroupsPage
            groups={data.subjectGroups}
            onSave={data.actions.saveSubjectGroupItem}
            onDelete={data.actions.deleteSubjectGroupItem}
          />
        );
      case "/admin/class-subjects":
        return (
          <ClassSubjectsManagerPage
            configs={data.classSubjectConfigs}
            subjects={data.subjects}
            subjectGroups={data.subjectGroups}
            onSave={data.actions.saveClassSubjectConfigItem}
            onDelete={data.actions.removeClassSubjectConfigItem}
          />
        );
      case "/admin/class-routine":
        return (
          <ClassRoutineManagerPage
            configs={data.classRoutineConfigs}
            onSave={data.actions.saveClassRoutineConfigItem}
            onDelete={data.actions.removeClassRoutineConfigItem}
          />
        );
      case "/admin/reviews":
        return <ReviewsManagerPage items={data.reviews} onApprove={data.actions.approveReviewItem} onDelete={data.actions.removeReviewItem} />;
      case "/admin/achievements":
        return <AchievementsManagerPage items={data.achievements} onCreate={data.actions.addAchievementItem} onDelete={data.actions.removeAchievementItem} />;
      case "/admin/teachers":
        return <TeachersManagerPage items={data.teachers} onCreate={data.actions.addTeacherItem} onDelete={data.actions.removeTeacherItem} />;
      case "/admin/virtual-tours":
        return <VirtualToursManagerPage items={data.virtualTours} onCreate={data.actions.addVirtualTourItem} onDelete={data.actions.removeVirtualTourItem} />;
      case "/admin/admissions":
        return (
          <AdmissionsManagerPage
            items={data.admissions}
            onSaveStatus={data.actions.saveAdmissionStatusItem}
            onDelete={data.actions.removeAdmissionItem}
          />
        );
      case "/admin/accounting":
        return renderAccountingPage();
      case "/admin/accounting/fees":
        return renderAccountingPage("fees");
      case "/admin/accounting/accounts":
        return renderAccountingPage("accounts");
      case "/admin/accounting/journal":
        return renderAccountingPage("journal");
      case "/admin/accounting/donations":
        return renderAccountingPage("donations");
      case "/admin/accounting/banks":
        return renderAccountingPage("banks");
      case "/admin/students":
        return (
          <StudentListPage
            students={data.attendanceStudents}
            onUpdate={data.actions.updateStudentItem}
            onDelete={data.actions.removeStudentItem}
          />
        );
      case "/admin/mobile-notifications":
        return (
          <MobileNotificationsPage
            items={data.mobileNotifications}
            students={data.attendanceStudents}
            onCreate={data.actions.sendMobileNotificationItem}
            onDelete={data.actions.removeMobileNotificationItem}
          />
        );
      case "/admin/attendance":
        return <AttendancePage students={data.attendanceStudents} records={data.attendanceRecords} onSaveSheet={data.actions.saveAttendanceSheetItems} />;
      case "/admin/guardian-requests":
        return (
          <GuardianRequestsPage
            items={data.guardianRequests}
            onSave={data.actions.saveGuardianRequestItem}
            onCreateGuardianAccount={data.actions.createGuardianAccountItem}
            onDelete={data.actions.removeGuardianRequestItem}
          />
        );
      case "/admin/managers":
        return <ManagersPage managers={data.managers} onSave={data.actions.saveManagerItem} onDelete={data.actions.removeManagerItem} />;
      case "/admin/ramadan":
        return (
          <RamadanManagerPage
            settings={data.ramadanSettings}
            requests={data.ramadanRequests}
            onSaveSettings={data.actions.saveRamadanSettingsItem}
            onSaveRequest={data.actions.saveRamadanRequestItem}
            onDeleteRequest={data.actions.removeRamadanRequestItem}
          />
        );
      case "/admin/settings":
        return (
          <SettingsPage
            settings={data.settings}
            appDownloadSettings={data.appDownloadSettings}
            onSave={data.actions.saveSettingsItem}
            onSaveAppDownloadSettings={data.actions.saveAppDownloadSettingsItem}
          />
        );
      default:
        return (
          <Card className="rounded-3xl border-border/60 bg-white/95">
            <CardContent className="space-y-3 p-10 text-center">
              <p className="font-bengali text-lg font-semibold">{t("এই পেজটি পাওয়া যায়নি", "This page was not found")}</p>
              <Link to={getDefaultRouteForUser(currentUser!)}>
                <Button className="rounded-2xl font-bengali">{t("ড্যাশবোর্ডে ফিরে যান", "Back to dashboard")}</Button>
              </Link>
            </CardContent>
          </Card>
        );
    }
  };

  if (!isAdminEnabled) {
    return (
      <div className="min-h-screen bg-[#f4f7f2] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardContent className="space-y-4 p-10 text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
              <h1 className="font-bengali text-2xl font-semibold">{t("অ্যাডমিন প্যানেল বর্তমানে বন্ধ", "Admin panel is currently disabled")}</h1>
              <p className="font-bengali text-muted-foreground">{t("লোকাল ডেভেলপমেন্টে .env.development ব্যবহার করে অ্যাডমিন চালু করুন", "Enable the admin panel in local development through .env.development")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleDashboardLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const nextLoginAt = Date.now();

    if (role === "admin") {
      if (!validateAdminPassword(password)) {
        setError(t("ভুল অ্যাডমিন পাসওয়ার্ড", "Incorrect admin password"));
        return;
      }

      const adminUser = await ensureAdminAuthSession(password.trim());
      setLocalAdminSession(adminUser);
      saveSession(adminUser);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LAST_LOGIN_STORAGE_KEY, String(nextLoginAt));
      }
      setLastLoginAt(nextLoginAt);
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    try {
      const managerSession = await loginManager(email, password);
      if (managerSession.role === "guardian" || managerSession.status !== "active") {
        await logoutManager().catch(() => undefined);
        setError(t("ম্যানেজার তথ্য সঠিক নয় অথবা অ্যাকাউন্ট বন্ধ", "Invalid manager credentials or account inactive"));
        return;
      }

      saveSession(null);
      setLocalAdminSession(null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LAST_LOGIN_STORAGE_KEY, String(nextLoginAt));
      }
      setLastLoginAt(nextLoginAt);
      navigate(getDefaultRouteForUser(managerSession), { replace: true });
    } catch {
      setError(t("ম্যানেজার তথ্য সঠিক নয় অথবা অ্যাকাউন্ট বন্ধ", "Invalid manager credentials or account inactive"));
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f2]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="font-bengali text-muted-foreground">{t("নিরাপদ সেশন যাচাই হচ্ছে...", "Checking secure session...")}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    const roleHelperText =
      role === "admin"
        ? t("অ্যাডমিন লগইনে শুধু সিস্টেম পাসওয়ার্ড প্রয়োজন", "Admin sign-in needs only the system password")
        : t("ম্যানেজার লগইনে ইমেইল ও পাসওয়ার্ড দুটোই লাগবে", "Manager sign-in requires both email and password");

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_35%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
        <div className="mx-auto max-w-lg">
          <Card id="admin-login-panel" className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="font-bengali text-2xl">{t("নিরাপদ লগইন", "Secure Login")}</CardTitle>
              <CardDescription className="font-bengali">{t("অ্যাডমিন বা ম্যানেজার হিসেবে লগইন করুন", "Sign in as admin or manager")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDashboardLogin} className="space-y-4">
                <div className="space-y-3">
                  <Label className="font-bengali">{t("লগইন ধরন", "Login type")}</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-1">
                    {[
                      { key: "admin" as const, label: t("অ্যাডমিন", "Admin") },
                      { key: "manager" as const, label: t("ম্যানেজার", "Manager") },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setRole(item.key);
                          setError("");
                        }}
                        className={cn(
                          "h-11 rounded-xl px-4 font-bengali text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          role === item.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className="font-bengali text-xs text-muted-foreground">{roleHelperText}</p>
                </div>

                {role === "manager" ? (
                  <div className="space-y-2">
                    <Label className="font-bengali">{t("ইমেইল", "Email")}</Label>
                    <Input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="rounded-2xl"
                      placeholder="manager@example.com"
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label className="font-bengali">{t("পাসওয়ার্ড", "Password")}</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-2xl"
                    placeholder={t("পাসওয়ার্ড দিন", "Enter password")}
                  />
                </div>

                {error ? <p className="font-bengali text-sm text-red-600">{error}</p> : null}

                <Button type="submit" className="h-11 w-full rounded-2xl font-bengali">
                  {t("লগইন করুন", "Login")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (data.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f2]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="font-bengali text-muted-foreground">{t("ড্যাশবোর্ড লোড হচ্ছে...", "Loading dashboard...")}</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      user={currentUser}
      pageTitle={pageTitle}
      sectionLabel={sectionLabel}
      groups={filteredGroups}
      currentPath={normalizedPathname}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      todoDraft={todoDraft}
      todos={visibleTodos}
      todoVisibility={todoVisibility}
      notificationCount={notificationCount}
      notifications={notifications}
      onTodoDraftChange={setTodoDraft}
      onTodoVisibilityChange={setTodoVisibility}
      onAddTodo={handleAddTodo}
      onRemoveTodo={handleRemoveTodo}
      onToggleTodo={handleToggleTodo}
      onLogout={handleLogout}
    >
      <PermissionGuard
        user={currentUser}
        permission={currentItem?.permission}
        fallback={
          <Card className="rounded-3xl border-border/60 bg-white/95">
            <CardContent className="space-y-3 p-10 text-center">
              <p className="font-bengali text-lg font-semibold">{t("এই সেকশনে আপনার অনুমতি নেই", "You do not have permission for this section")}</p>
              <Link to={getDefaultRouteForUser(currentUser)}>
                <Button className="rounded-2xl font-bengali">{t("অনুমোদিত সেকশনে যান", "Go to an allowed section")}</Button>
              </Link>
            </CardContent>
          </Card>
        }
      >
        {renderCurrentPage()}
      </PermissionGuard>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
