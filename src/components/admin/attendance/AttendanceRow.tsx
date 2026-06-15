import { useLanguage } from "@/contexts/LanguageContext";
import type { AttendanceSheetRowInput, AttendanceStatus } from "@/lib/attendanceService";
import { attendanceStatusOptions } from "@/lib/attendanceHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AttendanceRowProps {
  row: AttendanceSheetRowInput;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onRemarkChange: (studentId: string, remark: string) => void;
  index: number;
}

const statusColors: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  absent: "bg-rose-500",
  late: "bg-amber-500",
  leave: "bg-sky-500",
};

const AttendanceRow = ({ row, onStatusChange, onRemarkChange, index }: AttendanceRowProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:gap-4">
      {/* Student info */}
      <div className="flex items-center gap-3 min-w-0 sm:w-56 shrink-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
          {index + 1}
        </div>
        <div className="min-w-0">
          <p className="font-bengali text-sm font-semibold text-foreground truncate">{row.studentName}</p>
          <p className="font-bengali text-xs text-muted-foreground">
            {row.className}
            {row.section ? ` • ${row.section}` : ""}
            {row.studentId ? <span className="ml-1 font-mono">• {row.studentId}</span> : null}
          </p>
        </div>
      </div>

      {/* Status dots (mobile indicator) */}
      <div className="flex sm:hidden items-center gap-1.5">
        <div className={cn("h-2 w-2 rounded-full", statusColors[row.status] || "bg-muted")} />
        <span className="font-bengali text-xs text-muted-foreground">
          {t(
            attendanceStatusOptions.find((o) => o.value === row.status)?.labelBn || "",
            attendanceStatusOptions.find((o) => o.value === row.status)?.labelEn || "",
          )}
        </span>
      </div>

      {/* Status buttons */}
      <div className="flex flex-wrap gap-1.5 flex-1">
        {attendanceStatusOptions.map((option) => {
          const active = row.status === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              variant={active ? "default" : "outline"}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-bengali transition-all",
                active
                  ? option.tone?.includes("text-emerald")
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : option.tone?.includes("text-rose")
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : option.tone?.includes("text-amber")
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : option.tone?.includes("text-sky")
                    ? "bg-sky-600 hover:bg-sky-700 text-white"
                    : "bg-primary text-white"
                  : "text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground/50",
              )}
              onClick={() => onStatusChange(row.studentId, option.value)}
            >
              {t(option.labelBn, option.labelEn)}
            </Button>
          );
        })}
      </div>

      {/* Remark */}
      <div className="sm:w-44 shrink-0">
        <Input
          value={row.remark}
          onChange={(event) => onRemarkChange(row.studentId, event.target.value)}
          className="h-8 rounded-xl text-xs"
          placeholder={t("মন্তব্য", "Remark")}
        />
      </div>
    </div>
  );
};

export default AttendanceRow;
