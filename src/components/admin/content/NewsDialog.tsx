import { useState, useEffect } from "react";
import { Loader2, Newspaper, Tag, Calendar as CalendarIcon, Image as ImageIcon, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { extractEmbedUrl } from "@/lib/facebookEmbed";
import { FacebookEmbed } from "@/components/FacebookEmbed";
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
import { saveNewsToFirestore, updateNewsInFirestore, type NewsPost } from "@/lib/news";

const FacebookIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22 12.07C22 6.5 17.52 2 11.93 2C6.35 2 1.86 6.5 1.86 12.07C1.86 17.1 5.53 21.26 10.33 22v-7.05H7.7v-2.88h2.63V9.85c0-2.6 1.55-4.04 3.93-4.04c1.14 0 2.33.2 2.33.2v2.56h-1.31c-1.29 0-1.69.8-1.69 1.62v1.95h2.88l-.46 2.88h-2.42V22c4.8-.74 8.47-4.9 8.47-9.93Z" />
  </svg>
);

interface NewsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newsToEdit?: NewsPost | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "ভর্তি", labelBn: "ভর্তি ও সেশন", labelEn: "Admission" },
  { value: "সাফল্য", labelBn: "সাফল্য ও অর্জন", labelEn: "Achievements" },
  { value: "একাডেমিক", labelBn: "একাডেমিক কার্যক্রম", labelEn: "Academic" },
  { value: "অনুষ্ঠান", labelBn: "অনুষ্ঠান ও সম্মেলন", labelEn: "Events & Programs" },
  { value: "নোটিশ", labelBn: "জরুরি নোটিশ", labelEn: "Notice" },
  { value: "সাধারণ", labelBn: "সাধারণ সংবাদ", labelEn: "General News" },
];

export const NewsDialog = ({
  isOpen,
  onClose,
  newsToEdit,
  onSuccess,
}: NewsDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);

  const [formData, setFormData] = useState({
    titleBn: "",
    titleEn: "",
    excerptBn: "",
    excerptEn: "",
    date: "",
    imageUrl: "/hero-campus.jpg",
    category: "সাধারণ",
    embedCode: "",
  });

  useEffect(() => {
    if (newsToEdit) {
      setFormData({
        titleBn: newsToEdit.titleBn || "",
        titleEn: newsToEdit.titleEn || "",
        excerptBn: newsToEdit.excerptBn || "",
        excerptEn: newsToEdit.excerptEn || "",
        date: newsToEdit.date || new Date().toISOString().split("T")[0],
        imageUrl: newsToEdit.imageUrl || "/hero-campus.jpg",
        category: newsToEdit.category || "সাধারণ",
        embedCode: newsToEdit.embedCode || "",
      });
      setShowEmbedPreview(Boolean(newsToEdit.embedCode));
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        titleBn: "",
        titleEn: "",
        excerptBn: "",
        excerptEn: "",
        date: today,
        imageUrl: "/hero-campus.jpg",
        category: "সাধারণ",
        embedCode: "",
      });
      setShowEmbedPreview(false);
    }
  }, [newsToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titleBn.trim() || !formData.titleEn.trim()) {
      toast.error(
        t(
          "অনুগ্রহ করে বাংলা ও ইংরেজি উভয় শিরোনাম পূরণ করুন",
          "Please fill in both Bangla and English titles"
        )
      );
      return;
    }

    if (!formData.excerptBn.trim()) {
      toast.error(
        t(
          "অনুগ্রহ করে সংবাদের বিবরণ বা সারসংক্ষেপ প্রদান করুন",
          "Please provide news description or excerpt"
        )
      );
      return;
    }

    setLoading(true);
    try {
      const rawEmbed = formData.embedCode.trim();
      const resolvedEmbedUrl = rawEmbed ? extractEmbedUrl(rawEmbed) : undefined;

      const payload = {
        titleBn: formData.titleBn.trim(),
        titleEn: formData.titleEn.trim(),
        excerptBn: formData.excerptBn.trim(),
        excerptEn: formData.excerptEn.trim() || formData.excerptBn.trim(),
        date: formData.date || new Date().toISOString().split("T")[0],
        imageUrl: formData.imageUrl.trim() || "/hero-campus.jpg",
        category: formData.category,
        embedCode: resolvedEmbedUrl,
      };

      if (newsToEdit?.id) {
        await updateNewsInFirestore(newsToEdit.id, payload);
        toast.success(t("সংবাদ সফলভাবে আপডেট হয়েছে", "News updated successfully"));
      } else {
        await saveNewsToFirestore(payload);
        toast.success(t("নতুন সংবাদ সফলভাবে প্রকাশিত হয়েছে", "News published successfully"));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving news:", err);
      toast.error(
        t(
          "সংবাদ সংরক্ষণ করতে সমস্যা হয়েছে",
          "Failed to save news"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-sky-500/15 text-sky-600">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bengali font-bold">
                {newsToEdit
                  ? t("সংবাদ সম্পাদনা করুন", "Edit News")
                  : t("নতুন সংবাদ প্রকাশ করুন", "Publish New News")}
              </DialogTitle>
              <DialogDescription className="font-bengali text-xs text-muted-foreground mt-0.5">
                {t(
                  "ওয়েবসাইটের পাবলিক নিউজ পেজের জন্য সংবাদ ও আপডেট প্রকাশ করুন",
                  "Publish news and updates for the public website news section"
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-bengali text-sm font-semibold flex items-center gap-1.5">
                {t("শিরোনাম (বাংলা)", "Title (Bangla)")} <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="যেমন: ২০২৬ শিক্ষাবর্ষে ভর্তি চলছে..."
                value={formData.titleBn}
                onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                className="font-bengali rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                {t("Title (English)", "Title (English)")} <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Admission open for 2026..."
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-bengali text-sm font-semibold flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {t("ক্যাটাগরি / বিভাগ", "Category")}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="font-bengali rounded-xl">
                  <SelectValue placeholder={t("ক্যাটাগরি নির্বাচন করুন", "Select category")} />
                </SelectTrigger>
                <SelectContent className="font-bengali">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.labelBn} ({cat.labelEn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bengali text-sm font-semibold flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {t("প্রকাশনার তারিখ", "Publication Date")} <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>
          </div>

          {/* Image URL & Preview */}
          <div className="space-y-2">
            <Label className="font-bengali text-sm font-semibold flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {t("ফিচারড ছবির লিংক (Image URL)", "Featured Image URL")}
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="/hero-campus.jpg বা অনলাইন ছবির URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="rounded-xl flex-1 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, imageUrl: "/hero-campus.jpg" })}
                className="rounded-xl text-xs font-bengali shrink-0"
              >
                {t("ডিফল্ট ছবি", "Default")}
              </Button>
            </div>

            {formData.imageUrl && (
              <div className="relative h-28 w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hero-campus.jpg";
                  }}
                />
                <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm font-bengali">
                  {t("ছবির প্রিভিউ", "Preview")}
                </span>
              </div>
            )}
          </div>

          {/* Excerpts */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="font-bengali text-sm font-semibold flex items-center gap-1.5">
                {t("সংবাদের বিবরণ (বাংলা)", "Content / Excerpt (Bangla)")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={4}
                placeholder="সংবাদের বিস্তারিত বা গুরুত্বপূর্ণ তথ্য এখানে লিখুন..."
                value={formData.excerptBn}
                onChange={(e) => setFormData({ ...formData, excerptBn: e.target.value })}
                className="font-bengali rounded-xl resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                {t("Content / Excerpt (English)", "Content / Excerpt (English)")}
              </Label>
              <Textarea
                rows={3}
                placeholder="Write news summary or description in English..."
                value={formData.excerptEn}
                onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                className="rounded-xl resize-none"
              />
            </div>
          </div>

          {/* Facebook Post Embed (iframe or URL) */}
          <div className="space-y-2 rounded-2xl border border-blue-200/80 bg-blue-50/30 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="flex items-center justify-between">
              <Label htmlFor="news_embed_code" className="flex items-center gap-1.5 font-bengali text-xs font-semibold text-foreground">
                <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
                <span>{t("ফেসবুক পোস্ট এমবেড কোড / আইফ্রেম (ঐচ্ছিক)", "Facebook Post Embed / Iframe (Optional)")}</span>
              </Label>
              {formData.embedCode && (
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
              id="news_embed_code"
              rows={3}
              placeholder={`<iframe src="https://www.facebook.com/plugins/post.php?..." ...></iframe> অথবা ফেসবুক পোস্টের লিঙ্ক`}
              value={formData.embedCode}
              onChange={(e) => {
                setFormData({ ...formData, embedCode: e.target.value });
                if (e.target.value.trim()) setShowEmbedPreview(true);
              }}
              className="font-mono text-xs rounded-xl bg-background border-border/80"
            />
            <p className="font-bengali text-[11px] text-muted-foreground leading-relaxed">
              💡 ফেসবুক পোস্টের <span className="font-semibold text-foreground">"Embed / এমবেড"</span> থেকে পাওয়া সম্পূর্ণ <code className="text-blue-600 font-mono text-[10px]">&lt;iframe&gt;...&lt;/iframe&gt;</code> কোড অথবা সরাসরি ফেসবুক পোস্টের লিঙ্ক পেস্ট করতে পারবেন।
            </p>

            {showEmbedPreview && formData.embedCode && (
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
                      setFormData({ ...formData, embedCode: "" });
                      setShowEmbedPreview(false);
                    }}
                    className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3 mr-1" />
                    {t("রিমুভ", "Clear")}
                  </Button>
                </div>
                <FacebookEmbed embedCode={formData.embedCode} minHeight="380px" />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl font-bengali"
            >
              {t("বাতিল", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl font-bengali bg-sky-600 hover:bg-sky-700 text-white gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {newsToEdit
                ? t("আপডেট সংরক্ষণ করুন", "Save Changes")
                : t("সংবাদ প্রকাশ করুন", "Publish News")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
