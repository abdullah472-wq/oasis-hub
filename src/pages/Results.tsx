import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getResults, Result } from "@/lib/results";
import { downloadFile } from "@/lib/upload";
import { springIn } from "@/lib/animations";

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

  const filteredResults = results.filter((result) => result.campus === campus || result.campus === "both");

  const handleDownload = async (result: Result) => {
    if (!result.pdfUrl) return;

    try {
      await downloadFile(result.pdfUrl, `${result.examEn || result.exam || "result"}.pdf`);
      toast.success(t("পিডিএফ ডাউনলোড শুরু হয়েছে", "PDF download started"));
    } catch (error) {
      console.error("Result PDF download failed:", error);
      toast.error(t("পিডিএফ ডাউনলোড করা যায়নি", "Could not download PDF"));
    }
  };

  return (
    <div>
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-primary md:h-64">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("পরীক্ষার ফলাফল", "Exam Results")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div {...springIn} className="mb-8">
            <a
              href="https://eskooly.com/bb/searchexamresult.php"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bengali font-bold text-foreground transition-colors hover:bg-accent/80"
            >
              <Search className="h-5 w-5" />
              {t("অনলাইন রেজাল্ট খুঁজুন", "Search Result Online")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>

          <div className="mb-10 flex justify-center gap-4">
            {(["boys", "girls"] as const).map((currentCampus) => (
              <motion.button
                key={currentCampus}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, y: 4 }}
                onClick={() => setCampus(currentCampus)}
                className={`font-bengali ${campus === currentCampus ? "squishy-button" : "squishy-button-outline"}`}
              >
                {currentCampus === "boys"
                  ? t("বালক ক্যাম্পাস", "Boys Campus")
                  : t("বালিকা ক্যাম্পাস", "Girls Campus")}
              </motion.button>
            ))}
          </div>

          <div className="card-institutional p-8">
            {loading ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredResults.length === 0 ? (
              <p className="py-8 text-center font-bengali text-muted-foreground">
                {t("কোনো ফলাফল পাওয়া যায়নি", "No results available")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="py-4 text-left font-bengali font-bold text-foreground">{t("পরীক্ষা", "Exam")}</th>
                      <th className="py-4 text-left font-bengali font-bold text-foreground">{t("শ্রেণি", "Class")}</th>
                      <th className="py-4 text-right font-bengali font-bold text-foreground">{t("ডাউনলোড", "Download")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => (
                      <tr key={result.id || index} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                        <td className="py-4 font-bengali text-foreground">{lang === "bn" ? result.exam : result.examEn}</td>
                        <td className="py-4 font-bengali text-muted-foreground">{lang === "bn" ? result.className : result.classNameEn}</td>
                        <td className="py-4 text-right">
                          {result.pdfUrl ? (
                            <button
                              type="button"
                              onClick={() => void handleDownload(result)}
                              className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                            >
                              <Download className="h-4 w-4" />
                              PDF
                            </button>
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
