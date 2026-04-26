import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { useLanguage } from "@/contexts/LanguageContext";
import { db } from "@/lib/firebase";
import { getSiteDateInputValue } from "@/lib/siteDate";
import {
  getRunningNoticeSettings,
  type RunningNoticeSettings,
} from "@/lib/runningNoticeSettings";

const isPermissionDenied = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "permission-denied";

const NoticeTicker = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<RunningNoticeSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    const settingsDocs = [
      doc(db, "site_settings", "running_notice_bar"),
      doc(db, "site_settings", "ramadan"),
      doc(db, "site_settings", "ramadan", "running_notice_bar", "running_notice_bar"),
    ];

    const syncFromStore = () => {
      getRunningNoticeSettings()
        .then((data) => {
          if (mounted) setSettings(data);
        })
        .catch((error) => {
          if (isPermissionDenied(error)) {
            if (mounted) setSettings(null);
            return;
          }
          console.error("Failed to load running notice settings:", error);
        });
    };

    syncFromStore();

    const unsubscribes = settingsDocs.map((settingsDoc) =>
      onSnapshot(
        settingsDoc,
        () => {
          syncFromStore();
        },
        (error) => {
          if (isPermissionDenied(error)) {
            if (mounted) setSettings(null);
            return;
          }
          console.error("Running notice listener failed:", error);
        },
      ),
    );

    const syncSettings = (event: Event) => {
      const customEvent = event as CustomEvent<RunningNoticeSettings>;
      if (customEvent.detail) setSettings(customEvent.detail);
    };

    window.addEventListener("running-notice-settings-updated", syncSettings as EventListener);

    return () => {
      mounted = false;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      window.removeEventListener("running-notice-settings-updated", syncSettings as EventListener);
    };
  }, []);

  const notices = useMemo(
    () =>
      (settings?.runningNotices ?? [])
        .filter((item) => item.active)
        .filter((item) => !item.publishDate || item.publishDate <= getSiteDateInputValue())
        .sort((a, b) => a.priority - b.priority || a.publishDate.localeCompare(b.publishDate))
        .map((item) => ({
          key: item.id,
          text: t(item.textBn, item.textEn),
          link: item.link?.trim() || "",
        }))
        .filter((item) => item.text.trim().length > 0),
    [settings, t],
  );

  if (!settings || !settings.runningNoticeEnabled || notices.length === 0) {
    return null;
  }

  return (
    <div className="notice-ticker relative overflow-hidden border-b border-primary/10 bg-primary/5">
      <motion.div
        className="flex gap-16 whitespace-nowrap py-2"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: Math.max(18, notices.length * 8), repeat: Infinity, ease: "linear" }}
      >
        {notices.concat(notices).map((notice, index) =>
          notice.link ? (
            <a
              key={`${notice.key}-${index}`}
              href={notice.link}
              className="font-bengali text-sm font-medium text-primary transition hover:text-primary/80 hover:underline md:text-base"
            >
              {notice.text}
            </a>
          ) : (
            <span key={`${notice.key}-${index}`} className="font-bengali text-sm font-medium text-primary md:text-base">
              {notice.text}
            </span>
          ),
        )}
      </motion.div>
    </div>
  );
};

export default NoticeTicker;
