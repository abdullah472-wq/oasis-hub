import { useEffect, useMemo, useState } from "react";
import { BarChart3, BellRing, CheckCircle2, Download, Eye, Pencil, Printer, UserCheck, Users, Video } from "lucide-react";
import { jsPDF } from "jspdf";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import type { AdmissionForm, AdmissionStatus } from "@/lib/admission";
import type { AppDownloadSettings } from "@/lib/appDownloadSettings";
import type { MobileAppNotification, MobileNotificationAudience } from "@/lib/mobileNotifications";
import type { StudentRecord } from "@/lib/students";
import type { Teacher } from "@/lib/teachers";
import type { VirtualTour } from "@/lib/virtualTour";
import type { AttendanceRecord, DashboardSettings, FeeRecord, GuardianRequest } from "@/lib/adminDashboard";
import {
  GUARDIAN_CLASS_OPTIONS,
  GUARDIAN_SECTION_OPTIONS,
  normalizeGuardianStudentId,
  type GuardianRegistrationInput,
  type GuardianRelationship,
} from "@/lib/guardianRegistration";
import { getDownloadUrl } from "@/lib/upload";
import { createClientId } from "@/lib/uuid";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BilingualInput,
  BilingualTextarea,
  DeleteIconButton,
  EmptyState,
  Field,
  FilePicker,
  FormCard,
  ItemCard,
  ModuleShell,
  ToggleRow,
  shellCardClass,
} from "./AdminPagePrimitives";

export const TeachersManagerPage = ({
  items,
  onCreate,
  onDelete,
}: {
  items: Teacher[];
  onCreate: (payload: Omit<Teacher, "id" | "createdAt" | "imageUrl">, file: File | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", nameEn: "", designation: "", designationEn: "", campus: "boys" as Teacher["campus"] });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onCreate(form, image);
    setForm({ name: "", nameEn: "", designation: "", designationEn: "", campus: "boys" });
    setImage(null);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <ModuleShell
      title={t("শিক্ষক ম্যানেজমেন্ট", "Teachers Management")}
      description={t("শিক্ষকদের তথ্য, পদবি এবং ক্যাম্পাসভিত্তিক প্রোফাইল এখান থেকে সংরক্ষণ ও পরিচালনা করুন", "Manage teacher profiles, designations, and campus assignments from here")}
      actionLabel={t("নতুন শিক্ষক", "New Teacher")}
      onAction={() => setShowForm((current) => !current)}
      icon={<Users className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput labelBn="নাম" labelEn="Name" valueBn={form.name} valueEn={form.nameEn} onBnChange={(value) => setForm((current) => ({ ...current, name: value }))} onEnChange={(value) => setForm((current) => ({ ...current, nameEn: value }))} />
          <BilingualInput labelBn="পদবি" labelEn="Designation" valueBn={form.designation} valueEn={form.designationEn} onBnChange={(value) => setForm((current) => ({ ...current, designation: value }))} onEnChange={(value) => setForm((current) => ({ ...current, designationEn: value }))} />
          <Field label={t("ক্যাম্পাস", "Campus")}>
            <select value={form.campus} onChange={(event) => setForm((current) => ({ ...current, campus: event.target.value as Teacher["campus"] }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
              <option value="boys">{t("বালক", "Boys")}</option>
              <option value="girls">{t("বালিকা", "Girls")}</option>
            </select>
          </Field>
          <FilePicker label={t("শিক্ষকের ছবি", "Teacher image")} file={image} onFileChange={setImage} accept="image/*" />
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো শিক্ষক যোগ করা হয়নি", "No teachers added yet")} className="md:col-span-2 xl:col-span-3" /> : items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-2xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary">{item.name.charAt(0)}</div>}
                  <div>
                    <p className="font-bengali text-sm font-medium">{item.name}</p>
                    <p className="font-bengali text-xs text-muted-foreground">{item.designation}</p>
                    <Badge variant="secondary" className="mt-2 rounded-full">{item.campus}</Badge>
                  </div>
                </div>
                <DeleteIconButton onClick={() => item.id && void onDelete(item.id)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const VirtualToursManagerPage = ({
  items,
  onCreate,
  onDelete,
}: {
  items: VirtualTour[];
  onCreate: (payload: Omit<VirtualTour, "id" | "createdAt">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", titleEn: "", description: "", descriptionEn: "", videoUrl: "" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onCreate(form);
    setForm({ title: "", titleEn: "", description: "", descriptionEn: "", videoUrl: "" });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <ModuleShell
      title={t("ভার্চুয়াল ট্যুর ম্যানেজমেন্ট", "Virtual Tour Management")}
      description={t("ভিডিওভিত্তিক ক্যাম্পাস ট্যুর সংরক্ষণ, এডিট এবং প্রকাশ করুন", "Manage, edit, and publish video-based campus tours")}
      actionLabel={t("নতুন ট্যুর", "New Tour")}
      onAction={() => setShowForm((current) => !current)}
      icon={<Video className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput labelBn="ট্যুর শিরোনাম" labelEn="Tour title" valueBn={form.title} valueEn={form.titleEn} onBnChange={(value) => setForm((current) => ({ ...current, title: value }))} onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))} />
          <BilingualTextarea labelBn="বিবরণ" labelEn="Description" valueBn={form.description} valueEn={form.descriptionEn} onBnChange={(value) => setForm((current) => ({ ...current, description: value }))} onEnChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))} />
          <Field label={t("ভিডিও URL", "Video URL")}><Input value={form.videoUrl} onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))} className="rounded-2xl" placeholder="https://www.youtube.com/embed/..." /></Field>
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো ভার্চুয়াল ট্যুর নেই", "No virtual tours yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={item.title} meta={new Date(item.createdAt).toLocaleString("bn-BD")} onDelete={() => item.id && void onDelete(item.id)}>
              <div className="space-y-2">
                {item.description && <p className="font-bengali text-sm text-muted-foreground">{item.description}</p>}
                {item.videoUrl && <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="font-bengali text-sm text-primary hover:underline">{t("ভিডিও দেখুন", "Watch video")}</a>}
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

const inferStudentAvatarVariant = (student: StudentRecord): "boys" | "girls" => {
  const source = `${student.className} ${student.section}`.toLowerCase();

  if (/(girls|girl|female|balika|বালিকা|ছাত্রী)/.test(source)) return "girls";
  if (/(boys|boy|male|balok|বালক|ছাত্র)/.test(source)) return "boys";

  const hash = Array.from(student.studentId || student.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % 2 === 0 ? "boys" : "girls";
};

type StudentExportScope = "all" | "girls" | "boys";
type StudentExportFormat = "pdf" | "excel";

const detectStudentExportGroup = (student: StudentRecord): "girls" | "boys" => {
  const studentId = (student.studentId || "").trim().toLowerCase();

  if (studentId.startsWith("g-")) return "girls";
  if (/^\d+$/.test(studentId)) return "boys";

  return inferStudentAvatarVariant(student);
};

const filterStudentsByScope = (students: StudentRecord[], scope: StudentExportScope) => {
  if (scope === "all") return students;
  return students.filter((student) => detectStudentExportGroup(student) === scope);
};

const StudentAvatarCard = ({ variant }: { variant: "boys" | "girls" }) => (
  <div
    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border shadow-sm sm:h-16 sm:w-16 ${
      variant === "boys"
        ? "border-sky-200/80 bg-[linear-gradient(180deg,rgba(224,242,254,0.95),rgba(186,230,253,0.88))] text-sky-700"
        : "border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,228,230,0.95),rgba(254,205,211,0.9))] text-rose-700"
    }`}
  >
    <svg viewBox="0 0 64 64" className="h-9 w-9 sm:h-10 sm:w-10" fill="none" aria-hidden="true">
      <circle cx="32" cy="21" r="11" fill="currentColor" opacity="0.18" />
      <path
        d={variant === "boys" ? "M20 24c1-8 8-13 12-13s11 5 12 13c-3-2-7-3-12-3s-9 1-12 3Z" : "M18 24c2-9 8-14 14-14s12 5 14 14c-2-3-6-6-14-6s-12 3-14 6Z"}
        fill="currentColor"
      />
      <circle cx="32" cy="25" r="9" fill="white" fillOpacity="0.94" />
      <path d="M18 53c1-11 7-17 14-17s13 6 14 17H18Z" fill="currentColor" opacity="0.2" />
      <path
        d={variant === "boys" ? "M25 41c2-2 4-3 7-3s5 1 7 3l2 10H23l2-10Z" : "M22 42c3-3 6-4 10-4s7 1 10 4l-2 9H24l-2-9Z"}
        fill="currentColor"
      />
    </svg>
  </div>
);

export const StudentListPage = ({
  students,
  onUpdate,
  onDelete,
}: {
  students: StudentRecord[];
  onUpdate: (student: StudentRecord) => Promise<void>;
  onDelete: (student: StudentRecord) => Promise<void>;
}) => {
  const STUDENT_CLASS_SEQUENCE = ["Play", "Nursery", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
  const normalizeStudentClassName = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return "";

    if (normalized === "play" || normalized === "pre-play" || normalized === "pre play" || normalized === "play group") {
      return "Play";
    }

    if (normalized === "nursery") {
      return "Nursery";
    }

    const digitMatch = normalized.match(/\d+/);
    if (digitMatch) {
      const digit = digitMatch[0];
      if (STUDENT_CLASS_SEQUENCE.includes(digit as (typeof STUDENT_CLASS_SEQUENCE)[number])) {
        return digit;
      }
    }

    return value.trim();
  };

  const buildStudentClassSummary = (items: StudentRecord[]) => {
    const counts = new Map<string, number>();

    items.forEach((student) => {
      const className = normalizeStudentClassName(student.className) || t("অশ্রেণিবদ্ধ", "Unassigned");
      counts.set(className, (counts.get(className) ?? 0) + 1);
    });

    const maxCount = Math.max(0, ...counts.values());

    return Array.from(counts.entries())
      .map(([className, count]) => ({
        className,
        count,
        barPercent: maxCount === 0 ? 0 : (count / maxCount) * 100,
        sharePercent: items.length === 0 ? 0 : (count / items.length) * 100,
      }))
      .sort((a, b) => {
        const aIndex = STUDENT_CLASS_SEQUENCE.indexOf(a.className as (typeof STUDENT_CLASS_SEQUENCE)[number]);
        const bIndex = STUDENT_CLASS_SEQUENCE.indexOf(b.className as (typeof STUDENT_CLASS_SEQUENCE)[number]);

        if (aIndex !== -1 || bIndex !== -1) {
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        }

        return a.className.localeCompare(b.className, undefined, { numeric: true });
      });
  };

  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeClassFilter, setActiveClassFilter] = useState("");
  const [classListPreview, setClassListPreview] = useState("");
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [deletingId, setDeletingId] = useState("");
  const [savingStudent, setSavingStudent] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportStep, setExportStep] = useState<1 | 2>(1);
  const [exportFormat, setExportFormat] = useState<StudentExportFormat>("pdf");
  const [exportScope, setExportScope] = useState<StudentExportScope>("all");
  const [studentForm, setStudentForm] = useState({
    studentName: "",
    className: "",
    section: "",
    roll: "",
    monthlyFee: "",
    guardianName: "",
    guardianPhone: "",
  });

  const searchMatchedStudents = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return students;

    return students.filter((student) =>
      [
        student.studentId,
        student.studentName,
        student.guardianName || "",
        student.className,
        student.section,
        String(student.roll || ""),
      ].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [query, students]);

  const filteredStudents = useMemo(() => {
    if (!activeClassFilter) return searchMatchedStudents;

    return searchMatchedStudents.filter(
      (student) => (normalizeStudentClassName(student.className) || t("অশ্রেণিবদ্ধ", "Unassigned")) === activeClassFilter,
    );
  }, [activeClassFilter, searchMatchedStudents, t]);

  const classSummary = useMemo(() => buildStudentClassSummary(searchMatchedStudents), [searchMatchedStudents]);

  const mostPopulatedClass = useMemo(() => {
    if (classSummary.length === 0) return null;
    return [...classSummary].sort((a, b) => b.count - a.count || a.className.localeCompare(b.className, undefined, { numeric: true }))[0];
  }, [classSummary]);

  const genderSummary = useMemo(() => {
    return filteredStudents.reduce(
      (acc, student) => {
        if (detectStudentExportGroup(student) === "girls") {
          acc.girls += 1;
        } else {
          acc.boys += 1;
        }

        return acc;
      },
      { boys: 0, girls: 0 },
    );
  }, [filteredStudents]);

  const previewStudents = useMemo(() => {
    if (!classListPreview) return [];

    return searchMatchedStudents.filter(
      (student) => (normalizeStudentClassName(student.className) || t("অশ্রেণিবদ্ধ", "Unassigned")) === classListPreview,
    );
  }, [classListPreview, searchMatchedStudents, t]);

  useEffect(() => {
    if (!editingStudent) return;

    setStudentForm({
      studentName: editingStudent.studentName || "",
      className: editingStudent.className || "",
      section: editingStudent.section || "",
      roll: editingStudent.roll ? String(editingStudent.roll) : "",
      monthlyFee: editingStudent.monthlyFee ? String(editingStudent.monthlyFee) : "",
      guardianName: editingStudent.guardianName || "",
      guardianPhone: editingStudent.guardianPhone || "",
    });
  }, [editingStudent]);

  const exportStudents = useMemo(() => filterStudentsByScope(students, exportScope), [exportScope, students]);

  const exportScopeLabel = useMemo(() => {
    switch (exportScope) {
      case "girls":
        return t("বালিকা", "Girls");
      case "boys":
        return t("বালক", "Boys");
      default:
        return t("সকল শিক্ষার্থী", "All Students");
    }
  }, [exportScope, t]);

  const buildStudentExportRows = (items: StudentRecord[]) =>
    items.map((student, index) => ({
      serial: index + 1,
      studentId: student.studentId || "-",
      studentName: student.studentName || "-",
      guardianName: student.guardianName || "-",
      className: student.className || "-",
      section: student.section || "-",
      roll: student.roll ? String(student.roll) : "-",
      group: detectStudentExportGroup(student) === "girls" ? t("বালিকা", "Girls") : t("বালক", "Boys"),
    }));

  const downloadStudentPdf = () => {
    const rows = buildStudentExportRows(exportStudents);
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 4.5;
    const cellPadding = 1.5;
    const columns = [
      { key: "serial", label: t("SL", "SL"), width: 12 },
      { key: "studentId", label: t("Student ID", "Student ID"), width: 30 },
      { key: "studentName", label: t("Name", "Name"), width: 56 },
      { key: "guardianName", label: t("Guardian", "Guardian"), width: 56 },
      { key: "className", label: t("Class", "Class"), width: 24 },
      { key: "section", label: t("Section", "Section"), width: 22 },
      { key: "roll", label: t("Roll", "Roll"), width: 18 },
      { key: "group", label: t("Group", "Group"), width: 24 },
    ] as const;

    const drawHeader = () => {
      let currentY = 14;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(t("Student List", "Student List"), margin, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${t("Scope", "Scope")}: ${exportScopeLabel}`, margin, currentY);
      currentY += 5;
      doc.text(`${t("Total Students", "Total Students")}: ${rows.length}`, margin, currentY);
      currentY += 6;

      let x = margin;
      const headerHeight = 9;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      columns.forEach((column) => {
        doc.rect(x, currentY, column.width, headerHeight);
        doc.text(column.label, x + cellPadding, currentY + 5.5);
        x += column.width;
      });

      return currentY + headerHeight;
    };

    let y = drawHeader();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    rows.forEach((row) => {
      const cellLines = columns.map((column) =>
        doc.splitTextToSize(String(row[column.key] ?? ""), column.width - cellPadding * 2),
      );
      const rowHeight = Math.max(...cellLines.map((lines) => Math.max(lines.length, 1))) * lineHeight + cellPadding * 2;

      if (y + rowHeight > pageHeight - margin) {
        doc.addPage();
        y = drawHeader();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
      }

      let x = margin;
      columns.forEach((column, columnIndex) => {
        doc.rect(x, y, column.width, rowHeight);
        doc.text(cellLines[columnIndex], x + cellPadding, y + 4.2);
        x += column.width;
      });

      y += rowHeight;
    });

    doc.save(`student-list-${exportScope}.pdf`);
  };

  const downloadStudentExcel = () => {
    const rows = buildStudentExportRows(exportStudents);
    const tableRows = rows
      .map(
        (row) => `
          <tr>
            <td>${row.serial}</td>
            <td>${row.studentId}</td>
            <td>${row.studentName}</td>
            <td>${row.guardianName}</td>
            <td>${row.className}</td>
            <td>${row.section}</td>
            <td>${row.roll}</td>
            <td>${row.group}</td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th>${t("ক্রম", "SL")}</th>
                <th>${t("স্টুডেন্ট আইডি", "Student ID")}</th>
                <th>${t("নাম", "Name")}</th>
                <th>${t("অভিভাবক", "Guardian")}</th>
                <th>${t("শ্রেণি", "Class")}</th>
                <th>${t("সেকশন", "Section")}</th>
                <th>${t("রোল", "Roll")}</th>
                <th>${t("বিভাগ", "Group")}</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([`\uFEFF${html}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student-list-${exportScope}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStudentExport = () => {
    if (exportFormat === "excel") {
      downloadStudentExcel();
      return;
    }

    downloadStudentPdf();
  };

  const exportScopeCounts = useMemo(
    () => ({
      all: filterStudentsByScope(students, "all").length,
      girls: filterStudentsByScope(students, "girls").length,
      boys: filterStudentsByScope(students, "boys").length,
    }),
    [students],
  );

  const printClassStudents = (className: string) => {
    const classStudents = searchMatchedStudents.filter(
      (student) => (normalizeStudentClassName(student.className) || t("অশ্রেণিবদ্ধ", "Unassigned")) === className,
    );

    if (classStudents.length === 0) {
      toast.error(t("এই ক্লাসে দেখানোর মতো কোনো শিক্ষার্থী নেই", "No students available in this class"));
      return;
    }

    const rows = classStudents
      .map(
        (student, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${student.studentId || "-"}</td>
            <td>${student.studentName || "-"}</td>
            <td>${student.guardianName || "-"}</td>
            <td>${student.section || "-"}</td>
            <td>${student.roll ? String(student.roll) : "-"}</td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${className} Student List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
            .meta { font-size: 14px; color: #475569; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 14px; }
            th { background: #e2e8f0; }
            tr:nth-child(even) td { background: #f8fafc; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${t("শ্রেণিভিত্তিক শিক্ষার্থী তালিকা", "Class-wise student list")} - ${className}</h1>
            <p class="meta">${t("মোট শিক্ষার্থী", "Total students")}: ${classStudents.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t("ক্রম", "SL")}</th>
                <th>${t("স্টুডেন্ট আইডি", "Student ID")}</th>
                <th>${t("নাম", "Name")}</th>
                <th>${t("অভিভাবক", "Guardian")}</th>
                <th>${t("সেকশন", "Section")}</th>
                <th>${t("রোল", "Roll")}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1000,height=700");
    if (!printWindow) return;

    printWindow.document.write(html);
    printWindow.document.close();

    const runPrint = () => {
      printWindow.focus();
      printWindow.print();
    };

    printWindow.addEventListener("load", () => setTimeout(runPrint, 250), { once: true });
    setTimeout(runPrint, 600);
  };

  return (
    <>
      <ModuleShell
        title={t("শিক্ষার্থী তালিকা", "Student List")}
        description={t(
          "প্রতি শিক্ষার্থীর আইডি-কার্ড স্টাইল বক্সে নাম, অভিভাবক, শ্রেণি, সেকশন ও রোল একসাথে দেখুন",
          "View each student in an ID-card style box with name, guardian, class, section, and roll",
        )}
        icon={<Users className="h-5 w-5" />}
      >
        <Card className={shellCardClass}>
          <CardContent className="space-y-5 p-6">
            <div className="overflow-hidden rounded-[28px] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <BarChart3 className="h-4 w-4" />
                    <span className="font-bengali text-sm font-semibold uppercase tracking-[0.18em]">
                      {t("ক্লাস ভিজুয়াল", "Class Visual")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bengali text-lg font-semibold text-foreground">
                      {t("কোন ক্লাসে কতজন শিক্ষার্থী", "Students by class")}
                    </h3>
                    <p className="font-bengali text-sm leading-6 text-muted-foreground">
                      {query.trim()
                        ? t(
                            "বর্তমান সার্চ ফলাফলের ভিত্তিতে প্রতিটি শ্রেণিতে কতজন শিক্ষার্থী দেখানো হচ্ছে তা এখানে এক নজরে দেখা যাবে।",
                            "This shows how many students appear in each class for the current search results.",
                          )
                        : t(
                            "সব দৃশ্যমান শিক্ষার্থীকে শ্রেণিভিত্তিক ভাগ করে উপরে থেকেই দ্রুত সংখ্যা দেখা যাবে।",
                            "This groups all visible students by class so you can compare counts at a glance.",
                          )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-4 py-1 font-bengali">
                    {t("মোট ক্লাস", "Total Classes")}: {classSummary.length}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-1 font-bengali">
                    {t("সবচেয়ে বেশি", "Highest")}:{" "}
                    {mostPopulatedClass
                      ? `${mostPopulatedClass.className} (${mostPopulatedClass.count})`
                      : t("তথ্য নেই", "No data")}
                  </Badge>
                </div>
              </div>

              {classSummary.length === 0 ? (
                <div className="mt-5">
                  <EmptyState text={t("ক্লাসভিত্তিক দেখানোর মতো কোনো শিক্ষার্থী নেই", "No students available for class summary")} />
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {classSummary.map((item, index) => {
                    const tones = [
                      {
                        shell:
                          "border-sky-200/80 bg-[linear-gradient(145deg,rgba(240,249,255,0.98),rgba(224,242,254,0.92))]",
                        orb: "bg-sky-300/35",
                        accent: "bg-sky-600",
                        ringColor: "#0284c7",
                        soft: "bg-sky-600/10 text-sky-800",
                        track: "bg-sky-100/90",
                        fill: "bg-[linear-gradient(90deg,rgba(2,132,199,0.95),rgba(14,116,144,0.82))]",
                      },
                      {
                        shell:
                          "border-emerald-200/80 bg-[linear-gradient(145deg,rgba(236,253,245,0.98),rgba(209,250,229,0.92))]",
                        orb: "bg-emerald-300/35",
                        accent: "bg-emerald-600",
                        ringColor: "#059669",
                        soft: "bg-emerald-600/10 text-emerald-800",
                        track: "bg-emerald-100/90",
                        fill: "bg-[linear-gradient(90deg,rgba(5,150,105,0.95),rgba(4,120,87,0.82))]",
                      },
                      {
                        shell:
                          "border-amber-200/80 bg-[linear-gradient(145deg,rgba(255,251,235,0.98),rgba(254,243,199,0.92))]",
                        orb: "bg-amber-300/35",
                        accent: "bg-amber-500",
                        ringColor: "#f59e0b",
                        soft: "bg-amber-500/10 text-amber-900",
                        track: "bg-amber-100/90",
                        fill: "bg-[linear-gradient(90deg,rgba(245,158,11,0.95),rgba(217,119,6,0.82))]",
                      },
                      {
                        shell:
                          "border-rose-200/80 bg-[linear-gradient(145deg,rgba(255,241,242,0.98),rgba(255,228,230,0.92))]",
                        orb: "bg-rose-300/35",
                        accent: "bg-rose-500",
                        ringColor: "#f43f5e",
                        soft: "bg-rose-500/10 text-rose-900",
                        track: "bg-rose-100/90",
                        fill: "bg-[linear-gradient(90deg,rgba(244,63,94,0.95),rgba(225,29,72,0.82))]",
                      },
                    ][index % 4];

                    const isLeader = mostPopulatedClass?.className === item.className && mostPopulatedClass?.count === item.count;

                    return (
                      <div
                        key={item.className}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveClassFilter((current) => (current === item.className ? "" : item.className))}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveClassFilter((current) => (current === item.className ? "" : item.className));
                          }
                        }}
                        className={`relative overflow-hidden rounded-[26px] border p-4 shadow-[0_20px_45px_-42px_rgba(15,23,42,0.42)] transition-transform duration-200 hover:-translate-y-1 cursor-pointer ${tones.shell} ${
                          activeClassFilter === item.className ? "ring-2 ring-slate-900/80 ring-offset-2" : ""
                        }`}
                      >
                        <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${tones.orb}`} />
                        <div className="relative">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${tones.accent}`} />
                                <span className="font-bengali text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                  {t("শ্রেণি ভিত্তিক", "By Class")}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-display text-[1.7rem] font-semibold leading-none text-slate-900">{item.className}</h4>
                                <p className="mt-1 font-bengali text-sm text-slate-600">
                                  {t("মোট শিক্ষার্থী", "Total students")} : {item.count}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div
                                className="flex h-14 w-14 items-center justify-center rounded-full"
                                style={{
                                  background: `conic-gradient(${tones.ringColor} ${Math.max(item.barPercent, 8)}%, rgba(255,255,255,0.55) 0)`,
                                }}
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[11px] font-semibold text-slate-900 shadow-sm">
                                  #{index + 1}
                                </div>
                              </div>
                              {isLeader ? (
                                <div className="rounded-full bg-slate-900 px-3 py-1 font-bengali text-[11px] font-medium text-white">
                                  {t("সর্বোচ্চ", "Top")}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant={activeClassFilter === item.className ? "default" : "outline"}
                              size="icon"
                              className="rounded-2xl"
                              aria-label={
                                activeClassFilter === item.className
                                  ? t("ফিল্টার সরান", "Clear Filter")
                                  : t("এই ক্লাস দেখুন", "Filter Class")
                              }
                              title={
                                activeClassFilter === item.className
                                  ? t("ফিল্টার সরান", "Clear Filter")
                                  : t("এই ক্লাস দেখুন", "Filter Class")
                              }
                              onClick={(event) => {
                                event.stopPropagation();
                                setActiveClassFilter((current) => (current === item.className ? "" : item.className));
                              }}
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-2xl"
                              aria-label={t("লিস্ট দেখুন", "View List")}
                              title={t("লিস্ট দেখুন", "View List")}
                              onClick={(event) => {
                                event.stopPropagation();
                                setClassListPreview(item.className);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-2xl"
                              aria-label={t("লিস্ট প্রিন্ট", "Print List")}
                              title={t("লিস্ট প্রিন্ট", "Print List")}
                              onClick={(event) => {
                                event.stopPropagation();
                                printClassStudents(item.className);
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-[26px] border border-border/70 bg-background/80 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-4 py-1 font-bengali">
                  {t("মোট শিক্ষার্থী", "Total Students")}: {students.length}
                </Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1 font-bengali">
                  {t("দেখানো হচ্ছে", "Showing")}: {filteredStudents.length}
                </Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1 font-bengali">
                  {t("বালক", "Boys")}: {genderSummary.boys}
                </Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1 font-bengali">
                  {t("বালিকা", "Girls")}: {genderSummary.girls}
                </Badge>
                {activeClassFilter ? (
                  <Badge variant="outline" className="rounded-full px-4 py-1 font-bengali">
                    {t("ফিল্টার ক্লাস", "Filtered class")}: {activeClassFilter}
                  </Badge>
                ) : null}
              </div>
              <div className="flex w-full flex-col gap-3 lg:max-w-4xl lg:flex-row lg:items-center lg:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl font-bengali"
                  onClick={() => {
                    setExportStep(1);
                    setExportDialogOpen(true);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("শিক্ষার্থী তালিকা ডাউনলোড", "Download student list")}
                </Button>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 w-full rounded-2xl lg:max-w-sm"
                  placeholder={t("আইডি, নাম, অভিভাবক বা শ্রেণি দিয়ে খুঁজুন", "Search by ID, name, guardian, or class")}
                />
                {activeClassFilter ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl font-bengali"
                    onClick={() => setActiveClassFilter("")}
                  >
                    {t("ক্লাস ফিল্টার সরান", "Clear class filter")}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredStudents.length === 0 ? (
                <EmptyState
                  text={t("কোনো শিক্ষার্থী পাওয়া যায়নি", "No students found")}
                  className="sm:col-span-2 xl:col-span-4"
                />
              ) : (
                filteredStudents.map((student) => {
                  const variant = inferStudentAvatarVariant(student);

                  return (
                  <div
                    key={student.studentId || student.id}
                    className="relative overflow-hidden rounded-[24px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.96))] p-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.45)] sm:p-4"
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,rgba(14,116,144,0.9),rgba(245,158,11,0.88),rgba(225,29,72,0.85))]" />
                    <div className="relative flex min-h-[250px] flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="rounded-full bg-background/80 px-2.5 py-1 font-bengali text-[10px] text-muted-foreground">
                          {t("স্টুডেন্ট কার্ড", "Student Card")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-2xl"
                            onClick={() => setViewingStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-2xl"
                            onClick={() => setEditingStudent(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DeleteIconButton onClick={() => setSelectedStudent(student)} />
                        </div>
                      </div>

                      <div className="space-y-3 text-center">
                        <div className="flex justify-center">
                          <StudentAvatarCard variant={variant} />
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-2xl bg-sky-50/70 px-3 py-2.5">
                            <p className="font-bengali text-sm font-semibold leading-6 text-foreground">
                              {t("নাম", "Name")} :{" "}
                              <span className="font-normal">
                                {student.studentName || t("নাম পাওয়া যায়নি", "Name unavailable")}
                              </span>
                            </p>
                          </div>

                          <div className="rounded-2xl bg-amber-50/80 px-3 py-2.5">
                            <p className="font-bengali text-sm font-semibold leading-6 text-foreground">
                              {t("অভিভাবকের নাম", "Guardian name")} :{" "}
                              <span className="font-normal">
                                {student.guardianName || t("তথ্য নেই", "No data")}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto rounded-2xl border border-border/60 bg-white/70 px-3 py-3 shadow-sm">
                        <div className="space-y-1.5 font-bengali text-[11px] leading-5 text-muted-foreground sm:text-xs">
                          <p>
                            {t("স্টুডেন্ট আইডি", "Student ID")} :{" "}
                            <span className="font-semibold text-foreground">{student.studentId || "-"}</span>
                          </p>
                          <p>
                            {t("শ্রেণি", "Class")} :{" "}
                            <span className="font-semibold text-foreground">{student.className || "-"}</span>
                          </p>
                          <p>
                            {t("সেকশন", "Section")} :{" "}
                            <span className="font-semibold text-foreground">{student.section || "-"}</span>
                          </p>
                          <p>
                            {t("রোল", "Roll")} :{" "}
                            <span className="font-semibold text-foreground">{student.roll ? String(student.roll) : "-"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </ModuleShell>

      <Dialog
        open={exportDialogOpen}
        onOpenChange={(open) => {
          setExportDialogOpen(open);
          if (!open) {
            setExportStep(1);
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">
              {t("শিক্ষার্থী তালিকা ডাউনলোড", "Download student list")}
            </DialogTitle>
            <DialogDescription className="font-bengali text-sm leading-6">
              {t(
                "ধাপে ধাপে ফরম্যাট ও শিক্ষার্থীর ধরন নির্বাচন করে তালিকা ডাউনলোড করুন।",
                "Choose the format and student scope step by step before downloading the list.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bengali text-sm font-semibold ${exportStep === 1 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
              1
            </div>
            <div className={`h-1 flex-1 rounded-full ${exportStep === 2 ? "bg-primary/50" : "bg-muted"}`} />
            <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bengali text-sm font-semibold ${exportStep === 2 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
              2
            </div>
          </div>

          {exportStep === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  key: "pdf" as const,
                  title: t("PDF", "PDF"),
                  description: t("প্রিন্ট বা শেয়ার করার জন্য সুন্দর ফরম্যাট", "Best for printing or sharing"),
                },
                {
                  key: "excel" as const,
                  title: t("Excel", "Excel"),
                  description: t("টেবিল আকারে ডেটা খোলার জন্য উপযোগী", "Best for opening data as a table"),
                },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setExportFormat(option.key)}
                  className={`rounded-3xl border p-5 text-left transition ${
                    exportFormat === option.key
                      ? "border-primary bg-primary/5 shadow-[0_15px_40px_-30px_rgba(15,23,42,0.35)]"
                      : "border-border/70 bg-background hover:border-primary/40"
                  }`}
                >
                  <p className="font-display text-2xl font-semibold text-foreground">{option.title}</p>
                  <p className="mt-2 font-bengali text-sm leading-6 text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { key: "all" as const, title: t("সকল শিক্ষার্থী", "All Students"), count: exportScopeCounts.all },
                { key: "girls" as const, title: t("বালিকা", "Girls"), count: exportScopeCounts.girls },
                { key: "boys" as const, title: t("বালক", "Boys"), count: exportScopeCounts.boys },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setExportScope(option.key)}
                  className={`rounded-3xl border p-5 text-left transition ${
                    exportScope === option.key
                      ? "border-primary bg-primary/5 shadow-[0_15px_40px_-30px_rgba(15,23,42,0.35)]"
                      : "border-border/70 bg-background hover:border-primary/40"
                  }`}
                >
                  <p className="font-bengali text-base font-semibold text-foreground">{option.title}</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-foreground">{option.count}</p>
                  <p className="mt-1 font-bengali text-xs text-muted-foreground">{t("শিক্ষার্থী", "Students")}</p>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl font-bengali"
              onClick={() => {
                if (exportStep === 1) {
                  setExportDialogOpen(false);
                  return;
                }
                setExportStep(1);
              }}
            >
              {exportStep === 1 ? t("বন্ধ করুন", "Close") : t("পেছনে যান", "Back")}
            </Button>
            {exportStep === 1 ? (
              <Button type="button" className="rounded-2xl font-bengali" onClick={() => setExportStep(2)}>
                {t("পরের ধাপ", "Next Step")}
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-2xl font-bengali"
                onClick={() => {
                  handleStudentExport();
                  setExportDialogOpen(false);
                  setExportStep(1);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("ডাউনলোড করুন", "Download")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(classListPreview)} onOpenChange={(open) => !open && setClassListPreview("")}>
        <DialogContent className="max-w-4xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">
              {t("ক্লাসভিত্তিক শিক্ষার্থী তালিকা", "Class-wise student list")}
              {classListPreview ? ` - ${classListPreview}` : ""}
            </DialogTitle>
            <DialogDescription className="font-bengali text-sm leading-6">
              {t("নির্বাচিত শ্রেণির সব শিক্ষার্থী এখানে তালিকা আকারে দেখা যাবে।", "Students from the selected class appear here in list format.")}
            </DialogDescription>
          </DialogHeader>

          {previewStudents.length === 0 ? (
            <EmptyState text={t("এই শ্রেণির জন্য কোনো শিক্ষার্থী পাওয়া যায়নি", "No students found for this class")} />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-border/70">
              <div className="max-h-[60vh] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-muted/90 backdrop-blur">
                    <tr className="border-b border-border/70 text-left">
                      <th className="px-4 py-3 font-bengali text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("ক্রম", "SL")}</th>
                      <th className="px-4 py-3 font-bengali text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("স্টুডেন্ট আইডি", "Student ID")}</th>
                      <th className="px-4 py-3 font-bengali text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("নাম", "Name")}</th>
                      <th className="px-4 py-3 font-bengali text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("অভিভাবক", "Guardian")}</th>
                      <th className="px-4 py-3 font-bengali text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("সেকশন", "Section")}</th>
                      <th className="px-4 py-3 font-bengali text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("রোল", "Roll")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewStudents.map((student, index) => (
                      <tr key={student.studentId || student.id} className="border-b border-border/60 bg-background/80">
                        <td className="px-4 py-3 font-bengali text-sm text-foreground">{index + 1}</td>
                        <td className="px-4 py-3 font-bengali text-sm text-foreground">{student.studentId || "-"}</td>
                        <td className="px-4 py-3 font-bengali text-sm font-semibold text-foreground">{student.studentName || "-"}</td>
                        <td className="px-4 py-3 font-bengali text-sm text-foreground">{student.guardianName || "-"}</td>
                        <td className="px-4 py-3 font-bengali text-sm text-foreground">{student.section || "-"}</td>
                        <td className="px-4 py-3 font-bengali text-sm text-foreground">{student.roll ? String(student.roll) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl font-bengali"
              onClick={() => classListPreview && printClassStudents(classListPreview)}
              disabled={!classListPreview || previewStudents.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              {t("প্রিন্ট", "Print")}
            </Button>
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setClassListPreview("")}>
              {t("বন্ধ করুন", "Close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewingStudent)} onOpenChange={(open) => !open && setViewingStudent(null)}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">
              {t("শিক্ষার্থীর বিস্তারিত", "Student details")}
            </DialogTitle>
            <DialogDescription className="font-bengali text-sm leading-6">
              {t("কার্ডের সব তথ্য এখানে পরিষ্কারভাবে দেখা যাবে।", "All student information appears here in a cleaner layout.")}
            </DialogDescription>
          </DialogHeader>

          {viewingStudent ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: t("স্টুডেন্ট আইডি", "Student ID"), value: viewingStudent.studentId || "-" },
                { label: t("নাম", "Name"), value: viewingStudent.studentName || "-" },
                { label: t("অভিভাবকের নাম", "Guardian name"), value: viewingStudent.guardianName || "-" },
                { label: t("অভিভাবকের ফোন", "Guardian phone"), value: viewingStudent.guardianPhone || "-" },
                { label: t("শ্রেণি", "Class"), value: viewingStudent.className || "-" },
                { label: t("সেকশন", "Section"), value: viewingStudent.section || "-" },
                { label: t("রোল", "Roll"), value: viewingStudent.roll ? String(viewingStudent.roll) : "-" },
                { label: t("মাসিক ফি", "Monthly fee"), value: viewingStudent.monthlyFee ? String(viewingStudent.monthlyFee) : "-" },
                { label: t("গার্ডিয়ান UID", "Guardian UID"), value: viewingStudent.guardianUid || "-" },
                { label: t("স্ট্যাটাস", "Status"), value: viewingStudent.status || "-" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-border/70 bg-muted/20 p-4">
                  <p className="font-bengali text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 font-bengali text-base font-semibold text-foreground break-words">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setViewingStudent(null)}>
              {t("বন্ধ করুন", "Close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingStudent)}
        onOpenChange={(open) => !open && !savingStudent && setEditingStudent(null)}
      >
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">
              {t("শিক্ষার্থীর তথ্য সম্পাদনা", "Edit student information")}
            </DialogTitle>
            <DialogDescription className="font-bengali text-sm leading-6">
              {t(
                "স্টুডেন্ট আইডি অপরিবর্তিত থাকবে। নাম, শ্রেণি, সেকশন, রোল, ফি ও অভিভাবকের তথ্য আপডেট করা যাবে।",
                "Student ID stays unchanged. You can update name, class, section, roll, fee, and guardian information.",
              )}
            </DialogDescription>
          </DialogHeader>

          {editingStudent ? (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setSavingStudent(true);
                try {
                  await onUpdate({
                    ...editingStudent,
                    studentName: studentForm.studentName.trim(),
                    className: studentForm.className.trim(),
                    section: studentForm.section.trim(),
                    roll: Number(studentForm.roll || 0),
                    monthlyFee: Number(studentForm.monthlyFee || 0),
                    guardianName: studentForm.guardianName.trim(),
                    guardianPhone: studentForm.guardianPhone.trim(),
                    status: editingStudent.status || "active",
                  });
                  setEditingStudent(null);
                } finally {
                  setSavingStudent(false);
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("স্টুডেন্ট আইডি", "Student ID")}>
                  <Input value={editingStudent.studentId} className="rounded-2xl" disabled />
                </Field>
                <Field label={t("গার্ডিয়ান UID", "Guardian UID")}>
                  <Input value={editingStudent.guardianUid || ""} className="rounded-2xl" disabled />
                </Field>
                <Field label={t("নাম", "Name")}>
                  <Input
                    value={studentForm.studentName}
                    onChange={(event) => setStudentForm((current) => ({ ...current, studentName: event.target.value }))}
                    className="rounded-2xl"
                    required
                  />
                </Field>
                <Field label={t("অভিভাবকের নাম", "Guardian name")}>
                  <Input
                    value={studentForm.guardianName}
                    onChange={(event) => setStudentForm((current) => ({ ...current, guardianName: event.target.value }))}
                    className="rounded-2xl"
                  />
                </Field>
                <Field label={t("শ্রেণি", "Class")}>
                  <Input
                    value={studentForm.className}
                    onChange={(event) => setStudentForm((current) => ({ ...current, className: event.target.value }))}
                    className="rounded-2xl"
                    required
                  />
                </Field>
                <Field label={t("সেকশন", "Section")}>
                  <Input
                    value={studentForm.section}
                    onChange={(event) => setStudentForm((current) => ({ ...current, section: event.target.value }))}
                    className="rounded-2xl"
                  />
                </Field>
                <Field label={t("রোল", "Roll")}>
                  <Input
                    type="number"
                    min="0"
                    value={studentForm.roll}
                    onChange={(event) => setStudentForm((current) => ({ ...current, roll: event.target.value }))}
                    className="rounded-2xl"
                  />
                </Field>
                <Field label={t("মাসিক ফি", "Monthly fee")}>
                  <Input
                    type="number"
                    min="0"
                    value={studentForm.monthlyFee}
                    onChange={(event) => setStudentForm((current) => ({ ...current, monthlyFee: event.target.value }))}
                    className="rounded-2xl"
                  />
                </Field>
                <Field label={t("অভিভাবকের ফোন", "Guardian phone")}>
                  <Input
                    value={studentForm.guardianPhone}
                    onChange={(event) => setStudentForm((current) => ({ ...current, guardianPhone: event.target.value }))}
                    className="rounded-2xl md:col-span-2"
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl font-bengali"
                  disabled={savingStudent}
                  onClick={() => setEditingStudent(null)}
                >
                  {t("বাতিল", "Cancel")}
                </Button>
                <Button type="submit" className="rounded-2xl font-bengali" disabled={savingStudent}>
                  {savingStudent ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save")}
                </Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedStudent)} onOpenChange={(open) => !open && !deletingId && setSelectedStudent(null)}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">
              {t("শিক্ষার্থী মুছে ফেলবেন?", "Delete this student?")}
            </DialogTitle>
            <DialogDescription className="font-bengali text-sm leading-6">
              {selectedStudent
                ? t(
                    `এই অ্যাকশনটি ${selectedStudent.studentName} এর related attendance, fees, guardian requests, results, admission fallback এবং linked student data মুছে ফেলবে।`,
                    `This action will remove ${selectedStudent.studentName}'s related attendance, fees, guardian requests, results, admission fallback, and linked student data.`,
                  )
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent ? (
            <div className="rounded-3xl border border-red-200/70 bg-red-50/70 p-4">
              <p className="font-bengali text-sm text-red-700">
                {t(
                  "সতর্কতা: guardian login document-ও মুছে ফেলার চেষ্টা করা হবে যদি এই guardian-এর আর কোনো শিক্ষার্থী না থাকে।",
                  "Warning: the guardian login document will also be removed if this guardian has no other students.",
                )}
              </p>
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl font-bengali"
              disabled={Boolean(deletingId)}
              onClick={() => setSelectedStudent(null)}
            >
              {t("বাতিল", "Cancel")}
            </Button>
            <Button
              type="button"
              className="rounded-2xl bg-red-600 font-bengali text-white hover:bg-red-700"
              disabled={!selectedStudent || Boolean(deletingId)}
              onClick={async () => {
                if (!selectedStudent) return;
                setDeletingId(selectedStudent.studentId);
                try {
                  await onDelete(selectedStudent);
                  setSelectedStudent(null);
                } finally {
                  setDeletingId("");
                }
              }}
            >
              {deletingId ? t("মুছে ফেলা হচ্ছে...", "Deleting...") : t("ডিলিট করুন", "Delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const MobileNotificationsPage = ({
  items,
  students,
  onCreate,
  onDelete,
}: {
  items: MobileAppNotification[];
  students: StudentRecord[];
  onCreate: (payload: Omit<MobileAppNotification, "id" | "createdAt" | "createdBy">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [error, setError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [draft, setDraft] = useState<{
    titleBn: string;
    titleEn: string;
    messageBn: string;
    messageEn: string;
    audience: MobileNotificationAudience;
    guardianUid: string;
    guardianName: string;
    studentId: string;
    className: string;
    section: string;
  }>({
    titleBn: "",
    titleEn: "",
    messageBn: "",
    messageEn: "",
    audience: "all",
    guardianUid: "",
    guardianName: "",
    studentId: "",
    className: "",
    section: "",
  });

  const targetableStudents = useMemo(
    () =>
      students
        .filter((item) => item.guardianUid.trim())
        .sort(
          (a, b) =>
            a.studentId.localeCompare(b.studentId) ||
            a.studentName.localeCompare(b.studentName) ||
            (a.guardianName || "").localeCompare(b.guardianName || ""),
        ),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) {
      return targetableStudents.slice(0, 8);
    }

    return targetableStudents
      .filter((item) =>
        [
          item.studentId,
          item.studentName,
          item.guardianName || "",
          item.className,
          item.section,
        ].some((value) => value.toLowerCase().includes(term)),
      )
      .slice(0, 8);
  }, [studentSearch, targetableStudents]);

  const audienceLabel = (item: MobileAppNotification) => {
    if (item.audience === "boys") return t("শুধু বালক শাখা", "Boys campus only");
    if (item.audience === "girls") return t("শুধু বালিকা শাখা", "Girls campus only");
    if (item.audience === "guardian") {
      return item.studentId
        ? `${item.studentId} • ${item.guardianName || t("কাস্টম গার্ডিয়ান", "Custom guardian")}`
        : item.guardianName || t("কাস্টম গার্ডিয়ান", "Custom guardian");
    }
    if (item.audience === "class-section") {
      const classLabel = item.className || t("সব শ্রেণি", "All classes");
      const sectionLabel = item.section || t("সব সেকশন", "All sections");
      return `${classLabel} • ${sectionLabel}`;
    }
    return t("সব গার্ডিয়ান", "All guardians");
  };

  const getValidationError = () => {
    if (!draft.titleBn.trim() && !draft.titleEn.trim()) {
      return t("একটি শিরোনাম লিখুন", "Enter a title");
    }

    if (!draft.messageBn.trim() && !draft.messageEn.trim()) {
      return t("একটি বার্তা লিখুন", "Enter a message");
    }

    if (draft.audience === "guardian" && !draft.guardianUid.trim()) {
      return t("স্টুডেন্ট আইডি দিয়ে একজন গার্ডিয়ান নির্বাচন করুন", "Select a guardian using the student ID search");
    }

    if (draft.audience === "class-section" && !draft.className.trim()) {
      return t("নির্দিষ্ট শ্রেণির জন্য ক্লাসের নাম দিন", "Enter a class name for targeted delivery");
    }

    return "";
  };

  const previewToast = () => {
    const nextError = getValidationError();
    if (nextError) {
      setError(nextError);
      toast.error(nextError);
      return;
    }

    setError("");

    const title = draft.titleBn.trim() || draft.titleEn.trim();
    const message = draft.messageBn.trim() || draft.messageEn.trim();
    const audienceText =
      draft.audience === "boys"
        ? t("শুধু বালক শাখা", "Boys campus only")
        : draft.audience === "girls"
          ? t("শুধু বালিকা শাখা", "Girls campus only")
          : draft.audience === "guardian"
            ? `${draft.studentId.trim() || t("স্টুডেন্ট আইডি", "Student ID")} • ${draft.guardianName.trim() || t("কাস্টম গার্ডিয়ান", "Custom guardian")}`
          : draft.audience === "class-section"
            ? `${draft.className.trim() || t("সব শ্রেণি", "All classes")} • ${draft.section.trim() || t("সব সেকশন", "All sections")}`
            : t("সব গার্ডিয়ান", "All guardians");

    toast(title, {
      description: `${message} • ${audienceText}`,
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const nextError = getValidationError();
    if (nextError) {
      setError(nextError);
      return;
    }

    setSaving(true);
    try {
      await onCreate({
        titleBn: draft.titleBn,
        titleEn: draft.titleEn,
        messageBn: draft.messageBn,
        messageEn: draft.messageEn,
        audience: draft.audience,
        guardianUid: draft.guardianUid,
        guardianName: draft.guardianName,
        studentId: draft.studentId,
        className: draft.className,
        section: draft.section,
      });
      setDraft({
        titleBn: "",
        titleEn: "",
        messageBn: "",
        messageEn: "",
        audience: "all",
        guardianUid: "",
        guardianName: "",
        studentId: "",
        className: "",
        section: "",
      });
      setStudentSearch("");
      setShowForm(false);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "permission-denied"
          ? t(
              "Firebase permission denied. Firestore rules-এ mobile_app_notifications collection-এ write access দিতে হবে।",
              "Firebase permission denied. Firestore rules must allow writes to the mobile_app_notifications collection.",
            )
          : error instanceof Error
            ? error.message
            : t("নোটিফিকেশন পাঠানো যায়নি", "Failed to send notification");

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleShell
      title={t("মোবাইল অ্যাপ নোটিফিকেশন", "Mobile App Notifications")}
      description={t(
        "গার্ডিয়ান মোবাইল অ্যাপে ইন-অ্যাপ নোটিফিকেশন পাঠান। চাইলে সব গার্ডিয়ান, শুধু বালক/বালিকা শাখা অথবা নির্দিষ্ট শ্রেণি-সেকশনে পাঠাতে পারবেন।",
        "Send in-app notifications to the guardian mobile app. You can target all guardians, only boys or girls campus, or a specific class and section.",
      )}
      actionLabel={showForm ? t("ফর্ম বন্ধ", "Hide form") : t("নোটিফিকেশন পাঠান", "Send notification")}
      onAction={() => {
        setShowForm((current) => !current);
        setError("");
      }}
      icon={<BellRing className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving} submitLabel={t("নোটিফিকেশন পাঠান", "Send notification")}>
          <div className="rounded-3xl border border-amber-200/80 bg-amber-50/80 px-4 py-3">
            <p className="font-bengali text-sm text-amber-900">
              {t(
                "এগুলো guardian app-এর notice screen-এ সাথে সাথে দেখা যাবে। এটি true device push নয়, বরং app-এর ভেতরের live inbox message।",
                "These appear inside the guardian app notice screen. This is not a true device push notification; it works as a live in-app inbox message.",
              )}
            </p>
          </div>

          <BilingualInput
            labelBn="শিরোনাম"
            labelEn="Title"
            valueBn={draft.titleBn}
            valueEn={draft.titleEn}
            onBnChange={(value) => setDraft((current) => ({ ...current, titleBn: value }))}
            onEnChange={(value) => setDraft((current) => ({ ...current, titleEn: value }))}
          />
          <BilingualTextarea
            labelBn="বার্তা"
            labelEn="Message"
            valueBn={draft.messageBn}
            valueEn={draft.messageEn}
            onBnChange={(value) => setDraft((current) => ({ ...current, messageBn: value }))}
            onEnChange={(value) => setDraft((current) => ({ ...current, messageEn: value }))}
          />
          <Field label={t("কাদের কাছে যাবে", "Audience")}>
            <select
              value={draft.audience}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  audience: event.target.value as MobileNotificationAudience,
                  guardianUid: event.target.value === "guardian" ? current.guardianUid : "",
                  guardianName: event.target.value === "guardian" ? current.guardianName : "",
                  studentId: event.target.value === "guardian" ? current.studentId : "",
                  className: event.target.value === "class-section" ? current.className : "",
                  section: event.target.value === "class-section" ? current.section : "",
                }))
              }
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
            >
              <option value="all">{t("সব গার্ডিয়ান", "All guardians")}</option>
              <option value="boys">{t("শুধু বালক শাখা", "Boys campus only")}</option>
              <option value="girls">{t("শুধু বালিকা শাখা", "Girls campus only")}</option>
              <option value="guardian">{t("নির্দিষ্ট গার্ডিয়ান", "Specific guardian")}</option>
              <option value="class-section">{t("নির্দিষ্ট শ্রেণি / সেকশন", "Specific class / section")}</option>
            </select>
          </Field>

          {draft.audience === "guardian" && (
            <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
              <Field label={t("স্টুডেন্ট আইডি দিয়ে খুঁজুন", "Search by student ID")}>
                <Input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  className="rounded-2xl"
                  placeholder={t("যেমন: STD-1023", "Example: STD-1023")}
                />
              </Field>

              {draft.guardianUid ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                  <p className="font-bengali font-semibold text-emerald-900">
                    {draft.guardianName || t("নির্বাচিত গার্ডিয়ান", "Selected guardian")}
                  </p>
                  <p className="font-bengali text-emerald-800">
                    {draft.studentId} • {draft.className || t("শ্রেণি নেই", "No class")} • {draft.section || t("সেকশন নেই", "No section")}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                {filteredStudents.length === 0 ? (
                  <p className="font-bengali text-sm text-muted-foreground">
                    {t("মিলছে এমন কোনো স্টুডেন্ট পাওয়া যায়নি", "No matching student was found")}
                  </p>
                ) : (
                  filteredStudents.map((item) => {
                    const isSelected = draft.guardianUid === item.guardianUid && draft.studentId === item.studentId;

                    return (
                      <button
                        key={`${item.studentId}-${item.guardianUid}`}
                        type="button"
                        onClick={() => {
                          setDraft((current) => ({
                            ...current,
                            guardianUid: item.guardianUid,
                            guardianName: item.guardianName || item.studentName,
                            studentId: item.studentId,
                            className: item.className,
                            section: item.section,
                          }));
                          setError("");
                        }}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <p className="font-bengali text-sm font-semibold text-foreground">
                          {item.studentId} • {item.studentName}
                        </p>
                        <p className="font-bengali text-xs text-muted-foreground">
                          {(item.guardianName || t("গার্ডিয়ান নাম নেই", "No guardian name"))} • {item.className} • {item.section || t("সেকশন নেই", "No section")}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {draft.audience === "class-section" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("শ্রেণি", "Class")}>
                <Input
                  value={draft.className}
                  onChange={(event) => setDraft((current) => ({ ...current, className: event.target.value }))}
                  className="rounded-2xl"
                  placeholder={t("যেমন: Class 4", "Example: Class 4")}
                />
              </Field>
              <Field label={t("সেকশন", "Section")}>
                <Input
                  value={draft.section}
                  onChange={(event) => setDraft((current) => ({ ...current, section: event.target.value }))}
                  className="rounded-2xl"
                  placeholder={t("যেমন: Nurani", "Example: Nurani")}
                />
              </Field>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={previewToast}>
              <Eye className="mr-2 h-4 w-4" />
              {t("টোস্ট প্রিভিউ", "Preview toast")}
            </Button>
          </div>

          {error ? <p className="font-bengali text-sm text-red-600">{error}</p> : null}
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? (
            <EmptyState
              text={t("এখনও কোনো মোবাইল অ্যাপ নোটিফিকেশন পাঠানো হয়নি", "No mobile app notifications have been sent yet")}
            />
          ) : (
            items.map((item) => (
              <ItemCard
                key={item.id}
                title={item.titleBn || item.titleEn || t("শিরোনাম নেই", "Untitled")}
                meta={new Date(item.createdAt).toLocaleString("bn-BD")}
                onDelete={() => void onDelete(item.id)}
                trailing={
                  <Badge variant="secondary" className="rounded-full px-3 py-1 font-bengali">
                    {audienceLabel(item)}
                  </Badge>
                }
              >
                <div className="space-y-2">
                  <p className="font-bengali text-sm text-muted-foreground">
                    {item.messageBn || item.messageEn}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full font-bengali">
                      {t("প্রেরক", "Sender")}: {item.createdBy || t("সিস্টেম", "System")}
                    </Badge>
                    {(item.titleBn || item.titleEn) && item.titleBn !== item.titleEn ? (
                      <Badge variant="outline" className="rounded-full font-bengali">
                        EN: {item.titleEn || item.titleBn}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </ItemCard>
            ))
          )}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const AdmissionsManagerPage = ({
  items,
  onSaveStatus,
  onDelete,
}: {
  items: AdmissionForm[];
  onSaveStatus: (
    item: AdmissionForm,
    status: AdmissionStatus,
    updates?: Partial<Pick<AdmissionForm, "approvedStudentId" | "approvedRoll" | "approvedClass" | "approvedSection" | "approvedMonthlyFee">>,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<AdmissionForm | null>(null);
  const [updatingId, setUpdatingId] = useState("");
  const [approvalItem, setApprovalItem] = useState<AdmissionForm | null>(null);
  const [approvalDraft, setApprovalDraft] = useState({
    studentId: "",
    roll: "",
    className: "",
    section: "",
    monthlyFee: "",
  });

  const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const buildAdmissionSummary = (item: AdmissionForm) =>
    [
      t("আবেদন সারাংশ", "Admission Summary"),
      "--------------------------------",
      `${t("শিক্ষার্থীর নাম", "Student name")}: ${item.studentNameBn || item.studentName}`,
      `${t("নাম (ইংরেজি)", "Name (English)")}: ${item.studentName}`,
      `${t("জন্ম তারিখ", "Birth date")}: ${item.birthDate || "-"}`,
      `${t("লিঙ্গ", "Gender")}: ${item.gender || "-"}`,
      `${t("ধর্ম", "Religion")}: ${item.religion || "-"}`,
      `${t("শ্রেণি", "Class")}: ${item.class || "-"}`,
      `${t("ক্যাম্পাস", "Campus")}: ${item.campus || "-"}`,
      `${t("আসন ধরন", "Seat type")}: ${
        item.residencyType === "residential"
          ? t("আবাসিক", "Residential")
          : item.residencyType === "non-residential"
            ? t("অনাবাসিক", "Non-residential")
            : item.residencyType === "day-care"
              ? t("ডে-কেয়ার", "Day care")
              : "-"
      }`,
      "",
      `${t("পিতার নাম", "Father's name")}: ${item.fatherNameBn || item.fatherName}`,
      `${t("পিতার ফোন", "Father's phone")}: ${item.fatherPhone || "-"}`,
      `${t("মাতার নাম", "Mother's name")}: ${item.motherNameBn || item.motherName}`,
      `${t("মাতার ফোন", "Mother's phone")}: ${item.motherPhone || "-"}`,
      "",
      `${t("বর্তমান ঠিকানা", "Present address")}: ${item.presentAddressBn || item.presentAddress || "-"}`,
      `${t("স্থায়ী ঠিকানা", "Permanent address")}: ${item.permanentAddressBn || item.permanentAddress || "-"}`,
      "",
      `${t("সাক্ষাৎপ্রার্থী / রেফারেন্স", "Interview candidate / references")}:`,
      ...(item.interviewReferences?.length
        ? item.interviewReferences.map(
            (reference, index) =>
              `${index + 1}. ${reference.name || "-"} • ${reference.relation || "-"} • ${reference.mobile || "-"}`,
          )
        : ["-"]),
      "",
      `${t("স্ট্যাটাস", "Status")}: ${item.status}`,
      ...(item.status === "approved"
        ? [
            `${t("স্টুডেন্ট আইডি", "Student ID")}: ${item.approvedStudentId || "-"}`,
            `${t("রোল", "Roll")}: ${item.approvedRoll ? String(item.approvedRoll) : "-"}`,
            `${t("ক্লাস", "Class")}: ${item.approvedClass || "-"}`,
            `${t("সেকশন", "Section")}: ${item.approvedSection || "-"}`,
            `${t("মাসিক ফি", "Monthly fee")}: ${item.approvedMonthlyFee ? formatCurrency(item.approvedMonthlyFee) : "-"}`,
          ]
        : []),
      `${t("জমার সময়", "Submitted at")}: ${new Date(item.createdAt).toLocaleString("bn-BD")}`,
    ].join("\n");

  const buildAdmissionPrintHtml = (item: AdmissionForm) => {
    const studentName = item.studentNameBn || item.studentName || "-";
    const fatherName = item.fatherNameBn || item.fatherName || "-";
    const motherName = item.motherNameBn || item.motherName || "-";
    const presentAddress = item.presentAddressBn || item.presentAddress || "-";
    const permanentAddress = item.permanentAddressBn || item.permanentAddress || "-";
    const residencyTypeLabel =
      item.residencyType === "residential"
        ? t("আবাসিক", "Residential")
        : item.residencyType === "non-residential"
          ? t("অনাবাসিক", "Non-residential")
          : item.residencyType === "day-care"
            ? t("ডে-কেয়ার", "Day care")
            : "-";
    const rawApplicationDigits = `${item.id ?? ""}`.replace(/\D/g, "");
    const applicationNo = (rawApplicationDigits || String(item.createdAt)).slice(-8);
    const serialNo = String(new Date(item.createdAt).getTime()).slice(-6);
    const submittedAt = new Date(item.createdAt).toLocaleString("bn-BD");
    const ruleItems = [
      t("আবেদন ফর্মে প্রদত্ত সকল তথ্য সঠিক ও যাচাইযোগ্য হতে হবে।", "All information in the application form must be accurate and verifiable."),
      t("প্রয়োজনীয় কাগজপত্র অফিসে জমা দেওয়ার পরই ভর্তি প্রক্রিয়া সম্পন্ন বলে গণ্য হবে।", "The admission process will be considered complete only after required documents are submitted to the office."),
      t("শৃঙ্খলা, ফি, এবং প্রতিষ্ঠানের নিয়মাবলি মেনে চলা বাধ্যতামূলক।", "Compliance with discipline, fees, and institutional rules is mandatory."),
      t("ভর্তি সংক্রান্ত চূড়ান্ত সিদ্ধান্ত কর্তৃপক্ষের বিবেচনার উপর নির্ভরশীল।", "The final admission decision depends on the authority's review."),
      t("প্রয়োজনে অভিভাবকের সাথে দ্রুত যোগাযোগের জন্য মোবাইল নম্বর সচল রাখতে হবে।", "Guardians must keep their mobile numbers active for urgent communication."),
      t("অফিস যাচাই ছাড়া কোনো তথ্য চূড়ান্ত বলে গণ্য হবে না।", "No information will be considered final without office verification."),
    ];
    const photoMarkup = item.imageUrl
      ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(studentName)}" class="photo" />`
      : `<div class="photo photo-placeholder">${escapeHtml(t("ছবি", "Photo"))}</div>`;

    return `
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${escapeHtml(studentName)} - ${escapeHtml(t("ভর্তি আবেদন", "Admission Application"))}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 5mm;
            }
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #dbe8b7;
              color: #16332b;
              font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              max-width: 210mm;
              margin: 18px auto;
              background: #fffdf8;
              border: 1px solid #8bc6e8;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 18px 40px rgba(22, 51, 43, 0.08);
              position: relative;
              page-break-after: always;
            }
            .page:last-child { page-break-after: auto; }
            .top-band {
              height: 11mm;
              background: linear-gradient(180deg, #0d89cc 0%, #0a6eab 100%);
            }
            .top-band.light {
              background: linear-gradient(180deg, #d6f0ff 0%, #bfe4fb 100%);
            }
            .header {
              padding: 11px 18px 10px;
              background: linear-gradient(180deg, #f6fcff 0%, #ebf7fe 100%);
              color: #0d3f66;
              border-bottom: 1px solid #8bc6e8;
            }
            .header-top {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .logo {
              width: 62px;
              height: 62px;
              border-radius: 14px;
              background: #ffffff;
              border: 1px solid #8bc6e8;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              flex-shrink: 0;
            }
            .logo img {
              width: 48px;
              height: 48px;
              object-fit: contain;
            }
            .header h1 {
              margin: 0;
              font-size: 22px;
              line-height: 1.25;
              font-weight: 700;
            }
            .header p {
              margin: 4px 0 0;
              font-size: 12px;
              color: #48718c;
            }
            .subhead {
              margin-top: 14px;
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .subhead-grid {
              margin-top: 12px;
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px;
            }
            .chip {
              border: 1px solid #8bc6e8;
              border-radius: 999px;
              padding: 6px 12px;
              font-size: 12px;
              background: #fafdff;
            }
            .chip-box {
              border: 1px solid #8bc6e8;
              border-radius: 14px;
              padding: 8px 10px;
              background: #fafdff;
            }
            .chip-box small {
              display: block;
              font-size: 10px;
              color: #48718c;
              margin-bottom: 3px;
            }
            .chip-box strong {
              font-size: 13px;
            }
            .content {
              padding: 12px 18px 14px;
            }
            .hero {
              display: grid;
              grid-template-columns: minmax(0, 1fr) 136px;
              gap: 14px;
              align-items: start;
              margin-bottom: 14px;
            }
            .hero-card {
              border: 1px solid #cfe8f4;
              border-radius: 12px;
              background: rgba(255,255,255,0.95);
              padding: 12px 14px;
            }
            .hero-card h2 {
              margin: 0 0 8px;
              font-size: 21px;
              line-height: 1.2;
            }
            .hero-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 6px 10px;
            }
            .field small {
              display: block;
              color: #7a6b52;
              font-size: 11px;
              margin-bottom: 2px;
            }
            .field strong {
              font-size: 13px;
              line-height: 1.35;
            }
            .photo {
              width: 136px;
              height: 164px;
              border-radius: 10px;
              border: 1px solid #8bc6e8;
              background: #f4fbff;
              object-fit: cover;
            }
            .photo-placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              color: #7a6b52;
              font-size: 14px;
              text-align: center;
              padding: 16px;
            }
            .section-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            }
            .section {
              border: 1px solid #cfe8f4;
              border-radius: 12px;
              background: rgba(255,255,255,0.95);
              padding: 12px 14px;
            }
            .section h3 {
              margin: 0 0 8px;
              font-size: 16px;
              color: #0f4f3d;
            }
            .row {
              display: flex;
              gap: 8px;
              margin-bottom: 6px;
              line-height: 1.35;
            }
            .row:last-child {
              margin-bottom: 0;
            }
            .label {
              min-width: 102px;
              color: #7a6b52;
              font-size: 12px;
            }
            .value {
              font-size: 12px;
              color: #16332b;
              font-weight: 600;
              word-break: break-word;
            }
            .section-full {
              margin-top: 10px;
            }
            .reference-box {
              margin-top: 8px;
              border: 1px solid #cfe8f4;
              border-radius: 12px;
              background: rgba(255,255,255,0.95);
              padding: 10px 12px;
            }
            .reference-box h3 {
              margin: 0 0 8px;
              font-size: 15px;
              color: #0f4f3d;
            }
            .reference-header,
            .reference-row {
              display: grid;
              grid-template-columns: 1.3fr 0.9fr 1fr;
              gap: 10px;
              align-items: end;
            }
            .reference-header {
              margin-bottom: 4px;
              color: #7a6b52;
              font-size: 10px;
            }
            .reference-row {
              margin-bottom: 6px;
            }
            .reference-row:last-child {
              margin-bottom: 0;
            }
            .reference-line {
              min-height: 18px;
              border-bottom: 1px solid #b8a57f;
            }
            .bottom-grid {
              margin-top: 10px;
              display: grid;
              grid-template-columns: 1.15fr 0.85fr;
              gap: 10px;
              align-items: start;
            }
            .footer-note {
              margin-top: 10px;
              border-top: 1px dashed #d7c9a8;
              padding-top: 8px;
              color: #7a6b52;
              font-size: 11px;
              line-height: 1.35;
            }
            .office-box {
              margin-top: 10px;
              border: 1.5px dashed #8bbbd6;
              border-radius: 12px;
              background: #fbfeff;
              padding: 11px 14px;
            }
            .office-box h3 {
              margin: 0 0 8px;
              font-size: 15px;
              color: #0f4f3d;
            }
            .office-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px 12px;
            }
            .office-field {
              border-bottom: 1px dashed #ccb98e;
              min-height: 24px;
              padding-bottom: 2px;
            }
            .office-field small {
              display: block;
              font-size: 10px;
              color: #7a6b52;
              margin-bottom: 4px;
            }
            .signature-row {
              margin-top: 12px;
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 12px;
            }
            .signature-box {
              padding-top: 18px;
              border-top: 1.5px solid #8f7c54;
              text-align: center;
              font-size: 11px;
              color: #5e5135;
            }
            .rule-box {
              margin-top: 10px;
              border: 1px solid #8bc6e8;
              border-radius: 12px;
              background: #fbfeff;
              padding: 10px 14px;
            }
            .rule-box h3 {
              margin: 0 0 8px;
              font-size: 15px;
              color: #0f4f7b;
            }
            .rule-list {
              margin: 0;
              padding-left: 18px;
              line-height: 1.4;
              font-size: 11px;
              color: #294b5d;
            }
            .footer-band {
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              height: 10mm;
              background: linear-gradient(180deg, #0d89cc 0%, #0a6eab 100%);
            }
            @media print {
              body { background: rgba(255,255,255,0.95); }
              .page {
                margin: 0;
                width: 100%;
                min-height: 287mm;
                max-width: 100%;
                border: none;
                border-radius: 0;
                box-shadow: none;
              }
            }
            @media screen and (max-width: 720px) {
              .hero,
              .section-grid,
              .reference-header,
              .reference-row,
              .bottom-grid,
              .office-grid,
              .signature-row,
              .subhead-grid {
                grid-template-columns: 1fr;
              }
              .photo {
                width: 100%;
                max-width: 220px;
              }
              .hero-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="top-band"></div>
            <div class="header">
              <div class="header-top">
                <div class="logo">
                  <img src="/site-logo.png" alt="Site logo" />
                </div>
                <div>
                  <h1>${escapeHtml(t("আননূর শিক্ষা পরিবার ভর্তি আবেদন ফর্ম", "Annoor Education Family Admission Form"))}</h1>
                  <p>${escapeHtml(t("সঠিক তথ্য যাচাই করে অফিস কপির জন্য সংরক্ষণ করুন", "Verify the information and keep this as the office copy"))}</p>
                </div>
              </div>
              <div class="subhead">
                <span class="chip">${escapeHtml(t("আবেদনের অবস্থা", "Application status"))}: ${escapeHtml(item.status)}</span>
                <span class="chip">${escapeHtml(t("জমার সময়", "Submitted at"))}: ${escapeHtml(submittedAt)}</span>
                <span class="chip">${escapeHtml(t("আসন ধরন", "Seat type"))}: ${escapeHtml(residencyTypeLabel)}</span>
              </div>
              <div class="subhead-grid">
                <div class="chip-box">
                  <small>${escapeHtml(t("সিরিয়াল নং", "Serial no"))}</small>
                  <strong>${escapeHtml(serialNo)}</strong>
                </div>
                <div class="chip-box">
                  <small>${escapeHtml(t("অ্যাপ্লিকেশন নং", "Application no"))}</small>
                  <strong>${escapeHtml(applicationNo)}</strong>
                </div>
              </div>
            </div>
            <div class="content">
              <div class="hero">
                <div class="hero-card">
                  <h2>${escapeHtml(studentName)}</h2>
                  <div class="hero-grid">
                    <div class="field">
                      <small>${escapeHtml(t("নাম (ইংরেজি)", "Name (English)"))}</small>
                      <strong>${escapeHtml(item.studentName || "-")}</strong>
                    </div>
                    <div class="field">
                      <small>${escapeHtml(t("শ্রেণি", "Class"))}</small>
                      <strong>${escapeHtml(item.class || "-")}</strong>
                    </div>
                    <div class="field">
                      <small>${escapeHtml(t("ক্যাম্পাস", "Campus"))}</small>
                      <strong>${escapeHtml(item.campus || "-")}</strong>
                    </div>
                    <div class="field">
                      <small>${escapeHtml(t("জন্ম তারিখ", "Birth date"))}</small>
                      <strong>${escapeHtml(item.birthDate || "-")}</strong>
                    </div>
                  </div>
                </div>
                <div>${photoMarkup}</div>
              </div>

              <div class="section-grid">
                <div class="section">
                  <h3>${escapeHtml(t("শিক্ষার্থীর তথ্য", "Student information"))}</h3>
                  <div class="row"><span class="label">${escapeHtml(t("লিঙ্গ", "Gender"))}</span><span class="value">${escapeHtml(item.gender || "-")}</span></div>
                  <div class="row"><span class="label">${escapeHtml(t("ধর্ম", "Religion"))}</span><span class="value">${escapeHtml(item.religion || "-")}</span></div>
                  <div class="row"><span class="label">${escapeHtml(t("শ্রেণি", "Class"))}</span><span class="value">${escapeHtml(item.class || "-")}</span></div>
                  <div class="row"><span class="label">${escapeHtml(t("ক্যাম্পাস", "Campus"))}</span><span class="value">${escapeHtml(item.campus || "-")}</span></div>
                </div>
                <div class="section">
                  <h3>${escapeHtml(t("অভিভাবকের তথ্য", "Guardian information"))}</h3>
                  <div class="row"><span class="label">${escapeHtml(t("পিতার নাম", "Father's name"))}</span><span class="value">${escapeHtml(fatherName)}</span></div>
                  <div class="row"><span class="label">${escapeHtml(t("পিতার ফোন", "Father's phone"))}</span><span class="value">${escapeHtml(item.fatherPhone || "-")}</span></div>
                  <div class="row"><span class="label">${escapeHtml(t("মাতার নাম", "Mother's name"))}</span><span class="value">${escapeHtml(motherName)}</span></div>
                  <div class="row"><span class="label">${escapeHtml(t("মাতার ফোন", "Mother's phone"))}</span><span class="value">${escapeHtml(item.motherPhone || "-")}</span></div>
                </div>
              </div>

              <div class="section section-full">
                <h3>${escapeHtml(t("ঠিকানা", "Address"))}</h3>
                <div class="row"><span class="label">${escapeHtml(t("বর্তমান ঠিকানা", "Present address"))}</span><span class="value">${escapeHtml(presentAddress)}</span></div>
                <div class="row"><span class="label">${escapeHtml(t("স্থায়ী ঠিকানা", "Permanent address"))}</span><span class="value">${escapeHtml(permanentAddress)}</span></div>
              </div>

              <div class="reference-box">
                <h3>${escapeHtml(t("অভিভাবক/সাক্ষাৎপ্রার্থী তথ্য", "Guardian / Reference details"))}</h3>
                <div class="reference-header">
                  <span>${escapeHtml(t("নাম", "Name"))}</span>
                  <span>${escapeHtml(t("সম্পর্ক", "Relation"))}</span>
                  <span>${escapeHtml(t("মোবাইল", "Mobile"))}</span>
                </div>
                ${(item.interviewReferences?.length ? item.interviewReferences : Array.from({ length: 3 }, () => ({ name: "", relation: "", mobile: "" })))
                  .slice(0, 3)
                  .map(
                    (reference) => `
                      <div class="reference-row">
                        <span class="reference-line">${escapeHtml(reference.name || "")}</span>
                        <span class="reference-line">${escapeHtml(reference.relation || "")}</span>
                        <span class="reference-line">${escapeHtml(reference.mobile || "")}</span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>

              <div class="bottom-grid">
                <div>
                  <div class="rule-box">
                    <h3>${escapeHtml(t("নির্দেশনা", "Instructions"))}</h3>
                    <ol class="rule-list">
                      ${ruleItems.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}
                    </ol>
                  </div>
                  <div class="footer-note">
                    ${escapeHtml(t("অভিভাবক ও আবেদনকারী উপরের তথ্য ও শর্তাবলি ভালোভাবে পড়ে অফিস কপিতে প্রয়োজনীয় স্বাক্ষর সম্পন্ন করবেন।", "Guardians and applicants should read the above information and complete the required signatures on the office copy."))}
                  </div>
                </div>
                <div class="office-box">
                  <h3>${escapeHtml(t("অফিস ব্যবহারের জন্য", "Office use only"))}</h3>
                  <div class="office-grid">
                    <div class="office-field"><small>${escapeHtml(t("ভর্তি যোগ্যতা যাচাই", "Eligibility check"))}</small></div>
                    <div class="office-field"><small>${escapeHtml(t("ডকুমেন্ট যাচাই", "Document verification"))}</small></div>
                    <div class="office-field"><small>${escapeHtml(t("শ্রেণি নিশ্চিতকরণ", "Class confirmation"))}</small></div>
                    <div class="office-field"><small>${escapeHtml(t("ফি/রসিদ নোট", "Fee/receipt note"))}</small></div>
                    <div class="office-field"><small>${escapeHtml(t("মন্তব্য", "Remarks"))}</small></div>
                    <div class="office-field"><small>${escapeHtml(t("চূড়ান্ত সিদ্ধান্ত", "Final decision"))}</small></div>
                  </div>
                  <div class="signature-row">
                    <div class="signature-box">${escapeHtml(t("প্রস্তুতকারীর স্বাক্ষর", "Prepared by"))}</div>
                    <div class="signature-box">${escapeHtml(t("যাচাইকারীর স্বাক্ষর", "Verified by"))}</div>
                    <div class="signature-box">${escapeHtml(t("অনুমোদনকারীর স্বাক্ষর", "Approved by"))}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer-band"></div>
          </div>
        </body>
      </html>
    `;
  };

  const selectedSummary = useMemo(() => (selectedItem ? buildAdmissionSummary(selectedItem) : ""), [selectedItem]);

  const statusMeta: Record<AdmissionStatus, { labelBn: string; labelEn: string; className: string }> = {
    pending: {
      labelBn: "পেন্ডিং",
      labelEn: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    approved: {
      labelBn: "অনুমোদিত",
      labelEn: "Approved",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    rejected: {
      labelBn: "রিজেক্টেড",
      labelEn: "Rejected",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    },
  };

  const getStatusLabel = (status: AdmissionStatus) => {
    const meta = statusMeta[status];
    return t(meta.labelBn, meta.labelEn);
  };

  const openApprovalDialog = (item: AdmissionForm) => {
    setApprovalItem(item);
    setApprovalDraft({
      studentId: item.approvedStudentId || item.id || "",
      roll: item.approvedRoll ? String(item.approvedRoll) : "",
      className: item.approvedClass || item.class || "",
      section: item.approvedSection || "",
      monthlyFee: item.approvedMonthlyFee ? String(item.approvedMonthlyFee) : "",
    });
  };

  const handleStatusChange = async (item: AdmissionForm, nextValue: string) => {
    if (!item.id) return;

    if (nextValue === "approved") {
      openApprovalDialog(item);
      return;
    }

    const nextStatus = nextValue as AdmissionStatus;
    if (nextStatus === item.status) return;

    setUpdatingId(item.id);
    try {
      await onSaveStatus(item, nextStatus);
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...selectedItem, status: nextStatus });
      }
    } finally {
      setUpdatingId("");
    }
  };

  const submitApproval = async () => {
    if (!approvalItem?.id) return;

    const studentId = approvalDraft.studentId.trim();
    const className = approvalDraft.className.trim();
    const section = approvalDraft.section.trim();
    const roll = Number(approvalDraft.roll);
    const monthlyFee = Number(approvalDraft.monthlyFee);

    if (
      !studentId ||
      !className ||
      !section ||
      !approvalDraft.roll.trim() ||
      !approvalDraft.monthlyFee.trim() ||
      Number.isNaN(roll) ||
      Number.isNaN(monthlyFee)
    ) {
      toast.error(t("স্টুডেন্ট আইডি, রোল, ক্লাস, সেকশন এবং মাসিক ফি পূরণ করুন", "Fill in student ID, roll, class, section, and monthly fee"));
      return;
    }

    setUpdatingId(approvalItem.id);
    try {
      await onSaveStatus(approvalItem, "approved", {
        approvedStudentId: studentId,
        approvedRoll: roll,
        approvedClass: className,
        approvedSection: section,
        approvedMonthlyFee: monthlyFee,
      });

      if (selectedItem?.id === approvalItem.id) {
        setSelectedItem({
          ...selectedItem,
          status: "approved",
          approvedStudentId: studentId,
          approvedRoll: roll,
          approvedClass: className,
          approvedSection: section,
          approvedMonthlyFee: monthlyFee,
        });
      }

      setApprovalItem(null);
    } finally {
      setUpdatingId("");
    }
  };

  const downloadSummary = (item: AdmissionForm) => {
    const blob = new Blob([buildAdmissionPrintHtml(item)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(item.studentName || "admission").replace(/\s+/g, "-").toLowerCase()}-form.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printSummary = (item: AdmissionForm) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(buildAdmissionPrintHtml(item));
    printWindow.document.close();
    const runPrint = () => {
      printWindow.focus();
      printWindow.print();
    };

    if ("fonts" in printWindow.document) {
      void (printWindow.document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(() => {
        printWindow.addEventListener("load", () => setTimeout(runPrint, 250), { once: true });
        setTimeout(runPrint, 600);
      });
    } else {
      printWindow.addEventListener("load", () => setTimeout(runPrint, 250), { once: true });
      setTimeout(runPrint, 600);
    }
  };

  return (
    <ModuleShell
      title={t("ভর্তি আবেদন", "Admissions")}
      description={t("অনলাইন ভর্তি আবেদনগুলো পর্যালোচনা, যাচাই এবং প্রয়োজন হলে মুছে ফেলুন", "Review, verify, and remove incoming online admission applications")}
      icon={<Users className="h-5 w-5" />}
    >
      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো আবেদন জমা পড়েনি", "No applications yet")} /> : items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.studentNameBn || item.studentName}
              meta={`${item.class} • ${item.campus}`}
              onDelete={() => item.id && void onDelete(item.id)}
              trailing={
                <>
                  <select
                    value={item.status}
                    disabled={!item.id || updatingId === item.id}
                    onChange={(event) => void handleStatusChange(item, event.target.value)}
                    className="h-9 rounded-2xl border border-input bg-background px-3 text-sm outline-none"
                  >
                    <option value="pending">{t("পেন্ডিং", "Pending")}</option>
                    <option value="approved">{t("অনুমোদিত", "Approved")}</option>
                    <option value="rejected">{t("রিজেক্টেড", "Rejected")}</option>
                  </select>
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setSelectedItem(item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t("ভিউ", "View")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => downloadSummary(item)}>
                    <Download className="mr-2 h-4 w-4" />
                    {t("ডাউনলোড", "Download")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => printSummary(item)}>
                    <Printer className="mr-2 h-4 w-4" />
                    {t("প্রিন্ট", "Print")}
                  </Button>
                </>
              }
            >
              <div className="space-y-3 font-bengali text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`rounded-full ${statusMeta[item.status].className}`}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  {item.status === "approved" && item.approvedStudentId ? (
                    <Badge variant="secondary" className="rounded-full">
                      {t("স্টুডেন্ট আইডি", "Student ID")}: {item.approvedStudentId}
                    </Badge>
                  ) : null}
                  {item.status === "approved" && item.approvedMonthlyFee ? (
                    <Badge variant="secondary" className="rounded-full">
                      {t("মাসিক ফি", "Monthly fee")}: {formatCurrency(item.approvedMonthlyFee)}
                    </Badge>
                  ) : null}
                </div>
                <p>{t("পিতা", "Father")}: {item.fatherNameBn || item.fatherName} • {item.fatherPhone}</p>
                <p>{t("মাতা", "Mother")}: {item.motherNameBn || item.motherName} • {item.motherPhone}</p>
                <p>{t("ঠিকানা", "Address")}: {item.presentAddressBn || item.presentAddress}</p>
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(approvalItem)}
        onOpenChange={(open) => {
          if (!open) {
            setApprovalItem(null);
          }
        }}
      >
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-2xl">{t("ভর্তি অনুমোদন", "Approve admission")}</DialogTitle>
            <DialogDescription className="font-bengali text-sm">
              {t("স্টুডেন্ট আইডি, রোল, ক্লাস, সেকশন এবং মাসিক ফি ঠিক করে তারপর অনুমোদন দিন", "Set the student ID, roll, class, section, and monthly fee before approving")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("স্টুডেন্ট আইডি", "Student ID")}>
              <Input
                value={approvalDraft.studentId}
                onChange={(event) => setApprovalDraft((current) => ({ ...current, studentId: event.target.value }))}
                className="rounded-2xl"
                placeholder="STD-2026-001"
              />
            </Field>
            <Field label={t("রোল", "Roll")}>
              <Input
                type="number"
                value={approvalDraft.roll}
                onChange={(event) => setApprovalDraft((current) => ({ ...current, roll: event.target.value }))}
                className="rounded-2xl"
                placeholder="1"
              />
            </Field>
            <Field label={t("ক্লাস", "Class")}>
              <select
                value={approvalDraft.className}
                onChange={(event) => setApprovalDraft((current) => ({ ...current, className: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("ক্লাস নির্বাচন করুন", "Select class")}</option>
                {GUARDIAN_CLASS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("সেকশন", "Section")}>
              <select
                value={approvalDraft.section}
                onChange={(event) => setApprovalDraft((current) => ({ ...current, section: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("সেকশন নির্বাচন করুন", "Select section")}</option>
                {GUARDIAN_SECTION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("মাসিক ফি", "Monthly fee")}>
              <Input
                type="number"
                min="0"
                value={approvalDraft.monthlyFee}
                onChange={(event) => setApprovalDraft((current) => ({ ...current, monthlyFee: event.target.value }))}
                className="rounded-2xl"
                placeholder="1500"
              />
            </Field>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={() => setApprovalItem(null)}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button className="rounded-2xl" disabled={!approvalItem?.id || updatingId === approvalItem?.id} onClick={() => void submitApproval()}>
              {t("অনুমোদন", "Approve")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-3xl">
          {selectedItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-bengali text-2xl">{selectedItem.studentNameBn || selectedItem.studentName}</DialogTitle>
                <DialogDescription className="font-bengali text-sm">
                  {t("ভর্তি আবেদন ফর্মের সম্পূর্ণ সারাংশ", "Full admission application summary")}
                </DialogDescription>
                <div>
                  <Badge variant="outline" className={`rounded-full ${statusMeta[selectedItem.status].className}`}>
                    {getStatusLabel(selectedItem.status)}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                  <h3 className="mb-3 font-bengali text-base font-semibold">{t("শিক্ষার্থীর তথ্য", "Student information")}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">{t("নাম", "Name")}:</span> {selectedItem.studentNameBn || selectedItem.studentName}</p>
                    <p><span className="font-medium text-foreground">{t("নাম (ইংরেজি)", "Name (English)")}:</span> {selectedItem.studentName}</p>
                    <p><span className="font-medium text-foreground">{t("জন্ম তারিখ", "Birth date")}:</span> {selectedItem.birthDate || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("লিঙ্গ", "Gender")}:</span> {selectedItem.gender || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("ধর্ম", "Religion")}:</span> {selectedItem.religion || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("শ্রেণি", "Class")}:</span> {selectedItem.class || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("ক্যাম্পাস", "Campus")}:</span> {selectedItem.campus || "-"}</p>
                    <p>
                      <span className="font-medium text-foreground">{t("আসন ধরন", "Seat type")}:</span>{" "}
                      {selectedItem.residencyType === "residential"
                        ? t("আবাসিক", "Residential")
                        : selectedItem.residencyType === "non-residential"
                          ? t("অনাবাসিক", "Non-residential")
                          : selectedItem.residencyType === "day-care"
                            ? t("ডে-কেয়ার", "Day care")
                            : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                  <h3 className="mb-3 font-bengali text-base font-semibold">{t("অভিভাবকের তথ্য", "Guardian information")}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">{t("পিতা", "Father")}:</span> {selectedItem.fatherNameBn || selectedItem.fatherName}</p>
                    <p><span className="font-medium text-foreground">{t("পিতার ফোন", "Father's phone")}:</span> {selectedItem.fatherPhone || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("মাতা", "Mother")}:</span> {selectedItem.motherNameBn || selectedItem.motherName}</p>
                    <p><span className="font-medium text-foreground">{t("মাতার ফোন", "Mother's phone")}:</span> {selectedItem.motherPhone || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                <h3 className="mb-3 font-bengali text-base font-semibold">{t("ঠিকানা", "Address")}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">{t("বর্তমান ঠিকানা", "Present address")}:</span> {selectedItem.presentAddressBn || selectedItem.presentAddress || "-"}</p>
                  <p><span className="font-medium text-foreground">{t("স্থায়ী ঠিকানা", "Permanent address")}:</span> {selectedItem.permanentAddressBn || selectedItem.permanentAddress || "-"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                <h3 className="mb-3 font-bengali text-base font-semibold">{t("সাক্ষাৎপ্রার্থী / রেফারেন্স", "Interview candidate / references")}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {(selectedItem.interviewReferences?.length ? selectedItem.interviewReferences : Array.from({ length: 3 }, () => ({ name: "", relation: "", mobile: "" })))
                    .slice(0, 3)
                    .map((reference, index) => (
                      <p key={index}>
                        <span className="font-medium text-foreground">{index + 1}.</span> {reference.name || "-"} • {reference.relation || "-"} • {reference.mobile || "-"}
                      </p>
                    ))}
                </div>
              </div>

              {selectedItem.status === "approved" ? (
                <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                  <h3 className="mb-3 font-bengali text-base font-semibold">{t("অনুমোদন তথ্য", "Approval information")}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">{t("স্টুডেন্ট আইডি", "Student ID")}:</span> {selectedItem.approvedStudentId || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("রোল", "Roll")}:</span> {selectedItem.approvedRoll ? String(selectedItem.approvedRoll) : "-"}</p>
                    <p><span className="font-medium text-foreground">{t("ক্লাস", "Class")}:</span> {selectedItem.approvedClass || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("সেকশন", "Section")}:</span> {selectedItem.approvedSection || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("মাসিক ফি", "Monthly fee")}:</span> {selectedItem.approvedMonthlyFee ? formatCurrency(selectedItem.approvedMonthlyFee) : "-"}</p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-3xl border border-border/70 bg-background p-5">
                <pre className="whitespace-pre-wrap font-bengali text-sm leading-7 text-muted-foreground">{selectedSummary}</pre>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="outline" className="rounded-2xl" onClick={() => downloadSummary(selectedItem)}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("ডাউনলোড", "Download")}
                </Button>
                <Button className="rounded-2xl" onClick={() => printSummary(selectedItem)}>
                  <Printer className="mr-2 h-4 w-4" />
                  {t("প্রিন্ট", "Print")}
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
};
export const FeesManagerPage = ({
  items,
  onSave,
  onDelete,
}: {
  items: FeeRecord[];
  onSave: (record: FeeRecord) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<FeeRecord>({
    id: createClientId(),
    title: "",
    amount: 0,
    dueDate: new Date().toISOString().slice(0, 10),
    campus: "both",
    status: "draft",
    note: "",
    createdAt: Date.now(),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
    setForm({ id: createClientId(), title: "", amount: 0, dueDate: new Date().toISOString().slice(0, 10), campus: "both", status: "draft", note: "", createdAt: Date.now() });
  };

  return (
    <ModuleShell title={t("à¦«à¦¿ à¦®à§à¦¯à¦¾à¦¨à§‡à¦œà¦®à§‡à¦¨à§à¦Ÿ", "Fees Management")} description={t("à¦®à¦¾à¦¸à¦¿à¦• à¦«à¦¿, à¦¬à¦¿à¦¶à§‡à¦· à¦šà¦¾à¦°à§à¦œ à¦“ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¸à¦¾à¦°à§à¦•à§à¦²à¦¾à¦° à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦•à¦°à§à¦¨", "Manage monthly fees and payment circulars")} icon={<FileText className="h-5 w-5" />}>
      <FormCard onSubmit={submit}>
        <Field label={t("à¦«à¦¿ à¦¶à¦¿à¦°à§‹à¦¨à¦¾à¦®", "Fee title")}><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="rounded-2xl" /></Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("à¦ªà¦°à¦¿à¦®à¦¾à¦£", "Amount")}><Input type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} className="rounded-2xl" /></Field>
          <Field label={t("à¦¡à¦¿à¦‰ à¦¤à¦¾à¦°à¦¿à¦–", "Due date")}><Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className="rounded-2xl" /></Field>
          <Field label={t("à¦¸à§à¦Ÿà§à¦¯à¦¾à¦Ÿà¦¾à¦¸", "Status")}>
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FeeRecord["status"] }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
              <option value="draft">{t("à¦¡à§à¦°à¦¾à¦«à¦Ÿ", "Draft")}</option>
              <option value="published">{t("à¦ªà¦¾à¦¬à¦²à¦¿à¦¶à¦¡", "Published")}</option>
              <option value="closed">{t("à¦•à§à¦²à§‹à¦œà¦¡", "Closed")}</option>
            </select>
          </Field>
        </div>
        <Field label={t("à¦¨à§‹à¦Ÿ", "Note")}><Textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="rounded-2xl" rows={3} /></Field>
      </FormCard>

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("à¦à¦–à¦¨à¦“ à¦•à§‹à¦¨à§‹ à¦«à¦¿ à¦°à§‡à¦•à¦°à§à¦¡ à¦¨à§‡à¦‡", "No fee records yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={item.title} meta={`à§³${item.amount} â€¢ ${item.status}`} onDelete={() => onDelete(item.id)}>
              <p className="font-bengali text-sm text-muted-foreground">{item.note || t("à¦•à§‹à¦¨à§‹ à¦¨à§‹à¦Ÿ à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿", "No note added")}</p>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const AttendanceManagerPage = ({
  items,
  onSave,
  onDelete,
}: {
  items: AttendanceRecord[];
  onSave: (record: AttendanceRecord) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<AttendanceRecord>({
    id: createClientId(),
    label: "",
    date: new Date().toISOString().slice(0, 10),
    campus: "both",
    presentCount: 0,
    absentCount: 0,
    createdAt: Date.now(),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
    setForm({ id: createClientId(), label: "", date: new Date().toISOString().slice(0, 10), campus: "both", presentCount: 0, absentCount: 0, createdAt: Date.now() });
  };

  return (
    <ModuleShell title={t("à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦®à§à¦¯à¦¾à¦¨à§‡à¦œà¦®à§‡à¦¨à§à¦Ÿ", "Attendance Management")} description={t("à¦¦à§ˆà¦¨à¦¿à¦• à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿à¦° à¦¸à¦¾à¦°à¦¾à¦‚à¦¶ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦“ à¦ªà¦°à§à¦¯à¦¾à¦²à§‹à¦šà¦¨à¦¾ à¦•à¦°à§à¦¨", "Store and review daily attendance summaries")} icon={<UserCheck className="h-5 w-5" />}>
      <FormCard onSubmit={submit}>
        <Field label={t("à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦¶à¦¿à¦°à§‹à¦¨à¦¾à¦®", "Report label")}><Input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} className="rounded-2xl" /></Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("à¦¤à¦¾à¦°à¦¿à¦–", "Date")}><Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="rounded-2xl" /></Field>
          <Field label={t("à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤", "Present")}><Input type="number" value={form.presentCount} onChange={(event) => setForm((current) => ({ ...current, presentCount: Number(event.target.value) }))} className="rounded-2xl" /></Field>
          <Field label={t("à¦…à¦¨à§à¦ªà¦¸à§à¦¥à¦¿à¦¤", "Absent")}><Input type="number" value={form.absentCount} onChange={(event) => setForm((current) => ({ ...current, absentCount: Number(event.target.value) }))} className="rounded-2xl" /></Field>
        </div>
      </FormCard>

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("à¦à¦–à¦¨à¦“ à¦•à§‹à¦¨à§‹ à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦°à§‡à¦•à¦°à§à¦¡ à¦¨à§‡à¦‡", "No attendance records yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={item.label} meta={item.date} onDelete={() => onDelete(item.id)}>
              <div className="flex gap-2">
                <Badge variant="secondary" className="rounded-full">{t("à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤", "Present")}: {item.presentCount}</Badge>
                <Badge variant="secondary" className="rounded-full">{t("à¦…à¦¨à§à¦ªà¦¸à§à¦¥à¦¿à¦¤", "Absent")}: {item.absentCount}</Badge>
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const GuardianRequestsPage = ({
  items,
  onSave,
  onCreateGuardianAccount,
  onDelete,
}: {
  items: GuardianRequest[];
  onSave: (record: GuardianRequest) => void;
  onCreateGuardianAccount: (payload: GuardianRegistrationInput) => Promise<void>;
  onDelete: (id: string) => void;
}) => {
  const { t } = useLanguage();
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GuardianRequest | null>(null);
  const [requestFilter, setRequestFilter] = useState<"all" | "complaint" | "registration">("all");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountForm, setAccountForm] = useState<GuardianRegistrationInput>({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    gender: "male",
    relationship: "Father",
    address: "",
    nid: "",
    studentId: "",
    studentName: "",
    className: "",
    section: "",
    monthlyFee: undefined,
  });


  const submitGuardianAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountSaving(true);
    setAccountError("");
    setAccountSuccess("");

    try {
      await onCreateGuardianAccount({
        ...accountForm,
        studentId: normalizeGuardianStudentId(accountForm.studentId, accountForm.gender),
      });
      setAccountForm({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        gender: "male",
        relationship: "Father",
        address: "",
        nid: "",
        studentId: "",
        studentName: "",
        className: "",
        section: "",
        monthlyFee: undefined,
      });
      setAccountSuccess(t("গার্ডিয়ান অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে", "Guardian account created successfully"));
      setShowAccountForm(false);
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: string }).code)
          : "";
      const message = error instanceof Error ? error.message : "";

      if (message === "student-id-required") {
        setAccountError(t("সঠিক স্টুডেন্ট আইডি দিন", "Please enter a valid student ID"));
      } else if (message === "student-already-linked") {
        setAccountError(t("এই স্টুডেন্ট আইডির সাথে আগে থেকেই একটি গার্ডিয়ান যুক্ত আছে", "This student ID is already linked to a guardian"));
      } else if (message === "permission-denied" || code === "permission-denied") {
        setAccountError(
          t(
            "Firestore rules এই অ্যাকাউন্ট তৈরির অনুমতি দিচ্ছে না। users, guardians এবং student_guardian_links collection-এর create/read permission চেক করুন",
            "Firestore rules are blocking this account creation. Check create/read permission for users, guardians, and student_guardian_links collections",
          ),
        );
      } else if (code === "auth/email-already-in-use") {
        setAccountError(t("এই ইমেইল দিয়ে আগেই একটি অ্যাকাউন্ট আছে", "An account already exists with this email"));
      } else if (code === "auth/weak-password") {
        setAccountError(t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে", "Password must be at least 6 characters"));
      } else if (code === "auth/invalid-email") {
        setAccountError(t("সঠিক ইমেইল ঠিকানা দিন", "Please enter a valid email address"));
      } else if (code === "auth/operation-not-allowed") {
        setAccountError(
          t(
            "Firebase Authentication-এ Email/Password sign-in এখনো চালু করা হয়নি",
            "Email/Password sign-in is not enabled in Firebase Authentication",
          ),
        );
      } else {
        setAccountError(t("গার্ডিয়ান অ্যাকাউন্ট তৈরি করা যায়নি", "Could not create guardian account"));
      }

      console.error("Guardian account create failed:", error);
    } finally {
      setAccountSaving(false);
    }
  };

  return (
    <ModuleShell
      title={t("গার্ডিয়ান রিকোয়েস্ট", "Guardian Requests")}
      description={t(
        "গার্ডিয়ানদের সাপোর্ট, ফলাফল, ফি ও অন্যান্য অনুরোধগুলো এখান থেকে ট্র্যাক ও ম্যানেজ করুন",
        "Track and manage guardian support, results, fee, and other requests from here",
      )}
      actionLabel={t("নতুন গার্ডিয়ান", "New Guardian")}
      onAction={() => setShowAccountForm((current) => !current)}
      icon={<Users className="h-5 w-5" />}
    >
      {showAccountForm && (
        <FormCard onSubmit={submitGuardianAccount} submitLabel={accountSaving ? t("তৈরি হচ্ছে...", "Creating...") : t("গার্ডিয়ান অ্যাকাউন্ট তৈরি করুন", "Create guardian account")} saving={accountSaving}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("গার্ডিয়ানের নাম", "Guardian name")}>
              <Input value={accountForm.fullName} onChange={(event) => setAccountForm((current) => ({ ...current, fullName: event.target.value }))} className="rounded-2xl" />
            </Field>
            <Field label={t("মোবাইল নম্বর", "Phone number")}>
              <Input value={accountForm.phone} onChange={(event) => setAccountForm((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("ইমেইল", "Email")}>
              <Input type="email" value={accountForm.email} onChange={(event) => setAccountForm((current) => ({ ...current, email: event.target.value }))} className="rounded-2xl" />
            </Field>
            <Field label={t("পাসওয়ার্ড", "Password")}>
              <Input type="password" value={accountForm.password} onChange={(event) => setAccountForm((current) => ({ ...current, password: event.target.value }))} className="rounded-2xl" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("লিঙ্গ", "Gender")}>
              <select
                value={accountForm.gender}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    gender: event.target.value as GuardianRegistrationInput["gender"],
                    studentId: normalizeGuardianStudentId(current.studentId, event.target.value as GuardianRegistrationInput["gender"]),
                  }))
                }
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="male">{t("ছেলে", "Boy")}</option>
                <option value="female">{t("মেয়ে", "Girl")}</option>
              </select>
            </Field>
            <Field label={t("সম্পর্ক", "Relationship")}>
              <select
                value={accountForm.relationship}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    relationship: event.target.value as GuardianRelationship,
                  }))
                }
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="Father">{t("পিতা", "Father")}</option>
                <option value="Mother">{t("মাতা", "Mother")}</option>
                <option value="Guardian">{t("অভিভাবক", "Guardian")}</option>
              </select>
            </Field>
            <Field label={t("এনআইডি", "NID")}>
              <Input value={accountForm.nid} onChange={(event) => setAccountForm((current) => ({ ...current, nid: event.target.value }))} className="rounded-2xl" />
            </Field>
          </div>
          <Field label={t("ঠিকানা", "Address")}>
            <Textarea value={accountForm.address} onChange={(event) => setAccountForm((current) => ({ ...current, address: event.target.value }))} className="rounded-2xl" rows={3} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("স্টুডেন্ট আইডি", "Student ID")}>
              <Input
                value={accountForm.studentId}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    studentId: normalizeGuardianStudentId(event.target.value, current.gender),
                  }))
                }
                className="rounded-2xl"
              />
            </Field>
            <Field label={t("শিক্ষার্থীর নাম", "Student name")}>
              <Input value={accountForm.studentName} onChange={(event) => setAccountForm((current) => ({ ...current, studentName: event.target.value }))} className="rounded-2xl" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("শ্রেণি", "Class")}>
              <select
                value={accountForm.className}
                onChange={(event) => setAccountForm((current) => ({ ...current, className: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("শ্রেণি নির্বাচন করুন", "Select class")}</option>
                {GUARDIAN_CLASS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("সেকশন", "Section")}>
              <select
                value={accountForm.section}
                onChange={(event) => setAccountForm((current) => ({ ...current, section: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("সেকশন নির্বাচন করুন", "Select section")}</option>
                {GUARDIAN_SECTION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("মাসিক ফি", "Monthly fee")}>
              <Input
                type="number"
                min="0"
                value={accountForm.monthlyFee ?? ""}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    monthlyFee: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                className="rounded-2xl"
                placeholder="1500"
              />
            </Field>
          </div>
          {accountError ? <p className="font-bengali text-sm text-red-600">{accountError}</p> : null}
          {accountSuccess ? <p className="font-bengali text-sm text-emerald-600">{accountSuccess}</p> : null}
        </FormCard>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", labelBn: "সব", labelEn: "All" },
          { key: "complaint", labelBn: "কমপ্লেইন্ট", labelEn: "Complaint" },
          { key: "registration", labelBn: "রেজিস্ট্রেশন", labelEn: "Registration" },
        ].map((filter) => (
          <Button
            key={filter.key}
            type="button"
            variant={requestFilter === filter.key ? "default" : "outline"}
            className="h-9 rounded-full px-4 text-xs font-bengali"
            onClick={() => setRequestFilter(filter.key as typeof requestFilter)}
          >
            {t(filter.labelBn, filter.labelEn)}
          </Button>
        ))}
      </div>

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.filter((item) => {
            if (requestFilter === "all") return true;
            const isRegistration = item.topic?.includes("রেজিস্ট্রেশন") || item.topic?.toLowerCase().includes("registration");
            return requestFilter === "registration" ? isRegistration : !isRegistration;
          }).length === 0 ? (
            <EmptyState
              text={t("কোনো গার্ডিয়ান রিকোয়েস্ট নেই", "No guardian requests")}
              description={t("নতুন support message এলে সেগুলো এখানে দেখা যাবে", "New support messages will appear here")}
              actionLabel={t("গার্ডিয়ান তৈরি করুন", "Create guardian")}
              onAction={() => setShowAccountForm(true)}
              icon={<Users className="h-5 w-5" />}
            />
          ) : items.filter((item) => {
            if (requestFilter === "all") return true;
            const isRegistration = item.topic?.includes("রেজিস্ট্রেশন") || item.topic?.toLowerCase().includes("registration");
            return requestFilter === "registration" ? isRegistration : !isRegistration;
          }).map((item) => (
            <ItemCard
              key={item.id}
              title={`${item.guardianName} • ${item.studentName}`}
              meta={item.topic}
              onDelete={() => onDelete(item.id)}
              trailing={
                <div className="flex flex-wrap items-center gap-2">
                  {item.status === "resolved" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("সমাধান", "Resolved")}
                    </span>
                  )}
                  <Badge variant={item.topic?.includes("রেজিস্ট্রেশন") || item.topic?.toLowerCase().includes("registration") ? "secondary" : "outline"} className="rounded-full">
                    {item.topic?.includes("রেজিস্ট্রেশন") || item.topic?.toLowerCase().includes("registration")
                      ? t("রেজিস্ট্রেশন", "Registration")
                      : t("কমপ্লেইন্ট", "Complaint")}
                  </Badge>
                  <select
                    value={item.status}
                    onChange={(event) => onSave({ ...item, status: event.target.value as GuardianRequest["status"] })}
                    className="h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none"
                  >
                    <option value="pending">{t("পেন্ডিং", "Pending")}</option>
                    <option value="in-review">{t("রিভিউতে", "In Review")}</option>
                    <option value="resolved">{t("সমাধান", "Resolved")}</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl px-3 text-xs"
                    onClick={() => setSelectedRequest(item)}
                  >
                    {t("বিস্তারিত", "Details")}
                  </Button>
                </div>
              }
            >
              <div className="space-y-3">
                <p className="font-bengali text-sm text-muted-foreground">{item.message}</p>
                <div className="flex flex-wrap gap-2">
                  {item.studentId && (
                    <Badge variant="secondary" className="rounded-full">
                      {t("স্টুডেন্ট আইডি", "Student ID")}: {item.studentId}
                    </Badge>
                  )}
                  {item.guardianPhone && (
                    <Badge variant="secondary" className="rounded-full">
                      {t("ফোন", "Phone")}: {item.guardianPhone}
                    </Badge>
                  )}
                </div>
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bengali text-lg">{t("গার্ডিয়ান রিকোয়েস্ট ডিটেইল", "Guardian Request Details")}</DialogTitle>
            <DialogDescription className="font-bengali">
              {t("রিকোয়েস্ট যাচাইয়ের জন্য প্রয়োজনীয় তথ্য", "Required information to verify the request")}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-3">
              <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm">
                <p className="font-bengali"><span className="font-semibold">{t("গার্ডিয়ানের নাম", "Guardian name")}:</span> {selectedRequest.guardianName}</p>
                <p className="font-bengali"><span className="font-semibold">{t("শিক্ষার্থীর নাম", "Student name")}:</span> {selectedRequest.studentName}</p>
                {selectedRequest.studentId && <p className="font-bengali"><span className="font-semibold">{t("স্টুডেন্ট আইডি", "Student ID")}:</span> {selectedRequest.studentId}</p>}
                {selectedRequest.className && <p className="font-bengali"><span className="font-semibold">{t("শ্রেণি", "Class")}:</span> {selectedRequest.className}</p>}
                {selectedRequest.section && <p className="font-bengali"><span className="font-semibold">{t("সেকশন", "Section")}:</span> {selectedRequest.section}</p>}
                {selectedRequest.guardianPhone && <p className="font-bengali"><span className="font-semibold">{t("ফোন", "Phone")}:</span> {selectedRequest.guardianPhone}</p>}
                {selectedRequest.guardianUid && <p className="font-bengali"><span className="font-semibold">UID:</span> {selectedRequest.guardianUid}</p>}
                <p className="font-bengali"><span className="font-semibold">{t("রিকোয়েস্ট বিষয়", "Topic")}:</span> {selectedRequest.topic}</p>
                <p className="font-bengali"><span className="font-semibold">{t("বার্তা", "Message")}:</span> {selectedRequest.message}</p>
                <p className="font-bengali">
                  <span className="font-semibold">{t("স্ট্যাটাস", "Status")}:</span>{" "}
                  {selectedRequest.status === "pending"
                    ? t("পেন্ডিং", "Pending")
                    : selectedRequest.status === "in-review"
                      ? t("রিভিউতে", "In Review")
                      : t("সমাধান", "Resolved")}
                </p>
                <p className="font-bengali">
                  <span className="font-semibold">{t("সময়", "Time")}:</span>{" "}
                  {new Date(selectedRequest.createdAt).toLocaleString("bn-BD")}
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setSelectedRequest(null)}>
                  {t("বন্ধ করুন", "Close")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
};

export const SettingsPage = ({
  settings,
  appDownloadSettings,
  onSave,
  onSaveAppDownloadSettings,
}: {
  settings: DashboardSettings;
  appDownloadSettings: AppDownloadSettings;
  onSave: (settings: DashboardSettings) => void | Promise<void>;
  onSaveAppDownloadSettings: (settings: Omit<AppDownloadSettings, "updatedAt">) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(settings);
  const [appDraft, setAppDraft] = useState<Omit<AppDownloadSettings, "updatedAt">>({
    enabled: appDownloadSettings.enabled,
    apkUrl: appDownloadSettings.apkUrl,
    version: appDownloadSettings.version,
    releaseNotesBn: appDownloadSettings.releaseNotesBn,
    releaseNotesEn: appDownloadSettings.releaseNotesEn,
    fileName: appDownloadSettings.fileName,
    fileSizeLabel: appDownloadSettings.fileSizeLabel,
  });
  const [savingApk, setSavingApk] = useState(false);
  const [apkError, setApkError] = useState("");

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    setAppDraft({
      enabled: appDownloadSettings.enabled,
      apkUrl: appDownloadSettings.apkUrl,
      version: appDownloadSettings.version,
      releaseNotesBn: appDownloadSettings.releaseNotesBn,
      releaseNotesEn: appDownloadSettings.releaseNotesEn,
      fileName: appDownloadSettings.fileName,
      fileSizeLabel: appDownloadSettings.fileSizeLabel,
    });
  }, [appDownloadSettings]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(draft);
  };

  const submitApkSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setApkError("");

    if (appDraft.enabled && !appDraft.apkUrl.trim()) {
      setApkError(t("APK ফাইলের public path দিন", "Enter the public path for the APK file"));
      return;
    }

    setSavingApk(true);
    try {
      await onSaveAppDownloadSettings(appDraft);
    } catch (error) {
      setApkError(error instanceof Error ? error.message : t("APK সেটিংস সংরক্ষণ করা যায়নি", "Could not save APK settings"));
    } finally {
      setSavingApk(false);
    }
  };

  return (
    <ModuleShell
      title={t("সেটিংস", "Settings")}
      description={t("ড্যাশবোর্ডের সাধারণ কনফিগারেশন ও সাপোর্ট তথ্য এখান থেকে আপডেট করুন", "Update the dashboard configuration and support information from here")}
      icon={<Users className="h-5 w-5" />}
    >
      <FormCard onSubmit={submit} submitLabel={t("সেটিংস সংরক্ষণ", "Save settings")}>
        <Field label={t("প্রতিষ্ঠানের নাম", "Institution name")}><Input value={draft.institutionName} onChange={(event) => setDraft((current) => ({ ...current, institutionName: event.target.value }))} className="rounded-2xl" /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("সাপোর্ট ইমেইল", "Support email")}><Input value={draft.supportEmail} onChange={(event) => setDraft((current) => ({ ...current, supportEmail: event.target.value }))} className="rounded-2xl" /></Field>
          <Field label={t("সাপোর্ট ফোন", "Support phone")}><Input value={draft.supportPhone} onChange={(event) => setDraft((current) => ({ ...current, supportPhone: event.target.value }))} className="rounded-2xl" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleRow label={t("ম্যানেজার ইমেইল নোটিফিকেশন", "Manager email notifications")} checked={draft.notifyManagersByEmail} onCheckedChange={(checked) => setDraft((current) => ({ ...current, notifyManagersByEmail: checked }))} />
          <ToggleRow label={t("ভর্তি চালু", "Admissions open")} checked={draft.admissionsOpen} onCheckedChange={(checked) => setDraft((current) => ({ ...current, admissionsOpen: checked }))} />
        </div>

        <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
          <h3 className="font-bengali text-base font-semibold text-foreground">{t("ডিসপ্লে পছন্দ", "Display preferences")}</h3>
          <p className="mt-1 font-bengali text-sm text-muted-foreground">
            {t("ড্যাশবোর্ডের ভাষা ও থিম এখান থেকে পরিবর্তন করুন", "Change the dashboard language and theme from here")}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </FormCard>

      <Card className={shellCardClass}>
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <h3 className="font-bengali text-lg font-semibold text-foreground">{t("গার্ডিয়ান অ্যাপ APK", "Guardian app APK")}</h3>
            <p className="font-bengali text-sm text-muted-foreground">
              {t("APK ফাইলটি আগে cPanel-এর public folder-এ আপলোড করুন, তারপর নিচে তার path, version এবং release note সংরক্ষণ করুন", "Upload the APK to your cPanel public folder first, then save its path, version, and release notes here")}
            </p>
          </div>

          <form onSubmit={submitApkSettings} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleRow
                label={t("ডাউনলোড চালু", "Enable download")}
                checked={appDraft.enabled}
                onCheckedChange={(checked) => setAppDraft((current) => ({ ...current, enabled: checked }))}
              />
              <Field label={t("অ্যাপ ভার্সন", "App version")}>
                <Input
                  value={appDraft.version}
                  onChange={(event) => setAppDraft((current) => ({ ...current, version: event.target.value }))}
                  className="rounded-2xl"
                  placeholder="v1.0.0"
                />
              </Field>
            </div>

            <Field label={t("APK public path", "APK public path")}>
              <Input
                value={appDraft.apkUrl}
                onChange={(event) => setAppDraft((current) => ({ ...current, apkUrl: event.target.value }))}
                className="rounded-2xl"
                placeholder="/downloads/annoor-guardian.apk"
              />
            </Field>
            <p className="-mt-1 font-bengali text-xs text-muted-foreground">
              {t("উদাহরণ: /downloads/annoor-guardian.apk অথবা সম্পূর্ণ URL", "Example: /downloads/annoor-guardian.apk or a full URL")}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("ফাইলের নাম", "File name")}>
                <Input
                  value={appDraft.fileName}
                  onChange={(event) => setAppDraft((current) => ({ ...current, fileName: event.target.value }))}
                  className="rounded-2xl"
                  placeholder="annoor-guardian.apk"
                />
              </Field>
              <Field label={t("ফাইল সাইজ", "File size label")}>
                <Input
                  value={appDraft.fileSizeLabel}
                  onChange={(event) => setAppDraft((current) => ({ ...current, fileSizeLabel: event.target.value }))}
                  className="rounded-2xl"
                  placeholder="24.8 MB"
                />
              </Field>
            </div>

            <BilingualTextarea
              labelBn="রিলিজ নোট"
              labelEn="Release notes"
              valueBn={appDraft.releaseNotesBn}
              valueEn={appDraft.releaseNotesEn}
              onBnChange={(value) => setAppDraft((current) => ({ ...current, releaseNotesBn: value }))}
              onEnChange={(value) => setAppDraft((current) => ({ ...current, releaseNotesEn: value }))}
            />

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="font-bengali text-sm font-semibold text-foreground">
                {t("পাবলিক ডাউনলোড পেইজ", "Public download page")}: <span className="text-primary">/apk</span>
              </p>
              {appDraft.apkUrl ? (
                <a
                  href={getDownloadUrl(appDraft.apkUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  {t("বর্তমান APK লিংক পরীক্ষা করুন", "Check current APK link")}
                </a>
              ) : (
                <p className="mt-2 font-bengali text-sm text-muted-foreground">
                  {t("এখনও কোনো APK আপলোড করা হয়নি", "No APK has been uploaded yet")}
                </p>
              )}
            </div>

            {apkError ? <p className="font-bengali text-sm text-red-600">{apkError}</p> : null}

            <Button type="submit" className="rounded-2xl font-bengali" disabled={savingApk}>
              {savingApk ? t("APK সংরক্ষণ হচ্ছে...", "Saving APK...") : t("APK সেটিংস সংরক্ষণ", "Save APK settings")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </ModuleShell>
  );
};











