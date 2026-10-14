import { useState, useEffect, useMemo } from "react";
import {
  Award,
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  RotateCw,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Achievement } from "@/types/cms";
import { AchievementDialog } from "./AchievementDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export const AchievementManager = () => {
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<Achievement | null>(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("year", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAchievements((data as Achievement[]) || []);
    } catch (err: any) {
      console.error("Error fetching achievements:", err);
      toast.error(t("অর্জন তালিকা লোড করতে সমস্যা হয়েছে", "Failed to load achievements"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleDelete = async () => {
    if (!deletingAchievement) return;

    try {
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", deletingAchievement.id);

      if (error) throw error;

      await logAdminActivity(
        "DELETE",
        "achievements",
        `অর্জন মুছে ফেলা: "${deletingAchievement.title_bn}"`
      );

      toast.success(t("অর্জন সফলভাবে মুছে ফেলা হয়েছে", "Achievement deleted successfully"));
      setAchievements((prev) => prev.filter((a) => a.id !== deletingAchievement.id));
      setDeletingAchievement(null);
    } catch (err: any) {
      console.error("Error deleting achievement:", err);
      toast.error(t("অর্জন মুছতে সমস্যা হয়েছে", "Failed to delete achievement"));
    }
  };

  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.title_en && item.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.year.includes(searchQuery) ||
        (item.category_bn && item.category_bn.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [achievements, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("অর্জন বা বছর দিয়ে খুঁজুন...", "Search achievement or year...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAchievements}
            disabled={loading}
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => {
              setSelectedAchievement(null);
              setIsDialogOpen(true);
            }}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{t("নতুন অর্জন", "Add Achievement")}</span>
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-52 bg-muted/40" />
          ))}
        </div>
      ) : filteredAchievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
          <Award className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h4 className="text-base font-semibold">{t("কোনো অর্জনের তথ্য নেই", "No achievements found")}</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t(
              "প্রতিষ্ঠান ও শিক্ষার্থীদের বিভিন্ন জাতীয় ও বিভাগীয় সাফল্যের ইতিহাস এখানে যোগ করুন।",
              "Document historical awards, student triumphs, and institutional milestones."
            )}
          </p>
          <Button
            onClick={() => {
              setSelectedAchievement(null);
              setIsDialogOpen(true);
            }}
            variant="outline"
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("প্রথম অর্জন যোগ করুন", "Add First Milestone")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-border/70 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {item.image_url ? (
                  <div className="relative aspect-16/9 w-full bg-black/5 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title_bn}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className="bg-amber-500 text-white gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.year}
                      </Badge>
                      {item.category_bn && (
                        <Badge variant="secondary">{item.category_bn}</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex items-center gap-2">
                    <Badge className="bg-amber-500 text-white gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.year}
                    </Badge>
                    {item.category_bn && (
                      <Badge variant="secondary">{item.category_bn}</Badge>
                    )}
                  </div>
                )}

                <CardContent className="p-4 space-y-1.5">
                  <h3 className="font-semibold text-base text-foreground line-clamp-1">
                    {item.title_bn}
                  </h3>
                  {item.title_en && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.title_en}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-1">
                    {item.description_bn}
                  </p>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-border/40 mt-1 flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setSelectedAchievement(item);
                    setIsDialogOpen(true);
                  }}
                  title={t("সম্পাদনা", "Edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                  onClick={() => setDeletingAchievement(item)}
                  title={t("মুছে ফেলুন", "Delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <AchievementDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        achievementToEdit={selectedAchievement}
        onSuccess={fetchAchievements}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingAchievement}
        onOpenChange={(open) => !open && setDeletingAchievement(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("অর্জনটি মুছে ফেলতে চান?", "Delete this achievement?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `"${deletingAchievement?.title_bn}" অর্জনটি স্থায়ীভাবে মুছে ফেলা হবে।`,
                `"${deletingAchievement?.title_bn}" will be permanently removed.`
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
