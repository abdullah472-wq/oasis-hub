import { useState, useEffect, useRef } from "react";
import { Loader2, UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { uploadCmsFile } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { GalleryItem, GalleryCategory } from "@/types/cms";
import { saveGalleryItem } from "@/lib/galleryService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GalleryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: GalleryItem | null;
  onSuccess: () => void;
}

export const GalleryFormDialog = ({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}: GalleryFormDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title_bn: "",
    title_en: "",
    caption_bn: "",
    caption_en: "",
    date_label: "",
    image_url: "",
    category: "campus" as GalleryCategory,
    order_index: 0,
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        title_bn: itemToEdit.title_bn,
        title_en: itemToEdit.title_en || "",
        caption_bn: itemToEdit.caption_bn || "",
        caption_en: itemToEdit.caption_en || "",
        date_label: itemToEdit.date_label || "",
        image_url: itemToEdit.image_url,
        category: itemToEdit.category || "campus",
        order_index: itemToEdit.order_index || 0,
      });
      setPreviewUrl(itemToEdit.image_url);
    } else {
      setFormData({
        title_bn: "",
        title_en: "",
        caption_bn: "",
        caption_en: "",
        date_label: "",
        image_url: "",
        category: "campus",
        order_index: 0,
      });
      setPreviewUrl("");
    }
    setSelectedFile(null);
  }, [itemToEdit, isOpen]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন", "Please select a valid image file"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট হতে পারবে", "Image size limit is 10MB"));
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_bn.trim()) {
      toast.error(t("বাংলা শিরোনাম আবশ্যক", "Bangla title is required"));
      return;
    }

    if (!itemToEdit && !selectedFile && !formData.image_url.trim()) {
      toast.error(t("অনুগ্রহ করে একটি ছবি আপলোড করুন", "Please upload an image"));
      return;
    }

    try {
      setLoading(true);

      let finalImageUrl = formData.image_url;

      // Upload file to Supabase cms-gallery bucket if new file was chosen
      if (selectedFile) {
        toast.info(t("ছবি Supabase Storage-এ আপলোড হচ্ছে...", "Uploading image to Supabase Storage..."));
        finalImageUrl = await uploadCmsFile("cms-gallery", selectedFile, "gallery");
      }

      const payload = {
        title_bn: formData.title_bn.trim(),
        title_en: formData.title_en.trim() || null,
        caption_bn: formData.caption_bn.trim() || null,
        caption_en: formData.caption_en.trim() || null,
        date_label: formData.date_label.trim() || null,
        image_url: finalImageUrl,
        category: formData.category,
        order_index: Number(formData.order_index) || 0,
      };

      await saveGalleryItem({
        ...(itemToEdit?.id ? { id: itemToEdit.id } : {}),
        ...payload,
      });

      toast.success(
        itemToEdit
          ? t("গ্যালারি সফলভাবে আপডেট হয়েছে", "Gallery item updated successfully")
          : t("নতুন ছবি গ্যালারিতে যোগ হয়েছে", "Image added to gallery successfully")
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving gallery item:", err);
      toast.error(err.message || t("ছবি সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save image"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            {itemToEdit
              ? t("গ্যালারি ছবি সম্পাদনা করুন", "Edit Gallery Image")
              : t("নতুন ছবি আপলোড করুন", "Upload New Photo")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "ক্যাম্পাস, অনুষ্ঠান ও অর্জনের হাই-কোয়ালিটি ছবি আপলোড করুন",
              "Upload high-resolution photos for campus, events, and milestones"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Drag & Drop File Zone */}
          <div className="space-y-1.5">
            <Label className="font-semibold">{t("ছবি ফাইল (Supabase cms-gallery) *", "Image File *")}</Label>
            
            {previewUrl ? (
              <div className="relative rounded-lg border border-border/70 overflow-hidden bg-muted/20">
                <div className="aspect-video w-full overflow-hidden bg-black/5 flex items-center justify-center">
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
                  title={t("ছবি পরিবর্তন করুন", "Change Image")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
              >
                <UploadCloud className="h-10 w-10 text-primary/70 mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  {t("ছবি ড্র্যাগ করুন অথবা ব্রাউজ করুন", "Drag & Drop image here, or Browse")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP (সর্বোচ্চ ১০ মেগাবাইট)
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
            <Label htmlFor="gallery_title_bn" className="font-semibold">
              {t("ছবির ক্যাপশন / শিরোনাম (বাংলা) *", "Image Caption / Title (Bangla) *")}
            </Label>
            <Input
              id="gallery_title_bn"
              value={formData.title_bn}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
              placeholder={t("যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬", "e.g. Annual Sports Competition 2026")}
              required
            />
          </div>

          {/* Title EN */}
          <div className="space-y-1.5">
            <Label htmlFor="gallery_title_en">
              {t("ক্যাপশন বা শিরোনাম (ইংরেজি)", "Caption or Title (English)")}
            </Label>
            <Input
              id="gallery_title_en"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="e.g. Annual Sports Competition 2026"
            />
          </div>

          {/* Detailed Caption BN */}
          <div className="space-y-1.5">
            <Label htmlFor="gallery_caption_bn">
              {t("বিস্তারিত বিবরণ (বাংলা)", "Detailed Description (Bangla)")}
            </Label>
            <Textarea
              id="gallery_caption_bn"
              rows={2}
              value={formData.caption_bn}
              onChange={(e) => setFormData({ ...formData, caption_bn: e.target.value })}
              placeholder={t("ছবি সম্পর্কিত সংক্ষিপ্ত তথ্য বা স্মৃতি বিবরণ...", "Brief details or background context...")}
            />
          </div>

          {/* Date / Occasion Label */}
          <div className="space-y-1.5">
            <Label htmlFor="gallery_date">
              {t("তারিখ বা উপলক্ষ লেবেল", "Date / Event Label")}
            </Label>
            <Input
              id="gallery_date"
              value={formData.date_label}
              onChange={(e) => setFormData({ ...formData, date_label: e.target.value })}
              placeholder={t("যেমন: ফেব্রুয়ারি ২০২৬ বা বার্ষিক সমাবর্তন", "e.g. February 2026 or Annual Convocation")}
            />
          </div>

          {/* Category & Order Index */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold">{t("ক্যাটাগরি *", "Category *")}</Label>
              <Select
                value={formData.category}
                onValueChange={(val: GalleryCategory) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campus">{t("ক্যাম্পাস (Campus)", "Campus")}</SelectItem>
                  <SelectItem value="event">{t("অনুষ্ঠান / ইভেন্ট (Event)", "Event")}</SelectItem>
                  <SelectItem value="academic">{t("একাডেমিক (Academic)", "Academic")}</SelectItem>
                  <SelectItem value="achievement">{t("অর্জন ও পুরস্কার (Achievement)", "Achievement")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gallery_order">{t("সিরিয়াল ক্রম", "Display Order")}</Label>
              <Input
                id="gallery_order"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-primary">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {itemToEdit ? t("আপডেট করুন", "Save Changes") : t("আপলোড করুন", "Upload Photo")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
