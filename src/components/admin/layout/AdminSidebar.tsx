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
  BookOpen,
  CreditCard,
  Users,
  Crown,
  FileDown,
  UserCheck,
  MessageSquareQuote,
  Award,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/lib/siteSettings";
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
    titleBn: "শিক্ষা কারিকুলাম",
    titleEn: "Curriculum",
    path: "/admin/curriculum",
    icon: BookOpen,
    badge: null,
  },
  {
    titleBn: "ডাউনলোড কর্নার",
    titleEn: "Download Corner",
    path: "/admin/downloads",
    icon: FileDown,
    badge: null,
  },
  {
    titleBn: "শিক্ষক ও স্টাফ",
    titleEn: "Teachers & Staff",
    path: "/admin/teachers",
    icon: Users,
    badge: null,
  },
  {
    titleBn: "কৃতি হাফেজ তালিকা",
    titleEn: "Wall of Huffaz",
    path: "/admin/huffaz",
    icon: Crown,
    badge: null,
  },
  {
    titleBn: "অনলাইন ভর্তি আবেদন",
    titleEn: "Online Admissions",
    path: "/admin/admissions",
    icon: UserCheck,
    badge: "নতুন",
  },
  {
    titleBn: "ফি ও ভর্তি তথ্য",
    titleEn: "Fees & Admission",
    path: "/admin/admission-info",
    icon: CreditCard,
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
    titleBn: "অর্জন ও সাফল্য",
    titleEn: "Achievements",
    path: "/admin/achievements",
    icon: Award,
    badge: null,
  },
  {
    titleBn: "ওয়েবসাইট ব্যানার",
    titleEn: "Hero Banners",
    path: "/admin/content",
    icon: Globe,
    badge: null,
  },
  {
    titleBn: "রিভিউ মডারেশন",
    titleEn: "Reviews Moderation",
    path: "/admin/reviews",
    icon: MessageSquareQuote,
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
  const { settings } = useSiteSettings();

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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/80 bg-card shadow-xl transition-transform duration-300 ease-in-out lg:static lg:h-full lg:w-72 lg:shrink-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-5">
          <Link to="/admin/dashboard" className="flex items-center gap-3 min-w-0">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="h-9 w-9 shrink-0 object-contain rounded-xl"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <span className="font-display text-lg font-bold">নূর</span>
              </div>
            )}
            <div className="min-w-0 truncate">
              <h2 className="font-bengali text-sm font-bold leading-tight text-foreground truncate">
                {settings.institution_name_bn || t("আননূর সিএমএস", "Annoor CMS")}
              </h2>
              <p className="font-bengali text-[11px] text-muted-foreground truncate">
                {settings.institution_name_en || t("ইনস্টিটিউশন পোর্টাল", "Institution Portal")}
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-secondary lg:hidden shrink-0"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2 text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 font-semibold"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-primary-foreground" : "text-primary"
                    }`}
                  />
                  <span className="font-bengali truncate">{t(item.titleBn, item.titleEn)}</span>
                </div>
                {item.badge && (
                  <Badge variant={isActive ? "secondary" : "outline"} className="rounded-full text-[10px] px-1.5 py-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-border/70 p-3 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/50 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <span className="flex items-center gap-2 font-bengali">
              <ExternalLink className="h-4 w-4 text-primary" />
              {t("পাবলিক ওয়েবসাইট দেখুন", "View Public Site")}
            </span>
          </Link>

          {/* User profile card */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/30 p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-xs text-primary">
                {profile?.full_name?.slice(0, 1) || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-bengali text-xs font-semibold text-foreground">
                  {profile?.full_name || "অ্যাডমিন"}
                </p>
                <Badge variant="outline" className="h-3.5 px-1 text-[9px] text-primary">
                  {profile?.role === "super_admin" ? "Super Admin" : "Editor"}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => void logout()}
              title={t("লগআউট", "Logout")}
              className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
