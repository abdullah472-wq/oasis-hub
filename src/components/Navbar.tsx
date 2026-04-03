import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import UpdateAlertsManager from "./UpdateAlertsManager";
import { useLanguage } from "@/contexts/LanguageContext";
import siteLogo from "@/assets/logos/site-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [academicOpen, setAcademicOpen] = useState(false);
  const [mobileAdmissionOpen, setMobileAdmissionOpen] = useState(false);
  const [mobileAcademicOpen, setMobileAcademicOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  const mainLinks = [
    { to: "/", label: t("\u09b9\u09cb\u09ae", "Home") },
    { to: "/about", label: t("\u0986\u09ae\u09be\u09a6\u09c7\u09b0 \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09c7", "About") },
    { to: "/news", label: t("\u09b8\u0982\u09ac\u09be\u09a6", "News") },
    { to: "/contact", label: t("\u09af\u09cb\u0997\u09be\u09af\u09cb\u0997", "Contact") },
    { to: "/ramadan", label: t("\u09b0\u09ae\u099c\u09be\u09a8", "Ramadan") },
  ];

  const admissionLinks = [
    { to: "/admission", label: t("\u09ad\u09b0\u09cd\u09a4\u09bf \u09a4\u09a5\u09cd\u09af", "Admission Info") },
    { to: "/admission-form", label: t("\u0985\u09a8\u09b2\u09be\u0987\u09a8 \u09ad\u09b0\u09cd\u09a4\u09bf", "Online Admission") },
  ];

  const academicLinks = [
    { to: "/teachers", label: t("\u09b6\u09bf\u0995\u09cd\u09b7\u0995\u09ac\u09c3\u09a8\u09cd\u09a6", "Teachers") },
    { to: "/notices", label: t("\u09a8\u09cb\u099f\u09bf\u09b6 \u09ac\u09cb\u09b0\u09cd\u09a1", "Notice") },
    { to: "/results", label: t("\u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u09ab\u09b2\u09be\u09ab\u09b2", "Results") },
    { to: "/gallery", label: t("\u0997\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09bf", "Gallery") },
    { to: "/events", label: t("\u0987\u09ad\u09c7\u09a8\u09cd\u099f \u0995\u09cd\u09af\u09be\u09b2\u09c7\u09a8\u09cd\u09a1\u09be\u09b0", "Events") },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary">
            <img
              src={siteLogo}
              alt="Annoor Education Family logo"
              className="h-full w-full object-contain"
              sizes="40px"
              decoding="async"
            />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold leading-tight text-foreground">
              {t("\u0986\u09a8\u09cd\u09a8\u09c2\u09b0 \u09b6\u09bf\u0995\u09cd\u09b7\u09be \u09aa\u09b0\u09bf\u09ac\u09be\u09b0", "Annoor Education Family")}
            </h1>
            <p className="text-xs font-display text-muted-foreground">EMIS Code: 307030265</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {mainLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-xl px-3 py-2 text-sm font-medium font-bengali transition-all ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:scale-105 hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="relative">
            <button
              onMouseEnter={() => setAdmissionOpen(true)}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium font-bengali text-foreground transition-all hover:scale-105 hover:bg-secondary"
            >
              {t("\u09ad\u09b0\u09cd\u09a4\u09bf", "Admission")}
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {admissionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setAdmissionOpen(false)}
                  className="absolute left-0 top-full mt-1 min-w-[160px] rounded-xl border border-border bg-card py-2 shadow-lg"
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

          <div className="relative">
            <button
              onMouseEnter={() => setAcademicOpen(true)}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium font-bengali text-foreground transition-all hover:scale-105 hover:bg-secondary"
            >
              {t("\u098f\u0995\u09be\u09a1\u09c7\u09ae\u09bf\u0995", "Academic")}
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {academicOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setAcademicOpen(false)}
                  className="absolute left-0 top-full mt-1 min-w-[180px] rounded-xl border border-border bg-card py-2 shadow-lg"
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

          <UpdateAlertsManager className="h-10 w-10" />
          <LanguageToggle />
        </div>

        <div className="flex items-center gap-3">
          <UpdateAlertsManager className="h-10 w-10 lg:hidden" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground lg:hidden"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card lg:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              <div className="mb-2 border-b border-border pb-3">
                <LanguageToggle />
              </div>

              {mainLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-xl px-4 py-3 font-bengali font-medium transition-colors ${
                    location.pathname === link.to
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <button
                onClick={() => setMobileAdmissionOpen(!mobileAdmissionOpen)}
                className="flex items-center justify-between rounded-xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <span>{t("\u09ad\u09b0\u09cd\u09a4\u09bf", "Admission")}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileAdmissionOpen ? "rotate-180" : ""}`} />
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
                        onClick={() => {
                          setIsOpen(false);
                          setMobileAdmissionOpen(false);
                        }}
                        className="block rounded-xl py-2 pl-8 pr-4 font-bengali font-medium text-foreground hover:bg-secondary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setMobileAcademicOpen(!mobileAcademicOpen)}
                className="flex items-center justify-between rounded-xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <span>{t("\u098f\u0995\u09be\u09a1\u09c7\u09ae\u09bf\u0995", "Academic")}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileAcademicOpen ? "rotate-180" : ""}`} />
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
                        onClick={() => {
                          setIsOpen(false);
                          setMobileAcademicOpen(false);
                        }}
                        className="block rounded-xl py-2 pl-8 pr-4 font-bengali font-medium text-foreground hover:bg-secondary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
