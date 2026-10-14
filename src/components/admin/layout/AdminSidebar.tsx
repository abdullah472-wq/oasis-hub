import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BellRing,
  Film,
  Globe,
  ShieldCheck,
  Settings,
  ExternalLink,
  LogOut,
  X,
  CalendarDays,
  Newspaper,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const adminNavItems = [
  {
    titleBn: "ড্যাশবোর্ড",
    titleEn: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    titleBn: "নোটিশ ম্যানেজমেন্ট",
    titleEn: "Notice Management",
    path: "/admin/notices",
    icon: BellRing,
    badge: null,
  },
  {
    titleBn: "সংবাদ প্রকাশ",
    titleEn: "News Publish",
    path: "/admin/news",
    icon: Newspaper,
    badge: null,
  },
  {
    titleBn: "মিডিয়া সেন্টার",
    titleEn: "Media Center",
    path: "/admin/media",
    icon: Film,
    badge: null,
  },
  {
    titleBn: "ইভেন্ট ক্যালেন্ডার",
    titleEn: "Events Calendar",
    path: "/admin/events",
    icon: CalendarDays,
    badge: null,
  },
  {
    titleBn: "ওয়েবসাইট কনটেন্ট",
    titleEn: "Website Content",
    path: "/admin/content",
    icon: Globe,
    badge: null,
  },
  {
    titleBn: "অ্যাডমিন ম্যানেজমেন্ট",
    titleEn: "Admin & Logs",
    path: "/admin/admins",
    icon: ShieldCheck,
    badge: null,
  },
  {
    titleBn: "সেটিংস",
    titleEn: "Settings",
    path: "/admin/settings",
    icon: Settings,
    badge: null,
  },
];

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { profile, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/80 bg-card shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-border/70 px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <span className="font-display text-xl font-bold">নূর</span>
            </div>
            <div>
              <h2 className="font-display text-base font-bold leading-tight text-foreground">
                {t("আননূর সিএমএস", "Annoor CMS")}
              </h2>
              <p className="font-bengali text-xs text-muted-foreground">
                {t("ইনস্টিটিউশন পোর্টাল", "Institution Portal")}
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            {t("মডিউল তালিকা", "CMS Modules")}
          </div>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin/dashboard" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-primary-foreground" : "text-primary"
                    }`}
                  />
                  <span className="font-bengali">{t(item.titleBn, item.titleEn)}</span>
                </div>
                {item.badge && (
                  <Badge variant={isActive ? "secondary" : "outline"} className="rounded-full text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-border/70 p-4 space-y-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-secondary/50 px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <span className="flex items-center gap-2 font-bengali">
              <ExternalLink className="h-4 w-4 text-primary" />
              {t("পাবলিক ওয়েবসাইট দেখুন", "View Public Site")}
            </span>
          </Link>

          {/* User profile card */}
          <div className="flex items-center justify-between rounded-2xl bg-secondary/30 p-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                {profile?.full_name?.slice(0, 1) || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-bengali text-xs font-semibold text-foreground">
                  {profile?.full_name || "অ্যাডমিন"}
                </p>
                <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-primary">
                  {profile?.role === "super_admin" ? "Super Admin" : "Editor"}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => void logout()}
              title={t("লগআউট", "Logout")}
              className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
