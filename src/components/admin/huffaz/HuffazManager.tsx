import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  RotateCw,
  Star,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  getHuffazList,
  deleteHafezRecord,
  saveHafezRecord,
  type HafezRecord,
} from "@/lib/huffaz";
import { HafezDialog } from "./HafezDialog";

export const HuffazManager = () => {
  const { t } = useLanguage();
  const [huffaz, setHuffaz] = useState<HafezRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [yearFilter, setYearFilter] = useState<string>("all");
  const [campusFilter, setCampusFilter] = useState<"all" | "boys" | "girls">("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHafez, setSelectedHafez] = useState<HafezRecord | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<HafezRecord | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getHuffazList();
      setHuffaz(data);
    } catch (err) {
      console.error("Failed to load huffaz:", err);
      toast.error(t("তথ্য লোড করতে সমস্যা হয়েছে", "Failed to load data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (item: HafezRecord) => {
    try {
      await saveHafezRecord({
        ...item,
        is_active: !item.is_active,
      });
      toast.success(
        !item.is_active
          ? t("রেকর্ড সক্রিয় করা হয়েছে", "Record activated")
          : t("রেকর্ড নিষ্ক্রিয় করা হয়েছে", "Record deactivated")
      );
      loadData();
    } catch (err) {
      toast.error(t("স্ট্যাটাস পরিবর্তন ব্যর্থ", "Failed to toggle status"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHafezRecord(deleteTarget.id);
      toast.success(t("রেকর্ড সফলভাবে মুছে ফেলা হয়েছে", "Record deleted"));
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(t("মুছে ফেলতে ব্যর্থ", "Failed to delete"));
    }
  };

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    huffaz.forEach((h) => {
      if (h.completion_year) set.add(h.completion_year);
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [huffaz]);

  const filtered = useMemo(() => {
    return huffaz.filter((item) => {
      if (yearFilter !== "all" && item.completion_year !== yearFilter) return false;
      if (campusFilter !== "all" && item.campus !== campusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          item.name_bn.toLowerCase().includes(q) ||
          item.name_en.toLowerCase().includes(q);
        const matchFather = item.father_name_bn?.toLowerCase().includes(q);
        const matchTeacher = item.teacher_name_bn?.toLowerCase().includes(q);
        const matchDistrict = item.district_bn?.toLowerCase().includes(q);
        if (!matchName && !matchFather && !matchTeacher && !matchDistrict) return false;
      }
      return true;
    });
  }, [huffaz, yearFilter, campusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
              <Crown className="h-5 w-5 text-accent" />
            </span>
            <div>
              <h2 className="font-bengali text-xl font-bold text-foreground">
                {t("কৃতি হাফেজ তালিকা ও সম্মাননা ব্যবস্থাপনা", "Wall of Huffaz Management")}
              </h2>
              <p className="font-bengali text-xs text-muted-foreground">
                {t(
                  "পবিত্র কুরআনুল কারীম হেফজ সম্পন্নকারী কৃতি শিক্ষার্থীদের তালিকা, ব্যাচ, দস্তারবন্দী পাগড়ী ও সনদ পরিচালনা করুন",
                  "Manage the Honor Wall of students who completed full Quran memorization"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/huffaz"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 font-bengali text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{t("পাবলিক পেজ দেখুন", "View Public Wall")}</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="rounded-xl font-bengali text-xs gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("রিফ্রেশ", "Refresh")}</span>
          </Button>

          <Button
            onClick={() => {
              setSelectedHafez(null);
              setDialogOpen(true);
            }}
            className="rounded-xl font-bengali text-xs gap-1.5 bg-primary"
          >
            <Plus className="h-4 w-4" />
            <span>{t("নতুন হাফেজ যুক্ত করুন", "Add Hafez Record")}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Batch Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground font-bengali flex items-center gap-1 mr-1">
              <Calendar className="h-3 w-3" />
              {t("ব্যাচ:", "Batch:")}
            </span>
            <button
              onClick={() => setYearFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bengali font-medium transition-colors ${
                yearFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t("সকল ব্যাচ", "All")}
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setYearFilter(yr)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bengali font-medium transition-colors ${
                  yearFilter === yr
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t("নাম, পিতা বা জেলা দিয়ে খুঁজুন...", "Search hafez...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 h-8.5 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Campus Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground font-bengali">
            {t("ক্যাম্পাস শাখা:", "Campus:")}
          </span>
          {[
            { id: "all", labelBn: "সকল", labelEn: "All" },
            { id: "boys", labelBn: "বালক শাখা", labelEn: "Boys" },
            { id: "girls", labelBn: "বালিকা শাখা", labelEn: "Girls" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCampusFilter(c.id as any)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bengali font-medium transition-colors ${
                campusFilter === c.id
                  ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t(c.labelBn, c.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-bengali text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="py-3 px-4 font-semibold">{t("ক্রম", "Order")}</th>
                <th className="py-3 px-4 font-semibold">{t("হাফেজের নাম", "Hafez Name")}</th>
                <th className="py-3 px-4 font-semibold">{t("পিতা ও ঠিকানা", "Father & District")}</th>
                <th className="py-3 px-4 font-semibold">{t("ব্যাচ ও সময়কাল", "Batch & Duration")}</th>
                <th className="py-3 px-4 font-semibold">{t("তত্ত্বাবধায়ক ওস্তাদ", "Teacher")}</th>
                <th className="py-3 px-4 font-semibold text-center">{t("স্ট্যাটাস", "Status")}</th>
                <th className="py-3 px-4 text-right font-semibold">{t("অ্যাকশন", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    {t("লোড হচ্ছে...", "Loading...")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    {t("কোনো হাফেজ রেকর্ড পাওয়া যায়নি", "No Hafez records found")}
                  </td>
                </tr>
              ) : (
                filtered.map((hfz) => (
                  <tr key={hfz.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-muted-foreground">
                      {hfz.order_index}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 text-primary font-bold">
                          <Crown className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground">{hfz.name_bn}</span>
                            {hfz.is_featured && (
                              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px]">
                                <Star className="h-3 w-3 mr-0.5 fill-amber-500" />
                                {t("গোল্ডেন", "Featured")}
                              </Badge>
                            )}
                          </div>
                          {hfz.name_en && (
                            <span className="text-[11px] text-muted-foreground block">{hfz.name_en}</span>
                          )}
                          {hfz.award_title_bn && (
                            <span className="text-[11px] text-accent font-medium block">
                              {hfz.award_title_bn}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-foreground">{hfz.father_name_bn || "—"}</p>
                      <p className="text-xs text-muted-foreground">{hfz.district_bn || "—"}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {t(`ব্যাচ ${hfz.completion_year}`, `Batch ${hfz.completion_year}`)}
                      </Badge>
                      {hfz.duration_bn && (
                        <p className="text-xs text-muted-foreground mt-0.5">{hfz.duration_bn}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {hfz.teacher_name_bn || "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Switch
                        checked={hfz.is_active}
                        onCheckedChange={() => handleToggleStatus(hfz)}
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedHafez(hfz);
                          setDialogOpen(true);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(hfz)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      <HafezDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={loadData}
        hafezItem={selectedHafez}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="font-bengali">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {t("হাফেজ রেকর্ড মুছে ফেলতে চান?", "Are you sure you want to delete?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              "{deleteTarget?.name_bn}" {t("মুছে ফেলা হলে তার নাম আর সম্মাননা প্রাচীরে থাকবে না।", "will be permanently removed from Wall of Huffaz.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
