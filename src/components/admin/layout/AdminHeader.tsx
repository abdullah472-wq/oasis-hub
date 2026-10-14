import { Menu, Globe, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
}

export const AdminHeader = ({ title, subtitle, onOpenSidebar }: AdminHeaderProps) => {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur-md md:px-8">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="rounded-xl lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-bengali text-lg font-bold text-foreground md:text-xl">{title}</h1>
          {subtitle && (
            <p className="font-bengali text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Quick actions & Language toggle */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === "bn" ? "en" : "bn")}
          className="h-9 gap-1.5 rounded-xl border-border/80 px-3 font-display text-xs"
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>{lang === "bn" ? "English" : "বাংলা"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="hidden h-9 gap-1.5 rounded-xl border-border/80 px-3 font-bengali text-xs sm:inline-flex"
        >
          <Link to="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{t("ওয়েবসাইট", "Website")}</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};
