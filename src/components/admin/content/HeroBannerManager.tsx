import { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  RotateCw,
  Eye,
  EyeOff,
  MoveRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getHeroBannersList,
  toggleHeroBannerActive,
  deleteHeroBanner,
} from "@/lib/heroBannerService";
import { useLanguage } from "@/contexts/LanguageContext";
import type { HeroBanner } from "@/types/cms";
import { HeroBannerDialog } from "./HeroBannerDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

export const HeroBannerManager = () => {
  const { t } = useLanguage();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<HeroBanner | null>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getHeroBannersList();
      setBanners(data);
    } catch (err: any) {
      console.error("Error fetching hero banners:", err);
      toast.error(t("হিরো ব্যানার লোড করতে সমস্যা হয়েছে", "Failed to load hero banners"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      const updatedStatus = !banner.is_active;
      await toggleHeroBannerActive(banner.id, updatedStatus);

      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: updatedStatus } : b))
      );

      toast.success(
        updatedStatus
          ? t("ব্যানার সক্রিয় করা হয়েছে", "Banner activated")
          : t("ব্যানার নিষ্ক্রিয় করা হয়েছে", "Banner deactivated")
      );
    } catch (err: any) {
      console.error("Error toggling banner status:", err);
      toast.error(t("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে", "Failed to update status"));
    }
  };

  const handleDelete = async () => {
    if (!deletingBanner) return;

    try {
      await deleteHeroBanner(deletingBanner.id);
      toast.success(t("ব্যানার সফলভাবে মুছে ফেলা হয়েছে", "Banner deleted successfully"));
      setBanners((prev) => prev.filter((b) => b.id !== deletingBanner.id));
      setDeletingBanner(null);
    } catch (err: any) {
      console.error("Error deleting hero banner:", err);
      toast.error(t("ব্যানার মুছতে সমস্যা হয়েছে", "Failed to delete banner"));
    }
  };

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      const matchesSearch =
        !searchQuery.trim() ||
        banner.title_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (banner.title_en && banner.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (banner.subtitle_bn && banner.subtitle_bn.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [banners, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("ব্যানার খুঁজুন...", "Search banners...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchBanners}
            disabled={loading}
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => {
              setSelectedBanner(null);
              setIsDialogOpen(true);
            }}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{t("নতুন ব্যানার", "Add Banner")}</span>
          </Button>
        </div>
      </div>

      {/* Banners List / Cards */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-60 bg-muted/40" />
          ))}
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h4 className="text-base font-semibold">{t("কোনো হিরো ব্যানার পাওয়া যায়নি", "No hero banners found")}</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t(
              "ওয়েবসাইটের মূল হোমপেজ স্লাইডার পরিচালনার জন্য এখানে ব্যানার যোগ করুন।",
              "Add top slider banners with custom headlines and call-to-action buttons."
            )}
          </p>
          <Button
            onClick={() => {
              setSelectedBanner(null);
              setIsDialogOpen(true);
            }}
            variant="outline"
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("প্রথম ব্যানার যোগ করুন", "Add First Banner")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredBanners.map((banner) => (
            <Card
              key={banner.id}
              className="overflow-hidden border-border/70 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Banner Preview */}
                <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={banner.image_url}
                    alt={banner.title_bn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/hero-campus.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 p-4 flex flex-col justify-between text-white pointer-events-none">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-white text-xs shadow-md">
                        {t("স্লাইড", "Slide")} #{banner.order_index}
                      </Badge>
                      {banner.is_active ? (
                        <Badge className="bg-emerald-600 text-white text-xs shadow-md">
                          {t("সক্রিয়", "Active")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs shadow-md">
                          {t("নিষ্ক্রিয়", "Inactive")}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg line-clamp-1 drop-shadow-md text-white">
                        {banner.title_bn}
                      </h3>
                      {banner.subtitle_bn && (
                        <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 mt-0.5 drop-shadow-sm">
                          {banner.subtitle_bn}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Body */}
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("বাটন লিংক:", "CTA Link:")}</span>
                    {banner.cta_link ? (
                      <span className="font-mono text-primary font-medium flex items-center gap-1">
                        {banner.cta_text_bn || "Learn More"}
                        <MoveRight className="h-3 w-3" />
                      </span>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Card Footer Controls */}
              <div className="p-4 pt-0 border-t border-border/40 mt-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t("সক্রিয় অবস্থা:", "Status:")}
                  </span>
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={() => handleToggleActive(banner)}
                    aria-label="Toggle banner active state"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedBanner(banner);
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
                    onClick={() => setDeletingBanner(banner)}
                    title={t("মুছে ফেলুন", "Delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Banner Dialog */}
      <HeroBannerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        bannerToEdit={selectedBanner}
        onSuccess={fetchBanners}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingBanner}
        onOpenChange={(open) => !open && setDeletingBanner(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("হিরো ব্যানারটি মুছে ফেলতে চান?", "Delete this hero banner?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `"${deletingBanner?.title_bn}" ব্যানারটি স্থায়ীভাবে মুছে ফেলা হবে।`,
                `"${deletingBanner?.title_bn}" will be permanently removed.`
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
