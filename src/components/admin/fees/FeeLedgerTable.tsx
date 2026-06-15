import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface FeeLedgerRow {
  studentId: string;
  studentName: string;
  className: string;
  dateLabel: string;
  monthlyAmount: number;
  othersAmount: number;
  dueAmount: number;
  totalAmount: number;
}

interface FeeLedgerTableProps {
  rows: FeeLedgerRow[];
  month: string;
}

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;

const FeeLedgerTable = ({ rows, month }: FeeLedgerTableProps) => {
  const { t } = useLanguage();

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.monthlyAmount += row.monthlyAmount;
          acc.othersAmount += row.othersAmount;
          acc.dueAmount += row.dueAmount;
          acc.totalAmount += row.totalAmount;
          return acc;
        },
        {
          monthlyAmount: 0,
          othersAmount: 0,
          dueAmount: 0,
          totalAmount: 0,
        },
      ),
    [rows],
  );

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
      <CardHeader>
        <CardTitle className="font-bengali text-xl">{t("মাসভিত্তিক ফি লেজার", "Monthly Fee Ledger")}</CardTitle>
        <CardDescription className="font-bengali">
          {t("নির্বাচিত মাসের জন্য সব শিক্ষার্থীর এম.পি., অন্যান্য, এক্সাম, ডিউ এবং মোট হিসাব", "MP, others, exam, due, and total summary for all students in the selected month")} - {month}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center font-bengali text-sm text-muted-foreground">
            {t("এই মাসের জন্য কোনো শিক্ষার্থীভিত্তিক লেজার পাওয়া যায়নি", "No student ledger found for this month")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr className="text-left">
                  {[
                    t("স্টুডেন্ট আইডি", "Student ID"),
                    t("নাম", "Name"),
                    t("ক্লাস", "Class"),
                    t("Date", "Date"),
                    t("M.P.", "M.P."),
                    t("Others", "Others"),
                    t("Due", "Due"),
                    t("Total", "Total"),
                  ].map((label) => (
                    <th key={label} className="px-4 py-4 font-bengali font-semibold text-foreground">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.studentId} className="border-b border-border/50 bg-background/70">
                    <td className="px-4 py-3 font-bengali text-foreground">{row.studentId || "-"}</td>
                    <td className="px-4 py-3 font-bengali font-medium text-foreground">{row.studentName || "-"}</td>
                    <td className="px-4 py-3 font-bengali text-foreground">{row.className || "-"}</td>
                    <td className="px-4 py-3 font-bengali text-foreground">{row.dateLabel || "-"}</td>
                    <td className="px-4 py-3 font-display text-foreground">{row.monthlyAmount ? formatCurrency(row.monthlyAmount) : "-"}</td>
                    <td className="px-4 py-3 font-display text-foreground">{row.othersAmount ? formatCurrency(row.othersAmount) : "-"}</td>
                    <td className="px-4 py-3 font-display text-foreground">{row.dueAmount ? formatCurrency(row.dueAmount) : "-"}</td>
                    <td className="px-4 py-3 font-display font-semibold text-foreground">{row.totalAmount ? formatCurrency(row.totalAmount) : "-"}</td>
                  </tr>
                ))}
                <tr className="bg-muted/25">
                  <td colSpan={4} className="px-4 py-4 font-bengali font-semibold text-foreground">
                    {t("মোট", "Total")}
                  </td>
                  <td className="px-4 py-4 font-display font-semibold text-foreground">{formatCurrency(totals.monthlyAmount)}</td>
                  <td className="px-4 py-4 font-display font-semibold text-foreground">{formatCurrency(totals.othersAmount)}</td>
                  <td className="px-4 py-4 font-display font-semibold text-foreground">{formatCurrency(totals.dueAmount)}</td>
                  <td className="px-4 py-4 font-display font-semibold text-foreground">{formatCurrency(totals.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeLedgerTable;
