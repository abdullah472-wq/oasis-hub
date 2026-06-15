import { useMemo, useState } from "react";
import { Award, Download, Medal, Search, Trophy, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Result } from "@/lib/results";
import { exportMeritListToPDF, exportResultsToExcel, exportResultsToCSV } from "@/lib/exportService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/admin/AdminPagePrimitives";
import { cn } from "@/lib/utils";

interface MeritListPageProps {
  items: Result[];
}

type MeritView = "class" | "section" | "madrasa" | "subject-toppers";

const rankResults = (results: Result[]) => {
  const sorted = [...results]
    .filter((r) => r.gpa && r.gpa > 0)
    .sort((a, b) => Number(b.gpa || 0) - Number(a.gpa || 0) || Number(b.obtainedMarks || 0) - Number(a.obtainedMarks || 0));
  let lastGpa: number | null = null;
  let lastPos = 0;
  return sorted.map((item, index) => {
    const pos = lastGpa === item.gpa ? lastPos : index + 1;
    lastGpa = item.gpa || null;
    lastPos = pos;
    return { ...item, meritRank: pos };
  });
};

const MeritListPage = ({ items }: MeritListPageProps) => {
  const { t } = useLanguage();
  const [view, setView] = useState<MeritView>("class");
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const personalResults = useMemo(() => items.filter((i) => (i.resultType ?? "personal") === "personal"), [items]);
  const classOptions = useMemo(() => [...new Set(personalResults.map((r) => r.className).filter(Boolean))].sort(), [personalResults]);

  const classMerit = useMemo(() => {
    const grouped = new Map<string, typeof personalResults>();
    personalResults.forEach((r) => {
      const key = r.className || "Unknown";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    });
    const result: { className: string; list: (typeof personalResults[0] & { meritRank: number })[] }[] = [];
    grouped.forEach((list, className) => result.push({ className, list: rankResults(list) }));
    return result.sort((a, b) => a.className.localeCompare(b.className));
  }, [personalResults]);

  const sectionMerit = useMemo(() => {
    const grouped = new Map<string, typeof personalResults>();
    personalResults.forEach((r) => {
      const key = `${r.className || "Unknown"}-${r.section || "A"}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    });
    const result: { key: string; className: string; section: string; list: (typeof personalResults[0] & { meritRank: number })[] }[] = [];
    grouped.forEach((list, key) => {
      const [className, section] = key.split("-");
      result.push({ key, className, section, list: rankResults(list) });
    });
    return result.sort((a, b) => a.key.localeCompare(b.key));
  }, [personalResults]);

  const madrasaMerit = useMemo(() => rankResults(personalResults), [personalResults]);

  const subjectToppers = useMemo(() => {
    const subjectMap = new Map<string, { name: string; results: typeof personalResults }>();
    personalResults.forEach((r) => {
      r.subjects?.forEach((s) => {
        if (!subjectMap.has(s.id)) subjectMap.set(s.id, { name: s.name, results: [] });
        subjectMap.get(s.id)!.results.push(r);
      });
    });
    const toppers: { subject: string; results: (typeof personalResults[0] & { meritRank: number })[] }[] = [];
    subjectMap.forEach((entry) => {
      const sorted = rankResults(entry.results);
      toppers.push({ subject: entry.name, results: sorted.slice(0, 5) });
    });
    return toppers;
  }, [personalResults]);

  const filters =
    view === "class"
      ? classMerit
      : view === "section"
        ? sectionMerit
        : [];

  const visibleFilters = filters.filter((f) => !selectedClass || f.className === selectedClass);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bengali text-2xl font-semibold text-foreground">{t("মেধা তালিকা", "Merit List")}</h2>
          <p className="font-bengali text-sm text-muted-foreground">{t("শ্রেণি, সেকশন ও মাদ্রাসাভিত্তিক মেধা তালিকা", "Class, section, and madrasa-wide merit lists")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {([{ k: "class" as MeritView, bn: "শ্রেণি ভিত্তিক", en: "Class Wise", icon: Users },
          { k: "section" as MeritView, bn: "সেকশন ভিত্তিক", en: "Section Wise", icon: Users },
          { k: "madrasa" as MeritView, bn: "মাদ্রাসা ভিত্তিক", en: "Madrasa Wide", icon: Medal },
          { k: "subject-toppers" as MeritView, bn: "বিষয়ভিত্তিক টপার", en: "Subject Toppers", icon: Award }]).map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.k} type="button" onClick={() => setView(tab.k)}
              className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 font-bengali text-sm font-medium transition-all", view === tab.k ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80")}
            >
              <Icon className="h-4 w-4" /> {t(tab.bn, tab.en)}
            </button>
          );
        })}
      </div>

      {view !== "madrasa" && view !== "subject-toppers" ? (
        <div className="flex gap-3">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
            className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none flex-1 max-w-xs">
            <option value="">{t("সব ক্লাস", "All Classes")}</option>
            {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-2xl pl-9" placeholder={t("নাম/আইডি দিয়ে সার্চ", "Search by name/ID")} />
          </div>
        </div>
      ) : null}

      {view === "class" ? (
        visibleFilters.length === 0 ? <EmptyState text={t("কোনো তথ্য নেই", "No data available")} /> : (
          <div className="space-y-6">
            {visibleFilters.map(({ className, list }) => (
              <div key={className} className="rounded-2xl border border-border/60 bg-card/95 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 px-5 py-3 border-b border-border/60">
                  <h3 className="font-bengali text-lg font-semibold text-foreground">{className}</h3>
                  <p className="text-xs text-muted-foreground">{list.length} {t("জন শিক্ষার্থী", "students")}</p>
                </div>
                <div className="p-4 space-y-2">
                  {list.filter((r) => !search || r.studentName?.toLowerCase().includes(search.toLowerCase()) || r.studentId?.toLowerCase().includes(search.toLowerCase())).slice(0, 50).map((r) => (
                    <div key={r.id || r.studentId} className="flex items-center justify-between rounded-xl border border-border/40 bg-background px-4 py-2.5 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getMedalEmoji(r.meritRank)}</span>
                        <div>
                          <p className="font-bengali text-sm font-semibold text-foreground">{r.studentName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">ID: {r.studentId} • Roll: {r.roll}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">{r.gpa?.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{r.grade} • {r.obtainedMarks}/{r.totalMarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : view === "section" ? (
        visibleFilters.length === 0 ? <EmptyState text={t("কোনো তথ্য নেই", "No data available")} /> : (
          <div className="space-y-4">
            {visibleFilters.map(({ key, className, section, list }) => (
              <div key={key} className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-4">
                <h3 className="font-bengali text-base font-semibold text-foreground mb-3">{className} - {section}</h3>
                <div className="space-y-1.5">
                  {list.filter((r) => !search || r.studentName?.toLowerCase().includes(search.toLowerCase())).slice(0, 30).map((r) => (
                    <div key={r.id || r.studentId} className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-muted/20">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-6">{getMedalEmoji(r.meritRank)}</span>
                        <span className="font-bengali text-sm text-foreground">{r.studentName}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">{r.gpa?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : view === "madrasa" ? (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bengali text-lg font-semibold text-foreground">{t("মাদ্রাসা মেধা তালিকা", "Madrasa Merit List")}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => exportResultsToExcel(personalResults, "Madrasa_Merit_List")}>
                <Download className="h-3.5 w-3.5 mr-1" /> Excel
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => exportResultsToCSV(personalResults, "Madrasa_Merit_List")}>
                <Download className="h-3.5 w-3.5 mr-1" /> CSV
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            {madrasaMerit.filter((r) => !search || r.studentName?.toLowerCase().includes(search.toLowerCase())).slice(0, 100).map((r) => (
              <div key={r.id || r.studentId} className="flex items-center justify-between rounded-lg border border-border/40 bg-background px-4 py-2 hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getMedalEmoji(r.meritRank)}</span>
                  <div>
                    <p className="font-bengali text-sm font-semibold text-foreground">{r.studentName}</p>
                    <p className="text-xs text-muted-foreground">{r.className} • Roll: {r.roll}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{r.gpa?.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{r.grade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjectToppers.map(({ subject, results }) => (
            <div key={subject} className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-amber-500" />
                <h4 className="font-bengali text-sm font-semibold text-foreground">{subject}</h4>
              </div>
              <div className="space-y-1.5">
                {results.map((r, i) => (
                  <div key={r.id || i} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                      <span className="font-bengali text-xs text-foreground">{r.studentName}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">{r.gpa?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeritListPage;
