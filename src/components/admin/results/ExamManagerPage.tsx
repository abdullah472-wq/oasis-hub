import { useState } from "react";
import { CalendarDays, ClipboardList, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { CLASS_NAME_OPTIONS } from "@/lib/attendanceHelpers";
import { EXAM_TYPE_OPTIONS, EXAM_STATUS_OPTIONS } from "@/lib/examManagement";
import type { Exam, ExamStatus, ExamType } from "@/lib/examManagement";
import { createClientId } from "@/lib/uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BilingualInput, EmptyState, Field } from "@/components/admin/AdminPagePrimitives";
import { cn } from "@/lib/utils";

interface ExamManagerPageProps {
  exams: Exam[];
  onSave: (exam: Omit<Exam, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: ExamStatus) => Promise<void>;
}

const emptyExam = () => ({
  id: "",
  name: "",
  nameEn: "",
  examType: "monthly" as ExamType,
  academicYear: new Date().getFullYear().toString(),
  session: "",
  className: "",
  section: "",
  examStartDate: "",
  examEndDate: "",
  resultPublishDate: "",
  status: "draft" as ExamStatus,
  createdBy: "",
});

const ExamManagerPage = ({ exams, onSave, onDelete, onUpdateStatus }: ExamManagerPageProps) => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ReturnType<typeof emptyExam>>(emptyExam());

  const resetForm = () => { setForm(emptyExam()); setShowForm(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error(t("পরীক্ষার নাম দিন", "Enter exam name")); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        id: form.id || undefined,
        name: form.name.trim(),
        nameEn: form.nameEn.trim(),
      });
      toast.success(t("পরীক্ষা সংরক্ষিত", "Exam saved"));
      resetForm();
    } catch {
      toast.error(t("সংরক্ষণ ব্যর্থ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: ExamStatus) => {
    const opt = EXAM_STATUS_OPTIONS.find((o) => o.key === status);
    return opt ? <Badge className={cn("rounded-full", opt.color)}>{t(opt.labelBn, opt.labelEn)}</Badge> : null;
  };

  const getExamTypeLabel = (type: ExamType) => {
    const opt = EXAM_TYPE_OPTIONS.find((o) => o.key === type);
    return opt ? t(opt.labelBn, opt.labelEn) : type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bengali text-2xl font-semibold text-foreground">{t("পরীক্ষা ব্যবস্থাপনা", "Exam Management")}</h2>
          <p className="font-bengali text-sm text-muted-foreground">{t("পরীক্ষা তৈরি, সম্পাদনা ও প্রকাশ করুন", "Create, edit, and publish exams")}</p>
        </div>
      </div>

      <Button className="rounded-2xl font-bengali shadow-sm" onClick={() => setShowForm(!showForm)}>
        <Plus className="mr-2 h-4 w-4" />
        {showForm ? t("বন্ধ করুন", "Close") : t("নতুন পরীক্ষা", "New Exam")}
      </Button>

      {showForm ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-4">
          <h3 className="font-bengali text-lg font-semibold">{t("পরীক্ষার তথ্য", "Exam Details")}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <BilingualInput labelBn="পরীক্ষার নাম" labelEn="Exam Name" valueBn={form.name} valueEn={form.nameEn} onBnChange={(v) => setForm((p) => ({ ...p, name: v }))} onEnChange={(v) => setForm((p) => ({ ...p, nameEn: v }))} />
            <Field label={t("পরীক্ষার ধরন", "Exam Type")}>
              <select value={form.examType} onChange={(e) => setForm((p) => ({ ...p, examType: e.target.value as ExamType }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
                {EXAM_TYPE_OPTIONS.map((opt) => <option key={opt.key} value={opt.key}>{t(opt.labelBn, opt.labelEn)}</option>)}
              </select>
            </Field>
            <Field label={t("শিক্ষাবর্ষ", "Academic Year")}>
              <Input type="number" value={form.academicYear} onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))} className="h-11 rounded-2xl" />
            </Field>
            <Field label={t("সেশন", "Session")}>
              <Input value={form.session} onChange={(e) => setForm((p) => ({ ...p, session: e.target.value }))} className="h-11 rounded-2xl" placeholder="e.g. 2026" />
            </Field>
            <Field label={t("ক্লাস", "Class")}>
              <select value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
                <option value="">{t("সব ক্লাস", "All Classes")}</option>
                {CLASS_NAME_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label={t("সেকশন", "Section")}>
              <Input value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} className="h-11 rounded-2xl" placeholder={t("সেকশন (ঐচ্ছিক)", "Section (optional)")} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("শুরু তারিখ", "Start Date")}>
              <Input type="date" value={form.examStartDate} onChange={(e) => setForm((p) => ({ ...p, examStartDate: e.target.value }))} className="h-11 rounded-2xl" />
            </Field>
            <Field label={t("শেষ তারিখ", "End Date")}>
              <Input type="date" value={form.examEndDate} onChange={(e) => setForm((p) => ({ ...p, examEndDate: e.target.value }))} className="h-11 rounded-2xl" />
            </Field>
            <Field label={t("ফলাফল প্রকাশ তারিখ", "Result Publish Date")}>
              <Input type="date" value={form.resultPublishDate} onChange={(e) => setForm((p) => ({ ...p, resultPublishDate: e.target.value }))} className="h-11 rounded-2xl" />
            </Field>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={resetForm}>{t("বাতিল", "Cancel")}</Button>
            <Button type="submit" className="rounded-2xl font-bengali" disabled={saving}>{saving ? t("সেভ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save Exam")}</Button>
          </div>
        </form>
      ) : null}

      {exams.length === 0 ? (
        <EmptyState text={t("কোনো পরীক্ষা তৈরি করা হয়নি", "No exams created yet")} description={t("উপরের বাটন থেকে নতুন পরীক্ষা তৈরি করুন", "Create a new exam from the button above")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-3 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bengali text-base font-semibold text-foreground truncate">{exam.name}</h4>
                  {exam.nameEn ? <p className="text-xs text-muted-foreground truncate">{exam.nameEn}</p> : null}
                </div>
                {getStatusBadge(exam.status)}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="rounded-full">{getExamTypeLabel(exam.examType)}</Badge>
                {exam.className ? <Badge variant="outline" className="rounded-full">{exam.className}</Badge> : null}
                {exam.academicYear ? <Badge variant="outline" className="rounded-full">{exam.academicYear}</Badge> : null}
              </div>

              {(exam.examStartDate || exam.examEndDate) ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {exam.examStartDate ? new Date(exam.examStartDate).toLocaleDateString() : ""}
                  {exam.examStartDate && exam.examEndDate ? " → " : ""}
                  {exam.examEndDate ? new Date(exam.examEndDate).toLocaleDateString() : ""}
                </div>
              ) : null}

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex gap-1">
                  {(["draft", "ongoing", "completed", "published"] as ExamStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => { if (exam.id) onUpdateStatus(exam.id, status); toast.success(t(`Status: ${status}`, `Status: ${status}`)); }}
                      className={cn("h-7 rounded-lg px-2 text-[11px] font-medium transition-colors", exam.status === status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                    >
                      {t(EXAM_STATUS_OPTIONS.find((o) => o.key === status)?.labelBn || status, EXAM_STATUS_OPTIONS.find((o) => o.key === status)?.labelEn || status)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { if (exam.id) onDelete(exam.id); }}
                  className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamManagerPage;
