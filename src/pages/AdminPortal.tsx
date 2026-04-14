import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from "@/components/admin/AdminLayout";
import PermissionGuard from "@/components/admin/PermissionGuard";
import DashboardOverview from "@/components/admin/DashboardOverview";
import ManagersPage from "@/components/admin/ManagersPage";
import { findSidebarItem, getDefaultRouteForUser, sidebarGroups } from "@/lib/adminDashboard";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  AchievementsManagerPage,
  EventsManagerPage,
  GalleryManagerPage,
  NewsManagerPage,
  NoticesManagerPage,
  ResultsManagerPage,
  ReviewsManagerPage,
} from "@/components/admin/AdminContentPages";
import {
  AdmissionsManagerPage,
  GuardianRequestsPage,
  SettingsPage,
  TeachersManagerPage,
  VirtualToursManagerPage,
} from "@/components/admin/AdminOperationsPages";
import GuardianAttendanceCard from "@/components/admin/attendance/GuardianAttendanceCard";
import AttendancePage from "@/components/admin/attendance/AttendancePage";
import FeesPage from "@/components/admin/fees/FeesPage";
import RamadanManagerPage from "@/components/admin/ramadan/RamadanManagerPage";

const siteLogo = "/site-logo.png";

const AdminPortalPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, login, logout } = useAuth();
  const [role, setRole] = useState<"admin" | "manager" | "guardian">("guardian");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const data = useAdminDashboardData(Boolean(currentUser && currentUser.role !== "guardian" && currentUser.status === "active"));

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "guardian") {
      navigate("/guardian", { replace: true });
      return;
    }
    if (currentUser.status !== "active") return;
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate(getDefaultRouteForUser(currentUser), { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === "/admin/logout") {
      void logout().finally(() => navigate("/admin", { replace: true }));
    }
  }, [location.pathname, logout, navigate]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const profile = await login(email, password);
      if (profile.role !== role) {
        await logout();
        setError(t("নির্বাচিত রোলের সাথে অ্যাকাউন্ট মেলেনি", "Selected role does not match the account"));
        return;
      }

      if (profile.role === "guardian") {
        navigate("/guardian", { replace: true });
        return;
      }

      if (profile.status !== "active") {
        navigate("/admin", { replace: true });
        return;
      }

      navigate(getDefaultRouteForUser(profile), { replace: true });
    } catch {
      setError(t("ইমেইল বা পাসওয়ার্ড সঠিক নয়", "Incorrect email or password"));
    }
  };

  const handleLogout = async () => {
    await logout();
    setPassword("");
    setEmail("");
    navigate("/admin", { replace: true });
  };

  const filteredGroups = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return sidebarGroups;

    return sidebarGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          [item.labelBn, item.labelEn, item.key].some((value) => value.toLowerCase().includes(term)),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchValue]);

  const currentItem = findSidebarItem(location.pathname);
  const pageTitle = currentItem ? t(currentItem.labelBn, currentItem.labelEn) : t("ড্যাশবোর্ড", "Dashboard");
  const pageDescription = currentItem
    ? ""
    : t("সমস্ত অ্যাডমিন অপারেশন এক জায়গায়", "All admin operations in one place");

  const NOTIFICATION_SEEN_KEY = "oasis_admin_notifications_seen_v1";
  const [notificationsSeenAt, setNotificationsSeenAt] = useState(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(NOTIFICATION_SEEN_KEY);
    return raw ? Number(raw) : 0;
  });

  const notifications = useMemo(() => {
    const pendingAdmissions = data.admissions.filter((item) => item.status === "pending");
    const pendingReviews = data.reviews.filter((item) => !item.approved);
    const pendingGuardianRequests = data.guardianRequests.filter((item) => item.status !== "resolved");

    const items = [
      {
        id: "pending-admissions",
        title: t("পেন্ডিং ভর্তি আবেদন", "Pending admissions"),
        detail: t(
          `পেন্ডিং আবেদন: ${pendingAdmissions.length}`,
          `Pending applications: ${pendingAdmissions.length}`,
        ),
        href: "/admin/admissions",
        createdAt: pendingAdmissions.length
          ? Math.max(...pendingAdmissions.map((item) => item.createdAt || 0))
          : 0,
        count: pendingAdmissions.length,
      },
      {
        id: "pending-reviews",
        title: t("পেন্ডিং রিভিউ", "Pending reviews"),
        detail: t(
          `পেন্ডিং রিভিউ: ${pendingReviews.length}`,
          `Pending reviews: ${pendingReviews.length}`,
        ),
        href: "/admin/reviews",
        createdAt: pendingReviews.length
          ? Math.max(...pendingReviews.map((item) => item.createdAt || 0))
          : 0,
        count: pendingReviews.length,
      },
      {
        id: "pending-guardian-requests",
        title: t("পেন্ডিং গার্ডিয়ান রিকোয়েস্ট", "Pending guardian requests"),
        detail: t(
          `পেন্ডিং রিকোয়েস্ট: ${pendingGuardianRequests.length}`,
          `Pending requests: ${pendingGuardianRequests.length}`,
        ),
        href: "/admin/guardian-requests",
        createdAt: pendingGuardianRequests.length
          ? Math.max(...pendingGuardianRequests.map((item) => item.createdAt || 0))
          : 0,
        count: pendingGuardianRequests.length,
      },
    ];

    return items.filter((item) => item.count > 0);
  }, [data.admissions, data.guardianRequests, data.reviews, t]);

  const notificationCount = useMemo(
    () => notifications.reduce((sum, item) => sum + item.count, 0),
    [notifications],
  );

  const handleNotificationsOpen = () => {
    const next = Date.now();
    setNotificationsSeenAt(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NOTIFICATION_SEEN_KEY, String(next));
    }
  };

  const renderCurrentPage = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return (
          <DashboardOverview
            user={currentUser!}
            stats={data.dashboardStats}
            notices={data.notices}
            events={data.events}
            reviews={data.reviews}
            activityFeed={data.activityFeed}
          />
        );
      case "/admin/fees":
        return (
          <FeesPage
            entries={data.feeEntries}
            students={data.feeStudents}
            onCreateBatch={(draft) => data.actions.addFeeBatchItems(draft, currentUser!.fullName)}
            onUpdateEntry={data.actions.updateFeeEntryItem}
            onUpdatePayment={data.actions.updateFeePaymentItem}
            onDeleteEntry={data.actions.removeFeeEntryItem}
          />
        );
      case "/admin/attendance":
        return (
          <AttendancePage
            students={data.attendanceStudents}
            records={data.attendanceRecords}
            onSaveSheet={(rows) => data.actions.saveAttendanceSheetItems(rows, currentUser!.fullName)}
          />
        );
      case "/admin/guardian-requests":
        return (
          <GuardianRequestsPage
            items={data.guardianRequests}
            onSave={data.actions.saveGuardianRequestItem}
            onCreateGuardianAccount={data.actions.createGuardianAccountItem}
            onDelete={data.actions.removeGuardianRequestItem}
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
      case "/admin/results":
        return <ResultsManagerPage items={data.results} onCreate={data.actions.addResultItem} onDelete={data.actions.removeResultItem} />;
      case "/admin/reviews":
        return <ReviewsManagerPage items={data.reviews} onApprove={data.actions.approveReviewItem} onDelete={data.actions.removeReviewItem} />;
      case "/admin/achievements":
        return <AchievementsManagerPage items={data.achievements} onCreate={data.actions.addAchievementItem} onDelete={data.actions.removeAchievementItem} />;
      case "/admin/teachers":
        return <TeachersManagerPage items={data.teachers} onCreate={data.actions.addTeacherItem} onDelete={data.actions.removeTeacherItem} />;
      case "/admin/virtual-tours":
        return <VirtualToursManagerPage items={data.virtualTours} onCreate={data.actions.addVirtualTourItem} onDelete={data.actions.removeVirtualTourItem} />;
      case "/admin/admissions":
        return <AdmissionsManagerPage items={data.admissions} onDelete={data.actions.removeAdmissionItem} />;
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
      case "/admin/managers":
        return <ManagersPage managers={data.managers} onSave={data.actions.saveManagerItem} onDelete={data.actions.removeManagerItem} />;
      case "/admin/settings":
        return <SettingsPage settings={data.settings} onSave={data.actions.saveSettingsItem} />;
      default:
        return (
          <Card className="rounded-3xl border-border/60 bg-white/95">
            <CardContent className="space-y-3 p-10 text-center">
              <p className="font-bengali text-lg font-semibold">{t("এই পেইজটি পাওয়া যায়নি", "This page was not found")}</p>
              <Link to={getDefaultRouteForUser(currentUser!)}>
                <Button className="rounded-2xl font-bengali">{t("ড্যাশবোর্ডে ফিরে যান", "Back to dashboard")}</Button>
              </Link>
            </CardContent>
          </Card>
        );
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-[#f4f7f2] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardContent className="space-y-4 p-10 text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
              <h1 className="font-bengali text-2xl font-semibold">{t("ফায়ারবেজ কনফিগারেশন পাওয়া যায়নি", "Firebase configuration not found")}</h1>
              <p className="font-bengali text-muted-foreground">{t("Firebase Auth ও Firestore চালু করতে .env ভ্যারিয়েবল সেট করুন", "Set the Firebase Auth and Firestore environment variables to enable the dashboard")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f2]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="font-bengali text-muted-foreground">{t("অথেনটিকেশন যাচাই হচ্ছে...", "Checking authentication...")}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_35%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="flex items-center justify-center rounded-[36px] border border-border/60 bg-white/90 p-8 shadow-[0_24px_80px_-50px_rgba(16,24,40,0.35)]">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[32px] bg-primary/5 shadow-sm">
                <img src={siteLogo} alt="Annoor Education Family logo" className="h-24 w-24 object-contain" />
              </div>
              <p className="font-bengali text-sm font-semibold uppercase tracking-[0.3em] text-primary">{t("অ্যাডমিন পোর্টাল", "Admin Portal")}</p>
              <h1 className="mt-4 font-bengali text-4xl font-semibold text-foreground md:text-5xl">
                {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
              </h1>
              <p className="mx-auto mt-4 max-w-xl font-bengali text-base text-muted-foreground md:text-lg">
                {t("স্কুল ও মাদরাসার কনটেন্ট, ফি, উপস্থিতি, রিভিউ, গার্ডিয়ান ও ম্যানেজমেন্ট একসাথে পরিচালনার জন্য স্মার্ট ড্যাশবোর্ড।", "A smart dashboard for managing school and madrasa content, fees, attendance, reviews, guardians, and operations in one place.")}
              </p>
            </div>
          </div>

          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="font-bengali text-2xl">{t("নিরাপদ লগইন", "Secure Login")}</CardTitle>
              <CardDescription className="font-bengali">{t("অ্যাডমিন, ম্যানেজার অথবা গার্ডিয়ান অ্যাকাউন্ট দিয়ে লগইন করুন", "Sign in with an admin, manager, or guardian account")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bengali">{t("লগইন ধরন", "Login type")}</Label>
                  <select value={role} onChange={(event) => setRole(event.target.value as "admin" | "manager" | "guardian")} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
                    <option value="admin">{t("অ্যাডমিন", "Admin")}</option>
                    <option value="manager">{t("ম্যানেজার", "Manager")}</option>
                    <option value="guardian">{t("গার্ডিয়ান", "Guardian")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bengali">{t("ইমেইল", "Email")}</Label>
                  <Input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-2xl" placeholder="user@example.com" />
                </div>

                <div className="space-y-2">
                  <Label className="font-bengali">{t("পাসওয়ার্ড", "Password")}</Label>
                  <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-2xl" placeholder={t("পাসওয়ার্ড দিন", "Enter password")} />
                </div>

                {error && <p className="font-bengali text-sm text-red-600">{error}</p>}

                <Button type="submit" className="h-11 w-full rounded-2xl font-bengali">{t("লগইন করুন", "Login")}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentUser.status === "pending") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_35%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardContent className="space-y-5 p-10 text-center">
              <ShieldCheck className="mx-auto h-14 w-14 text-primary" />
              <h1 className="font-bengali text-3xl font-semibold">{t("আপনার অ্যাকাউন্ট অনুমোদনের অপেক্ষায় আছে", "Your account is waiting for approval")}</h1>
              <p className="font-bengali text-muted-foreground">{t("আপনার রেজিস্ট্রেশন গ্রহণ করা হয়েছে। অ্যাডমিন অনুমোদনের পর আপনি লগইন করে ড্যাশবোর্ড ব্যবহার করতে পারবেন।", "Your registration has been received. You will be able to use the dashboard after admin approval.")}</p>
              <div className="flex justify-center">
                <Button className="rounded-2xl font-bengali" onClick={() => void handleLogout()}>{t("লগআউট", "Logout")}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentUser.status === "inactive") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_35%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardContent className="space-y-5 p-10 text-center">
              <Lock className="mx-auto h-14 w-14 text-red-600" />
              <h1 className="font-bengali text-3xl font-semibold">{t("এই অ্যাকাউন্টটি নিষ্ক্রিয়", "This account is inactive")}</h1>
              <p className="font-bengali text-muted-foreground">{t("অ্যাকাউন্ট চালু করতে প্রশাসনের সাথে যোগাযোগ করুন।", "Please contact the administration to activate this account.")}</p>
              <div className="flex justify-center">
                <Button className="rounded-2xl font-bengali" onClick={() => void handleLogout()}>{t("লগআউট", "Logout")}</Button>
              </div>
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
      pageDescription={pageDescription}
      groups={filteredGroups}
      currentPath={location.pathname}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      notificationCount={notificationCount}
      notifications={notifications.map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
        href: item.href,
        createdAt: item.createdAt,
        tone: item.createdAt > notificationsSeenAt ? "primary" : "muted",
      }))}
      onNotificationsOpen={handleNotificationsOpen}
      onLogout={() => void handleLogout()}
    >
      <PermissionGuard
        permission={currentUser.role === "guardian" ? undefined : currentItem?.permission}
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
        {currentUser.role === "guardian" ? <GuardianAttendanceCard guardianUid={currentUser.uid} /> : renderCurrentPage()}
      </PermissionGuard>
    </AdminLayout>
  );
};

export default AdminPortalPage;

