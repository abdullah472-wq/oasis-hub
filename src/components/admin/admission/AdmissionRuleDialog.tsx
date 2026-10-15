import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveAdmissionRule, type AdmissionRuleItem } from "@/lib/admissionInfo";

interface AdmissionRuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ruleItem?: AdmissionRuleItem | null;
}

export const AdmissionRuleDialog = ({
  isOpen,
  onClose,
  onSuccess,
  ruleItem,
}: AdmissionRuleDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [ruleBn, setRuleBn] = useState("");
  const [ruleEn, setRuleEn] = useState("");
  const [type, setType] = useState<AdmissionRuleItem["type"]>("rule");
  const [isRequired, setIsRequired] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);

  useEffect(() => {
    if (ruleItem) {
      setRuleBn(ruleItem.rule_bn || "");
      setRuleEn(ruleItem.rule_en || "");
      setType(ruleItem.type || "rule");
      setIsRequired(ruleItem.is_required !== false);
      setOrderIndex(ruleItem.order_index || 1);
    } else {
      setRuleBn("");
      setRuleEn("");
      setType("rule");
      setIsRequired(true);
      setOrderIndex(1);
    }
  }, [ruleItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleBn.trim()) {
      toast.error(t("বিবরণ আবশ্যক", "Rule description is required"));
      return;
    }

    try {
      setLoading(true);
      await saveAdmissionRule({
        id: ruleItem?.id,
        rule_bn: ruleBn.trim(),
        rule_en: ruleEn.trim() || ruleBn.trim(),
        type,
        is_required: isRequired,
        order_index: Number(orderIndex) || 1,
      });

      toast.success(
        ruleItem
          ? t("নিয়ম/ডকুমেন্ট আপডেট হয়েছে", "Rule/Document updated successfully")
          : t("নতুন নিয়ম/ডকুমেন্ট যুক্ত হয়েছে", "Added successfully")
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save rule error:", err);
      toast.error(t("সংরক্ষণ ব্যর্থ হয়েছে", "Failed to save rule"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bengali text-xl">
            {ruleItem
              ? t("নিয়মাবলী / ডকুমেন্ট সম্পাদনা", "Edit Rule / Document")
              : t("নতুন নিয়ম বা ডকুমেন্ট যোগ করুন", "Add Rule or Document")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 font-bengali">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("বিবরণ (বাংলা) *", "Description (BN) *")}
            </Label>
            <Textarea
              rows={3}
              placeholder="যেমন: শিক্ষার্থীকে অবশ্যই ভর্তি পরীক্ষায় উত্তীর্ণ হতে হবে"
              value={ruleBn}
              onChange={(e) => setRuleBn(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("বিবরণ (ইংরেজি)", "Description (EN)")}
            </Label>
            <Textarea
              rows={2}
              placeholder="e.g. Student must pass the admission test"
              value={ruleEn}
              onChange={(e) => setRuleEn(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ধরন (Type)", "Type")}
              </Label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rule">{t("ভর্তির নিয়মাবলী", "Admission Rule")}</SelectItem>
                  <SelectItem value="document">{t("প্রয়োজনীয় কাগজপত্র", "Document")}</SelectItem>
                  <SelectItem value="step">{t("ভর্তি ধাপ", "Process Step")}</SelectItem>
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

          <div className="rounded-xl border border-border p-4 bg-muted/30 flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">{t("বাধ্যতামূলক (Mandatory)", "Mandatory")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("অনুমোদিত বা আবশ্যকীয় শর্ত হিসেবে চিহ্নিত থাকবে", "Mark as compulsory requirement")}
              </p>
            </div>
            <Switch checked={isRequired} onCheckedChange={setIsRequired} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
