import { useEffect, useMemo, useState } from "react";
import { CalendarDays, FileText, PhoneCall, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { getEvents, type Event } from "@/lib/events";
import { getNotices, type Notice } from "@/lib/notices";
import { getResults, type Result } from "@/lib/results";

const SUPPORT_PHONE = "8801581818368";

const PwaHomeCard = () => {
  const { lang, t } = useLanguage();
  const [isStandalone, setIsStandalone] = useState(false);
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
  const [latestResult, setLatestResult] = useState<Result | null>(null);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkStandalone = () => {
      const mediaMatch = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
      const iosStandalone = "standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsStandalone(mediaMatch || iosStandalone);
    };

    checkStandalone();

    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");
    mediaQuery?.addEventListener?.("change", checkStandalone);

    return () => {
      mediaQuery?.removeEventListener?.("change", checkStandalone);
    };
  }, []);

  useEffect(() => {
    if (!isStandalone) {
      return;
    }

    let isMounted = true;

    Promise.all([getNotices(), getResults(), getEvents()])
      .then(([notices, results, events]) => {
        if (!isMounted) {
          return;
        }

        setLatestNotice(notices[0] ?? null);
        setLatestResult(results[0] ?? null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvent =
          events.find((event) => {
            const start = new Date(event.startDate);
            start.setHours(0, 0, 0, 0);
            return start.getTime() >= today.getTime();
          }) ?? events[0] ?? null;

        setNextEvent(upcomingEvent);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [isStandalone]);

  const nextEventDate = useMemo(() => {
    if (!nextEvent?.startDate) {
      return t("\u09a4\u09a5\u09cd\u09af \u0986\u09b8\u099b\u09c7", "Updating soon");
    }

    return new Date(nextEvent.startDate).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [lang, nextEvent, t]);

  if (!isStandalone) {
    return null;
  }

  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-[28px] border border-primary/15 bg-gradient-to-br from-card via-card to-secondary/40 p-5 shadow-[0_18px_60px_rgba(12,74,62,0.12)]"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.3em] text-primary/70">
                {t("PWA Dashboard", "PWA Dashboard")}
              </p>
              <h2 className="mt-2 font-bengali text-2xl font-bold text-foreground">
                {t("\u09a6\u09cd\u09b0\u09c1\u09a4 \u0986\u09aa\u09a1\u09c7\u099f", "Quick Updates")}
              </h2>
              <p className="mt-1 font-bengali text-sm text-muted-foreground">
                {t("\u09b9\u09cb\u09ae \u09b8\u09cd\u0995\u09cd\u09b0\u09bf\u09a8 \u09a5\u09c7\u0995\u09c7\u0987 \u0997\u09c1\u09b0\u09c1\u09a4\u09cd\u09ac\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a4\u09a5\u09cd\u09af \u09a6\u09c7\u0996\u09c1\u09a8\u0964", "See important updates right from your home screen.")}
              </p>
            </div>
            <a
              href={`tel:+${SUPPORT_PHONE}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
              aria-label={t("\u09ab\u09cb\u09a8 \u0995\u09b0\u09c1\u09a8", "Call now")}
            >
              <PhoneCall className="h-5 w-5" />
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/notices" className="block">
              <div className="h-full rounded-2xl border border-border/80 bg-background/85 p-4 transition-transform hover:-translate-y-0.5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bengali text-sm font-semibold text-foreground">
                      {t("\u09b8\u09b0\u09cd\u09ac\u09b6\u09c7\u09b7 \u09a8\u09cb\u099f\u09bf\u09b6", "Latest Notice")}
                    </p>
                  </div>
                </div>
                <p className="font-bengali text-base font-medium leading-snug text-foreground">
                  {lang === "bn"
                    ? latestNotice?.titleBn || t("\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09a8\u09cb\u099f\u09bf\u09b6 \u09a8\u09c7\u0987", "No notice yet")
                    : latestNotice?.titleEn || latestNotice?.titleBn || t("No notice yet", "No notice yet")}
                </p>
              </div>
            </Link>

            <Link to="/results" className="block">
              <div className="h-full rounded-2xl border border-border/80 bg-background/85 p-4 transition-transform hover:-translate-y-0.5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bengali text-sm font-semibold text-foreground">
                      {t("\u09b8\u09b0\u09cd\u09ac\u09b6\u09c7\u09b7 \u09ab\u09b2\u09be\u09ab\u09b2", "Latest Result")}
                    </p>
                  </div>
                </div>
                <p className="font-bengali text-base font-medium leading-snug text-foreground">
                  {latestResult
                    ? lang === "bn"
                      ? [latestResult.exam, latestResult.className].filter(Boolean).join(" - ")
                      : [latestResult.examEn || latestResult.exam, latestResult.classNameEn || latestResult.className].filter(Boolean).join(" - ")
                    : t("\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09ab\u09b2\u09be\u09ab\u09b2 \u09a8\u09c7\u0987", "No result yet")}
                </p>
              </div>
            </Link>

            <Link to="/events" className="block">
              <div className="h-full rounded-2xl border border-border/80 bg-background/85 p-4 transition-transform hover:-translate-y-0.5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bengali text-sm font-semibold text-foreground">
                      {t("\u09aa\u09b0\u09ac\u09b0\u09cd\u09a4\u09c0 \u0987\u09ad\u09c7\u09a8\u09cd\u099f", "Next Event")}
                    </p>
                    <p className="font-display text-xs text-muted-foreground">{nextEventDate}</p>
                  </div>
                </div>
                <p className="font-bengali text-base font-medium leading-snug text-foreground">
                  {lang === "bn"
                    ? nextEvent?.titleBn || t("\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u0986\u09b8\u09a8\u09cd\u09a8 \u0987\u09ad\u09c7\u09a8\u09cd\u099f \u09a8\u09c7\u0987", "No upcoming event")
                    : nextEvent?.titleEn || nextEvent?.titleBn || t("No upcoming event", "No upcoming event")}
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PwaHomeCard;
