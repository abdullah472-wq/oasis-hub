import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn("relative flex w-[112px] items-center rounded-full border border-border/70 bg-card p-1 shadow-sm", className)}>
      <motion.div
        className="absolute h-8 w-[52px] rounded-full bg-primary"
        animate={{ x: isDark ? 52 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "relative z-10 flex h-8 w-[52px] items-center justify-center gap-1 rounded-full text-[11px] font-bengali font-semibold transition-colors",
          !isDark ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        <Sun className="h-3.5 w-3.5" />
        <span>লাইট</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "relative z-10 flex h-8 w-[52px] items-center justify-center gap-1 rounded-full text-[11px] font-bengali font-semibold transition-colors",
          isDark ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        <Moon className="h-3.5 w-3.5" />
        <span>ডার্ক</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
