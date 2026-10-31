import { useState, useEffect, useRef } from "react";
import { Loader2, UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { uploadCmsFile } from "@/lib/supabase/client";
import { saveHeroBanner } from "@/lib/heroBannerService";
import { useLanguage } from "@/contexts/LanguageContext";
import type { HeroBanner } from "@/types/cms";
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
import { Switch } from "@/components/ui/switch";

interface HeroBannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bannerToEdit?: HeroBanner | null;
  onSuccess: () => void;
}

export const HeroBannerDialog = ({
  isOpen,
  onClose,
  bannerToEdit,
  onSuccess,
}: HeroBannerDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title_bn: "",
    title_en: "",
    subtitle_bn: "",
    subtitle_en: "",
    image_url: "",
    cta_text_bn: "",
    cta_text_en: "",
    cta_link: "",
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    if (bannerToEdit) {
      setFormData({
        title_bn: bannerToEdit.title_bn,
        title_en: bannerToEdit.title_en || "",
        subtitle_bn: bannerToEdit.subtitle_bn || "",
        subtitle_en: bannerToEdit.subtitle_en || "",
        image_url: bannerToEdit.image_url,
        cta_text_bn: bannerToEdit.cta_text_bn || "",
        cta_text_en: bannerToEdit.cta_text_en || "",
        cta_link: bannerToEdit.cta_link || "",
        order_index: bannerToEdit.order_index || 0,
        is_active: bannerToEdit.is_active,
      });
      setPreviewUrl(bannerToEdit.image_url);
    } else {
      setFormData({
        title_bn: "",
        title_en: "",
        subtitle_bn: "",
        subtitle_en: "",
        image_url: "",
        cta_text_bn: "",
        cta_text_en: "",
        cta_link: "",
        order_index: 0,
        is_active: true,
      });
      setPreviewUrl("");
    }
    setSelectedFile(null);
  }, [bannerToEdit, isOpen]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন", "Please select a valid image file"));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error(t("ব্যানারের সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে", "Banner image size limit is 8MB"));
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_bn.trim()) {
      toast.error(t("ব্যানারের বাংলা শিরোনাম আবশ্যক", "Bangla title is required"));
      return;
    }

    if (!bannerToEdit && !selectedFile && !formData.image_url.trim()) {
      toast.error(t("অনুগ্রহ করে ব্যানারের ব্যাকগ্রাউন্ড ছবি আপলোড করুন", "Please upload a banner background image"));
      return;
    }

    try {
      setLoading(true);

      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        toast.info(t("ব্যানার ছবি আপলোড হচ্ছে...", "Uploading banner image..."));
        finalImageUrl = await uploadCmsFile("cms-branding", selectedFile, "hero-banners");
      }

      const payload = {
        title_bn: formData.title_bn.trim(),
        title_en: formData.title_en.trim() || null,
        subtitle_bn: formData.subtitle_bn.trim() || null,
        subtitle_en: formData.subtitle_en.trim() || null,
        image_url: finalImageUrl,
        cta_text_bn: formData.cta_text_bn.trim() || null,
        cta_text_en: formData.cta_text_en.trim() || null,
        cta_link: formData.cta_link.trim() || null,
        order_index: Number(formData.order_index) || 0,
        is_active: formData.is_active,
      };

      await saveHeroBanner({
        ...(bannerToEdit ? { id: bannerToEdit.id } : {}),
        ...payload,
      });

      toast.success(
        bannerToEdit
          ? t("হিরো ব্যানার সফলভাবে আপডেট করা হয়েছে", "Hero banner updated successfully")
          : t("নতুন ব্যানার সফলভাবে যুক্ত করা হয়েছে", "Hero banner added successfully")
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving hero banner:", err);
      toast.error(err.message || t("ব্যানার সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save banner"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            {bannerToEdit
              ? t("হিরো ব্যানার সম্পাদনা করুন", "Edit Hero Banner")
              : t("নতুন হিরো স্লাইডার ব্যানার", "Add Hero Slider Banner")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "হোমপেজ টপ স্লাইডারের ছবি, টাইটেল ও অ্যাকশন বাটন কনফিগার করুন",
              "Configure top homepage banner sliders and call-to-action buttons"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Banner Image Preview / Upload */}
          <div className="space-y-1.5">
            <Label className="font-semibold">{t("ব্যানার ব্যাকগ্রাউন্ড ছবি *", "Banner Background Image *")}</Label>
            
            {previewUrl ? (
              <div className="relative rounded-lg border border-border/70 overflow-hidden bg-muted/20">
                <div className="aspect-21/9 w-full overflow-hidden bg-black/10 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
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
                  title={t("ছবি পরিবর্তন করুন", "Change image")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-500/30 bg-blue-500/5 p-6 text-center cursor-pointer hover:border-blue-500/60 transition-colors"
              >
                <UploadCloud className="h-10 w-10 text-blue-600/70 mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  {t("ব্যানার ছবি আপলোড করুন", "Upload Banner Image")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ১৯২০x১০৮০ বা ১৬:৯ রেশিও সুপারিশকৃত (সর্বোচ্চ ৮ মেগাবাইট)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
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
            <Label htmlFor="banner_title_bn" className="font-semibold">
              {t("মূল শিরোনাম (বাংলা) *", "Headline (Bangla) *")}
            </Label>
            <Input
              id="banner_title_bn"
              value={formData.title_bn}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
              placeholder={t("যেমন: আননূর তাহফিজুল কুরআন মাদরাসা - আলোকিত মানুষ গড়ার প্রত্যয়", "e.g. Annoor Tahfizul Quran Madrasa")}
              required
            />
          </div>

          {/* Title EN */}
          <div className="space-y-1.5">
            <Label htmlFor="banner_title_en">
              {t("মূল শিরোনাম (ইংরেজি)", "Headline (English)")}
            </Label>
            <Input
              id="banner_title_en"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="e.g. Annoor Tahfizul Quran Madrasa - Nurturing Future Leaders"
            />
          </div>

          {/* Subtitle BN */}
          <div className="space-y-1.5">
            <Label htmlFor="banner_subtitle_bn">
              {t("সাব-শিরোনাম (বাংলা)", "Subtitle (Bangla)")}
            </Label>
            <Textarea
              id="banner_subtitle_bn"
              value={formData.subtitle_bn}
              onChange={(e) => setFormData({ ...formData, subtitle_bn: e.target.value })}
              rows={2}
              placeholder={t("আধুনিক শিক্ষা ও আদর্শ মূল্যবোধের সমন্বয়ে একটি বিশ্বস্ত প্রতিষ্ঠান", "Sub-headline description...")}
            />
          </div>

          {/* CTA Button Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="banner_cta_text_bn">{t("বাটন টেক্সট (বাংলা)", "Button Text (BN)")}</Label>
              <Input
                id="banner_cta_text_bn"
                value={formData.cta_text_bn}
                onChange={(e) => setFormData({ ...formData, cta_text_bn: e.target.value })}
                placeholder={t("যেমন: অনলাইনে আবেদন", "e.g. Apply Now")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="banner_cta_link">{t("বাটন লিংক (URL)", "Button Link")}</Label>
              <Input
                id="banner_cta_link"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                placeholder="/admission"
              />
            </div>
          </div>

          {/* Order Index & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="banner_order">{t("স্লাইডার ক্রম", "Slide Order")}</Label>
              <Input
                id="banner_order"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                min={0}
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-2.5 bg-card">
                <Label className="text-xs font-semibold">{t("ব্যানার সক্রিয়", "Is Active")}</Label>
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
            <Button type="submit" disabled={loading} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {bannerToEdit ? t("আপডেট করুন", "Save Changes") : t("যুক্ত করুন", "Save Banner")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
