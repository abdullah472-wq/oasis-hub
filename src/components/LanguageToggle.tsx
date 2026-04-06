import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle = ({ className }: LanguageToggleProps) => {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn("relative flex w-[104px] items-center rounded-full border border-border/70 bg-card p-1 shadow-sm", className)}>
      <motion.div
        className="absolute h-8 w-12 rounded-full bg-primary"
        animate={{ x: lang === "bn" ? 0 : 48 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => setLang("bn")}
        className={cn(
          "relative z-10 h-8 w-12 rounded-full text-sm font-bengali font-semibold transition-colors",
          lang === "bn" ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "relative z-10 h-8 w-12 rounded-full text-sm font-semibold transition-colors",
          lang === "en" ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
