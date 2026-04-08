import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import UpdateAlertsManager from "./UpdateAlertsManager";
import { useLanguage } from "@/contexts/LanguageContext";

const siteLogo = "/site-logo.png";
const ENABLE_EXPERIMENTAL_NAVBAR = true;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [academicOpen, setAcademicOpen] = useState(false);
  const [mobileAdmissionOpen, setMobileAdmissionOpen] = useState(false);
  const [mobileAcademicOpen, setMobileAcademicOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
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
    { to: "/achievements", label: t("আমাদের অর্জন", "Our Achievements") },
    { to: "/notices", label: t("নোটিশ বোর্ড", "Notice") },
    { to: "/results", label: t("পরীক্ষার ফলাফল", "Results") },
    { to: "/gallery", label: t("গ্যালারি", "Gallery") },
    { to: "/events", label: t("ইভেন্ট ক্যালেন্ডার", "Events") },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 72);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!ENABLE_EXPERIMENTAL_NAVBAR) {
    return (
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary">
              <img src={siteLogo} alt="Annoor Education Family logo" className="h-full w-full object-contain" sizes="40px" decoding="async" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold leading-tight text-foreground">
                {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
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
                  location.pathname === link.to ? "bg-primary text-primary-foreground" : "text-foreground hover:scale-105 hover:bg-secondary"
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
                {t("ভর্তি", "Admission")}
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
                      <Link key={link.to} to={link.to} className="block px-4 py-2 text-sm font-medium font-bengali text-foreground hover:bg-secondary">
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
                {t("একাডেমিক", "Academic")}
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
                      <Link key={link.to} to={link.to} className="block px-4 py-2 text-sm font-medium font-bengali text-foreground hover:bg-secondary">
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
            <button onClick={() => setIsOpen(!isOpen)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground lg:hidden">
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
                      location.pathname === link.to ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <button
                  onClick={() => setMobileAdmissionOpen(!mobileAdmissionOpen)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
                >
                  <span>{t("ভর্তি", "Admission")}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileAdmissionOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileAdmissionOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
                  <span>{t("একাডেমিক", "Academic")}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileAcademicOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileAcademicOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4 pb-3 pt-4">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/5 shadow-sm">
              <img src={siteLogo} alt="Annoor Education Family logo" className="h-full w-full object-contain p-1" decoding="async" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight text-foreground sm:text-xl">
                {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
              </h1>
              <p className="text-xs text-muted-foreground">EMIS Code: 307030265</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <UpdateAlertsManager className="h-10 w-10" />
            <button onClick={() => setIsOpen(!isOpen)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-sm">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <motion.div
            initial={false}
            animate={{
              height: isCompact ? 0 : "auto",
              opacity: isCompact ? 0 : 1,
              marginBottom: isCompact ? 0 : 0,
            }}
            className="overflow-hidden"
          >
            <div className="flex justify-center">
              <Link to="/" className="group flex flex-col items-center text-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-[0_18px_40px_rgba(12,74,62,0.12)] transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="absolute inset-2 rounded-full border border-primary/10" />
                  <img src={siteLogo} alt="Annoor Education Family logo" className="relative h-full w-full object-contain p-2" decoding="async" />
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
                  {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">EMIS Code: 307030265</p>
              </Link>
            </div>
          </motion.div>

          <div className={`relative ${isCompact ? "mt-0" : "mt-5"} flex justify-center`}>
            <div className="flex items-center gap-3 rounded-full border border-white/55 bg-white/65 px-3 py-2 shadow-[0_20px_45px_rgba(15,23,42,0.12)] ring-1 ring-primary/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              {isCompact && (
                <>
                  <div className="hidden xl:flex items-center gap-3 pl-1">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/5 shadow-sm">
                      <img src={siteLogo} alt="Annoor Education Family logo" className="h-full w-full object-contain p-1.5" decoding="async" />
                    </div>
                    <div className="text-right">
                      <p className="font-display text-base font-bold leading-tight text-foreground">
                        {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">EMIS Code: 307030265</p>
                    </div>
                  </div>
                  <div className="hidden xl:block h-8 w-px bg-border/70" />
                </>
              )}
              {mainLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold font-bengali transition-all ${
                    location.pathname === link.to ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-primary/8"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="relative">
                <button
                  onMouseEnter={() => setAcademicOpen(true)}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold font-bengali text-foreground transition-all hover:bg-primary/8"
                >
                  {t("একাডেমিক", "Academic")}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {academicOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      onMouseLeave={() => setAcademicOpen(false)}
                      className="absolute left-1/2 top-full z-20 mt-4 w-[300px] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
                    >
                      <p className="mb-3 px-2 font-bengali text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                        {t("একাডেমিক শর্টকাট", "Academic shortcuts")}
                      </p>
                      <div className="space-y-1">
                        {academicLinks.map((link) => (
                          <Link key={link.to} to={link.to} className="block rounded-2xl px-3 py-3 text-sm font-medium font-bengali text-foreground transition-colors hover:bg-primary/8">
                            <span className="block">{link.label}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {t("সংশ্লিষ্ট আপডেট ও তথ্য দেখুন", "View related updates and information")}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onMouseEnter={() => setAdmissionOpen(true)}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold font-bengali text-foreground transition-all hover:bg-primary/8"
                >
                  {t("ভর্তি", "Admission")}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {admissionOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      onMouseLeave={() => setAdmissionOpen(false)}
                      className="absolute left-1/2 top-full z-20 mt-4 w-[320px] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
                    >
                      <p className="mb-3 px-2 font-bengali text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                        {t("ভর্তি সাপোর্ট", "Admission support")}
                      </p>
                      <div className="space-y-1">
                        {admissionLinks.map((link) => (
                          <Link key={link.to} to={link.to} className="block rounded-2xl px-3 py-3 text-sm font-medium font-bengali text-foreground transition-colors hover:bg-primary/8">
                            <span className="block">{link.label}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {t("নির্দেশনা, সময়সূচি ও আবেদনপত্র দেখুন", "View guidance, schedule and application")}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mx-2 h-8 w-px bg-border/70" />
              <UpdateAlertsManager className="h-10 w-10" />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card/95 backdrop-blur-xl lg:hidden"
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
                  className={`rounded-2xl px-4 py-3 font-bengali font-medium transition-colors ${
                    location.pathname === link.to ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <button
                onClick={() => setMobileAcademicOpen(!mobileAcademicOpen)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <span>{t("একাডেমিক", "Academic")}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileAcademicOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileAcademicOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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

              <button
                onClick={() => setMobileAdmissionOpen(!mobileAdmissionOpen)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <span>{t("ভর্তি", "Admission")}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileAdmissionOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileAdmissionOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;



