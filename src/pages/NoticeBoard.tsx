import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getNotices, Notice } from "@/lib/notices";
import { downloadFile } from "@/lib/upload";
import { springIn, springInDelay } from "@/lib/animations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const NoticeBoard = () => {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotices()
      .then(setNotices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCurrentNotices = (all: Notice[]) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return all.filter((n) => n.createdAt >= sevenDaysAgo);
  };

  const getArchiveNotices = (all: Notice[]) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return all.filter((n) => n.createdAt < sevenDaysAgo);
  };

  const filterNotices = (all: Notice[]) => {
    return all.filter((notice) => {
      const title = lang === "bn" ? notice.titleBn : notice.titleEn || notice.titleBn;
      return title.toLowerCase().includes(search.toLowerCase());
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDownload = async (notice: Notice) => {
    if (!notice.pdfUrl) return;

    try {
      await downloadFile(notice.pdfUrl, `${notice.titleEn || notice.titleBn || "notice"}.pdf`);
      toast.success(t("পিডিএফ ডাউনলোড শুরু হয়েছে", "PDF download started"));
    } catch (error) {
      console.error("Notice PDF download failed:", error);
      toast.error(t("পিডিএফ ডাউনলোড করা যায়নি", "Could not download PDF"));
    }
  };

  const renderNoticeItem = (notice: Notice, index: number) => (
    <motion.div
      key={notice.id}
      {...springIn}
      transition={springInDelay(index * 0.05)}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/30"
    >
      <div 
        onClick={() => toggleExpand(notice.id!)} 
        className="cursor-pointer p-5 transition-colors hover:bg-secondary/20"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Calendar className="h-3 w-3" />
              {new Date(notice.createdAt).toLocaleDateString("bn-BD", { month: "short", day: "numeric" })}
            </div>
            <h3 className="font-bengali text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
              {lang === "bn" ? notice.titleBn : notice.titleEn || notice.titleBn}
            </h3>
            {notice.pdfUrl && (
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                <FileText className="h-4 w-4" />
                PDF
              </span>
            )}
          </div>
          <motion.span
            animate={{ rotate: expandedId === notice.id ? 180 : 0 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all group-hover:bg-primary/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {expandedId === notice.id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50"
          >
            <div className="p-5 pt-4">
              {(notice.descriptionBn || notice.descriptionEn) && (
                <p className="mb-4 whitespace-pre-line break-words rounded-xl border border-border/30 bg-secondary/30 px-4 py-3 font-bengali leading-7 text-muted-foreground">
                  {lang === "bn" ? notice.descriptionBn : notice.descriptionEn || notice.descriptionBn}
                </p>
              )}
              {notice.pdfUrl && (
                <button
                  type="button"
                  onClick={() => void handleDownload(notice)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bengali font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  {t("পিডিএফ ডাউনলোড", "Download PDF")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div>
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-primary md:h-64">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("নোটিশ বোর্ড", "Notice Board")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div {...springIn} className="relative mb-8">
            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-2 shadow-lg backdrop-blur-sm">
              <Search className="ml-2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("নোটিশ খুঁজুন...", "Search notices...")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="flex-1 bg-transparent font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </motion.div>

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="mb-8 flex w-full gap-2 bg-transparent p-1">
              <TabsTrigger 
                value="current" 
                className="flex-1 rounded-xl font-bengali font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
              >
                {t("সাম্প্রতিক", "Current")} ({getCurrentNotices(notices).length})
              </TabsTrigger>
              <TabsTrigger 
                value="archive" 
                className="flex-1 rounded-xl font-bengali font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
              >
                {t("আর্কাইভ", "Archive")} ({getArchiveNotices(notices).length})
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="flex-1 rounded-xl font-bengali font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
              >
                {t("সব", "All")} ({notices.length})
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                <TabsContent value="current">
                  {filterNotices(getCurrentNotices(notices)).length === 0 ? (
                    <p className="py-12 text-center font-bengali text-muted-foreground">
                      {t("কোনো নোটিশ পাওয়া যায়নি", "No current notices")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filterNotices(getCurrentNotices(notices)).map((notice, index) => renderNoticeItem(notice, index))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="archive">
                  {filterNotices(getArchiveNotices(notices)).length === 0 ? (
                    <p className="py-12 text-center font-bengali text-muted-foreground">
                      {t("কোনো আর্কাইভ নোটিশ নেই", "No archived notices")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filterNotices(getArchiveNotices(notices)).map((notice, index) => renderNoticeItem(notice, index))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all">
                  {filterNotices(notices).length === 0 ? (
                    <p className="py-12 text-center font-bengali text-muted-foreground">
                      {t("কোনো নোটিশ পাওয়া যায়নি", "No notices available")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filterNotices(notices).map((notice, index) => renderNoticeItem(notice, index))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default NoticeBoard;