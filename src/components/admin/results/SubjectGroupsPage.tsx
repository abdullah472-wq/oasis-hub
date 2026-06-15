import { useState } from "react";
import { Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SubjectGroup } from "@/lib/subjectGroups";
import type { SubjectCategory } from "@/lib/subjects";
import { allCategories, getCategoryLabel } from "@/lib/subjects";
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

const GROUP_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

interface SubjectGroupsPageProps {
  groups: SubjectGroup[];
  onSave: (payload: Omit<SubjectGroup, "createdAt" | "updatedAt"> & { id?: string }) => Promise<SubjectGroup>;
  onDelete: (id: string) => Promise<void>;
}

const SubjectGroupsPage = ({ groups, onSave, onDelete }: SubjectGroupsPageProps) => {
  const { t, lang } = useLanguage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [selectedCategories, setSelectedCategories] = useState<SubjectCategory[]>([]);

  const resetForm = () => {
    setEditingId(null);
    setNameBn("");
    setNameEn("");
    setDescription("");
    setColor(GROUP_COLORS[0]);
    setSelectedCategories([]);
  };

  const startEdit = (group: SubjectGroup) => {
    setEditingId(group.id);
    setNameBn(group.nameBn);
    setNameEn(group.nameEn);
    setDescription(group.description || "");
    setColor(group.color || GROUP_COLORS[0]);
    setSelectedCategories(group.categories);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCategory = (cat: SubjectCategory) => {
    setSelectedCategories((current) =>
      current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat],
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nameBn.trim()) {
      toast.error(t("গ্রুপের নাম বাংলায় দিন", "Enter group name in Bangla"));
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: editingId || undefined,
        nameBn: nameBn.trim(),
        nameEn: nameEn.trim() || nameBn.trim(),
        description: description.trim() || undefined,
        color,
        categories: selectedCategories,
        orderIndex: editingId ? groups.find((g) => g.id === editingId)?.orderIndex ?? groups.length : groups.length,
        tenantId: "default",
      });
      resetForm();
    } catch {
      toast.error(t("গ্রুপ সংরক্ষণ করা যায়নি", "Could not save group"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleShell
      title={t("বিষয় গ্রুপ", "Subject Groups")}
      description={t(
        "বিষয়গুলোকে গ্রুপে ভাগ করে পরিচালনা করুন",
        "Organize subjects into groups for easier management",
      )}
      icon={<Layers className="h-5 w-5" />}
      recordCount={groups.length}
      recordLabel={t("গ্রুপ", "Groups")}
    >
      <FormCard onSubmit={submit} saving={saving} submitLabel={t("গ্রুপ সংরক্ষণ করুন", "Save group")}>
        <BilingualInput
          labelBn="গ্রুপের নাম"
          labelEn="Group Name"
          valueBn={nameBn}
          valueEn={nameEn}
          onBnChange={setNameBn}
          onEnChange={setNameEn}
        />

        <Field label={t("বিবরণ", "Description")}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[60px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
          />
        </Field>

        <Field label={t("রঙ", "Color")}>
          <div className="flex flex-wrap gap-2">
            {GROUP_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </Field>

        <Field label={t("বিভাগ নির্বাচন", "Select Categories")}>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                  selectedCategories.includes(cat)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {getCategoryLabel(cat, lang)}
              </button>
            ))}
          </div>
        </Field>
      </FormCard>

      {groups.length === 0 ? (
        <Card className={shellCardClass}>
          <CardContent className="p-6">
            <EmptyState
              text={t("কোনো গ্রুপ তৈরি করা হয়নি", "No groups created yet")}
              description={t("উপরের ফর্ম ব্যবহার করে নতুন গ্রুপ তৈরি করুন", "Create a new group using the form above")}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
              <div className="h-1.5 w-full" style={{ backgroundColor: group.color || "#10b981" }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bengali text-base font-semibold">{group.nameBn}</h3>
                    {group.nameEn ? (
                      <p className="text-xs text-muted-foreground mt-0.5">{group.nameEn}</p>
                    ) : null}
                    {group.description ? (
                      <p className="font-bengali text-sm text-muted-foreground mt-1">{group.description}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {group.categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="rounded-full text-[10px] px-2 py-0">
                          {getCategoryLabel(cat as SubjectCategory, lang)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(group)}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Button>
                    <DeleteIconButton onClick={() => void onDelete(group.id)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModuleShell>
  );
};

export default SubjectGroupsPage;
