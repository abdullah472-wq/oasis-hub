import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { shellCardClass } from "@/components/admin/AdminPagePrimitives";

export const mediaCardClass = shellCardClass;

export const MediaStatCard = ({
  label,
  value,
  icon: Icon,
  hint,
  accent = "primary",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  accent?: "primary" | "accent" | "muted" | "destructive";
}) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <Card className={cn(mediaCardClass, "overflow-hidden")}>
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            accent === "primary" && "bg-primary/10 text-primary",
            accent === "accent" && "bg-accent/20 text-accent-foreground",
            accent === "muted" && "bg-muted text-muted-foreground",
            accent === "destructive" && "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bengali text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {hint ? <p className="truncate font-bengali text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const MediaEmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <Card className={mediaCardClass}>
    <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-bengali text-lg font-semibold text-foreground">{title}</p>
      <p className="max-w-md font-bengali text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-2 rounded-2xl font-bengali" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </CardContent>
  </Card>
);

export const MediaGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} className={mediaCardClass}>
        <Skeleton className="aspect-video w-full rounded-t-3xl" />
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const MediaStatusBadge = ({ status }: { status: "draft" | "published" }) => (
  <Badge
    variant={status === "published" ? "default" : "secondary"}
    className="rounded-full px-3 py-0.5 text-[11px] font-medium capitalize"
  >
    {status}
  </Badge>
);

export const MediaPagination = ({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) => {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <span className="px-2 text-sm text-muted-foreground">
        {page} / {pageCount}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export const MediaSectionCard = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <Card className={mediaCardClass}>
    <CardContent className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bengali text-lg font-semibold text-foreground">{title}</h3>
          {description ? <p className="font-bengali text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </CardContent>
  </Card>
);

export const usePaged = <T,>(items: T[], page: number, pageSize: number) => {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);
  return {
    pageCount,
    safePage,
    pageItems: items.slice((safePage - 1) * pageSize, safePage * pageSize),
  };
};
