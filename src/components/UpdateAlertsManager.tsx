import { useEffect, useMemo, useRef, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { BellRing, BellOff } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { db } from "@/lib/firebase";

type AlertKind = "notice" | "result" | "event";

type LatestDoc = {
  titleBn?: string;
  titleEn?: string;
  exam?: string;
  examEn?: string;
  className?: string;
  classNameEn?: string;
  startDate?: string;
  createdAt?: number;
};

const ALERTS_ENABLED_KEY = "oasis_update_alerts_enabled";

interface UpdateAlertsManagerProps {
  className?: string;
}

const UpdateAlertsManager = ({ className = "" }: UpdateAlertsManagerProps) => {
  const { lang, t } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    return Notification.permission;
  });

  const initializedRef = useRef<Record<AlertKind, boolean>>({
    notice: false,
    result: false,
    event: false,
  });
  const lastSeenRef = useRef<Record<AlertKind, number>>({
    notice: 0,
    result: 0,
    event: 0,
  });

  const configs = useMemo(() => ({
    notice: {
      collectionName: "notices",
      href: "/notices",
      title: (doc: LatestDoc) => lang === "bn"
        ? doc.titleBn || t("\u09a8\u09a4\u09c1\u09a8 \u09a8\u09cb\u099f\u09bf\u09b6", "New notice")
        : doc.titleEn || doc.titleBn || t("New notice", "New notice"),
      body: () => t("\u09aa\u09cd\u09b0\u09b6\u09be\u09b8\u09a8 \u09a5\u09c7\u0995\u09c7 \u09a8\u09a4\u09c1\u09a8 \u09a8\u09cb\u099f\u09bf\u09b6 \u09aa\u09cd\u09b0\u0995\u09be\u09b6 \u0995\u09b0\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964", "A new notice has been published by the admin."),
    },
    result: {
      collectionName: "results",
      href: "/results",
      title: (doc: LatestDoc) => {
        if (lang === "bn") {
          return [doc.exam, doc.className].filter(Boolean).join(" - ") || t("\u09a8\u09a4\u09c1\u09a8 \u09ab\u09b2\u09be\u09ab\u09b2", "New result");
        }

        return [doc.examEn || doc.exam, doc.classNameEn || doc.className].filter(Boolean).join(" - ") || t("New result", "New result");
      },
      body: () => t("\u09a8\u09a4\u09c1\u09a8 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u09ab\u09b2\u09be\u09ab\u09b2 \u09aa\u09cd\u09b0\u0995\u09be\u09b6 \u0995\u09b0\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964", "A new exam result has been published."),
    },
    event: {
      collectionName: "events",
      href: "/events",
      title: (doc: LatestDoc) => lang === "bn"
        ? doc.titleBn || t("\u09a8\u09a4\u09c1\u09a8 \u0987\u09ad\u09c7\u09a8\u09cd\u099f", "New event")
        : doc.titleEn || doc.titleBn || t("New event", "New event"),
      body: (doc: LatestDoc) => {
        if (doc.startDate) {
          return lang === "bn"
            ? `\u0987\u09ad\u09c7\u09a8\u09cd\u099f\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996: ${new Date(doc.startDate).toLocaleDateString("bn-BD")}`
            : `Event date: ${new Date(doc.startDate).toLocaleDateString("en-BD")}`;
        }

        return t("\u09aa\u09cd\u09b0\u09b6\u09be\u09b8\u09a8 \u09a5\u09c7\u0995\u09c7 \u09a8\u09a4\u09c1\u09a8 \u0987\u09ad\u09c7\u09a8\u09cd\u099f \u09af\u09cb\u0997 \u0995\u09b0\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964", "A new event has been added by the admin.");
      },
    },
  }), [lang, t]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedEnabled = window.localStorage.getItem(ALERTS_ENABLED_KEY) === "true";
    setEnabled(savedEnabled);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (enabled && permission === "granted") {
      window.localStorage.setItem(ALERTS_ENABLED_KEY, "true");
      return;
    }

    window.localStorage.removeItem(ALERTS_ENABLED_KEY);
  }, [enabled, permission]);

  useEffect(() => {
    if (!enabled || permission !== "granted") {
      return;
    }

    const unsubscribers = (Object.entries(configs) as Array<[AlertKind, typeof configs[AlertKind]]>).map(([kind, config]) =>
      onSnapshot(
        query(collection(db, config.collectionName), orderBy("createdAt", "desc"), limit(1)),
        (snapshot) => {
          const latest = snapshot.docs[0]?.data() as LatestDoc | undefined;

          if (!latest) {
            return;
          }

          const createdAt = typeof latest.createdAt === "number" ? latest.createdAt : 0;

          if (!initializedRef.current[kind]) {
            initializedRef.current[kind] = true;
            lastSeenRef.current[kind] = createdAt;
            return;
          }

          if (createdAt <= lastSeenRef.current[kind]) {
            return;
          }

          lastSeenRef.current[kind] = createdAt;

          const title = config.title(latest);
          const body = config.body(latest);

          toast.success(title, {
            description: body,
            duration: 6000,
          });

          if (typeof window !== "undefined" && document.visibilityState !== "visible" && "Notification" in window) {
            const notification = new Notification(title, {
              body,
              icon: "/site-logo.png",
              badge: "/site-logo.png",
              tag: `oasis-${kind}-${createdAt}`,
            });

            notification.onclick = () => {
              window.focus();
              window.location.href = config.href;
              notification.close();
            };
          }
        },
        (error) => {
          console.error(`Failed to watch ${kind} alerts`, error);
        },
      ),
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [configs, enabled, permission]);

  const enableAlerts = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      toast.error(t("\u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 \u09a8\u09cb\u099f\u09bf\u09ab\u09bf\u0995\u09c7\u09b6\u09a8 \u09b8\u09be\u09aa\u09cb\u09b0\u09cd\u099f \u09a8\u09c7\u0987\u0964", "This browser does not support notifications."));
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);

    if (nextPermission === "granted") {
      setEnabled(true);
      toast.success(t("\u0986\u09aa\u09a1\u09c7\u099f \u0985\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09cd\u099f \u099a\u09be\u09b2\u09c1 \u09b9\u09df\u09c7\u099b\u09c7\u0964", "Update alerts enabled."), {
        description: t("\u098f\u0996\u09a8 \u09a8\u09a4\u09c1\u09a8 \u09a8\u09cb\u099f\u09bf\u09b6, \u09ab\u09b2\u09be\u09ab\u09b2 \u0993 \u0987\u09ad\u09c7\u09a8\u09cd\u099f \u09aa\u09cd\u09b0\u0995\u09be\u09b6 \u09b9\u09b2\u09c7 \u0986\u09aa\u09a8\u09bf \u099c\u09be\u09a8\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7\u09a8\u0964", "You will now be notified when new notices, results, or events are published."),
      });
      return;
    }

    setEnabled(false);
    toast.error(t("\u09a8\u09cb\u099f\u09bf\u09ab\u09bf\u0995\u09c7\u09b6\u09a8 \u0985\u09a8\u09c1\u09ae\u09a4\u09bf \u09aa\u09be\u0993\u09df\u09be \u09af\u09be\u09df\u09a8\u09bf\u0964", "Notification permission was not granted."), {
      description: t("\u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u09b0 \u09b8\u09c7\u099f\u09bf\u0982\u09b8 \u09a5\u09c7\u0995\u09c7 \u09aa\u09b0\u09c7 \u098f\u099f\u09bf \u099a\u09be\u09b2\u09c1 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7\u09a8\u0964", "You can enable it later from your browser settings."),
    });
  };

  const disableAlerts = () => {
    setEnabled(false);
    toast(t("\u0986\u09aa\u09a1\u09c7\u099f \u0985\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09cd\u099f \u09ac\u09a8\u09cd\u09a7 \u0995\u09b0\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964", "Update alerts turned off."));
  };

  if (permission === "unsupported") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={enabled && permission === "granted" ? disableAlerts : enableAlerts}
      className={`flex items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80 ${className}`}
      aria-pressed={enabled && permission === "granted"}
      aria-label={enabled && permission === "granted"
        ? t("\u0986\u09aa\u09a1\u09c7\u099f \u0985\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09cd\u099f \u09ac\u09a8\u09cd\u09a7 \u0995\u09b0\u09c1\u09a8", "Turn off update alerts")
        : t("\u0986\u09aa\u09a1\u09c7\u099f \u0985\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09cd\u099f \u099a\u09be\u09b2\u09c1 \u0995\u09b0\u09c1\u09a8", "Turn on update alerts")}
      title={enabled && permission === "granted"
        ? t("\u0986\u09aa\u09a1\u09c7\u099f \u0985\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09cd\u099f \u099a\u09be\u09b2\u09c1 \u0986\u099b\u09c7", "Update alerts are on")
        : t("\u0986\u09aa\u09a1\u09c7\u099f \u0985\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09cd\u099f \u099a\u09be\u09b2\u09c1 \u0995\u09b0\u09c1\u09a8", "Turn on update alerts")}
    >
      <span className={`flex h-10 w-10 items-center justify-center ${enabled && permission === "granted" ? "text-primary" : "text-foreground"}`}>
        {enabled && permission === "granted" ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </span>
    </button>
  );
};

export default UpdateAlertsManager;
