import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BellRing, CreditCard, FileCheck2, Loader2, LogOut, MessageSquare, UserCheck2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getGuardianDashboardData, type GuardianDashboardData } from "@/lib/guardianDashboardService";
import { getDefaultRouteForUser } from "@/lib/adminDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GuardianDashboardPage from "@/components/guardian/GuardianDashboardPage";
import GuardianNoticeList from "@/components/guardian/GuardianNoticeList";
import GuardianFeeSummary from "@/components/guardian/GuardianFeeSummary";
import GuardianAttendanceCard from "@/components/guardian/GuardianAttendanceCard";
import GuardianPendingPage from "@/components/guardian/GuardianPendingPage";
import GuardianRequestsPage from "@/components/guardian/GuardianRequestsPage";
import LanguageToggle from "@/components/LanguageToggle";
import { pickGuardianText } from "@/lib/guardianText";
import { subscribeGuardianRequestsByGuardian } from "@/lib/guardianRequests";

const GuardianPortal = () => {
  const { currentUser, loading: authLoading, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GuardianDashboardData | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "guardian" || currentUser.status !== "active") {
      setLoading(false);
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const nextData = await getGuardianDashboardData(currentUser.uid);
        if (active) setData(nextData);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "guardian" || currentUser.status !== "active") {
      return;
    }

    const unsubscribe = subscribeGuardianRequestsByGuardian(currentUser.uid, (items) => {
      setData((current) => (current ? { ...current, requests: items } : current));
    });

    return unsubscribe;
  }, [currentUser]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f2]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="font-bengali text-muted-foreground">{t("গার্ডিয়ান পোর্টাল লোড হচ্ছে...", "Loading guardian portal...")}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin" replace />;
  }

  if (currentUser.role !== "guardian") {
    return <Navigate to={getDefaultRouteForUser(currentUser)} replace />;
  }

  if (currentUser.status === "pending") {
    return <GuardianPendingPage onLogout={() => void logout()} />;
  }

  if (currentUser.status === "inactive") {
    return <GuardianPendingPage inactive onLogout={() => void logout()} />;
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f2]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="font-bengali text-muted-foreground">{t("আপনার তথ্য লোড হচ্ছে...", "Loading your data...")}</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/guardian", labelBn: "ড্যাশবোর্ড", labelEn: "Dashboard", icon: BellRing },
    { to: "/guardian/notices", labelBn: "নোটিশ", labelEn: "Notices", icon: BellRing },
    { to: "/guardian/results", labelBn: "ফলাফল", labelEn: "Results", icon: FileCheck2 },
    { to: "/guardian/fees", labelBn: "পেমেন্ট", labelEn: "Payment", icon: CreditCard },
    { to: "/guardian/attendance", labelBn: "উপস্থিতি", labelEn: "Attendance", icon: UserCheck2 },
    { to: "/guardian/requests", labelBn: "রিকোয়েস্ট", labelEn: "Requests", icon: MessageSquare },
  ];

  const pageTitle = useMemo(() => {
    const current = navItems.find((item) => item.to === location.pathname);
    if (current) return t(current.labelBn, current.labelEn);
    return t("ড্যাশবোর্ড", "Dashboard");
  }, [location.pathname, t]);

  const renderCurrentPage = () => {
    switch (location.pathname) {
      case "/guardian/notices":
        return <GuardianNoticeList notices={data.notices} />;
      case "/guardian/results":
        return (
          <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
            <CardHeader>
              <CardTitle className="font-bengali text-xl">{t("ফলাফল", "Results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.results.length === 0 ? (
                <p className="font-bengali text-sm text-muted-foreground">{t("এই শিক্ষার্থীর জন্য কোনো ফলাফল পাওয়া যায়নি", "No results found for this student")}</p>
              ) : (
                data.results.map((result) => (
                  <div key={result.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                    <p className="font-bengali text-sm font-semibold text-foreground">
                      {pickGuardianText(t, result.exam, result.examEn, result.exam)}
                    </p>
                    <p className="font-bengali text-xs text-muted-foreground">
                      {pickGuardianText(t, result.className, result.classNameEn, result.className)}
                    </p>
                    {result.entryType === "manual" && (
                      <p className="mt-1 font-bengali text-xs text-muted-foreground">
                        {t("প্রাপ্ত", "Obtained")}: {Number(result.obtainedMarks || 0)} / {Number(result.totalMarks || 0)} • GPA: {Number(result.gpa || 0)} • {t("গ্রেড", "Grade")}: {result.grade || "-"} • {t("পজিশন", "Position")}: {Number(result.position || 0) || "-"}
                      </p>
                    )}
                    {result.pdfUrl && (
                      <a href={result.pdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-bengali text-xs font-semibold text-primary hover:underline">
                        {t("ফলাফল দেখুন", "Open Result")}
                      </a>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      case "/guardian/fees":
        return <GuardianFeeSummary summary={data.feeSummary} entries={data.feeEntries} />;
      case "/guardian/attendance":
        return (
          <GuardianAttendanceCard
            attendanceSummary={data.attendanceSummary}
            todayAttendance={data.todayAttendance}
            recentAttendance={data.recentAttendance}
          />
        );
      case "/guardian/requests":
        return (
          <GuardianRequestsPage
            guardian={data.guardianProfile}
            requests={data.requests}
            onCreated={(request) =>
              setData((current) =>
                current
                  ? {
                      ...current,
                      requests: [request, ...current.requests],
                    }
                  : current,
              )
            }
          />
        );
      case "/guardian":
      default:
        return <GuardianDashboardPage data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f2]">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-bengali text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t("গার্ডিয়ান পোর্টাল", "Guardian Portal")}</p>
            <h1 className="font-bengali text-2xl font-semibold text-foreground">{pageTitle}</h1>
            <p className="font-bengali text-sm text-muted-foreground">
              {data.guardianProfile.studentName} • {data.guardianProfile.className} • {data.guardianProfile.section} • {t("স্টুডেন্ট আইডি", "Student ID")} {data.guardianProfile.studentId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="outline" className="rounded-2xl font-bengali" onClick={() => navigate("/")}>{t("হোম", "Home")}</Button>
            <Button className="rounded-2xl font-bengali" onClick={() => void logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("লগআউট", "Logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6 md:px-6">
        <div className="grid gap-3 md:grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Button key={item.to} asChild variant={active ? "default" : "outline"} className="justify-start rounded-2xl font-bengali">
                <Link to={item.to}>
                  <Icon className="mr-2 h-4 w-4" />
                  {t(item.labelBn, item.labelEn)}
                </Link>
              </Button>
            );
          })}
        </div>

        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default GuardianPortal;
