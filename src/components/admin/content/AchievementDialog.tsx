import { useState, useEffect, useRef } from "react";
import { Loader2, UploadCloud, Award, X } from "lucide-react";
import { toast } from "sonner";
import { uploadCmsFile } from "@/lib/supabase/client";
import { saveAchievement } from "@/lib/achievements";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Achievement } from "@/types/cms";
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
import { Textarea } from "@/components/ui/textarea";

interface AchievementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  achievementToEdit?: Achievement | null;
  onSuccess: () => void;
}

export const AchievementDialog = ({
  isOpen,
  onClose,
  achievementToEdit,
  onSuccess,
}: AchievementDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title_bn: "",
    title_en: "",
    year: new Date().getFullYear().toString(),
    category_bn: "",
    description_bn: "",
    description_en: "",
    image_url: "",
  });

  useEffect(() => {
    if (achievementToEdit) {
      setFormData({
        title_bn: achievementToEdit.title_bn,
        title_en: achievementToEdit.title_en || "",
        year: achievementToEdit.year || new Date().getFullYear().toString(),
        category_bn: achievementToEdit.category_bn || "",
        description_bn: achievementToEdit.description_bn,
        description_en: achievementToEdit.description_en || "",
        image_url: achievementToEdit.image_url || "",
      });
      setPreviewUrl(achievementToEdit.image_url || "");
    } else {
      setFormData({
        title_bn: "",
        title_en: "",
        year: new Date().getFullYear().toString(),
        category_bn: "",
        description_bn: "",
        description_en: "",
        image_url: "",
      });
      setPreviewUrl("");
    }
    setSelectedFile(null);
  }, [achievementToEdit, isOpen]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন", "Please select a valid image file"));
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_bn.trim()) {
      toast.error(t("অর্জন বা পুরস্কারের বাংলা শিরোনাম আবশ্যক", "Bangla title is required"));
      return;
    }

    if (!formData.description_bn.trim()) {
      toast.error(t("অর্জন বা পুরস্কারের বিবরণ আবশ্যক", "Description is required"));
      return;
    }

    try {
      setLoading(true);

      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        toast.info(t("ছবি আপলোড হচ্ছে...", "Uploading photo..."));
        finalImageUrl = await uploadCmsFile("cms-gallery", selectedFile, "achievements");
      }

      const payload = {
        title_bn: formData.title_bn.trim(),
        title_en: formData.title_en.trim() || null,
        year: formData.year.trim(),
        category_bn: formData.category_bn.trim() || null,
        description_bn: formData.description_bn.trim(),
        description_en: formData.description_en.trim() || null,
        image_url: finalImageUrl || null,
      };

      await saveAchievement({
        ...(achievementToEdit ? { id: achievementToEdit.id } : {}),
        ...payload,
      });

      toast.success(
        achievementToEdit
          ? t("অর্জন সফলভাবে আপডেট হয়েছে", "Achievement updated successfully")
          : t("নতুন অর্জন সফলভাবে যুক্ত হয়েছে", "Achievement added successfully")
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving achievement:", err);
      toast.error(err.message || t("অর্জন সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save achievement"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Award className="h-5 w-5 text-amber-500" />
            {achievementToEdit
              ? t("অর্জন বা সাফল্য সম্পাদনা করুন", "Edit Achievement")
              : t("নতুন সাফল্য বা মাইলফলক যোগ করুন", "Add Milestone or Achievement")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "প্রতিষ্ঠান বা শিক্ষার্থীদের জাতীয় ও আন্তর্জাতিক পর্যায়ের অর্জনসমূহ",
              "National and divisional achievements, awards, and milestones"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Photo Upload */}
          <div className="space-y-1.5">
            <Label className="font-semibold">{t("অর্জন বা ট্রফির ছবি (ঐচ্ছিক)", "Achievement Photo")}</Label>
            {previewUrl ? (
              <div className="relative rounded-lg border border-border/70 overflow-hidden bg-muted/20">
                <div className="aspect-16/9 w-full overflow-hidden bg-black/5 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setFormData({ ...formData, image_url: "" });
                  }}
                  title={t("ছবি পরিবর্তন করুন", "Remove photo")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/30 bg-amber-500/5 p-4 text-center cursor-pointer hover:border-amber-500/60 transition-colors"
              >
                <UploadCloud className="h-8 w-8 text-amber-600/70 mb-1" />
                <p className="text-sm font-semibold">{t("ছবি আপলোড করুন", "Upload Photo")}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Title BN */}
          <div className="space-y-1.5">
            <Label htmlFor="ach_title_bn" className="font-semibold">
              {t("অর্জনের শিরোনাম (বাংলা) *", "Title (Bangla) *")}
            </Label>
            <Input
              id="ach_title_bn"
              value={formData.title_bn}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
              placeholder={t("যেমন: জাতীয় হিফজুল কুরআন প্রতিযোগিতায় ১ম স্থান", "e.g. 1st Place in National Quran Recitation")}
              required
            />
          </div>

          {/* Title EN */}
          <div className="space-y-1.5">
            <Label htmlFor="ach_title_en">
              {t("অর্জনের শিরোনাম (ইংরেজি)", "Title (English)")}
            </Label>
            <Input
              id="ach_title_en"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="e.g. 1st Place in National Quran Recitation"
            />
          </div>

          {/* Year & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ach_year" className="font-semibold">{t("বছর (Year) *", "Year *")}</Label>
              <Input
                id="ach_year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2026"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ach_cat">{t("ক্যাটাগরি", "Category")}</Label>
              <Input
                id="ach_cat"
                value={formData.category_bn}
                onChange={(e) => setFormData({ ...formData, category_bn: e.target.value })}
                placeholder={t("যেমন: হিফজ / অলিম্পিয়াড", "e.g. Hifz / Olympiad")}
              />
            </div>
          </div>

          {/* Description BN */}
          <div className="space-y-1.5">
            <Label htmlFor="ach_desc_bn" className="font-semibold">
              {t("বিস্তারিত বিবরণ (বাংলা) *", "Description (Bangla) *")}
            </Label>
            <Textarea
              id="ach_desc_bn"
              value={formData.description_bn}
              onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
              rows={3}
              placeholder={t("সাফল্যের প্রেক্ষাপট এবং প্রতিযোগীর তথ্য লিখুন...", "Details regarding the milestone...")}
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {achievementToEdit ? t("আপডেট করুন", "Save Changes") : t("সংরক্ষণ করুন", "Add Achievement")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
