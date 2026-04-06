import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface GuardianSummaryCardsProps {
  totalDue: number;
  unpaidItems: number;
  attendancePercent: number;
  upcomingExamLabel: string;
  todaysNoticeLabel: string;
}

const GuardianSummaryCards = ({
  totalDue,
  unpaidItems,
  attendancePercent,
  upcomingExamLabel,
  todaysNoticeLabel,
}: GuardianSummaryCardsProps) => {
  const { t } = useLanguage();

  const cards = [
    {
      labelBn: "মোট বকেয়া ফি",
      labelEn: "Total Due",
      value: `৳${totalDue.toLocaleString("en-US")}`,
      helper: unpaidItems > 0 ? t(`${unpaidItems}টি বকেয়া আইটেম`, `${unpaidItems} unpaid items`) : t("কোনো বকেয়া নেই", "No unpaid items"),
    },
    {
      labelBn: "উপস্থিতির হার",
      labelEn: "Attendance Rate",
      value: `${attendancePercent}%`,
      helper: t("চলতি মাসের উপস্থিতি", "Current month attendance"),
    },
    {
      labelBn: "আসন্ন পরীক্ষা",
      labelEn: "Upcoming Exam",
      value: upcomingExamLabel,
      helper: t("পরবর্তী নির্ধারিত পরীক্ষা", "Next scheduled exam"),
    },
    {
      labelBn: "আজকের নোটিশ",
      labelEn: "Today's Notice",
      value: todaysNoticeLabel,
      helper: t("সর্বশেষ নোটিশ আপডেট", "Latest notice update"),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.labelEn} className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
          <CardContent className="space-y-2 p-5">
            <p className="font-bengali text-sm text-muted-foreground">{t(card.labelBn, card.labelEn)}</p>
            <p className="font-bengali text-xl font-semibold text-foreground md:text-2xl">{card.value}</p>
            <p className="font-bengali text-xs text-muted-foreground">{card.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GuardianSummaryCards;
