import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Newspaper,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  Copy,
  Tag,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  getNewsFromFirestore,
  deleteNewsFromFirestore,
  type NewsPost,
} from "@/lib/news";
import { NewsDialog } from "./NewsDialog";

export const NewsManager = () => {
  const { t, lang } = useLanguage();
  const [newsList, setNewsList] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newsToEdit, setNewsToEdit] = useState<NewsPost | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadNews = async () => {
    try {
      setLoading(true);
      const items = await getNewsFromFirestore();
      setNewsList(items);
    } catch (err) {
      console.error("Failed to load news:", err);
      toast.error(t("সংবাদ লোড করতে সমস্যা হয়েছে", "Failed to load news items"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();

    const handleNewsUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setNewsList(e.detail);
      } else {
        loadNews();
      }
    };

    window.addEventListener("oasis-news-updated", handleNewsUpdate);
    return () => {
      window.removeEventListener("oasis-news-updated", handleNewsUpdate);
    };
  }, []);

  const handleEdit = (news: NewsPost) => {
    setNewsToEdit(news);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setNewsToEdit(null);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!newsToDelete?.id) return;
    setIsDeleting(true);
    try {
      await deleteNewsFromFirestore(newsToDelete.id);
      toast.success(t("সংবাদ মুছে ফেলা হয়েছে", "News deleted successfully"));
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
      await loadNews();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(t("সংবাদ মুছে ফেলতে সমস্যা হয়েছে", "Failed to delete news"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = async (newsId?: string) => {
    if (!newsId) return;
    const url = `${window.location.origin}/news#news-${newsId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("সংবাদের লিংক কপি করা হয়েছে", "News link copied to clipboard"));
    } catch {
      toast.error(t("লিংক কপি করা যায়নি", "Could not copy link"));
    }
  };

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchesSearch =
        (item.titleBn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.titleEn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.excerptBn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.excerptEn || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === "all" ||
        item.category === selectedCategory ||
        (!item.category && selectedCategory === "সাধারণ");

      return matchesSearch && matchesCat;
    });
  }, [newsList, searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    const total = newsList.length;
    const withImages = newsList.filter((n) => Boolean(n.imageUrl)).length;
    const thisYear = newsList.filter((n) => (n.date || "").startsWith("2026")).length;
    return { total, withImages, thisYear };
  }, [newsList]);

  const categories = ["all", "ভর্তি", "সাফল্য", "একাডেমিক", "অনুষ্ঠান", "নোটিশ", "সাধারণ"];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/15 text-sky-600 rounded-2xl">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bengali text-xl font-bold text-foreground">
              {t("সংবাদ প্রকাশনা ও ব্যবস্থাপনা", "News Publishing & Management")}
            </h2>
            <p className="font-bengali text-xs text-muted-foreground mt-0.5">
              {t(
                "মাদরাসার সাম্প্রতিক কার্যক্রম, সাফল্য ও ঘোষণা সরাসরি ওয়েবসাইটে প্রকাশ করুন",
                "Publish recent madrasah activities, achievements, and announcements directly to the website"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to="/news" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl font-bengali text-xs h-10 px-3.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{t("পাবলিক পেজ দেখুন", "View Public Page")}</span>
            </Button>
          </Link>

          <Button
            onClick={handleCreate}
            size="sm"
            className="gap-2 rounded-xl font-bengali text-xs h-10 px-4 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>{t("নতুন সংবাদ প্রকাশ", "Publish News")}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bengali text-muted-foreground font-medium">
              {t("মোট প্রকাশিত সংবাদ", "Total Published News")}
            </p>
            <h3 className="text-2xl font-bold mt-1 font-display text-foreground">
              {stats.total}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600">
            <Newspaper className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bengali text-muted-foreground font-medium">
              {t("মিডিয়া/ছবি সহ সংবাদ", "News with Images")}
            </p>
            <h3 className="text-2xl font-bold mt-1 font-display text-emerald-600">
              {stats.withImages}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <ImageIcon className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bengali text-muted-foreground font-medium">
              {t("চলতি শিক্ষাবর্ষের সংবাদ", "Current Year News")}
            </p>
            <h3 className="text-2xl font-bold mt-1 font-display text-purple-600">
              {stats.thisYear}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("সংবাদ খুঁজুন (শিরোনাম বা বিবরণ)...", "Search news (title or description)...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 font-bengali rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label =
              cat === "all"
                ? t("সব সংবাদ", "All")
                : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium font-bengali whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* News List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border/80 rounded-3xl">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent mb-3" />
          <p className="font-bengali text-sm text-muted-foreground">
            {t("সংবাদ লোড হচ্ছে...", "Loading news items...")}
          </p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-dashed border-border/80 rounded-3xl text-center">
          <div className="p-4 bg-muted/60 text-muted-foreground rounded-full mb-3">
            <Newspaper className="h-8 w-8" />
          </div>
          <h4 className="font-bengali text-base font-bold text-foreground">
            {searchTerm || selectedCategory !== "all"
              ? t("কোনো সংবাদ পাওয়া যায়নি", "No matching news found")
              : t("এখনও কোনো সংবাদ প্রকাশ করা হয়নি", "No news published yet")}
          </h4>
          <p className="font-bengali text-xs text-muted-foreground max-w-sm mt-1">
            {searchTerm || selectedCategory !== "all"
              ? t("সার্চ ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।", "Try adjusting your search filters.")
              : t("নতুন সংবাদ তৈরি করতে উপরের 'নতুন সংবাদ প্রকাশ' বাটনে ক্লিক করুন।", "Click 'Publish News' button above to create your first news post.")}
          </p>
          {(searchTerm || selectedCategory !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="mt-4 rounded-xl font-bengali text-xs"
            >
              {t("ফিল্টার রিসেট করুন", "Reset Filters")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((news) => {
            return (
              <div
                key={news.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-sky-500/40 hover:shadow-md"
              >
                <div>
                  {/* Image & Header */}
                  {news.imageUrl && (
                    <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/30">
                      <img
                        src={news.imageUrl}
                        alt={lang === "bn" ? news.titleBn : news.titleEn}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/hero-campus.jpg";
                        }}
                      />
                      {news.category && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-sky-600/90 hover:bg-sky-600 text-white font-bengali text-xs px-2.5 py-0.5 backdrop-blur-md border-0 shadow-sm">
                            {news.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Header Meta (if no image, show category badge here) */}
                  {!news.imageUrl && news.category && (
                    <div className="mb-2">
                      <Badge variant="outline" className="font-bengali text-xs px-2.5 py-0.5 bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20">
                        <Tag className="h-3 w-3 mr-1" />
                        {news.category}
                      </Badge>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-bengali mb-2">
                    <CalendarIcon className="h-3.5 w-3.5 text-sky-500" />
                    <span>{news.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bengali text-base font-bold text-foreground group-hover:text-sky-600 transition-colors line-clamp-2">
                    {lang === "bn" ? news.titleBn : news.titleEn || news.titleBn}
                  </h3>

                  {/* Secondary title in English/Bangla */}
                  <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-1 italic">
                    {lang === "bn" ? news.titleEn : news.titleBn}
                  </p>

                  {/* Excerpt */}
                  <p className="font-bengali text-xs text-muted-foreground/90 mt-2.5 line-clamp-3 leading-relaxed">
                    {lang === "bn" ? news.excerptBn : news.excerptEn || news.excerptBn}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(news.id)}
                      className="h-8 px-2.5 rounded-lg text-xs font-bengali text-muted-foreground hover:text-foreground gap-1"
                      title={t("লিংক কপি করুন", "Copy Link")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t("লিংক কপি", "Copy")}</span>
                    </Button>

                    <Link to={`/news#news-${news.id}`} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                        title={t("পাবলিক পেজে দেখুন", "View on Public Page")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(news)}
                      className="h-8 px-3 rounded-xl text-xs font-bengali gap-1.5 hover:border-sky-500 hover:text-sky-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>{t("এডিট", "Edit")}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewsToDelete(news);
                        setDeleteDialogOpen(true);
                      }}
                      className="h-8 px-2.5 rounded-xl text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* News Dialog (Create / Edit) */}
      <NewsDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        newsToEdit={newsToEdit}
        onSuccess={loadNews}
      />

      {/* Delete Confirmation Alert Dialog */}
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
                "এই সংবাদটি মুছে ফেললে তা পাবলিক ওয়েবসাইট থেকে তাৎক্ষণিক অদৃশ্য হয়ে যাবে।",
                "Once deleted, this news item will be immediately removed from the public website."
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
              {isDeleting
                ? t("মুছে ফেলা হচ্ছে...", "Deleting...")
                : t("হ্যাঁ, মুছে ফেলুন", "Yes, Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
