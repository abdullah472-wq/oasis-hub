import { CreditCard, ReceiptText, WalletCards, WalletMinimal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FeeSummary } from "@/lib/feeHelpers";
import { Card, CardContent } from "@/components/ui/card";

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;

const FeeSummaryCards = ({ summary }: { summary: FeeSummary }) => {
  const { t } = useLanguage();

  const cards = [
    { key: "total", titleBn: "মোট ফি", titleEn: "Total Fees", value: formatCurrency(summary.totalAmount), icon: CreditCard },
    { key: "paid", titleBn: "পরিশোধিত", titleEn: "Paid", value: formatCurrency(summary.totalPaid), icon: WalletCards },
    { key: "due", titleBn: "মোট বাকি", titleEn: "Due", value: formatCurrency(summary.totalDue), icon: WalletMinimal },
    { key: "month", titleBn: "এই মাস", titleEn: "This Month", value: formatCurrency(summary.thisMonthAmount), icon: ReceiptText },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key} className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardContent className="flex items-start justify-between p-6">
              <div className="space-y-2">
                <p className="font-bengali text-sm text-muted-foreground">{t(card.titleBn, card.titleEn)}</p>
                <p className="font-display text-3xl font-semibold text-foreground">{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FeeSummaryCards;
