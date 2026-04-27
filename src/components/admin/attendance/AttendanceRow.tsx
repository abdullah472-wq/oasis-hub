import { useLanguage } from "@/contexts/LanguageContext";
import type { AttendanceSheetRowInput, AttendanceStatus } from "@/lib/attendanceService";
import { attendanceStatusOptions } from "@/lib/attendanceHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AttendanceRowProps {
  row: AttendanceSheetRowInput;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onRemarkChange: (studentId: string, remark: string) => void;
}

const AttendanceRow = ({ row, onStatusChange, onRemarkChange }: AttendanceRowProps) => {
  const { t } = useLanguage();

  return (
    <TableRow>
      <TableCell className="space-y-1">
        <p className="font-bengali text-sm font-semibold text-foreground">{row.studentName}</p>
        <p className="font-bengali text-xs text-muted-foreground">
          {row.className}
          {row.section ? ` • ${row.section}` : ""}
        </p>
      </TableCell>

      <TableCell className="font-display text-sm font-semibold">{row.studentId || "--"}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          {attendanceStatusOptions.map((option) => {
            const active = row.status === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant="outline"
                className={cn(
                  "h-9 rounded-full border font-bengali text-xs",
                  option.tone,
                  active ? "ring-2 ring-primary/20" : "bg-white text-muted-foreground",
                )}
                onClick={() => onStatusChange(row.studentId, option.value)}
              >
                {t(option.labelBn, option.labelEn)}
              </Button>
            );
          })}
        </div>
      </TableCell>
      <TableCell>
        <Input
          value={row.remark}
          onChange={(event) => onRemarkChange(row.studentId, event.target.value)}
          className="rounded-2xl"
          placeholder={t("ঐচ্ছিক মন্তব্য", "Optional remark")}
        />
      </TableCell>
    </TableRow>
  );
};

export default AttendanceRow;
