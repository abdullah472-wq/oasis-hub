import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMarqueeList } from "@/lib/marqueeService";
import type { MarqueeNotice } from "@/types/cms";

const defaultNotices: MarqueeNotice[] = [
  {
    id: "marquee-default-1",
    text_bn: "২০২৬ শিক্ষাবর্ষে নূরানী, নাজেরা ও হিফজ শাখায় ভর্তি চলছে। বিস্তারিত জানতে অফিসে যোগাযোগ করুন।",
    text_en: "Admissions open for Nurani, Nazara and Hifz sections for 2026 academic year. Contact office for details.",
    link_url: "/admission",
    is_active: true,
    priority: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "marquee-default-2",
    text_bn: "আননূর শিক্ষা পরিবারের উভয় ক্যাম্পাসে আধুনিক দ্বীনি ও সাধারণ শিক্ষার সমন্বিত পাঠদান পরিচালিত হচ্ছে।",
    text_en: "Annoor Education Family provides integrated Islamic and modern general education.",
    link_url: "/about",
    is_active: true,
    priority: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const NoticeTicker = () => {
  const { t } = useLanguage();
  const [notices, setNotices] = useState<MarqueeNotice[]>(defaultNotices);

  useEffect(() => {
    let mounted = true;

    const fetchTicker = async () => {
      try {
        const data = await getMarqueeList();
        const active = data.filter((n) => n.is_active);
        if (mounted && active.length > 0) {
          setNotices(active);
        }
      } catch (err) {
        console.warn("Failed to load marquee notices, using defaults:", err);
      }
    };

    void fetchTicker();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative z-30 overflow-hidden border-b border-border/70 bg-white dark:bg-card text-foreground shadow-xs print:hidden">
      <div className="flex items-center">
        {/* Notice Badge */}
        <div className="z-10 flex items-center gap-1.5 bg-primary px-3.5 py-1.5 text-xs font-bold font-bengali text-primary-foreground shadow-xs uppercase tracking-wider shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <Volume2 className="h-3.5 w-3.5 text-primary-foreground/90" />
          <span>{t("জরুরি বার্তা", "NOTICE")}</span>
        </div>

        {/* Ticker marquee */}
        <motion.div
          className="flex gap-16 whitespace-nowrap py-1.5"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: Math.max(50, notices.length * 25), repeat: Infinity, ease: "linear" }}
        >
          {notices.concat(notices).map((notice, index) => {
            const text = t(notice.text_bn, notice.text_en || notice.text_bn);
            return notice.link_url ? (
              <a
                key={`${notice.id}-${index}`}
                href={notice.link_url}
                className="font-bengali text-xs md:text-sm font-medium text-foreground/90 transition hover:text-primary hover:underline flex items-center gap-1.5"
              >
                <span className="text-accent text-xs">✦</span>
                <span>{text}</span>
              </a>
            ) : (
              <span
                key={`${notice.id}-${index}`}
                className="font-bengali text-xs md:text-sm font-medium text-foreground/90 flex items-center gap-1.5"
              >
                <span className="text-accent text-xs">✦</span>
                <span>{text}</span>
              </span>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default NoticeTicker;
