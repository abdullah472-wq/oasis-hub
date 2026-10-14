import { useState } from "react";
import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
import { MediaEmptyState, MediaStatusBadge, mediaCardClass } from "@/components/admin/media/MediaPrimitives";
import { downloadFile, uploadDocument } from "@/lib/upload";
import { useToast } from "@/hooks/use-toast";
import {
  DOWNLOAD_CATEGORIES,
  DOWNLOAD_CATEGORY_LABELS,
  type DownloadCategory,
  type MediaDownload,
  type MediaDownloadDraft,
} from "@/lib/mediaCenter";

interface Props {
  items: MediaDownload[];
  loading: boolean;
  canManage: boolean;
  onSave: (draft: MediaDownloadDraft, id?: string) => Promise<void>;
  onDelete: (item: MediaDownload) => Promise<void>;
}

const MediaDownloadsPage = ({ items, loading, canManage, onSave, onDelete }: Props) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DownloadCategory>("routine");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !file) return;
    setSaving(true);
    try {
      const fileUrl = await uploadDocument(file);
      await onSave({
        title: title.trim(),
        category,
        fileUrl,
        fileName: file.name,
        description: description.trim(),
        status: published ? "published" : "draft",
      });
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload the file.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleShell
      title="ডাউনলোড"
      description="Publish PDFs, routines, prospectus, syllabus and result sheets."
      icon={<Download className="h-5 w-5" />}
      recordCount={items.length}
      recordLabel="Files"
    >
      {canManage ? (
        <Card className={mediaCardClass}>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-bengali">Title</Label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-2xl" required maxLength={140} />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as DownloadCategory)}>
                  <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOWNLOAD_CATEGORIES.map((item) => (
                      <SelectItem key={item} value={item}>{DOWNLOAD_CATEGORY_LABELS[item].en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-bengali">Description</Label>
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="rounded-2xl" rows={2} maxLength={600} />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali">File</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="rounded-2xl"
                  required
                />
              </div>
              <div className="flex items-end gap-3">
                <Switch id="download-status" checked={published} onCheckedChange={setPublished} />
                <Label htmlFor="download-status" className="pb-2 font-bengali">Published</Label>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="rounded-2xl font-bengali" disabled={saving || !file}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {saving ? "Uploading..." : "Upload resource"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <MediaEmptyState icon={FileText} title="কোনো ফাইল নেই" description="Upload the first downloadable resource for visitors." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className={mediaCardClass}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bengali font-semibold text-foreground">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="rounded-full">
                        {DOWNLOAD_CATEGORY_LABELS[item.category]?.en ?? item.category}
                      </Badge>
                      <MediaStatusBadge status={item.status} />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-xl"
                    onClick={() => void downloadFile(item.fileUrl, item.fileName || item.title)}
                  >
                    <Download className="mr-1.5 h-4 w-4" /> Download
                  </Button>
                  {canManage ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl text-destructive"
                      onClick={() => void onDelete(item)}
                      aria-label="Delete resource"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ModuleShell>
  );
};

export default MediaDownloadsPage;
