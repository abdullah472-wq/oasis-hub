import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Download, ChevronDown, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getNotices, Notice } from "@/lib/notices";
import { getDownloadUrl } from "@/lib/upload";
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

  const filtered = notices.filter((n) => {
    const title = lang === "bn" ? n.titleBn : n.titleEn || n.titleBn;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("নোটিশ বোর্ড", "Notice Board")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Search */}
          <motion.div {...springIn} className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder={t("নোটিশ খুঁজুন...", "Search notices...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[2rem] bg-card border border-border font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 font-bengali">
              {t("কোনো নোটিশ নেই", "No notices available")}
            </p>
          ) : (
            <div className="space-y-4">
              {filtered.map((notice, i) => (
                <motion.div
                  key={notice.id}
                  {...springIn}
                  transition={springInDelay(i * 0.06)}
                  className="card-institutional border-l-4 border-accent overflow-hidden"
                >
                  <div
                    onClick={() => toggleExpand(notice.id!)}
                    className="p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bengali text-lg font-bold text-foreground">
                          {lang === "bn" ? notice.titleBn : notice.titleEn || notice.titleBn}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(notice.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                          {notice.pdfUrl && (
                            <span className="flex items-center gap-1 text-sm text-primary">
                              <FileText className="w-4 h-4" />
                              PDF
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-muted-foreground transition-transform ${expandedId === notice.id ? "rotate-180" : ""}`} 
                      />
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
                            <p className="font-bengali text-muted-foreground mb-5 whitespace-pre-line break-words leading-8 rounded-2xl border border-border bg-secondary/35 px-4 py-4 md:px-5">
                              {lang === "bn" ? notice.descriptionBn : notice.descriptionEn || notice.descriptionBn}
                            </p>
                          )}
                          {notice.pdfUrl && (
                            <a
                              href={getDownloadUrl(notice.pdfUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bengali hover:bg-primary/90 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              {t("পিডিএফ ডাউনলোড", "Download PDF")}
                            </a>
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
