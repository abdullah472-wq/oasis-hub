import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveFeeItem, type FeeStructureItem } from "@/lib/admissionInfo";

interface FeeItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feeItem?: FeeStructureItem | null;
}

export const FeeItemDialog = ({
  isOpen,
  onClose,
  onSuccess,
  feeItem,
}: FeeItemDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [typeBn, setTypeBn] = useState("");
  const [typeEn, setTypeEn] = useState("");
  const [amountBn, setAmountBn] = useState("");
  const [amountEn, setAmountEn] = useState("");
  const [noteBn, setNoteBn] = useState("");
  const [noteEn, setNoteEn] = useState("");
  const [category, setCategory] = useState<FeeStructureItem["category"]>("tuition");
  const [highlight, setHighlight] = useState(false);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (feeItem) {
      setTypeBn(feeItem.type_bn || "");
      setTypeEn(feeItem.type_en || "");
      setAmountBn(feeItem.amount_bn || "");
      setAmountEn(feeItem.amount_en || "");
      setNoteBn(feeItem.note_bn || "");
      setNoteEn(feeItem.note_en || "");
      setCategory(feeItem.category || "tuition");
      setHighlight(Boolean(feeItem.highlight));
      setOrderIndex(feeItem.order_index || 1);
      setIsActive(feeItem.is_active !== false);
    } else {
      setTypeBn("");
      setTypeEn("");
      setAmountBn("");
      setAmountEn("");
      setNoteBn("");
      setNoteEn("");
      setCategory("tuition");
      setHighlight(false);
      setOrderIndex(1);
      setIsActive(true);
    }
  }, [feeItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeBn.trim() || !amountBn.trim()) {
      toast.error(t("ফি ধরন এবং পরিমাণ আবশ্যক", "Fee type and amount are required"));
      return;
    }

    try {
      setLoading(true);
      await saveFeeItem({
        id: feeItem?.id,
        type_bn: typeBn.trim(),
        type_en: typeEn.trim() || typeBn.trim(),
        amount_bn: amountBn.trim(),
        amount_en: amountEn.trim() || amountBn.trim(),
        note_bn: noteBn.trim(),
        note_en: noteEn.trim() || noteBn.trim(),
        category,
        highlight,
        order_index: Number(orderIndex) || 1,
        is_active: isActive,
      });

      toast.success(
        feeItem
          ? t("ফি সফলভাবে আপডেট হয়েছে", "Fee updated successfully")
          : t("নতুন ফি যুক্ত হয়েছে", "New fee added successfully")
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save fee item error:", err);
      toast.error(t("ফি সংরক্ষণ ব্যর্থ হয়েছে", "Failed to save fee"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bengali text-xl">
            {feeItem
              ? t("ফি তথ্য সম্পাদনা", "Edit Fee Item")
              : t("নতুন ফি যুক্ত করুন", "Add New Fee Item")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 font-bengali">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ফি ধরন (বাংলা) *", "Fee Type (BN) *")}
              </Label>
              <Input
                placeholder="যেমন: মাসিক টিউশন (অনাবাসিক)"
                value={typeBn}
                onChange={(e) => setTypeBn(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ফি ধরন (ইংরেজি)", "Fee Type (EN)")}
              </Label>
              <Input
                placeholder="e.g. Monthly Tuition (Day)"
                value={typeEn}
                onChange={(e) => setTypeEn(e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("পরিমাণ (বাংলা) *", "Amount (BN) *")}
              </Label>
              <Input
                placeholder="যেমন: ৳১,০০০ — ৳২,৫০০"
                value={amountBn}
                onChange={(e) => setAmountBn(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("পরিমাণ (ইংরেজি)", "Amount (EN)")}
              </Label>
              <Input
                placeholder="e.g. ৳1,000 — ৳2,500"
                value={amountEn}
                onChange={(e) => setAmountEn(e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("মন্তব্য / সুবিধা (বাংলা)", "Note / Note (BN)")}
              </Label>
              <Input
                placeholder="যেমন: ক্লাস অনুযায়ী"
                value={noteBn}
                onChange={(e) => setNoteBn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("মন্তব্য / সুবিধা (ইংরেজি)", "Note / Note (EN)")}
              </Label>
              <Input
                placeholder="e.g. Varies by class"
                value={noteEn}
                onChange={(e) => setNoteEn(e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ক্যাটাগরি", "Category")}
              </Label>
              <Select
                value={category}
                onValueChange={(val: any) => setCategory(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">{t("মাসিক টিউশন ফি", "Monthly Tuition")}</SelectItem>
                  <SelectItem value="admission">{t("এককালীন ভর্তি ফি", "Admission Fee")}</SelectItem>
                  <SelectItem value="exam">{t("পরীক্ষা ফি", "Exam Fee")}</SelectItem>
                  <SelectItem value="other">{t("অন্যান্য খরচ", "Other Expenses")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ক্রম (Order Index)", "Order Index")}
              </Label>
              <Input
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">{t("বিশেষ হাইলাইট ব্যাজ", "Highlight Badge")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("জনপ্রিয় সুবিধা হিসেবে কার্ডে বিশেষ গোল্ডেন/সবুজ ফ্রেম দেখাবে", "Show glowing gold/emerald frame with 'Popular' badge")}
                </p>
              </div>
              <Switch checked={highlight} onCheckedChange={setHighlight} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div>
                <Label className="text-sm font-semibold">{t("ওয়েবসাইটে প্রদর্শন (Active)", "Display on Website")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("বন্ধ রাখলে সাধারণ দর্শকরা এটি দেখতে পাবেন না", "Inactive items are hidden from public view")}
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save Fee")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
