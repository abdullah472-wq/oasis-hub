import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  X,
  Flame,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const toBnDigit = (num: number | string): string => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const AdmissionFloatingFAB = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const isBn = language === "bn";

  // Don't show on admin portal, admission guide page, or admission form page
  const isAdmissionRoute =
    location.pathname === "/admission" ||
    location.pathname === "/admission-form" ||
    location.pathname.startsWith("/admin");

  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Target deadline: 30 November 2026
  const deadlineTimestamp = new Date("2026-11-30T23:59:59").getTime();
  const [daysLeft, setDaysLeft] = useState(() => {
    const diff = deadlineTimestamp - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = deadlineTimestamp - Date.now();
      setDaysLeft(Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))));
    }, 60000);
    return () => clearInterval(timer);
  }, [deadlineTimestamp]);

  if (isAdmissionRoute || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-[9999] flex flex-col items-end pointer-events-auto">
      <AnimatePresence mode="wait">
        {!minimized ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="group relative z-[9999] flex items-center"
          >
            {/* Close / Minimize Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(true);
              }}
              title={t("মিনিমাইজ করুন", "Minimize")}
              className="absolute -top-2.5 -left-2.5 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-md border border-white/20 hover:bg-slate-800 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Main Interactive Floating Capsule Card */}
            <Link
              to="/admission"
              className="relative flex items-center gap-3 rounded-full border border-accent/40 bg-gradient-to-r from-primary via-primary/95 to-slate-950 p-2 pr-4 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_15px_45px_-8px_rgba(0,0,0,0.6)] active:scale-95"
            >
              {/* Animated Glowing Icon Orb */}
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-accent to-accent/80 text-accent-foreground shadow-md">
                <GraduationCap className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
                </span>
              </div>

              {/* Text Info */}
              <div className="text-left font-bengali">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {t("ভর্তি চলছে ২০২৬-২৭", "Admissions Open 2026-27")}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold text-accent-foreground border border-accent/30">
                    <Flame className="h-2.5 w-2.5 text-accent" />
                    <span>{isBn ? `আর ${toBnDigit(daysLeft)} দিন` : `${daysLeft}d left`}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-200 font-medium">
                  <span>{t("অনলাইন আবেদন ও সময়সূচি", "Apply & Schedule")}</span>
                  <ArrowRight className="h-3 w-3 text-accent group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMinimized(false)}
            title={t("ভর্তি নোটিশ দেখুন", "View Admission Notice")}
            className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent/80 bg-gradient-to-tr from-primary to-slate-950 text-accent shadow-xl"
          >
            <GraduationCap className="h-6 w-6 text-accent" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdmissionFloatingFAB;
