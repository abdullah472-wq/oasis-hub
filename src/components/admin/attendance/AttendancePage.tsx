import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2 } from "lucide-react";
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
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
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

  const classOptions = useMemo(() => buildClassOptions(students), [students]);
  const sectionOptions = useMemo(() => buildSectionOptions(students, classFilter), [classFilter, students]);

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

  return (
    <ModuleShell
      title={t("উপস্থিতি ম্যানেজমেন্ট", "Attendance Management")}
      description={t("তারিখভিত্তিক উপস্থিতি শিট, দ্রুত স্ট্যাটাস কন্ট্রোল এবং বাল্ক সেভ ব্যবস্থা", "Date-based attendance sheet with quick status controls and bulk save")}
      icon={<CalendarCheck2 className="h-5 w-5" />}
    >
      <AttendanceSummary summary={summary} />
      <AttendanceFilters
        selectedDate={selectedDate}
        classFilter={classFilter}
        sectionFilter={sectionFilter}
        classOptions={classOptions}
        sectionOptions={sectionOptions}
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
    </ModuleShell>
  );
};

export default AttendancePage;
