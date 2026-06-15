import { useMemo } from "react";
import { Award, BarChart3, BookOpen, FileText, GraduationCap, GroupIcon, TrendingUp, Users, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Result } from "@/lib/results";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const GPA_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"];
const GPA_RANGES = [
  { min: 0, max: 0, label: "F (0)" },
  { min: 0.01, max: 1, label: "D (1)" },
  { min: 1.01, max: 2, label: "C (2)" },
  { min: 2.01, max: 3, label: "B (3)" },
  { min: 3.01, max: 3.5, label: "A- (3.5)" },
  { min: 3.51, max: 4, label: "A (4)" },
  { min: 4.01, max: 5, label: "A+ (5)" },
];

interface ResultDashboardProps {
  items: Result[];
}

const ResultDashboard = ({ items }: ResultDashboardProps) => {
  const { t } = useLanguage();

  const personalResults = useMemo(
    () => items.filter((item) => (item.resultType ?? (item.pdfUrl ? "group" : "personal")) === "personal"),
    [items],
  );
  const groupResults = useMemo(
    () => items.filter((item) => (item.resultType ?? (item.pdfUrl ? "group" : "personal")) === "group"),
    [items],
  );

  const uniqueExams = useMemo(() => Array.from(new Set(items.map((item) => item.exam).filter(Boolean))), [items]);
  const passedStudents = useMemo(() => personalResults.filter((item) => item.grade && item.grade !== "F"), [personalResults]);
  const failedStudents = useMemo(() => personalResults.filter((item) => item.grade === "F"), [personalResults]);
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, Result>();
    personalResults.forEach((item) => {
      if (item.studentId || item.studentName) {
        const key = item.studentId || item.studentName;
        if (!map.has(key)) map.set(key, item);
      }
    });
    return Array.from(map.values());
  }, [personalResults]);

  const avgGpa = useMemo(() => {
    if (personalResults.length === 0) return 0;
    const sum = personalResults.reduce((acc, item) => acc + Number(item.gpa || 0), 0);
    return sum / personalResults.length;
  }, [personalResults]);

  const highestGpa = useMemo(() => {
    if (personalResults.length === 0) return 0;
    return Math.max(...personalResults.map((item) => Number(item.gpa || 0)));
  }, [personalResults]);

  const passPercent = useMemo(() => {
    if (personalResults.length === 0) return 0;
    return (passedStudents.length / personalResults.length) * 100;
  }, [personalResults, passedStudents]);

  const topPerformers = useMemo(() => {
    return [...personalResults]
      .filter((item) => item.gpa && item.gpa > 0)
      .sort((a, b) => Number(b.gpa || 0) - Number(a.gpa || 0) || Number(b.obtainedMarks || 0) - Number(a.obtainedMarks || 0))
      .slice(0, 10);
  }, [personalResults]);

  const passRateByExam = useMemo(() => {
    const examMap = new Map<string, { total: number; passed: number }>();
    personalResults.forEach((item) => {
      const exam = item.exam || "Unknown";
      if (!examMap.has(exam)) examMap.set(exam, { total: 0, passed: 0 });
      const entry = examMap.get(exam)!;
      entry.total++;
      if (item.grade && item.grade !== "F") entry.passed++;
    });
    return Array.from(examMap.entries())
      .map(([exam, data]) => ({
        exam: exam.length > 15 ? exam.slice(0, 15) + "..." : exam,
        passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
        total: data.total,
      }))
      .sort((a, b) => b.passRate - a.passRate);
  }, [personalResults]);

  const gpaDistribution = useMemo(() => {
    return GPA_RANGES.map((range) => {
      const count = personalResults.filter((item) => {
        const gpa = Number(item.gpa || 0);
        return gpa >= range.min && gpa <= range.max;
      }).length;
      return { label: range.label, count, fill: GPA_COLORS[GPA_RANGES.indexOf(range)] };
    });
  }, [personalResults]);

  const subjectPerformance = useMemo(() => {
    const subjectMap = new Map<string, { total: number; count: number; maxTotal: number }>();
    personalResults.forEach((item) => {
      item.subjects?.forEach((subject) => {
        const name = subject.name || "Unknown";
        if (!subjectMap.has(name)) subjectMap.set(name, { total: 0, count: 0, maxTotal: 0 });
        const entry = subjectMap.get(name)!;
        entry.total += subject.totalMark;
        entry.count++;
        entry.maxTotal += subject.totalMaxMark;
      });
    });
    return Array.from(subjectMap.entries())
      .map(([name, data]) => ({
        subject: name.length > 12 ? name.slice(0, 12) + "..." : name,
        average: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
        percentage: data.maxTotal > 0 ? Math.round((data.total / data.maxTotal) * 100) : 0,
        students: data.count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [personalResults]);

  const classComparison = useMemo(() => {
    const classMap = new Map<string, { gpaSum: number; count: number }>();
    personalResults.forEach((item) => {
      const cls = item.className || "Unknown";
      if (!classMap.has(cls)) classMap.set(cls, { gpaSum: 0, count: 0 });
      const entry = classMap.get(cls)!;
      entry.gpaSum += Number(item.gpa || 0);
      entry.count++;
    });
    return Array.from(classMap.entries())
      .map(([className, data]) => ({
        className: className.length > 12 ? className.slice(0, 12) + "..." : className,
        avgGpa: data.count > 0 ? Math.round((data.gpaSum / data.count) * 100) / 100 : 0,
        students: data.count,
      }))
      .sort((a, b) => b.avgGpa - a.avgGpa);
  }, [personalResults]);

  const gradeDistribution = useMemo(() => {
    const gradeMap = new Map<string, number>();
    personalResults.forEach((item) => {
      const grade = item.grade || "N/A";
      gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);
    });
    return Array.from(gradeMap.entries())
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => {
        const order = ["A+", "A", "A-", "B", "C", "D", "F"];
        return order.indexOf(a.grade) - order.indexOf(b.grade);
      });
  }, [personalResults]);

  const stats = [
    { labelBn: "মোট পরীক্ষা", labelEn: "Total Exams", value: uniqueExams.length, icon: BookOpen, color: "from-blue-500 to-blue-600", textColor: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
    { labelBn: "প্রকাশিত রেজাল্ট", labelEn: "Published Results", value: personalResults.length + groupResults.length, icon: FileText, color: "from-emerald-500 to-emerald-600", textColor: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
    { labelBn: "শিক্ষার্থী উপস্থিত", labelEn: "Students Appeared", value: uniqueStudents.length, icon: Users, color: "from-violet-500 to-violet-600", textColor: "text-violet-700 dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
    { labelBn: "পাস করেছে", labelEn: "Passed", value: passedStudents.length, icon: Award, color: "from-green-500 to-green-600", textColor: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800" },
    { labelBn: "ফেল করেছে", labelEn: "Failed", value: failedStudents.length, icon: Zap, color: "from-red-500 to-red-600", textColor: "text-red-700 dark:text-red-300", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
    { labelBn: "পাসের হার", labelEn: "Pass Rate", value: `${passPercent.toFixed(1)}%`, icon: TrendingUp, color: "from-cyan-500 to-cyan-600", textColor: "text-cyan-700 dark:text-cyan-300", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800" },
    { labelBn: "সর্বোচ্চ GPA", labelEn: "Highest GPA", value: highestGpa.toFixed(2), icon: GraduationCap, color: "from-amber-500 to-amber-600", textColor: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
    { labelBn: "গড় GPA", labelEn: "Average GPA", value: avgGpa.toFixed(2), icon: GroupIcon, color: "from-indigo-500 to-indigo-600", textColor: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bengali text-2xl font-semibold text-foreground">{t("রেজাল্ট ড্যাশবোর্ড", "Result Dashboard")}</h2>
          <p className="font-bengali text-sm text-muted-foreground">{t("সকল পরীক্ষার সারাংশ, বিশ্লেষণ এবং শীর্ষ শিক্ষার্থী", "Exam summary, analytics, and top performers")}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key || stat.labelEn} className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bengali text-xs font-medium uppercase tracking-wider text-muted-foreground">{t(stat.labelBn, stat.labelEn)}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Pass Rate + GPA Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pass Rate by Exam */}
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <h3 className="font-bengali text-base font-semibold text-foreground mb-4">{t("পরীক্ষা অনুযায়ী পাসের হার", "Pass Rate by Exam")}</h3>
          {passRateByExam.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground py-8 text-center">{t("কোনো তথ্য নেই", "No data available")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={passRateByExam} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="exam" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Pass Rate"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="passRate" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {passRateByExam.map((entry, index) => (
                    <Cell key={entry.exam} fill={entry.passRate >= 80 ? "#22c55e" : entry.passRate >= 50 ? "#eab308" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* GPA Distribution */}
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <h3 className="font-bengali text-base font-semibold text-foreground mb-4">{t("GPA বিতরণ", "GPA Distribution")}</h3>
          {gpaDistribution.every((d) => d.count === 0) ? (
            <p className="font-bengali text-sm text-muted-foreground py-8 text-center">{t("কোনো তথ্য নেই", "No data available")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gpaDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [value, "Students"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {gpaDistribution.map((entry, index) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2: Subject Performance + Class Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject Performance */}
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <h3 className="font-bengali text-base font-semibold text-foreground mb-4">{t("বিষয়ভিত্তিক গড় নম্বর", "Subject Average")}</h3>
          {subjectPerformance.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground py-8 text-center">{t("কোনো তথ্য নেই", "No data available")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="subject" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(value: number) => [value, "Average"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="average" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {subjectPerformance.map((entry, index) => (
                    <Cell key={entry.subject} fill={GPA_COLORS[index % GPA_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Class Comparison */}
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <h3 className="font-bengali text-base font-semibold text-foreground mb-4">{t("শ্রেণিভিত্তিক গড় GPA", "Average GPA by Class")}</h3>
          {classComparison.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground py-8 text-center">{t("কোনো তথ্য নেই", "No data available")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classComparison} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="className" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(2), "Avg GPA"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="avgGpa" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {classComparison.map((entry, index) => (
                    <Cell key={entry.className} fill={entry.avgGpa >= 4 ? "#22c55e" : entry.avgGpa >= 3 ? "#eab308" : "#f97316"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grade Distribution + Top Performers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grade Distribution Pie */}
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <h3 className="font-bengali text-base font-semibold text-foreground mb-4">{t("গ্রেড বিতরণ", "Grade Distribution")}</h3>
          {gradeDistribution.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground py-8 text-center">{t("কোনো তথ্য নেই", "No data available")}</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={260}>
                <PieChart>
                  <Pie data={gradeDistribution} dataKey="count" nameKey="grade" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={entry.grade} fill={GPA_COLORS[index % GPA_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {gradeDistribution.map((entry, index) => (
                  <div key={entry.grade} className="flex items-center gap-2 text-xs">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: GPA_COLORS[index % GPA_COLORS.length] }} />
                    <span className="font-medium text-foreground">{entry.grade}</span>
                    <span className="text-muted-foreground">({entry.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <h3 className="font-bengali text-base font-semibold text-foreground mb-4">{t("শীর্ষ ১০ শিক্ষার্থী", "Top 10 Performers")}</h3>
          {topPerformers.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground py-8 text-center">{t("কোনো তথ্য নেই", "No data available")}</p>
          ) : (
            <div className="space-y-2">
              {topPerformers.map((student, index) => (
                <div key={student.studentId || index} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background px-4 py-2.5 transition-colors hover:bg-muted/20">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    index === 0 ? "bg-amber-100 text-amber-700" :
                    index === 1 ? "bg-slate-200 text-slate-700" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-muted text-muted-foreground",
                  )}>
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bengali text-sm font-semibold text-foreground truncate">{student.studentName || "Unknown"}</p>
                    <p className="font-bengali text-xs text-muted-foreground">
                      {student.exam} • {student.className}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-600">{Number(student.gpa || 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{student.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
