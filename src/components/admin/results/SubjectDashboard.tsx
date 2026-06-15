import { useMemo } from "react";
import { BookOpen, Layers, Clock, CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Subject } from "@/lib/subjects";
import type { SubjectGroup } from "@/lib/subjectGroups";
import type { ClassSubjectConfig } from "@/lib/classSubjects";
import {
  countSubjectsByStatus,
  countSubjectsByCategory,
  getCategoryLabel,
  allCategories,
} from "@/lib/subjects";
import { cn } from "@/lib/utils";

const PIE_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#d946ef", "#0ea5e9", "#e11d48",
];

interface SubjectDashboardProps {
  subjects: Subject[];
  subjectGroups: SubjectGroup[];
  classConfigs: ClassSubjectConfig[];
}

const SubjectDashboard = ({ subjects, subjectGroups, classConfigs }: SubjectDashboardProps) => {
  const { t, lang } = useLanguage();

  const statusCounts = useMemo(() => countSubjectsByStatus(subjects), [subjects]);
  const categoryDistribution = useMemo(() => countSubjectsByCategory(subjects), [subjects]);

  const subjectGroupsUsed = useMemo(() => {
    const used = new Set<string>();
    classConfigs.forEach((config) => {
      config.subjects.forEach((s) => {
        if (s.category) used.add(s.category);
      });
    });
    return used.size;
  }, [classConfigs]);

  const lastUpdated = useMemo(() => {
    if (subjects.length === 0) return null;
    return Math.max(...subjects.map((s) => s.updatedAt));
  }, [subjects]);

  const categoryChartData = useMemo(() => {
    return allCategories
      .filter((cat) => (categoryDistribution[cat] || 0) > 0)
      .map((cat, index) => ({
        name: getCategoryLabel(cat, lang),
        value: categoryDistribution[cat] || 0,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [categoryDistribution, lang]);

  const stats = [
    {
      label: t("মোট বিষয়", "Total Subjects"),
      value: subjects.length,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: t("সক্রিয়", "Active"),
      value: statusCounts.active,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: t("নিষ্ক্রিয়", "Inactive"),
      value: statusCounts.inactive,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: t("বিষয় গ্রুপ", "Subject Groups"),
      value: subjectGroups.length,
      icon: Layers,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: t("ক্লাস কনফিগ", "Class Configs"),
      value: classConfigs.length,
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: t("ব্যবহৃত গ্রুপ", "Used Groups"),
      value: subjectGroupsUsed,
      icon: PieChartIcon,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <BookOpen className="h-5 w-5" />
        <span className="font-bengali text-sm font-semibold uppercase tracking-[0.2em]">
          {t("বিষয় ব্যবস্থাপনা", "Subject Management")}
        </span>
      </div>
      <div>
        <h2 className="font-bengali text-2xl font-semibold text-foreground">
          {t("বিষয় ড্যাশবোর্ড", "Subject Dashboard")}
        </h2>
        <p className="font-bengali text-sm text-muted-foreground">
          {t("বিষয়, গ্রুপ ও ক্লাস কনফিগারেশনের সামগ্রিক অবস্থা", "Overall status of subjects, groups, and class configurations")}
        </p>
      </div>

      {lastUpdated ? (
        <p className="font-bengali text-xs text-muted-foreground">
          {t("সর্বশেষ আপডেট", "Last updated")}: {new Date(lastUpdated).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="font-bengali text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="font-bengali mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <h3 className="font-bengali mb-4 text-base font-semibold">
            {t("বিভাগ অনুযায়ী বিষয়", "Subjects by Category")}
          </h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="font-bengali py-10 text-center text-sm text-muted-foreground">
              {t("কোনো বিষয় নেই", "No subjects available")}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <h3 className="font-bengali mb-4 text-base font-semibold">
            {t("বিভাগ ভিত্তিক পরিসংখ্যান", "Category Statistics")}
          </h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="font-bengali py-10 text-center text-sm text-muted-foreground">
              {t("কোনো বিষয় নেই", "No subjects available")}
            </p>
          )}
        </div>
      </div>

      {classConfigs.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <h3 className="font-bengali mb-4 text-base font-semibold">
            {t("ক্লাস অনুযায়ী কনফিগারেশন", "Configurations by Class")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classConfigs.map((config) => (
              <div key={config.id} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bengali text-sm font-semibold">{config.className}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {config.subjects.length} {t("বিষয়", "subjects")}
                  </span>
                </div>
                {config.academicYear ? (
                  <p className="font-bengali mt-1 text-xs text-muted-foreground">
                    {config.academicYear}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDashboard;
