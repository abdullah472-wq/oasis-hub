import { useMemo, useState } from "react";
import { Bell, ChevronRight, ClipboardList, Globe2, Lock, LogOut, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminUser, SidebarGroup } from "@/lib/adminDashboard";
import { canAccessPermission } from "@/lib/adminDashboard";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup as SidebarSection,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface AdminNotificationItem {
  id: string;
  title: string;
  detail: string;
  href?: string;
  createdAt: number;
  tone?: "high" | "primary" | "muted";
}

export interface AdminTodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  visibility: "public" | "personal";
  ownerUid: string;
  ownerName: string;
}

interface AdminLayoutProps {
  user: AdminUser;
  pageTitle: string;
  sectionLabel: string;
  groups: SidebarGroup[];
  currentPath: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  todoDraft: string;
  todos: AdminTodoItem[];
  todoVisibility: "public" | "personal";
  notificationCount: number;
  notifications: AdminNotificationItem[];
  onTodoDraftChange: (value: string) => void;
  onTodoVisibilityChange: (value: "public" | "personal") => void;
  onAddTodo: () => void;
  onRemoveTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onNotificationsOpen?: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const BANGLA_MONTHS = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

const toBanglaDigits = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => BANGLA_DIGITS[Number(digit)]);

const isGregorianLeapYear = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const getBanglaDateLine = (date: Date) => {
  const year = date.getFullYear();
  const yearStart = new Date(year, 3, 14);
  const usesPreviousYear = date < yearStart;
  const banglaYear = usesPreviousYear ? year - 594 : year - 593;
  const banglaYearStart = usesPreviousYear ? new Date(year - 1, 3, 14) : yearStart;
  const dayOfYear = Math.floor((date.getTime() - banglaYearStart.getTime()) / 86400000) + 1;

  const monthLengths = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isGregorianLeapYear(banglaYearStart.getFullYear() + 1) ? 31 : 30, 30];
  let dayRemainder = dayOfYear;
  let monthIndex = 0;

  while (monthIndex < monthLengths.length && dayRemainder > monthLengths[monthIndex]) {
    dayRemainder -= monthLengths[monthIndex];
    monthIndex += 1;
  }

  const day = toBanglaDigits(dayRemainder);
  const month = BANGLA_MONTHS[Math.min(monthIndex, BANGLA_MONTHS.length - 1)];
  const formattedYear = toBanglaDigits(banglaYear);
  return `${day} ${month} ${formattedYear}`;
};

const formatRelativeTimestamp = (value: number, lang: "bn" | "en") => {
  const diffMs = value - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const absMinutes = Math.abs(diffMinutes);
  const locale = lang === "bn" ? "bn" : "en";
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absMinutes < 60) return formatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
};

const formatAbsoluteTimestamp = (value: number, lang: "bn" | "en") =>
  new Date(value).toLocaleString(lang === "bn" ? "bn-BD" : "en-BD", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

interface TodoPanelProps {
  user: AdminUser;
  compact?: boolean;
  pendingTodoCount: number;
  todoDraft: string;
  todos: AdminTodoItem[];
  todoVisibility: "public" | "personal";
  onTodoDraftChange: (value: string) => void;
  onTodoVisibilityChange: (value: "public" | "personal") => void;
  onAddTodo: () => void;
  onRemoveTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
}

const TodoPanel = ({
  user,
  compact = false,
  pendingTodoCount,
  todoDraft,
  todos,
  todoVisibility,
  onTodoDraftChange,
  onTodoVisibilityChange,
  onAddTodo,
  onRemoveTodo,
  onToggleTodo,
}: TodoPanelProps) => {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "space-y-4",
        compact
          ? ""
          : "rounded-[28px] border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(254,243,199,0.94))] p-5 shadow-[0_24px_80px_-40px_rgba(120,53,15,0.4)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bengali text-base font-semibold text-amber-950">{t("আজকের টাস্ক", "Today's Tasks")}</p>
          <p className="font-bengali text-xs text-amber-900/70">
            {t("সবচেয়ে জরুরি কাজগুলো সামনে রাখুন", "Keep the most important work visible")}
          </p>
        </div>
        <Badge className="rounded-full bg-amber-500 px-3 py-1 text-white hover:bg-amber-500">
          {pendingTodoCount} {t("বাকি", "open")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/65 p-1">
        {[
          {
            key: "public" as const,
            label: t("Public task", "Public task"),
            icon: Globe2,
          },
          {
            key: "personal" as const,
            label: t("Personal task", "Personal task"),
            icon: Lock,
          },
        ].map((item) => {
          const Icon = item.icon;
          const active = todoVisibility === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTodoVisibilityChange(item.key)}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-xl px-3 font-bengali text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                active ? "bg-amber-500 text-white shadow-sm" : "text-amber-950/80 hover:bg-white/80",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-white/55 px-3 py-2">
        <p className="font-bengali text-xs text-amber-900/80">
          {todoVisibility === "public"
            ? t("এই টাস্ক অ্যাডমিন ও ম্যানেজার সবাই দেখতে পারবে", "Admins and managers will both see this task")
            : t("এই টাস্ক শুধু আপনার প্যানেলেই দেখা যাবে", "Only you will see this task in your panel")}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={todoDraft}
          onChange={(event) => onTodoDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAddTodo();
            }
          }}
          className="h-11 rounded-2xl border-amber-300/80 bg-white/85 font-bengali shadow-none placeholder:text-amber-900/40"
          placeholder={t("নতুন কাজ লিখুন", "Write a new task")}
        />
        <Button
          type="button"
          onClick={onAddTodo}
          className="h-11 rounded-2xl bg-amber-500 px-4 font-bengali text-white hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          + {t("যোগ", "Add")}
        </Button>
      </div>

      <div className={cn("space-y-2", compact ? "max-h-[min(60vh,28rem)] overflow-y-auto pr-1" : "max-h-[calc(100vh-19rem)] overflow-y-auto pr-1")}>
        {todos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300/80 bg-white/60 px-4 py-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <p className="mt-3 font-bengali text-sm font-medium text-amber-950">
              {t("এখনো কোনো টাস্ক যোগ করা হয়নি", "No tasks added yet")}
            </p>
            <p className="mt-1 font-bengali text-xs text-amber-900/75">
              {t("উপরে একটি ছোট কাজ লিখে Add চাপুন", "Write a quick task above and press Add")}
            </p>
          </div>
        ) : (
          todos.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-white/75 px-3 py-3 sm:flex-row sm:items-start"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggleTodo(item.id)}
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400 text-xs text-amber-800 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label={item.completed ? t("কাজটি অসম্পূর্ণ করুন", "Mark task incomplete") : t("কাজটি সম্পন্ন করুন", "Mark task complete")}
                >
                  {item.completed ? "✓" : ""}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("font-bengali text-sm leading-6 text-amber-950", item.completed && "text-amber-900/50 line-through")}>
                    {item.text}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full px-2.5 py-0.5 font-bengali text-[11px]",
                        item.visibility === "public"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-200",
                      )}
                    >
                      {item.visibility === "public" ? t("Public", "Public") : t("Personal", "Personal")}
                    </Badge>
                    {item.visibility === "public" ? (
                      <span className="font-bengali text-[11px] text-amber-900/70">
                        {item.ownerUid === user.uid
                          ? t("আপনি যোগ করেছেন", "Added by you")
                          : t(`${item.ownerName} যোগ করেছেন`, `Added by ${item.ownerName}`)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex justify-end sm:justify-start">
                <button
                  type="button"
                  onClick={() => onRemoveTodo(item.id)}
                  className="rounded-full px-2 py-1 font-bengali text-xs text-amber-800/80 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  aria-label={t("কাজ মুছুন", "Remove task")}
                >
                  {t("মুছুন", "Remove")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AdminLayout = ({
  user,
  pageTitle,
  sectionLabel,
  groups,
  currentPath,
  searchValue,
  onSearchChange,
  todoDraft,
  todos,
  todoVisibility,
  notificationCount,
  notifications,
  onTodoDraftChange,
  onTodoVisibilityChange,
  onAddTodo,
  onRemoveTodo,
  onToggleTodo,
  onNotificationsOpen,
  onLogout,
  children,
}: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const pendingTodoCount = todos.filter((item) => !item.completed).length;
  const dayPartGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "শুভ সকাল";
    if (hour < 20) return "শুভ সন্ধ্যা";
    return "শুভ রাত্রি";
  }, []);
  const todayDateLines = useMemo(() => {
    const now = new Date();
    const gregorianParts = new Intl.DateTimeFormat("bn-BD", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(now);
    const weekday = gregorianParts.find((part) => part.type === "weekday")?.value ?? "";
    const day = gregorianParts.find((part) => part.type === "day")?.value ?? "";
    const month = gregorianParts.find((part) => part.type === "month")?.value ?? "";
    const year = gregorianParts.find((part) => part.type === "year")?.value ?? "";
    const gregorianWeekday = `আজ ${weekday}`;
    const gregorianDate = `${day} ${month}, ${year} ইংরেজী`;

    const bengali = getBanglaDateLine(now);
    const hijriParts = new Intl.DateTimeFormat("bn-BD-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(now);
    const hijriDay = hijriParts.find((part) => part.type === "day")?.value ?? "";
    const hijriMonth = hijriParts.find((part) => part.type === "month")?.value ?? "";
    const hijriYear = hijriParts.find((part) => part.type === "year")?.value ?? "";
    const hijri = `${hijriDay} ${hijriMonth}, ${hijriYear} হিজরী`;

    return { gregorianWeekday, gregorianDate, bengali: `${bengali} বঙ্গাব্দ`, hijri };
  }, []);

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => child.key === "logout" || canAccessPermission(user, child.permission)),
        }))
        .filter((item) => item.key === "logout" || canAccessPermission(user, item.permission) || (item.children && item.children.length > 0)),
    }))
    .filter((group) => group.items.length > 0);

  const hasSearchTerm = searchValue.trim().length > 0;
  const hasVisibleResults = visibleGroups.length > 0;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon" className="border-r border-sidebar-border/70">
        <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-4">
          <Link to="/admin/dashboard" className="flex items-center gap-3 rounded-2xl bg-sidebar-accent/60 p-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-sidebar-primary">
              <img src="/site-logo.png" alt="Site logo" className="h-9 w-9 object-contain" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate font-bengali text-sm text-sidebar-foreground/70">{t("অ্যাডমিন সিস্টেম", "Admin System")}</p>
              <h2 className="truncate font-display text-base font-semibold text-sidebar-foreground">{t("আননূর ড্যাশবোর্ড", "Annoor Dashboard")}</h2>
            </div>
          </Link>

          <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/35 p-3 group-data-[collapsible=icon]:hidden">
            <p className="font-bengali text-sm font-semibold text-sidebar-foreground">{dayPartGreeting}</p>
            <div className="mt-2 space-y-2">
              <div className="space-y-0.5">
                <p className="font-bengali text-xs leading-5 text-sidebar-foreground/75">{todayDateLines.gregorianWeekday}</p>
                <p className="font-bengali text-xs leading-5 text-sidebar-foreground/75">{todayDateLines.gregorianDate}</p>
              </div>
              <p className="font-bengali text-xs leading-5 text-sidebar-foreground/75">{todayDateLines.bengali}</p>
              <p className="font-bengali text-xs leading-5 text-sidebar-foreground/75">{todayDateLines.hijri}</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          {!hasVisibleResults && hasSearchTerm ? (
            <div className="mx-2 rounded-2xl border border-dashed border-sidebar-border/80 bg-sidebar-accent/20 px-4 py-5 text-center group-data-[collapsible=icon]:hidden">
              <p className="font-bengali text-sm font-medium text-sidebar-foreground">
                {t("কোনো ফলাফল পাওয়া যায়নি", "No results found")}
              </p>
              <p className="mt-1 font-bengali text-xs text-sidebar-foreground/70">
                {t("অন্য শব্দ দিয়ে আবার চেষ্টা করুন", "Try a different keyword")}
              </p>
            </div>
          ) : (
            visibleGroups.map((group, index) => (
              <SidebarSection key={group.key} className={cn(index > 0 && "mt-2 border-t border-sidebar-border/60 pt-3")}>
                <SidebarGroupLabel>{t(group.labelBn, group.labelEn)}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isLogout = item.key === "logout";
                      const isActive = !isLogout && currentPath === item.path;
                      const hasChildren = Boolean(item.children && item.children.length > 0);
                      const childPaths = hasChildren ? item.children!.map((child) => child.path) : [];
                      const isChildActive = hasChildren && childPaths.some((childPath) => currentPath === childPath);

                      if (isLogout) {
                        return (
                          <SidebarMenuItem key={item.key}>
                            <SidebarMenuButton
                              asChild
                              tooltip={t(item.labelBn, item.labelEn)}
                              className="h-11 rounded-2xl focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                            >
                              <button onClick={onLogout} className="w-full">
                                <Icon />
                                <span>{t(item.labelBn, item.labelEn)}</span>
                              </button>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      }

                      if (hasChildren) {
                        return (
                          <SidebarMenuItem key={item.key}>
                            <Collapsible defaultOpen={isChildActive}>
                              <SidebarMenuItem className="relative p-0">
                                <SidebarMenuButton
                                  isActive={isActive || isChildActive}
                                  tooltip={t(item.labelBn, item.labelEn)}
                                  className={cn(
                                    "h-11 rounded-2xl pl-3 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                    isActive || isChildActive
                                      ? "border-l-primary bg-primary text-primary-foreground shadow-[0_18px_40px_-24px_hsl(var(--primary))] hover:bg-primary/95 hover:text-primary-foreground"
                                      : "border-l-transparent hover:bg-sidebar-accent/70",
                                  )}
                                  onClick={() => navigate(item.path)}
                                >
                                  <div className="flex w-full items-center gap-3 pr-8 text-left">
                                    <Icon />
                                    <span className="flex-1 truncate">{t(item.labelBn, item.labelEn)}</span>
                                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200" />
                                  </div>
                                  <CollapsibleTrigger asChild>
                                    <button
                                      type="button"
                                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-sidebar-foreground/70 transition hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                                      aria-label={t("সেকশন খুলুন বা বন্ধ করুন", "Toggle section")}
                                      onClick={(event) => event.stopPropagation()}
                                    >
                                      <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                    </button>
                                  </CollapsibleTrigger>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                              <CollapsibleContent className="ml-6 mt-1 space-y-1 border-l-2 border-sidebar-border/70 pl-3">
                                {item.children!.map((child) => {
                                  const childActive = currentPath === child.path;
                                  const childIcon = child.icon;
                                  return (
                                    <SidebarMenuItem key={child.key}>
                                      <SidebarMenuButton
                                        asChild
                                        isActive={childActive}
                                        tooltip={t(child.labelBn, child.labelEn)}
                                        className={cn(
                                          "h-10 rounded-xl pl-3 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sidebar-ring text-sm",
                                          childActive
                                            ? "border-l-primary bg-primary/10 text-primary font-semibold"
                                            : "border-l-transparent hover:bg-sidebar-accent/70",
                                        )}
                                      >
                                        <Link to={child.path} title={t(child.labelBn, child.labelEn)}>
                                          <childIcon />
                                          <span>{t(child.labelBn, child.labelEn)}</span>
                                        </Link>
                                      </SidebarMenuButton>
                                      {child.badge ? <SidebarMenuBadge>{child.badge}</SidebarMenuBadge> : null}
                                    </SidebarMenuItem>
                                  );
                                })}
                              </CollapsibleContent>
                            </Collapsible>
                          </SidebarMenuItem>
                        );
                      }

                      return (
                        <SidebarMenuItem key={item.key}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={t(item.labelBn, item.labelEn)}
                            className={cn(
                              "h-11 rounded-2xl border-l-4 pl-3 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                              isActive
                                ? "border-l-primary bg-primary text-primary-foreground shadow-[0_18px_40px_-24px_hsl(var(--primary))] hover:bg-primary/95 hover:text-primary-foreground"
                                : "border-l-transparent hover:bg-sidebar-accent/70",
                            )}
                          >
                            <Link to={item.path} title={t(item.labelBn, item.labelEn)}>
                              <Icon />
                              <span>{t(item.labelBn, item.labelEn)}</span>
                            </Link>
                          </SidebarMenuButton>
                          {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarSection>
            ))
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60 p-3" />
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/92 backdrop-blur">
          <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 md:gap-4 md:px-6">
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <SidebarTrigger className="mt-1 h-9 w-9 shrink-0 rounded-xl border border-border bg-card text-foreground" />
                <div className="min-w-0">
                  <Badge variant="secondary" className="mb-2 rounded-full px-3 py-1 font-bengali text-[11px]">
                    {sectionLabel}
                  </Badge>
                  <h1 className="font-bengali text-lg font-semibold tracking-tight text-foreground sm:text-xl md:text-2xl">{pageTitle}</h1>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="relative hidden md:block md:w-72 lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-11 rounded-2xl border-border/70 bg-card pl-10 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder={t("সেকশন সার্চ করুন", "Search sections")}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative hidden h-10 w-10 rounded-2xl border-border/70 bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex sm:h-11 sm:w-11"
                      aria-label={t("টু-ডু নোটপ্যাড", "To-Do Notepad")}
                    >
                      <ClipboardList className="h-5 w-5" />
                      {pendingTodoCount > 0 && (
                        <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                          {pendingTodoCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="w-[min(24rem,calc(100vw-1rem))] rounded-3xl border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(254,243,199,0.94))] p-3 sm:p-4 shadow-[0_24px_80px_-40px_rgba(120,53,15,0.4)]"
                  >
                    <TodoPanel
                      user={user}
                      compact
                      pendingTodoCount={pendingTodoCount}
                      todoDraft={todoDraft}
                      todos={todos}
                      todoVisibility={todoVisibility}
                      onTodoDraftChange={onTodoDraftChange}
                      onTodoVisibilityChange={onTodoVisibilityChange}
                      onAddTodo={onAddTodo}
                      onRemoveTodo={onRemoveTodo}
                      onToggleTodo={onToggleTodo}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu onOpenChange={(open) => open && onNotificationsOpen?.()}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative h-10 w-10 rounded-2xl border-border/70 bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-primary sm:h-11 sm:w-11"
                    >
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                          {notificationCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={10} className="w-[min(22rem,calc(100vw-1rem))] rounded-2xl p-0">
                    <div className="border-b border-border/70 px-4 py-3">
                      <DropdownMenuLabel className="px-0 font-bengali text-base">
                        {t("অ্যাকশন সেন্টার", "Action Center")}
                      </DropdownMenuLabel>
                      <p className="font-bengali text-xs text-muted-foreground">
                        {t("জরুরি কাজ, approval queue, আর system updates এখানেই পাবেন", "See urgent work, approval queues, and system updates here")}
                      </p>
                    </div>

                    <div className="max-h-96 space-y-1 overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/60 px-4 py-5 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-primary">
                            <Bell className="h-5 w-5" />
                          </div>
                          <p className="mt-3 font-bengali text-sm font-medium text-foreground">
                            {t("এখন কোনো নতুন নোটিফিকেশন নেই", "No notifications right now")}
                          </p>
                          <p className="mt-1 font-bengali text-xs text-muted-foreground">
                            {t("নতুন ভর্তি, রিভিউ, বা গার্ডিয়ান রিকোয়েস্ট এলে এখানে দেখা যাবে", "New admissions, reviews, or guardian requests will appear here")}
                          </p>
                        </div>
                      ) : (
                        notifications.map((item) => {
                          const badgeText =
                            item.tone === "high"
                              ? t("High", "High")
                              : item.tone === "primary"
                                ? t("New", "New")
                                : null;

                          const content = (
                            <div className="flex w-full items-start gap-3">
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate font-bengali text-sm text-foreground">{item.title}</p>
                                  {badgeText ? (
                                    <Badge className="rounded-full px-2 py-0.5 text-[10px]" variant={item.tone === "high" ? "destructive" : "secondary"}>
                                      {badgeText}
                                    </Badge>
                                  ) : null}
                                </div>
                                <p className="font-bengali text-xs leading-5 text-muted-foreground">{item.detail}</p>
                                <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                                  <span>{formatRelativeTimestamp(item.createdAt, lang)}</span>
                                  <span>{formatAbsoluteTimestamp(item.createdAt, lang)}</span>
                                </div>
                              </div>
                            </div>
                          );

                          return item.href ? (
                            <DropdownMenuItem key={item.id} asChild className="rounded-xl px-3 py-3 font-bengali focus:bg-muted/70">
                              <Link to={item.href}>{content}</Link>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem key={item.id} className="rounded-xl px-3 py-3 font-bengali focus:bg-muted/70">
                              {content}
                            </DropdownMenuItem>
                          );
                        })
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 w-10 shrink-0 rounded-2xl border-border/70 bg-card p-0 shadow-sm focus-visible:ring-2 focus-visible:ring-primary sm:h-11 sm:w-11 lg:w-auto lg:px-3"
                    >
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <Avatar className="h-8 w-8">
                          <img src="/site-logo.png" alt="Admin avatar" className="h-full w-full object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary">{user.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="hidden text-left lg:block">
                          <p className="max-w-[140px] truncate font-bengali text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 rounded-2xl">
                    <DropdownMenuLabel className="font-bengali">
                      <div className="flex flex-col gap-1">
                        <span>{user.fullName}</span>
                        <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="font-bengali">
                      <Badge variant="secondary" className="mr-2 capitalize">{user.role}</Badge>
                      {user.status === "active" ? t("সক্রিয়", "Active") : t("নিষ্ক্রিয়", "Inactive")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="font-bengali text-red-600 focus:text-red-600" onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("লগআউট", "Logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="relative md:hidden">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-10 rounded-2xl border-border/70 bg-card pl-10 shadow-sm focus-visible:ring-2 focus-visible:ring-primary sm:h-11"
                placeholder={t("সেকশন সার্চ করুন", "Search sections")}
              />
            </div>
          </div>
        </header>

        <div className="space-y-6 px-4 py-6 md:px-6">
          <div className="h-px bg-border/70" />
          <div className="min-w-0">{children}</div>
        </div>

        <DropdownMenu open={taskPanelOpen} onOpenChange={setTaskPanelOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="fixed bottom-4 right-4 z-30 h-14 w-14 rounded-full bg-amber-500 p-0 text-white shadow-[0_20px_50px_-20px_rgba(245,158,11,0.8)] hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6"
              aria-label={t("ফ্লোটিং টাস্ক প্যানেল", "Floating task panel")}
            >
              <ClipboardList className="h-5 w-5" />
              {pendingTodoCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
                  {pendingTodoCount}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={12}
            className="w-[min(24rem,calc(100vw-1rem))] rounded-3xl border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(254,243,199,0.94))] p-3 sm:p-4 shadow-[0_24px_80px_-40px_rgba(120,53,15,0.4)]"
          >
            <TodoPanel
              user={user}
              compact
              pendingTodoCount={pendingTodoCount}
              todoDraft={todoDraft}
              todos={todos}
              todoVisibility={todoVisibility}
              onTodoDraftChange={onTodoDraftChange}
              onTodoVisibilityChange={onTodoVisibilityChange}
              onAddTodo={onAddTodo}
              onRemoveTodo={onRemoveTodo}
              onToggleTodo={onToggleTodo}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
