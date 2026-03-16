import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [academicOpen, setAcademicOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileAdmissionOpen, setMobileAdmissionOpen] = useState(false);
  const [mobileAcademicOpen, setMobileAcademicOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  const mainLinks = [
    { to: "/", label: t("হোম", "Home") },
    { to: "/about", label: t("আমাদের সম্পর্কে", "About") },
    { to: "/news", label: t("সংবাদ", "News") },
    { to: "/contact", label: t("যোগাযোগ", "Contact") },
    { to: "/ramadan", label: t("রমজান", "Ramadan") },
  ];

  const admissionLinks = [
    { to: "/admission", label: t("ভর্তি তথ্য", "Admission Info") },
    { to: "/admission-form", label: t("অনলাইন ভর্তি", "Online Admission") },
  ];

  const academicLinks = [
    { to: "/teachers", label: t("শিক্ষকবৃন্দ", "Teachers") },
    { to: "/notices", label: t("নোটিশ বোর্ড", "Notice") },
    { to: "/results", label: t("পরীক্ষার ফলাফল", "Results") },
    { to: "/gallery", label: t("গ্যালারি", "Gallery") },
    { to: "/events", label: t("ইভেন্ট ক্যালেন্ডার", "Events") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            <img src="/src/assets/logo.png.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground leading-tight">
              {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
            </h1>
            <p className="text-xs text-muted-foreground font-display">
              EMIS Code: 307030265
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {mainLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all font-bengali ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary hover:scale-105"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Admission Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setAdmissionOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all font-bengali text-foreground hover:bg-secondary hover:scale-105"
            >
              {t("ভর্তি", "Admission")}
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {admissionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setAdmissionOpen(false)}
                  className="absolute top-full left-0 mt-1 py-2 bg-card border border-border rounded-xl shadow-lg min-w-[160px]"
                >
                  {admissionLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block px-4 py-2 text-sm font-medium font-bengali text-foreground hover:bg-secondary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Academic Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setAcademicOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all font-bengali text-foreground hover:bg-secondary hover:scale-105"
            >
              {t("একাডেমিক", "Academic")}
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {academicOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setAcademicOpen(false)}
                  className="absolute top-full left-0 mt-1 py-2 bg-card border border-border rounded-xl shadow-lg min-w-[180px]"
                >
                  {academicLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block px-4 py-2 text-sm font-medium font-bengali text-foreground hover:bg-secondary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Login Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setLoginOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all font-bengali text-foreground hover:bg-secondary hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              {t("লগইন", "Login")}
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {loginOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setLoginOpen(false)}
                  className="absolute top-full left-0 mt-1 py-2 bg-card border border-border rounded-xl shadow-lg min-w-[160px]"
                >
                  <a
                    href="https://eskooly.com/login.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm font-medium font-bengali text-foreground hover:bg-secondary"
                  >
                    {t("ছাত্র লগইন", "Student Login")}
                  </a>
                  <a
                    href="https://eskooly.com/login.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm font-medium font-bengali text-foreground hover:bg-secondary"
                  >
                    {t("শিক্ষক লগইন", "Teacher Login")}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <LanguageToggle />
        </div>

        <div className="flex items-center gap-3">
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
              {/* Language Toggle - Top of Mobile Menu */}
              <div className="pb-3 border-b border-border mb-2">
                <LanguageToggle />
              </div>

              {mainLinks.map((link) => (
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
              
              {/* Admission - Mobile Collapsible */}
              <button
                onClick={() => setMobileAdmissionOpen(!mobileAdmissionOpen)}
                className="flex items-center justify-between px-4 py-3 rounded-xl font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <span>{t("ভর্তি", "Admission")}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileAdmissionOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileAdmissionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {admissionLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => { setIsOpen(false); setMobileAdmissionOpen(false); }}
                        className="block pl-8 pr-4 py-2 rounded-xl font-bengali font-medium text-foreground hover:bg-secondary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Academic - Mobile Collapsible */}
              <button
                onClick={() => setMobileAcademicOpen(!mobileAcademicOpen)}
                className="flex items-center justify-between px-4 py-3 rounded-xl font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <span>{t("একাডেমিক", "Academic")}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileAcademicOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileAcademicOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {academicLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => { setIsOpen(false); setMobileAcademicOpen(false); }}
                        className="block pl-8 pr-4 py-2 rounded-xl font-bengali font-medium text-foreground hover:bg-secondary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login - Mobile */}
              <a
                href="https://eskooly.com/login.php"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-bengali font-medium text-foreground hover:bg-secondary mt-2"
              >
                <LogIn className="w-4 h-4" />
                {t("ছাত্র লগইন", "Student Login")}
              </a>
              <a
                href="https://eskooly.com/login.php"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <LogIn className="w-4 h-4" />
                {t("শিক্ষক লগইন", "Teacher Login")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;
