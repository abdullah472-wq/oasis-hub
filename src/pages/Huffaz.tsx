import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Sparkles,
  Search,
  Crown,
  Heart,
  Calendar,
  MapPin,
  UserCheck,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";
import { getHuffazList, type HafezRecord } from "@/lib/huffaz";

const Huffaz = () => {
  const { t, lang } = useLanguage();
  const [huffaz, setHuffaz] = useState<HafezRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCampus, setSelectedCampus] = useState<"all" | "boys" | "girls">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Du'a modal state
  const [duaTarget, setDuaTarget] = useState<HafezRecord | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getHuffazList();
        setHuffaz(data.filter((h) => h.is_active));
      } catch (err) {
        console.error("Failed to load huffaz:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Distinct completion years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    huffaz.forEach((h) => {
      if (h.completion_year) set.add(h.completion_year);
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [huffaz]);

  const filteredHuffaz = useMemo(() => {
    return huffaz.filter((item) => {
      // Year filter
      if (selectedYear !== "all" && item.completion_year !== selectedYear) {
        return false;
      }
      // Campus filter
      if (selectedCampus !== "all" && item.campus !== selectedCampus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          item.name_bn.toLowerCase().includes(q) ||
          item.name_en.toLowerCase().includes(q);
        const matchFather = item.father_name_bn?.toLowerCase().includes(q);
        const matchTeacher = item.teacher_name_bn?.toLowerCase().includes(q);
        const matchDistrict = item.district_bn?.toLowerCase().includes(q);
        if (!matchName && !matchFather && !matchTeacher && !matchDistrict) {
          return false;
        }
      }
      return true;
    });
  }, [huffaz, selectedYear, selectedCampus, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Hero Section with Islamic Quranic Calligraphy Motif */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary/95 to-emerald-950 py-20 lg:py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          {/* Hadith Quote Banner */}
          <motion.div
            {...springIn}
            className="inline-flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md mb-6 text-center"
          >
            <Crown className="h-4 w-4 text-accent" />
            <span className="font-arabic text-base sm:text-lg text-white font-medium">
              خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
            </span>
            <span className="hidden sm:inline text-white/50">•</span>
            <span className="font-bengali text-xs sm:text-sm text-white/90">
              {t("তোমাদের মধ্যে সর্বোত্তম সে, যে কুরআন শেখে ও শেখায় (বুখারী)", "The best of you are those who learn the Quran and teach it")}
            </span>
          </motion.div>

          <motion.h1
            {...springIn}
            transition={springInDelay(0.05)}
            className="font-bengali text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
          >
            {t("কৃতি হাফেজদের তালিকা ও সম্মাননা প্রাচীর", "Wall of Huffaz • Honor Roll")}
          </motion.h1>

          <motion.p
            {...springIn}
            transition={springInDelay(0.1)}
            className="font-bengali text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {t(
              "পবিত্র কুরআনুল কারীমের সম্পূর্ণ ৩০ পারা হেফজ সম্পন্নকারী আননূর শিক্ষা পরিবারের প্রিয় হাফেজ ও হাফেজাদের গৌরবময় সম্মাননা প্রাচীর। মহান আল্লাহ তাদের সিনাকে কুরআনের নূর দ্বারা চির সমুজ্জ্বল রাখুন।",
              "Celebrating our students who completed the full memorization of the Holy Quran. May Allah illuminate their hearts with the eternal light of the Quran."
            )}
          </motion.p>

          {/* Quick Stats Badges */}
          <motion.div
            {...springIn}
            transition={springInDelay(0.15)}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto font-bengali text-xs sm:text-sm text-white"
          >
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md text-center">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-accent block">৫০+</span>
              <span className="text-white/80">{t("সমাপনকারী হাফেজ", "Graduated Huffaz")}</span>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md text-center">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-300 block">২-৩</span>
              <span className="text-white/80">{t("বছর গড় সমাপ্তিকাল", "Avg. Completion Years")}</span>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md text-center">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-amber-300 block">১০০%</span>
              <span className="text-white/80">{t("সহীহ তাজবীদ মান", "Tajweed Accuracy")}</span>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md text-center">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-sky-300 block">দস্তারবন্দী</span>
              <span className="text-white/80">{t("পাগড়ী ও সনদপ্রাপ্ত", "Turban of Honor")}</span>
            </div>
          </motion.div>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Filters and Search */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Year / Batch Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground font-bengali flex items-center gap-1.5 mr-2">
                <Calendar className="h-3.5 w-3.5" />
                {t("হিফজ সমাপন ব্যাচ:", "Completion Batch:")}
              </span>
              <button
                onClick={() => setSelectedYear("all")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bengali font-medium transition-all ${
                  selectedYear === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t("সকল ব্যাচ", "All Batches")}
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bengali font-medium transition-all ${
                    selectedYear === yr
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t(`${yr} ব্যাচ`, `Batch ${yr}`)}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("হাফেজের নাম, পিতা বা জেলা দিয়ে খুঁজুন...", "Search by Hafez name, father, or district...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-xs sm:text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Campus Sub-filter */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground font-bengali flex items-center gap-1.5 mr-2">
              <Filter className="h-3.5 w-3.5" />
              {t("ক্যাম্পাস শাখা:", "Campus Section:")}
            </span>
            {[
              { id: "all", labelBn: "সকল ক্যাম্পাস", labelEn: "All Campuses" },
              { id: "boys", labelBn: "বালক শাখা (হাফেজবৃন্দ)", labelEn: "Boys (Huffaz)" },
              { id: "girls", labelBn: "বালিকা শাখা (হাফেজাবৃন্দ)", labelEn: "Girls (Hafezat)" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCampus(c.id as any)}
                className={`rounded-lg px-3 py-1 text-xs font-bengali font-medium transition-colors ${
                  selectedCampus === c.id
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t(c.labelBn, c.labelEn)}
              </button>
            ))}
          </div>
        </div>

        {/* Huffaz Cards Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : filteredHuffaz.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center font-bengali">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-foreground">
              {t("কোনো হাফেজ রেকর্ড পাওয়া যায়নি", "No Hafez records found")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("অনুগ্রহ করে আপনার ফিল্টার বা অনুসন্ধান শব্দ পরিবর্তন করে দেখুন।", "Try adjusting your filters or search keywords.")}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHuffaz.map((hfz, idx) => (
              <motion.div
                key={hfz.id}
                {...springIn}
                transition={springInDelay(Math.min(idx * 0.05, 0.3))}
                className="group relative rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Header ribbon: Batch & Campus */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary font-bengali">
                      <Calendar className="h-3.5 w-3.5" />
                      {t(`ব্যাচ ${hfz.completion_year}`, `Batch ${hfz.completion_year}`)}
                    </span>

                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground font-bengali">
                      {hfz.campus === "boys" ? t("বালক শাখা", "Boys Section") : t("বালিকা শাখা", "Girls Section")}
                    </span>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="relative">
                      {hfz.image_url ? (
                        <img
                          src={hfz.image_url}
                          alt={hfz.name_bn}
                          className="h-14 w-14 rounded-2xl object-cover ring-2 ring-primary/20"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-primary/10 to-accent/20 text-primary font-display font-black text-xl ring-2 ring-primary/20 group-hover:scale-105 transition-transform">
                          <Crown className="h-6 w-6 text-accent" />
                        </div>
                      )}
                      {hfz.is_featured && (
                        <span
                          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs"
                          title={t("শীর্ষ স্থানাধিকারী", "Top Honoree")}
                        >
                          <Star className="h-3 w-3 fill-white" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bengali text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {lang === "bn" ? hfz.name_bn : hfz.name_en || hfz.name_bn}
                      </h3>
                      {hfz.father_name_bn && (
                        <p className="font-bengali text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {t(`পিতা: ${hfz.father_name_bn}`, `Father: ${hfz.father_name_en || hfz.father_name_bn}`)}
                        </p>
                      )}
                      {hfz.district_bn && (
                        <p className="font-bengali text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                          <span>{t(hfz.district_bn, hfz.district_en || hfz.district_bn)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Award Honor Badge */}
                  {hfz.award_title_bn && (
                    <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-accent/15 to-primary/10 border border-amber-500/20 p-2.5 mb-4 text-xs font-bengali text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-semibold">{t(hfz.award_title_bn, hfz.award_title_en || hfz.award_title_bn)}</span>
                    </div>
                  )}

                  {/* Duration and Teacher Info */}
                  <div className="space-y-2 text-xs font-bengali text-muted-foreground bg-muted/30 rounded-2xl p-3">
                    {hfz.duration_bn && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>{t("হিফজ সম্পন্নকাল:", "Duration:")}</span>
                        </span>
                        <span className="font-bold text-foreground">
                          {t(hfz.duration_bn, hfz.duration_en || hfz.duration_bn)}
                          {hfz.age_at_completion && ` (${hfz.age_at_completion})`}
                        </span>
                      </div>
                    )}

                    {hfz.teacher_name_bn && (
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{t("তত্ত্বাবধায়ক ওস্তাদ:", "Teacher:")}</span>
                        </span>
                        <span className="font-medium text-foreground">
                          {t(hfz.teacher_name_bn, hfz.teacher_name_en || hfz.teacher_name_bn)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Du'a Button */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] font-bengali text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("সম্পূর্ণ ৩০ পারা হিফজ", "Complete 30 Paras")}
                  </span>

                  <button
                    onClick={() => setDuaTarget(hfz)}
                    className="inline-flex items-center gap-1 text-xs font-bengali font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                    <span>{t("দু'আ করুন", "Pray Du'a")}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ================= HIFZ METHODOLOGY & HIGHLIGHTS ================= */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 lg:p-12 shadow-sm font-bengali">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-2">
              <Award className="h-3.5 w-3.5" />
              {t("হিফজুল কুরআন পদ্ধতি", "Our Hifz Methodology")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("কীভাবে আমাদের শিক্ষার্থীরা দ্রুত ও নির্ভুল হিফজ সম্পন্ন করে?", "How Our Students Excel in Quran Memorization?")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "আন্তর্জাতিক মানের তাজবীদ, বৈজ্ঞানিক রিভিশন পদ্ধতি ও স্নেহময় পরিচর্যায় প্রতিটি শিক্ষার্থীকে যত্নসহকারে গড়ে তোলা হয়।",
                "Scientific revision cycles, Tajweed accuracy, and compassionate care ensure solid Quranic retention."
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Crown,
                titleBn: "দস্তারবন্দী সম্মাননা",
                titleEn: "Turban of Honor",
                descBn: "হিফজ সম্পন্নকারী প্রত্যেক শিক্ষার্থীকে বার্ষিক মহতি মাহফিলে ঐতিহ্যবাহী পাগড়ী ও সনদ প্রদান করা হয়।",
                descEn: "Graduating students are honored with traditional turbans and formal completion sanad.",
              },
              {
                icon: BookOpen,
                titleBn: "ত্রিকালীন রিভিশন চক্র",
                titleEn: "3-Tier Revision Routine",
                descBn: "নতুন সবক, সবকপারা এবং পূর্বের পারা (দাওর) নিয়মিত আদায় করে স্মৃতিতে স্থায়ী করা হয়।",
                descEn: "Daily lesson, recent lesson, and multi-para revision ensure long-lasting retention.",
              },
              {
                icon: ShieldCheck,
                titleBn: "আন্তর্জাতিক তাজবীদ",
                titleEn: "International Tajweed",
                descBn: "সহীহ মাখরাজ, সিফাত এবং সুললিত তিলাওয়াতের বিশেষ প্রশিক্ষণ প্রদান করা হয়।",
                descEn: "Rigorous phonetics, makhraj, and melodious recitation training.",
              },
              {
                icon: Heart,
                titleBn: "মমতাময় আবাসিক যত্ন",
                titleEn: "Compassionate Care",
                descBn: "পুষ্টিকর খাদ্য, স্বাস্থ্যসম্মত ঘুম ও সার্বক্ষণিক শিক্ষক সাহচর্যে মানসিক শান্তি নিশ্চিত করা হয়।",
                descEn: "Nutritious diet, healthy rest, and 24/7 loving guidance by resident teachers.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 bg-muted/30 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">
                      {t(feature.titleBn, feature.titleEn)}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(feature.descBn, feature.descEn)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= ENROLL & SPONSOR CTA ================= */}
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 lg:p-12 shadow-md font-bengali">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>{t("হিফজ বিভাগ ভর্তি ও স্পন্সরশিপ", "Enrollment & Hifz Sponsorship")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {t("আপনার সন্তানকেও পবিত্র কুরআনের হাফেজ বানাতে চান?", "Aspiring to Make Your Child a Hafez of the Quran?")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "আননূর শিক্ষা পরিবারের হিফজ বিভাগে নতুন শিক্ষাবর্ষে বালক ও বালিকা শাখায় সীমিত আসনে ভর্তি চলছে। অথবা কোনো সুবিধাবঞ্চিত শিক্ষার্থীকে হাফেজ বানাতে স্পন্সর করতে পারেন।",
                  "Limited seats are open for new admissions in our boys and girls Hifz departments. You can also sponsor an underprivileged child's Hifz journey."
                )}
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap gap-3">
              <Link
                to="/admission-form"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
              >
                <span>{t("হিফজ বিভাগে ভর্তি আবেদন", "Apply for Hifz Admission")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <span>{t("হিফজ স্পন্সর করুন", "Sponsor a Hafez")}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Du'a Modal */}
      {duaTarget && (
        <div
          onClick={() => setDuaTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-primary/30 bg-card p-6 shadow-2xl font-bengali text-center space-y-4"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Crown className="h-7 w-7 text-accent" />
            </div>

            <h3 className="text-xl font-bold text-foreground">
              {duaTarget.name_bn}
            </h3>

            <p className="text-xs text-muted-foreground">
              {t(`হিফজ সমাপন ব্যাচ ${duaTarget.completion_year} • ${duaTarget.district_bn || ""}`, `Graduated in ${duaTarget.completion_year}`)}
            </p>

            <div className="rounded-2xl bg-muted/40 p-4 text-sm text-foreground/90 leading-relaxed font-arabic text-base border border-border/60">
              اللَّهُمَّ اجْعَلْهُ مِنَ الْحَفَظَةِ الْعَامِلِينَ بِكِتَابِكَ، وَارْزُقْ وَالِدَيْهِ تَاجَ الْوَقَارِ يَوْمَ الْقِيَامَةِ
              <p className="font-bengali text-xs text-muted-foreground mt-2 font-normal">
                "হে আল্লাহ! তাকে আপনার কিতাবের আমলকারী হাফেজ হিসেবে কবুল করুন এবং কিয়ামতের ময়দানে তার পিতা-মাতাকে মর্যাদার নূরের মুকুট পরিধান করান। আমিন।"
              </p>
            </div>

            <button
              onClick={() => setDuaTarget(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              {t("আমিন, বন্ধ করুন", "Ameen, Close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Huffaz;
