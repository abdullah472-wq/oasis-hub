import type { AttendanceRecord } from "@/lib/attendanceService";
import type { AttendanceMonthlySummary } from "@/lib/attendanceHelpers";
import { attendanceStatusOptions } from "@/lib/attendanceHelpers";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuardianAttendanceCardProps {
  attendanceSummary: AttendanceMonthlySummary;
  todayAttendance: AttendanceRecord | null;
  recentAttendance: AttendanceRecord[];
  compact?: boolean;
}

const GuardianAttendanceCard = ({ attendanceSummary, todayAttendance, recentAttendance, compact = false }: GuardianAttendanceCardProps) => {
  const { t } = useLanguage();
  const visibleRecords = compact ? recentAttendance.slice(0, 5) : recentAttendance;

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
      <CardHeader>
        <CardTitle className="font-bengali text-xl">{t("উপস্থিতির সারাংশ", "Attendance Summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label={t("আজকের অবস্থা", "Today Status")} value={todayAttendance ? formatStatus(t, todayAttendance.status) : t("চিহ্নিত নয়", "Unmarked")} />
          <Metric label={t("উপস্থিত", "Present")} value={String(attendanceSummary.presentDays)} />
          <Metric label={t("অনুপস্থিত", "Absent")} value={String(attendanceSummary.absentDays)} />
          <Metric label={t("উপস্থিতির হার", "Attendance Rate")} value={`${attendanceSummary.attendancePercent}%`} />
        </div>

        <div className="space-y-2">
          {visibleRecords.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground">{t("এখনও কোনো উপস্থিতির রেকর্ড নেই", "No attendance records yet")}</p>
          ) : (
            visibleRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3">
                <div>
                  <p className="font-bengali text-sm font-semibold text-foreground">{record.date}</p>
                  {record.remark && <p className="font-bengali text-xs text-muted-foreground">{record.remark}</p>}
                </div>
                <Badge className={statusTone(record.status)}>{formatStatus(t, record.status)}</Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
    <p className="font-bengali text-xs text-muted-foreground">{label}</p>
    <p className="font-bengali text-lg font-semibold text-foreground">{value}</p>
  </div>
);

const formatStatus = (t: (bn: string, en: string) => string, status: AttendanceRecord["status"]) => {
  const option = attendanceStatusOptions.find((item) => item.value === status);
  return option ? t(option.labelBn, option.labelEn) : status;
};

const statusTone = (status: AttendanceRecord["status"]) =>
  attendanceStatusOptions.find((item) => item.value === status)?.tone ?? "border-border bg-muted text-foreground";

export default GuardianAttendanceCard;
