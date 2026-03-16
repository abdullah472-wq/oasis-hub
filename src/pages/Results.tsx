import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Search, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getResults, Result } from "@/lib/results";
import { springIn, springInDelay } from "@/lib/animations";

const Results = () => {
  const { t, lang } = useLanguage();
  const [campus, setCampus] = useState<"boys" | "girls">("boys");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults()
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredResults = results.filter((r) => r.campus === campus || r.campus === "both");

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("পরীক্ষার ফলাফল", "Exam Results")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Search Result Button */}
          <motion.div {...springIn} className="mb-8">
            <a
              href="https://eskooly.com/bb/searchexamresult.php"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-foreground rounded-xl font-bengali font-bold hover:bg-accent/80 transition-colors"
            >
              <Search className="w-5 h-5" />
              {t("অনলাইন রেজাল্ট খুঁজুন", "Search Result Online")}
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>

          <div className="flex justify-center gap-4 mb-10">
            {(["boys", "girls"] as const).map((c) => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, y: 4 }}
                onClick={() => setCampus(c)}
                className={`font-bengali ${campus === c ? "squishy-button" : "squishy-button-outline"}`}
              >
                {c === "boys" ? t("বালক ক্যাম্পাস", "Boys Campus") : t("বালিকা ক্যাম্পাস", "Girls Campus")}
              </motion.button>
            ))}
          </div>

          <div className="card-institutional p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 font-bengali">
                {t("কোনো ফলাফল পাওয়া যায়নি", "No results available")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-4 font-bengali font-bold text-foreground">{t("পরীক্ষা", "Exam")}</th>
                      <th className="text-left py-4 font-bengali font-bold text-foreground">{t("শ্রেণি", "Class")}</th>
                      <th className="text-right py-4 font-bengali font-bold text-foreground">{t("ডাউনলোড", "Download")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((r, i) => (
                      <tr key={r.id || i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="py-4 font-bengali text-foreground">{lang === "bn" ? r.exam : r.examEn}</td>
                        <td className="py-4 font-bengali text-muted-foreground">{lang === "bn" ? r.className : r.classNameEn}</td>
                        <td className="py-4 text-right">
                          {r.pdfUrl ? (
                            <a
                              href={r.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm hover:bg-accent/20 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground">{t("শীঘ্রই আসছে", "Coming soon")}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Results;
