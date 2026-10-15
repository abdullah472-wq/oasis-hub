import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Users,
  Compass,
  HeartHandshake,
  ArrowRight,
  Languages,
  CalendarCheck,
  Search,
  BookCheck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";
import { getCurriculums, type CurriculumProgram } from "@/lib/curriculum";

const categoryIcons: Record<string, any> = {
  nurani: BookOpen,
  nazara: Compass,
  hifz: Award,
  general: GraduationCap,
  tarbiya: HeartHandshake,
};

const categoryLabels: Record<string, { bn: string; en: string }> = {
  all: { bn: "সকল কারিকুলাম", en: "All Curriculums" },
  nurani: { bn: "নূরানী বিভাগ", en: "Nurani Section" },
  nazara: { bn: "নাজেরা ও কিরাত", en: "Nazara & Qirat" },
  hifz: { bn: "হিফজুল কুরআন", en: "Hifz Section" },
  general: { bn: "জেনারেল সমন্বিত", en: "General Education" },
  tarbiya: { bn: "তারবিয়াত ও আদব", en: "Tarbiya & Ethics" },
};

const dailyRoutines = [
  {
    timeBn: "০৪:৩০ - ০৫:৩০",
    timeEn: "04:30 - 05:30",
    titleBn: "তাহাজ্জুদ, ফজর ও কুরআন তিলাওয়াত",
    titleEn: "Tahajjud, Fajr Prayer & Recitation",
    descBn: "উভয় ক্যাম্পাসে জামাতে ফজর নামাজ ও প্রভাতি মুরাকাবা-তিলাওয়াত।",
    descEn: "Congregational Fajr prayer followed by morning remembrance.",
  },
  {
    timeBn: "০৬:০০ - ০৮:৩০",
    timeEn: "06:00 - 08:30",
    titleBn: "হিফজ নতুন সবক ও নূরানী প্রথম অধিবেশন",
    titleEn: "Hifz New Lesson & First Nurani Session",
    descBn: "মস্তিষ্ক সতেজ থাকা অবস্থায় নতুন সবক আত্মস্থকরণ ও শিক্ষকের নিকট সরাসরি শুনানি।",
    descEn: "Fresh morning hours dedicated to learning new Quranic portions.",
  },
  {
    timeBn: "০৮:৩০ - ০৯:৩০",
    timeEn: "08:30 - 09:30",
    titleBn: "পুষ্টিকর নাস্তা ও বিশ্রাম",
    titleEn: "Breakfast & Morning Break",
    descBn: "নিজস্ব ব্যবস্থাপনায় স্বাস্থ্যসম্মত পুষ্টিকর খাবার পরিবেশন।",
    descEn: "Nutritious breakfast prepared in hygienic institution kitchen.",
  },
  {
    timeBn: "০৯:৩০ - ০১:০০",
    timeEn: "09:30 - 01:00",
    titleBn: "সাধারণ শিক্ষা ও স্পোকেন ল্যাঙ্গুয়েজ",
    titleEn: "General Curriculum & Spoken Languages",
    descBn: "বাংলা, ইংরেজি, গণিত, বিজ্ঞান ও আরবি কথোপকথনের আধুনিক পাঠদান।",
    descEn: "Bengali, English, Math, Science & spoken language development.",
  },
  {
    timeBn: "০১:০০ - ০২:৩০",
    timeEn: "01:00 - 02:30",
    titleBn: "যোহরের নামাজ, মধ্যাহ্নভোজ ও কায়লুলা",
    titleEn: "Zuhr Prayer, Lunch & Sunnah Rest",
    descBn: "নামাজ আদায়, পুষ্টিকর মধ্যাহ্নভোজ এবং সুন্নাত অনুযায়ী স্বল্প বিশ্রাম।",
    descEn: "Prayer, wholesome lunch and brief Sunnah rejuvenation nap.",
  },
  {
    timeBn: "০২:৩০ - ০৪:৩০",
    timeEn: "02:30 - 04:30",
    titleBn: "সবকপারা ও পূর্ববর্তী দাওর শুনানি",
    titleEn: "Sabaq Para & Revision Session",
    descBn: "মুখস্থ অংশ স্মৃতিতে অক্ষুণ্ণ রাখতে শিক্ষকদের কড়া তত্ত্বাবধানে রিভিশন।",
    descEn: "Structured revision rounds to solidify memorized lessons.",
  },
  {
    timeBn: "০৪:৩০ - ০৫:৩০",
    timeEn: "04:30 - 05:30",
    titleBn: "আসর নামাজ ও বিকেলে শারীরিক খেলাধুলা",
    titleEn: "Asr Prayer & Supervised Afternoon Sports",
    descBn: "খোলামেলা মাঠে শারীরিক কসরত, ফুটবল, ব্যাডমিন্টন ও ক্রীড়া আনন্দ।",
    descEn: "Supervised outdoor sports for student vitality and refreshment.",
  },
  {
    timeBn: "সন্ধ্যা - এশা",
    timeEn: "Maghrib - Isha",
    titleBn: "মাগরিব, আমদাওর শুনানি ও ডিনার",
    titleEn: "Maghrib, Full Revision & Dinner",
    descBn: "মাগরিব নামাজ, রাতের সবক পুনরাবৃত্তি ও এশার পর সুন্নতি নিয়ম মেনে নিদ্রা।",
    descEn: "Final daily check-ins, dinner, Isha prayer and early sleep.",
  },
];

const Curriculum = () => {
  const { t, lang } = useLanguage();
  const [curriculums, setCurriculums] = useState<CurriculumProgram[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    getCurriculums()
      .then((data) => {
        if (mounted) {
          setCurriculums(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCurriculums = useMemo(() => {
    return curriculums.filter((item) => {
      if (!item.is_active) return false;
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const title = (item.department_bn + " " + item.department_en).toLowerCase();
      const desc = (item.description_bn + " " + item.description_en).toLowerCase();
      const subjects = [
        ...(item.subjects_bn || []),
        ...(item.subjects_en || []),
        ...(item.features_bn || []),
        ...(item.features_en || []),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (title.includes(query) || desc.includes(query) || subjects.includes(query));
    });
  }, [curriculums, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f5e6b3_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div {...springIn} className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent font-bengali uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("দ্বীনি ও সাধারণ শিক্ষার সমন্বিত পাঠক্রম", "Integrated Islamic & Modern Curriculum")}</span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              {t("আমাদের শিক্ষা কারিকুলাম", "Our Educational Curriculum")}
            </h1>

            <p className="font-display text-base md:text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              {t(
                "কুরআনুল কারীমের সহীহ হিফজ ও তাজবীদের সাথে জাতীয় শিক্ষাক্রমের যুগোপযোগী বাংলা, ইংরেজি, গণিত ও আদব-তারবিয়াতের অপূর্ব সমন্বয়।",
                "A balanced, world-class synthesis of authentic Quranic memorization, Tajweed, modern academia, languages, and exemplary character formation."
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/admission-form">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="squishy-button-gold text-sm md:text-base font-bengali"
                >
                  {t("অনলাইন ভর্তি আবেদন", "Online Admission Application")}
                </motion.button>
              </Link>
              <Link to="/admission">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="squishy-button-outline border-white text-white hover:bg-white/10 text-sm md:text-base font-bengali shadow-none"
                >
                  {t("ভর্তি তথ্যাবলী", "Admission Guide")}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
        <WaveDivider className="absolute bottom-0 left-0 right-0 text-background" />
      </section>

      {/* Highlights Strip */}
      <section className="py-8 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground font-bengali text-sm md:text-base">
                  {t("সহীহ নূরানী পদ্ধতি", "Authentic Nurani Method")}
                </p>
                <p className="text-xs text-muted-foreground">{t("বিশুদ্ধ মাখরাজ ও তাজবীদ", "Pure Makhraj & Tajweed")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground font-bengali text-sm md:text-base">
                  {t("আন্তর্জাতিক হিফজ", "International Hifz")}
                </p>
                <p className="text-xs text-muted-foreground">{t("দৈনিক তিন বেলা শুনানি", "3-tier daily reviews")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Languages className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground font-bengali text-sm md:text-base">
                  {t("স্পোকেন আরবি ও ইংরেজি", "Spoken Arabic & English")}
                </p>
                <p className="text-xs text-muted-foreground">{t("সাবলীল কথোপকথন চর্চা", "Interactive fluency")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground font-bengali text-sm md:text-base">
                  {t("সুন্নতি তারবিয়াত", "Sunnah Tarbiya")}
                </p>
                <p className="text-xs text-muted-foreground">{t("আদব ও নৈতিক চরিত্র গঠন", "Character & morals")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Programs Directory */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground">
                {t("বিভাগভিত্তিক শিক্ষা কার্যক্রম", "Departmental Curriculum Programs")}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                {t(
                  "প্রতিটি বিভাগের সুনির্দিষ্ট পাঠ্যক্রম, বৈশিষ্ট্য ও বিষয়সমূহ দেখুন",
                  "Explore detailed syllabus, salient features and curriculum for each department"
                )}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("বিষয় বা বিভাগ খুঁজুন...", "Search subjects or departments...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-full border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 border-b border-border/50">
            {Object.keys(categoryLabels).map((catKey) => {
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold font-bengali transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {t(categoryLabels[catKey].bn, categoryLabels[catKey].en)}
                </button>
              );
            })}
          </div>

          {/* Curriculums Cards Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-sm text-muted-foreground">{t("কারিকুলাম লোড হচ্ছে...", "Loading curriculum...")}</p>
            </div>
          ) : filteredCurriculums.length === 0 ? (
            <div className="card-institutional p-12 text-center max-w-lg mx-auto">
              <Compass className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
              <p className="text-lg font-bold text-foreground">
                {t("কোনো তথ্য খুঁজে পাওয়া যায়নি", "No curriculum found")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("ভিন্ন কোনো অনুসন্ধান দিয়ে আবার চেষ্টা করুন।", "Please try searching with another keyword.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredCurriculums.map((program, index) => {
                  const Icon = categoryIcons[program.category] || BookOpen;
                  const deptTitle = lang === "bn" ? program.department_bn : program.department_en || program.department_bn;
                  const description = lang === "bn" ? program.description_bn : program.description_en || program.description_bn;
                  const ageGroup = lang === "bn" ? program.age_group_bn : program.age_group_en || program.age_group_bn;
                  const duration = lang === "bn" ? program.duration_bn : program.duration_en || program.duration_bn;
                  const subjects = (lang === "bn" ? program.subjects_bn : program.subjects_en) || program.subjects_bn || [];
                  const features = (lang === "bn" ? program.features_bn : program.features_en) || program.features_bn || [];

                  return (
                    <motion.div
                      key={program.id}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={springInDelay(index * 0.08)}
                      className="card-institutional p-6 md:p-8 flex flex-col justify-between border border-border/80 hover:border-primary/30 transition-all hover:shadow-xl group"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-snug">
                                {deptTitle}
                              </h3>
                              <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                                {t(
                                  categoryLabels[program.category]?.bn || "সাধারণ বিভাগ",
                                  categoryLabels[program.category]?.en || "General Department"
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {ageGroup && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                                <Users className="h-3 w-3 text-primary" />
                                <span>{ageGroup}</span>
                              </span>
                            )}
                            {duration && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{duration}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-foreground/85 text-sm md:text-base leading-relaxed mb-6 font-display">
                          {description}
                        </p>

                        {/* Subjects Syllabus */}
                        {subjects.length > 0 && (
                          <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-primary" />
                              <span>{t("পাঠ্য বিষয় ও সিলেবাস", "Core Subjects & Syllabus")}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {subjects.map((subj, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center rounded-xl bg-card border border-border px-3 py-1.5 text-xs md:text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
                                >
                                  {subj}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Features */}
                        {features.length > 0 && (
                          <div className="mb-6 space-y-2 pt-2 border-t border-border/60">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-accent" />
                              <span>{t("বিশেষ বৈশিষ্ট্যসমূহ", "Key Highlights")}</span>
                            </p>
                            <ul className="space-y-1.5">
                              {features.map((feat, fIdx) => (
                                <li
                                  key={fIdx}
                                  className="flex items-start gap-2 text-xs md:text-sm text-foreground/80 font-medium"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Card Footer CTA */}
                      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                        <Link
                          to="/admission-form"
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent transition-colors font-bengali"
                        >
                          <span>{t("ভর্তি আবেদন করুন", "Apply for Admission")}</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          to="/contact"
                          className="text-xs text-muted-foreground hover:text-foreground font-bengali"
                        >
                          {t("পরামর্শের জন্য যোগাযোগ", "Contact for Counseling")}
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Daily Routine / দৈনিক পাঠদান সময়সূচি */}
      <section className="py-16 bg-muted/40 border-y border-border/70">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary font-bengali mb-3">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>{t("সুশৃঙ্খল সময়ানুবর্তিতা", "Daily Academic Schedule")}</span>
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground">
              {t("শিক্ষার্থীদের দৈনিক রুটিন ও সময়সূচি", "Student Daily Routine & Structure")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl mx-auto">
              {t(
                "ফজর থেকে এশা পর্যন্ত সুনির্দিষ্ট ও ভারসাম্যপূর্ণ পাঠদান, বিশ্রাম এবং খেলাধুলার দৈনন্দিন রূপরেখা।",
                "A balanced, disciplined daily routine blending studies, spiritual elevation, wholesome nourishment, and play."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyRoutines.map((routine, idx) => (
              <div
                key={idx}
                className="card-institutional p-5 border border-border/80 flex items-start gap-4 hover:border-primary/30 transition-shadow"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-secondary text-primary">
                      {lang === "bn" ? routine.timeBn : routine.timeEn}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-base text-foreground mt-1.5">
                    {lang === "bn" ? routine.titleBn : routine.titleEn}
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {lang === "bn" ? routine.descBn : routine.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="card-institutional bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="relative space-y-4">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-white leading-tight">
                {t(
                  "সন্তানের আলোকিত ভবিষ্যতের জন্য আজই ভর্তি নিশ্চিত করুন",
                  "Enroll Your Child for a Blessed & Bright Future"
                )}
              </h2>
              <p className="text-sm md:text-base text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
                {t(
                  "নূরানী, নাজেরা ও হিফজ শাখায় ভর্তি চলছে। আমাদের উভয় ক্যাম্পাসে সরাসরি উপস্থিত হয়ে বা অনলাইনে আবেদন করতে পারেন।",
                  "Admissions open for Nurani, Nazara, and Hifz. Visit our campuses or apply online today."
                )}
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Link to="/admission-form">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="squishy-button-gold text-sm md:text-base font-bengali"
                  >
                    {t("অনলাইন ভর্তি ফর্ম পূরণ করুন", "Fill Online Admission Form")}
                  </motion.button>
                </Link>
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="squishy-button-outline border-white text-white hover:bg-white/10 text-sm md:text-base font-bengali"
                  >
                    {t("ক্যাম্পাস পরিদর্শন ও যোগাযোগ", "Contact & Visit Campus")}
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Curriculum;
