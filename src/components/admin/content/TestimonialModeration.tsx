import { useState, useEffect, useMemo } from "react";
import {
  MessageSquareQuote,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCw,
  Search,
  Plus,
  Pencil,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Testimonial } from "@/types/cms";
import {
  parsePlatformAndRelation,
  formatPlatformAndRelation,
  type ReviewPlatform,
  getCachedReviews,
  setCachedReviews,
  DEFAULT_REVIEWS,
  type Review,
} from "@/lib/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TestimonialModeration = () => {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);
  const [deletingItem, setDeletingItem] = useState<Testimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    author_name: string;
    relation_title_bn: string;
    relation_title_en: string;
    review_text_bn: string;
    review_text_en: string;
    rating: number;
    is_approved: boolean;
    platform: ReviewPlatform;
  }>({
    author_name: "",
    relation_title_bn: "অভিভাবক",
    relation_title_en: "Guardian",
    review_text_bn: "",
    review_text_en: "",
    rating: 5,
    is_approved: true,
    platform: "google",
  });

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      let parsedData: Testimonial[] = [];
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        parsedData = ((data as Testimonial[]) || []).map((row) => {
          const parsed = parsePlatformAndRelation(row.relation_title_en, row.relation_title_bn);
          return {
            ...row,
            platform: parsed.platform,
          };
        });
      }

      // Merge cached reviews
      const cached = getCachedReviews();
      const existingIds = new Set(parsedData.map((t) => t.id));
      const formattedCached: Testimonial[] = cached
        .filter((c) => !existingIds.has(c.id || ""))
        .map((c) => ({
          id: c.id || `local-${Date.now()}`,
          author_name: c.name,
          relation_title_bn: c.relation,
          relation_title_en: c.relationEn,
          review_text_bn: c.review,
          review_text_en: c.reviewEn,
          rating: c.rating || 5,
          is_approved: c.approved,
          created_at: new Date(c.createdAt).toISOString(),
          platform: c.platform,
        }));

      let allItems = [...parsedData, ...formattedCached];

      // If neither Supabase nor cache has items yet, seed default reviews so admin can view/manage them
      if (allItems.length === 0) {
        allItems = DEFAULT_REVIEWS.map((d) => ({
          id: d.id || `default-${d.name}`,
          author_name: d.name,
          relation_title_bn: d.relation,
          relation_title_en: d.relationEn,
          review_text_bn: d.review,
          review_text_en: d.reviewEn,
          rating: d.rating || 5,
          is_approved: d.approved,
          created_at: new Date(d.createdAt).toISOString(),
          platform: d.platform,
        }));
      }

      setTestimonials(allItems);
    } catch (err: any) {
      console.warn("Notice: Testimonials loaded from cache:", err);
      const cached = getCachedReviews();
      let formattedCached: Testimonial[] = cached.map((c) => ({
        id: c.id || `local-${Date.now()}`,
        author_name: c.name,
        relation_title_bn: c.relation,
        relation_title_en: c.relationEn,
        review_text_bn: c.review,
        review_text_en: c.reviewEn,
        rating: c.rating || 5,
        is_approved: c.approved,
        created_at: new Date(c.createdAt).toISOString(),
        platform: c.platform,
      }));
      if (formattedCached.length === 0) {
        formattedCached = DEFAULT_REVIEWS.map((d) => ({
          id: d.id || `default-${d.name}`,
          author_name: d.name,
          relation_title_bn: d.relation,
          relation_title_en: d.relationEn,
          review_text_bn: d.review,
          review_text_en: d.reviewEn,
          rating: d.rating || 5,
          is_approved: d.approved,
          created_at: new Date(d.createdAt).toISOString(),
          platform: d.platform,
        }));
      }
      setTestimonials(formattedCached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleToggleApproval = async (item: Testimonial, approve: boolean) => {
    try {
      const isLocal = item.id.startsWith("local-") || item.id.startsWith("default-");
      if (!isLocal) {
        try {
          await supabase
            .from("testimonials")
            .update({ is_approved: approve })
            .eq("id", item.id);
        } catch (e) {
          console.warn("Supabase update skipped/failed:", e);
        }
      }

      const cached = getCachedReviews();
      const updated = cached.map((c) => (c.id === item.id ? { ...c, approved: approve } : c));
      if (!updated.some((c) => c.id === item.id)) {
        updated.push({
          id: item.id,
          name: item.author_name,
          relation: item.relation_title_bn,
          relationEn: item.relation_title_en,
          review: item.review_text_bn,
          reviewEn: item.review_text_en,
          rating: item.rating,
          approved: approve,
          platform: item.platform,
          createdAt: new Date(item.created_at).getTime(),
        });
      }
      setCachedReviews(updated);

      setTestimonials((prev) =>
        prev.map((tItem) => (tItem.id === item.id ? { ...tItem, is_approved: approve } : tItem))
      );

      await logAdminActivity(
        "UPDATE",
        "testimonials",
        `রিভিউ মডারেশন: "${item.author_name}" -> ${approve ? "Approved" : "Rejected"}`
      );

      toast.success(
        approve
          ? t("রিভিউটি ওয়েবসাইটে প্রদর্শনের জন্য অনুমোদিত", "Testimonial approved")
          : t("রিভিউটির অনুমোদন বাতিল করা হয়েছে", "Testimonial unapproved")
      );
    } catch (err: any) {
      console.error("Error moderating testimonial:", err);
      toast.error(t("মডারেশন সম্পন্ন করতে সমস্যা হয়েছে", "Failed to moderate testimonial"));
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const isLocal = deletingItem.id.startsWith("local-") || deletingItem.id.startsWith("default-");
      if (!isLocal) {
        try {
          await supabase
            .from("testimonials")
            .delete()
            .eq("id", deletingItem.id);
        } catch (e) {
          console.warn("Supabase delete skipped/failed:", e);
        }
      }

      const cached = getCachedReviews();
      setCachedReviews(cached.filter((c) => c.id !== deletingItem.id));

      await logAdminActivity(
        "DELETE",
        "testimonials",
        `রিভিউ মুছে ফেলা: "${deletingItem.author_name}"`
      );

      toast.success(t("রিভিউ সফলভাবে মুছে ফেলা হয়েছে", "Review deleted successfully"));
      setTestimonials((prev) => prev.filter((tItem) => tItem.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err: any) {
      console.error("Error deleting testimonial:", err);
      toast.error(t("রিভিউ মুছতে সমস্যা হয়েছে", "Failed to delete review"));
    }
  };

  const handleOpenDialog = (item?: Testimonial) => {
    if (item) {
      setSelectedItem(item);
      const parsed = parsePlatformAndRelation(item.relation_title_en, item.relation_title_bn);
      setFormData({
        author_name: item.author_name,
        relation_title_bn: item.relation_title_bn,
        relation_title_en: parsed.relationEn,
        review_text_bn: item.review_text_bn,
        review_text_en: item.review_text_en || "",
        rating: item.rating || 5,
        is_approved: item.is_approved,
        platform: parsed.platform,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        author_name: "",
        relation_title_bn: "অভিভাবক",
        relation_title_en: "Guardian",
        review_text_bn: "",
        review_text_en: "",
        rating: 5,
        is_approved: true,
        platform: "google",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.author_name.trim() || !formData.review_text_bn.trim()) {
      toast.error(t("লেখক নাম ও রিভিউর বাংলা বিবরণ আবশ্যক", "Author name and review text required"));
      return;
    }

    try {
      setSubmitting(true);
      const relationEnFormatted = formatPlatformAndRelation(formData.platform, formData.relation_title_en);
      const payload = {
        author_name: formData.author_name.trim(),
        relation_title_bn: formData.relation_title_bn.trim(),
        relation_title_en: relationEnFormatted,
        review_text_bn: formData.review_text_bn.trim(),
        review_text_en: formData.review_text_en.trim() || null,
        rating: Number(formData.rating) || 5,
        is_approved: formData.is_approved,
      };

      if (selectedItem) {
        const isLocal = selectedItem.id.startsWith("local-") || selectedItem.id.startsWith("default-");
        if (!isLocal) {
          try {
            const { error } = await supabase
              .from("testimonials")
              .update(payload)
              .eq("id", selectedItem.id);
            if (error) console.warn("Supabase update error:", error);
          } catch (e) {
            console.warn("Supabase update error:", e);
          }
        }

        const cached = getCachedReviews();
        let updated = cached.map((c) =>
          c.id === selectedItem.id
            ? {
                ...c,
                name: payload.author_name,
                relation: payload.relation_title_bn,
                relationEn: formData.relation_title_en,
                review: payload.review_text_bn,
                reviewEn: payload.review_text_en || undefined,
                rating: payload.rating,
                approved: payload.is_approved,
                platform: formData.platform,
              }
            : c
        );
        if (!updated.some((c) => c.id === selectedItem.id)) {
          updated = [
            {
              id: selectedItem.id,
              name: payload.author_name,
              relation: payload.relation_title_bn,
              relationEn: formData.relation_title_en,
              review: payload.review_text_bn,
              reviewEn: payload.review_text_en || undefined,
              rating: payload.rating,
              approved: payload.is_approved,
              platform: formData.platform,
              createdAt: Date.now(),
            },
            ...updated,
          ];
        }
        setCachedReviews(updated);
        toast.success(t("রিভিউ আপডেট সম্পন্ন", "Testimonial updated"));
      } else {
        const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        try {
          const { error } = await supabase
            .from("testimonials")
            .insert([payload]);
          if (error) console.warn("Supabase insert warning:", error);
        } catch (e) {
          console.warn("Supabase insert warning:", e);
        }

        const newReview: Review = {
          id: localId,
          name: payload.author_name,
          relation: payload.relation_title_bn,
          relationEn: formData.relation_title_en,
          review: payload.review_text_bn,
          reviewEn: payload.review_text_en || undefined,
          rating: payload.rating,
          approved: payload.is_approved,
          platform: formData.platform,
          createdAt: Date.now(),
        };
        const cached = getCachedReviews();
        setCachedReviews([newReview, ...cached]);
        toast.success(t("নতুন রিভিউ যোগ করা হয়েছে", "Testimonial added"));
      }

      setIsDialogOpen(false);
      fetchTestimonials();
    } catch (err: any) {
      console.error("Error saving testimonial:", err);
      toast.error(err.message || t("সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save review"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.relation_title_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.review_text_bn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && item.is_approved) ||
        (statusFilter === "pending" && !item.is_approved);

      return matchesSearch && matchesStatus;
    });
  }, [testimonials, searchQuery, statusFilter]);

  const pendingCount = useMemo(() => {
    return testimonials.filter((tItem) => !tItem.is_approved).length;
  }, [testimonials]);

  return (
    <div className="space-y-6">
      {/* Alert banner if there are pending reviews */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 font-bold">
              {pendingCount}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("অপেক্ষমান রিভিউ মডারেশন প্রয়োজন", "Pending reviews awaiting approval")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "ব্যবহারকারীদের পাঠানো রিভিউ যাচাই করে ওয়েবসাইটে প্রকাশ করুন।",
                  "Review submissions from users and guardians before publishing live."
                )}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusFilter("pending")}
            className="border-amber-500/40 text-amber-700 bg-background"
          >
            {t("অপেক্ষমানগুলো দেখুন", "View Pending")}
          </Button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("রিভিউদাতা বা মন্তব্য খুঁজুন...", "Search reviewer or text...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder={t("স্ট্যাটাস", "Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("সব রিভিউ", "All Reviews")}</SelectItem>
              <SelectItem value="pending">{t("অপেক্ষমান (Pending)", "Pending")}</SelectItem>
              <SelectItem value="approved">{t("অনুমোদিত (Approved)", "Approved")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchTestimonials}
            disabled={loading}
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => handleOpenDialog()}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{t("রিভিউ যোগ করুন", "Add Review")}</span>
          </Button>
        </div>
      </div>

      {/* Grid of Testimonials */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/40" />
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
          <MessageSquareQuote className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h4 className="text-base font-semibold">{t("কোনো রিভিউ পাওয়া যায়নি", "No testimonials found")}</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t(
              "অভিভাবক ও শিক্ষার্থীদের মতামত বা প্রশংসাপত্র এখানে সংরক্ষিত ও নিয়ন্ত্রিত হয়।",
              "Moderate community feedback or add verified institutional testimonials."
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTestimonials.map((item) => (
            <Card
              key={item.id}
              className={`border-border/70 hover:shadow-md transition-all flex flex-col justify-between ${
                !item.is_approved ? "border-amber-500/50 bg-amber-500/5" : ""
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= item.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.platform === "facebook" ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold py-0.5">
                        Facebook
                      </Badge>
                    ) : item.platform === "trustpilot" ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] font-semibold py-0.5">
                        Trustpilot
                      </Badge>
                    ) : item.platform === "website" ? (
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-[10px] font-semibold py-0.5">
                        Website
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] font-semibold py-0.5">
                        Google Review
                      </Badge>
                    )}

                    {item.is_approved ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 gap-1 text-[10px]">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("অনুমোদিত", "Approved")}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-700 gap-1 animate-pulse text-[10px]">
                        <XCircle className="h-3 w-3" />
                        {t("অপেক্ষমান", "Pending")}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs text-foreground/90 italic line-clamp-4 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                  "{item.review_text_bn}"
                </p>

                <div>
                  <h4 className="font-semibold text-sm text-foreground">{item.author_name}</h4>
                  <p className="text-xs text-muted-foreground">{item.relation_title_bn}</p>
                </div>
              </CardContent>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-border/40 mt-1 flex items-center justify-between">
                <div>
                  {item.is_approved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleApproval(item, false)}
                      className="text-xs h-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      {t("অনুমোদন বাতিল", "Reject")}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleToggleApproval(item, true)}
                      className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {t("অনুমোদন দিন", "Approve")}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleOpenDialog(item)}
                    title={t("সম্পাদনা", "Edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-600 hover:bg-rose-50"
                    onClick={() => setDeletingItem(item)}
                    title={t("মুছে ফেলুন", "Delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-emerald-600" />
              {selectedItem ? t("রিভিউ সম্পাদনা", "Edit Testimonial") : t("নতুন রিভিউ যুক্ত করুন", "Add Testimonial")}
            </DialogTitle>
            <DialogDescription>
              {t("অভিভাবক বা শুভানুধ্যায়ীদের প্রশংসাপত্র ও রেটিং", "Verified feedback and rating from guardians")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="author_name">{t("নাম (লেখক) *", "Name *")}</Label>
              <Input
                id="author_name"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                placeholder={t("যেমন: মোহাম্মদ আব্দুল্লাহ", "e.g. Md. Abdullah")}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="relation_bn">{t("পরিচয় / সম্পর্ক *", "Relation / Role *")}</Label>
                <Input
                  id="relation_bn"
                  value={formData.relation_title_bn}
                  onChange={(e) => setFormData({ ...formData, relation_title_bn: e.target.value })}
                  placeholder={t("যেমন: ৭ম শ্রেণির অভিভাবক", "e.g. Class 7 Guardian")}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("প্ল্যাটফর্ম উৎস", "Review Platform")}</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(val: ReviewPlatform) => setFormData({ ...formData, platform: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">🔴 Google Reviews</SelectItem>
                    <SelectItem value="facebook">🔵 Facebook Recommends</SelectItem>
                    <SelectItem value="trustpilot">🟢 Trustpilot</SelectItem>
                    <SelectItem value="website">🌐 Website (সরাসরি)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("রেটিং (স্টার)", "Rating")}</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(val) => setFormData({ ...formData, rating: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">★★★★★ (5 Stars)</SelectItem>
                  <SelectItem value="4">★★★★☆ (4 Stars)</SelectItem>
                  <SelectItem value="3">★★★☆☆ (3 Stars)</SelectItem>
                  <SelectItem value="2">★★☆☆☆ (2 Stars)</SelectItem>
                  <SelectItem value="1">★☆☆☆☆ (1 Star)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review_bn">{t("মন্তব্য / রিভিউ (বাংলা) *", "Review Text (Bangla) *")}</Label>
              <Textarea
                id="review_bn"
                value={formData.review_text_bn}
                onChange={(e) => setFormData({ ...formData, review_text_bn: e.target.value })}
                rows={3}
                placeholder={t("প্রতিষ্ঠানের শিক্ষা পরিবেশ নিয়ে আপনার প্রতিক্রিয়া...", "Feedback text...")}
                required
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                {t("বাতিল", "Cancel")}
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {selectedItem ? t("আপডেট করুন", "Save Changes") : t("সংরক্ষণ করুন", "Save Review")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("রিভিউটি মুছে ফেলতে চান?", "Delete this review?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `"${deletingItem?.author_name}"-এর রিভিউটি স্থায়ীভাবে মুছে ফেলা হবে।`,
                `"${deletingItem?.author_name}"'s testimonial will be permanently deleted.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("হ্যাঁ, মুছে ফেলুন", "Yes, Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
