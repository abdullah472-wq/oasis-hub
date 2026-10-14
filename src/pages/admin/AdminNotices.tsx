import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, Filter, RotateCw, FileText, CheckCircle2, Clock, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Notice, NoticeCategory } from "@/types/cms";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { NoticeTable } from "@/components/admin/notices/NoticeTable";
import { NoticeFormDialog } from "@/components/admin/notices/NoticeFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export const AdminNotices = () => {
  const { t } = useLanguage();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState<Notice | null>(null);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("priority", { ascending: false })
        .order("published_at", { ascending: false });

      if (error) throw error;
      setNotices((data as Notice[]) || []);
    } catch (err: any) {
      console.error("Error fetching notices:", err);
      toast.error(t("নোটিশ লোড করতে সমস্যা হয়েছে", "Failed to load notices"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreateNew = () => {
    setNoticeToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setNoticeToEdit(notice);
    setIsDialogOpen(true);
  };

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      // Search matching (Bangla title or English title)
      const matchesSearch =
        !searchQuery.trim() ||
        notice.title_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notice.title_en && notice.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (notice.content_bn && notice.content_bn.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category matching
      const matchesCategory =
        categoryFilter === "all" || notice.category === categoryFilter;

      // Status matching
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && notice.is_published) ||
        (statusFilter === "draft" && !notice.is_published) ||
        (statusFilter === "featured" && notice.is_featured);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [notices, searchQuery, categoryFilter, statusFilter]);

  // Quick summary counts
  const stats = useMemo(() => {
    const total = notices.length;
    const published = notices.filter((n) => n.is_published).length;
    const featured = notices.filter((n) => n.is_featured).length;
    const drafts = total - published;
    return { total, published, featured, drafts };
  }, [notices]);

  return (
    <AdminLayout
      title={t("নোটিশ ব্যবস্থাপনা", "Notice Management")}
      subtitle={t(
        "সকল জরুরি নোটিশ, সার্কুলার ও পিডিএফ সংযুক্তি পরিচালনা করুন",
        "Manage all notices, circulars, and PDF attachments"
      )}
    >
      <div className="space-y-6">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-border/60 bg-card/60 shadow-xs backdrop-blur-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("মোট নোটিশ", "Total Notices")}
                </p>
                <p className="text-xl font-bold tracking-tight">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 shadow-xs backdrop-blur-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("প্রকাশিত", "Published")}
                </p>
                <p className="text-xl font-bold tracking-tight text-emerald-600">
                  {stats.published}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 shadow-xs backdrop-blur-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("ড্রাফট / অপ্রকাশিত", "Drafts")}
                </p>
                <p className="text-xl font-bold tracking-tight text-amber-600">
                  {stats.drafts}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 shadow-xs backdrop-blur-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <span className="text-xs font-bold uppercase">PIN</span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("পিন / হাইলাইট", "Pinned / Featured")}
                </p>
                <p className="text-xl font-bold tracking-tight text-blue-600">
                  {stats.featured}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("শিরোনাম বা বিষয়বস্তু খুঁজুন...", "Search title or content...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/80"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background/80">
                <SelectValue placeholder={t("ক্যাটাগরি", "Category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("সব ক্যাটাগরি", "All Categories")}</SelectItem>
                <SelectItem value="academic">{t("একাডেমিক", "Academic")}</SelectItem>
                <SelectItem value="admission">{t("ভর্তি", "Admission")}</SelectItem>
                <SelectItem value="holiday">{t("ছুটি", "Holiday")}</SelectItem>
                <SelectItem value="emergency">{t("জরুরি", "Emergency")}</SelectItem>
                <SelectItem value="general">{t("সাধারণ", "General")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background/80">
                <SelectValue placeholder={t("স্ট্যাটাস", "Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("সকল স্ট্যাটাস", "All Status")}</SelectItem>
                <SelectItem value="published">{t("প্রকাশিত", "Published")}</SelectItem>
                <SelectItem value="draft">{t("ড্রাফট", "Draft")}</SelectItem>
                <SelectItem value="featured">{t("পিন করা", "Pinned")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchNotices}
              disabled={loading}
              title={t("রিফ্রেশ করুন", "Refresh")}
              className="shrink-0"
            >
              <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              onClick={handleCreateNew}
              className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{t("নতুন নোটিশ", "New Notice")}</span>
            </Button>
          </div>
        </div>

        {/* Notices Table */}
        <NoticeTable
          notices={filteredNotices}
          loading={loading}
          onEdit={handleEdit}
          onRefresh={fetchNotices}
        />
      </div>

      {/* Notice Form Dialog (Create / Edit) */}
      <NoticeFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        noticeToEdit={noticeToEdit}
        onSuccess={fetchNotices}
      />
    </AdminLayout>
  );
};

export default AdminNotices;
