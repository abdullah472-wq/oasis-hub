import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Subject, SubjectStatus, SubjectCategory, AcademicLevel } from "@/lib/subjects";
import { allCategories, allAcademicLevels, getCategoryLabel, getAcademicLevelLabel } from "@/lib/subjects";
import type { SubjectGroup } from "@/lib/subjectGroups";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BilingualInput,
  DeleteIconButton,
  EmptyState,
  Field,
  FormCard,
  ModuleShell,
  shellCardClass,
} from "@/components/admin/AdminPagePrimitives";

const PAGE_SIZE = 20;

const createEmptySubject = (): Partial<Subject> => ({
  nameBn: "",
  nameEn: "",
  code: "",
  category: "custom" as SubjectCategory,
  description: "",
  academicLevel: "general" as AcademicLevel,
  status: "active" as SubjectStatus,
  markConfig: {
    fullMarks: 100,
    passMarks: 33,
    writtenMarks: 50,
    oralMarks: 10,
    practicalMarks: 10,
    assignmentMarks: 10,
  },
  gpaConfig: { includeInGpa: true },
  creditConfig: { creditHours: 1, weightage: 1 },
  orderIndex: 0,
});

interface SubjectManagerPageProps {
  subjects: Subject[];
  subjectGroups: SubjectGroup[];
  onSave: (payload: Omit<Subject, "createdAt" | "updatedAt"> & { id?: string }) => Promise<Subject>;
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: SubjectStatus) => Promise<void>;
  onUpdateOrder: (subjects: Subject[]) => Promise<void>;
}

const SubjectManagerPage = ({
  subjects,
  subjectGroups,
  onSave,
  onDelete,
  onUpdateStatus,
}: SubjectManagerPageProps) => {
  const { t, lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SubjectCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SubjectStatus | "all">("all");
  const [levelFilter, setLevelFilter] = useState<AcademicLevel | "all">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Subject>>(createEmptySubject());

  const filtered = useMemo(() => {
    let result = [...subjects];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.nameBn.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") result = result.filter((s) => s.category === categoryFilter);
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    if (levelFilter !== "all") result = result.filter((s) => s.academicLevel === levelFilter);
    return result.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [subjects, searchQuery, categoryFilter, statusFilter, levelFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, categoryFilter, statusFilter, levelFilter]);

  const resetForm = () => {
    setEditingId(null);
    setForm(createEmptySubject());
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setForm({ ...subject });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.nameBn?.trim()) {
      toast.error(t("বিষয়ের নাম বাংলা中输入 করুন", "Enter subject name in Bangla"));
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        id: editingId || undefined,
        nameBn: form.nameBn.trim(),
        nameEn: form.nameEn?.trim() || form.nameBn.trim(),
        code: form.code?.trim().toUpperCase() || form.nameBn.trim().toUpperCase().slice(0, 10),
        category: form.category || "custom",
        description: form.description?.trim() || "",
        academicLevel: form.academicLevel || "general",
        status: form.status || "active",
        markConfig: form.markConfig || { fullMarks: 100, passMarks: 33, writtenMarks: 50, oralMarks: 10, practicalMarks: 10, assignmentMarks: 10 },
        gpaConfig: form.gpaConfig || { includeInGpa: true },
        creditConfig: form.creditConfig || { creditHours: 1, weightage: 1 },
        orderIndex: typeof form.orderIndex === "number" ? form.orderIndex : subjects.length,
        dependencyCount: 0,
        tenantId: "default",
      });
      resetForm();
    } catch {
      toast.error(t("বিষয় সংরক্ষণ করা যায়নি", "Could not save subject"));
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<SubjectStatus, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <ModuleShell
      title={t("বিষয় ব্যবস্থাপনা", "Subject Management")}
      description={t(
        "সকল বিষয় তৈরি, সম্পাদনা এবং পরিচালনা করুন",
        "Create, edit, and manage all subjects",
      )}
      icon={<BookOpen className="h-5 w-5" />}
      recordCount={subjects.length}
      recordLabel={t("বিষয়", "Subjects")}
    >
      <FormCard onSubmit={submit} saving={saving} submitLabel={t("বিষয় সংরক্ষণ করুন", "Save subject")}>
        <BilingualInput
          labelBn="বিষয়ের নাম"
          labelEn="Subject Name"
          valueBn={form.nameBn || ""}
          valueEn={form.nameEn || ""}
          onBnChange={(v) => setForm((f) => ({ ...f, nameBn: v }))}
          onEnChange={(v) => setForm((f) => ({ ...f, nameEn: v }))}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("বিষয় কোড", "Subject Code")}>
            <Input
              value={form.code || ""}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="rounded-2xl"
              placeholder="e.g. BNG101"
            />
          </Field>
          <Field label={t("বিভাগ", "Category")}>
            <select
              value={form.category || "custom"}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SubjectCategory }))}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("একাডেমিক স্তর", "Academic Level")}>
            <select
              value={form.academicLevel || "general"}
              onChange={(e) => setForm((f) => ({ ...f, academicLevel: e.target.value as AcademicLevel }))}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
            >
              {allAcademicLevels.map((level) => (
                <option key={level} value={level}>
                  {getAcademicLevelLabel(level, lang)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={t("বিবরণ", "Description")}>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="min-h-[80px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="font-bengali text-sm font-semibold">{t("মার্ক কনফিগারেশন", "Mark Configuration")}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("পূর্ণ মার্ক", "Full Marks")}>
                <Input type="number" min="0" value={form.markConfig?.fullMarks ?? 100} onChange={(e) => setForm((f) => ({ ...f, markConfig: { ...f.markConfig!, fullMarks: Number(e.target.value) } }))} className="rounded-2xl h-9 text-sm" />
              </Field>
              <Field label={t("পাস মার্ক", "Pass Marks")}>
                <Input type="number" min="0" value={form.markConfig?.passMarks ?? 33} onChange={(e) => setForm((f) => ({ ...f, markConfig: { ...f.markConfig!, passMarks: Number(e.target.value) } }))} className="rounded-2xl h-9 text-sm" />
              </Field>
              <Field label={t("লিখিত", "Written")}>
                <Input type="number" min="0" value={form.markConfig?.writtenMarks ?? 50} onChange={(e) => setForm((f) => ({ ...f, markConfig: { ...f.markConfig!, writtenMarks: Number(e.target.value) } }))} className="rounded-2xl h-9 text-sm" />
              </Field>
              <Field label={t("মৌখিক", "Oral")}>
                <Input type="number" min="0" value={form.markConfig?.oralMarks ?? 10} onChange={(e) => setForm((f) => ({ ...f, markConfig: { ...f.markConfig!, oralMarks: Number(e.target.value) } }))} className="rounded-2xl h-9 text-sm" />
              </Field>
              <Field label={t("প্রাকৃতিক", "Practical")}>
                <Input type="number" min="0" value={form.markConfig?.practicalMarks ?? 10} onChange={(e) => setForm((f) => ({ ...f, markConfig: { ...f.markConfig!, practicalMarks: Number(e.target.value) } }))} className="rounded-2xl h-9 text-sm" />
              </Field>
              <Field label={t("অ্যাসাইনমেন্ট", "Assignment")}>
                <Input type="number" min="0" value={form.markConfig?.assignmentMarks ?? 10} onChange={(e) => setForm((f) => ({ ...f, markConfig: { ...f.markConfig!, assignmentMarks: Number(e.target.value) } }))} className="rounded-2xl h-9 text-sm" />
              </Field>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="font-bengali text-sm font-semibold">{t("জিপিএ ও ক্রেডিট", "GPA & Credit")}</p>
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background px-4 py-3">
              <label className="font-bengali text-sm">{t("জিপিএ-তে অন্তর্ভুক্ত", "Include in GPA")}</label>
              <input
                type="checkbox"
                checked={form.gpaConfig?.includeInGpa ?? true}
                onChange={(e) => setForm((f) => ({ ...f, gpaConfig: { includeInGpa: e.target.checked } }))}
                className="h-4 w-4"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("ক্রেডিট আওয়ার", "Credit Hours")}>
                <Input type="number" min="0" step="0.5" value={form.creditConfig?.creditHours ?? 1} onChange={(e) => setForm((f) => ({ ...f, creditConfig: { ...f.creditConfig!, creditHours: Number(e.target.value) } }))} className="rounded-2xl h-9 text-sm" />
              </Field>
              <Field label={t("ওয়েটেজ", "Weightage")}>
                <Input type="number" min="0" step="0.5" value={form.creditConfig?.weightage ?? 1} onChange={(e) => setForm((f) => ({ ...f, creditConfig: { ...f.creditConfig!, weightage: Number(e.target.value) } }))} className="rounded-2xl h-9 text-sm" />
              </Field>
            </div>
            <Field label={t("স্ট্যাটাস", "Status")}>
              <select
                value={form.status || "active"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SubjectStatus }))}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="active">{t("সক্রিয়", "Active")}</option>
                <option value="inactive">{t("নিষ্ক্রিয়", "Inactive")}</option>
              </select>
            </Field>
          </div>
        </div>
      </FormCard>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("বিষয় খুঁজুন...", "Search subjects...")}
              className="rounded-2xl pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-2xl"
            onClick={() => setShowFilters((f) => !f)}
          >
            <Filter className="mr-1 h-4 w-4" />
            {t("ফিল্টার", "Filters")}
            {showFilters ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="min-w-[160px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as SubjectCategory | "all")}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none"
              >
                <option value="all">{t("সব বিভাগ", "All Categories")}</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{getCategoryLabel(cat, lang)}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SubjectStatus | "all")}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none"
              >
                <option value="all">{t("সব স্ট্যাটাস", "All Status")}</option>
                <option value="active">{t("সক্রিয়", "Active")}</option>
                <option value="inactive">{t("নিষ্ক্রিয়", "Inactive")}</option>
              </select>
            </div>
            <div className="min-w-[160px]">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as AcademicLevel | "all")}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none"
              >
                <option value="all">{t("সব স্তর", "All Levels")}</option>
                {allAcademicLevels.map((level) => (
                  <option key={level} value={level}>{getAcademicLevelLabel(level, lang)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <Card className={shellCardClass}>
            <CardContent className="p-6">
              <EmptyState
                text={t("কোনো বিষয় পাওয়া যায়নি", "No subjects found")}
                description={t("ফিল্টার পরিবর্তন করুন বা নতুন বিষয় যোগ করুন", "Change filters or add new subjects")}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="rounded-2xl border border-border/60 bg-white overflow-hidden shadow-sm">
              <div className="hidden md:grid md:grid-cols-[48px_1fr_1fr_120px_140px_120px_100px_100px] gap-3 px-4 py-3 bg-muted/30 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span></span>
                <span>{t("বাংলা নাম", "Bangla Name")}</span>
                <span>{t("কোড", "Code")}</span>
                <span>{t("বিভাগ", "Category")}</span>
                <span>{t("স্তর", "Level")}</span>
                <span>{t("পূর্ণ মার্ক", "Full Marks")}</span>
                <span>{t("স্ট্যাটাস", "Status")}</span>
                <span className="text-right">{t("কর্ম", "Actions")}</span>
              </div>
              {paginated.map((subject) => (
                <div
                  key={subject.id}
                  className="grid md:grid-cols-[48px_1fr_1fr_120px_140px_120px_100px_100px] gap-3 px-4 py-3 border-b border-border/30 hover:bg-muted/20 transition-colors items-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      {subject.orderIndex + 1}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bengali text-sm font-semibold truncate">{subject.nameBn}</p>
                    {subject.nameEn ? <p className="text-xs text-muted-foreground truncate">{subject.nameEn}</p> : null}
                  </div>
                  <div>
                    <code className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono">{subject.code}</code>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{getCategoryLabel(subject.category, lang)}</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {getAcademicLevelLabel(subject.academicLevel, lang)}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">{subject.markConfig?.fullMarks ?? 100}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(subject.id, subject.status === "active" ? "inactive" : "active")}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
                        statusColors[subject.status],
                      )}
                    >
                      {subject.status === "active" ? t("সক্রিয়", "Active") : t("নিষ্ক্রিয়", "Inactive")}
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(subject)}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Button>
                    <DeleteIconButton onClick={() => void onDelete(subject.id)} />
                  </div>
                </div>
              ))}
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-between">
                <p className="font-bengali text-sm text-muted-foreground">
                  {t("মোট", "Total")} {filtered.length} {t("টি বিষয়", "subjects")}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-8"
                    disabled={safePage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  >
                    {t("পূর্ববর্তী", "Previous")}
                  </Button>
                  <span className="font-bengali text-sm text-muted-foreground px-2">
                    {safePage + 1} / {pageCount}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-8"
                    disabled={safePage >= pageCount - 1}
                    onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
                  >
                    {t("পরবর্তী", "Next")}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ModuleShell>
  );
};

export default SubjectManagerPage;
