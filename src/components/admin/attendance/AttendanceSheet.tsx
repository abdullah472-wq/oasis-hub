import { useLanguage } from "@/contexts/LanguageContext";
import type { AttendanceSheetRowInput, AttendanceStatus } from "@/lib/attendanceService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/admin/AdminPagePrimitives";
import AttendanceRow from "./AttendanceRow";

interface AttendanceSheetProps {
  rows: AttendanceSheetRowInput[];
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onRemarkChange: (studentId: string, remark: string) => void;
}

const AttendanceSheet = ({ rows, onStatusChange, onRemarkChange }: AttendanceSheetProps) => {
  const { t } = useLanguage();

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState text={t("এই ফিল্টারের জন্য কোনো শিক্ষার্থী পাওয়া যায়নি", "No students found for this filter")} />
          </div>
        ) : (
          <Table>
<TableHeader>
              <TableRow>
                <TableHead>{t("শিক্ষার্থী", "Student")}</TableHead>
                <TableHead>{t("স্টুডেন্ট আইডি", "Student ID")}</TableHead>
                <TableHead>{t("স্ট্যাটাস", "Status")}</TableHead>
                <TableHead>{t("মন্তব্য", "Remark")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <AttendanceRow key={row.studentId} row={row} onStatusChange={onStatusChange} onRemarkChange={onRemarkChange} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceSheet;
