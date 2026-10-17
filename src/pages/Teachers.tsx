import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Sparkles,
  Search,
  BookOpen,
  Award,
  Building,
  Heart,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Briefcase,
  Star,
  Compass,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/lib/siteSettings";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";
import {
  getFacultyList,
  type FacultyMember,
  type FacultyRoleCategory,
  type CampusType,
} from "@/lib/faculty";

const categoryPills: { id: "all" | FacultyRoleCategory; labelBn: string; labelEn: string; icon: any }[] = [
  { id: "all", labelBn: "সকল সদস্য", labelEn: "All Members", icon: Users },
  { id: "management", labelBn: "পরিচালনা পরিষদ", labelEn: "Governing Body", icon: Building },
  { id: "teacher", labelBn: "শিক্ষকমণ্ডলী", labelEn: "Teachers & Instructors", icon: GraduationCap },
  { id: "staff", labelBn: "কর্মকর্তা ও কর্মচারী", labelEn: "Admin & Staff", icon: Briefcase },
];

const Teachers = () => {
  const { t, lang } = useLanguage();
  const { settings } = useSiteSettings();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<"all" | FacultyRoleCategory>("all");
  const [selectedCampus, setSelectedCampus] = useState<"all" | CampusType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getFacultyList();
        setFaculty(data.filter((f) => f.is_active));
      } catch (err) {
        console.error("Failed to load faculty:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredFaculty = useMemo(() => {
    return faculty.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Campus filter
      if (selectedCampus !== "all") {
        if (item.campus !== "both" && item.campus !== selectedCampus) {
          return false;
        }
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          item.name_bn.toLowerCase().includes(q) ||
          item.name_en.toLowerCase().includes(q);
        const matchDesig =
          item.designation_bn.toLowerCase().includes(q) ||
          item.designation_en.toLowerCase().includes(q);
        const matchSubject =
          item.subject_bn?.toLowerCase().includes(q) ||
          item.subject_en?.toLowerCase().includes(q);
        const matchQual =
          item.qualification_bn?.toLowerCase().includes(q) ||
          item.qualification_en?.toLowerCase().includes(q);
        if (!matchName && !matchDesig && !matchSubject && !matchQual) {
          return false;
        }
      }
      return true;
    });
  }, [faculty, selectedCategory, selectedCampus, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary/95 to-emerald-950 py-20 lg:py-28 text-white">
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
              {t("অভিজ্ঞ, যোগ্য ও নিবেদিতপ্রাণ শিক্ষক পরিবার", "Experienced, Qualified & Dedicated Faculty")}
            </span>
          </motion.div>

          <motion.h1
            {...springIn}
            transition={springInDelay(0.05)}
            className="font-bengali text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
          >
            {t("শিক্ষক ও পরিচালকমণ্ডলী", "Teachers & Governing Body")}
          </motion.h1>

          <motion.p
            {...springIn}
            transition={springInDelay(0.1)}
            className="font-bengali text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {t(
              `${settings.institution_name_bn || "আননূর তাহফিজুল কুরআন মাদরাসা"}র গৌরব আমাদের প্রথিতযশা ওস্তাদবৃন্দ ও অভিজ্ঞ শিক্ষকমণ্ডলী। যাদের আন্তরিক স্নেহ, গভীর জ্ঞান ও সার্বক্ষণিক তত্ত্বাবধানে গড়ে উঠছে আদর্শ হাফেজ ও সুনাগরিক।`,
              `The pride of ${settings.institution_name_en || "Annoor Tahfizul Quran Madrasha"} is our distinguished scholars, teachers, and governing board who nurture students with care, profound knowledge, and mentorship.`
            )}
          </motion.p>

          {/* Quick Counter Badges */}
          <motion.div
            {...springIn}
            transition={springInDelay(0.15)}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-bengali text-xs sm:text-sm text-white/90"
          >
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md flex items-center gap-2">
              <Building className="h-4 w-4 text-accent" />
              <span>{t("দক্ষ পরিচালনা পর্ষদ", "Governing Board")}</span>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-300" />
              <span>{t("উচ্চশিক্ষিত ও অভিজ্ঞ শিক্ষকবৃন্দ", "Qualified Educators")}</span>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              <span>{t("নিরাপদ ও সুশৃঙ্খল পরিবেশ", "Safe & Disciplined Campus")}</span>
            </div>
          </motion.div>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Filters and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryPills.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bengali font-medium transition-all ${isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-102"
                        : "border border-border/80 bg-card text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(tab.labelBn, tab.labelEn)}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("নাম, বিষয় বা পদবি দিয়ে খুঁজুন...", "Search by name, subject, or title...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-xs sm:text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Member Cards Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center font-bengali">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-foreground">
              {t("কোনো শিক্ষক বা সদস্য পাওয়া যায়নি", "No members found")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("অনুগ্রহ করে আপনার সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।", "Please adjust your search terms or filters.")}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((member, idx) => {
              const isManagement = member.category === "management";
              return (
                <motion.div
                  key={member.id}
                  {...springIn}
                  transition={springInDelay(Math.min(idx * 0.05, 0.3))}
                  className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${isManagement
                      ? "border-primary/30 bg-gradient-to-b from-primary/5 via-card to-card shadow-sm hover:border-primary/50"
                      : "border-border/80 bg-card shadow-xs hover:border-primary/30"
                    }`}
                >
                  <div>
                    {/* Top Row: Category & Campus Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-bengali ${member.category === "management"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : member.category === "teacher"
                              ? "bg-primary/10 text-primary"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                          }`}
                      >
                        {member.category === "management"
                          ? t("পরিচালনা পরিষদ", "Governing Body")
                          : member.category === "teacher"
                            ? t("শিক্ষক", "Teacher")
                            : t("প্রশাসনিক স্টাফ", "Staff")}
                      </span>

                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground font-bengali">
                        {t("মূল ক্যাম্পাস", "Main Campus")}
                      </span>
                    </div>

                    {/* Member Avatar / Initial */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name_bn}
                            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-display font-extrabold text-2xl ring-2 ring-primary/20 group-hover:scale-105 transition-transform">
                            {member.name_bn.charAt(0)}
                          </div>
                        )}
                        {isManagement && (
                          <span
                            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs"
                            title={t("পরিচালনা পর্ষদ সদস্য", "Governing Member")}
                          >
                            <Star className="h-3 w-3 fill-white" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bengali text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {lang === "bn" ? member.name_bn : member.name_en || member.name_bn}
                        </h3>
                        <p className="font-bengali text-xs font-semibold text-primary/90 mt-0.5 line-clamp-1">
                          {lang === "bn"
                            ? member.designation_bn
                            : member.designation_en || member.designation_bn}
                        </p>
                        {member.experience_bn && (
                          <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground mt-1">
                            {t(member.experience_bn, member.experience_en || member.experience_bn)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject / Specialization */}
                    {member.subject_bn && (
                      <div className="rounded-xl bg-muted/40 p-3 mb-3 text-xs font-bengali">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium mb-1">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          <span>{t("বিষয় / দায়িত্ব:", "Subject / Role:")}</span>
                        </div>
                        <p className="text-foreground font-semibold">
                          {t(member.subject_bn, member.subject_en || member.subject_bn)}
                        </p>
                      </div>
                    )}

                    {/* Qualifications */}
                    {member.qualification_bn && (
                      <div className="space-y-1 text-xs font-bengali text-muted-foreground">
                        <div className="flex items-start gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            {t(member.qualification_bn, member.qualification_en || member.qualification_bn)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact / Email if available */}
                  {(member.email || member.phone) && (
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span>{member.email}</span>
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{member.phone}</span>
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ================= QUALITY ATTRIBUTES OF OUR FACULTY ================= */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 lg:p-12 shadow-sm font-bengali">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-2">
              <Award className="h-3.5 w-3.5" />
              {t("আমাদের শিক্ষকতার মূলনীতি", "Core Teaching Principles")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("কেন আমাদের শিক্ষকমণ্ডলী অনন্য?", "Why Our Faculty Stands Out?")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "শুধুমাত্র পুঁথিগত জ্ঞান নয়, বরং শিক্ষার্থীদের চারিত্রিক গুণাবলি ও ভবিষ্যৎ রূপায়ণে শিক্ষকরা নিরলস কাজ করেন।",
                "Beyond textbook lessons, our teachers dedicate themselves to character building and holistic growth."
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                titleBn: "স্নেহময় ও নির্যাতনমুক্ত",
                titleEn: "Loving & Abuse-Free",
                descBn: "শারীরিক বা মানসিক ভয়ভীতি মুক্ত আনন্দঘন পরিবেশে শিশুদের পাঠদান নিশ্চিত করা হয়।",
                descEn: "Zero tolerance for physical or mental punishment; nurturing joyful learning.",
              },
              {
                icon: Award,
                titleBn: "সনদপ্রাপ্ত ও অভিজ্ঞ",
                titleEn: "Certified Scholars",
                descBn: "জাতীয় ও আন্তর্জাতিক খ্যাতিসম্পন্ন হাফেজ, ক্বারী ও শীর্ষ বিশ্ববিদ্যালয়ের গ্র্যাজুয়েট।",
                descEn: "Renowned Huffaz, Qaris, and graduates from esteemed universities.",
              },
              {
                icon: CheckCircle2,
                titleBn: "ব্যক্তিগত পরিচর্যা",
                titleEn: "Individual Attention",
                descBn: "প্রতিটি শিক্ষার্থীর শেখার গতি অনুযায়ী দুর্বল অংশ চিহ্নিত করে বিশেষ সময় বরাদ্দ।",
                descEn: "Personalized attention tailored to each student's unique learning pace.",
              },
              {
                icon: ShieldCheck,
                titleBn: "নৈতিক আদর্শ ও আদব",
                titleEn: "Moral Ethics & Character",
                descBn: "শিক্ষকদের নিজস্ব সুন্নতি জীবনধারা ও উত্তম আচরণ শিক্ষার্থীদের অনুপ্রাণিত করে।",
                descEn: "Exemplary personal conduct inspiring students toward righteous values.",
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

        {/* ================= CAREERS / JOIN US BANNER ================= */}
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 lg:p-12 shadow-md font-bengali">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>{t("ক্যারিয়ার ও শিক্ষক নিয়োগ", "Careers & Opportunities")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {t("আপনি কি আমাদের শিক্ষক পরিবারে যুক্ত হতে চান?", "Interested in Joining Our Teaching Family?")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "দ্বীনি ও আধুনিক শিক্ষার সমন্বয়ে আত্মনিয়োগ করতে আগ্রহী অভিজ্ঞ শিক্ষক, মুয়াল্লিম ও হাফেজদের আমরা স্বাগত জানাই। আপনার সিভি পাঠাতে আমাদের অফিসে যোগাযোগ করুন।",
                  "We welcome qualified teachers, scholars, and Huffaz passionate about holistic education. Contact our office or submit your resume."
                )}
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
              >
                <span>{t("সিভি জমা দিন / যোগাযোগ", "Contact / Submit CV")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Teachers;
