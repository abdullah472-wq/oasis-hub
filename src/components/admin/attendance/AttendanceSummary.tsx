import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AttendanceSheetSummary } from "@/lib/attendanceHelpers";

interface AttendanceSummaryProps {
  summary: AttendanceSheetSummary;
}

const AttendanceSummary = ({ summary }: AttendanceSummaryProps) => {
  const { t } = useLanguage();

  const cards = [
    { labelBn: "মোট শিক্ষার্থী", labelEn: "Total Students", value: summary.totalStudents },
    { labelBn: "উপস্থিত", labelEn: "Present", value: summary.presentDays },
    { labelBn: "অনুপস্থিত", labelEn: "Absent", value: summary.absentDays },
    { labelBn: "বিলম্ব/ছুটি", labelEn: "Late/Leave", value: summary.lateDays + summary.leaveDays },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.labelEn} className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
          <CardContent className="space-y-2 p-5">
            <p className="font-bengali text-sm text-muted-foreground">{t(card.labelBn, card.labelEn)}</p>
            <p className="font-display text-3xl font-semibold text-foreground">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceSummary;
