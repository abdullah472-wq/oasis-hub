import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, UserCheck2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { listGuardianAttendanceRecords, type AttendanceRecord } from "@/lib/attendanceService";
import { calculateAttendanceMonthlySummary, getRecentAttendanceFromRecords, attendanceStatusOptions } from "@/lib/attendanceHelpers";
import { listStudentsByGuardian, type StudentRecord } from "@/lib/students";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GuardianAttendanceCardProps {
  guardianUid: string;
}

const GuardianAttendanceCard = ({ guardianUid }: GuardianAttendanceCardProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const [nextStudents, nextRecords] = await Promise.all([
          listStudentsByGuardian(guardianUid).catch(() => []),
          listGuardianAttendanceRecords(guardianUid).catch(() => []),
        ]);

        if (!active) return;
        setStudents(nextStudents);
        setRecords(nextRecords);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [guardianUid]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const studentCards = useMemo(() => {
    const studentMap = new Map<string, StudentRecord>();
    students.forEach((student) => studentMap.set(student.studentId, student));
    records.forEach((record) => {
      if (!studentMap.has(record.studentId)) {
        studentMap.set(record.studentId, {
          id: record.studentId,
          studentId: record.studentId,
          studentName: record.studentName,
          className: record.className,
          section: record.section,
          roll: record.roll,
          guardianUid,
          status: "active",
        });
      }
    });

    return Array.from(studentMap.values()).map((student) => {
      const studentRecords = records.filter((record) => record.studentId === student.studentId);
      const monthlySummary = calculateAttendanceMonthlySummary(
        studentRecords.filter((record) => record.month === currentMonth),
      );
      const recentRecords = getRecentAttendanceFromRecords(studentRecords, 7);
      const todayRecord = studentRecords.find((record) => record.date === new Date().toISOString().slice(0, 10));

      return {
        student,
        monthlySummary,
        recentRecords,
        todayRecord,
      };
    });
  }, [currentMonth, guardianUid, records, students]);

  if (loading) {
    return (
      <Card className="rounded-3xl border-border/60 bg-white/95">
        <CardContent className="flex min-h-[220px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="font-bengali text-sm text-muted-foreground">{t("উপস্থিতি লোড হচ্ছে...", "Loading attendance...")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (studentCards.length === 0) {
    return (
      <Card className="rounded-3xl border-border/60 bg-white/95">
        <CardContent className="space-y-3 p-10 text-center">
          <p className="font-bengali text-lg font-semibold">{t("এখনও কোনো উপস্থিতির রেকর্ড পাওয়া যায়নি", "No attendance records found yet")}</p>
          <p className="font-bengali text-sm text-muted-foreground">{t("উপস্থিতি মার্ক করলে এখানে সংক্ষিপ্ত সারাংশ দেখা যাবে", "Attendance summaries will appear here once records are marked")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("আজকের স্ট্যাটাস", "Today Status")} value={studentCards[0]?.todayRecord ? formatStatus(t, studentCards[0].todayRecord.status) : t("মার্ক হয়নি", "Unmarked")} icon={<UserCheck2 className="h-5 w-5" />} />
        <StatCard label={t("এই মাস", "This Month")} value={`${studentCards[0]?.monthlySummary.attendancePercent ?? 0}%`} icon={<CalendarClock className="h-5 w-5" />} />
        <StatCard label={t("মোট অনুপস্থিত", "Total Absences")} value={String(studentCards.reduce((sum, item) => sum + item.monthlySummary.absentDays, 0))} icon={<CalendarClock className="h-5 w-5" />} />
      </div>

      {studentCards.map(({ student, monthlySummary, recentRecords, todayRecord }) => (
        <Card key={student.studentId} className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
          <CardHeader>
            <CardTitle className="font-bengali text-xl">{student.studentName}</CardTitle>
            <CardDescription className="font-bengali">
              {student.className}
              {student.section ? ` • ${student.section}` : ""}
              {student.studentId ? ` • ${t("স্টুডেন্ট আইডি", "Student ID")} ${student.studentId}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-4">
              <MiniMetric label={t("আজ", "Today")} value={todayRecord ? formatStatus(t, todayRecord.status) : t("মার্ক হয়নি", "Unmarked")} />
              <MiniMetric label={t("উপস্থিত", "Present")} value={String(monthlySummary.presentDays)} />
              <MiniMetric label={t("অনুপস্থিত", "Absent")} value={String(monthlySummary.absentDays)} />
              <MiniMetric label={t("বিলম্ব/ছুটি", "Late/Leave")} value={String(monthlySummary.lateDays + monthlySummary.leaveDays)} />
            </div>

            <div>
              <p className="mb-3 font-bengali text-sm font-semibold text-foreground">{t("সাম্প্রতিক ৭ দিনের উপস্থিতি", "Recent 7 days")}</p>
              <div className="space-y-2">
                {recentRecords.length === 0 ? (
                  <p className="font-bengali text-sm text-muted-foreground">{t("এখনও কোনো দৈনিক রেকর্ড নেই", "No daily records yet")}</p>
                ) : (
                  recentRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3">
                      <div>
                        <p className="font-bengali text-sm font-medium">{record.date}</p>
                        {record.remark && <p className="font-bengali text-xs text-muted-foreground">{record.remark}</p>}
                      </div>
                      <Badge className={statusTone(record.status)}>{formatStatus(t, record.status)}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const formatStatus = (t: (bn: string, en: string) => string, status: AttendanceRecord["status"]) => {
  const option = attendanceStatusOptions.find((item) => item.value === status);
  return option ? t(option.labelBn, option.labelEn) : status;
};

const statusTone = (status: AttendanceRecord["status"]) =>
  attendanceStatusOptions.find((item) => item.value === status)?.tone ?? "border-border bg-muted text-foreground";

const StatCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
    <CardContent className="flex items-center justify-between p-5">
      <div>
        <p className="font-bengali text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-3xl font-semibold text-foreground">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
    </CardContent>
  </Card>
);

const MiniMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
    <p className="font-bengali text-xs text-muted-foreground">{label}</p>
    <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
  </div>
);

export default GuardianAttendanceCard;
