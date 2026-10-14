import { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  Copy,
  Check,
  RotateCw,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { GalleryItem, GalleryCategory } from "@/types/cms";
import { GalleryFormDialog } from "./GalleryFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

export const GalleryManager = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data as GalleryItem[]) || []);
    } catch (err: any) {
      console.error("Error fetching gallery items:", err);
      toast.error(t("গ্যালারি লোড করতে সমস্যা হয়েছে", "Failed to load gallery"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleCopyUrl = (item: GalleryItem) => {
    navigator.clipboard.writeText(item.image_url);
    setCopiedId(item.id);
    toast.success(t("ছবির লিঙ্ক কপি করা হয়েছে", "Image URL copied to clipboard"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const { error } = await supabase
        .from("gallery_items")
        .delete()
        .eq("id", deletingItem.id);

      if (error) throw error;

      await logAdminActivity(
        "DELETE",
        "gallery_items",
        `গ্যালারি ছবি মুছে ফেলা: "${deletingItem.title_bn}"`
      );

      toast.success(t("ছবি সফলভাবে মুছে ফেলা হয়েছে", "Image deleted successfully"));
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err: any) {
      console.error("Error deleting gallery item:", err);
      toast.error(t("ছবি মুছতে সমস্যা হয়েছে", "Failed to delete image"));
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.title_en && item.title_en.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  const getCategoryBadge = (category: GalleryCategory) => {
    switch (category) {
      case "campus":
        return <Badge className="bg-blue-500/10 text-blue-600">{t("ক্যাম্পাস", "Campus")}</Badge>;
      case "event":
        return <Badge className="bg-purple-500/10 text-purple-600">{t("ইভেন্ট", "Event")}</Badge>;
      case "academic":
        return <Badge className="bg-emerald-500/10 text-emerald-600">{t("একাডেমিক", "Academic")}</Badge>;
      case "achievement":
        return <Badge className="bg-amber-500/10 text-amber-600">{t("অর্জন", "Achievement")}</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("ছবি খুঁজুন...", "Search photos...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder={t("ক্যাটাগরি", "Category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("সব ক্যাটাগরি", "All Categories")}</SelectItem>
              <SelectItem value="campus">{t("ক্যাম্পাস", "Campus")}</SelectItem>
              <SelectItem value="event">{t("ইভেন্ট / অনুষ্ঠান", "Events")}</SelectItem>
              <SelectItem value="academic">{t("একাডেমিক", "Academic")}</SelectItem>
              <SelectItem value="achievement">{t("অর্জন ও পুরস্কার", "Achievements")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchGalleryItems}
            disabled={loading}
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => {
              setSelectedItem(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{t("ছবি আপলোড করুন", "Upload Photo")}</span>
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/40" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h4 className="text-base font-semibold">{t("গ্যালারিতে কোনো ছবি পাওয়া যায়নি", "No photos found")}</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t(
              "Supabase Storage-এ ছবি ড্র্যাগ-এন্ড-ড্রপ আপলোড করে পাবলিক গ্যালারিতে প্রদর্শন করুন।",
              "Upload photos directly to Supabase Storage to show them in the institution gallery."
            )}
          </p>
          <Button
            onClick={() => {
              setSelectedItem(null);
              setIsFormOpen(true);
            }}
            variant="outline"
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("প্রথম ছবি আপলোড করুন", "Upload First Photo")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-border/70 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => setPreviewItem(item)}
                  className="relative aspect-4/3 w-full bg-black/5 cursor-pointer overflow-hidden"
                >
                  <img
                    src={item.image_url}
                    alt={item.title_bn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                  <div className="absolute top-2 left-2">
                    {getCategoryBadge(item.category)}
                  </div>
                </div>

                <div className="p-3">
                  <h4
                    className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
                    onClick={() => setPreviewItem(item)}
                    title={item.title_bn}
                  >
                    {item.title_bn}
                  </h4>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 pt-0 border-t border-border/40 mt-1 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopyUrl(item)}
                  title={t("লিঙ্ক কপি করুন", "Copy URL")}
                >
                  {copiedId === item.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedItem(item);
                      setIsFormOpen(true);
                    }}
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
      <GalleryFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        itemToEdit={selectedItem}
        onSuccess={fetchGalleryItems}
      />

      {/* Full Preview Modal */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-3xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="line-clamp-1">{previewItem?.title_bn}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] w-full rounded-lg overflow-hidden bg-black/5 flex items-center justify-center mt-2">
            {previewItem && (
              <img
                src={previewItem.image_url}
                alt={previewItem.title_bn}
                className="max-h-[70vh] w-auto object-contain rounded-md"
              />
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              {previewItem && getCategoryBadge(previewItem.category)}
            </div>
            {previewItem && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(previewItem.image_url, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("পূর্ণ ছবি দেখুন", "View Original")}
              </Button>
            )}
          </div>
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
              {t("ছবি মুছে ফেলতে চান?", "Delete this photo?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `"${deletingItem?.title_bn}" ছবিটি গ্যালারি থেকে স্থায়ীভাবে মুছে ফেলা হবে।`,
                `"${deletingItem?.title_bn}" will be permanently removed from the gallery.`
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
