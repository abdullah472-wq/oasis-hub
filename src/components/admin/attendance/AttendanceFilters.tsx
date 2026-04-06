import { CalendarDays, CheckCheck, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AttendanceFiltersProps {
  selectedDate: string;
  classFilter: string;
  sectionFilter: string;
  classOptions: string[];
  sectionOptions: string[];
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
  saving,
  onDateChange,
  onClassChange,
  onSectionChange,
  onMarkAllPresent,
  onSave,
}: AttendanceFiltersProps) => {
  const { t } = useLanguage();

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto] lg:items-end">
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

        <Button type="button" variant="outline" className="h-11 rounded-2xl font-bengali" onClick={onMarkAllPresent}>
          <CheckCheck className="mr-2 h-4 w-4" />
          {t("সব উপস্থিত", "Mark All Present")}
        </Button>

        <Button type="button" className="h-11 rounded-2xl font-bengali" onClick={onSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? t("সেভ হচ্ছে...", "Saving...") : t("উপস্থিতি সেভ", "Save Attendance")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AttendanceFilters;
