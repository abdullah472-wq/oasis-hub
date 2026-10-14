import { useMemo, useState } from "react";
import { Images, Loader2, Star, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
import { MediaEmptyState, MediaGridSkeleton, mediaCardClass } from "@/components/admin/media/MediaPrimitives";
import { uploadImage } from "@/lib/upload";
import { useToast } from "@/hooks/use-toast";
import {
  GALLERY_CATEGORIES,
  GALLERY_CATEGORY_LABELS,
  type MediaGalleryDraft,
  type MediaGalleryCategory,
  type MediaGalleryItem,
} from "@/lib/mediaCenter";

interface Props {
  items: MediaGalleryItem[];
  loading: boolean;
  canManage: boolean;
  onSave: (draft: MediaGalleryDraft, id?: string) => Promise<void>;
  onDelete: (item: MediaGalleryItem) => Promise<void>;
}

const MediaGalleryPage = ({ items, loading, canManage, onSave, onDelete }: Props) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const [category, setCategory] = useState<MediaGalleryCategory>("campus");
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [albumFilter, setAlbumFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lightbox, setLightbox] = useState<MediaGalleryItem | null>(null);

  const albums = useMemo(
    () => Array.from(new Set(items.map((item) => item.album).filter(Boolean))).sort(),
    [items],
  );

  const filtered = items.filter((item) => {
    if (albumFilter !== "all" && item.album !== albumFilter) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    return true;
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadImage(file);
        await onSave({
          title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
          imageUrl: url,
          album: album.trim() || "General",
          category,
          featured,
          status: "published",
        });
      }
      setTitle("");
      setFeatured(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload the image.",
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <ModuleShell
      title="মিডিয়া গ্যালারি"
      description="Upload images, group them into albums and preview them in a lightbox."
      icon={<Images className="h-5 w-5" />}
      recordCount={items.length}
      recordLabel="Images"
    >
      {canManage ? (
        <Card className={mediaCardClass}>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <Label className="font-bengali">Title (optional)</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-2xl" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">Album</Label>
              <Input value={album} onChange={(event) => setAlbum(event.target.value)} className="rounded-2xl" placeholder="General" maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as MediaGalleryCategory)}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>{GALLERY_CATEGORY_LABELS[item].en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3">
              <Switch id="gallery-featured" checked={featured} onCheckedChange={setFeatured} />
              <Label htmlFor="gallery-featured" className="font-bengali pb-2">Featured album</Label>
            </div>
            <div className="flex items-end">
              <label className="w-full">
                <span className="sr-only">Upload images</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                <span className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload images"}
                </span>
              </label>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className={mediaCardClass}>
        <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
          <Select value={albumFilter} onValueChange={setAlbumFilter}>
            <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Album" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All albums</SelectItem>
              {albums.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {GALLERY_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>{GALLERY_CATEGORY_LABELS[item].en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <MediaGridSkeleton />
      ) : filtered.length === 0 ? (
        <MediaEmptyState icon={Images} title="কোনো ছবি নেই" description="Upload images to build the media gallery." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <Card key={item.id} className={`${mediaCardClass} group overflow-hidden`}>
              <button type="button" onClick={() => setLightbox(item)} className="block w-full" aria-label={`Preview ${item.title}`}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
              <CardContent className="space-y-2 p-4">
                <p className="line-clamp-1 font-bengali text-sm font-medium text-foreground">{item.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="rounded-full">{item.album}</Badge>
                  <span>{GALLERY_CATEGORY_LABELS[item.category]?.en ?? item.category}</span>
                  {item.featured ? <Star className="h-3.5 w-3.5 fill-current text-primary" /> : null}
                </div>
                {canManage ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl text-destructive"
                    onClick={() => void onDelete(item)}
                    aria-label="Delete image"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(lightbox)} onOpenChange={(value) => !value && setLightbox(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-bengali">{lightbox?.title}</DialogTitle>
          </DialogHeader>
          {lightbox ? (
            <img src={lightbox.imageUrl} alt={lightbox.title} className="max-h-[70vh] w-full rounded-2xl object-contain" />
          ) : null}
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
};

export default MediaGalleryPage;
