import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import type { AttendanceRecord, AttendanceSheetRowInput, AttendanceStatus } from "@/lib/attendanceService";
import type { StudentRecord } from "@/lib/students";
import {
  buildAttendanceSheetRows,
  buildClassOptions,
  buildSectionOptions,
  calculateAttendanceSheetSummary,
} from "@/lib/attendanceHelpers";
import {
  buildAttendanceSummaryOptions,
  downloadAttendanceSummary,
  printAttendanceSummary,
} from "@/lib/attendanceSummaryExport";
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AttendanceFilters from "./AttendanceFilters";
import AttendanceSheet from "./AttendanceSheet";
import AttendanceSummary from "./AttendanceSummary";

interface AttendancePageProps {
  students: StudentRecord[];
  records: AttendanceRecord[];
  onSaveSheet: (rows: AttendanceSheetRowInput[]) => Promise<void>;
}

const AttendancePage = ({ students, records, onSaveSheet }: AttendancePageProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [draftRows, setDraftRows] = useState<AttendanceSheetRowInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedSummaryKey, setSelectedSummaryKey] = useState("");

  const classOptions = useMemo(() => buildClassOptions(students), [students]);
  const sectionOptions = useMemo(() => buildSectionOptions(students, classFilter), [classFilter, students]);
  const summaryMonth = selectedDate.slice(0, 7);

  useEffect(() => {
    setDraftRows(
      buildAttendanceSheetRows({
        students,
        records,
        date: selectedDate,
        className: classFilter,
        section: sectionFilter,
      }),
    );
  }, [classFilter, records, sectionFilter, selectedDate, students]);

  const summary = useMemo(() => calculateAttendanceSheetSummary(draftRows), [draftRows]);
  const attendanceSummaryOptions = useMemo(
    () => buildAttendanceSummaryOptions(records.filter((item) => item.month === summaryMonth)),
    [records, summaryMonth],
  );

  const updateStudentRow = (studentId: string, patch: Partial<AttendanceSheetRowInput>) => {
    setDraftRows((current) => current.map((item) => (item.studentId === studentId ? { ...item, ...patch } : item)));
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    updateStudentRow(studentId, { status });
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    updateStudentRow(studentId, { remark });
  };

  const handleMarkAllPresent = () => {
    setDraftRows((current) => current.map((item) => ({ ...item, status: "present" })));
  };

  const handleSave = async () => {
    if (draftRows.length === 0) {
      toast({
        title: t("কোনো শিক্ষার্থী পাওয়া যায়নি", "No students found"),
        description: t("এই তারিখ বা ফিল্টারের জন্য সেভ করার মতো কোনো সারি নেই", "There are no rows to save for this date/filter"),
      });
      return;
    }

    setSaving(true);
    try {
      await onSaveSheet(draftRows);
      toast({
        title: t("উপস্থিতি সেভ হয়েছে", "Attendance saved"),
        description: t("আজকের উপস্থিতির তালিকা সফলভাবে আপডেট হয়েছে", "The attendance sheet was updated successfully"),
      });
    } catch {
      toast({
        title: t("সেভ করা যায়নি", "Save failed"),
        description: t("দয়া করে আবার চেষ্টা করুন", "Please try again"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSummaryRecords = () => {
    const selectedOption = attendanceSummaryOptions.find((item) => item.key === selectedSummaryKey);
    if (!selectedOption) return null;

    const recordsForStudent = records.filter(
      (item) => item.month === summaryMonth && `${item.guardianUid || "no-guardian"}::${item.studentId}` === selectedOption.key,
    );

    if (recordsForStudent.length === 0) return null;

    return { selectedOption, recordsForStudent };
  };

  const handleDownloadSummary = () => {
    const payload = getSummaryRecords();
    if (!payload) return;

    downloadAttendanceSummary(payload.recordsForStudent, payload.selectedOption, summaryMonth);
    setSummaryOpen(false);
  };

  const handlePrintSummary = () => {
    const payload = getSummaryRecords();
    if (!payload) return;

    printAttendanceSummary(payload.recordsForStudent, payload.selectedOption, summaryMonth);
  };

  return (
    <ModuleShell
      title={t("উপস্থিতি ম্যানেজমেন্ট", "Attendance Management")}
      description={t("তারিখভিত্তিক উপস্থিতি শিট, দ্রুত স্ট্যাটাস কন্ট্রোল এবং বাল্ক সেভ ব্যবস্থা", "Date-based attendance sheet with quick status controls and bulk save")}
      actionLabel={t("মাসিক সামারি", "Monthly Summary")}
      onAction={() => {
        setSelectedSummaryKey(attendanceSummaryOptions[0]?.key || "");
        setSummaryOpen(true);
      }}
      icon={<CalendarCheck2 className="h-5 w-5" />}
    >
      <AttendanceSummary summary={summary} />
      <AttendanceFilters
        selectedDate={selectedDate}
        classFilter={classFilter}
        sectionFilter={sectionFilter}
        classOptions={classOptions}
        sectionOptions={sectionOptions}
        totalStudents={draftRows.length}
        presentCount={summary.presentDays}
        absentCount={summary.absentDays}
        lateCount={summary.lateDays}
        leaveCount={summary.leaveDays}
        saving={saving}
        onDateChange={setSelectedDate}
        onClassChange={(value) => {
          setClassFilter(value);
          setSectionFilter("all");
        }}
        onSectionChange={setSectionFilter}
        onMarkAllPresent={handleMarkAllPresent}
        onSave={handleSave}
      />
      <AttendanceSheet rows={draftRows} onStatusChange={handleStatusChange} onRemarkChange={handleRemarkChange} />

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">{t("মাসিক উপস্থিতি সামারি", "Monthly Attendance Summary")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="font-bengali text-sm text-muted-foreground">{t("নির্বাচিত মাস", "Selected month")}</p>
              <p className="font-display text-lg font-semibold text-foreground">{summaryMonth}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bengali">{t("শিক্ষার্থী নির্বাচন", "Select student")}</Label>
              <select
                value={selectedSummaryKey}
                onChange={(event) => setSelectedSummaryKey(event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("একজন নির্বাচন করুন", "Choose one")}</option>
                {attendanceSummaryOptions.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.studentName} - {item.className} {item.section ? `- ${item.section}` : ""} - {t("স্টুডেন্ট আইডি", "Student ID")} {item.studentId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setSummaryOpen(false)}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={handlePrintSummary} disabled={!selectedSummaryKey}>
              {t("প্রিন্ট", "Print")}
            </Button>
            <Button type="button" className="rounded-2xl font-bengali" onClick={handleDownloadSummary} disabled={!selectedSummaryKey}>
              <Download className="mr-2 h-4 w-4" />
              {t("ডাউনলোড", "Download")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
};

export default AttendancePage;
