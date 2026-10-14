import { useState, useEffect, useRef } from "react";
import { Loader2, UploadCloud, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { supabase, uploadCmsFile, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DownloadItem } from "@/types/cms";
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

interface DownloadFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: DownloadItem | null;
  onSuccess: () => void;
}

export const DownloadFormDialog = ({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}: DownloadFormDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title_bn: "",
    title_en: "",
    description_bn: "",
    description_en: "",
    file_url: "",
    file_size_label: "",
    file_type: "PDF",
    is_active: true,
    order_index: 0,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        title_bn: itemToEdit.title_bn,
        title_en: itemToEdit.title_en || "",
        description_bn: itemToEdit.description_bn || "",
        description_en: itemToEdit.description_en || "",
        file_url: itemToEdit.file_url,
        file_size_label: itemToEdit.file_size_label || "",
        file_type: itemToEdit.file_type || "PDF",
        is_active: itemToEdit.is_active,
        order_index: itemToEdit.order_index || 0,
      });
    } else {
      setFormData({
        title_bn: "",
        title_en: "",
        description_bn: "",
        description_en: "",
        file_url: "",
        file_size_label: "",
        file_type: "PDF",
        is_active: true,
        order_index: 0,
      });
    }
    setSelectedFile(null);
  }, [itemToEdit, isOpen]);

  const handleFileChange = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      toast.error(t("ফাইলের সাইজ সর্বোচ্চ ২৫ মেগাবাইট হতে পারবে", "File size limit is 25MB"));
      return;
    }
    setSelectedFile(file);
    const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
    const size = formatFileSize(file.size);
    setFormData((prev) => ({
      ...prev,
      file_type: ext,
      file_size_label: size,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_bn.trim()) {
      toast.error(t("বাংলা শিরোনাম আবশ্যক", "Bangla title is required"));
      return;
    }

    if (!itemToEdit && !selectedFile && !formData.file_url.trim()) {
      toast.error(t("অনুগ্রহ করে একটি ফাইল আপলোড করুন", "Please select a file to upload"));
      return;
    }

    try {
      setLoading(true);

      let finalFileUrl = formData.file_url;
      let finalFileSize = formData.file_size_label;
      let finalFileType = formData.file_type;

      if (selectedFile) {
        toast.info(t("ফাইল Supabase Storage-এ আপলোড হচ্ছে...", "Uploading file to Supabase Storage..."));
        finalFileUrl = await uploadCmsFile("cms-downloads", selectedFile, "documents");
        finalFileSize = formatFileSize(selectedFile.size);
        finalFileType = selectedFile.name.split(".").pop()?.toUpperCase() || "PDF";
      }

      const payload = {
        title_bn: formData.title_bn.trim(),
        title_en: formData.title_en.trim() || null,
        description_bn: formData.description_bn.trim() || null,
        description_en: formData.description_en.trim() || null,
        file_url: finalFileUrl,
        file_size_label: finalFileSize || null,
        file_type: finalFileType || "PDF",
        is_active: formData.is_active,
        order_index: Number(formData.order_index) || 0,
        updated_at: new Date().toISOString(),
      };

      if (itemToEdit) {
        const { error } = await supabase
          .from("downloads")
          .update(payload)
          .eq("id", itemToEdit.id);

        if (error) throw error;

        await logAdminActivity(
          "UPDATE",
          "downloads",
          `ডাউনলোড রিসোর্স আপডেট: "${payload.title_bn}"`
        );
        toast.success(t("রিসোর্স সফলভাবে আপডেট করা হয়েছে", "Resource updated successfully"));
      } else {
        const { error } = await supabase
          .from("downloads")
          .insert([payload]);

        if (error) throw error;

        await logAdminActivity(
          "CREATE",
          "downloads",
          `নতুন ডাউনলোড ফাইল আপলোড: "${payload.title_bn}"`
        );
        toast.success(t("নতুন ফাইল সফলভাবে যোগ করা হয়েছে", "File added successfully"));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving download resource:", err);
      toast.error(err.message || t("ফাইল সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save file"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-5 w-5 text-emerald-600" />
            {itemToEdit
              ? t("রিসোর্স ফাইল সম্পাদনা করুন", "Edit Download Resource")
              : t("নতুন পাবলিক রিসোর্স যোগ করুন", "Add Public Resource File")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "প্রসপেক্টাস, সিলেবাস, ছুটির তালিকা বা পরীক্ষার রুটিন আপলোড করুন",
              "Upload institution prospectuses, syllabus, academic calendars, or forms"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* File Upload Zone */}
          <div className="space-y-1.5">
            <Label className="font-semibold">{t("ডকুমেন্ট ফাইল (Supabase cms-downloads) *", "Document File *")}</Label>
            
            {selectedFile || formData.file_url ? (
              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs uppercase">
                    {formData.file_type || "PDF"}
                  </div>
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {selectedFile ? selectedFile.name : formData.file_url.split("/").pop()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formData.file_size_label || (selectedFile && formatFileSize(selectedFile.size))}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-rose-600"
                  onClick={() => {
                    setSelectedFile(null);
                    setFormData({ ...formData, file_url: "" });
                  }}
                  title={t("ফাইল পরিবর্তন করুন", "Remove file")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 p-6 text-center cursor-pointer hover:border-emerald-500/60 transition-colors"
              >
                <UploadCloud className="h-10 w-10 text-emerald-600/70 mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  {t("ফাইল সিলেক্ট করুন বা ড্র্যাগ করুন", "Select file or Drag & Drop")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOCX, XLSX, ZIP (সর্বোচ্চ ২৫ মেগাবাইট)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.zip,.rar"
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
            <Label htmlFor="download_title_bn" className="font-semibold">
              {t("ফাইলের শিরোনাম (বাংলা) *", "File Title (Bangla) *")}
            </Label>
            <Input
              id="download_title_bn"
              value={formData.title_bn}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
              placeholder={t("যেমন: প্রাতিষ্ঠানিক প্রসপেক্টাস ও ভর্তি নির্দেশিকা ২০২৬", "e.g. Institutional Prospectus 2026")}
              required
            />
          </div>

          {/* Title EN */}
          <div className="space-y-1.5">
            <Label htmlFor="download_title_en">
              {t("ফাইলের শিরোনাম (ইংরেজি)", "File Title (English)")}
            </Label>
            <Input
              id="download_title_en"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="e.g. Institutional Prospectus & Admission Guide 2026"
            />
          </div>

          {/* Description BN */}
          <div className="space-y-1.5">
            <Label htmlFor="download_desc_bn">
              {t("সংক্ষিপ্ত বিবরণ (বাংলা)", "Short Description (Bangla)")}
            </Label>
            <Textarea
              id="download_desc_bn"
              value={formData.description_bn}
              onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
              rows={2}
              placeholder={t("ফাইলটির সংক্ষিপ্ত বিবরণ দিন...", "Brief overview of this document...")}
            />
          </div>

          {/* Order Index & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="download_order">{t("সিরিয়াল ক্রম", "Display Order")}</Label>
              <Input
                id="download_order"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                min={0}
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-2.5 bg-card">
                <Label className="text-xs font-semibold">{t("পাবলিকলি সক্রিয়", "Is Active")}</Label>
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
            <Button type="submit" disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {itemToEdit ? t("আপডেট করুন", "Save Changes") : t("আপলোড করুন", "Upload File")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
