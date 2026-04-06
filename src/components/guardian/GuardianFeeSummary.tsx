import type { FeeEntry } from "@/lib/feeEntries";
import type { FeeSummary } from "@/lib/feeHelpers";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuardianFeeSummaryProps {
  summary: FeeSummary;
  entries: FeeEntry[];
  compact?: boolean;
}

const GuardianFeeSummary = ({ summary, entries, compact = false }: GuardianFeeSummaryProps) => {
  const { t } = useLanguage();
  const visibleEntries = compact ? entries.slice(0, 5) : entries;

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
      <CardHeader>
        <CardTitle className="font-bengali text-xl">{t("চলতি মাসের ফি সারাংশ", "Current Month Fee Summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label={t("মোট", "Total")} value={`৳${summary.totalAmount.toLocaleString("en-US")}`} />
          <Metric label={t("পরিশোধ", "Paid")} value={`৳${summary.totalPaid.toLocaleString("en-US")}`} />
          <Metric label={t("বকেয়া", "Due")} value={`৳${summary.totalDue.toLocaleString("en-US")}`} />
        </div>

        <div className="space-y-2">
          {visibleEntries.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground">{t("এখনও কোনো ফি আইটেম নেই", "No fee items yet")}</p>
          ) : (
            visibleEntries.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3">
                <div>
                  <p className="font-bengali text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="font-bengali text-xs text-muted-foreground">{item.billingMonth}</p>
                </div>
                <div className="text-right">
                  <p className="font-bengali text-sm font-semibold">৳{item.dueAmount.toLocaleString("en-US")}</p>
                  <Badge variant={item.status === "paid" ? "secondary" : item.status === "partial" ? "outline" : "destructive"} className="rounded-full capitalize">{item.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
    <p className="font-bengali text-xs text-muted-foreground">{label}</p>
    <p className="font-bengali text-lg font-semibold text-foreground">{value}</p>
  </div>
);

export default GuardianFeeSummary;
