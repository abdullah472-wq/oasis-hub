import { useEffect, useMemo, useState, type FormEvent } from "react";

import { motion } from "framer-motion";
import { Download, ExternalLink, Search } from "lucide-react";

import WaveDivider from "@/components/WaveDivider";
import { useLanguage } from "@/contexts/LanguageContext";
import { springIn } from "@/lib/animations";
import { Result, getResults } from "@/lib/results";
import { getDownloadUrl } from "@/lib/upload";

const normalizeStudentId = (value: string) => value.trim().toLowerCase();

const Results = () => {
  const { t, lang } = useLanguage();
  const [campus, setCampus] = useState<"boys" | "girls">("boys");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [searchedStudentId, setSearchedStudentId] = useState("");

  useEffect(() => {
    getResults()
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredResults = useMemo(
    () => results.filter((result) => result.campus === campus || result.campus === "both"),
    [campus, results],
  );

  const groupResults = useMemo(
    () => filteredResults.filter((result) => (result.resultType ?? (result.pdfUrl ? "group" : "personal")) === "group"),
    [filteredResults],
  );

  const personalResults = useMemo(
    () => filteredResults.filter((result) => (result.resultType ?? (result.pdfUrl ? "group" : "personal")) === "personal"),
    [filteredResults],
  );

  const searchedPersonalResults = useMemo(() => {
    const targetStudentId = normalizeStudentId(searchedStudentId);
    if (!targetStudentId) {
      return [];
    }

    return personalResults.filter((result) => normalizeStudentId(result.studentId ?? "") === targetStudentId);
  }, [personalResults, searchedStudentId]);

  const renderCampusLabel = (value: Result["campus"]) => {
    if (value === "girls") return t("বালিকা", "Girls");
    if (value === "boys") return t("বালক", "Boys");
    return t("উভয়", "Both");
  };

  const handleStudentIdSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchedStudentId(studentIdInput.trim());
  };

  return (
    <div>
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-primary md:h-64">
        <motion.h1
          {...springIn}
          className="font-bengali text-primary-foreground"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}
        >
          {t("পরীক্ষার ফলাফল", "Exam Results")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
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

          <div className="space-y-8">
            <section className="card-institutional p-8">
              <div className="mb-6">
                <h2 className="font-bengali text-2xl font-bold text-foreground">
                  {t("স্টুডেন্ট আইডি দিয়ে পার্সোনাল রেজাল্ট খুঁজুন", "Search Personal Result by Student ID")}
                </h2>
                <p className="mt-2 font-bengali text-sm text-muted-foreground">
                  {t("শুধু যে স্টুডেন্ট আইডি সার্চ করবেন, সেই আইডির রেজাল্টই এখানে দেখানো হবে।", "Only the searched student ID result will be shown here.")}
                </p>
              </div>

              <form onSubmit={handleStudentIdSearch} className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={studentIdInput}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setStudentIdInput(nextValue);
                      if (!nextValue.trim()) {
                        setSearchedStudentId("");
                      }
                    }}
                    placeholder={t("স্টুডেন্ট আইডি লিখুন", "Enter student ID")}
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 font-bengali text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <button type="submit" className="squishy-button font-bengali md:min-w-40">
                  {t("রেজাল্ট দেখুন", "Show Result")}
                </button>
              </form>

              {searchedStudentId ? (
                loading ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : searchedPersonalResults.length === 0 ? (
                  <p className="pt-6 font-bengali text-sm text-muted-foreground">
                    {t("এই স্টুডেন্ট আইডির কোনো পার্সোনাল রেজাল্ট পাওয়া যায়নি।", "No personal result found for this student ID.")}
                  </p>
                ) : (
                  <div className="mt-6 grid gap-4">
                    {searchedPersonalResults.map((result, index) => (
                      <div key={result.id || index} className="rounded-2xl border border-border bg-background/80 p-5 shadow-sm">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-bengali text-lg font-bold text-foreground">
                              {result.studentName || t("নাম পাওয়া যায়নি", "Name unavailable")}
                            </h3>
                            <p className="font-bengali text-sm text-muted-foreground">
                              {t("স্টুডেন্ট আইডি", "Student ID")}: {result.studentId || "-"}
                            </p>
                          </div>
                          <div className="rounded-full bg-primary/10 px-4 py-2 font-bengali text-sm font-semibold text-primary">
                            {lang === "bn" ? result.exam : result.examEn || result.exam}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-xl bg-secondary/40 p-4">
                            <p className="font-bengali text-xs uppercase tracking-wide text-muted-foreground">{t("শ্রেণি", "Class")}</p>
                            <p className="mt-1 font-bengali text-base font-semibold text-foreground">
                              {lang === "bn" ? result.className : result.classNameEn || result.className}
                            </p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-4">
                            <p className="font-bengali text-xs uppercase tracking-wide text-muted-foreground">{t("সেকশন", "Section")}</p>
                            <p className="mt-1 font-bengali text-base font-semibold text-foreground">{result.section || "-"}</p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-4">
                            <p className="font-bengali text-xs uppercase tracking-wide text-muted-foreground">{t("জিপিএ / গ্রেড", "GPA / Grade")}</p>
                            <p className="mt-1 font-bengali text-base font-semibold text-foreground">
                              {result.gpa ?? "-"} / {result.grade || "-"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-4">
                            <p className="font-bengali text-xs uppercase tracking-wide text-muted-foreground">{t("অবস্থান", "Position")}</p>
                            <p className="mt-1 font-bengali text-base font-semibold text-foreground">{result.position ?? "-"}</p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-4">
                            <p className="font-bengali text-xs uppercase tracking-wide text-muted-foreground">{t("প্রাপ্ত নম্বর", "Obtained Marks")}</p>
                            <p className="mt-1 font-bengali text-base font-semibold text-foreground">{result.obtainedMarks ?? "-"}</p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-4">
                            <p className="font-bengali text-xs uppercase tracking-wide text-muted-foreground">{t("মোট নম্বর", "Total Marks")}</p>
                            <p className="mt-1 font-bengali text-base font-semibold text-foreground">{result.totalMarks ?? "-"}</p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-4">
                            <p className="font-bengali text-xs uppercase tracking-wide text-muted-foreground">{t("ক্যাম্পাস", "Campus")}</p>
                            <p className="mt-1 font-bengali text-base font-semibold text-foreground">{renderCampusLabel(result.campus)}</p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-4">
                            <p className="font-bengali text-xs uppercase tracking-wide text-muted-foreground">{t("মন্তব্য", "Remarks")}</p>
                            <p className="mt-1 font-bengali text-base font-semibold text-foreground">
                              {lang === "bn" ? result.remarksBn || "-" : result.remarksEn || result.remarksBn || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </section>

            <section className="card-institutional p-8">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : groupResults.length === 0 ? (
                <p className="py-8 text-center font-bengali text-muted-foreground">
                  {t("কোনো গ্রুপ রেজাল্ট পাওয়া যায়নি", "No group results available")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="py-4 text-left font-bengali font-bold text-foreground">{t("পরীক্ষা", "Exam")}</th>
                        <th className="py-4 text-left font-bengali font-bold text-foreground">{t("শ্রেণি", "Class")}</th>
                        <th className="py-4 text-left font-bengali font-bold text-foreground">{t("ক্যাম্পাস", "Campus")}</th>
                        <th className="py-4 text-right font-bengali font-bold text-foreground">{t("ডাউনলোড", "Download")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupResults.map((result, index) => (
                        <tr key={result.id || index} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                          <td className="py-4 font-bengali text-foreground">{lang === "bn" ? result.exam : result.examEn || result.exam}</td>
                          <td className="py-4 font-bengali text-muted-foreground">{lang === "bn" ? result.className : result.classNameEn || result.className}</td>
                          <td className="py-4 font-bengali text-muted-foreground">{renderCampusLabel(result.campus)}</td>
                          <td className="py-4 text-right">
                            {result.pdfUrl ? (
                              <a
                                href={getDownloadUrl(result.pdfUrl)}
                                download={`${result.examEn || result.exam || "result"}.pdf`}
                                className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                              >
                                <Download className="h-4 w-4" />
                                PDF
                              </a>
                            ) : (
                              <span className="text-sm text-muted-foreground">{t("পিডিএফ নেই", "No PDF")}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Results;
