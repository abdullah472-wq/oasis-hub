import { useMemo } from "react";
import { BookOpen, Landmark, Package, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ChartOfAccount, JournalEntry, DonationRecord } from "@/lib/accounting";
import { computeDashboardStats } from "@/lib/accounting";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountingDashboardProps {
  accounts: ChartOfAccount[];
  journals: JournalEntry[];
  donations: DonationRecord[];
}

const AccountingDashboard = ({ accounts, journals, donations }: AccountingDashboardProps) => {
  const { t, lang } = useLanguage();
  const stats = useMemo(() => computeDashboardStats(journals, accounts, donations), [accounts, journals, donations]);

  const overviewCards = [
    { label: t("আজকের আয়", "Income Today"), value: `৳${stats.totalIncomeToday.toLocaleString("en-US")}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: t("আজকের ব্যয়", "Expense Today"), value: `৳${stats.totalExpenseToday.toLocaleString("en-US")}`, icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
    { label: t("এই মাসের আয়", "Income This Month"), value: `৳${stats.totalIncomeThisMonth.toLocaleString("en-US")}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: t("এই মাসের ব্যয়", "Expense This Month"), value: `৳${stats.totalExpenseThisMonth.toLocaleString("en-US")}`, icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
    { label: t("নিট লাভ/ক্ষতি", "Net Profit/Loss"), value: `৳${stats.netProfit.toLocaleString("en-US")}`, icon: BookOpen, color: stats.netProfit >= 0 ? "text-blue-600" : "text-orange-600", bg: stats.netProfit >= 0 ? "bg-blue-50" : "bg-orange-50" },
    { label: t("হাতে নগদ", "Cash in Hand"), value: `৳${stats.cashInHand.toLocaleString("en-US")}`, icon: Wallet, color: "text-purple-600", bg: "bg-purple-50" },
    { label: t("ব্যাংক ব্যালেন্স", "Bank Balance"), value: `৳${stats.bankBalance.toLocaleString("en-US")}`, icon: Landmark, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: t("অনিয়মিত আয়", "Outstanding Receivables"), value: `৳${stats.outstandingReceivables.toLocaleString("en-US")}`, icon: TrendingDown, color: "text-amber-600", bg: "bg-amber-50" },
    { label: t("অনিয়মিত ব্যয়", "Outstanding Payables"), value: `৳${stats.outstandingPayables.toLocaleString("en-US")}`, icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const quickStats = [
    { label: t("মোট লেনদেন", "Total Transactions"), value: stats.transactionCount },
    { label: t("অনুমোদন মুলতুবি", "Pending Approvals"), value: stats.pendingApprovals },
    { label: t("দান সংক্রান্ত", "Donation Collections"), value: `৳${stats.donationTotal.toLocaleString("en-US")}` },
    { label: t("বেতন ব্যয়", "Salary Expenses"), value: "—", icon: true },
    { label: t("উপযোগ埢 ব্যয়", "Utility Expenses"), value: "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <BookOpen className="h-5 w-5" />
        <span className="font-bengali text-sm font-semibold uppercase tracking-[0.2em]">
          {t("অ্যাকাউন্টিং", "Accounting")}
        </span>
      </div>
      <div>
        <h2 className="font-bengali text-2xl font-semibold text-foreground">{t("অ্যাকাউন্টিং ড্যাশবোর্ড", "Accounting Dashboard")}</h2>
        <p className="font-bengali text-sm text-muted-foreground">
          {t("আর্থিক অবস্থা, লেনদেন ও ব্যয়ের সারসংক্ষেপ", "Financial overview, transactions and expense summary")}
        </p>
      </div>

      <div>
        <h3 className="font-bengali text-base font-semibold mb-3">{t("আর্থিক ওভারভিউ", "Financial Overview")}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {overviewCards.map((stat) => (
            <Card key={stat.label} className="rounded-2xl border-border/60 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <span className="font-display text-lg font-bold">{stat.value}</span>
                </div>
                <p className="font-bengali mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bengali text-base font-semibold mb-3">{t("দ্রstatt Sanskrit", "Quick Statistics")}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="rounded-2xl border-border/60 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="font-bengali text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;
