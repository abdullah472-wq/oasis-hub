import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isAdminEnabled, validateAdminPassword } from "@/lib/admin";
import AdminLayout from "@/components/admin/AdminLayout";
import PermissionGuard from "@/components/admin/PermissionGuard";
import DashboardOverview from "@/components/admin/DashboardOverview";
import ManagersPage from "@/components/admin/ManagersPage";
import {
  createAdminUser,
  findSidebarItem,
  getDefaultRouteForUser,
  getManagerByCredentials,
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
import {
  EventsManagerPage,
  GalleryManagerPage,
  NewsManagerPage,
  NoticesManagerPage,
  ResultsManagerPage,
  ReviewsManagerPage,
} from "@/components/admin/AdminContentPages";
import {
  AdmissionsManagerPage,
  AttendanceManagerPage,
  FeesManagerPage,
  GuardianRequestsPage,
  SettingsPage,
  TeachersManagerPage,
  VirtualToursManagerPage,
} from "@/components/admin/AdminOperationsPages";

const AdminDashboardPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => getStoredSession());
  const [role, setRole] = useState<"admin" | "manager">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const data = useAdminDashboardData(Boolean(currentUser));

  useEffect(() => {
    if (!currentUser) return;
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate(getDefaultRouteForUser(currentUser), { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === "/admin/logout") {
      saveSession(null);
      setCurrentUser(null);
      navigate("/admin", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (role === "admin") {
      if (!validateAdminPassword(password)) {
        setError(t("ভুল অ্যাডমিন পাসওয়ার্ড", "Incorrect admin password"));
        return;
      }

      const adminUser = createAdminUser();
      setCurrentUser(adminUser);
      saveSession(adminUser);
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    const manager = getManagerByCredentials(email, password);
    if (!manager || manager.status !== "active") {
      setError(t("ম্যানেজার তথ্য সঠিক নয় অথবা অ্যাকাউন্ট বন্ধ", "Invalid manager credentials or account inactive"));
      return;
    }

    const managerSession: AdminUser = {
      uid: manager.uid,
      fullName: manager.fullName,
      email: manager.email,
      role: manager.role,
      status: manager.status,
      permissions: manager.permissions,
    };
    setCurrentUser(managerSession);
    saveSession(managerSession);
    navigate(getDefaultRouteForUser(managerSession), { replace: true });
  };

  const handleLogout = () => {
    saveSession(null);
    setCurrentUser(null);
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
    ? t("এই সেকশন থেকে সংশ্লিষ্ট তথ্য ও অপারেশন ম্যানেজ করুন", "Manage related information and operations in this section")
    : t("সমস্ত অ্যাডমিন অপারেশন এক জায়গায়", "All admin operations in one place");

  const notificationCount = data.dashboardStats.pendingAdmissions + data.dashboardStats.pendingGuardianRequests + data.dashboardStats.pendingReviews;

  const renderCurrentPage = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return (
          <DashboardOverview
            user={currentUser!}
            stats={data.dashboardStats}
            notices={data.notices}
            events={data.events}
            admissions={data.admissions}
            reviews={data.reviews}
            guardianRequests={data.guardianRequests}
            feeRecords={data.feeRecords}
            activityFeed={data.activityFeed}
          />
        );
      case "/admin/news":
        return <NewsManagerPage items={data.newsPosts} onCreate={data.actions.addNews} onDelete={data.actions.removeNews} />;
      case "/admin/gallery":
        return <GalleryManagerPage items={data.galleryImages} onCreate={data.actions.addGalleryItem} onDelete={data.actions.removeGalleryItem} />;
      case "/admin/events":
        return <EventsManagerPage items={data.events} onCreate={data.actions.addEventItem} onDelete={data.actions.removeEventItem} />;
      case "/admin/notices":
        return <NoticesManagerPage items={data.notices} onCreate={data.actions.addNoticeItem} onDelete={data.actions.removeNoticeItem} />;
      case "/admin/results":
        return <ResultsManagerPage items={data.results} onCreate={data.actions.addResultItem} onDelete={data.actions.removeResultItem} />;
      case "/admin/reviews":
        return <ReviewsManagerPage items={data.reviews} onApprove={data.actions.approveReviewItem} onDelete={data.actions.removeReviewItem} />;
      case "/admin/teachers":
        return <TeachersManagerPage items={data.teachers} onCreate={data.actions.addTeacherItem} onDelete={data.actions.removeTeacherItem} />;
      case "/admin/virtual-tours":
        return <VirtualToursManagerPage items={data.virtualTours} onCreate={data.actions.addVirtualTourItem} onDelete={data.actions.removeVirtualTourItem} />;
      case "/admin/admissions":
        return <AdmissionsManagerPage items={data.admissions} onDelete={data.actions.removeAdmissionItem} />;
      case "/admin/fees":
        return <FeesManagerPage items={data.feeRecords} onSave={data.actions.saveFeeItem} onDelete={data.actions.removeFeeItem} />;
      case "/admin/attendance":
        return <AttendanceManagerPage items={data.attendanceRecords} onSave={data.actions.saveAttendanceItem} onDelete={data.actions.removeAttendanceItem} />;
      case "/admin/guardian-requests":
        return <GuardianRequestsPage items={data.guardianRequests} onSave={data.actions.saveGuardianRequestItem} onDelete={data.actions.removeGuardianRequestItem} />;
      case "/admin/managers":
        return <ManagersPage managers={data.managers} onSave={data.actions.saveManagerItem} onDelete={data.actions.removeManagerItem} />;
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_35%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardHeader>
              <CardTitle className="font-bengali text-3xl">{t("আন্নুর অ্যাডমিন ড্যাশবোর্ড", "Annoor Admin Dashboard")}</CardTitle>
              <CardDescription className="font-bengali">{t("কনটেন্ট, অপারেশন, ম্যানেজার পারমিশন এবং গার্ডিয়ান সাপোর্ট এক জায়গায়", "Content, operations, manager permissions, and guardian support in one place")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                t("মডিউলার সাইডবার নেভিগেশন", "Modular sidebar navigation"),
                t("পারমিশনভিত্তিক ম্যানেজার অ্যাক্সেস", "Permission-based manager access"),
                t("ড্যাশবোর্ড ওভারভিউ ও কুইক অ্যাকশন", "Dashboard overview and quick actions"),
                t("ভবিষ্যৎ গার্ডিয়ান ড্যাশবোর্ডের জন্য প্রস্তুত", "Ready for future guardian dashboards"),
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 font-bengali text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="font-bengali text-2xl">{t("নিরাপদ লগইন", "Secure Login")}</CardTitle>
              <CardDescription className="font-bengali">{t("অ্যাডমিন বা ম্যানেজার হিসেবে লগইন করুন", "Sign in as admin or manager")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bengali">{t("লগইন ধরণ", "Login type")}</Label>
                  <select value={role} onChange={(event) => setRole(event.target.value as "admin" | "manager")} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
                    <option value="admin">{t("অ্যাডমিন", "Admin")}</option>
                    <option value="manager">{t("ম্যানেজার", "Manager")}</option>
                  </select>
                </div>

                {role === "manager" && (
                  <div className="space-y-2">
                    <Label className="font-bengali">{t("ইমেইল", "Email")}</Label>
                    <Input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-2xl" placeholder="manager@example.com" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="font-bengali">{t("পাসওয়ার্ড", "Password")}</Label>
                  <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-2xl" placeholder={t("পাসওয়ার্ড দিন", "Enter password")} />
                </div>

                {error && <p className="font-bengali text-sm text-red-600">{error}</p>}

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
      pageDescription={pageDescription}
      groups={filteredGroups}
      currentPath={location.pathname}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      notificationCount={notificationCount}
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
