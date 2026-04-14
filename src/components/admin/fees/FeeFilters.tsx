import { useLanguage } from "@/contexts/LanguageContext";
import type { FeeCategory, FeeStatus } from "@/lib/feeEntries";
import { feeCategoryOptions, feeStatusOptions } from "@/lib/feeHelpers";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface FeeFiltersProps {
  searchValue: string;
  status: FeeStatus | "all";
  category: FeeCategory | "all";
  month: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: FeeStatus | "all") => void;
  onCategoryChange: (value: FeeCategory | "all") => void;
  onMonthChange: (value: string) => void;
}

const FeeFilters = ({
  searchValue,
  status,
  category,
  month,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onMonthChange,
}: FeeFiltersProps) => {
  const { t } = useLanguage();

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.2)]">
      <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="rounded-2xl"
          placeholder={t("শিক্ষার্থী / অভিভাবক / আইডি খুঁজুন", "Search student / guardian / ID")}
        />

        <input
          type="month"
          value={month}
          onChange={(event) => onMonthChange(event.target.value)}
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none"
        />

        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as FeeStatus | "all")}
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none"
        >
          <option value="all">{t("সব স্ট্যাটাস", "All Statuses")}</option>
          {feeStatusOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {t(item.labelBn, item.labelEn)}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as FeeCategory | "all")}
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none"
        >
          <option value="all">{t("সব ক্যাটাগরি", "All Categories")}</option>
          {feeCategoryOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {t(item.labelBn, item.labelEn)}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
};

export default FeeFilters;
