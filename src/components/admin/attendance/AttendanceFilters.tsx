import { CalendarDays, CheckCheck, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AttendanceFiltersProps {
  selectedDate: string;
  classFilter: string;
  sectionFilter: string;
  classOptions: string[];
  sectionOptions: string[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  saving: boolean;
  onDateChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onMarkAllPresent: () => void;
  onSave: () => void;
}

const AttendanceFilters = ({
  selectedDate,
  classFilter,
  sectionFilter,
  classOptions,
  sectionOptions,
  totalStudents,
  presentCount,
  absentCount,
  lateCount,
  leaveCount,
  saving,
  onDateChange,
  onClassChange,
  onSectionChange,
  onMarkAllPresent,
  onSave,
}: AttendanceFiltersProps) => {
  const { t } = useLanguage();

  const chips = [
    { labelBn: "মোট", labelEn: "Total", value: totalStudents, color: "bg-primary/10 text-primary border-primary/20" },
    { labelBn: "উপস্থিত", labelEn: "Present", value: presentCount, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { labelBn: "অনুপস্থিত", labelEn: "Absent", value: absentCount, color: "bg-rose-50 text-rose-700 border-rose-200" },
    { labelBn: "বিলম্বিত", labelEn: "Late", value: lateCount, color: "bg-amber-50 text-amber-700 border-amber-200" },
    { labelBn: "ছুটি", labelEn: "Leave", value: leaveCount, color: "bg-sky-50 text-sky-700 border-sky-200" },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-4">
      {/* Filters row */}
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr] items-end">
        <div className="space-y-2">
          <label className="font-bengali text-sm font-medium text-foreground">{t("তারিখ", "Date")}</label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="date" value={selectedDate} onChange={(event) => onDateChange(event.target.value)} className="rounded-2xl pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-bengali text-sm font-medium text-foreground">{t("শ্রেণি", "Class")}</label>
          <select value={classFilter} onChange={(event) => onClassChange(event.target.value)} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
            <option value="all">{t("সব শ্রেণি", "All classes")}</option>
            {classOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="font-bengali text-sm font-medium text-foreground">{t("সেকশন", "Section")}</label>
          <select value={sectionFilter} onChange={(event) => onSectionChange(event.target.value)} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
            <option value="all">{t("সব সেকশন", "All sections")}</option>
            {sectionOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chips + actions row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <div key={chip.labelEn} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${chip.color}`}>
              {t(chip.labelBn, chip.labelEn)}: {chip.value}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="h-10 rounded-2xl font-bengali text-sm" onClick={onMarkAllPresent}>
            <CheckCheck className="mr-2 h-4 w-4" />
            {t("সব উপস্থিত", "Mark All Present")}
          </Button>
          <Button type="button" className="h-10 rounded-2xl font-bengali text-sm" onClick={onSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? t("সেভ হচ্ছে...", "Saving...") : t("সেভ", "Save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceFilters;
