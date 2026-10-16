import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Bell,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  AlertTriangle,
  Flame,
  PhoneCall,
  Download,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export interface AdmissionCountdownBannerProps {
  className?: string;
  showFormLink?: boolean;
  compact?: boolean;
}

const toBnDigit = (num: number | string): string => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).padStart(2, "0").replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const AdmissionCountdownBanner = ({
  className = "",
  showFormLink = true,
  compact = false,
}: AdmissionCountdownBannerProps) => {
  const { t, language } = useLanguage();
  const isBn = language === "bn";

  // Milestones
  const targets = {
    deadline: {
      id: "deadline",
      titleBn: "আবেদন জমা দেওয়ার শেষ তারিখ",
      titleEn: "Application Submission Deadline",
      dateStrBn: "৩০ নভেম্বর ২০২৬ (রাত ১১:৫৯)",
      dateStrEn: "30 November 2026 (11:59 PM)",
      targetDate: new Date("2026-11-30T23:59:59").getTime(),
      badgeBn: "আবেদনের শেষ সময়",
      badgeEn: "Apply Deadline",
      icon: Clock,
    },
    exam: {
      id: "exam",
      titleBn: "ভর্তি পরীক্ষা ও মৌখিক যাচাই",
      titleEn: "Admission Test & Interview",
      dateStrBn: "০৫ ডিসেম্বর ২০২৬ (শনিবার, সকাল ৯:০০)",
      dateStrEn: "05 December 2026 (Saturday, 9:00 AM)",
      targetDate: new Date("2026-12-05T09:00:00").getTime(),
      badgeBn: "ভর্তি পরীক্ষার দিন",
      badgeEn: "Exam Date",
      icon: GraduationCap,
    },
  };

  const [activeTab, setActiveTab] = useState<"deadline" | "exam">("deadline");

  const calculateTimeLeft = (targetTimestamp: number): TimeLeft => {
    const difference = targetTimestamp - Date.now();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targets[activeTab].targetDate)
  );

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targets[activeTab].targetDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targets[activeTab].targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab]);

  const currentTarget = targets[activeTab];

  const milestones = [
    {
      step: "০১",
      titleBn: "অনলাইন আবেদন শুরু",
      titleEn: "Online Application Opens",
      dateBn: "০১ অক্টোবর ২০২৬",
      dateEn: "01 October 2026",
      status: "active",
      statusBn: "চলমান",
      statusEn: "Running",
    },
    {
      step: "০২",
      titleBn: "আবেদন জমার শেষ সময়",
      titleEn: "Application Deadline",
      dateBn: "৩০ নভেম্বর ২০২৬",
      dateEn: "30 November 2026",
      status: "urgent",
      statusBn: "কাউন্টডাউন",
      statusEn: "Countdown",
    },
    {
      step: "০৩",
      titleBn: "ভর্তি পরীক্ষা ও সাক্ষাৎকার",
      titleEn: "Entrance Test & Interview",
      dateBn: "০৫ ডিসেম্বর ২০২৬",
      dateEn: "05 December 2026",
      status: "upcoming",
      statusBn: "সকাল ৯:০০ টা",
      statusEn: "9:00 AM",
    },
    {
      step: "০৪",
      titleBn: "মেধা তালিকা ও চূড়ান্ত ভর্তি",
      titleEn: "Result & Admission",
      dateBn: "০৮ — ১৫ ডিসেম্বর ২০২৬",
      dateEn: "08 — 15 Dec 2026",
      status: "upcoming",
      statusBn: "অফিস নোটিশ",
      statusEn: "Notice Board",
    },
  ];

  const timeUnits = [
    { labelBn: "দিন", labelEn: "Days", value: timeLeft.days },
    { labelBn: "ঘণ্টা", labelEn: "Hours", value: timeLeft.hours },
    { labelBn: "মিনিট", labelEn: "Minutes", value: timeLeft.minutes },
    { labelBn: "সেকেন্ড", labelEn: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#08185A] via-[#0D1D66] to-[#040D33] p-6 sm:p-8 md:p-10 text-white shadow-2xl ${className}`}
    >
      {/* Decorative ambient background lights */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Top Header & Tab Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30 font-bengali">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>{t("ভর্তি শিক্ষাবর্ষ ২০২৬-২০২৭", "Academic Year 2026-2027")}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-amber-200 border border-accent/30 font-bengali">
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span>{t("সীমিত আসন সংখ্যা", "Limited Seats")}</span>
              </span>
            </div>

            <h2 className="font-bengali text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t("ভর্তি পরীক্ষার সময়সূচি ও জরুরি নোটিশ", "Admission Schedule & Countdown Notice")}
            </h2>
            <p className="font-bengali text-sm sm:text-base text-slate-200/90 max-w-2xl leading-relaxed">
              {t(
                "নির্ধারিত সময়সীমার মধ্যে অনলাইনে নির্ভুলভাবে আবেদন ফর্ম পূরণ করে প্রবেশপত্র প্রিন্ট করুন। পরবর্তীতে পরীক্ষার দিন প্রবেশপত্রসহ উপস্থিত হতে হবে।",
                "Complete the online admission form within the specified deadline to download your admit slip. Bring your admit card on the exam day."
              )}
            </p>
          </div>

          {/* Toggle Countdown Targets */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/40 p-1.5 border border-white/10 self-start lg:self-auto backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab("deadline")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bengali text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "deadline"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{t("আবেদনের শেষ সময়", "Apply Deadline")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("exam")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bengali text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "exam"
                  ? "bg-gradient-to-r from-accent to-accent/90 text-white shadow-lg shadow-accent/25 scale-[1.02]"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>{t("ভর্তি পরীক্ষার দিন", "Exam Date")}</span>
            </button>
          </div>
        </div>

        {/* Center: Live Countdown Display & Target Highlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Target Highlight Info Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 font-bengali">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span>{isBn ? currentTarget.badgeBn : currentTarget.badgeEn}</span>
              </div>
              <h3 className="font-bengali text-xl sm:text-2xl font-bold text-white">
                {isBn ? currentTarget.titleBn : currentTarget.titleEn}
              </h3>
              <div className="inline-flex items-center gap-2 rounded-xl bg-black/50 px-3.5 py-2 text-sm font-mono font-bold text-amber-300 border border-amber-500/20">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>{isBn ? currentTarget.dateStrBn : currentTarget.dateStrEn}</span>
              </div>
              <p className="font-bengali text-xs text-white/70 leading-relaxed">
                {activeTab === "deadline"
                  ? t(
                      "অনলাইন সার্ভার ৩০ নভেম্বর রাত ১১:৫৯ মিনিটে স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে। অতএব নির্ধারিত সময়ের পূর্বেই আবেদন নিশ্চিত করুন।",
                      "Online applications will automatically close at 11:59 PM on 30 November. Submit early to avoid rush."
                    )
                  : t(
                      "সকাল ৯:০০ টায় পরীক্ষা শুরু হবে। শিক্ষার্থীদের সকাল ৮:৩০ এর মধ্যে ক্যাম্পাসে উপস্থিত হয়ে প্রবেশপত্র প্রদর্শন করতে হবে।",
                      "Exam commences at 9:00 AM. Students must report by 8:30 AM with their printed admit slip."
                    )}
              </p>
            </div>

            {/* Direct Action Link */}
            {showFormLink && (
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/admission-form" className="flex-1 min-w-[200px]">
                  <Button
                    size="lg"
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bengali font-bold text-base shadow-xl shadow-amber-500/20 gap-2 border-0 hover:scale-[1.01] transition-transform"
                  >
                    <span>{t("অনলাইন ভর্তি আবেদন করুন", "Apply Online Form")}</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>

                <a
                  href="tel:01820811511"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-semibold text-white/90 font-bengali transition-colors"
                >
                  <PhoneCall className="h-4 w-4 text-amber-400" />
                  <span>{t("হেল্পলাইন", "Helpline")}</span>
                </a>
              </div>
            )}
          </div>

          {/* Glowing Animated Countdown Clock */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
              {timeUnits.map((unit, idx) => (
                <motion.div
                  key={unit.labelEn}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group rounded-2xl sm:rounded-3xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 p-3 sm:p-5 md:p-6 backdrop-blur-xl shadow-inner shadow-white/5 hover:border-amber-400/50 transition-all"
                >
                  {/* Subtle top indicator bar */}
                  <div className="absolute top-0 inset-x-4 h-1 rounded-full bg-gradient-to-r from-accent to-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
                    {isBn ? toBnDigit(unit.value) : String(unit.value).padStart(2, "0")}
                  </div>

                  <div className="mt-1 sm:mt-2 font-bengali text-[11px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-200">
                    {isBn ? unit.labelBn : unit.labelEn}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/60 font-bengali px-1">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {timeLeft.isExpired
                    ? t("সময় শেষ হয়েছে", "Time Expired")
                    : t("রিয়েল-টাইম লাইভ কাউন্টডাউন চলছে", "Live real-time countdown active")}
                </span>
              </span>
              <span className="font-mono text-amber-300 text-[11px]">
                {t("মাদরাসা কেন্দ্রীয় সময়ানুযায়ী", "Based on BST Institutional Time")}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: 4 Step Milestones Roadmap */}
        {!compact && (
          <div className="pt-4 border-t border-white/10">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-bengali text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-accent" />
                <span>{t("ভর্তি কার্যক্রমের গুরুত্বপূর্ণ ধাপসমূহ", "Key Admission Milestones")}</span>
              </h4>
              <span className="font-bengali text-xs text-amber-200">
                {t("শিক্ষাবর্ষ ২০২৬-২০২৭", "Academic Session 2026-2027")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {milestones.map((m) => {
                const isActive = m.status === "active";
                const isUrgent = m.status === "urgent";

                return (
                  <div
                    key={m.step}
                    className={`rounded-2xl p-4 transition-all border ${
                      isActive
                        ? "border-accent/50 bg-accent/15 shadow-lg shadow-accent/5"
                        : isUrgent
                        ? "border-amber-400/50 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-black text-white/50">{m.step}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold font-bengali ${
                          isActive
                            ? "bg-accent text-white font-bold"
                            : isUrgent
                            ? "bg-amber-400 text-slate-950 font-bold"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {isBn ? m.statusBn : m.statusEn}
                      </span>
                    </div>

                    <h5 className="font-bengali text-sm font-bold text-white leading-snug">
                      {isBn ? m.titleBn : m.titleEn}
                    </h5>
                    <p className="font-bengali text-xs text-slate-200/80 mt-1">
                      {isBn ? m.dateBn : m.dateEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionCountdownBanner;
