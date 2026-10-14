import { useState, useEffect } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MarqueeNotice } from "@/types/cms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface MarqueeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noticeToEdit?: MarqueeNotice | null;
  onSuccess: () => void;
}

export const MarqueeFormDialog = ({
  isOpen,
  onClose,
  noticeToEdit,
  onSuccess,
}: MarqueeFormDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    text_bn: "",
    text_en: "",
    link_url: "",
    priority: 1,
    is_active: true,
  });

  useEffect(() => {
    if (noticeToEdit) {
      setFormData({
        text_bn: noticeToEdit.text_bn,
        text_en: noticeToEdit.text_en || "",
        link_url: noticeToEdit.link_url || "",
        priority: noticeToEdit.priority || 1,
        is_active: noticeToEdit.is_active,
      });
    } else {
      setFormData({
        text_bn: "",
        text_en: "",
        link_url: "",
        priority: 1,
        is_active: true,
      });
    }
  }, [noticeToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text_bn.trim()) {
      toast.error(t("বাংলা নোটিশ টেক্সট আবশ্যক", "Bangla notice text is required"));
      return;
    }

    try {
      setLoading(true);

      const payload = {
        text_bn: formData.text_bn.trim(),
        text_en: formData.text_en.trim() || null,
        link_url: formData.link_url.trim() || null,
        priority: Number(formData.priority) || 1,
        is_active: formData.is_active,
      };

      if (noticeToEdit) {
        const { error } = await supabase
          .from("marquee_notices")
          .update(payload)
          .eq("id", noticeToEdit.id);

        if (error) throw error;

        await logAdminActivity(
          "UPDATE",
          "marquee_notices",
          `মারকুই নোটিশ আপডেট: "${payload.text_bn.slice(0, 30)}..."`
        );
        toast.success(t("মারকুই নোটিশ আপডেট সম্পন্ন", "Marquee notice updated"));
      } else {
        const { error } = await supabase
          .from("marquee_notices")
          .insert([payload]);

        if (error) throw error;

        await logAdminActivity(
          "CREATE",
          "marquee_notices",
          `নতুন মারকুই নোটিশ তৈরি: "${payload.text_bn.slice(0, 30)}..."`
        );
        toast.success(t("নতুন মারকুই নোটিশ তৈরি সম্পন্ন", "Marquee notice added"));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving marquee notice:", err);
      toast.error(err.message || t("নোটিশ সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save notice"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Megaphone className="h-5 w-5 text-amber-500" />
            {noticeToEdit
              ? t("মারকুই নোটিশ সম্পাদনা করুন", "Edit Marquee Notice")
              : t("নতুন রানিং মারকুই নোটিশ", "Add Running Marquee Notice")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "ওয়েবসাইটের শীর্ষে চলমান স্ক্রলিং জরুরি নোটিশ",
              "Running marquee ticker banner displayed across the top of the website"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Text BN */}
          <div className="space-y-1.5">
            <Label htmlFor="text_bn" className="font-semibold">
              {t("নোটিশ টেক্সট (বাংলা) *", "Notice Text (Bangla) *")}
            </Label>
            <Input
              id="text_bn"
              value={formData.text_bn}
              onChange={(e) => setFormData({ ...formData, text_bn: e.target.value })}
              placeholder={t("যেমন: ২০২৬ শিক্ষাবর্ষে সকল শাখায় ভর্তি চলছে!", "e.g. Admission open for 2026!")}
              required
            />
          </div>

          {/* Text EN */}
          <div className="space-y-1.5">
            <Label htmlFor="text_en">
              {t("নোটিশ টেক্সট (ইংরেজি)", "Notice Text (English)")}
            </Label>
            <Input
              id="text_en"
              value={formData.text_en}
              onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
              placeholder="e.g. Admission open for Academic Session 2026!"
            />
          </div>

          {/* Link URL */}
          <div className="space-y-1.5">
            <Label htmlFor="link_url">
              {t("ক্লিকেবল লিংক (ঐচ্ছিক)", "Clickable Link (Optional)")}
            </Label>
            <Input
              id="link_url"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="/admission or https://..."
            />
          </div>

          {/* Priority & Active Switch */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="priority">{t("অগ্রাধিকার (Priority)", "Priority Order")}</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                min={1}
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-2.5 bg-card">
                <Label className="text-xs font-semibold">{t("সক্রিয় রাখুন", "Is Active")}</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {noticeToEdit ? t("আপডেট করুন", "Save Changes") : t("যুক্ত করুন", "Add Ticker")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
