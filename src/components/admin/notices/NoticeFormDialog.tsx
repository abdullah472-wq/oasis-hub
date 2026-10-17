import { useState, useEffect } from "react";
import { Loader2, UploadCloud, FileText, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase, uploadCmsFile, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { extractEmbedUrl, extractInlineEmbed } from "@/lib/facebookEmbed";
import { FacebookEmbed } from "@/components/FacebookEmbed";
import type { Notice, NoticeCategory } from "@/types/cms";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FacebookIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22 12.07C22 6.5 17.52 2 11.93 2C6.35 2 1.86 6.5 1.86 12.07C1.86 17.1 5.53 21.26 10.33 22v-7.05H7.7v-2.88h2.63V9.85c0-2.6 1.55-4.04 3.93-4.04c1.14 0 2.33.2 2.33.2v2.56h-1.31c-1.29 0-1.69.8-1.69 1.62v1.95h2.88l-.46 2.88h-2.42V22c4.8-.74 8.47-4.9 8.47-9.93Z" />
  </svg>
);

interface NoticeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noticeToEdit?: Notice | null;
  onSuccess: () => void;
}

export const NoticeFormDialog = ({
  isOpen,
  onClose,
  noticeToEdit,
  onSuccess,
}: NoticeFormDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);

  const [formData, setFormData] = useState({
    title_bn: "",
    title_en: "",
    content_bn: "",
    content_en: "",
    category: "general" as NoticeCategory,
    pdf_url: "",
    embed_code: "",
    is_published: true,
    is_featured: false,
    priority: 1,
    published_at: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (noticeToEdit) {
      const inline = extractInlineEmbed(noticeToEdit.content_bn);
      const existingEmbed = noticeToEdit.embed_code || inline.embedUrl || "";

      setFormData({
        title_bn: noticeToEdit.title_bn || "",
        title_en: noticeToEdit.title_en || "",
        content_bn: inline.cleanContent || noticeToEdit.content_bn || "",
        content_en: noticeToEdit.content_en || "",
        category: noticeToEdit.category || "general",
        pdf_url: noticeToEdit.pdf_url || "",
        embed_code: existingEmbed,
        is_published: noticeToEdit.is_published ?? true,
        is_featured: noticeToEdit.is_featured ?? false,
        priority: noticeToEdit.priority || 1,
        published_at: noticeToEdit.published_at || new Date().toISOString().split("T")[0],
      });
      setSelectedFile(null);
      setShowEmbedPreview(Boolean(existingEmbed));
    } else {
      setFormData({
        title_bn: "",
        title_en: "",
        content_bn: "",
        content_en: "",
        category: "general",
        pdf_url: "",
        embed_code: "",
        is_published: true,
        is_featured: false,
        priority: 1,
        published_at: new Date().toISOString().split("T")[0],
      });
      setSelectedFile(null);
      setShowEmbedPreview(false);
    }
  }, [noticeToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_bn.trim() || !formData.content_bn.trim()) {
      toast.error(t("বাংলা শিরোনাম ও বিস্তারিত বিবরণ আবশ্যক", "Bengali title and content are required"));
      return;
    }

    setLoading(true);

    try {
      let finalPdfUrl = formData.pdf_url;

      // If new PDF file selected, upload to Supabase storage bucket `cms-notices`
      if (selectedFile) {
        toast.info(t("পিডিএফ ফাইল আপলোড হচ্ছে...", "Uploading PDF file..."));
        finalPdfUrl = await uploadCmsFile("cms-notices", selectedFile, "notices");
      }

      const rawEmbed = formData.embed_code.trim();
      const resolvedEmbedUrl = rawEmbed ? extractEmbedUrl(rawEmbed) : null;

      const payload: any = {
        title_bn: formData.title_bn.trim(),
        title_en: formData.title_en?.trim() || null,
        content_bn: formData.content_bn.trim(),
        content_en: formData.content_en?.trim() || null,
        category: formData.category,
        pdf_url: finalPdfUrl || null,
        embed_code: resolvedEmbedUrl,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        priority: Number(formData.priority) || 1,
        published_at: formData.published_at,
        updated_at: new Date().toISOString(),
      };

      const executeSave = async (dataPayload: any) => {
        if (noticeToEdit?.id) {
          return await supabase
            .from("notices")
            .update(dataPayload)
            .eq("id", noticeToEdit.id);
        } else {
          return await supabase.from("notices").insert([dataPayload]);
        }
      };

      let result = await executeSave(payload);

      // If embed_code column does not exist in Supabase table yet, gracefully fallback
      if (
        result.error &&
        (result.error.message?.includes("embed_code") ||
          result.error.code === "PGRST204" ||
          result.error.message?.toLowerCase().includes("column"))
      ) {
        console.warn("embed_code column not found in notices, applying inline fallback");
        const fallbackPayload = { ...payload };
        delete fallbackPayload.embed_code;
        if (resolvedEmbedUrl) {
          fallbackPayload.content_bn = `<!-- fb_embed: ${resolvedEmbedUrl} -->\n${payload.content_bn}`;
        }
        result = await executeSave(fallbackPayload);
      }

      if (result.error) throw result.error;

      if (noticeToEdit?.id) {
        await logAdminActivity("UPDATE", "notices", `Updated notice: ${payload.title_bn}`);
        toast.success(t("নোটিশ সফলভাবে হালনাগাদ করা হয়েছে", "Notice updated successfully"));
      } else {
        await logAdminActivity("CREATE", "notices", `Created notice: ${payload.title_bn}`);
        toast.success(t("নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে", "Notice published successfully"));
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Notice save error:", err);
      const msg = err instanceof Error ? err.message : "Error saving notice";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="font-bengali text-xl font-bold">
            {noticeToEdit
              ? t("নোটিশ সম্পাদনা করুন", "Edit Notice")
              : t("নতুন নোটিশ তৈরি করুন", "Create New Notice")}
          </DialogTitle>
          <DialogDescription className="font-bengali text-xs text-muted-foreground">
            {t("ওয়েবসাইটের সাধারণ দর্শনার্থীদের জন্য প্রাতিষ্ঠানিক নোটিশ প্রকাশ করুন", "Publish official announcements and circulars")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          {/* Titles */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title_bn" className="font-bengali text-xs font-semibold">
                {t("শিরোনাম (বাংলা)", "Title (Bengali)")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title_bn"
                placeholder="যেমন: বার্ষিক পরীক্ষার সময়সূচি প্রকাশ"
                value={formData.title_bn}
                onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_en" className="font-bengali text-xs font-semibold">
                {t("শিরোনাম (ইংরেজি)", "Title (English)")}
              </Label>
              <Input
                id="title_en"
                placeholder="e.g., Annual Exam Routine Published"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Category, Date, Priority */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="font-bengali text-xs font-semibold">
                {t("ক্যাটাগরি", "Category")}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val: NoticeCategory) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="general">{t("সাধারণ", "General")}</SelectItem>
                  <SelectItem value="academic">{t("একাডেমিক", "Academic")}</SelectItem>
                  <SelectItem value="admission">{t("ভর্তি সংক্রান্ত", "Admission")}</SelectItem>
                  <SelectItem value="holiday">{t("ছুটির নোটিশ", "Holiday")}</SelectItem>
                  <SelectItem value="emergency">{t("জরুরি", "Emergency")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="published_at" className="font-bengali text-xs font-semibold">
                {t("প্রকাশের তারিখ", "Publish Date")}
              </Label>
              <Input
                id="published_at"
                type="date"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="font-bengali text-xs font-semibold">
                {t("অগ্রাধিকার (Priority)", "Priority (1-5)")}
              </Label>
              <Input
                id="priority"
                type="number"
                min={1}
                max={5}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Content (Bangla) */}
          <div className="space-y-2">
            <Label htmlFor="content_bn" className="font-bengali text-xs font-semibold">
              {t("বিস্তারিত বিবরণ (বাংলা)", "Content (Bengali)")} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content_bn"
              rows={4}
              placeholder="নোটিশের বিস্তারিত তথ্য এখানে লিখুন..."
              value={formData.content_bn}
              onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
              required
              className="rounded-xl resize-y"
            />
          </div>

          {/* Content (English) */}
          <div className="space-y-2">
            <Label htmlFor="content_en" className="font-bengali text-xs font-semibold">
              {t("বিস্তারিত বিবরণ (ইংরেজি)", "Content (English)")}
            </Label>
            <Textarea
              id="content_en"
              rows={3}
              placeholder="Notice details in English (optional)..."
              value={formData.content_en}
              onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
              className="rounded-xl resize-y"
            />
          </div>

          {/* PDF Attachment Upload */}
          <div className="space-y-2">
            <Label className="font-bengali text-xs font-semibold">
              {t("পিডিএফ ডকুমেন্ট সংযুক্ত করুন (ঐচ্ছিক)", "PDF Document Attachment (Optional)")}
            </Label>

            {formData.pdf_url && !selectedFile && (
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden text-primary">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t("সংযুক্ত পিডিএফ ফাইল রয়েছে", "Attached PDF active")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={formData.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bengali text-xs font-semibold underline hover:text-primary/80"
                  >
                    {t("দেখুন", "View")}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData({ ...formData, pdf_url: "" })}
                    className="h-6 w-6 text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="pdf_file_input"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="pdf_file_input"
                className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-dashed border-border p-4 text-center transition-colors hover:border-primary hover:bg-secondary/40"
              >
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
                <span className="font-bengali text-xs font-medium text-foreground">
                  {selectedFile
                    ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
                    : t("নতুন পিডিএফ ফাইল নির্বাচন করুন", "Choose PDF Document")}
                </span>
              </label>
            </div>
          </div>

          {/* Facebook Post Embed (iframe or URL) */}
          <div className="space-y-2 rounded-2xl border border-blue-200/80 bg-blue-50/30 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="flex items-center justify-between">
              <Label htmlFor="embed_code" className="flex items-center gap-1.5 font-bengali text-xs font-semibold text-foreground">
                <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
                <span>{t("ফেসবুক পোস্ট এমবেড কোড / আইফ্রেম (ঐচ্ছিক)", "Facebook Post Embed / Iframe (Optional)")}</span>
              </Label>
              {formData.embed_code && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmbedPreview(!showEmbedPreview)}
                  className="h-7 px-2 font-bengali text-[11px] text-blue-600 dark:text-blue-400 gap-1"
                >
                  {showEmbedPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showEmbedPreview ? t("প্রিভিউ লুকান", "Hide Preview") : t("প্রিভিউ দেখুন", "Show Preview")}</span>
                </Button>
              )}
            </div>

            <Textarea
              id="embed_code"
              rows={3}
              placeholder={`<iframe src="https://www.facebook.com/plugins/post.php?..." ...></iframe> অথবা ফেসবুক পোস্টের লিঙ্ক`}
              value={formData.embed_code}
              onChange={(e) => {
                setFormData({ ...formData, embed_code: e.target.value });
                if (e.target.value.trim()) setShowEmbedPreview(true);
              }}
              className="font-mono text-xs rounded-xl bg-background border-border/80"
            />
            <p className="font-bengali text-[11px] text-muted-foreground leading-relaxed">
              💡 ফেসবুক পোস্টের <span className="font-semibold text-foreground">"Embed / এমবেড"</span> থেকে পাওয়া সম্পূর্ণ <code className="text-blue-600 font-mono text-[10px]">&lt;iframe&gt;...&lt;/iframe&gt;</code> কোড অথবা সরাসরি ফেসবুক পোস্টের লিঙ্ক পেস্ট করতে পারবেন।
            </p>

            {showEmbedPreview && formData.embed_code && (
              <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bengali text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    {t("পোস্ট প্রিভিউ:", "Live Embed Preview:")}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData({ ...formData, embed_code: "" });
                      setShowEmbedPreview(false);
                    }}
                    className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3 mr-1" />
                    {t("রিমুভ", "Clear")}
                  </Button>
                </div>
                <FacebookEmbed embedCode={formData.embed_code} minHeight="380px" />
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary/30 p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="is_published" className="cursor-pointer font-bengali text-xs font-semibold">
                {t("ওয়েবসাইটে প্রকাশ করুন", "Publish immediately")}
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured" className="cursor-pointer font-bengali text-xs font-semibold">
                {t("হোমপেজে পিন করুন (Featured)", "Pin to Homepage (Featured)")}
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl font-bengali text-xs"
            >
              {t("বাতিল", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl font-bengali text-xs font-semibold shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  {t("সংরক্ষণ হচ্ছে...", "Saving...")}
                </>
              ) : (
                t("সংরক্ষণ করুন", "Save Notice")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
