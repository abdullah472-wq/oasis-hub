import type { Event } from "@/lib/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pickGuardianText } from "@/lib/guardianText";

interface GuardianUpcomingExamCardProps {
  exam: Event | null;
}

const GuardianUpcomingExamCard = ({ exam }: GuardianUpcomingExamCardProps) => {
  const { t } = useLanguage();

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
      <CardHeader>
        <CardTitle className="font-bengali text-xl">{t("আসন্ন পরীক্ষা", "Upcoming Exam")}</CardTitle>
      </CardHeader>
      <CardContent>
        {exam ? (
          <div className="space-y-2 rounded-2xl border border-border/60 bg-background px-4 py-4">
            <p className="font-bengali text-base font-semibold text-foreground">
              {pickGuardianText(t, exam.titleBn, exam.titleEn, t("পরীক্ষা", "Exam"))}
            </p>
            <p className="font-bengali text-sm text-muted-foreground">{exam.startDate}</p>
            {(exam.descriptionBn || exam.descriptionEn) && (
              <p className="font-bengali text-sm text-muted-foreground">
                {pickGuardianText(t, exam.descriptionBn, exam.descriptionEn)}
              </p>
            )}
          </div>
        ) : (
          <p className="font-bengali text-sm text-muted-foreground">{t("কোনো আসন্ন পরীক্ষা পাওয়া যায়নি", "No upcoming exam found")}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GuardianUpcomingExamCard;
