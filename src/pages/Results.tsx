import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";

import { springIn, springInDelay } from "@/lib/animations";

const results = [
  { id: 1, exam: "বার্ষিক পরীক্ষা ২০২৫", examEn: "Annual Exam 2025", classes: ["৬ষ্ঠ", "৭ম", "৮ম", "৯ম", "১০ম"], classesEn: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"], campus: "both" },
  { id: 2, exam: "অর্ধবার্ষিক পরীক্ষা ২০২৫", examEn: "Half-yearly Exam 2025", classes: ["৬ষ্ঠ", "৭ম", "৮ম", "৯ম", "১০ম"], classesEn: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"], campus: "both" },
  { id: 3, exam: "প্রথম সাময়িক ২০২৫", examEn: "1st Term 2025", classes: ["৬ষ্ঠ", "৭ম", "৮ম"], classesEn: ["Class 6", "Class 7", "Class 8"], campus: "both" },
];

const Results = () => {
  const { t, lang } = useLanguage();
  const [campus, setCampus] = useState<"boys" | "girls">("boys");

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
                  {results.map((r) =>
                    (lang === "bn" ? r.classes : r.classesEn).map((cls, j) => (
                      <tr key={`${r.id}-${j}`} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="py-4 font-bengali text-foreground">{j === 0 ? (lang === "bn" ? r.exam : r.examEn) : ""}</td>
                        <td className="py-4 font-bengali text-muted-foreground">{cls}</td>
                        <td className="py-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm hover:bg-accent/20 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </motion.button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Results;
