import { Link } from "react-router-dom";
import type { GuardianDashboardData } from "@/lib/guardianDashboardService";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GuardianSummaryCards from "./GuardianSummaryCards";
import GuardianQuickActions from "./GuardianQuickActions";
import GuardianNoticeList from "./GuardianNoticeList";
import GuardianFeeSummary from "./GuardianFeeSummary";
import GuardianAttendanceCard from "./GuardianAttendanceCard";
import GuardianUpcomingExamCard from "./GuardianUpcomingExamCard";
import { pickGuardianText } from "@/lib/guardianText";

interface GuardianDashboardPageProps {
  data: GuardianDashboardData;
}

const GuardianDashboardPage = ({ data }: GuardianDashboardPageProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
        <CardHeader>
          <CardTitle className="font-bengali text-3xl">
            {t("স্বাগতম", "Welcome")}, {data.guardianProfile.fullName}
          </CardTitle>
          <CardDescription className="font-bengali text-base">
            {data.guardianProfile.studentName} • {data.guardianProfile.className} • {data.guardianProfile.section} • {t("রোল", "Roll")} {data.guardianProfile.roll}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuardianQuickActions />
        </CardContent>
      </Card>

      <GuardianSummaryCards
        totalDue={data.feeSummary.totalDue}
        unpaidItems={data.feeSummary.unpaidItems}
        attendancePercent={data.attendanceSummary.attendancePercent}
        upcomingExamLabel={
          data.upcomingExam
            ? pickGuardianText(t, data.upcomingExam.titleBn, data.upcomingExam.titleEn, t("নাই", "None"))
            : t("নাই", "None")
        }
        todaysNoticeLabel={
          data.todaysNotice
            ? pickGuardianText(t, data.todaysNotice.titleBn, data.todaysNotice.titleEn, t("নাই", "None"))
            : t("নাই", "None")
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GuardianNoticeList notices={data.notices} compact />
        <GuardianUpcomingExamCard exam={data.upcomingExam} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GuardianFeeSummary summary={data.feeSummary} entries={data.currentMonthFees} compact />
        <GuardianAttendanceCard
          attendanceSummary={data.attendanceSummary}
          todayAttendance={data.todayAttendance}
          recentAttendance={data.recentAttendance}
          compact
        />
      </div>

      {data.results.length > 0 && (
        <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-bengali text-xl">{t("সাম্প্রতিক ফলাফল", "Recent Results")}</CardTitle>
            <Link to="/guardian/results" className="font-bengali text-sm font-semibold text-primary hover:underline">
              {t("সব দেখুন", "View all")}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.results.slice(0, 4).map((result) => (
              <div key={result.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                <p className="font-bengali text-sm font-semibold text-foreground">
                  {pickGuardianText(t, result.exam, result.examEn, result.exam)}
                </p>
                <p className="font-bengali text-xs text-muted-foreground">
                  {pickGuardianText(t, result.className, result.classNameEn, result.className)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GuardianDashboardPage;
