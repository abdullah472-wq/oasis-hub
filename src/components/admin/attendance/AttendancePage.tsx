import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck2, Download, Search, X } from "lucide-react";
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
  const [dialogMonth, setDialogMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summarySearch, setSummarySearch] = useState("");
  const summarySearchRef = useRef<HTMLInputElement>(null);

  const summaryMonth = selectedDate.slice(0, 7);

  const classOptions = useMemo(() => buildClassOptions(students ?? []), [students]);
  const sectionOptions = useMemo(() => buildSectionOptions(students ?? [], classFilter), [classFilter, students]);

  useEffect(() => {
    setDraftRows(
      buildAttendanceSheetRows({
        students: students ?? [],
        records: records ?? [],
        date: selectedDate,
        className: classFilter,
        section: sectionFilter,
      }),
    );
  }, [classFilter, records, sectionFilter, selectedDate, students]);

  const summary = useMemo(() => calculateAttendanceSheetSummary(draftRows), [draftRows]);
  const attendanceSummaryOptions = useMemo(
    () => buildAttendanceSummaryOptions((records ?? []).filter((item) => item.month === summaryMonth)),
    [records, summaryMonth],
  );

  const getFilteredOptions = () => {
    const opts = buildAttendanceSummaryOptions((records ?? []).filter((item) => item.month === dialogMonth));
    if (!summarySearch.trim()) return opts;
    const q = summarySearch.toLowerCase().replace(/[০-৯]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09e6 + 0x30));
    return opts.filter(
      (o) =>
        `${o.studentName || ""} ${o.studentId || ""} ${o.className || ""}`
          .toLowerCase()
          .includes(q),
    );
  };

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
    const selectedOption = getFilteredOptions().find((item) => item.key === selectedSummaryKey);
    if (!selectedOption) return null;

    const recordsForStudent = (records ?? []).filter(
      (item) => item.month === dialogMonth && `${item.guardianUid || "no-guardian"}::${item.studentId}` === selectedOption.key,
    );

    if (recordsForStudent.length === 0) return null;

    return { selectedOption, recordsForStudent };
  };

  const handleDownloadSummary = () => {
    const payload = getSummaryRecords();
    if (!payload) return;

    downloadAttendanceSummary(payload.recordsForStudent, payload.selectedOption, dialogMonth);
    setSummaryOpen(false);
  };

  const handlePrintSummary = () => {
    const payload = getSummaryRecords();
    if (!payload) return;

    printAttendanceSummary(payload.recordsForStudent, payload.selectedOption, dialogMonth);
  };

  return (
    <ModuleShell
      title={t("উপস্থিতি ম্যানেজমেন্ট", "Attendance Management")}
      description={t("তারিখভিত্তিক উপস্থিতি শিট, দ্রুত স্ট্যাটাস কন্ট্রোল এবং বাল্ক সেভ ব্যবস্থা", "Date-based attendance sheet with quick status controls and bulk save")}
      actionLabel={t("মাসিক সামারি", "Monthly Summary")}
      onAction={() => {
        setDialogMonth(summaryMonth);
        setSummarySearch("");
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
            <div className="space-y-2">
              <Label className="font-bengali">{t("মাস নির্বাচন", "Select month")}</Label>
              <input
                type="month"
                value={dialogMonth}
                onChange={(e) => {
                  setDialogMonth(e.target.value);
                  setSelectedSummaryKey("");
                  setSummarySearch("");
                }}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bengali">{t("শিক্ষার্থী খুঁজুন", "Search student")}</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={summarySearchRef}
                  type="text"
                  value={summarySearch}
                  onChange={(e) => {
                    setSummarySearch(e.target.value);
                    setSelectedSummaryKey("");
                  }}
                  placeholder={t("নাম বা স্টুডেন্ট আইডি লিখুন", "Type name or student ID")}
                  className="h-11 w-full rounded-2xl border border-input bg-background pl-10 pr-10 text-sm outline-none"
                />
                {summarySearch ? (
                  <button
                    type="button"
                    onClick={() => setSummarySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bengali">{t("শিক্ষার্থী নির্বাচন", "Select student")}</Label>
              {(() => {
                const filtered = getFilteredOptions();
                return (
                  <div className="max-h-48 overflow-y-auto rounded-2xl border border-input">
                    {filtered.length === 0 ? (
                      <div className="px-4 py-3 font-bengali text-sm text-muted-foreground">
                        {t("কোনো শিক্ষার্থী পাওয়া যায়নি", "No students found")}
                      </div>
                    ) : (
                      filtered.map((item, idx) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedSummaryKey(item.key)}
                          className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                            selectedSummaryKey === item.key ? "bg-primary/5 ring-1 ring-primary/20" : ""
                          } ${idx !== filtered.length - 1 ? "border-b border-border/50" : ""}`}
                        >
                          <p className="font-bengali text-sm font-semibold text-foreground">{item.studentName}</p>
                          <p className="font-bengali text-xs text-muted-foreground">
                            {item.className} {item.section ? `• ${item.section}` : ""} • {t("স্টুডেন্ট আইডি", "Student ID")} {item.studentId}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                );
              })()}
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
