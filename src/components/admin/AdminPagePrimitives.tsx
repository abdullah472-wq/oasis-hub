import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const shellCardClass =
  "rounded-3xl border-border/60 bg-card/95 text-card-foreground shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)] dark:shadow-[0_24px_70px_-45px_rgba(0,0,0,0.65)]";

export const ModuleShell = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  children,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <span className="font-bengali text-sm font-semibold uppercase tracking-[0.2em]">Module</span>
        </div>
        <div>
          <h2 className="font-bengali text-2xl font-semibold text-foreground">{title}</h2>
          <p className="font-bengali text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actionLabel && onAction && (
        <Button className="rounded-2xl font-bengali" onClick={onAction}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
    {children}
  </div>
);

export const FormCard = ({
  children,
  onSubmit,
  saving = false,
  submitLabel = "সংরক্ষণ করুন",
}: {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent) => void;
  saving?: boolean;
  submitLabel?: string;
}) => (
  <Card className={shellCardClass}>
    <CardContent className="p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <Button type="submit" className="rounded-2xl font-bengali" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {submitLabel}
        </Button>
      </form>
    </CardContent>
  </Card>
);

export const BilingualInput = ({
  labelBn,
  labelEn,
  valueBn,
  valueEn,
  onBnChange,
  onEnChange,
}: {
  labelBn: string;
  labelEn: string;
  valueBn: string;
  valueEn: string;
  onBnChange: (value: string) => void;
  onEnChange: (value: string) => void;
}) => (
  <div className="grid gap-4 md:grid-cols-2">
    <Field label={`${labelBn} (বাংলা)`}>
      <Input value={valueBn} onChange={(event) => onBnChange(event.target.value)} className="rounded-2xl" />
    </Field>
    <Field label={`${labelEn} (English)`}>
      <Input value={valueEn} onChange={(event) => onEnChange(event.target.value)} className="rounded-2xl" />
    </Field>
  </div>
);

export const BilingualTextarea = ({
  labelBn,
  labelEn,
  valueBn,
  valueEn,
  onBnChange,
  onEnChange,
}: {
  labelBn: string;
  labelEn: string;
  valueBn: string;
  valueEn: string;
  onBnChange: (value: string) => void;
  onEnChange: (value: string) => void;
}) => (
  <div className="grid gap-4 md:grid-cols-2">
    <Field label={`${labelBn} (বাংলা)`}>
      <Textarea value={valueBn} onChange={(event) => onBnChange(event.target.value)} className="rounded-2xl" rows={4} />
    </Field>
    <Field label={`${labelEn} (English)`}>
      <Textarea value={valueEn} onChange={(event) => onEnChange(event.target.value)} className="rounded-2xl" rows={4} />
    </Field>
  </div>
);

export const FilePicker = ({
  label,
  file,
  onFileChange,
  accept,
}: {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept: string;
}) => (
  <div className="space-y-2">
    <Label className="font-bengali">{label}</Label>
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2 font-bengali text-sm text-muted-foreground">
        <Upload className="h-4 w-4" />
        <span>{file ? file.name : label}</span>
      </div>
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Browse</span>
      <input type="file" accept={accept} className="hidden" onChange={(event) => onFileChange(event.target.files?.[0] || null)} />
    </label>
  </div>
);

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="font-bengali">{label}</Label>
    {children}
  </div>
);

export const ItemCard = ({
  title,
  meta,
  onDelete,
  trailing,
  children,
}: {
  title: string;
  meta: string;
  onDelete: () => void;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-bengali text-base font-semibold text-foreground">{title}</h3>
          <Badge variant="outline" className="rounded-full bg-background text-xs">{meta}</Badge>
        </div>
        {children}
      </div>
      <div className="flex items-center gap-2">
        {trailing}
        <DeleteIconButton onClick={onDelete} />
      </div>
    </div>
  </div>
);

export const DeleteIconButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="outline" size="icon" className="rounded-2xl text-red-600 hover:text-red-600" onClick={onClick}>
    <Trash2 className="h-4 w-4" />
  </Button>
);

export const EmptyState = ({ text, className = "" }: { text: string; className?: string }) => (
  <div className={`rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center font-bengali text-sm text-muted-foreground ${className}`}>
    {text}
  </div>
);

export const ToggleRow = ({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
    <p className="font-bengali text-sm font-medium">{label}</p>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export function BellFileIcon(props: React.ComponentProps<typeof FileText>) {
  return <FileText {...props} />;
}
