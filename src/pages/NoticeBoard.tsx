import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Download, ChevronDown, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getNotices, Notice } from "@/lib/notices";
import { downloadFile } from "@/lib/upload";
import { springIn, springInDelay } from "@/lib/animations";

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

  const filtered = notices.filter((notice) => {
    const title = lang === "bn" ? notice.titleBn : notice.titleEn || notice.titleBn;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDownload = async (notice: Notice) => {
    if (!notice.pdfUrl) return;

    try {
      await downloadFile(notice.pdfUrl, `${notice.titleEn || notice.titleBn || "notice"}.pdf`);
      toast.success(t("পিডিএফ ডাউনলোড শুরু হয়েছে", "PDF download started"));
    } catch (error) {
      console.error("Notice PDF download failed:", error);
      toast.error(t("পিডিএফ ডাউনলোড করা যায়নি", "Could not download PDF"));
    }
  };

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
          <motion.div {...springIn} className="relative mb-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("নোটিশ খুঁজুন...", "Search notices...")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-[2rem] border border-border bg-card py-4 pl-12 pr-4 font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </motion.div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center font-bengali text-muted-foreground">
              {t("কোনো নোটিশ পাওয়া যায়নি", "No notices available")}
            </p>
          ) : (
            <div className="space-y-4">
              {filtered.map((notice, index) => (
                <motion.div
                  key={notice.id}
                  {...springIn}
                  transition={springInDelay(index * 0.06)}
                  className="card-institutional overflow-hidden border-l-4 border-accent"
                >
                  <div onClick={() => toggleExpand(notice.id!)} className="cursor-pointer p-6 transition-colors hover:bg-secondary/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bengali text-lg font-bold text-foreground">
                          {lang === "bn" ? notice.titleBn : notice.titleEn || notice.titleBn}
                        </h3>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(notice.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                          {notice.pdfUrl && (
                            <span className="flex items-center gap-1 text-sm text-primary">
                              <FileText className="h-4 w-4" />
                              PDF
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedId === notice.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === notice.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-6 pt-4">
                          {(notice.descriptionBn || notice.descriptionEn) && (
                            <p className="mb-5 whitespace-pre-line break-words rounded-2xl border border-border bg-secondary/35 px-4 py-4 font-bengali leading-8 text-muted-foreground md:px-5">
                              {lang === "bn" ? notice.descriptionBn : notice.descriptionEn || notice.descriptionBn}
                            </p>
                          )}
                          {notice.pdfUrl && (
                            <button
                              type="button"
                              onClick={() => void handleDownload(notice)}
                              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bengali text-primary-foreground transition-colors hover:bg-primary/90"
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
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NoticeBoard;
