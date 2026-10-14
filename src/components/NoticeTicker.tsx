import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase/client";
import type { MarqueeNotice } from "@/types/cms";

const NoticeTicker = () => {
  const { t } = useLanguage();
  const [notices, setNotices] = useState<MarqueeNotice[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTicker = async () => {
      try {
        const { data, error } = await supabase
          .from("marquee_notices")
          .select("*")
          .eq("is_active", true)
          .order("priority", { ascending: false });

        if (error) throw error;
        if (mounted) {
          setNotices((data as MarqueeNotice[]) || []);
        }
      } catch (err) {
        console.error("Failed to load marquee notices:", err);
      }
    };

    void fetchTicker();

    return () => {
      mounted = false;
    };
  }, []);

  if (notices.length === 0) {
    return null;
  }

  return (
    <div className="notice-ticker relative overflow-hidden border-b border-primary/10 bg-primary/5">
      <motion.div
        className="flex gap-16 whitespace-nowrap py-2"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: Math.max(18, notices.length * 8), repeat: Infinity, ease: "linear" }}
      >
        {notices.concat(notices).map((notice, index) => {
          const text = t(notice.text_bn, notice.text_en || notice.text_bn);
          return notice.link_url ? (
            <a
              key={`${notice.id}-${index}`}
              href={notice.link_url}
              className="font-bengali text-sm font-medium text-primary transition hover:text-primary/80 hover:underline md:text-base"
            >
              ★ {text}
            </a>
          ) : (
            <span key={`${notice.id}-${index}`} className="font-bengali text-sm font-medium text-primary md:text-base">
              ★ {text}
            </span>
          );
        })}
      </motion.div>
    </div>
  );
};

export default NoticeTicker;
