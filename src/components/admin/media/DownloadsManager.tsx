import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  RotateCw,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DownloadItem } from "@/types/cms";
import { DownloadFormDialog } from "./DownloadFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const DownloadsManager = () => {
  const { t } = useLanguage();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState<DownloadItem | null>(null);
  const [deletingDownload, setDeletingDownload] = useState<DownloadItem | null>(null);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDownloads((data as DownloadItem[]) || []);
    } catch (err: any) {
      console.error("Error fetching downloads:", err);
      toast.error(t("রিসোর্স তালিকা লোড করতে সমস্যা হয়েছে", "Failed to load downloads"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const handleToggleActive = async (item: DownloadItem) => {
    try {
      const updatedStatus = !item.is_active;
      const { error } = await supabase
        .from("downloads")
        .update({ is_active: updatedStatus, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (error) throw error;

      setDownloads((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, is_active: updatedStatus } : d))
      );

      await logAdminActivity(
        "UPDATE",
        "downloads",
        `ডাউনলোড স্ট্যাটাস পরিবর্তন: "${item.title_bn}" -> ${updatedStatus ? "Active" : "Inactive"}`
      );

      toast.success(
        updatedStatus
          ? t("ফাইলটি সক্রিয় করা হয়েছে", "Resource activated")
          : t("ফাইলটি নিষ্ক্রিয় করা হয়েছে", "Resource deactivated")
      );
    } catch (err: any) {
      console.error("Error toggling download status:", err);
      toast.error(t("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে", "Failed to update status"));
    }
  };

  const handleDelete = async () => {
    if (!deletingDownload) return;

    try {
      const { error } = await supabase
        .from("downloads")
        .delete()
        .eq("id", deletingDownload.id);

      if (error) throw error;

      await logAdminActivity(
        "DELETE",
        "downloads",
        `ডাউনলোড ফাইল মুছে ফেলা: "${deletingDownload.title_bn}"`
      );

      toast.success(t("ফাইল সফলভাবে মুছে ফেলা হয়েছে", "Resource deleted successfully"));
      setDownloads((prev) => prev.filter((d) => d.id !== deletingDownload.id));
      setDeletingDownload(null);
    } catch (err: any) {
      console.error("Error deleting download resource:", err);
      toast.error(t("ফাইল মুছতে সমস্যা হয়েছে", "Failed to delete resource"));
    }
  };

  const filteredDownloads = useMemo(() => {
    return downloads.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.title_en && item.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description_bn && item.description_bn.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [downloads, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("রিসোর্স বা ফাইল খুঁজুন...", "Search downloads...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchDownloads}
            disabled={loading}
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => {
              setSelectedDownload(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{t("ফাইল যোগ করুন", "Add File")}</span>
          </Button>
        </div>
      </div>

      {/* Table View */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[80px]">{t("ধরন", "Type")}</TableHead>
              <TableHead>{t("ফাইলের শিরোনাম", "Title")}</TableHead>
              <TableHead className="w-[120px]">{t("ফাইলের সাইজ", "File Size")}</TableHead>
              <TableHead className="w-[120px] text-center">{t("ডাউনলোড", "Downloads")}</TableHead>
              <TableHead className="w-[120px] text-center">{t("স্ট্যাটাস", "Status")}</TableHead>
              <TableHead className="w-[150px] text-right">{t("অ্যাকশন", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RotateCw className="h-5 w-5 animate-spin text-primary" />
                    <span>{t("রিসোর্স লোড হচ্ছে...", "Loading resources...")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredDownloads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                    <p>{t("কোনো ফাইল পাওয়া যায়নি", "No download resources found")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDownloads.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-xs text-emerald-600 uppercase">
                      {item.file_type || "PDF"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground text-sm">{item.title_bn}</p>
                      {item.title_en && (
                        <p className="text-xs text-muted-foreground">{item.title_en}</p>
                      )}
                      {item.description_bn && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-1">{item.description_bn}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.file_size_label || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-sm font-medium">
                      {item.download_count || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={() => handleToggleActive(item)}
                        aria-label="Toggle active status"
                      />
                      <span className="text-xs font-medium">
                        {item.is_active ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {t("সক্রিয়", "Active")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                            {t("নিষ্ক্রিয়", "Inactive")}
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => window.open(item.file_url, "_blank")}
                        title={t("ফাইল দেখুন / ডাউনলোড", "View / Download")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedDownload(item);
                          setIsFormOpen(true);
                        }}
                        title={t("সম্পাদনা", "Edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                        onClick={() => setDeletingDownload(item)}
                        title={t("মুছে ফেলুন", "Delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <DownloadFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        itemToEdit={selectedDownload}
        onSuccess={fetchDownloads}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingDownload}
        onOpenChange={(open) => !open && setDeletingDownload(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("ফাইলটি মুছে ফেলতে চান?", "Delete this file?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `"${deletingDownload?.title_bn}" ফাইলটি ডাউনলোড সেন্টার থেকে স্থায়ীভাবে মুছে ফেলা হবে।`,
                `"${deletingDownload?.title_bn}" will be permanently removed from the download resources.`
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
