import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Search,
  Maximize2,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Sparkles,
  Calendar,
  Eye,
  School,
  GraduationCap,
  BookOpen,
  Trophy,
  Grid3X3,
  Columns,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { springIn } from "@/lib/animations";
import { downloadFile } from "@/lib/upload";
import {
  getGalleryList,
  type GalleryItem,
  type GalleryCategory,
} from "@/lib/galleryService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterCategory = "all" | GalleryCategory;

interface CategoryTab {
  id: FilterCategory;
  labelBn: string;
  labelEn: string;
  icon: any;
}

const categoryTabs: CategoryTab[] = [
  { id: "all", labelBn: "সকল ছবি", labelEn: "All Photos", icon: Layers },
  { id: "campus", labelBn: "ক্যাম্পাস ও পরিবেশ", labelEn: "Campus & Facility", icon: School },
  { id: "academic", labelBn: "হিফজ ও একাডেমিক পাঠদান", labelEn: "Hifz & Academic", icon: BookOpen },
  { id: "event", labelBn: "দস্তারবন্দী ও অনুষ্ঠান", labelEn: "Events & Convocation", icon: GraduationCap },
  { id: "achievement", labelBn: "ক্রীড়া ও সাংস্কৃতিক অর্জন", labelEn: "Awards & Sports", icon: Trophy },
];

const Gallery = () => {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutMode, setLayoutMode] = useState<"grid" | "masonry">("grid");

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getGalleryList();
        setItems(data);
      } catch (err) {
        console.error("Failed to load gallery items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle =
          item.title_bn.toLowerCase().includes(q) ||
          item.title_en?.toLowerCase().includes(q);
        const matchCaption =
          item.caption_bn?.toLowerCase().includes(q) ||
          item.caption_en?.toLowerCase().includes(q);
        return matchTitle || matchCaption;
      }
      return true;
    });
  }, [items, activeCategory, searchQuery]);

  // Lightbox Navigation
  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handleNextPhoto = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const handlePrevPhoto = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleCloseLightbox, handleNextPhoto, handlePrevPhoto]);

  // Actions
  const handleDownload = async (item: GalleryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const filename = `${item.title_en || item.title_bn || "annoor_gallery"}.jpg`;
      await downloadFile(item.image_url, filename);
      toast.success(t("ছবি ডাউনলোড শুরু হয়েছে", "Image download started"));
    } catch (err) {
      window.open(item.image_url, "_blank");
    }
  };

  const handleShare = (item: GalleryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}${item.image_url}`);
    setCopiedId(item.id);
    toast.success(t("ছবির লিংক কপি করা হয়েছে", "Image link copied to clipboard"));
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryBadgeLabel = (category: GalleryCategory) => {
    switch (category) {
      case "campus":
        return t("ক্যাম্পাস ও পরিবেশ", "Campus");
      case "academic":
        return t("হিফজ ও পাঠদান", "Hifz & Academic");
      case "event":
        return t("দস্তারবন্দী ও অনুষ্ঠান", "Convocation & Events");
      case "achievement":
        return t("ক্রীড়া ও সাংস্কৃতিক অর্জন", "Awards & Sports");
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ================= HERO HEADER ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary/95 to-primary/90 text-primary-foreground py-20 md:py-24">
        {/* Subtle decorative Islamic pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <motion.div {...springIn} className="mx-auto max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-md border border-white/15 shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>{t("আননূর শিক্ষা পরিবার স্মৃতি অ্যালবাম", "Annoor Education Family Photo Archive")}</span>
            </div>

            <h1 className="font-bengali text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-sm">
              {t("ফটোগ্যালারি ও স্মৃতি অ্যালবাম", "Institutional Photo Gallery")}
            </h1>

            <p className="mx-auto max-w-2xl font-bengali text-sm text-emerald-100/90 sm:text-base leading-relaxed">
              {t(
                "আমাদের মনোরম ক্যাম্পাস, সুশৃঙ্খল শ্রেণি কার্যক্রম, পবিত্র হিফজ সমাপনী অনুষ্ঠান ও বর্ণাঢ্য আয়োজনের স্থিরচিত্রমালা।",
                "Explore memorable glimpses of our scenic campus, disciplined academic life, Dastarbandi convocation, and student achievements."
              )}
            </p>

            {/* Quick Stat Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 border border-white/10 backdrop-blur-sm text-xs font-medium text-emerald-50">
                <ImageIcon className="h-4 w-4 text-accent" />
                <span>{items.length} {t("টি সংরক্ষিত ছবি", "Curated Photos")}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 border border-white/10 backdrop-blur-sm text-xs font-medium text-emerald-50">
                <GraduationCap className="h-4 w-4 text-amber-300" />
                <span>{t("দস্তারবন্দী ও সম্মাননা", "Dastarbandi Honors")}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 border border-white/10 backdrop-blur-sm text-xs font-medium text-emerald-50">
                <School className="h-4 w-4 text-sky-300" />
                <span>{t("আধুনিক ও সুবিন্যস্ত ক্যাম্পাস", "Modern Madrasa Campus")}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>

      {/* ================= CONTROLS & GALLERY ================= */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Controls Bar */}
          <div className="mb-10 space-y-5">
            {/* Category Pills Bar */}
            <div className="flex items-center justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card/60 p-1.5 shadow-sm backdrop-blur-sm">
                {categoryTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 font-bengali text-xs font-semibold sm:text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                      <span>{t(tab.labelBn, tab.labelEn)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & View Mode Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("ছবি বা অ্যালবামের নাম খুঁজুন...", "Search photos or events...")}
                  className="pl-10 h-10 rounded-xl bg-background/80"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <span className="font-bengali text-xs text-muted-foreground">
                  {t(
                    `${filteredItems.length} টি ছবি প্রদর্শিত`,
                    `Showing ${filteredItems.length} photos`
                  )}
                </span>

                <div className="flex items-center gap-1 rounded-xl border border-border/60 p-1 bg-muted/40">
                  <Button
                    variant={layoutMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLayoutMode("grid")}
                    className="h-8 px-2.5 rounded-lg text-xs gap-1.5"
                    title={t("গ্রিড ভিউ", "Grid View")}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("গ্রিড", "Grid")}</span>
                  </Button>
                  <Button
                    variant={layoutMode === "masonry" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLayoutMode("masonry")}
                    className="h-8 px-2.5 rounded-lg text-xs gap-1.5"
                    title={t("মেসনারি ভিউ", "Masonry View")}
                  >
                    <Columns className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("মেসনারি", "Masonry")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= PHOTO GRID ================= */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="mt-4 font-bengali text-sm text-muted-foreground">
                {t("গ্যালারি ছবি লোড হচ্ছে...", "Loading gallery photos...")}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center max-w-lg mx-auto">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <ImageIcon className="h-7 w-7" />
              </div>
              <h3 className="font-bengali text-lg font-bold text-foreground">
                {t("কোনো ছবি পাওয়া যায়নি", "No Photos Found")}
              </h3>
              <p className="mt-1 font-bengali text-xs text-muted-foreground">
                {t(
                  "আপনার সার্চ বা নির্বাচিত ক্যাটাগরিতে কোনো ছবি মেলেনি। অন্য ক্যাটাগরি বেছে নিন।",
                  "No photos matched your filter or search query. Try another category."
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-xl"
              >
                {t("ফিল্টার রিসেট করুন", "Reset Filters")}
              </Button>
            </div>
          ) : (
            <div
              className={
                layoutMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
              }
            >
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className={layoutMode === "masonry" ? "break-inside-avoid" : ""}
                  >
                    <div
                      onClick={() => setLightboxIndex(index)}
                      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                        <img
                          src={item.image_url}
                          alt={item.title_bn}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        />

                        {/* Top Metadata Badges */}
                        <div className="absolute left-3 top-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/20">
                            {getCategoryBadgeLabel(item.category)}
                          </span>

                          {item.date_label && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-200 backdrop-blur-md border border-white/15">
                              <Calendar className="h-3 w-3" />
                              <span>{item.date_label}</span>
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay with Action Buttons */}
                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {/* Quick Action Buttons (Top Right on Hover) */}
                          <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleShare(item, e)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                              title={t("লিংক কপি করুন", "Copy Link")}
                            >
                              {copiedId === item.id ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Share2 className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              onClick={(e) => handleDownload(item, e)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-emerald-600 hover:text-white"
                              title={t("ছবি ডাউনলোড করুন", "Download Photo")}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Title & Preview Hint */}
                          <div className="space-y-1">
                            <h3 className="font-bengali text-base font-bold text-white drop-shadow-md line-clamp-2">
                              {lang === "bn" ? item.title_bn : item.title_en || item.title_bn}
                            </h3>
                            {item.caption_bn && (
                              <p className="font-bengali text-xs text-white/80 line-clamp-2">
                                {lang === "bn" ? item.caption_bn : item.caption_en || item.caption_bn}
                              </p>
                            )}
                            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                              <Maximize2 className="h-3.5 w-3.5" />
                              <span>{t("পূর্ণাঙ্গ আকারে দেখুন", "Click to enlarge")}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Body */}
                      <div className="p-4 bg-card border-t border-border/40">
                        <h4 className="font-bengali text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {lang === "bn" ? item.title_bn : item.title_en || item.title_bn}
                        </h4>
                        {item.caption_bn && (
                          <p className="mt-1 font-bengali text-xs text-muted-foreground line-clamp-1">
                            {lang === "bn" ? item.caption_bn : item.caption_en || item.caption_bn}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* ================= MODERN LIGHTBOX MODAL ================= */}
      <AnimatePresence>
        {activeLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-md"
            onClick={handleCloseLightbox}
          >
            {/* Top Toolbar */}
            <div
              className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-emerald-300 backdrop-blur-md">
                  {lightboxIndex! + 1} / {filteredItems.length}
                </span>
                <span className="hidden sm:inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                  {getCategoryBadgeLabel(activeLightboxItem.category)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleShare(activeLightboxItem, e)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/30 transition-colors"
                  title={t("লিংক কপি", "Copy Link")}
                >
                  {copiedId === activeLightboxItem.id ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Share2 className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={(e) => handleDownload(activeLightboxItem, e)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white backdrop-blur-md hover:bg-emerald-500 transition-colors shadow-lg"
                  title={t("ডাউনলোড", "Download")}
                >
                  <Download className="h-5 w-5" />
                </button>

                <button
                  onClick={handleCloseLightbox}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-rose-600 transition-colors"
                  title={t("বন্ধ করুন (Esc)", "Close (Esc)")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Prev Photo Button */}
            {filteredItems.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPhoto();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all shadow-xl"
                title={t("পূর্ববর্তী ছবি (বাম তীর)", "Previous (Left Arrow)")}
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}

            {/* Next Photo Button */}
            {filteredItems.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all shadow-xl"
                title={t("পরবর্তী ছবি (ডান তীর)", "Next (Right Arrow)")}
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            )}

            {/* Main Lightbox Content Card */}
            <motion.div
              key={activeLightboxItem.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-3xl bg-card border border-white/10 shadow-2xl flex flex-col"
            >
              {/* Image Container */}
              <div className="relative flex items-center justify-center bg-black/90 max-h-[65vh] overflow-hidden">
                <img
                  src={activeLightboxItem.image_url}
                  alt={activeLightboxItem.title_bn}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                />
              </div>

              {/* Caption & Metadata Footer */}
              <div className="bg-card p-5 sm:p-6 border-t border-border/60 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bengali text-lg sm:text-xl font-bold text-foreground">
                    {lang === "bn"
                      ? activeLightboxItem.title_bn
                      : activeLightboxItem.title_en || activeLightboxItem.title_bn}
                  </h3>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryBadgeLabel(activeLightboxItem.category)}
                    </Badge>
                    {activeLightboxItem.date_label && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activeLightboxItem.date_label}
                      </span>
                    )}
                  </div>
                </div>

                {activeLightboxItem.caption_bn && (
                  <p className="font-bengali text-sm text-muted-foreground leading-relaxed">
                    {lang === "bn"
                      ? activeLightboxItem.caption_bn
                      : activeLightboxItem.caption_en || activeLightboxItem.caption_bn}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
