import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileUp, PenLine, Plus, Table2, Trash2, Upload, Users } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BilingualInput, EmptyState, Field } from "@/components/admin/AdminPagePrimitives";
import { CLASS_NAME_OPTIONS } from "@/lib/attendanceHelpers";
import type { ClassSubjectConfig, ClassSubjectItem } from "@/lib/classSubjects";
import type { Result, ResultSubjectMark } from "@/lib/results";
import type { StudentRecord } from "@/lib/students";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type EntryMode = "single" | "bulk" | "upload";

const calculateGradeFromPercentage = (percentage: number) => {
  if (percentage >= 80) return { gpa: 5, grade: "A+" };
  if (percentage >= 70) return { gpa: 4, grade: "A" };
  if (percentage >= 60) return { gpa: 3.5, grade: "A-" };
  if (percentage >= 50) return { gpa: 3, grade: "B" };
  if (percentage >= 40) return { gpa: 2, grade: "C" };
  if (percentage >= 33) return { gpa: 1, grade: "D" };
  return { gpa: 0, grade: "F" };
};

const calcStudentResult = (subjects: ResultSubjectMark[], configSubjects: ClassSubjectItem[], examType: "test" | "semester") => {
  const totalMarks = configSubjects.reduce((sum, s) => sum + (examType === "test" ? s.testMark : s.semesterMark), 0);
  const obtainedMarks = subjects.reduce((sum, s) => sum + s.totalMark, 0);
  const hasFailedSubject = subjects.some((s) => {
    const max = s.totalMaxMark || 1;
    return (s.totalMark / max) * 100 < 33;
  });
  const result = hasFailedSubject ? { gpa: 0, grade: "F" } : calculateGradeFromPercentage(totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0);
  return { totalMarks, obtainedMarks, ...result };
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

const modes: { key: EntryMode; labelBn: string; labelEn: string; icon: typeof PenLine }[] = [
  { key: "single", labelBn: "একক এন্ট্রি", labelEn: "Single Entry", icon: PenLine },
  { key: "bulk", labelBn: "বাল্ক এন্ট্রি", labelEn: "Bulk Entry", icon: Users },
  { key: "upload", labelBn: "এক্সেল আপলোড", labelEn: "Excel Upload", icon: FileSpreadsheet },
];

interface MarksEntryPageProps {
  items: Result[];
  students: StudentRecord[];
  classSubjectConfigs: ClassSubjectConfig[];
  onCreate: (payload: Omit<Result, "id" | "createdAt" | "pdfUrl">, file: File | null) => Promise<void>;
  onCreateBatch: (payloads: Array<Omit<Result, "id" | "createdAt" | "pdfUrl">>) => Promise<void>;
}

interface MarksDraft {
  [subjectId: string]: string;
}

const MarksEntryPage = ({ items, students, classSubjectConfigs, onCreate, onCreateBatch }: MarksEntryPageProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<EntryMode>("single");
  const [exam, setExam] = useState("");
  const [examEn, setExamEn] = useState("");
  const [examType, setExamType] = useState<"test" | "semester">("test");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [marksDraft, setMarksDraft] = useState<MarksDraft>({});
  const [bulkMarks, setBulkMarks] = useState<Record<string, MarksDraft>>({});
  const [uploadData, setUploadData] = useState<Array<Record<string, string>>>([]);
  const [uploadFileName, setUploadFileName] = useState("");

  const examOptions = useMemo(() => Array.from(new Set(items.map((i) => i.exam).filter(Boolean))).sort(), [items]);
  const classOptions = CLASS_NAME_OPTIONS;

  const config = useMemo(
    () => classSubjectConfigs.find((c) => c.className.trim().toLowerCase() === selectedClass.trim().toLowerCase()) || null,
    [classSubjectConfigs, selectedClass],
  );

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.className.trim().toLowerCase() === selectedClass.trim().toLowerCase())
        .sort((a, b) => a.roll - b.roll),
    [students, selectedClass],
  );

  const selectedStudent = classStudents.find((s) => s.studentId === selectedStudentId);

  const computedSingle = useMemo(() => {
    if (!config || !selectedStudent) return null;
    const subjects: ResultSubjectMark[] = config.subjects.map((subj) => {
      const val = Math.max(0, Number(marksDraft[subj.id] || 0));
      const max = examType === "test" ? subj.testMark : subj.semesterMark;
      return {
        id: subj.id,
        name: subj.name,
        nameEn: subj.nameEn,
        testMark: examType === "test" ? val : 0,
        semesterMark: examType === "semester" ? val : 0,
        totalMark: val,
        testMaxMark: subj.testMark,
        semesterMaxMark: subj.semesterMark,
        totalMaxMark: max,
      };
    });
    const result = calcStudentResult(subjects, config.subjects, examType);
    return { subjects, ...result };
  }, [config, selectedStudent, marksDraft, examType]);

  const computedBulk = useMemo(() => {
    if (!config) return [];
    return rankRows(
      classStudents.map((student) => {
        const draft = bulkMarks[student.studentId] || {};
        const subjects: ResultSubjectMark[] = config.subjects.map((subj) => {
          const val = Math.max(0, Number(draft[subj.id] || 0));
          const max = examType === "test" ? subj.testMark : subj.semesterMark;
          return {
            id: subj.id,
            name: subj.name,
            nameEn: subj.nameEn,
            testMark: examType === "test" ? val : 0,
            semesterMark: examType === "semester" ? val : 0,
            totalMark: val,
            testMaxMark: subj.testMark,
            semesterMaxMark: subj.semesterMark,
            totalMaxMark: max,
          };
        });
        const { totalMarks, obtainedMarks, gpa, grade } = calcStudentResult(subjects, config.subjects, examType);
        return { student, subjects, totalMarks, obtainedMarks, gpa, grade, roll: student.roll, studentName: student.studentName };
      }),
    );
  }, [config, classStudents, bulkMarks, examType]);

  const handleFileUpload = (file: File) => {
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
      setUploadData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveSingle = async () => {
    if (!computedSingle || !exam.trim() || !selectedStudent) return;
    setSaving(true);
    try {
      await onCreate(
        {
          exam: exam.trim(),
          examEn: examEn.trim() || exam.trim(),
          examType,
          className: selectedClass.trim(),
          classNameEn: selectedClass.trim(),
          campus: "both",
          resultType: "personal",
          entryType: "manual",
          studentId: selectedStudent.studentId,
          studentName: selectedStudent.studentName,
          section: selectedStudent.section,
          roll: selectedStudent.roll,
          position: 0,
          totalMarks: computedSingle.totalMarks,
          obtainedMarks: computedSingle.obtainedMarks,
          gpa: computedSingle.gpa,
          grade: computedSingle.grade,
          remarksBn: "",
          remarksEn: "",
          subjects: computedSingle.subjects,
        },
        null,
      );
      setMarksDraft({});
      setSelectedStudentId("");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBulk = async () => {
    if (!exam.trim() || !config || computedBulk.length === 0) return;
    setSaving(true);
    try {
      const payloads = computedBulk
        .filter((row) => row.subjects.some((s) => s.totalMark > 0))
        .map((row) => ({
          exam: exam.trim(),
          examEn: examEn.trim() || exam.trim(),
          examType,
          className: selectedClass.trim(),
          classNameEn: selectedClass.trim(),
          campus: "both" as const,
          resultType: "personal" as const,
          entryType: "class" as const,
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
        }));
      if (payloads.length === 0) return;
      await onCreateBatch(payloads);
      setBulkMarks({});
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUpload = async () => {
    if (!exam.trim() || !config || uploadData.length === 0) return;
    setSaving(true);
    try {
      const headerMap = new Map<string, keyof StudentRecord>();
      const sample = uploadData[0];
      const keys = Object.keys(sample);

      const nameKey = keys.find((k) => /name|نام|নাম/i.test(k)) || "";
      const idKey = keys.find((k) => /id|identifier|আইডি|রোল|roll/i.test(k)) || "";
      const subjectKeys = config.subjects.map((subj) => {
        const key = keys.find((k) => k.trim().toLowerCase() === subj.name.trim().toLowerCase()) || "";
        return { subject: subj, key };
      });

      const payloads = uploadData.map((row, idx) => {
        const studentName = row[nameKey]?.trim() || `Student ${idx + 1}`;
        const studentId = row[idKey]?.trim() || `imported-${idx}`;
        const subjects: ResultSubjectMark[] = subjectKeys.map(({ subject, key }) => {
          const val = Math.max(0, Number(row[key] || 0));
          const max = examType === "test" ? subject.testMark : subject.semesterMark;
          return {
            id: subject.id,
            name: subject.name,
            nameEn: subject.nameEn,
            testMark: examType === "test" ? val : 0,
            semesterMark: examType === "semester" ? val : 0,
            totalMark: val,
            testMaxMark: subject.testMark,
            semesterMaxMark: subject.semesterMark,
            totalMaxMark: max,
          };
        });
        const { totalMarks, obtainedMarks, gpa, grade } = calcStudentResult(subjects, config.subjects, examType);
        return {
          exam: exam.trim(),
          examEn: examEn.trim() || exam.trim(),
          examType,
          className: selectedClass.trim(),
          classNameEn: selectedClass.trim(),
          campus: "both" as const,
          resultType: "personal" as const,
          entryType: "class" as const,
          studentId,
          studentName,
          section: "",
          roll: idx + 1,
          position: 0,
          totalMarks,
          obtainedMarks,
          gpa,
          grade,
          remarksBn: "",
          remarksEn: "",
          subjects,
        };
      });

      const ranked = rankRows(payloads.map((p, i) => ({ ...p, roll: i + 1, studentName: p.studentName, obtainedMarks: p.obtainedMarks })));
      const finalPayloads = payloads.map((p, i) => ({ ...p, position: ranked[i].position }));
      await onCreateBatch(finalPayloads);
      setUploadData([]);
      setUploadFileName("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-sm">
          <PenLine className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bengali text-2xl font-semibold text-foreground">{t("মার্কস এন্ট্রি", "Marks Entry")}</h2>
          <p className="font-bengali text-sm text-muted-foreground">{t("একক, বাল্ক ও এক্সেল আপলোডের মাধ্যমে মার্কস প্রবেশ করান", "Enter marks via single, bulk, or Excel upload")}</p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 font-bengali text-sm font-medium transition-all",
                mode === m.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(m.labelBn, m.labelEn)}
            </button>
          );
        })}
      </div>

      {/* Exam + Class Selection */}
      <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-4">
        <h3 className="font-bengali text-sm font-semibold text-foreground">{t("পরীক্ষা ও ক্লাস নির্বাচন", "Select Exam & Class")}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <BilingualInput
              labelBn="পরীক্ষার নাম"
              labelEn="Exam name"
              valueBn={exam}
              valueEn={examEn}
              onBnChange={setExam}
              onEnChange={setExamEn}
            />
            {examOptions.length > 0 ? (
              <select
                value={examOptions.includes(exam) ? exam : ""}
                onChange={(e) => { setExam(e.target.value); setExamEn(e.target.value); }}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("আগের পরীক্ষা থেকে নির্বাচন", "Select from previous")}</option>
                {examOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : null}
          </div>
          <div className="space-y-2">
            <Field label={t("পরীক্ষার ধরন", "Exam type")}>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as "test" | "semester")}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="test">{t("টেস্ট", "Test")}</option>
                <option value="semester">{t("সেমিস্টার", "Semester")}</option>
              </select>
            </Field>
            <Field label={t("ক্লাস", "Class")}>
              <select
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudentId(""); setMarksDraft({}); setBulkMarks({}); }}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("একটি ক্লাস নির্বাচন", "Select a class")}</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </div>

      {/* Single Entry */}
      {mode === "single" && selectedClass && config ? (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-4">
          <h3 className="font-bengali text-sm font-semibold text-foreground">{t("শিক্ষার্থী নির্বাচন", "Select Student")}</h3>
          <select
            value={selectedStudentId}
            onChange={(e) => { setSelectedStudentId(e.target.value); setMarksDraft({}); }}
            className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
          >
            <option value="">{t("একজন শিক্ষার্থী নির্বাচন", "Select a student")}</option>
            {classStudents.map((s) => (
              <option key={s.studentId} value={s.studentId}>{s.roll}. {s.studentName} ({s.studentId})</option>
            ))}
          </select>

          {selectedStudent && computedSingle ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/20 px-4 py-3 border border-border/40">
                <p className="font-bengali text-sm font-semibold text-foreground">{selectedStudent.studentName}</p>
                <p className="font-bengali text-xs text-muted-foreground">Roll: {selectedStudent.roll} • ID: {selectedStudent.studentId} • {selectedStudent.section}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {config.subjects.map((subj) => {
                  const max = examType === "test" ? subj.testMark : subj.semesterMark;
                  return (
                    <div key={subj.id} className="space-y-1">
                      <label className="font-bengali text-xs font-medium text-foreground">{subj.name} (Max: {max})</label>
                      <Input
                        type="number"
                        min="0"
                        max={max}
                        value={marksDraft[subj.id] || ""}
                        onChange={(e) => setMarksDraft((prev) => ({ ...prev, [subj.id]: e.target.value }))}
                        className="h-10 rounded-xl"
                        placeholder={t("মার্কস", "Marks")}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3 border border-primary/10">
                <div className="font-bengali text-sm">
                  <span className="text-muted-foreground">{t("মোট", "Total")}: </span>
                  <strong className="text-foreground">{computedSingle.obtainedMarks}/{computedSingle.totalMarks}</strong>
                </div>
                <div className="font-bengali text-sm">
                  <span className="text-muted-foreground">GPA: </span>
                  <strong className={cn(computedSingle.grade === "F" ? "text-red-600" : "text-emerald-600")}>{computedSingle.gpa.toFixed(2)}</strong>
                </div>
                <div className="font-bengali text-sm">
                  <span className="text-muted-foreground">{t("গ্রেড", "Grade")}: </span>
                  <strong className={cn(computedSingle.grade === "F" ? "text-red-600" : "text-emerald-600")}>{computedSingle.grade}</strong>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="rounded-2xl font-bengali" disabled={saving || !exam.trim()} onClick={handleSaveSingle}>
                  {saving ? t("সেভ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save Result")}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : mode === "single" && selectedClass && !config ? (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <EmptyState text={t("এই ক্লাসের জন্য বিষয় কনফিগার করা হয়নি", "Subjects not configured for this class")} description={t("ক্লাস ও বিষয় মেনু থেকে কনফিগার করুন", "Configure from Class Subjects menu")} />
        </div>
      ) : null}

      {/* Bulk Entry */}
      {mode === "bulk" && selectedClass && config ? (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bengali text-sm font-semibold text-foreground">{t("বাল্ক মার্কস এন্ট্রি", "Bulk Marks Entry")}</h3>
            <span className="font-bengali text-xs text-muted-foreground">{classStudents.length} {t("শিক্ষার্থী", "students")}</span>
          </div>

          {classStudents.length === 0 ? (
            <EmptyState text={t("এই ক্লাসে কোনো শিক্ষার্থী নেই", "No students in this class")} />
          ) : (
            <div className="space-y-3">
              {computedBulk.map((row) => (
                <div key={row.student.studentId} className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">{row.student.roll}</div>
                      <div>
                        <p className="font-bengali text-sm font-semibold text-foreground">{row.student.studentName}</p>
                        <p className="font-bengali text-xs text-muted-foreground">{row.student.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-medium text-muted-foreground">{t("মোট", "Total")}: <strong className="text-foreground">{row.obtainedMarks}/{row.totalMarks}</strong></span>
                      <span className={cn("font-bold", row.grade === "F" ? "text-red-600" : "text-emerald-600")}>{row.gpa.toFixed(2)}</span>
                      <span className={cn("font-bold", row.grade === "F" ? "text-red-600" : "text-emerald-600")}>{row.grade}</span>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {config.subjects.map((subj) => {
                      const max = examType === "test" ? subj.testMark : subj.semesterMark;
                      return (
                        <div key={subj.id} className="flex items-center gap-2">
                          <span className="font-bengali text-xs text-muted-foreground w-16 shrink-0 truncate">{subj.name}</span>
                          <Input
                            type="number"
                            min="0"
                            max={max}
                            value={bulkMarks[row.student.studentId]?.[subj.id] || ""}
                            onChange={(e) =>
                              setBulkMarks((prev) => ({
                                ...prev,
                                [row.student.studentId]: { ...(prev[row.student.studentId] || {}), [subj.id]: e.target.value },
                              }))
                            }
                            className="h-8 rounded-lg text-xs flex-1"
                          />
                          <span className="font-bengali text-[11px] text-muted-foreground w-6 text-right">/{max}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {classStudents.length > 0 ? (
            <div className="flex justify-end">
              <Button className="rounded-2xl font-bengali" disabled={saving || !exam.trim()} onClick={handleSaveBulk}>
                {saving ? t("সেভ হচ্ছে...", "Saving...") : t("সব সংরক্ষণ করুন", "Save All Results")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : mode === "bulk" && selectedClass && !config ? (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <EmptyState text={t("এই ক্লাসের জন্য বিষয় কনফিগার করা হয়নি", "Subjects not configured for this class")} />
        </div>
      ) : null}

      {/* Upload Entry */}
      {mode === "upload" && selectedClass && config ? (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-4">
          <h3 className="font-bengali text-sm font-semibold text-foreground">{t("এক্সেল/সিএসভি আপলোড", "Excel/CSV Upload")}</h3>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-bengali text-sm font-medium text-foreground">{uploadFileName || t("ফাইল নির্বাচন করুন", "Click to select file")}</p>
            <p className="font-bengali text-xs text-muted-foreground mt-1">{t(".xlsx, .xls, .csv ফাইল সাপোর্টেড", ".xlsx, .xls, .csv supported")}</p>
            {uploadFileName ? (
              <p className="font-bengali text-xs text-primary mt-2">{uploadFileName}</p>
            ) : null}
          </div>

          {uploadData.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bengali text-sm text-muted-foreground">{uploadData.length} {t("টি রেকর্ড পাওয়া গেছে", "records found")}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl font-bengali text-xs" onClick={() => { setUploadData([]); setUploadFileName(""); }}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />{t("ক্লিয়ার", "Clear")}
                  </Button>
                  <Button size="sm" className="rounded-xl font-bengali text-xs" disabled={saving || !exam.trim()} onClick={handleSaveUpload}>
                    {saving ? t("সেভ হচ্ছে...", "Saving...") : `${t("সেভ করুন", "Save")} (${uploadData.length})`}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/60">
                      {Object.keys(uploadData[0]).map((key) => (
                        <th key={key} className="px-3 py-2 font-bengali text-xs font-semibold text-muted-foreground text-left whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadData.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="border-b border-border/40 hover:bg-muted/20">
                        {Object.values(row).map((val, ci) => (
                          <td key={ci} className="px-3 py-2 font-bengali text-xs text-foreground whitespace-nowrap">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uploadData.length > 50 ? (
                  <p className="p-3 font-bengali text-xs text-muted-foreground text-center">{t("আরও", "And")} {uploadData.length - 50} {t("টি রেকর্ড...", "more records...")}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Table2 className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-bengali text-xs text-muted-foreground">{t("প্রথম কলামে শিক্ষার্থীর নাম/আইডি এবং পরবর্তী কলামগুলোতে বিষয়ের নাম অনুযায়ী মার্কস দিন", "First column: student name/ID, following columns: subject marks with subject names as headers")}</p>
            </div>
          )}
        </div>
      ) : mode === "upload" && selectedClass && !config ? (
        <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5">
          <EmptyState text={t("এই ক্লাসের জন্য বিষয় কনফিগার করা হয়নি", "Subjects not configured for this class")} />
        </div>
      ) : null}
    </div>
  );
};

export default MarksEntryPage;
