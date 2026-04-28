import { Link } from "react-router-dom";
import type { Notice } from "@/lib/notices";
import type { MobileAppNotification } from "@/lib/mobileNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatGuardianDateTime, pickGuardianText } from "@/lib/guardianText";

interface GuardianNoticeListProps {
  notices: Notice[];
  appNotifications?: MobileAppNotification[];
  compact?: boolean;
}

const GuardianNoticeList = ({
  notices,
  appNotifications = [],
  compact = false,
}: GuardianNoticeListProps) => {
  const { t } = useLanguage();
  const visibleNotices = compact ? notices.slice(0, 4) : notices;
  const visibleAppNotifications = compact ? appNotifications.slice(0, 3) : appNotifications;
  const hasAnyItems = visibleAppNotifications.length > 0 || visibleNotices.length > 0;

  return (
    <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="font-bengali text-xl">{t("নোটিশ ও অ্যাপ বার্তা", "Notices and App Messages")}</CardTitle>
        {compact && (
          <Button asChild variant="outline" className="rounded-2xl font-bengali">
            <Link to="/guardian/notices">{t("সব দেখুন", "View All")}</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasAnyItems ? (
          <p className="font-bengali text-sm text-muted-foreground">
            {t("কোনো নোটিশ পাওয়া যায়নি", "No notices found")}
          </p>
        ) : (
          <>
            {visibleAppNotifications.length > 0 && (
              <div className="space-y-3">
                <p className="font-bengali text-sm font-semibold text-primary">
                  {t("মোবাইল অ্যাপ বার্তা", "Mobile app messages")}
                </p>
                {visibleAppNotifications.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.95),rgba(254,243,199,0.75))] px-4 py-3"
                  >
                    <p className="font-bengali text-sm font-semibold text-foreground">
                      {pickGuardianText(t, item.titleBn, item.titleEn, t("বার্তা", "Message"))}
                    </p>
                    {(item.messageBn || item.messageEn) && (
                      <p className="mt-1 font-bengali text-xs text-muted-foreground">
                        {pickGuardianText(t, item.messageBn, item.messageEn)}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {formatGuardianDateTime(item.createdAt, t("bn-BD", "en-US") as "bn-BD" | "en-US")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {visibleNotices.length > 0 && (
              <div className="space-y-3">
                <p className="font-bengali text-sm font-semibold text-primary">
                  {t("সাম্প্রতিক নোটিশ", "Recent notices")}
                </p>
                {visibleNotices.map((notice) => (
                  <div key={notice.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                    <p className="font-bengali text-sm font-semibold text-foreground">
                      {pickGuardianText(t, notice.titleBn, notice.titleEn, t("নোটিশ", "Notice"))}
                    </p>
                    {(notice.descriptionBn || notice.descriptionEn) && (
                      <p className="mt-1 font-bengali text-xs text-muted-foreground">
                        {pickGuardianText(t, notice.descriptionBn, notice.descriptionEn)}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {formatGuardianDateTime(notice.createdAt, t("bn-BD", "en-US") as "bn-BD" | "en-US")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GuardianNoticeList;
