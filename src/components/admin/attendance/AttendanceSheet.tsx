import { useLanguage } from "@/contexts/LanguageContext";
import type { AttendanceSheetRowInput, AttendanceStatus } from "@/lib/attendanceService";
import { EmptyState } from "@/components/admin/AdminPagePrimitives";
import AttendanceRow from "./AttendanceRow";

interface AttendanceSheetProps {
  rows: AttendanceSheetRowInput[];
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onRemarkChange: (studentId: string, remark: string) => void;
}

const AttendanceSheet = ({ rows, onStatusChange, onRemarkChange }: AttendanceSheetProps) => {
  const { t } = useLanguage();

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-6">
        <EmptyState text={t("এই ফিল্টারের জন্য কোনো শিক্ষার্থী পাওয়া যায়নি", "No students found for this filter")} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm overflow-hidden">
      <div className="border-b border-border/60 bg-muted/20 px-5 py-3">
        <p className="font-bengali text-sm font-medium text-foreground">
          {t("শিক্ষার্থী তালিকা", "Student List")}
          <span className="ml-2 text-xs text-muted-foreground">({rows.length} {t("জন", "students")})</span>
        </p>
      </div>
      <div className="divide-y divide-border/40">
        {rows.map((row, index) => (
          <AttendanceRow
            key={row.studentId}
            row={row}
            onStatusChange={onStatusChange}
            onRemarkChange={onRemarkChange}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default AttendanceSheet;
