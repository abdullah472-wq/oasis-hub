import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Download,
  Clock,
  Printer,
  ChevronRight,
  UserCheck,
  BadgeCheck,
  Utensils,
  Home as HomeIcon,
  BookOpen,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import AdmissionCountdownBanner from "@/components/admission/AdmissionCountdownBanner";
import { springIn, springInDelay } from "@/lib/animations";
import {
  getFeeItems,
  getAdmissionRules,
  type FeeStructureItem,
  type AdmissionRuleItem,
} from "@/lib/admissionInfo";

const Admission = () => {
  const { t } = useLanguage();
  const [feeItems, setFeeItems] = useState<FeeStructureItem[]>([]);
  const [rules, setRules] = useState<AdmissionRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  useEffect(() => {
    async function loadData() {
      try {
        const [feesData, rulesData] = await Promise.all([
          getFeeItems(),
          getAdmissionRules(),
        ]);
        setFeeItems(feesData.filter((f) => f.is_active));
        setRules(rulesData);
      } catch (err) {
        console.error("Failed to load admission info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const steps = [
    {
      num: "০১",
      titleBn: "ভর্তি ফরম সংগ্রহ ও জমা",
      titleEn: "Collect & Submit Form",
      descBn: "অনলাইনে ওয়েবসাইটের মাধ্যমে অথবা সরাসরি ক্যাম্পাস অফিস থেকে ফরম সংগ্রহ করে নির্ভুলভাবে পূরণ করুন।",
      descEn: "Apply online through our website or collect the application form in person from the campus office.",
    },
    {
      num: "০২",
      titleBn: "ভর্তি পরীক্ষা ও মৌখিক যাচাই",
      titleEn: "Admission Test & Interview",
      descBn: "নির্ধারিত তারিখে শিক্ষার্থীর বয়স ও শ্রেণিভিত্তিক মেধা যাচাই এবং মৌলিক বিষয়ে মৌখিক মূল্যায়ন।",
      descEn: "Age and grade-appropriate entrance assessment along with an interview on fundamental knowledge.",
    },
    {
      num: "০৩",
      titleBn: "ফলাফল প্রকাশ ও নির্বাচিত তালিকা",
      titleEn: "Result Publication",
      descBn: "পরীক্ষার ৩ কার্যদিবসের মধ্যে প্রতিষ্ঠানের নোটিশ বোর্ড ও অনলাইনে উত্তীর্ণ শিক্ষার্থীদের ফলাফল প্রকাশ।",
      descEn: "Successful candidate list published within 3 working days on the notice board and online.",
    },
    {
      num: "০৪",
      titleBn: "ফি পরিশোধ ও চূড়ান্ত ভর্তি নিশ্চয়ন",
      titleEn: "Fee Payment & Confirmation",
      descBn: "প্রয়োজনীয় কাগজপত্র জমা এবং নির্ধারিত ভর্তি ফি পরিশোধ সাপেক্ষে শিক্ষার্থীকে আইডি ও রসিদ প্রদান।",
      descEn: "Submit required documents and complete payment to receive the student ID card and receipt.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary/95 to-emerald-950 py-20 lg:py-28 text-white">
        {/* Background Islamic Pattern & Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <motion.div
            {...springIn}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md mb-6"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-bengali text-sm font-medium text-white/95">
              {t("ভর্তি শিক্ষাবর্ষ ২০২৬-২০২৭ চলছে", "Admissions Open for Academic Year 2026-2027")}
            </span>
          </motion.div>

          <motion.h1
            {...springIn}
            transition={springInDelay(0.05)}
            className="font-bengali text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
          >
            {t("ভর্তি তথ্য ও ফি কাঠামো", "Admission Guide & Fee Structure")}
          </motion.h1>

          <motion.p
            {...springIn}
            transition={springInDelay(0.1)}
            className="font-bengali text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {t(
              "আননূর শিক্ষা পরিবারে আদর্শ দ্বীনি ও আধুনিক যুগোপযোগী শিক্ষার সমন্বয়। স্বচ্ছ ফি নীতি ও সুশৃঙ্খল ভর্তি প্রক্রিয়ায় অংশ নিতে বিস্তারিত জেনে নিন।",
              "A harmonious blend of authentic Islamic and modern education at Annoor Education Family. Explore our transparent fee policy and admission guidelines."
            )}
          </motion.p>

          <motion.div
            {...springIn}
            transition={springInDelay(0.15)}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              to="/admission-form"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-bengali text-base font-semibold text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all active:scale-95"
            >
              <span>{t("অনলাইন ভর্তি আবেদন", "Apply Online Now")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#fee-structure"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 font-bengali text-base font-medium text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              <span>{t("ফি বিবরণী দেখুন", "View Fee Details")}</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3.5 font-bengali text-sm font-medium text-white/90 backdrop-blur-sm hover:bg-white/15 transition-all print:hidden"
              title={t("প্রিন্ট করুন", "Print Page")}
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">{t("প্রিন্ট / সেভ", "Print / Save")}</span>
            </button>
          </motion.div>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>

      {/* Quick Jump Navigation Pill Bar */}
      <nav aria-label="Page navigation" className="sticky top-20 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md py-3 shadow-xs">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto no-scrollbar py-1 text-sm font-bengali">
            <a
              href="#countdown-notice"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span>{t("সময়সূচি ও কাউন্টডাউন", "Countdown & Notice")}</span>
            </a>
            <a
              href="#fee-structure"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>{t("ফি কাঠামো", "Fee Structure")}</span>
            </a>
            <a
              href="#rules-requirements"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{t("ভর্তির নিয়মাবলী", "Rules")}</span>
            </a>
            <a
              href="#required-documents"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>{t("প্রয়োজনীয় কাগজপত্র", "Documents")}</span>
            </a>
            <a
              href="#admission-steps"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <GraduationCap className="h-4 w-4" />
              <span>{t("ভর্তি প্রক্রিয়া", "Process")}</span>
            </a>
            <a
              href="#academic-calendar"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>{t("একাডেমিক ক্যালেন্ডার", "Calendar")}</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-20">
        {/* ================= SECTION 0: LIVE COUNTDOWN & NOTICE BANNER ================= */}
        <section id="countdown-notice" className="scroll-mt-36">
          <AdmissionCountdownBanner />
        </section>

        {/* ================= SECTION 1: FEE STRUCTURE ================= */}
        <section id="fee-structure" className="scroll-mt-36">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 font-bengali mb-2">
                <CreditCard className="h-3.5 w-3.5" />
                <span>{t("স্বচ্ছ ও সুনির্দিষ্ট হিসাব", "Transparent & Fixed Structure")}</span>
              </div>
              <h2 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
                {t("ফি কাঠামো বিবরণী", "Fee Structure Overview")}
              </h2>
              <p className="font-bengali text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl">
                {t(
                  "সকল শ্রেণির জন্য নির্ধারিত ফি সূচি। কোনো ধরনের অপ্রকাশ্য বা অতিরিক্ত চার্জ নেই।",
                  "Fixed fee schedule across all departments. No hidden or unannounced charges."
                )}
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 self-start md:self-auto rounded-xl border border-border bg-card p-1 text-xs font-bengali shadow-xs">
              <button
                onClick={() => setViewMode("cards")}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  viewMode === "cards"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("কার্ড ভিউ", "Card View")}
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("টেবিল ভিউ", "Table View")}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-muted/60" />
              ))}
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {feeItems.map((item, idx) => {
                const isHighlight = item.highlight;
                return (
                  <motion.div
                    key={item.id}
                    {...springIn}
                    transition={springInDelay(idx * 0.05)}
                    className={`relative rounded-2xl p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                      isHighlight
                        ? "border-2 border-primary/40 bg-gradient-to-b from-primary/5 via-card to-card shadow-md shadow-primary/5 ring-1 ring-primary/20"
                        : "border border-border/80 bg-card shadow-sm hover:border-border"
                    }`}
                  >
                    {isHighlight && (
                      <div className="absolute -top-3 right-6">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow-xs">
                          <Sparkles className="h-3 w-3" />
                          {t("জনপ্রিয় সুবিধা", "Most Chosen")}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-bengali">
                          {item.category === "tuition"
                            ? t("মাসিক ফি", "Monthly")
                            : item.category === "admission"
                            ? t("ভর্তি ফি", "Enrollment")
                            : item.category === "exam"
                            ? t("পরীক্ষা ফি", "Examination")
                            : t("অন্যান্য", "Other")}
                        </span>
                        {item.category === "tuition" && isHighlight ? (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <HomeIcon className="h-3.5 w-3.5" />
                            <Utensils className="h-3.5 w-3.5" />
                          </div>
                        ) : null}
                      </div>

                      <h3 className="font-bengali text-lg sm:text-xl font-bold text-foreground mb-2 leading-snug">
                        {t(item.type_bn, item.type_en || item.type_bn)}
                      </h3>

                      <div className="my-4">
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                          {t(item.amount_bn, item.amount_en || item.amount_bn)}
                        </div>
                      </div>

                      <div className="rounded-xl bg-muted/50 p-3 text-xs sm:text-sm font-bengali text-muted-foreground flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{t(item.note_bn, item.note_en || item.note_bn)}</span>
                      </div>
                    </div>

                    {isHighlight && (
                      <div className="mt-4 pt-4 border-t border-border/60">
                        <p className="font-bengali text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                          <BadgeCheck className="h-4 w-4 shrink-0" />
                          {t(
                            "৩ বেলা সুষম পুষ্টিকর খাবার, আরামদায়ক শয্যা ও সার্বক্ষণিক তত্ত্বাবধান অন্তর্ভুক্ত।",
                            "Includes 3 nutritious meals, comfortable bedding, and 24/7 care."
                          )}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-bengali">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="py-4 px-6 text-sm font-semibold text-foreground">
                        {t("ফি ধরন", "Fee Type")}
                      </th>
                      <th className="py-4 px-6 text-sm font-semibold text-foreground">
                        {t("পরিমাণ", "Amount")}
                      </th>
                      <th className="py-4 px-6 text-sm font-semibold text-foreground">
                        {t("মন্তব্য / সুবিধা", "Remarks & Notes")}
                      </th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-foreground">
                        {t("পরিশোধের মেয়াদ", "Frequency")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {feeItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-muted/30 ${
                          item.highlight ? "bg-primary/5 font-medium" : ""
                        }`}
                      >
                        <td className="py-4 px-6 text-foreground font-semibold">
                          <div className="flex items-center gap-2">
                            <span>{t(item.type_bn, item.type_en || item.type_bn)}</span>
                            {item.highlight && (
                              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                {t("আবাসিক", "Boarding")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-display text-lg font-bold text-primary">
                          {t(item.amount_bn, item.amount_en || item.amount_bn)}
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-foreground">
                          {t(item.note_bn, item.note_en || item.note_bn)}
                        </td>
                        <td className="py-4 px-6 text-right text-xs text-muted-foreground">
                          {item.category === "tuition"
                            ? t("প্রতি মাসে", "Monthly")
                            : item.category === "admission"
                            ? t("এককালীন", "One-time")
                            : item.category === "exam"
                            ? t("প্রতি পরীক্ষা", "Per Exam")
                            : t("প্রয়োজন মাফিক", "On demand")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Security / Transparent Notice */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bengali text-base font-bold text-foreground">
                  {t("ফি পরিশোধের মাধ্যম ও স্বচ্ছতা", "Payment Modes & Transparency")}
                </h4>
                <p className="font-bengali text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {t(
                    "ক্যাম্পাস ক্যাশ কাউন্টার ছাড়াও বিকাশ, নগদ, রকেট ও নির্ধারিত ব্যাংক অ্যাকাউন্টের মাধ্যমে অফিসিয়াল রসিদ সহ ফি প্রদান করা যায়।",
                    "Fees can be paid at campus accounts counters or through bKash, Nagad, Rocket, and designated bank accounts with official receipts."
                  )}
                </p>
              </div>
            </div>

            <Link
              to="/contact"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-background px-4 py-2 font-bengali text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              <span>{t("হিসাব শাখায় যোগাযোগ", "Contact Accounts")}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ================= SECTION 2: ADMISSION RULES & REQUIREMENTS ================= */}
        <section id="rules-requirements" className="scroll-mt-36">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 cols: Admission Rules */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-semibold text-accent-foreground font-bengali mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  <span>{t("ভর্তির প্রধান শর্তাবলী", "Key Admission Conditions")}</span>
                </div>
                <h2 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
                  {t("ভর্তির নিয়মাবলী", "Admission Rules & Guidelines")}
                </h2>
                <p className="font-bengali text-sm text-muted-foreground mt-1">
                  {t(
                    "ভর্তিচ্ছু প্রত্যেক শিক্ষার্থী ও সম্মানিত অভিভাবককে প্রতিষ্ঠানের নিয়মাবলী অনুসরণ করতে হবে।",
                    "All applicants and guardians must comply with institutional regulations."
                  )}
                </p>
              </div>

              <div className="space-y-4 font-bengali">
                {rules
                  .filter((r) => r.type === "rule")
                  .map((rule, idx) => (
                    <motion.div
                      key={rule.id}
                      {...springIn}
                      transition={springInDelay(idx * 0.05)}
                      className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-colors flex items-start gap-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-foreground leading-relaxed">
                          {t(rule.rule_bn, rule.rule_en || rule.rule_bn)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rule.is_required
                            ? t("বাধ্যতামূলক শর্ত", "Mandatory requirement")
                            : t("প্রযোজ্য ক্ষেত্রে", "If applicable")}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                {/* Additional Guidelines Note */}
                <div className="rounded-2xl border border-border bg-muted/40 p-5 space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <h4 className="font-bold text-foreground flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span>{t("আদর্শ ছাত্রসুলভ আচরণ ও নিয়মশৃঙ্খলা", "Student Conduct & Discipline")}</span>
                  </h4>
                  <p>
                    {t(
                      "মাদরাসা ও স্কুলের ক্লাসে নিয়মিত উপস্থিতি আবশ্যক। অসুস্থতা বা জরুরি কারণ ব্যতীত ছুটি মঞ্জুর করা হবে না। অভিভাবক সমাবেশ ও ফলাফল দিবসে অভিভাবকের উপস্থিতি অপরিহার্য।",
                      "Regular class attendance is mandatory. Leave will only be granted for medical or unavoidable emergencies. Guardian presence at PTA meetings is required."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Required Documents Checklist */}
            <div id="required-documents" className="lg:col-span-6 space-y-6 scroll-mt-36">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 font-bengali mb-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{t("প্রয়োজনীয় ডকুমেন্টস", "Required Documents")}</span>
                </div>
                <h2 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
                  {t("আবশ্যকীয় কাগজপত্র চেকলিস্ট", "Document Submission Checklist")}
                </h2>
                <p className="font-bengali text-sm text-muted-foreground mt-1">
                  {t(
                    "ভর্তির সময় নিম্নে উল্লেখিত মূল কপি ও ফটোকপি অফিসে জমা প্রদান করতে হবে।",
                    "Bring original and attested photocopies at the time of admission."
                  )}
                </p>
              </div>

              <div className="space-y-3 font-bengali">
                {rules
                  .filter((r) => r.type === "document")
                  .map((doc, idx) => (
                    <motion.div
                      key={doc.id}
                      {...springIn}
                      transition={springInDelay(idx * 0.05)}
                      className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center justify-between gap-3 group hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-foreground">
                            {t(doc.rule_bn, doc.rule_en || doc.rule_bn)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {doc.is_required
                              ? t("বাধ্যতামূলক জমা দিতে হবে", "Mandatory submission")
                              : t("যদি থাকে (ঐচ্ছিক)", "If available (optional)")}
                          </span>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {t("ফটোকপি", "Copy")}
                      </span>
                    </motion.div>
                  ))}
              </div>

              {/* Ready Checklist Box */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-xs sm:text-sm font-bengali text-muted-foreground flex items-start gap-3">
                <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">
                    {t("ফরম জমা দেওয়ার পূর্ব প্রস্তুতি", "Before Submitting the Form")}
                  </p>
                  <p className="mt-0.5">
                    {t(
                      "অনলাইনে আবেদনের ক্ষেত্রে শিক্ষার্থীর পাসপোর্ট সাইজ ছবি ও জন্ম সনদের স্ক্যান কপি সংযুক্ত করতে হবে। সরাসরি আবেদনকারীরা ফর্মের সাথে স্টেপল করে জমা দিন।",
                      "For online applications, upload clear digital scans. For in-person submissions, staple the documents securely to the application form."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: STEP-BY-STEP ADMISSION PROCESS ================= */}
        <section id="admission-steps" className="scroll-mt-36">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary font-bengali mb-2">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{t("সহজ ভর্তি গাইড", "Simple 4-Step Process")}</span>
            </div>
            <h2 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
              {t("ভর্তি প্রক্রিয়ার ৪টি সহজ ধাপ", "4 Simple Steps to Admission")}
            </h2>
            <p className="font-bengali text-sm text-muted-foreground mt-1">
              {t(
                "কোনো জটিলতা ছাড়া খুব সহজেই আপনার সন্তানের ভর্তি সম্পন্ন করুন।",
                "Complete your child's enrollment effortlessly without hassles."
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 font-bengali">
            {steps.map((st, i) => (
              <motion.div
                key={i}
                {...springIn}
                transition={springInDelay(i * 0.08)}
                className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-display text-3xl font-extrabold text-primary/40">
                      {st.num}
                    </span>
                    <span className="rounded-full bg-primary/10 p-2 text-primary">
                      {i === 0 ? (
                        <FileText className="h-4 w-4" />
                      ) : i === 1 ? (
                        <UserCheck className="h-4 w-4" />
                      ) : i === 2 ? (
                        <BadgeCheck className="h-4 w-4" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {t(st.titleBn, st.titleEn)}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t(st.descBn, st.descEn)}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 text-xs font-medium text-primary flex items-center gap-1">
                  <span>{t(`ধাপ ${st.num}`, `Step ${i + 1}`)}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: ACADEMIC CALENDAR & EXAMS ================= */}
        <section id="academic-calendar" className="scroll-mt-36">
          <div className="rounded-3xl border border-border/80 bg-card p-8 lg:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 font-bengali mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{t("বার্ষিক শিক্ষাপঞ্জি", "Annual Schedule")}</span>
                </div>
                <h2 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
                  {t("একাডেমিক ক্যালেন্ডার ও ছুটির তালিকা", "Academic Calendar & Term Holidays")}
                </h2>
                <p className="font-bengali text-sm text-muted-foreground mt-1">
                  {t(
                    "পরীক্ষা ও প্রধান ছুটির সময়সূচি সম্পর্কে আগে থেকেই অবগত থাকুন।",
                    "Stay informed about examination periods and institutional vacations."
                  )}
                </p>
              </div>

              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 font-bengali text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start md:self-auto"
              >
                <span>{t("পূর্ণাঙ্গ ইভেন্ট ক্যালেন্ডার", "Full Events Calendar")}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8 font-bengali">
              {/* Examinations */}
              <div className="space-y-4 rounded-2xl bg-muted/40 p-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>{t("পরীক্ষা ও মূল্যায়ন সমূহ", "Examinations & Assessments")}</span>
                </h3>

                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    {
                      title: t("মাসিক ক্লাস টেস্ট ও সবকপারা মূল্যায়ন", "Monthly Class Tests & Review"),
                      desc: t("প্রতি মাসের শেষ সপ্তাহে অনুষ্ঠিত হয়।", "Held in the final week of each month."),
                    },
                    {
                      title: t("১ম সাময়িক ও ত্রৈমাসিক পরীক্ষা", "First Term & Quarterly Assessment"),
                      desc: t("বছরের প্রথম ত্রৈমাসিক সিলেবাস সম্পন্ন শেষে।", "At the end of first quarter syllabus."),
                    },
                    {
                      title: t("অর্ধ-বার্ষিক পরীক্ষা ও মেধা মূল্যায়ন", "Mid-term & Half-yearly Examination"),
                      desc: t("জুন-জুলাই মাসে সার্বিক মূল্যায়ন ও রিপোর্ট কার্ড প্রকাশ।", "Conducted in June-July with progress cards."),
                    },
                    {
                      title: t("বার্ষিক চূড়ান্ত পরীক্ষা ও পুরষ্কার বিতরণ", "Annual Final Exam & Prize Giving"),
                      desc: t("নভেম্বর-ডিসেম্বর মাসে চূড়ান্ত পরীক্ষা ও সনদ প্রদান।", "Held in Nov-Dec with certificates and prizes."),
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-card p-3 border border-border/60">
                      <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Annual Holidays */}
              <div className="space-y-4 rounded-2xl bg-muted/40 p-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <span>{t("প্রধান বাৎসরিক ছুটিসমূহ", "Major Annual Vacations")}</span>
                </h3>

                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    {
                      title: t("পবিত্র মাহে রমজান ও ঈদুল ফিতর", "Holy Ramadan & Eid ul-Fitr"),
                      desc: t("রমজানের শেষ দশক থেকে ঈদুল ফিতর পরবর্তী সময় পর্যন্ত।", "From last 10 days of Ramadan till Eid."),
                    },
                    {
                      title: t("পবিত্র ঈদুল আযহা ও হজ্ব ছুটি", "Holy Eid ul-Adha Vacations"),
                      desc: t("জিলহজ্জ মাসের ৯ তারিখ হতে নির্ধারিত মেয়াদে।", "During the Hajj & Qurbani days."),
                    },
                    {
                      title: t("শীতকালীন অবকাশ ও বার্ষিক ছুটি", "Winter & Post-Exam Recess"),
                      desc: t("বার্ষিক পরীক্ষার ফলাফল পরবর্তী সংক্ষিপ্ত বিশ্রামকালীন অবকাশ।", "Brief vacation following final results."),
                    },
                    {
                      title: t("জাতীয় ও ইসলামি বিশেষ দিবসসমূহ", "National & Islamic Significant Days"),
                      desc: t("সরকারি ও ধর্মীয় গুরুত্বপূর্ণ দিবসসমূহে ক্লাস বন্ধ থাকে।", "Observed as per institutional calendar."),
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-card p-3 border border-border/60">
                      <span className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: ADMISSION DESK & HELPLINE ================= */}
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 lg:p-12 shadow-md">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 font-bengali">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3.5 py-1 text-xs font-semibold text-primary">
                <PhoneCall className="h-3.5 w-3.5" />
                {t("ভর্তি তথ্য ও সহায়তা ডেস্ক", "Admission Support Desk")}
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {t("ভর্তি সংক্রান্ত যে কোনো তথ্যের জন্য সরাসরি কথা বলুন", "Need Help or Have Questions About Admissions?")}
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {t(
                  "ফি কাঠামো, আবাসিক সুবিধা, পরিবহন রুট কিংবা ভর্তি পরীক্ষা নিয়ে কোনো প্রশ্ন থাকলে আমাদের ভর্তি পরামর্শকের সাথে কথা বলুন। সরাসরি ক্যাম্পাসে এসেও তথ্য ও ফরম সংগ্রহ করা যাবে।",
                  "Contact our admission counselors regarding fee structures, boarding facilities, transport routes, or test guidelines. You can also visit our campus in person."
                )}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("হটলাইন / ভর্তি ডেস্ক", "Hotline / Desk")}</p>
                    <a
                      href="tel:01819000000"
                      className="text-base font-bold text-foreground hover:text-primary transition-colors"
                    >
                      +880 1819-000000
                    </a>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("অফিস সময়সূচি", "Office Hours")}</p>
                    <p className="text-sm font-bold text-foreground">
                      {t("সকাল ৮:০০ - বিকাল ৪:০০ (শনিবার-বৃহস্পতিবার)", "8:00 AM - 4:00 PM (Sat-Thu)")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 text-center lg:text-right space-y-4">
              <Link
                to="/admission-form"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bengali text-lg font-bold text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
              >
                <span>{t("অনলাইন ভর্তি ফরম পূরণ করুন", "Fill Online Admission Form")}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/curriculum"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 font-bengali text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <span>{t("আমাদের শিক্ষা কারিকুলাম দেখুন", "View Our Curriculum")}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admission;
