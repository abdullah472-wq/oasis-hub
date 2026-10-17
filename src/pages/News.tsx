import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Send,
  CheckCircle2,
  Tag,
  Newspaper,
  Sparkles,
  ArrowRight,
  Shield,
  Eye,
  BookOpen,
  MessageCircle,
  Mail,
  Share2,
  Layers,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import {
  getNewsFromFirestore,
  deleteNewsFromFirestore,
  type NewsPost,
} from "@/lib/news";
import { subscribeToNews } from "@/lib/subscribers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NewsDialog } from "@/components/admin/content/NewsDialog";
import { FacebookEmbed } from "@/components/FacebookEmbed";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22 12.07C22 6.5 17.52 2 11.93 2C6.35 2 1.86 6.5 1.86 12.07C1.86 17.1 5.53 21.26 10.33 22v-7.05H7.7v-2.88h2.63V9.85c0-2.6 1.55-4.04 3.93-4.04c1.14 0 2.33.2 2.33.2v2.56h-1.31c-1.29 0-1.69.8-1.69 1.62v1.95h2.88l-.46 2.88h-2.42V22c4.8-.74 8.47-4.9 8.47-9.93Z" />
  </svg>
);

const CATEGORIES = [
  { value: "all", labelBn: "সব সংবাদ", labelEn: "All News" },
  { value: "ভর্তি", labelBn: "ভর্তি ও সেশন", labelEn: "Admission" },
  { value: "সাফল্য", labelBn: "সাফল্য ও অর্জন", labelEn: "Achievements" },
  { value: "একাডেমিক", labelBn: "একাডেমিক কার্যক্রম", labelEn: "Academic" },
  { value: "অনুষ্ঠান", labelBn: "অনুষ্ঠান ও মাহফিল", labelEn: "Events" },
  { value: "নোটিশ", labelBn: "জরুরি নোটিশ", labelEn: "Notices" },
  { value: "সাধারণ", labelBn: "সাধারণ সংবাদ", labelEn: "General" },
];

const News = () => {
  const { t, lang } = useLanguage();
  const { isAdmin, user } = useAuth();
  const location = useLocation();

  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Detailed View Modal
  const [activeNews, setActiveNews] = useState<NewsPost | null>(null);

  // Admin In-Place Editing
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [newsToEdit, setNewsToEdit] = useState<NewsPost | null>(null);

  // Admin Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subscription state
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");

  const isMountedRef = useRef(true);

  const loadNews = async () => {
    try {
      const items = await getNewsFromFirestore();
      if (isMountedRef.current) setNewsPosts(items);
    } catch {
      if (isMountedRef.current) setNewsPosts([]);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadNews();

    const handleNewsUpdated = (e: any) => {
      if (!isMountedRef.current) return;
      if (e.detail && Array.isArray(e.detail)) {
        setNewsPosts(e.detail);
      } else {
        loadNews();
      }
    };

    window.addEventListener("oasis-news-updated", handleNewsUpdated);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("oasis-news-updated", handleNewsUpdated);
    };
  }, []);

  // Check for hash link e.g. #news-123
  useEffect(() => {
    if (location.hash && newsPosts.length > 0) {
      const targetId = location.hash.replace("#news-", "");
      const found = newsPosts.find((p) => p.id === targetId);
      if (found) {
        setActiveNews(found);
      }
    }
  }, [location.hash, newsPosts]);

  const filteredNews = useMemo(() => {
    return newsPosts.filter((post) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (post.titleBn || "").toLowerCase().includes(q) ||
        (post.titleEn || "").toLowerCase().includes(q) ||
        (post.excerptBn || "").toLowerCase().includes(q) ||
        (post.excerptEn || "").toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "all" ||
        post.category === selectedCategory ||
        (!post.category && selectedCategory === "সাধারণ");

      return matchesSearch && matchesCat;
    });
  }, [newsPosts, searchTerm, selectedCategory]);

  const featuredPost = useMemo(() => {
    if (filteredNews.length > 0) return filteredNews[0];
    return null;
  }, [filteredNews]);

  const remainingPosts = useMemo(() => {
    if (filteredNews.length > 1) return filteredNews.slice(1);
    return [];
  }, [filteredNews]);

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubLoading(true);
    setSubError("");

    try {
      await subscribeToNews({
        name: subName,
        email: subEmail,
        phone: subPhone,
      });
      setSubscribed(true);
      setSubName("");
      setSubEmail("");
      setSubPhone("");
      toast.success(t("সাবস্ক্রিপশন সফল হয়েছে", "Subscription successful"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "already-subscribed") {
        setSubError(t("এই ইমেইল দিয়ে আগেই সাবস্ক্রাইব করা হয়েছে", "This email is already subscribed"));
      } else if (message === "permission-denied") {
        setSubError(t("সাবস্ক্রিপশন এখন সক্রিয় নয়। পরে আবার চেষ্টা করুন", "Subscriptions are not available right now."));
      } else {
        setSubError(t("সাবস্ক্রিপশন সম্পন্ন করা যায়নি", "Could not complete the subscription"));
      }
    } finally {
      setSubLoading(false);
    }
  };

  const buildShareUrl = (newsId?: string) => {
    if (typeof window === "undefined" || !newsId) return "";
    return `${window.location.origin}/news#news-${newsId}`;
  };

  const handleCopyLink = async (newsId?: string) => {
    const url = buildShareUrl(newsId);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("সংবাদের লিংক কপি হয়েছে", "News link copied to clipboard"));
    } catch {
      toast.error(t("লিংক কপি করা যায়নি", "Could not copy link"));
    }
  };

  const handleAdminCreate = () => {
    setNewsToEdit(null);
    setAdminDialogOpen(true);
  };

  const handleAdminEdit = (news: NewsPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNewsToEdit(news);
    setAdminDialogOpen(true);
  };

  const handleAdminDelete = (news: NewsPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNewsToDelete(news);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!newsToDelete?.id) return;
    setIsDeleting(true);
    try {
      await deleteNewsFromFirestore(newsToDelete.id);
      toast.success(t("সংবাদ মুছে ফেলা হয়েছে", "News deleted successfully"));
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
      if (activeNews?.id === newsToDelete.id) {
        setActiveNews(null);
      }
      await loadNews();
    } catch {
      toast.error(t("সংবাদ মুছতে সমস্যা হয়েছে", "Failed to delete news"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ================= HERO HEADER ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/95 via-primary to-primary/90 text-primary-foreground pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-18">
        <div className="absolute inset-0 z-0 opacity-15">
          <img src={heroImg} alt="Annoor News Campus" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/80 z-0" />

        <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-emerald-200 backdrop-blur-md mb-4">
            <Newspaper className="h-4 w-4 text-amber-300" />
            <span>{t("আননূর সংবাদ ও মিডিয়া বুলেটিন", "Annoor News & Media Bulletin")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-bengali font-extrabold tracking-tight text-white mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.15 }}
          >
            {t("সংবাদ ও আপডেট", "News & Updates")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-bengali text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed"
          >
            {t(
              "আননূর শিক্ষা পরিবারের প্রাতিষ্ঠানিক কার্যক্রম, ভর্তি আপডেট, কৃতি শিক্ষার্থীদের গৌরবোজ্জ্বল সাফল্য ও বিভিন্ন ইসলামিক সম্মেলনসমূহের প্রামাণ্য সংবাদ।",
              "Official announcements, admissions, academic achievements, and event reports from Annoor Education Family.",
            )}
          </motion.p>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>


      {/* ================= MAIN CONTENT ================= */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Search & Category Filter Toolbar */}
          <div className="mb-10 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("সংবাদ খুঁজুন (শিরোনাম বা বিষয়)...", "Search news by title or content...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-2xl border-border bg-card font-bengali text-sm shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Link to="/notices">
                  <Button variant="outline" size="sm" className="rounded-2xl font-bengali text-xs gap-1.5 border-primary/20 hover:border-primary/50 text-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>{t("নোটিশ বোর্ড", "Notice Board")}</span>
                  </Button>
                </Link>

              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold font-bengali whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {lang === "bn" ? cat.labelBn : cat.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="rounded-3xl border border-border bg-card p-16 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-bengali text-base font-semibold text-muted-foreground">
                {t("সংবাদ লোড হচ্ছে...", "Loading news bulletins...")}
              </p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Newspaper className="h-7 w-7" />
              </div>
              <h3 className="font-bengali text-xl font-bold text-foreground mb-2">
                {searchTerm || selectedCategory !== "all"
                  ? t("কোনো সংবাদ পাওয়া যায়নি", "No matching news found")
                  : t("এখনও কোনো সংবাদ প্রকাশ করা হয়নি", "No news has been published yet")}
              </h3>
              <p className="font-bengali text-sm text-muted-foreground max-w-md mx-auto mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? t("সার্চ ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।", "Try adjusting your search criteria or resetting filters.")
                  : t("নতুন সংবাদ প্রকাশ করা হলে তাৎক্ষণিকভাবে এখানে প্রদর্শিত হবে।", "New institutional updates will be published here directly from the admin panel.")}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  variant="outline"
                  className="rounded-2xl font-bengali text-xs"
                >
                  {t("সকল সংবাদ দেখুন", "Reset Filters")}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {/* FEATURED LATEST HEADLINE CARD */}
              {featuredPost && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-border/80 bg-card shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    <div className="relative h-64 sm:h-80 lg:h-auto lg:col-span-6 overflow-hidden bg-muted">
                      <img
                        src={featuredPost.imageUrl || "/hero-campus.jpg"}
                        alt={lang === "bn" ? featuredPost.titleBn : featuredPost.titleEn}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/hero-campus.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground font-bengali text-xs px-3 py-1 shadow-md">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {t("সর্বশেষ সংবাদ", "Latest Highlight")}
                        </Badge>
                        {featuredPost.category && (
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-md text-foreground font-bengali text-xs px-2.5 py-0.5 border-border">
                            {featuredPost.category}
                          </Badge>
                        )}
                        {featuredPost.embedCode && (
                          <Badge className="bg-[#1877F2] text-white font-bengali text-xs px-2.5 py-0.5 shadow-xs flex items-center gap-1">
                            <FacebookIcon className="h-3 w-3" />
                            <span>{t("ফেসবুক পোস্ট", "Facebook Post")}</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-6 sm:p-10 lg:col-span-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground font-bengali mb-3">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="h-4 w-4 text-primary" />
                            {featuredPost.date}
                          </span>
                          <span>•</span>
                          <span className="text-primary font-semibold">
                            {t("আননূর মিডিয়া সেল", "Annoor Media")}
                          </span>
                        </div>

                        <h2
                          onClick={() => setActiveNews(featuredPost)}
                          className="font-bengali font-bold text-2xl sm:text-3xl text-foreground group-hover:text-primary transition-colors cursor-pointer leading-snug mb-4"
                        >
                          {lang === "bn" ? featuredPost.titleBn : featuredPost.titleEn || featuredPost.titleBn}
                        </h2>

                        <p className="font-bengali text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-4 mb-6">
                          {lang === "bn" ? featuredPost.excerptBn : featuredPost.excerptEn || featuredPost.excerptBn}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setActiveNews(featuredPost)}
                            className="rounded-2xl font-bengali text-xs sm:text-sm font-bold gap-2 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                          >
                            <span>{t("সম্পূর্ণ সংবাদ পড়ুন", "Read Full Story")}</span>
                            <ArrowRight className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyLink(featuredPost.id)}
                            className="rounded-2xl h-10 w-10 text-muted-foreground hover:text-primary"
                            title={t("লিংক কপি করুন", "Copy link")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Admin In-Place Controls */}
                        {isAdmin && (
                          <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 p-1.5 rounded-2xl border border-sky-200 dark:border-sky-800">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleAdminEdit(featuredPost, e)}
                              className="h-8 px-2.5 rounded-xl text-xs font-bengali text-sky-700 dark:text-sky-300 hover:bg-sky-200/50 gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>{t("এডিট", "Edit")}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleAdminDelete(featuredPost, e)}
                              className="h-8 px-2 rounded-xl text-xs text-red-600 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* REMAINING NEWS POSTS GRID */}
              {remainingPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                  {remainingPosts.map((news, idx) => (
                    <motion.article
                      key={news.id || idx}
                      id={`news-${news.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setActiveNews(news)}
                      className="group cursor-pointer rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Thumbnail */}
                        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/40">
                          <img
                            src={news.imageUrl || "/hero-campus.jpg"}
                            alt={lang === "bn" ? news.titleBn : news.titleEn}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/hero-campus.jpg";
                            }}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                            {news.category && (
                              <Badge className="bg-background/90 text-foreground font-bengali text-[11px] px-2.5 py-0.5 backdrop-blur-md border border-border shadow-sm">
                                <Tag className="h-3 w-3 mr-1 text-primary" />
                                {news.category}
                              </Badge>
                            )}
                            {news.embedCode && (
                              <Badge className="bg-[#1877F2] text-white font-bengali text-[10px] px-2 py-0.5 shadow-xs flex items-center gap-1">
                                <FacebookIcon className="h-2.5 w-2.5" />
                                <span>Facebook</span>
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bengali mb-2">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{news.date}</span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bengali font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                          {lang === "bn" ? news.titleBn : news.titleEn || news.titleBn}
                        </h3>

                        {/* Excerpt */}
                        <p className="font-bengali text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {lang === "bn" ? news.excerptBn : news.excerptEn || news.excerptBn}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span className="font-bengali font-bold text-primary flex items-center gap-1 group-hover:underline">
                          <span>{t("বিস্তারিত পড়ুন", "Read More")}</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(news.id);
                            }}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary"
                            title={t("লিংক কপি", "Copy Link")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>

                          {isAdmin && (
                            <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleAdminEdit(news, e)}
                                className="h-7 w-7 rounded-lg text-sky-600 hover:bg-sky-500/10"
                                title={t("এডিট", "Edit")}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleAdminDelete(news, e)}
                                className="h-7 w-7 rounded-lg text-red-600 hover:bg-red-500/10"
                                title={t("মুছে ফেলুন", "Delete")}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= NEWSLETTER SUBSCRIPTION BOX ================= */}
          <div className="mt-16 rounded-[2.5rem] border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-3">
                <Badge variant="outline" className="px-3 py-1 font-bengali text-xs border-primary/30 text-primary">
                  <Mail className="h-3.5 w-3.5 mr-1" />
                  {t("সংবাদ বুলেটিন নোটিফিকেশন", "News Alerts")}
                </Badge>
                <h3 className="font-bengali font-bold text-2xl sm:text-3xl text-foreground">
                  {t("প্রতিটি গুরুত্বপূর্ণ সংবাদ সরাসরি আপনার ইমেইলে পান", "Get Institutional News Directly in Your Inbox")}
                </h3>
                <p className="font-bengali text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "ভর্তি সেশন, কৃতি হাফেজদের দস্তারবন্দী, বার্ষিক পরীক্ষা ও জরুরি ছুটির নোটিফিকেশন মিস করতে না চাইলে আজই সাবস্ক্রাইব করুন।",
                    "Subscribe with your email to receive real-time updates regarding admissions, ceremonies, exams, and announcements.",
                  )}
                </p>
              </div>

              <div className="lg:col-span-6">
                {subscribed ? (
                  <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-600" />
                    <h4 className="font-bengali font-bold text-lg text-foreground">
                      {t("ধন্যবাদ! সাবস্ক্রিপশন সফল হয়েছে", "Thank you! Subscribed successfully")}
                    </h4>
                    <p className="font-bengali text-xs text-muted-foreground mt-1">
                      {t("নতুন কোনো সংবাদ বা বিজ্ঞপ্তি প্রকাশ হলে আমরা আপনাকে অবহিত করব।", "You will be notified when new bulletins are published.")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="text"
                        placeholder={t("আপনার নাম", "Your Name")}
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        className="rounded-2xl font-bengali text-sm"
                      />
                      <Input
                        type="tel"
                        placeholder={t("মোবাইল নম্বর", "Phone Number")}
                        value={subPhone}
                        onChange={(e) => setSubPhone(e.target.value)}
                        className="rounded-2xl font-bengali text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="email"
                        placeholder={`${t("আপনার ইমেইল ঠিকানা", "Your Email Address")} *`}
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        required
                        className="rounded-2xl font-bengali text-sm flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={subLoading}
                        className="rounded-2xl font-bengali font-bold text-xs px-6 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shrink-0"
                      >
                        {subLoading ? <Mail className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span>{t("সাবস্ক্রাইব করুন", "Subscribe")}</span>
                      </Button>
                    </div>
                    {subError && (
                      <p className="font-bengali text-xs text-red-600 font-medium">
                        {subError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FULL ARTICLE READING DIALOG ================= */}
      <Dialog open={Boolean(activeNews)} onOpenChange={(open) => !open && setActiveNews(null)}>
        {activeNews && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 sm:p-8">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  {activeNews.category && (
                    <Badge className="bg-primary/10 text-primary font-bengali text-xs px-3 py-0.5 border-primary/20">
                      {activeNews.category}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-bengali">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {activeNews.date}
                  </span>
                </div>

                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleAdminEdit(activeNews);
                      setActiveNews(null);
                    }}
                    className="h-8 rounded-xl font-bengali text-xs gap-1 border-sky-300 text-sky-700"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>{t("এডিট করুন", "Edit News")}</span>
                  </Button>
                )}
              </div>

              <DialogTitle className="font-bengali font-bold text-xl sm:text-2xl text-foreground leading-snug">
                {lang === "bn" ? activeNews.titleBn : activeNews.titleEn || activeNews.titleBn}
              </DialogTitle>
              {lang === "bn" && activeNews.titleEn && (
                <p className="text-xs sm:text-sm text-muted-foreground italic font-medium">
                  {activeNews.titleEn}
                </p>
              )}
            </DialogHeader>

            {/* Modal Image */}
            {activeNews.imageUrl && (
              <div className="relative my-4 h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-border bg-muted">
                <img
                  src={activeNews.imageUrl}
                  alt={lang === "bn" ? activeNews.titleBn : activeNews.titleEn}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hero-campus.jpg";
                  }}
                />
              </div>
            )}

            {/* Modal Body Content */}
            <div className="my-4 space-y-4">
              <p className="font-bengali text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
                {lang === "bn" ? activeNews.excerptBn : activeNews.excerptEn || activeNews.excerptBn}
              </p>
              {lang === "bn" && activeNews.excerptEn && (
                <div className="mt-4 p-4 rounded-2xl bg-muted/50 border border-border text-sm text-muted-foreground leading-relaxed italic">
                  {activeNews.excerptEn}
                </div>
              )}

              {/* Embedded Facebook Post */}
              {activeNews.embedCode && (
                <FacebookEmbed
                  embedCode={activeNews.embedCode}
                  title={lang === "bn" ? activeNews.titleBn : activeNews.titleEn || activeNews.titleBn}
                />
              )}
            </div>

            {/* Social Sharing Footer in Dialog */}
            <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bengali text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5" />
                  {t("শেয়ার করুন:", "Share:")}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(activeNews.id)}
                  className="rounded-xl font-bengali text-xs h-8 px-3 gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t("কপি লিংক", "Copy")}</span>
                </Button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${lang === "bn" ? activeNews.titleBn : activeNews.titleEn} - ${buildShareUrl(activeNews.id)}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold font-bengali hover:bg-muted"
                >
                  <Send className="h-3.5 w-3.5 text-emerald-600" />
                  WhatsApp
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildShareUrl(activeNews.id))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold font-bengali hover:bg-muted"
                >
                  <FacebookIcon className="h-3.5 w-3.5 text-blue-600" />
                  Facebook
                </a>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveNews(null)}
                className="rounded-xl font-bengali text-xs h-8"
              >
                {t("বন্ধ করুন", "Close")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ================= ADMIN CREATE/EDIT DIALOG ================= */}
      <NewsDialog
        isOpen={adminDialogOpen}
        onClose={() => setAdminDialogOpen(false)}
        newsToEdit={newsToEdit}
        onSuccess={loadNews}
      />

      {/* ================= ADMIN DELETE ALERT DIALOG ================= */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl w-fit mb-1">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="font-bengali text-lg font-bold">
              {t("সংবাদটি কি মুছে ফেলতে চান?", "Delete this news item?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bengali text-xs text-muted-foreground">
              {newsToDelete && (
                <span className="block font-semibold text-foreground my-1.5 p-2 bg-muted/50 rounded-lg">
                  "{newsToDelete.titleBn}"
                </span>
              )}
              {t(
                "এই সংবাদটি মুছে ফেললে তা অবিলম্বে ওয়েবসাইট এবং ডাটাবেজ থেকে মুছে যাবে।",
                "Once deleted, this news item will be immediately removed from the live website."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl font-bengali">
              {t("বাতিল", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl font-bengali bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? t("মুছে ফেলা হচ্ছে...", "Deleting...") : t("মুছে ফেলুন", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default News;
