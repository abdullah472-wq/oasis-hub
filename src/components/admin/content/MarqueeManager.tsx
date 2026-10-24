import { useState, useEffect, useMemo } from "react";
import {
  Megaphone,
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  RotateCw,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMarqueeList,
  toggleMarqueeActive,
  deleteMarqueeNotice,
} from "@/lib/marqueeService";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MarqueeNotice } from "@/types/cms";
import { MarqueeFormDialog } from "./MarqueeFormDialog";
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

export const MarqueeManager = () => {
  const { t } = useLanguage();
  const [notices, setNotices] = useState<MarqueeNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<MarqueeNotice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<MarqueeNotice | null>(null);

  const fetchMarqueeNotices = async () => {
    try {
      setLoading(true);
      const data = await getMarqueeList();
      setNotices(data);
    } catch (err: any) {
      console.error("Error fetching marquee notices:", err);
      toast.error(t("মারকুই নোটিশ লোড করতে সমস্যা হয়েছে", "Failed to load marquee notices"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarqueeNotices();
  }, []);

  const handleToggleActive = async (notice: MarqueeNotice) => {
    try {
      const updatedStatus = !notice.is_active;
      await toggleMarqueeActive(notice.id, updatedStatus);

      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, is_active: updatedStatus } : n))
      );

      toast.success(
        updatedStatus
          ? t("মারকুই নোটিশ সক্রিয় করা হয়েছে", "Marquee notice activated")
          : t("মারকুই নোটিশ নিষ্ক্রিয় করা হয়েছে", "Marquee notice deactivated")
      );
    } catch (err: any) {
      console.error("Error toggling marquee status:", err);
      toast.error(t("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে", "Failed to update status"));
    }
  };

  const handleDelete = async () => {
    if (!deletingNotice) return;

    try {
      await deleteMarqueeNotice(deletingNotice.id);
      toast.success(t("নোটিশ সফলভাবে মুছে ফেলা হয়েছে", "Notice deleted successfully"));
      setNotices((prev) => prev.filter((n) => n.id !== deletingNotice.id));
      setDeletingNotice(null);
    } catch (err: any) {
      console.error("Error deleting marquee notice:", err);
      toast.error(t("নোটিশ মুছতে সমস্যা হয়েছে", "Failed to delete notice"));
    }
  };

  const activeNotices = useMemo(() => {
    return notices.filter((n) => n.is_active);
  }, [notices]);

  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.text_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.text_en && item.text_en.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [notices, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Live Preview Strip */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          {t("ওয়েবসাইটে লাইভ মারকুই প্রিভিউ", "Live Marquee Preview on Public Website")}
        </div>
        <div className="relative overflow-hidden rounded-lg bg-background border border-border/80 px-4 py-2.5 shadow-inner">
          {activeNotices.length > 0 ? (
            <div className="flex items-center gap-6 text-sm text-foreground animate-pulse whitespace-nowrap overflow-x-auto">
              <Megaphone className="h-4 w-4 text-amber-500 shrink-0" />
              {activeNotices.map((n, idx) => (
                <span key={n.id} className="inline-flex items-center gap-2">
                  <span className="font-medium">{n.text_bn}</span>
                  {idx < activeNotices.length - 1 && <span className="text-amber-500 font-bold">★</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {t("বর্তমানে কোনো মারকুই নোটিশ সক্রিয় নেই", "No active marquee notices currently.")}
            </p>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("নোটিশ খুঁজুন...", "Search marquee notices...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchMarqueeNotices}
            disabled={loading}
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => {
              setSelectedNotice(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{t("মারকুই যোগ করুন", "Add Ticker")}</span>
          </Button>
        </div>
      </div>

      {/* Table View */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[80px] text-center">{t("অগ্রাধিকার", "Priority")}</TableHead>
              <TableHead>{t("মারকুই টেক্সট", "Ticker Text")}</TableHead>
              <TableHead className="w-[180px]">{t("ক্লিকেবল লিঙ্ক", "Link")}</TableHead>
              <TableHead className="w-[120px] text-center">{t("স্ট্যাটাস", "Status")}</TableHead>
              <TableHead className="w-[130px] text-right">{t("অ্যাকশন", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RotateCw className="h-5 w-5 animate-spin text-primary" />
                    <span>{t("মারকুই তালিকা লোড হচ্ছে...", "Loading marquee list...")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredNotices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Megaphone className="h-8 w-8 text-muted-foreground/40" />
                    <p>{t("কোনো মারকুই নোটিশ পাওয়া যায়নি", "No marquee notices found")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredNotices.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center font-mono font-bold text-xs text-primary">
                    P{item.priority}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground text-sm">{item.text_bn}</p>
                      {item.text_en && (
                        <p className="text-xs text-muted-foreground">{item.text_en}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.link_url ? (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 max-w-[160px] truncate"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.link_url}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedNotice(item);
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
                        onClick={() => setDeletingNotice(item)}
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
      <MarqueeFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        noticeToEdit={selectedNotice}
        onSuccess={fetchMarqueeNotices}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingNotice}
        onOpenChange={(open) => !open && setDeletingNotice(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("মারকুই নোটিশটি মুছে ফেলতে চান?", "Delete this marquee notice?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `"${deletingNotice?.text_bn}" নোটিশটি স্থায়ীভাবে মুছে ফেলা হবে।`,
                `"${deletingNotice?.text_bn}" will be permanently deleted.`
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
