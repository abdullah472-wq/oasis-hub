import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  const links = [
    { to: "/", label: t("হোম", "Home") },
    { to: "/about", label: t("আমাদের সম্পর্কে", "About") },
    { to: "/teachers", label: t("শিক্ষকবৃন্দ", "Teachers") },
    { to: "/notices", label: t("নোটিশ বোর্ড", "Notice") },
    { to: "/results", label: t("ফলাফল", "Results") },
    { to: "/admission", label: t("ভর্তি", "Admission") },
    { to: "/gallery", label: t("গ্যালারি", "Gallery") },
    { to: "/contact", label: t("যোগাযোগ", "Contact") },
    { to: "/ramadan", label: t("রমজান", "Ramadan") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display text-lg font-bold">IA</span>
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground leading-tight">
              {t("ইসলামিক একাডেমি", "Islamic Academy")}
            </h1>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors font-bengali ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-secondary text-foreground"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-card border-t border-border"
          >
            <div className="p-4 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl font-bengali font-medium transition-colors ${
                    location.pathname === link.to
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
