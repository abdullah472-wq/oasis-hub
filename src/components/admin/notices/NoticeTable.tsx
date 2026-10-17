import { useState } from "react";
import {
  FileText,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Pin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Notice, NoticeCategory } from "@/types/cms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface NoticeTableProps {
  notices: Notice[];
  loading: boolean;
  onEdit: (notice: Notice) => void;
  onRefresh: () => void;
}

export const NoticeTable = ({ notices, loading, onEdit, onRefresh }: NoticeTableProps) => {
  const { t } = useLanguage();
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getCategoryBadge = (category: NoticeCategory) => {
    switch (category) {
      case "academic":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">{t("একাডেমিক", "Academic")}</Badge>;
      case "admission":
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">{t("ভর্তি", "Admission")}</Badge>;
      case "holiday":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">{t("ছুটি", "Holiday")}</Badge>;
      case "emergency":
        return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20">{t("জরুরি", "Emergency")}</Badge>;
      default:
        return <Badge variant="secondary">{t("সাধারণ", "General")}</Badge>;
    }
  };

  const handleTogglePublish = async (notice: Notice) => {
    setActionLoading(true);
    const newStatus = !notice.is_published;

    try {
      const { error } = await supabase
        .from("notices")
        .update({ is_published: newStatus, updated_at: new Date().toISOString() })
        .eq("id", notice.id);

      if (error) throw error;

      await logAdminActivity(
        "UPDATE",
        "notices",
        `${newStatus ? "Published" : "Unpublished"} notice: ${notice.title_bn}`
      );

      toast.success(
        newStatus
          ? t("নোটিশটি প্রকাশ করা হয়েছে", "Notice published")
          : t("নোটিশটি ড্রাফট করা হয়েছে", "Notice set to draft")
      );
      onRefresh();
    } catch (err) {
      console.error("Toggle publish error:", err);
      toast.error(t("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে", "Failed to update status"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNotice) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("notices")
        .delete()
        .eq("id", deletingNotice.id);

      if (error) throw error;

      await logAdminActivity("DELETE", "notices", `Deleted notice: ${deletingNotice.title_bn}`);
      toast.success(t("নোটিশটি সফলভাবে মুছে ফেলা হয়েছে", "Notice deleted successfully"));
      setDeletingNotice(null);
      onRefresh();
    } catch (err) {
      console.error("Delete notice error:", err);
      toast.error(t("মুছে ফেলতে ব্যর্থ হয়েছে", "Failed to delete notice"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-12 text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="font-bengali text-xs text-muted-foreground">{t("নোটিশ লোড হচ্ছে...", "Loading notices...")}</p>
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center">
        <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <h3 className="font-bengali text-base font-bold text-foreground">
          {t("কোনো নোটিশ পাওয়া যায়নি", "No notices found")}
        </h3>
        <p className="font-bengali mt-1 text-xs text-muted-foreground">
          {t("নতুন নোটিশ তৈরি করতে উপরের 'নতুন নোটিশ' বাটনে ক্লিক করুন", "Click 'Create Notice' above to publish a circular")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bengali font-bold text-xs">{t("শিরোনাম", "Title")}</TableHead>
              <TableHead className="font-bengali font-bold text-xs">{t("ক্যাটাগরি", "Category")}</TableHead>
              <TableHead className="font-bengali font-bold text-xs">{t("তারিখ", "Date")}</TableHead>
              <TableHead className="font-bengali font-bold text-xs">{t("সংযুক্তি", "Attachments")}</TableHead>
              <TableHead className="font-bengali font-bold text-xs">{t("স্ট্যাটাস", "Status")}</TableHead>
              <TableHead className="text-right font-bengali font-bold text-xs">{t("অ্যাকশন", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.map((notice) => (
              <TableRow key={notice.id} className="transition-colors hover:bg-muted/30">
                {/* Title */}
                <TableCell className="max-w-[280px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {notice.is_featured && (
                        <span title={t("পিন করা", "Pinned")}>
                          <Pin className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        </span>
                      )}
                      <span className="font-bengali font-bold text-sm text-foreground line-clamp-1">
                        {notice.title_bn}
                      </span>
                    </div>
                    {notice.title_en && (
                      <p className="font-display text-xs text-muted-foreground line-clamp-1">
                        {notice.title_en}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell className="whitespace-nowrap">
                  {getCategoryBadge(notice.category)}
                </TableCell>

                {/* Date */}
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{notice.published_at}</span>
                  </div>
                </TableCell>

                {/* Attachments (PDF & Facebook) */}
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {notice.pdf_url && (
                      <a
                        href={notice.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>PDF</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {(notice.embed_code || notice.content_bn?.includes("fb_embed")) && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-[#1877F2] dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                        <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                          <path d="M22 12.07C22 6.5 17.52 2 11.93 2C6.35 2 1.86 6.5 1.86 12.07C1.86 17.1 5.53 21.26 10.33 22v-7.05H7.7v-2.88h2.63V9.85c0-2.6 1.55-4.04 3.93-4.04c1.14 0 2.33.2 2.33.2v2.56h-1.31c-1.29 0-1.69.8-1.69 1.62v1.95h2.88l-.46 2.88h-2.42V22c4.8-.74 8.47-4.9 8.47-9.93Z" />
                        </svg>
                        <span>Facebook</span>
                      </span>
                    )}
                    {!notice.pdf_url && !(notice.embed_code || notice.content_bn?.includes("fb_embed")) && (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="whitespace-nowrap">
                  <button
                    onClick={() => void handleTogglePublish(notice)}
                    disabled={actionLoading}
                    title={t("স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন", "Click to toggle status")}
                    className="group flex items-center gap-1.5"
                  >
                    {notice.is_published ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all group-hover:scale-105">
                        <Eye className="mr-1 h-3 w-3" />
                        {t("প্রকাশিত", "Published")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground transition-all group-hover:scale-105">
                        <EyeOff className="mr-1 h-3 w-3" />
                        {t("ড্রাফট", "Draft")}
                      </Badge>
                    )}
                  </button>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(notice)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingNotice(notice)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingNotice)}
        onOpenChange={(open) => !open && setDeletingNotice(null)}
      >
        <AlertDialogContent className="rounded-3xl p-6 sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali text-lg font-bold">
              {t("নোটিশটি মুছে ফেলতে চান?", "Delete this notice?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bengali text-xs text-muted-foreground">
              {t(
                `"${deletingNotice?.title_bn}" নোটিশটি স্থায়ীভাবে মুছে ফেলা হবে। এই কাজ আর পরিবর্তন করা যাবে না।`,
                `Notice "${deletingNotice?.title_bn}" will be permanently removed.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
            <AlertDialogCancel className="rounded-xl font-bengali text-xs">
              {t("বাতিল", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirm()}
              disabled={actionLoading}
              className="rounded-xl bg-destructive font-bengali text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? t("মুছে ফেলা হচ্ছে...", "Deleting...") : t("মুছে ফেলুন", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
