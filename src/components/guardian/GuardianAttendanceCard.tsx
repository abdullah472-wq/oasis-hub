import type { AttendanceRecord } from "@/lib/attendanceService";
import type { AttendanceMonthlySummary } from "@/lib/attendanceHelpers";
import { attendanceStatusOptions } from "@/lib/attendanceHelpers";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
        <CardHeader>
          <CardTitle className="font-bengali text-xl">{t("উপস্থিতির সারাংশ", "Attendance Summary")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
<motion.div
          className="grid gap-3 md:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
        >
          <Metric label={t("আজকের অবস্থা", "Today Status")} value={todayAttendance ? formatStatus(t, todayAttendance.status) : t("চিহ্নিত নয়", "Unmarked")} />
          <Metric label={t("উপস্থিত", "Present")} value={String(attendanceSummary.presentDays)} />
          <Metric label={t("অনুপস্থিত", "Absent")} value={String(attendanceSummary.absentDays)} />
          <Metric label={t("উপস্থিতির হার", "Attendance Rate")} value={`${attendanceSummary.attendancePercent}%`} />
        </motion.div>

<div className="space-y-2">
          {visibleRecords.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground">{t("এখনও কোনো উপস্থিতির রেকর্ড নেই", "No attendance records yet")}</p>
          ) : (
            visibleRecords.map((record, index) => (
              <motion.div
                key={record.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              >
                <div>
                  <p className="font-bengali text-sm font-semibold text-foreground">{record.date}</p>
                  {record.remark && <p className="font-bengali text-xs text-muted-foreground">{record.remark}</p>}
                </div>
                <Badge className={statusTone(record.status)}>{formatStatus(t, record.status)}</Badge>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <motion.div
    className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    <p className="font-bengali text-xs text-muted-foreground">{label}</p>
    <motion.p
      className="font-bengali text-lg font-semibold text-foreground"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      {value}
    </motion.p>
  </motion.div>
);

const formatStatus = (t: (bn: string, en: string) => string, status: AttendanceRecord["status"]) => {
  const option = attendanceStatusOptions.find((item) => item.value === status);
  return option ? t(option.labelBn, option.labelEn) : status;
};

const statusTone = (status: AttendanceRecord["status"]) =>
  attendanceStatusOptions.find((item) => item.value === status)?.tone ?? "border-border bg-muted text-foreground";

export default GuardianAttendanceCard;
