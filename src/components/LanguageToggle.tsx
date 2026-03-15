import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative flex items-center bg-secondary rounded-full p-1 cursor-pointer w-[100px]">
      <motion.div
        className="absolute h-8 w-12 rounded-full bg-primary"
        animate={{ x: lang === "bn" ? 0 : 48 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <button
        onClick={() => setLang("bn")}
        className={`relative z-10 w-12 h-8 text-sm font-bengali font-semibold rounded-full transition-colors ${
          lang === "bn" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        বাং
      </button>
      <button
        onClick={() => setLang("en")}
        className={`relative z-10 w-12 h-8 text-sm font-semibold rounded-full transition-colors ${
          lang === "en" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
