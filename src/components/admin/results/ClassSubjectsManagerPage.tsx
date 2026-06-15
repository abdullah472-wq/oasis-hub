import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { CLASS_NAME_OPTIONS, normalizeClassName } from "@/lib/attendanceHelpers";
import type { ClassSubjectConfig, ClassSubjectItem, SubjectMarkComponents } from "@/lib/classSubjects";
import { DEFAULT_MARK_COMPONENTS, calculateFullMarks } from "@/lib/classSubjects";
import type { Subject } from "@/lib/subjects";
import type { SubjectGroup } from "@/lib/subjectGroups";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DeleteIconButton,
  EmptyState,
  Field,
  FormCard,
  ModuleShell,
  shellCardClass,
} from "@/components/admin/AdminPagePrimitives";

const ACADEMIC_YEARS = Array.from({ length: 6 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i;
  return `${year}-${year + 1}`;
});

const createEmptySubject = (index: number): ClassSubjectItem => ({
  id: `subject-${Date.now()}-${index}`,
  name: "",
  nameEn: "",
  testMark: 25,
  semesterMark: 75,
  markComponents: { ...DEFAULT_MARK_COMPONENTS },
  orderIndex: index,
});

interface ClassSubjectsManagerPageProps {
  configs: ClassSubjectConfig[];
  subjects: Subject[];
  subjectGroups?: SubjectGroup[];
  onSave: (payload: Omit<ClassSubjectConfig, "createdAt" | "updatedAt">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ClassSubjectsManagerPage = ({
  configs,
  subjects,
  subjectGroups = [],
  onSave,
  onDelete,
}: ClassSubjectsManagerPageProps) => {
  const { t } = useLanguage();
  const classOptions = CLASS_NAME_OPTIONS;

  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [className, setClassName] = useState("");
  const [classNameEn, setClassNameEn] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [session, setSession] = useState("");
  const [subjectList, setSubjectList] = useState<ClassSubjectItem[]>([createEmptySubject(0)]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [useMarkComponents, setUseMarkComponents] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const selectedConfig = useMemo(
    () => configs.find((item) => normalizeClassName(item.className) === normalizeClassName(selectedClass) && (!academicYear || item.academicYear === academicYear)) || null,
    [configs, selectedClass, academicYear],
  );

  useEffect(() => {
    if (!selectedConfig) return;
    const normalizedClass = normalizeClassName(selectedConfig.className);
    setSelectedClass(normalizedClass);
    setClassName(normalizedClass);
    setClassNameEn(selectedConfig.classNameEn || normalizedClass);
    setAcademicYear(selectedConfig.academicYear || "");
    setSession(selectedConfig.session || "");
    setSubjectList(
      selectedConfig.subjects.length > 0
        ? selectedConfig.subjects.map((item, index) => ({
            ...item,
            id: item.id || `subject-${index + 1}`,
            markComponents: item.markComponents || (useMarkComponents ? { ...DEFAULT_MARK_COMPONENTS } : undefined),
          }))
        : [createEmptySubject(0)],
    );
  }, [selectedConfig?.id]);

  useEffect(() => {
    if (subjectList.some((s) => s.markComponents)) {
      setUseMarkComponents(true);
    }
  }, [subjectList]);

  const resetForm = () => {
    setSelectedClass("");
    setClassName("");
    setClassNameEn("");
    setAcademicYear("");
    setSession("");
    setSubjectList([createEmptySubject(0)]);
    setUseMarkComponents(false);
    setShowSubjectPicker(false);
  };

  const updateSubject = (index: number, patch: Partial<ClassSubjectItem>) => {
    setSubjectList((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const updateMarkComponent = (index: number, field: keyof SubjectMarkComponents, value: number) => {
    setSubjectList((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              markComponents: {
                ...(item.markComponents || { ...DEFAULT_MARK_COMPONENTS }),
                [field]: Math.max(0, value),
              },
            }
          : item,
      ),
    );
  };

  const addSubject = () => {
    setSubjectList((current) => [...current, createEmptySubject(current.length)]);
  };

  const removeSubject = (index: number) => {
    if (subjectList.length > 1) {
      setSubjectList((current) => current.filter((_, i) => i !== index));
    }
  };

  const moveSubject = (index: number, direction: "up" | "down") => {
    setSubjectList((current) => {
      const next = [...current];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return next;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, i) => ({ ...item, orderIndex: i }));
    });
  };

  const pickMasterSubject = (subject: Subject) => {
    const existingIds = new Set(subjectList.map((s) => s.subjectCode));
    if (subject.code && existingIds.has(subject.code)) {
      toast.error(t("বিষয়টি ইতিমধ্যে যোগ করা হয়েছে", "Subject already added"));
      return;
    }
    setSubjectList((current) => [
      ...current,
      {
        id: `subject-${Date.now()}`,
        name: subject.nameBn,
        nameEn: subject.nameEn,
        subjectCode: subject.code,
        category: subject.category,
        testMark: subject.markConfig?.testMarks ?? 25,
        semesterMark: subject.markConfig?.semesterMarks ?? 75,
        markComponents: subject.markConfig
          ? {
              writtenMarks: subject.markConfig.writtenMarks ?? 50,
              oralMarks: subject.markConfig.oralMarks ?? 10,
              practicalMarks: subject.markConfig.practicalMarks ?? 10,
              assignmentMarks: subject.markConfig.assignmentMarks ?? 10,
              attendanceMarks: 5,
              testMarks: subject.markConfig.testMarks ?? 25,
              semesterMarks: subject.markConfig.semesterMarks ?? 75,
            }
          : undefined,
        orderIndex: current.length,
      },
    ]);
    setShowSubjectPicker(false);
  };

  const availableMasterSubjects = useMemo(
    () => subjects.filter((s) => s.status === "active").sort((a, b) => a.orderIndex - b.orderIndex),
    [subjects],
  );

  const markComponentFields: { key: keyof SubjectMarkComponents; labelBn: string; labelEn: string }[] = [
    { key: "writtenMarks", labelBn: "লিখিত", labelEn: "Written" },
    { key: "oralMarks", labelBn: "মৌখিক", labelEn: "Oral" },
    { key: "practicalMarks", labelBn: "প্রাক্টিক্যাল", labelEn: "Practical" },
    { key: "assignmentMarks", labelBn: "অ্যাসাইনমেন্ট", labelEn: "Assignment" },
    { key: "attendanceMarks", labelBn: "উপস্থিতি", labelEn: "Attendance" },
    { key: "testMarks", labelBn: "টেস্ট", labelEn: "Test" },
    { key: "semesterMarks", labelBn: "সেমিস্টার", labelEn: "Semester" },
  ];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!className.trim()) {
      toast.error(t("ক্লাস নির্বাচন করুন", "Select a class"));
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: selectedConfig?.id || "",
        className: className.trim(),
        classNameEn: classNameEn.trim(),
        academicYear: academicYear.trim() || undefined,
        session: session.trim() || undefined,
        subjects: subjectList
          .map((item, index) => ({
            ...item,
            name: item.name.trim(),
            nameEn: item.nameEn?.trim() || "",
            subjectCode: item.subjectCode || undefined,
            category: item.category || undefined,
            testMark: useMarkComponents ? (item.markComponents?.testMarks ?? 25) : Number(item.testMark || 25),
            semesterMark: useMarkComponents ? (item.markComponents?.semesterMarks ?? 75) : Number(item.semesterMark || 75),
            markComponents: useMarkComponents ? item.markComponents : undefined,
            orderIndex: index,
          }))
          .filter((item) => item.name),
      });
      setExpandedCardId(selectedConfig?.id || null);
      resetForm();
    } catch {
      toast.error(t("ক্লাসের বিষয় সংরক্ষণ করা যায়নি", "Could not save class subjects"));
    } finally {
      setSaving(false);
    }
  };

  const maxSubjectCount = useMemo(
    () => configs.reduce((max, item) => Math.max(max, item.subjects.length), 0),
    [configs],
  );

  return (
    <ModuleShell
      title={t("ক্লাস ও বিষয় সেটআপ", "Class Subject Setup")}
      description={t(
        "প্রতি ক্লাসের জন্য বিষয়, মার্ক বিতরণ এবং একাডেমিক সেশন নির্ধারণ করুন",
        "Set subjects, mark distribution, and academic session for each class",
      )}
      icon={<BookOpen className="h-5 w-5" />}
      recordCount={configs.length}
      recordLabel={t("কনফিগ", "Configs")}
    >
      <FormCard onSubmit={submit} saving={saving} submitLabel={t("ক্লাসের বিষয় সংরক্ষণ করুন", "Save class subjects")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("ক্লাস নির্বাচন করুন", "Select class")}>
            <select
              value={selectedClass}
              onChange={(event) => {
                const next = normalizeClassName(event.target.value);
                setSelectedClass(next);
                if (!next) { resetForm(); return; }
                const matched = configs.find((item) => normalizeClassName(item.className) === next) || null;
                if (matched) {
                  setClassName(next);
                  setClassNameEn(matched.classNameEn || next);
                  setAcademicYear(matched.academicYear || "");
                  setSession(matched.session || "");
                  setSubjectList(matched.subjects.length > 0 ? matched.subjects : [createEmptySubject(0)]);
                  return;
                }
                setClassName(next);
                setClassNameEn(next);
                setSubjectList([createEmptySubject(0)]);
              }}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
            >
              <option value="">{t("একটি ক্লাস নির্বাচন করুন", "Select a class")}</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label={t("একাডেমিক বছর / সেশন", "Academic Year / Session")}>
            <div className="flex gap-2">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="h-11 flex-1 rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("শিক্ষাবর্ষ", "Academic Year")}</option>
                {ACADEMIC_YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Input
                value={session}
                onChange={(e) => setSession(e.target.value)}
                placeholder={t("সেশন", "Session")}
                className="rounded-2xl h-11 w-28"
              />
            </div>
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 pb-1">
            <p className="font-bengali text-sm font-semibold text-foreground">{t("বিষয় তালিকা", "Subject list")}</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-xl px-3 text-xs font-bengali gap-1.5"
                onClick={() => setShowSubjectPicker((s) => !s)}
              >
                <BookOpen className="h-3.5 w-3.5" />
                {t("মাস্টার থেকে যোগ", "From Master")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-xl px-3 text-xs font-bengali gap-1.5"
                onClick={addSubject}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("বিষয় যোগ করুন", "Add subject")}
              </Button>
            </div>
          </div>

          {showSubjectPicker && (
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 max-h-48 overflow-y-auto">
              <p className="font-bengali text-xs text-muted-foreground mb-2">
                {t("মাস্টার তালিকা থেকে একটি বিষয় নির্বাচন করুন", "Select a subject from master list:")}
              </p>
              <div className="flex flex-wrap gap-2">
                {availableMasterSubjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickMasterSubject(s)}
                    className="rounded-full bg-background border border-border px-3 py-1 text-xs hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {s.nameBn} ({s.code})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-2">
            <input
              type="checkbox"
              id="useMarkComponents"
              checked={useMarkComponents}
              onChange={(e) => setUseMarkComponents(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="useMarkComponents" className="font-bengali text-sm cursor-pointer">
              {t("পূর্ণ মার্ক বিতরণ ব্যবহার করুন (লিখিত, মৌখিক, প্রাক্টিক্যাল, অ্যাসাইনমেন্ট, উপস্থিতি)", "Use full mark distribution (Written, Oral, Practical, Assignment, Attendance)")}
            </label>
          </div>

          <div className="divide-y divide-border/50 rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
            {subjectList.map((subject, index) => {
              const totalMarks = subject.markComponents ? calculateFullMarks(subject.markComponents) : subject.testMark + subject.semesterMark;
              return (
                <div key={subject.id} className="space-y-3 px-4 py-3 bg-background/60 hover:bg-background/90 transition-colors">
                  <div className="grid gap-x-3 gap-y-2 md:grid-cols-[1fr_1fr_100px_36px_auto] items-end">
                    <Field label={t("বিষয়ের নাম", "Subject name")}>
                      <Input
                        value={subject.name}
                        onChange={(e) => updateSubject(index, { name: e.target.value })}
                        className="rounded-xl h-9 text-sm"
                        placeholder={t("নাম", "Name")}
                      />
                    </Field>
                    <Field label={t("ইংরেজি নাম", "English name")}>
                      <Input
                        value={subject.nameEn || ""}
                        onChange={(e) => updateSubject(index, { nameEn: e.target.value })}
                        className="rounded-xl h-9 text-sm"
                      />
                    </Field>
                    {useMarkComponents ? (
                      <Field label={t("মোট", "Total")}>
                        <div className="flex h-9 items-center rounded-xl bg-muted/30 px-3 text-sm font-semibold">
                          {totalMarks}
                        </div>
                      </Field>
                    ) : (
                      <>
                        <Field label={t("টেস্ট", "Test")}>
                          <Input
                            type="number" min="0"
                            value={subject.testMark}
                            onChange={(e) => updateSubject(index, { testMark: Number(e.target.value || 0) })}
                            className="rounded-xl h-9 text-sm"
                          />
                        </Field>
                        <Field label={t("সেমিস্টার", "Semester")}>
                          <Input
                            type="number" min="0"
                            value={subject.semesterMark}
                            onChange={(e) => updateSubject(index, { semesterMark: Number(e.target.value || 0) })}
                            className="rounded-xl h-9 text-sm"
                          />
                        </Field>
                      </>
                    )}
                    <div className="flex items-end gap-1 pb-0.5">
                      <button
                        type="button"
                        onClick={() => moveSubject(index, "up")}
                        disabled={index === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSubject(index, "down")}
                        disabled={index === subjectList.length - 1}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <DeleteIconButton onClick={() => removeSubject(index)} />
                    </div>
                  </div>

                  {useMarkComponents && subject.markComponents && (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {markComponentFields.map((field) => (
                        <Field key={field.key} label={t(field.labelBn, field.labelEn)}>
                          <Input
                            type="number" min="0"
                            value={subject.markComponents![field.key]}
                            onChange={(e) => updateMarkComponent(index, field.key, Number(e.target.value || 0))}
                            className="rounded-xl h-8 text-xs"
                          />
                        </Field>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" className="h-8 rounded-xl px-3 text-xs font-bengali" onClick={resetForm}>
            {t("রিসেট", "Reset")}
          </Button>
        </div>
      </FormCard>

      {configs.length === 0 ? (
        <Card className={shellCardClass}>
          <CardContent className="p-6">
            <EmptyState text={t("এখনও কোনো ক্লাসের বিষয় সেট করা হয়নি", "No class subjects have been configured yet")} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {configs.map((config, index) => {
            const tones = [
              { shell: "border-slate-200/70 bg-white", accent: "bg-sky-500", ringColor: "#0ea5e9", chip: "bg-sky-50 text-sky-700 border-sky-100", dot: "bg-sky-400" },
              { shell: "border-slate-200/70 bg-white", accent: "bg-emerald-500", ringColor: "#10b981", chip: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400" },
              { shell: "border-slate-200/70 bg-white", accent: "bg-amber-500", ringColor: "#f59e0b", chip: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400" },
              { shell: "border-slate-200/70 bg-white", accent: "bg-rose-500", ringColor: "#f43f5e", chip: "bg-rose-50 text-rose-700 border-rose-100", dot: "bg-rose-400" },
            ][index % 4];

            const isLeader = config.subjects.length === maxSubjectCount && maxSubjectCount > 0;
            const ringPercent = maxSubjectCount > 0 ? Math.max((config.subjects.length / maxSubjectCount) * 100, 8) : 8;

            return (
              <div key={config.id} className={cn("rounded-2xl border shadow-sm transition-shadow duration-200 hover:shadow-md overflow-hidden", tones.shell)}>
                <div className={cn("h-0.5 w-full", tones.accent)} />
                <div className="relative">
                  <div className="px-4 pt-3 pb-3 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="flex-1 text-left min-w-0"
                        onClick={() => setExpandedCardId((current) => (current === config.id ? null : config.id))}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", tones.dot)} />
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                            {t("বিষয় ভিত্তিক", "By Subject")}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-semibold leading-tight text-slate-900 break-words">{config.className}</h3>
                          <Badge variant="outline" className={cn("rounded-full border text-[11px] px-2 py-0", tones.chip)}>
                            {config.subjects.length} {t("বিষয়", "subjects")}
                          </Badge>
                          {isLeader ? (
                            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-900 text-white text-[11px] px-2 py-0">
                              {t("সর্বোচ্চ", "Top")}
                            </Badge>
                          ) : null}
                          {config.academicYear ? (
                            <Badge variant="outline" className="rounded-full border text-[11px] px-2 py-0 text-muted-foreground">
                              {config.academicYear}
                            </Badge>
                          ) : null}
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `conic-gradient(${tones.ringColor} ${ringPercent}%, #f1f5f9 0)` }}>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-slate-700">
                            {config.subjects.length}
                          </div>
                        </div>
                        <Button
                          type="button" variant="ghost" size="sm"
                          className="h-8 w-8 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSelectedClass(config.id);
                            setClassName(config.className);
                            setClassNameEn(config.classNameEn || "");
                            setAcademicYear(config.academicYear || "");
                            setSession(config.session || "");
                            setSubjectList(config.subjects.length > 0 ? config.subjects : [createEmptySubject(0)]);
                            setExpandedCardId(config.id);
                          }}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Button>
                        <DeleteIconButton onClick={() => void onDelete(config.id)} />
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setExpandedCardId((current) => (current === config.id ? null : config.id))}
                        >
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expandedCardId === config.id && "rotate-180")} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedCardId === config.id ? (
                    <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-3 bg-slate-50/60">
                      {config.subjects.map((subject) => {
                        const total = subject.markComponents
                          ? calculateFullMarks(subject.markComponents)
                          : subject.testMark + subject.semesterMark;
                        return (
                          <div key={subject.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0">
                                <p className="font-bengali text-sm font-semibold text-slate-800 leading-tight truncate">{subject.name}</p>
                                {subject.nameEn ? <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subject.nameEn}</p> : null}
                              </div>
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{total}</span>
                            </div>
                            {subject.markComponents ? (
                              <div className="grid grid-cols-2 gap-1.5">
                                {markComponentFields.map((field) => (
                                  <div key={field.key} className="rounded-lg bg-slate-50 px-2 py-1 border border-slate-100">
                                    <p className="text-[10px] text-slate-400">{t(field.labelBn, field.labelEn)}</p>
                                    <p className="text-xs font-semibold text-slate-700">{subject.markComponents![field.key]}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <div className="flex-1 rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-100">
                                  <p className="font-bengali text-[10px] text-slate-400">{t("টেস্ট", "Test")}</p>
                                  <p className="font-bengali text-sm font-semibold text-slate-700">{subject.testMark}</p>
                                </div>
                                <div className="flex-1 rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-100">
                                  <p className="font-bengali text-[10px] text-slate-400">{t("সেমিস্টার", "Semester")}</p>
                                  <p className="font-bengali text-sm font-semibold text-slate-700">{subject.semesterMark}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModuleShell>
  );
};

export default ClassSubjectsManagerPage;
