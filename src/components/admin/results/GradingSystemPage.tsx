import { useState } from "react";
import { Plus, Save, Trash2, Weight } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { GradingSystem, GradeBand } from "@/lib/gradingSystems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BilingualInput, EmptyState, Field } from "@/components/admin/AdminPagePrimitives";
import { cn } from "@/lib/utils";

interface GradingSystemPageProps {
  systems: GradingSystem[];
  onSave: (system: Omit<GradingSystem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const emptyBand = (): GradeBand => ({ minPercent: 0, maxPercent: 100, grade: "", gpa: 0, point: 0 });

const GradingSystemPage = ({ systems, onSave, onDelete }: GradingSystemPageProps) => {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [bands, setBands] = useState<GradeBand[]>([emptyBand()]);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null); setName(""); setNameEn(""); setBands([emptyBand()]);
  };

  const startEdit = (sys: GradingSystem) => {
    setEditingId(sys.id); setName(sys.name); setNameEn(sys.nameEn); setBands([...sys.bands]);
  };

  const updateBand = (index: number, patch: Partial<GradeBand>) => {
    setBands((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error(t("নাম দিন", "Enter a name")); return; }
    if (bands.some((b) => !b.grade.trim())) { toast.error(t("সব গ্রেডের নাম দিন", "Name all grades")); return; }
    setSaving(true);
    try {
      await onSave({
        id: editingId || undefined,
        name: name.trim(),
        nameEn: nameEn.trim(),
        isDefault: systems.length === 0,
        bands: bands.map((b) => ({
          ...b,
          minPercent: Math.max(0, Math.min(100, b.minPercent)),
          maxPercent: Math.max(0, Math.min(100, b.maxPercent)),
          gpa: Math.max(0, Math.min(5, b.gpa)),
          point: Math.max(0, Math.min(5, b.point)),
        })),
      });
      toast.success(t("সংরক্ষিত", "Saved"));
      resetForm();
    } catch { toast.error(t("ব্যর্থ", "Failed")); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
          <Weight className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bengali text-2xl font-semibold text-foreground">{t("গ্রেডিং সিস্টেম", "Grading System")}</h2>
          <p className="font-bengali text-sm text-muted-foreground">{t("কাস্টম গ্রেডিং স্কিম তৈরি ও পরিচালনা", "Create and manage custom grading schemes")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-4">
        <h3 className="font-bengali text-base font-semibold text-foreground">
          {editingId ? t("গ্রেডিং সিস্টেম সম্পাদনা", "Edit Grading System") : t("নতুন গ্রেডিং সিস্টেম", "New Grading System")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <BilingualInput labelBn="সিস্টেমের নাম" labelEn="System Name" valueBn={name} valueEn={nameEn} onBnChange={setName} onEnChange={setNameEn} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-bengali text-sm font-semibold text-foreground">{t("গ্রেড ব্যান্ড", "Grade Bands")}</p>
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-xl text-xs" onClick={() => setBands((prev) => [...prev, emptyBand()])}>
              <Plus className="h-3.5 w-3.5 mr-1" /> {t("যোগ", "Add")}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60">
                  <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left">{t("গ্রেড", "Grade")}</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left">{t("নূন্যতম %", "Min %")}</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left">{t("সর্বোচ্চ %", "Max %")}</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left">GPA</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left">{t("পয়েন্ট", "Point")}</th>
                  <th className="px-3 py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {bands.map((band, index) => (
                  <tr key={index} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="px-3 py-2"><Input value={band.grade} onChange={(e) => updateBand(index, { grade: e.target.value })} className="h-8 rounded-lg text-xs w-16" /></td>
                    <td className="px-3 py-2"><Input type="number" min="0" max="100" value={band.minPercent} onChange={(e) => updateBand(index, { minPercent: Number(e.target.value) })} className="h-8 rounded-lg text-xs w-20" /></td>
                    <td className="px-3 py-2"><Input type="number" min="0" max="100" value={band.maxPercent} onChange={(e) => updateBand(index, { maxPercent: Number(e.target.value) })} className="h-8 rounded-lg text-xs w-20" /></td>
                    <td className="px-3 py-2"><Input type="number" min="0" max="5" step="0.5" value={band.gpa} onChange={(e) => updateBand(index, { gpa: Number(e.target.value) })} className="h-8 rounded-lg text-xs w-20" /></td>
                    <td className="px-3 py-2"><Input type="number" min="0" max="5" step="0.5" value={band.point} onChange={(e) => updateBand(index, { point: Number(e.target.value) })} className="h-8 rounded-lg text-xs w-20" /></td>
                    <td className="px-3 py-2">
                      {bands.length > 1 ? (
                        <button type="button" onClick={() => setBands((prev) => prev.filter((_, i) => i !== index))}
                          className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"><Trash2 className="h-3.5 w-3.5" /></button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {editingId ? <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={resetForm}>{t("বাতিল", "Cancel")}</Button> : null}
          <Button type="button" className="rounded-2xl font-bengali" disabled={saving} onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />{saving ? t("সেভ হচ্ছে...", "Saving...") : t("সংরক্ষণ", "Save")}
          </Button>
        </div>
      </div>

      {systems.length === 0 ? (
        <EmptyState text={t("কোনো গ্রেডিং সিস্টেম নেই", "No grading systems")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {systems.map((sys) => (
            <div key={sys.id} className="rounded-2xl border border-border/60 bg-card/95 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bengali text-base font-semibold text-foreground">{sys.name} {sys.isDefault ? <span className="text-xs text-primary ml-1">({t("ডিফল্ট", "Default")})</span> : null}</h4>
                  {sys.nameEn ? <p className="text-xs text-muted-foreground">{sys.nameEn}</p> : null}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg p-0" onClick={() => startEdit(sys)}>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Button>
                  {!sys.isDefault ? (
                    <button type="button" onClick={() => onDelete(sys.id)} className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"><Trash2 className="h-3.5 w-3.5" /></button>
                  ) : null}
                </div>
              </div>
              <div className="space-y-1">
                {sys.bands.sort((a, b) => b.minPercent - a.minPercent).map((band, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-1.5 text-xs">
                    <span className="font-semibold text-foreground">{band.grade}</span>
                    <span className="text-muted-foreground">{band.minPercent}% - {band.maxPercent}%</span>
                    <span className="text-muted-foreground">GPA: {band.gpa}</span>
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

export default GradingSystemPage;
