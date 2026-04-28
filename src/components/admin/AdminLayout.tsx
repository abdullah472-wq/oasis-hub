import { Bell, LogOut, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminUser, SidebarGroup } from "@/lib/adminDashboard";
import { canAccessPermission } from "@/lib/adminDashboard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AdminNotificationItem {
  id: string;
  title: string;
  detail: string;
  href?: string;
  createdAt: number;
  tone?: "primary" | "muted";
}

interface AdminTodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface AdminLayoutProps {
  user: AdminUser;
  pageTitle: string;
  pageDescription: string;
  groups: SidebarGroup[];
  currentPath: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  todoDraft: string;
  todos: AdminTodoItem[];
  notificationCount: number;
  notifications: AdminNotificationItem[];
  onTodoDraftChange: (value: string) => void;
  onAddTodo: () => void;
  onRemoveTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onNotificationsOpen?: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const AdminLayout = ({
  user,
  pageTitle,
  pageDescription,
  groups,
  currentPath,
  searchValue,
  onSearchChange,
  todoDraft,
  todos,
  notificationCount,
  notifications,
  onTodoDraftChange,
  onAddTodo,
  onRemoveTodo,
  onToggleTodo,
  onNotificationsOpen,
  onLogout,
  children,
}: AdminLayoutProps) => {
  const { t } = useLanguage();
  const pendingTodoCount = todos.filter((item) => !item.completed).length;

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
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          {groups.map((group) => {
            const visibleItems = group.items.filter((item) => item.key === "logout" || canAccessPermission(user, item.permission));
            if (visibleItems.length === 0) return null;

            return (
              <SidebarSection key={group.key}>
                <SidebarGroupLabel>{t(group.labelBn, group.labelEn)}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isLogout = item.key === "logout";
                      const isActive = !isLogout && currentPath.startsWith(item.path);

                      return (
                        <SidebarMenuItem key={item.key}>
                          {isLogout ? (
                            <SidebarMenuButton asChild tooltip={t(item.labelBn, item.labelEn)}>
                              <button onClick={onLogout} className="w-full">
                                <Icon />
                                <span>{t(item.labelBn, item.labelEn)}</span>
                              </button>
                            </SidebarMenuButton>
                          ) : (
                            <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.labelBn, item.labelEn)}>
                              <Link to={item.path}>
                                <Icon />
                                <span>{t(item.labelBn, item.labelEn)}</span>
                              </Link>
                            </SidebarMenuButton>
                          )}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarSection>
            );
          })}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60 p-3" />
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="flex flex-col gap-4 px-3 py-3 sm:px-4 md:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <SidebarTrigger className="mt-1 h-9 w-9 shrink-0 rounded-xl border border-border bg-card text-foreground" />
                <div className="min-w-0">
                  <h1 className="truncate font-bengali text-lg font-semibold tracking-tight text-foreground sm:text-xl md:text-2xl">{pageTitle}</h1>
                  {pageDescription ? (
                    <p className="line-clamp-2 font-bengali text-[11px] text-muted-foreground sm:text-sm">{pageDescription}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative h-11 w-11 rounded-2xl border-border/70 bg-card shadow-sm"
                      aria-label={t("টু-ডু নোটপ্যাড", "To-Do Notepad")}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 3h8" />
                        <path d="M9 2v2" />
                        <path d="M15 2v2" />
                        <rect x="5" y="4" width="14" height="17" rx="2" />
                        <path d="M8 9h8" />
                        <path d="M8 13h8" />
                        <path d="M8 17h5" />
                      </svg>
                      {pendingTodoCount > 0 && (
                        <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                          {pendingTodoCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-96 max-w-[calc(100vw-1.5rem)] rounded-3xl border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(254,243,199,0.94))] p-0 shadow-[0_24px_80px_-40px_rgba(120,53,15,0.4)]"
                  >
                    <div className="border-b border-amber-200/80 px-4 py-3">
                      <DropdownMenuLabel className="px-0 font-bengali text-base text-amber-950">
                        {t("টু-ডু নোটপ্যাড", "To-Do Notepad")}
                      </DropdownMenuLabel>
                      <p className="font-bengali text-xs text-amber-900/70">
                        {t("ছোট ছোট কাজ লিখে রাখুন, সম্পন্ন হলে কেটে দিন", "Write down quick tasks and cross them off when done")}
                      </p>
                    </div>

                    <div className="space-y-4 p-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={todoDraft}
                          onChange={(event) => onTodoDraftChange(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              onAddTodo();
                            }
                          }}
                          className="h-11 rounded-2xl border-amber-300/80 bg-white/80 font-bengali shadow-none placeholder:text-amber-900/40"
                          placeholder={t("নতুন কাজ লিখুন", "Write a new task")}
                        />
                        <Button
                          type="button"
                          onClick={onAddTodo}
                          className="h-11 rounded-2xl bg-amber-500 px-4 font-bengali text-white hover:bg-amber-600"
                        >
                          + {t("যোগ", "Add")}
                        </Button>
                      </div>

                      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                        {todos.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-amber-300/80 bg-white/60 px-4 py-5 text-center">
                            <p className="font-bengali text-sm text-amber-900/75">
                              {t("এখনো কোনো টু-ডু যোগ করা হয়নি", "No to-do items added yet")}
                            </p>
                          </div>
                        ) : (
                          todos.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-white/70 px-3 py-3"
                            >
                              <button
                                type="button"
                                onClick={() => onToggleTodo(item.id)}
                                className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-amber-400 text-xs text-amber-800 transition hover:bg-amber-100"
                                aria-label={item.completed ? t("কাজটি অসম্পূর্ণ করুন", "Mark task incomplete") : t("কাজটি সম্পন্ন করুন", "Mark task complete")}
                              >
                                {item.completed ? "✓" : ""}
                              </button>
                              <div className="min-w-0 flex-1">
                                <p className={`font-bengali text-sm leading-6 text-amber-950 ${item.completed ? "text-amber-900/50 line-through" : ""}`}>
                                  {item.text}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onRemoveTodo(item.id)}
                                className="rounded-full px-2 py-1 font-bengali text-xs text-amber-800/80 transition hover:bg-red-50 hover:text-red-600"
                                aria-label={t("কাজ মুছুন", "Remove task")}
                              >
                                {t("মুছুন", "Remove")}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu onOpenChange={(open) => open && onNotificationsOpen?.()}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative h-11 w-11 rounded-2xl border-border/70 bg-card shadow-sm">
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                          {notificationCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl">
                    <DropdownMenuLabel className="font-bengali">
                      {t("ড্যাশবোর্ড নোটিফিকেশন", "Dashboard Notifications")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="space-y-1 p-2">
                      {notifications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/60 px-3 py-4 text-center text-sm text-muted-foreground">
                          {t("এখন কোনো নতুন নোটিফিকেশন নেই", "No new notifications right now")}
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <DropdownMenuItem
                            key={item.id}
                            asChild={Boolean(item.href)}
                            className="items-start rounded-xl px-3 py-3 font-bengali text-sm"
                          >
                            {item.href ? (
                              <Link to={item.href} className="flex w-full items-start gap-3">
                                <div className="space-y-1">
                                  <p className="text-foreground">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                                </div>
                                {item.tone === "primary" && (
                                  <Badge className="ml-auto rounded-full" variant="secondary">
                                    {t("নতুন", "New")}
                                  </Badge>
                                )}
                              </Link>
                            ) : (
                              <div className="flex w-full items-start gap-3">
                                <div className="space-y-1">
                                  <p className="text-foreground">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                                </div>
                                {item.tone === "primary" && (
                                  <Badge className="ml-auto rounded-full" variant="secondary">
                                    {t("নতুন", "New")}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 rounded-2xl border-border/70 bg-card px-3 shadow-sm">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Avatar className="h-8 w-8">
                          <img src="/site-logo.png" alt="Admin avatar" className="h-full w-full object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary">{user.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="hidden text-left md:block">
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

            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="h-11 rounded-2xl border-border/70 bg-card pl-10 shadow-sm"
                  placeholder={t("সেকশন সার্চ করুন", "Search sections")}
                />
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 md:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
