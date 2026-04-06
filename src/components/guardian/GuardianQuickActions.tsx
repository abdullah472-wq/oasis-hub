import { BellRing, CreditCard, FileCheck2, UserCheck2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const GuardianQuickActions = () => {
  const { t } = useLanguage();

  const items = [
    { to: "/guardian/notices", labelBn: "নোটিশ", labelEn: "Notice", icon: BellRing },
    { to: "/guardian/results", labelBn: "ফলাফল", labelEn: "Result", icon: FileCheck2 },
    { to: "/guardian/fees", labelBn: "পেমেন্ট", labelEn: "Payment", icon: CreditCard },
    { to: "/guardian/attendance", labelBn: "উপস্থিতি", labelEn: "Attendance", icon: UserCheck2 },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Button key={item.to} asChild variant="outline" className="h-auto justify-start rounded-2xl border-border/70 bg-white px-4 py-4 font-bengali shadow-sm">
            <Link to={item.to}>
              <Icon className="mr-3 h-4 w-4" />
              {t(item.labelBn, item.labelEn)}
            </Link>
          </Button>
        );
      })}
    </div>
  );
};

export default GuardianQuickActions;
