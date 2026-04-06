import { Link } from "react-router-dom";
import type { Notice } from "@/lib/notices";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GuardianNoticeListProps {
  notices: Notice[];
  compact?: boolean;
}

const GuardianNoticeList = ({ notices, compact = false }: GuardianNoticeListProps) => {
  const { t } = useLanguage();
  const visibleNotices = compact ? notices.slice(0, 4) : notices;

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="font-bengali text-xl">{t("সাম্প্রতিক নোটিশ", "Recent Notices")}</CardTitle>
        {compact && (
          <Button asChild variant="outline" className="rounded-2xl font-bengali">
            <Link to="/guardian/notices">{t("সব দেখুন", "View All")}</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleNotices.length === 0 ? (
          <p className="font-bengali text-sm text-muted-foreground">{t("কোনো নোটিশ পাওয়া যায়নি", "No notices found")}</p>
        ) : (
          visibleNotices.map((notice) => (
            <div key={notice.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
              <p className="font-bengali text-sm font-semibold text-foreground">{notice.titleBn}</p>
              {notice.descriptionBn && <p className="mt-1 font-bengali text-xs text-muted-foreground">{notice.descriptionBn}</p>}
              <p className="mt-2 text-[11px] text-muted-foreground">{new Date(notice.createdAt).toLocaleString("bn-BD")}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default GuardianNoticeList;
