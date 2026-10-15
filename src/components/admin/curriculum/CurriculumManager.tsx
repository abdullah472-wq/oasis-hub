import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Compass,
  Award,
  GraduationCap,
  HeartHandshake,
  RotateCw,
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
  getCurriculums,
  deleteCurriculum,
  toggleCurriculumStatus,
  type CurriculumProgram,
} from "@/lib/curriculum";
import { CurriculumDialog } from "./CurriculumDialog";

const categoryStyles: Record<
  CurriculumProgram["category"],
  { labelBn: string; labelEn: string; icon: any; color: string }
> = {
  nurani: {
    labelBn: "নূরানী বিভাগ",
    labelEn: "Nurani",
    icon: BookOpen,
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  nazara: {
    labelBn: "নাজেরা ও কিরাত",
    labelEn: "Nazara & Qirat",
    icon: Compass,
    color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  },
  hifz: {
    labelBn: "হিফজুল কুরআন",
    labelEn: "Hifz",
    icon: Award,
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  general: {
    labelBn: "জেনারেল সমন্বিত",
    labelEn: "General",
    icon: GraduationCap,
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  tarbiya: {
    labelBn: "তারবিয়াত ও আদব",
    labelEn: "Tarbiya",
    icon: HeartHandshake,
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
};

export const CurriculumManager = () => {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<CurriculumProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumProgram | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getCurriculums();
      setItems(data);
    } catch {
      toast.error(t("কারিকুলাম তালিকা লোড করতে সমস্যা হয়েছে", "Failed to load curriculum"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const text = `${item.department_bn} ${item.department_en} ${item.category} ${item.description_bn}`.toLowerCase();
      return text.includes(q);
    });
  }, [items, searchQuery]);

  const handleOpenCreate = () => {
    setSelectedCurriculum(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: CurriculumProgram) => {
    setSelectedCurriculum(item);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      await toggleCurriculumStatus(id, nextStatus);
      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: nextStatus } : c))
      );
      toast.success(
        nextStatus
          ? t("কারিকুলাম সক্রিয় করা হয়েছে", "Curriculum activated")
          : t("কারিকুলাম নিষ্ক্রিয় করা হয়েছে", "Curriculum deactivated")
      );
    } catch {
      toast.error(t("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে", "Failed to change status"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteCurriculum(deletingId);
      setItems((prev) => prev.filter((c) => c.id !== deletingId));
      toast.success(t("কারিকুলাম মুছে ফেলা হয়েছে", "Curriculum deleted"));
    } catch {
      toast.error(t("মুছে ফেলতে সমস্যা হয়েছে", "Failed to delete curriculum"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {t("শিক্ষা কারিকুলাম ব্যবস্থাপনা", "Curriculum Program Management")}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {t(
              "ওয়েবসাইটের একাডেমিক কারিকুলাম, বয়সসীমা, মেয়াদ ও পাঠ্য বিষয়সমূহ পরিচালনা করুন",
              "Manage departmental curriculum, syllabus, age limits, and features on website"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
          >
            <Link to="/curriculum" target="_blank">
              <ExternalLink className="h-4 w-4" />
              <span>{t("ওয়েবসাইটে দেখুন", "View on Web")}</span>
            </Link>
          </Button>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="gap-1.5 rounded-xl bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>{t("নতুন কারিকুলাম", "New Program")}</span>
          </Button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("কারিকুলাম বা বিভাগ খুঁজুন...", "Search curriculum...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-border bg-card"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground">
          <span>{t(`মোট কারিকুলাম: ${items.length}টি`, `Total: ${items.length}`)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchItems}
            className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Programs List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">{t("তথ্য লোড হচ্ছে...", "Loading curriculum...")}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="font-bold text-foreground">{t("কোনো কারিকুলাম পাওয়া যায়নি", "No curriculum found")}</p>
          <Button onClick={handleOpenCreate} size="sm" className="mt-4 gap-1.5 rounded-xl">
            <Plus className="h-4 w-4" />
            <span>{t("প্রথম কারিকুলাম যুক্ত করুন", "Add First Program")}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const style = categoryStyles[item.category] || categoryStyles.nurani;
            const Icon = style.icon;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-foreground leading-snug">
                          {lang === "bn" ? item.department_bn : item.department_en}
                        </h4>
                        <span className={`inline-block border text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${style.color}`}>
                          {lang === "bn" ? style.labelBn : style.labelEn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs font-mono">
                        #{item.order_index}
                      </Badge>
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={() => handleToggleActive(item.id, item.is_active)}
                        title={item.is_active ? t("সক্রিয়", "Active") : t("নিষ্ক্রিয়", "Inactive")}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-foreground/80 line-clamp-2 mb-3">
                    {lang === "bn" ? item.description_bn : item.description_en}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-muted-foreground">
                    {item.age_group_bn && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary">
                        <Users className="h-3 w-3" />
                        <span>{lang === "bn" ? item.age_group_bn : item.age_group_en}</span>
                      </span>
                    )}
                    {item.duration_bn && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary">
                        <Clock className="h-3 w-3" />
                        <span>{lang === "bn" ? item.duration_bn : item.duration_en}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary">
                      <BookOpen className="h-3 w-3" />
                      <span>{t(`${item.subjects_bn?.length || 0}টি বিষয়`, `${item.subjects_bn?.length || 0} subjects`)}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {item.is_active ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("ওয়েবসাইটে দৃশ্যমান", "Visible on Web")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {t("লুকানো আছে", "Hidden")}
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                      title={t("সম্পাদনা করুন", "Edit")}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingId(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title={t("মুছে ফেলুন", "Delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <CurriculumDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchItems}
        curriculum={selectedCurriculum}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold">
              {t("আপনি কি নিশ্চিত?", "Are you sure?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "এই শিক্ষা কারিকুলামটি মুছে ফেললে তা ওয়েবসাইটের তালিকা থেকেও অপসারিত হবে।",
                "Deleting this curriculum will permanently remove it from the public directory."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              {t("মুছে ফেলুন", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
