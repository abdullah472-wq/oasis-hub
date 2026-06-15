import { useLanguage } from "@/contexts/LanguageContext";
import type { AttendanceSheetSummary } from "@/lib/attendanceHelpers";

interface AttendanceSummaryProps {
  summary: AttendanceSheetSummary;
}

const cards = [
  {
    key: "total",
    labelBn: "মোট শিক্ষার্থী",
    labelEn: "Total Students",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  {
    key: "present",
    labelBn: "উপস্থিত",
    labelEn: "Present",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  {
    key: "absent",
    labelBn: "অনুপস্থিত",
    labelEn: "Absent",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    textColor: "text-rose-700 dark:text-rose-300",
  },
  {
    key: "lateLeave",
    labelBn: "বিলম্ব/ছুটি",
    labelEn: "Late/Leave",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-700 dark:text-amber-300",
  },
];

const AttendanceSummary = ({ summary }: AttendanceSummaryProps) => {
  const { t } = useLanguage();

  const values: Record<string, number> = {
    total: summary.totalStudents,
    present: summary.presentDays,
    absent: summary.absentDays,
    lateLeave: summary.lateDays + summary.leaveDays,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`relative overflow-hidden rounded-2xl border ${card.border} ${card.bg} p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
        >
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-lg font-bold shadow-sm`}>
              {values[card.key]}
            </div>
            <div>
              <p className="font-bengali text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t(card.labelBn, card.labelEn)}
              </p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {values[card.key]}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceSummary;
