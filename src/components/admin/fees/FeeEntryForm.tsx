import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FeeBatchDraft, FeeEntry, FeeEntryUpdateInput, FeeStudentOption } from "@/lib/feeEntries";
import { buildFeeEntryUpdatePayload, createEmptyFeeBatchDraft, feeCategoryOptions, feeStatusOptions } from "@/lib/feeHelpers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MultiFeeItemForm from "./MultiFeeItemForm";

interface FeeEntryFormProps {
  open: boolean;
  mode: "create" | "edit";
  students: FeeStudentOption[];
  initialEntry?: FeeEntry | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (draft: FeeBatchDraft) => Promise<void>;
  onUpdate: (id: string, payload: FeeEntryUpdateInput) => Promise<void>;
}

const FeeEntryForm = ({ open, mode, students, initialEntry, onOpenChange, onCreate, onUpdate }: FeeEntryFormProps) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [batchDraft, setBatchDraft] = useState<FeeBatchDraft>(createEmptyFeeBatchDraft());
  const [editDraft, setEditDraft] = useState<FeeEntryUpdateInput>({
    title: "",
    category: "monthly",
    amount: 0,
    paidAmount: 0,
    billingMonth: new Date().toISOString().slice(0, 7),
    note: "",
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setBatchDraft(createEmptyFeeBatchDraft());
      return;
    }

    if (initialEntry) {
      setEditDraft({
        title: initialEntry.title,
        category: initialEntry.category,
        amount: initialEntry.amount,
        paidAmount: initialEntry.paidAmount,
        billingMonth: initialEntry.billingMonth,
        note: initialEntry.note || "",
      });
    }
  }, [initialEntry, mode, open]);

  const selectedStudent = useMemo(() => students.find((item) => item.studentId === batchDraft.studentId), [batchDraft.studentId, students]);

  useEffect(() => {
    if (!selectedStudent) return;

    setBatchDraft((current) => ({
      ...current,
      guardianUid: current.guardianUid || selectedStudent.guardianUid,
      guardianName: current.guardianName || selectedStudent.guardianName,
      guardianPhone: current.guardianPhone || selectedStudent.guardianPhone || "",
      studentName: selectedStudent.studentName,
      className: selectedStudent.className,
    }));
  }, [selectedStudent]);

  const computedEditState = buildFeeEntryUpdatePayload(editDraft);

  const handleSubmit = async () => {
    setSaving(true);

    try {
      if (mode === "create") {
        await onCreate(batchDraft);
      } else if (initialEntry) {
        await onUpdate(initialEntry.id, editDraft);
      }

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-bengali text-xl">
            {mode === "create" ? t("মাল্টি-আইটেম ফি এন্ট্রি", "Multi-item Fee Entry") : t("ফি আইটেম এডিট", "Edit Fee Item")}
          </DialogTitle>
          <DialogDescription className="font-bengali">
            {mode === "create"
              ? t("একজন শিক্ষার্থীর জন্য একাধিক ফি আইটেম একসাথে সংরক্ষণ করুন", "Save multiple fee items for one student at once")
              : t("পরিমাণ, পেমেন্ট এবং বিলিং মাস আপডেট করুন", "Update amount, payment, and billing month")}
          </DialogDescription>
        </DialogHeader>

        {mode === "create" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2 xl:col-span-2">
                <Label className="font-bengali">{t("শিক্ষার্থী নির্বাচন", "Select student")}</Label>
                <select
                  value={batchDraft.studentId}
                  onChange={(event) => {
                    const nextStudent = students.find((item) => item.studentId === event.target.value);
                    setBatchDraft((current) => ({
                      ...current,
                      studentId: event.target.value,
                      guardianUid: nextStudent?.guardianUid || "",
                      guardianName: nextStudent?.guardianName || "",
                      guardianPhone: nextStudent?.guardianPhone || "",
                      studentName: nextStudent?.studentName || "",
                      className: nextStudent?.className || "",
                    }));
                  }}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                >
                  <option value="">{t("শিক্ষার্থী নির্বাচন করুন", "Choose a student")}</option>
                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.studentName} - {student.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("বিলিং মাস", "Billing month")}</Label>
                <Input type="month" value={batchDraft.billingMonth} onChange={(event) => setBatchDraft((current) => ({ ...current, billingMonth: event.target.value }))} className="rounded-2xl" />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("গার্ডিয়ান UID", "Guardian UID")}</Label>
                <Input value={batchDraft.guardianUid} onChange={(event) => setBatchDraft((current) => ({ ...current, guardianUid: event.target.value }))} className="rounded-2xl" placeholder={t("ভবিষ্যৎ লগইনের জন্য", "For future guardian login")} />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("অভিভাবকের নাম", "Guardian name")}</Label>
                <Input value={batchDraft.guardianName} onChange={(event) => setBatchDraft((current) => ({ ...current, guardianName: event.target.value }))} className="rounded-2xl" />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("ফোন", "Phone")}</Label>
                <Input value={batchDraft.guardianPhone} onChange={(event) => setBatchDraft((current) => ({ ...current, guardianPhone: event.target.value }))} className="rounded-2xl" />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("শিক্ষার্থীর নাম", "Student name")}</Label>
                <Input value={batchDraft.studentName} className="rounded-2xl" readOnly />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("শ্রেণি", "Class")}</Label>
                <Input value={batchDraft.className} className="rounded-2xl" readOnly />
              </div>
            </div>

            <MultiFeeItemForm items={batchDraft.items} onChange={(items) => setBatchDraft((current) => ({ ...current, items }))} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-bengali">{t("আইটেমের নাম", "Item title")}</Label>
                <Input value={editDraft.title} onChange={(event) => setEditDraft((current) => ({ ...current, title: event.target.value }))} className="rounded-2xl" />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("ক্যাটাগরি", "Category")}</Label>
                <select value={editDraft.category} onChange={(event) => setEditDraft((current) => ({ ...current, category: event.target.value as FeeEntry["category"] }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
                  {feeCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelBn, option.labelEn)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("মোট পরিমাণ", "Total amount")}</Label>
                <Input type="number" min="0" value={editDraft.amount} onChange={(event) => setEditDraft((current) => ({ ...current, amount: Number(event.target.value) }))} className="rounded-2xl" />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("পরিশোধিত", "Paid amount")}</Label>
                <Input type="number" min="0" value={editDraft.paidAmount} onChange={(event) => setEditDraft((current) => ({ ...current, paidAmount: Number(event.target.value) }))} className="rounded-2xl" />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("বিলিং মাস", "Billing month")}</Label>
                <Input type="month" value={editDraft.billingMonth} onChange={(event) => setEditDraft((current) => ({ ...current, billingMonth: event.target.value }))} className="rounded-2xl" />
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("স্ট্যাটাস", "Status")}</Label>
                <div className="flex h-11 items-center rounded-2xl border border-input bg-muted/30 px-4 text-sm">
                  {t(
                    feeStatusOptions.find((item) => item.value === computedEditState.status)?.labelBn || "বাকি",
                    feeStatusOptions.find((item) => item.value === computedEditState.status)?.labelEn || "Unpaid",
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bengali">{t("নোট", "Note")}</Label>
              <Textarea value={editDraft.note} onChange={(event) => setEditDraft((current) => ({ ...current, note: event.target.value }))} className="rounded-2xl" rows={3} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SummaryBox label={t("মোট", "Total")} value={`৳${computedEditState.amount.toLocaleString("en-US")}`} />
              <SummaryBox label={t("পরিশোধিত", "Paid")} value={`৳${computedEditState.paidAmount.toLocaleString("en-US")}`} />
              <SummaryBox label={t("বাকি", "Due")} value={`৳${computedEditState.dueAmount.toLocaleString("en-US")}`} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => onOpenChange(false)}>
            {t("বাতিল", "Cancel")}
          </Button>
          <Button
            type="button"
            className="rounded-2xl font-bengali"
            onClick={() => void handleSubmit()}
            disabled={saving || (mode === "create" ? !batchDraft.studentId || batchDraft.items.every((item) => !item.title.trim() || Number(item.amount) <= 0) : !editDraft.title.trim() || Number(editDraft.amount) <= 0)}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? t("ফি সংরক্ষণ", "Save Fees") : t("আপডেট সংরক্ষণ", "Save Update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SummaryBox = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
    <p className="font-bengali text-xs text-muted-foreground">{label}</p>
    <p className="font-display text-xl font-semibold text-foreground">{value}</p>
  </div>
);

export default FeeEntryForm;
