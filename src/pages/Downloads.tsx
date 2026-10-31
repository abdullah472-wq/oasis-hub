import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  Download,
  Search,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  FileDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Eye,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";
import { downloadFile } from "@/lib/upload";
import {
  getDownloadsList,
  incrementDownloadCounter,
  type DownloadItem,
} from "@/lib/downloadsService";

const categoryPills: { id: "all" | "syllabus" | "routine" | "admission" | "calendar"; labelBn: string; labelEn: string; icon: any }[] = [
  { id: "all", labelBn: "সকল রিসোর্স", labelEn: "All Resources", icon: Layers },
  { id: "syllabus", labelBn: "বার্ষিক সিলেবাস", labelEn: "Syllabus", icon: BookOpen },
  { id: "routine", labelBn: "ক্লাস ও পরীক্ষার রুটিন", labelEn: "Class & Exam Routines", icon: Clock },
  { id: "admission", labelBn: "ভর্তি ফরম ও প্রসপেক্টাস", labelEn: "Admission & Prospectus", icon: FileText },
  { id: "calendar", labelBn: "ক্যালেন্ডার ও ছুটি", labelEn: "Calendar & Holidays", icon: Calendar },
];

const Downloads = () => {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<"all" | "syllabus" | "routine" | "admission" | "calendar">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await getDownloadsList();
        if (isMounted) {
          setItems(data.filter((d) => d.is_active));
        }
      } catch (err) {
        console.error("Failed to load downloads:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownload = async (item: DownloadItem) => {
    try {
      void incrementDownloadCounter(item.id);
      const filename = `${item.title_en || item.title_bn || "annoor_document"}.pdf`;
      await downloadFile(item.file_url, filename);
      toast.success(t("পিডিএফ ডাউনলোড শুরু হয়েছে", "PDF download started"));

      // Update local download count
      setItems((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, download_count: (d.download_count || 0) + 1 } : d))
      );
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open file_url directly
      window.open(item.file_url, "_blank");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle =
          item.title_bn.toLowerCase().includes(q) ||
          item.title_en?.toLowerCase().includes(q);
        const matchDesc =
          item.description_bn?.toLowerCase().includes(q) ||
          item.description_en?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery]);

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
              {t("একাডেমিক রিসোর্স ও সিলেবাস কর্নার", "Academic Resources & PDF Corner")}
            </span>
          </motion.div>

          <motion.h1
            {...springIn}
            transition={springInDelay(0.05)}
            className="font-bengali text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
          >
            {t("ডাউনলোড কর্নার (সিলেবাস ও রুটিন)", "Download Corner (Syllabus & Routine)")}
          </motion.h1>

          <motion.p
            {...springIn}
            transition={springInDelay(0.1)}
            className="font-bengali text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {t(
              "আননূর তাহফিজুল কুরআন মাদরাসার শ্রেণিভিত্তিক বার্ষিক সিলেবাস, ক্লাস ও পরীক্ষার রুটিন, ভর্তি নির্দেশিকা, প্রাতিষ্ঠানিক প্রসপেক্টাস ও একাডেমিক ক্যালেন্ডার সরাসরি পিডিএফ ফরম্যাটে ডাউনলোড করুন।",
              "Download annual syllabuses, class and examination routines, admission guides, and academic calendars in official PDF format."
            )}
          </motion.p>

          {/* Quick Counter */}
          <motion.div
            {...springIn}
            transition={springInDelay(0.15)}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-bengali text-xs sm:text-sm text-white/90"
          >
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" />
              <span>{t("বার্ষিক সিলেবাস ২০২৬", "Annual Syllabus 2026")}</span>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-300" />
              <span>{t("ক্লাস ও পরীক্ষা রুটিন", "Class & Exam Routines")}</span>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-300" />
              <span>{t("ভর্তি ফরম ও প্রসপেক্টাস", "Admission Forms & Prospectus")}</span>
            </div>
          </motion.div>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Category Filter Pills and Search */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryPills.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedCategory === tab.id;
                const count =
                  tab.id === "all"
                    ? items.length
                    : items.filter((d) => d.category === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bengali font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-102"
                        : "border border-border/80 bg-card text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(tab.labelBn, tab.labelEn)}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* View Mode & Search */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("সিলেবাস বা রুটিন খুঁজুন...", "Search syllabus, routine...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-xs sm:text-sm font-bengali text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 text-xs font-bengali shrink-0">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                    viewMode === "cards"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("কার্ড", "Cards")}
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                    viewMode === "table"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("টেবিল", "Table")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads Grid or Table */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center font-bengali">
            <FileDown className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-foreground">
              {t("কোনো ফাইল পাওয়া যায়নি", "No downloads found")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("অনুগ্রহ করে আপনার সার্চ বা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।", "Please adjust your search terms or filters.")}
            </p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                {...springIn}
                transition={springInDelay(Math.min(idx * 0.05, 0.3))}
                className="group relative rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Category Ribbon */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary font-bengali">
                      {item.category === "syllabus" ? (
                        <>
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{t("সিলেবাস", "Syllabus")}</span>
                        </>
                      ) : item.category === "routine" ? (
                        <>
                          <Clock className="h-3.5 w-3.5" />
                          <span>{t("রুটিন", "Routine")}</span>
                        </>
                      ) : item.category === "admission" ? (
                        <>
                          <FileText className="h-3.5 w-3.5" />
                          <span>{t("ভর্তি ও প্রসপেক্টাস", "Admission")}</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{t("ক্যালেন্ডার", "Calendar")}</span>
                        </>
                      )}
                    </span>

                    <span className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold">
                      {item.file_type || "PDF"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bengali text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                    {lang === "bn" ? item.title_bn : item.title_en || item.title_bn}
                  </h3>

                  {/* Description */}
                  {item.description_bn && (
                    <p className="font-bengali text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {lang === "bn"
                        ? item.description_bn
                        : item.description_en || item.description_bn}
                    </p>
                  )}

                  {/* Meta: Size and Download Count */}
                  <div className="flex items-center gap-4 text-xs font-bengali text-muted-foreground bg-muted/40 rounded-xl p-2.5 mb-4">
                    <span>
                      {t("সাইজ:", "Size:")}{" "}
                      <strong className="text-foreground">{item.file_size_label || "1.2 MB"}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {t("ডাউনলোড:", "Downloads:")}{" "}
                      <strong className="text-foreground">{item.download_count || 0}</strong>
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(item)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bengali font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    <span>{t("ডাউনলোড PDF", "Download PDF")}</span>
                  </button>

                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title={t("প্রিভিউ দেখুন", "Preview Document")}
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-bengali text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th className="py-3.5 px-4 font-semibold">{t("ডকুমেন্টের নাম", "Document Name")}</th>
                    <th className="py-3.5 px-4 font-semibold">{t("ক্যাটাগরি", "Category")}</th>
                    <th className="py-3.5 px-4 font-semibold">{t("সাইজ ও ফরম্যাট", "Size & Format")}</th>
                    <th className="py-3.5 px-4 font-semibold text-center">{t("ডাউনলোড", "Downloads")}</th>
                    <th className="py-3.5 px-4 text-right font-semibold">{t("অ্যাকশন", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 font-bold">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {lang === "bn" ? item.title_bn : item.title_en || item.title_bn}
                            </p>
                            {item.description_bn && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description_bn}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {item.category === "syllabus"
                            ? t("সিলেবাস", "Syllabus")
                            : item.category === "routine"
                            ? t("রুটিন", "Routine")
                            : item.category === "admission"
                            ? t("ভর্তি ফরম", "Admission")
                            : t("ক্যালেন্ডার", "Calendar")}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-muted-foreground">
                        {item.file_size_label || "1.0 MB"} ({item.file_type || "PDF"})
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-foreground">
                        {item.download_count || 0}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleDownload(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{t("ডাউনলোড", "Download")}</span>
                        </button>
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:bg-muted"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= HELP & GUIDELINES ================= */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 lg:p-12 shadow-sm font-bengali">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileDown className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {t("পিডিএফ ফাইল পড়ার নিয়ম", "How to View PDFs")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  "যেকোনো স্মার্টফোন বা কম্পিউটারে গুগল ক্রোম, ফায়ারফক্স বা এডোবি রিডার দিয়ে সরাসরি ফাইলগুলো ওপেন ও প্রিন্ট করতে পারবেন।",
                  "Open and print files using Adobe Acrobat, Chrome, Firefox, or any PDF viewer on mobile and PC."
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {t("নিয়মিত পড়া প্রস্তুতি", "Daily Lesson Preparation")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  "বার্ষিক সিলেবাস অনুযায়ী বাসায় পড়ার দৈনিক সূচি প্রস্তুত রাখুন যাতে শিক্ষার্থী কোনো পাঠে পিছিয়ে না পড়ে।",
                  "Follow the syllabus guidelines to keep your child ahead in daily school and madrasa lessons."
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {t("প্রয়োজনে সহায়তা ডেস্ক", "Need Support?")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  "কোনো ফাইল ডাউনলোড করতে অসুবিধা হলে বা হার্ডকপি ফরম প্রয়োজন হলে সরাসরি ক্যাম্পাস অফিসে যোগাযোগ করুন।",
                  "Contact our campus office if you need physical hardcopies or encounter any download difficulties."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ================= ADMISSION BANNER ================= */}
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 lg:p-12 shadow-md font-bengali">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>{t("অনলাইন ভর্তি আবেদন", "Online Admission Application")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {t("অনলাইনে সরাসরি ভর্তি ফরম পূরণ করতে চান?", "Prefer Applying Online Directly?")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "কাগজবিহীন সহজ প্রক্রিয়ায় মাত্র কয়েক মিনিটে ঘরে বসেই অনলাইন ভর্তি আবেদন সম্পন্ন করা সম্ভব।",
                  "Complete your admission application in just a few minutes from home with our seamless paperless form."
                )}
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap gap-3">
              <Link
                to="/admission-form"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
              >
                <span>{t("অনলাইন ভর্তি ফরম পূরণ করুন", "Fill Online Admission Form")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Downloads;
