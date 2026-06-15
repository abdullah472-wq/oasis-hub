import { useEffect, useMemo, useState } from "react";
import { ChevronDown, FileText, GraduationCap, GroupIcon, Plus, Printer, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { CLASS_NAME_OPTIONS, normalizeClassName } from "@/lib/attendanceHelpers";
import { getDownloadUrl } from "@/lib/upload";
import type { ClassSubjectConfig } from "@/lib/classSubjects";
import type { Result, ResultSubjectMark } from "@/lib/results";
import type { StudentRecord } from "@/lib/students";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BilingualInput,
  EmptyState,
  Field,
  FilePicker,
} from "@/components/admin/AdminPagePrimitives";
import { cn } from "@/lib/utils";

type ResultFormMode = "manual" | "class" | "pdf";
type ResultExamType = "test" | "semester";

interface ClassMarkDraft {
  testMark: string;
  semesterMark: string;
}

const buildClassOptions = () => [...CLASS_NAME_OPTIONS];

const clampMark = (value: string, max: number) => {
  const next = Math.max(0, Number(value || 0));
  return Math.min(next, max);
};

const calculateGradeFromPercentage = (percentage: number) => {
  if (percentage >= 80) return { gpa: 5, grade: "A+" };
  if (percentage >= 70) return { gpa: 4, grade: "A" };
  if (percentage >= 60) return { gpa: 3.5, grade: "A-" };
  if (percentage >= 50) return { gpa: 3, grade: "B" };
  if (percentage >= 40) return { gpa: 2, grade: "C" };
  if (percentage >= 33) return { gpa: 1, grade: "D" };
  return { gpa: 0, grade: "F" };
};

const calculateGradeFromSubjects = (subjects: ResultSubjectMark[], obtainedMarks: number, totalMarks: number) => {
  const hasFailedSubject = subjects.some((subject) => {
    const subjectPercentage = subject.totalMaxMark > 0 ? (subject.totalMark / subject.totalMaxMark) * 100 : 0;
    return subjectPercentage < 33;
  });

  if (hasFailedSubject) {
    return { gpa: 0, grade: "F" };
  }

  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  return calculateGradeFromPercentage(percentage);
};

const rankRows = <T extends { obtainedMarks: number; roll: number; studentName: string }>(items: T[]) => {
  const sorted = [...items].sort(
    (a, b) => b.obtainedMarks - a.obtainedMarks || a.roll - b.roll || a.studentName.localeCompare(b.studentName),
  );

  let lastMarks: number | null = null;
  let lastPosition = 0;

  return sorted.map((item, index) => {
    const position = lastMarks === item.obtainedMarks ? lastPosition : index + 1;
    lastMarks = item.obtainedMarks;
    lastPosition = position;
    return { ...item, position };
  });
};

const statsConfig = [
  { key: "personal", labelBn: "পার্সোনাল", labelEn: "Personal", color: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", textColor: "text-violet-700 dark:text-violet-300", icon: GraduationCap },
  { key: "group", labelBn: "গ্রুপ", labelEn: "Group", color: "from-sky-500 to-cyan-600", bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800", textColor: "text-sky-700 dark:text-sky-300", icon: GroupIcon },
];

export const ResultsManagerPage = ({
  items,
  students,
  classSubjectConfigs,
  onCreate,
  onCreateBatch,
  onDelete,
}: {
  items: Result[];
  students: StudentRecord[];
  classSubjectConfigs: ClassSubjectConfig[];
  onCreate: (payload: Omit<Result, "id" | "createdAt" | "pdfUrl">, file: File | null) => Promise<void>;
  onCreateBatch: (payloads: Array<Omit<Result, "id" | "createdAt" | "pdfUrl">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "personal" | "group">("all");
  const [cardResult, setCardResult] = useState<Result | null>(null);
  const [step, setStep] = useState(1);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [showPersonalPopup, setShowPersonalPopup] = useState(false);
  const [personalSearch, setPersonalSearch] = useState("");
  const [personalExam, setPersonalExam] = useState("");
  const [form, setForm] = useState({
    exam: "",
    examEn: "",
    examType: "test" as ResultExamType,
    className: "",
    classNameEn: "",
    campus: "both" as Result["campus"],
    entryType: "class" as ResultFormMode,
    studentId: "",
    studentName: "",
    section: "",
    position: "",
    totalMarks: "",
    obtainedMarks: "",
    gpa: "",
    grade: "",
    remarksBn: "",
    remarksEn: "",
    examStartDate: "",
    examEndDate: "",
  });
  const [classMarks, setClassMarks] = useState<Record<string, Record<string, ClassMarkDraft>>>({});

  const examNameOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        items
          .flatMap((item) => [item.exam, item.examEn])
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      ),
    );
    return names.sort((a, b) => a.localeCompare(b));
  }, [items]);

  const classOptions = useMemo(() => buildClassOptions(), []);
  const selectedConfig = useMemo(
    () => classSubjectConfigs.find((item) => normalizeClassName(item.className) === normalizeClassName(form.className)) || null,
    [classSubjectConfigs, form.className],
  );
  const classStudents = useMemo(
    () =>
      students
        .filter((student) => normalizeClassName(student.className) === normalizeClassName(form.className))
        .sort((a, b) => a.roll - b.roll || a.studentName.localeCompare(b.studentName)),
    [form.className, students],
  );

  useEffect(() => {
    if (form.entryType !== "class" || !selectedConfig) return;

    setClassMarks((current) => {
      const next = { ...current };

      classStudents.forEach((student) => {
        const studentMarks = next[student.studentId] || {};
        selectedConfig.subjects.forEach((subject) => {
          studentMarks[subject.id] = studentMarks[subject.id] || { testMark: "", semesterMark: "" };
        });
        next[student.studentId] = studentMarks;
      });

      return next;
    });
  }, [classStudents, form.entryType, selectedConfig]);

  const classResultsPreview = useMemo(() => {
    if (form.entryType !== "class" || !selectedConfig) return [];

    const rows = classStudents.map((student) => {
      const subjects: ResultSubjectMark[] = selectedConfig.subjects.map((subject, index) => {
        const draft = classMarks[student.studentId]?.[subject.id] || { testMark: "", semesterMark: "" };
        const testMark = form.examType === "semester" ? 0 : clampMark(draft.testMark, subject.testMark);
        const semesterMark = form.examType === "test" ? 0 : clampMark(draft.semesterMark, subject.semesterMark);
        const testMaxMark = form.examType === "semester" ? 0 : subject.testMark;
        const semesterMaxMark = form.examType === "test" ? 0 : subject.semesterMark;

        return {
          id: subject.id || `subject-${index + 1}`,
          name: subject.name,
          nameEn: subject.nameEn,
          testMark,
          semesterMark,
          totalMark: testMark + semesterMark,
          testMaxMark,
          semesterMaxMark,
          totalMaxMark: testMaxMark + semesterMaxMark,
        };
      });

      const obtainedMarks = subjects.reduce((sum, subject) => sum + subject.totalMark, 0);
      const totalMarks = subjects.reduce((sum, subject) => sum + subject.totalMaxMark, 0);
      const { gpa, grade } = calculateGradeFromSubjects(subjects, obtainedMarks, totalMarks);

      return {
        student,
        subjects,
        obtainedMarks,
        totalMarks,
        gpa,
        grade,
      };
    });

    return rankRows(
      rows.map((row) => ({
        ...row,
        roll: row.student.roll || 0,
        studentName: row.student.studentName,
      })),
    );
  }, [classMarks, classStudents, form.entryType, form.examType, selectedConfig]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.entryType === "pdf" && !pdf) return;

    setSaving(true);
    try {
      if (form.entryType === "class") {
        if (!selectedConfig) {
          toast.error(t("এই ক্লাসের জন্য আগে বিষয় সেট করুন", "Set subjects for this class first"));
          return;
        }

        if (classStudents.length === 0) {
          toast.error(t("এই ক্লাসে কোনো শিক্ষার্থী পাওয়া যায়নি", "No students found in this class"));
          return;
        }

        await onCreateBatch(
          classResultsPreview.map((row) => ({
            exam: form.exam.trim(),
            examEn: form.examEn.trim() || form.exam.trim(),
            examType: form.examType,
            className: form.className.trim(),
            classNameEn: form.classNameEn.trim() || form.className.trim(),
            campus: form.campus,
            resultType: "personal",
            entryType: "class",
            studentId: row.student.studentId,
            studentName: row.student.studentName,
            section: row.student.section,
            roll: row.student.roll,
            position: row.position,
            totalMarks: row.totalMarks,
            obtainedMarks: row.obtainedMarks,
            gpa: row.gpa,
            grade: row.grade,
            remarksBn: "",
            remarksEn: "",
            subjects: row.subjects,
          })),
        );
      } else {
        await onCreate(
          {
            exam: form.exam.trim(),
            examEn: form.examEn.trim() || form.exam.trim(),
            examType: form.examType,
            className: form.className.trim(),
            classNameEn: form.classNameEn.trim() || form.className.trim(),
            campus: form.campus,
            resultType: form.entryType === "pdf" ? "group" : "personal",
            entryType: form.entryType,
            studentId: form.studentId.trim(),
            studentName: form.studentName.trim(),
            section: form.section.trim(),
            position: Number(form.position || 0),
            totalMarks: Number(form.totalMarks || 0),
            obtainedMarks: Number(form.obtainedMarks || 0),
            gpa: Number(form.gpa || 0),
            grade: form.grade.trim(),
            remarksBn: form.remarksBn.trim(),
            remarksEn: form.remarksEn.trim(),
          },
          form.entryType === "pdf" ? pdf : null,
        );
      }

      setForm({
        exam: "",
        examEn: "",
        examType: "test",
        className: "",
        classNameEn: "",
        campus: "both",
        entryType: "class",
        studentId: "",
        studentName: "",
        section: "",
        position: "",
        totalMarks: "",
        obtainedMarks: "",
        gpa: "",
        grade: "",
        remarksBn: "",
        remarksEn: "",
      });
      setClassMarks({});
      setPdf(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const personalResults = items.filter((item) => (item.resultType ?? (item.pdfUrl ? "group" : "personal")) === "personal");
  const pdfResults = items.filter((item) => (item.resultType ?? (item.pdfUrl ? "group" : "personal")) === "group");

  const statValues = {
    personal: personalResults.length,
    group: pdfResults.length,
  };

  const tabs = [
    { key: "all" as const, labelBn: "সব রেজাল্ট", labelEn: "All Results", count: items.length },
    { key: "personal" as const, labelBn: "পার্সোনাল", labelEn: "Personal", count: personalResults.length },
    { key: "group" as const, labelBn: "গ্রুপ", labelEn: "Group", count: pdfResults.length },
  ];

  const getCampusLabel = (campus: Result["campus"]) => {
    if (campus === "boys") return t("বালক", "Boys");
    if (campus === "girls") return t("বালিকা", "Girls");
    return t("উভয়", "Both");
  };

  const visibleResults = activeTab === "all" ? items : activeTab === "personal" ? personalResults : pdfResults;

  const groupedByYear = useMemo(() => {
    return visibleResults.reduce<Record<string, Result[]>>((acc, item) => {
      const year = item.createdAt ? new Date(item.createdAt).getFullYear().toString() : t("অন্যান্য", "Other");
      if (!acc[year]) acc[year] = [];
      acc[year].push(item);
      return acc;
    }, {});
  }, [visibleResults, t]);

  const yearKeys = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  const personalExamOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.exam).filter(Boolean))).sort();
  }, [items]);
  const personalFilteredStudents = useMemo(() => {
    if (!personalExam) return [];
    const examResults = items.filter(
      (item) => item.exam === personalExam && (item.resultType ?? (item.pdfUrl ? "group" : "personal")) === "personal" && (item.studentId || item.studentName),
    );
    const unique = new Map<string, Result>();
    examResults.forEach((item) => {
      const key = item.studentId || item.studentName;
      if (key && !unique.has(key)) unique.set(key, item);
    });
    const list = Array.from(unique.values());
    if (!personalSearch.trim()) return list;
    const q = personalSearch.toLowerCase();
    return list.filter(
      (item) =>
        item.studentName?.toLowerCase().includes(q) ||
        item.studentId?.toLowerCase().includes(q) ||
        item.roll?.toString().includes(q),
    );
  }, [items, personalExam, personalSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bengali text-2xl font-semibold text-foreground">
              {t("রেজাল্ট ম্যানেজমেন্ট", "Results Management")}
            </h2>
            <p className="font-bengali text-sm text-muted-foreground">
              {t("একক, ক্লাসভিত্তিক ও পিডিএফ রেজাল্ট এখান থেকে যোগ এবং প্রকাশ করুন", "Add and publish single, class-wise, and PDF results from here")}
            </p>
          </div>
        </div>
        <Button
          className="rounded-2xl font-bengali shadow-sm"
          onClick={() => setShowForm((current) => !current)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? t("ফর্ম বন্ধ করুন", "Close form") : t("নতুন রেজাল্ট", "New Result")}
        </Button>
        <Button
          variant="outline"
          className="rounded-2xl font-bengali shadow-sm"
          onClick={() => setShowPersonalPopup(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          {t("পার্সোনাল রেজাল্ট", "Personal Result")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bengali text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t(stat.labelBn, stat.labelEn)}
                  </p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {statValues[stat.key as keyof typeof statValues]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form */}
      {showForm ? (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-6 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-2 ${step === 1 ? "text-primary" : "text-emerald-600"}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? "bg-primary/10 text-primary" : "bg-emerald-100 text-emerald-700"}`}>
                {step === 2 ? "✓" : "1"}
              </div>
              <span className="font-bengali text-sm font-semibold">{t("পরীক্ষা তৈরি", "Create Exam")}</span>
            </div>
            <div className="h-px flex-1 bg-border/60" />
            <div className={`flex items-center gap-2 ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>2</div>
              <span className="font-bengali text-sm font-semibold">{t("রেজাল্ট যোগ", "Add Results")}</span>
            </div>
          </div>

          {step === 1 ? (
            /* ── Step 1: Create Exam ── */
            <div className="space-y-4">
              <h3 className="font-bengali text-lg font-semibold text-foreground">
                {t("পরীক্ষার তথ্য দিন", "Enter exam details")}
              </h3>
              <BilingualInput
                labelBn="পরীক্ষার নাম"
                labelEn="Exam name"
                valueBn={form.exam}
                valueEn={form.examEn}
                onBnChange={(value) => setForm((current) => ({ ...current, exam: value }))}
                onEnChange={(value) => setForm((current) => ({ ...current, examEn: value }))}
              />
              <Field label={t("পরীক্ষার ধরন", "Exam type")}>
                <select
                  value={form.examType}
                  onChange={(event) => setForm((current) => ({ ...current, examType: event.target.value as ResultExamType }))}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                >
                  <option value="test">{t("টেস্ট পরীক্ষা", "Test exam")}</option>
                  <option value="semester">{t("সেমিস্টার পরীক্ষা", "Semester exam")}</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("পরীক্ষা শুরুর তারিখ", "Exam start date")}>
                  <Input
                    type="date"
                    value={form.examStartDate}
                    onChange={(event) => setForm((current) => ({ ...current, examStartDate: event.target.value }))}
                    className="h-11 rounded-2xl"
                  />
                </Field>
                <Field label={t("পরীক্ষা শেষের তারিখ", "Exam end date")}>
                  <Input
                    type="date"
                    value={form.examEndDate}
                    onChange={(event) => setForm((current) => ({ ...current, examEndDate: event.target.value }))}
                    className="h-11 rounded-2xl"
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setShowForm(false)}>
                  {t("বাতিল", "Cancel")}
                </Button>
                <Button
                  type="button"
                  className="rounded-2xl font-bengali"
                  onClick={() => {
                    if (!form.exam.trim()) {
                      toast.error(t("পরীক্ষার নাম লিখুন", "Enter exam name"));
                      return;
                    }
                    setStep(2);
                  }}
                >
                  {t("সেভ ও পরবর্তী", "Save & Next")}
                </Button>
              </div>
            </div>
          ) : (
            /* ── Step 2: Add Results ── */
            <form onSubmit={submit} className="space-y-4">
              {/* Exam info (readonly summary) */}
              <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bengali text-xs text-muted-foreground">{t("পরীক্ষা", "Exam")}</p>
                  <p className="font-bengali text-sm font-semibold text-foreground">
                    {form.exam}
                    {form.examEn && form.examEn !== form.exam ? ` (${form.examEn})` : ""}
                  </p>
                  {form.examStartDate || form.examEndDate ? (
                    <p className="font-bengali text-xs text-muted-foreground mt-1">
                      {form.examStartDate ? new Date(form.examStartDate).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      {form.examStartDate && form.examEndDate ? " → " : ""}
                      {form.examEndDate ? new Date(form.examEndDate).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    {form.examType === "test" ? t("টেস্ট", "Test") : t("সেমিস্টার", "Semester")}
                  </span>
                  <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg text-xs font-bengali" onClick={() => setStep(1)}>
                    {t("পরিবর্তন", "Change")}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label={t("ক্লাস", "Class")}>
                  <select
                    value={form.className}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        className: event.target.value,
                        classNameEn: current.classNameEn || event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                  >
                    <option value="">{t("একটি ক্লাস নির্বাচন করুন", "Select a class")}</option>
                    {classOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("ক্যাম্পাস", "Campus")}>
                  <select
                    value={form.campus}
                    onChange={(event) => setForm((current) => ({ ...current, campus: event.target.value as Result["campus"] }))}
                    className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                  >
                    <option value="both">{t("উভয়", "Both")}</option>
                    <option value="boys">{t("বালক", "Boys")}</option>
                    <option value="girls">{t("বালিকা", "Girls")}</option>
                  </select>
                </Field>
                <Field label={t("রেজাল্টের ধরন", "Result type")}>
                  <select
                    value={form.entryType}
                    onChange={(event) => setForm((current) => ({ ...current, entryType: event.target.value as ResultFormMode }))}
                    className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                  >
                    <option value="class">{t("ক্লাসভিত্তিক রেজাল্ট", "Class-wise result")}</option>
                    <option value="pdf">{t("গ্রুপ রেজাল্ট PDF", "Group result PDF")}</option>
                  </select>
                </Field>
              </div>

              {form.entryType === "class" ? (
                selectedConfig ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-secondary/20 px-4 py-3 font-bengali text-sm text-muted-foreground">
                      {form.examType === "test"
                        ? `${t("প্রতি বিষয়ে টেস্ট", "Per subject test")} ${selectedConfig.subjects[0]?.testMark ?? 25}`
                        : `${t("প্রতি বিষয়ে সেমিস্টার", "Per subject semester")} ${selectedConfig.subjects[0]?.semesterMark ?? 75}`}
                      <div className="mt-1 text-xs">
                        {t("প্রতি বিষয়ে কমপক্ষে ৩৩% না পেলে চূড়ান্ত গ্রেড F এবং GPA 0 হবে", "A student must score at least 33% in each subject or the final grade becomes F with GPA 0")}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {classResultsPreview.map((row) => (
                        <div
                          key={row.student.studentId}
                          className="rounded-xl border border-border/60 bg-background p-4 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                                {row.student.roll || "-"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bengali text-sm font-semibold text-foreground truncate">{row.student.studentName}</p>
                                <p className="font-bengali text-xs text-muted-foreground">
                                  {row.student.section ? `• ${row.student.section}` : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">#{row.position}</span>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{row.grade}</span>
                            </div>
                          </div>
                          <div className="space-y-2 mb-3">
                            {selectedConfig.subjects.map((subject) => {
                              const draft = classMarks[row.student.studentId]?.[subject.id] || { testMark: "", semesterMark: "" };
                              return (
                                <div key={subject.id} className="flex items-center gap-2">
                                  <span className="font-bengali text-xs text-muted-foreground w-20 shrink-0 truncate">{subject.name}</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={form.examType === "test" ? subject.testMark : subject.semesterMark}
                                    value={form.examType === "test" ? draft.testMark : draft.semesterMark}
                                    onChange={(event) =>
                                      setClassMarks((current) => ({
                                        ...current,
                                        [row.student.studentId]: {
                                          ...(current[row.student.studentId] || {}),
                                          [subject.id]: {
                                            ...(current[row.student.studentId]?.[subject.id] || { testMark: "", semesterMark: "" }),
                                            ...(form.examType === "test"
                                              ? { testMark: event.target.value }
                                              : { semesterMark: event.target.value }),
                                          },
                                        },
                                      }))
                                    }
                                    className="h-8 rounded-lg text-xs flex-1"
                                    placeholder={form.examType === "test" ? t("টেস্ট", "Test") : t("সেমিস্টার", "Semester")}
                                  />
                                  <span className="font-bengali text-[11px] text-muted-foreground w-8 text-right">
                                    /{form.examType === "test" ? subject.testMark : subject.semesterMark}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 border border-border/40">
                            <span className="font-bengali text-xs text-muted-foreground">
                              {t("মোট", "Total")}: <strong className="text-foreground">{row.obtainedMarks}</strong>/{row.totalMarks}
                            </span>
                            <span className="font-bengali text-xs text-muted-foreground">
                              GPA: <strong className="text-foreground">{row.gpa.toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    text={t("এই ক্লাসের জন্য আগে বিষয় সেটআপ করতে হবে", "You need to configure subjects for this class first")}
                    description={t("ক্লাস ও বিষয় মেনু থেকে বিষয়, টেস্ট ২৫ এবং সেমিস্টার ৭৫ সেট করুন", "Set subjects, test 25, and semester 75 from the Class Subjects menu")}
                  />
                )
              ) : null}

              {form.entryType === "pdf" ? (
                <FilePicker label={t("রেজাল্ট পিডিএফ", "Result PDF")} file={pdf} onFileChange={setPdf} accept="application/pdf" />
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setShowForm(false)}>
                  {t("বাতিল", "Cancel")}
                </Button>
                <Button type="submit" className="rounded-2xl font-bengali" disabled={saving}>
                  {saving ? t("সেভ হচ্ছে...", "Saving...") : t("রেজাল্ট সংরক্ষণ করুন", "Save result")}
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      {/* Tabs + Results list */}
      <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border/60 bg-muted/20">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 font-bengali text-sm font-medium transition-colors relative",
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(tab.labelBn, tab.labelEn)}
              <span className={cn(
                "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}>
                {tab.count}
              </span>
              {activeTab === tab.key ? (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
              ) : null}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="p-5">
          {visibleResults.length === 0 ? (
            <EmptyState text={t("এই বিভাগে কোনো রেজাল্ট পাওয়া যায়নি", "No results found in this section")} />
          ) : (
            <div className="space-y-6">
              {yearKeys.map((year) => {
                const isExpanded = expandedYears[year] !== false;
                return (
                  <div key={year}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedYears((current) => ({ ...current, [year]: !isExpanded }))
                      }
                      className="flex items-center gap-2 w-full text-left mb-3 px-1 group"
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isExpanded ? "rotate-0" : "-rotate-90",
                        )}
                      />
                      <h3 className="font-bengali text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                        {year}
                      </h3>
                      <span className="text-xs text-muted-foreground/60">
                        ({groupedByYear[year].length})
                      </span>
                    </button>
                    {isExpanded ? (
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {groupedByYear[year].map((item) => {
                      const isPersonal = (item.resultType ?? (item.pdfUrl ? "group" : "personal")) === "personal";
                      return (
                        <div
                          key={item.id}
                          className="group relative rounded-xl border border-border/60 bg-background p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                isPersonal ? "bg-violet-400" : "bg-sky-400",
                              )} />
                              <span className="font-bengali text-xs font-medium text-muted-foreground">
                                {isPersonal ? t("পার্সোনাল", "Personal") : t("গ্রুপ", "Group")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => item.id && void onDelete(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <h4 className="font-bengali text-base font-semibold text-foreground mb-1">
                            {item.exam}
                          </h4>

                          <div className="space-y-1">
                            <p className="font-bengali text-sm text-foreground">
                              {item.studentName || item.className}
                              {item.studentId ? <span className="text-muted-foreground"> • {item.studentId}</span> : null}
                            </p>

                            {isPersonal && (
                              <p className="font-bengali text-xs text-muted-foreground">
                                {t("প্রাপ্ত", "Obtained")}: {Number(item.obtainedMarks || 0)} / {Number(item.totalMarks || 0)}
                                {" • "}GPA: {Number(item.gpa || 0)} • {t("গ্রেড", "Grade")}: {item.grade || "-"}
                                {item.position ? <span> • {t("পজিশন", "Position")}: {item.position}</span> : null}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {getCampusLabel(item.campus)}
                              </span>
                              {item.examType ? (
                                <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {item.examType === "test" ? t("টেস্ট", "Test") : t("সেমিস্টার", "Semester")}
                                </span>
                              ) : null}
                              {item.entryType === "class" ? (
                                <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {t("ক্লাসভিত্তিক", "Class-wise")}
                                </span>
                              ) : null}
                            </div>

                            {item.subjects?.length ? (
                              <p className="font-bengali text-xs text-muted-foreground pt-1 border-t border-border/40 mt-2">
                                <span className="font-medium">{t("বিষয়", "Subjects")}:</span>{" "}
                                {item.subjects.map((subject) => `${subject.name} (${subject.totalMark})`).join(", ")}
                              </p>
                            ) : null}

                            {isPersonal && (item.remarksBn || item.remarksEn) ? (
                              <p className="font-bengali text-xs text-muted-foreground italic pt-1">
                                "{item.remarksBn || item.remarksEn}"
                              </p>
                            ) : null}

                            {isPersonal ? (
                              <div className="pt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-xl font-bengali text-xs gap-1.5"
                                  onClick={() => setCardResult(item)}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  {t("রেজাল্ট কার্ড", "Result Card")}
                                </Button>
                              </div>
                            ) : null}

                            {!isPersonal && item.pdfUrl ? (
                              <div className="pt-2">
                                <a
                                  href={getDownloadUrl(item.pdfUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 font-bengali text-sm text-primary hover:underline"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  {t("পিডিএফ ডাউনলোড", "Download PDF")}
                                </a>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Result Card Dialog */}
      <Dialog open={!!cardResult} onOpenChange={(open) => { if (!open) setCardResult(null); }}>
        <DialogContent className="max-w-3xl rounded-3xl max-h-[90vh] overflow-y-auto p-0 print:shadow-none print:border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{t("রেজাল্ট কার্ড", "Result Card")}</DialogTitle>
          </DialogHeader>
          {cardResult ? (
            <div className="bg-white text-gray-900 p-8 print:p-4 font-sans">
              {/* ── Header ── */}
              <div className="text-center border-b-2 border-[#1e40af] pb-5 mb-5">
                <div className="flex items-center justify-center gap-5 mb-3">
                  <div className="h-16 w-16 rounded-full bg-[#1e40af] flex items-center justify-center text-white text-xs font-bold leading-tight text-center shrink-0">
                    A<br/>E<br/>F
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-wide text-gray-900">ANNOOR EDUCATION FAMILY</h1>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Kapasia, Gazipur | Mobile: 01303636359, 01820811511, 01581818368 | Bangladesh
                    </p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-[#1e40af] tracking-widest mt-2">RESULT CARD</h2>
              </div>

              {/* ── Student Profile ── */}
              <div className="flex gap-6 mb-5">
                {/* Photo */}
                <div className="h-24 w-24 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-semibold shrink-0">
                  {cardResult.studentName?.charAt(0) || "S"}
                </div>
                {/* Fields grid */}
                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    { label: "School Registration", value: cardResult.studentId || "-" },
                    { label: "Student Name", value: cardResult.studentName || "-" },
                    { label: "Father Name", value: "-" },
                    { label: "Class", value: `${cardResult.className}${cardResult.section ? ` - ${cardResult.section}` : ""}` },
                    { label: "Date Of Admission", value: "-" },
                    { label: "Date Of Birth", value: "-" },
                    { label: "Gender", value: "-" },
                    { label: "NIC", value: "-" },
                  ].map((field) => (
                    <div key={field.label} className="border-b border-gray-300 pb-1">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{field.label}</span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Subject Marks Table ── */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  SUBJECT-WISE STATEMENT OF MARKS - {cardResult.examEn || cardResult.exam}
                  {cardResult.examType ? ` (${cardResult.examType === "test" ? "Test" : "Semester"})` : ""}
                </p>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-y-2 border-[#1e40af]">
                      <th className="py-2 px-2 text-left text-xs font-bold text-gray-700 w-10">Sr.No.</th>
                      <th className="py-2 px-2 text-left text-xs font-bold text-gray-700">SUBJECTS</th>
                      <th className="py-2 px-2 text-center text-xs font-bold text-gray-700 w-24">
                        MARKS<br/>
                        <span className="font-normal">Maximum | Obtain</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardResult.subjects?.map((subject, idx) => (
                      <tr key={subject.id} className="border-b border-gray-200">
                        <td className="py-2 px-2 text-xs text-gray-600">{idx + 1}</td>
                        <td className="py-2 px-2 text-sm font-medium text-gray-900">{subject.name}</td>
                        <td className="py-2 px-2 text-center text-sm text-gray-900">
                          {subject.totalMaxMark} | {subject.totalMark}
                        </td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="border-t-2 border-[#1e40af] font-bold">
                      <td className="py-2 px-2 text-xs text-gray-700"></td>
                      <td className="py-2 px-2 text-sm text-gray-900">TOTAL</td>
                      <td className="py-2 px-2 text-center text-sm text-gray-900">
                        {cardResult.totalMarks || 0} | {cardResult.obtainedMarks || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── Summary ── */}
              <div className="mb-5">
                <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                  He/She Scored <strong>{cardResult.obtainedMarks || 0}</strong> out of <strong>{cardResult.totalMarks || 0}</strong> with the percentage of <strong>{cardResult.totalMarks ? ((Number(cardResult.obtainedMarks || 0) / Number(cardResult.totalMarks)) * 100).toFixed(2) : 0}%</strong> and got the Grade <strong>{cardResult.grade || "-"}</strong>.
                  His/Her Overall status is <strong className={cardResult.grade === "F" ? "text-red-600" : "text-green-600"}>{cardResult.grade === "F" ? "FAIL" : "PASS"}</strong>.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Marks", value: String(cardResult.totalMarks || 0), bg: "bg-gray-50" },
                    { label: "Obtained Marks", value: String(cardResult.obtainedMarks || 0), bg: "bg-gray-50" },
                    { label: "Percentage", value: `${cardResult.totalMarks ? ((Number(cardResult.obtainedMarks || 0) / Number(cardResult.totalMarks)) * 100).toFixed(0) : 0} %`, bg: "bg-[#1e40af]/5" },
                  ].map((box) => (
                    <div key={box.label} className={`${box.bg} border border-gray-200 rounded-lg p-4 text-center`}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{box.label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{box.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="border-t-2 border-[#1e40af] pt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Prepared By :</span>
                    <span className="text-sm font-medium text-gray-900">ANNOOR EDUCATION FAMILY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Checked By :</span>
                    <span className="inline-block w-40 border-b border-gray-400">&nbsp;</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-600">Controller Of Examination</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">ANNOOR EDUCATION FAMILY</p>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 print:hidden">
                <Button
                  variant="outline"
                  className="rounded-xl font-bengali text-sm"
                  onClick={() => window.print()}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {t("প্রিন্ট", "Print")}
                </Button>
                <Button
                  className="rounded-xl font-bengali text-sm"
                  onClick={() => setCardResult(null)}
                >
                  {t("বন্ধ করুন", "Close")}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Personal Result Popup */}
      <Dialog open={showPersonalPopup} onOpenChange={(open) => { if (!open) { setShowPersonalPopup(false); setPersonalSearch(""); setPersonalExam(""); } }}>
        <DialogContent className="max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">{t("পার্সোনাল রেজাল্ট", "Personal Result")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Exam select */}
            <Field label={t("পরীক্ষা নির্বাচন", "Select Exam")}>
              <select
                value={personalExam}
                onChange={(event) => { setPersonalExam(event.target.value); setPersonalSearch(""); }}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("একটি পরীক্ষা নির্বাচন করুন", "Select an exam")}</option>
                {personalExamOptions.map((exam) => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </Field>

            {/* Student search */}
            {personalExam ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={personalSearch}
                  onChange={(event) => setPersonalSearch(event.target.value)}
                  placeholder={t("নাম বা আইডি দিয়ে সার্চ করুন", "Search by name or ID...")}
                  className="h-11 rounded-2xl pl-10"
                />
              </div>
            ) : null}

            {/* Students list */}
            {personalExam && personalFilteredStudents.length === 0 ? (
              <EmptyState text={t("কোনো শিক্ষার্থী পাওয়া যায়নি", "No students found")} />
            ) : null}

            {personalFilteredStudents.length > 0 ? (
              <div className="space-y-2">
                {personalFilteredStudents.map((student) => (
                  <div
                    key={student.studentId || student.studentName}
                    className="rounded-xl border border-border/60 bg-background p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {student.roll || "?"}
                        </div>
                        <div>
                          <p className="font-bengali text-sm font-semibold text-foreground">{student.studentName}</p>
                          <p className="text-xs text-muted-foreground">{student.studentId}{student.section ? ` • ${student.section}` : ""}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl font-bengali text-xs gap-1.5"
                        onClick={() => { setCardResult(student); setShowPersonalPopup(false); }}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {t("রেজাল্ট কার্ড", "Result Card")}
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{t("প্রাপ্ত", "Obtained")}: {student.obtainedMarks}/{student.totalMarks}</span>
                      <span>GPA: {student.gpa}</span>
                      <span>{t("গ্রেড", "Grade")}: {student.grade}</span>
                      {student.position ? <span>#{student.position}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResultsManagerPage;
