import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings, formatRegistrationNumber } from "@/lib/siteSettings";
import headerBg from "@/assets/header-bg.png";

const DEFAULT_LOGO = "/site-logo.png";
const ENABLE_EXPERIMENTAL_NAVBAR = true;

const Navbar = () => {
  const { settings } = useSiteSettings();
  const siteLogo = settings.logo_url || DEFAULT_LOGO;
  const [isOpen, setIsOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [academicOpen, setAcademicOpen] = useState(false);
  const [mobileHomeOpen, setMobileHomeOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileAdmissionOpen, setMobileAdmissionOpen] = useState(false);
  const [mobileAcademicOpen, setMobileAcademicOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { t, lang } = useLanguage();
  const institutionName = t(
    settings.institution_name_bn || "আননূর তাহফিজুল কুরআন মাদরাসা",
    settings.institution_name_en || "Annoor Tahfizul Quran Madrasa"
  );
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const mainLinks = [
    { to: "/news", label: t("সংবাদ", "News") },
    { to: "/contact", label: t("যোগাযোগ", "Contact") },
  ];

  const aboutLinks = [
    {
      to: "/about",
      label: t("আমাদের পরিচিতি", "About Us"),
      description: t("প্রতিষ্ঠানের লক্ষ্য, ইতিহাস ও পরিচালনা পর্ষদ", "Our vision, history & leadership"),
    },
    {
      to: "/achievements",
      label: t("আমাদের অর্জন", "Our Achievements"),
      description: t("বোর্ড পরীক্ষা ও জাতীয় হিফজ প্রতিযোগিতার সাফল্য", "Board exams & competition honors"),
    },
    {
      to: "/gallery",
      label: t("ফটো গ্যালারি", "Photo Gallery"),
      description: t("ক্যাম্পাস, অনুষ্ঠান ও শিক্ষার্থীদের কার্যক্রম", "Campus life, events & student activities"),
    },
    {
      to: "/media",
      label: t("মিডিয়া ও ভিডিও", "Media & Videos"),
      description: t("ইউটিউব ভিডিও, কিরাত ও লাইভ প্রোগ্রাম", "YouTube videos, recitations & live"),
    },
  ];

  const homeLinks = [
    {
      hash: "#madrasha-features",
      label: t("মাদরাসার বৈশিষ্ট্য", "Features of the Madrasha"),
      description: t("প্রতিষ্ঠানের বিশেষ দিকগুলো দেখুন", "Explore the institution's standout qualities"),
    },
    {
      hash: "#reviews",
      label: t("অভিভাবকদের মতামত", "What Guardians Say"),
      description: t("রিভিউ ও অভিভাবকদের মতামত দেখুন", "Read reviews and guardian feedback"),
    },
  ];

  const admissionLinks = [
    { to: "/admission", label: t("ভর্তি তথ্য", "Admission Info") },
    { to: "/admission-form", label: t("অনলাইন ভর্তি", "Online Admission") },
  ];

  const academicLinks = [
    { to: "/curriculum", label: t("আমাদের শিক্ষা কারিকুলাম", "Our Curriculum") },
    { to: "/downloads", label: t("ডাউনলোড কর্নার (সিলেবাস ও রুটিন)", "Download Corner (Syllabus & Routine)") },
    { to: "/teachers", label: t("শিক্ষক ও পরিচালকমণ্ডলী", "Teachers & Staff") },
    { to: "/huffaz", label: t("কৃতি হাফেজদের তালিকা", "Wall of Huffaz") },
    { to: "/notices", label: t("নোটিশ বোর্ড", "Notice") },
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

  const handleHomeSectionNavigate = (hash: string) => {
    setHomeOpen(false);
    setIsOpen(false);
    setMobileHomeOpen(false);

    const sectionId = hash.replace(/^#/, "");

    const performScroll = (smooth = true) => {
      const el = document.getElementById(sectionId);
      if (el) {
        const nav = document.querySelector("nav");
        const navHeight = nav ? Math.min(nav.offsetHeight, 90) : 80;
        const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: smooth ? "smooth" : "auto",
        });
      }
    };

    if (location.pathname !== "/") {
      navigate(`/${hash}`);
      return;
    }

    navigate({ pathname: "/", hash }, { replace: true });

    // Immediate scroll
    performScroll(true);

    // Additional scrolls as mobile menu collapse animation completes
    setTimeout(() => performScroll(true), 120);
    setTimeout(() => performScroll(true), 320);
  };

  if (!ENABLE_EXPERIMENTAL_NAVBAR) {
    return (
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 relative print:hidden ${
          isHomePage && !isCompact
            ? "border-transparent bg-white dark:bg-card lg:bg-transparent"
            : "border-b border-border bg-card/80 backdrop-blur-lg"
        }`}
      >
        {!isCompact && (
          <div className="hidden lg:block absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-white select-none" aria-hidden="true">
            <img
              src={headerBg}
              alt=""
              role="presentation"
              className="h-full w-full object-cover object-bottom opacity-95 dark:opacity-25"
              decoding="async"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/35 to-transparent dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/70" />
          </div>
        )}
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/5 shadow-md">
              <img src={siteLogo} alt="Logo" className="h-full w-full object-contain p-0.5" sizes="64px" decoding="async" />
            </div>
            <div className="flex flex-col">
              <p
                style={{ fontFamily: "'Noto Serif Bengali', serif" }}
                className="text-[10px] sm:text-[11px] font-semibold text-accent leading-tight"
              >
                {t("আননূর শিক্ষা পরিবার কর্তৃক পরিচালিত", "Managed by Annoor Education Family")}
              </p>
              <h1
                style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                className="text-[17px] sm:text-xl font-extrabold leading-snug text-primary tracking-tight"
              >
                {institutionName}
              </h1>
              {Boolean(formatRegistrationNumber(settings, lang)) && (
                <p
                  style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                  className="text-[9px] sm:text-[10px] font-semibold text-primary/80 leading-tight mt-0.5"
                >
                  {formatRegistrationNumber(settings, lang)}
                </p>
              )}
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <div className="relative" onMouseEnter={() => setHomeOpen(true)} onMouseLeave={() => setHomeOpen(false)}>
              <Link
                to="/"
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium font-bengali transition-all ${
                  location.pathname === "/" ? "bg-primary text-primary-foreground" : "text-foreground hover:scale-105 hover:bg-secondary"
                }`}
              >
                {t("হোম", "Home")}
                <ChevronDown className="h-4 w-4" />
              </Link>
              <AnimatePresence>
                {homeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 top-full z-[70] mt-1 min-w-[220px] rounded-xl border border-border bg-card py-2 shadow-lg before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']"
                  >
                    {homeLinks.map((link) => (
                      <button
                        key={link.hash}
                        type="button"
                        onClick={() => handleHomeSectionNavigate(link.hash)}
                        className="block w-full px-4 py-2 text-left text-sm font-medium font-bengali text-foreground hover:bg-secondary"
                      >
                        {link.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Us Dropdown */}
            <div className="relative" onMouseEnter={() => setAboutOpen(true)} onMouseLeave={() => setAboutOpen(false)}>
              <button
                type="button"
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium font-bengali transition-all ${
                  ["/about", "/achievements", "/gallery", "/media"].includes(location.pathname)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:scale-105 hover:bg-secondary"
                }`}
              >
                {t("আমাদের সম্পর্কে", "About Us")}
                <ChevronDown className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {aboutOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 top-full z-[70] mt-1 min-w-[200px] rounded-xl border border-border bg-card py-2 shadow-lg before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']"
                  >
                    {aboutLinks.map((link) => (
                      <Link key={link.to} to={link.to} className="block px-4 py-2 text-sm font-medium font-bengali text-foreground hover:bg-secondary">
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Academic Dropdown */}
            <div className="relative" onMouseEnter={() => setAcademicOpen(true)} onMouseLeave={() => setAcademicOpen(false)}>
              <button
                type="button"
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium font-bengali transition-all ${
                  academicLinks.some((l) => l.to === location.pathname)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:scale-105 hover:bg-secondary"
                }`}
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
                    className="absolute left-0 top-full z-[70] mt-1 min-w-[180px] rounded-xl border border-border bg-card py-2 shadow-lg before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']"
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

            {/* Admission Dropdown */}
            <div className="relative" onMouseEnter={() => setAdmissionOpen(true)} onMouseLeave={() => setAdmissionOpen(false)}>
              <button
                type="button"
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium font-bengali transition-all ${
                  admissionLinks.some((l) => l.to === location.pathname)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:scale-105 hover:bg-secondary"
                }`}
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
                    className="absolute left-0 top-full z-[70] mt-1 min-w-[160px] rounded-xl border border-border bg-card py-2 shadow-lg before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']"
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

            {/* Main Links: News & Contact */}
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

            <LanguageToggle />
          </div>

          <div className="flex items-center gap-3">
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

                {/* Home Mobile Accordion */}
                <button
                  type="button"
                  onClick={() => setMobileHomeOpen(!mobileHomeOpen)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
                >
                  <span>{t("হোম", "Home")}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileHomeOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileHomeOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <Link
                        to="/"
                        onClick={() => {
                          setIsOpen(false);
                          setMobileHomeOpen(false);
                        }}
                        className="block rounded-xl py-2 pl-8 pr-4 font-bengali font-medium text-foreground hover:bg-secondary"
                      >
                        {t("হোম", "Home")}
                      </Link>
                      {homeLinks.map((link) => (
                        <button
                          key={link.hash}
                          type="button"
                          onClick={() => handleHomeSectionNavigate(link.hash)}
                          className="block w-full rounded-xl py-2 pl-8 pr-4 text-left font-bengali font-medium text-foreground hover:bg-secondary"
                        >
                          {link.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* About Us Mobile Accordion */}
                <button
                  type="button"
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
                >
                  <span>{t("আমাদের সম্পর্কে", "About Us")}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileAboutOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {aboutLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => {
                            setIsOpen(false);
                            setMobileAboutOpen(false);
                          }}
                          className="block rounded-xl py-2 pl-8 pr-4 font-bengali font-medium text-foreground hover:bg-secondary"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Academic Mobile Accordion */}
                <button
                  type="button"
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

                {/* Admission Mobile Accordion */}
                <button
                  type="button"
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

                {/* Main Links: News & Contact */}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 relative print:hidden ${
        isCompact
          ? "border-b border-border/70 bg-card/90 backdrop-blur-xl shadow-sm"
          : "border-b border-border/40 shadow-xs bg-white dark:bg-card lg:bg-transparent"
      }`}
    >
      {/* Institutional Islamic Header Background */}
      {!isCompact && (
        <div className="hidden lg:block absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-white select-none" aria-hidden="true">
          <img
            src={headerBg}
            alt=""
            role="presentation"
            className="h-full w-full object-cover object-bottom opacity-95 dark:opacity-25"
            decoding="async"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          {/* Subtle gradient overlay to ensure perfect contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/35 to-transparent dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/70" />
        </div>
      )}
      <div className="container mx-auto px-4 pb-1.5 pt-2">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/5 shadow-md">
              <img src={siteLogo} alt="Logo" className="h-full w-full object-contain p-0.5" decoding="async" />
            </div>
            <div className="flex flex-col">
              <p
                style={{ fontFamily: "'Noto Serif Bengali', serif" }}
                className="text-[10px] sm:text-[11px] font-semibold text-accent leading-tight"
              >
                {t("আননূর শিক্ষা পরিবার কর্তৃক পরিচালিত", "Managed by Annoor Education Family")}
              </p>
              <h1
                style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                className="text-[17px] sm:text-xl font-extrabold leading-snug text-primary tracking-tight"
              >
                {institutionName}
              </h1>
              {Boolean(formatRegistrationNumber(settings, lang)) && (
                <p
                  style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                  className="text-[9px] sm:text-[10px] font-semibold text-primary/80 leading-tight mt-0.5"
                >
                  {formatRegistrationNumber(settings, lang)}
                </p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors ${
                isHomePage && !isCompact
                  ? "border-primary/20 bg-card/80 text-foreground backdrop-blur-md"
                  : "border-border bg-card/80 text-foreground"
              }`}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          {/* Logo and Institution Title */}
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
              <Link to="/" className="group flex flex-col items-center text-center gap-2 transition-transform duration-300 hover:scale-[1.01]">
                <div
                  className="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-[0_10px_25px_rgba(8,24,90,0.14)] ring-2 ring-primary/10 transition-transform duration-300 group-hover:scale-105"
                >
                  <div className="absolute inset-1.5 rounded-full border border-primary/15" />
                  <img src={siteLogo} alt="Logo" className="relative h-full w-full object-contain p-1" decoding="async" />
                </div>
                <div className="flex flex-col items-center text-center">
                  {/* 1. আননূর শিক্ষা পরিবার কর্তৃক পরিচালিত (ছোট করে) */}
                  <p
                    style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                    className="text-xs sm:text-[13px] font-semibold text-accent tracking-wide leading-tight"
                  >
                    {t("আননূর শিক্ষা পরিবার কর্তৃক পরিচালিত", "Managed by Annoor Education Family")}
                  </p>

                  {/* 2. আননূর তাহফিজুল কুরআন মাদ্রাসা (বড় করে) */}
                  <h1
                    style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                    className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-primary drop-shadow-sm leading-tight my-0.5"
                  >
                    {institutionName}
                  </h1>

                  {/* 3. রেজি: নং. */}
                  {Boolean(formatRegistrationNumber(settings, lang)) && (
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.04] px-2.5 py-0.5 shadow-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      <span
                        style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                        className="text-[11px] sm:text-xs font-semibold text-primary/80 leading-tight tracking-wide"
                      >
                        {formatRegistrationNumber(settings, lang)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Navigation Menu Bar - Placed below the institution name */}
          <div className={`relative ${isCompact ? "mt-0" : "mt-2"} flex justify-center`}>
            <div
              className={`flex items-center gap-2.5 rounded-full border px-3 py-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.16)] ring-1 backdrop-blur-xl transition-all duration-300 ${
                isHomePage && !isCompact
                  ? "border-white/40 bg-white/95 text-foreground ring-black/5"
                  : "border-white/55 bg-card/90 ring-primary/5 dark:border-white/10 dark:bg-slate-900/60"
              }`}
            >
              {isCompact && (
                <>
                  <div className="hidden xl:flex items-center gap-3 pl-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/5 shadow-sm">
                      <img src={siteLogo} alt="Logo" className="h-full w-full object-contain p-0.5" decoding="async" />
                    </div>
                    <div className="text-left flex flex-col">
                      <p
                        style={{ fontFamily: "'Noto Serif Bengali', serif" }}
                        className="text-[9px] font-semibold text-accent leading-tight"
                      >
                        {t("আননূর শিক্ষা পরিবার কর্তৃক পরিচালিত", "Managed by Annoor Education Family")}
                      </p>
                      <p
                        style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                        className="text-xs font-bold leading-tight text-primary"
                      >
                        {institutionName}
                      </p>
                      {Boolean(formatRegistrationNumber(settings, lang)) && (
                        <p
                          style={lang === "bn" ? { fontFamily: "'Noto Serif Bengali', serif" } : undefined}
                          className="text-[9px] font-semibold text-primary/80 leading-tight"
                        >
                          {formatRegistrationNumber(settings, lang)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="hidden xl:block h-8 w-px bg-border/70" />
                </>
              )}
              <div className="relative" onMouseEnter={() => setHomeOpen(true)} onMouseLeave={() => setHomeOpen(false)}>
                <Link
                  to="/"
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold font-bengali transition-all ${
                    location.pathname === "/" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-primary/8"
                  }`}
                >
                  {t("হোম", "Home")}
                  <ChevronDown className="h-4 w-4" />
                </Link>
                <AnimatePresence>
                  {homeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="absolute left-1/2 top-full z-[70] mt-2 w-[320px] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                    >
                      <p className="mb-3 px-2 font-bengali text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                        {t("হোম শর্টকাট", "Home shortcuts")}
                      </p>
                      <div className="space-y-1">
                        {homeLinks.map((link) => (
                          <button
                            key={link.hash}
                            type="button"
                            onClick={() => handleHomeSectionNavigate(link.hash)}
                            className="block w-full rounded-2xl px-3 py-3 text-left text-sm font-medium font-bengali text-foreground transition-colors hover:bg-primary/8"
                          >
                            <span className="block">{link.label}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {link.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* About Us Dropdown */}
              <div className="relative" onMouseEnter={() => setAboutOpen(true)} onMouseLeave={() => setAboutOpen(false)}>
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold font-bengali transition-all ${
                    ["/about", "/achievements", "/gallery", "/media"].includes(location.pathname)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-primary/8"
                  }`}
                >
                  {t("আমাদের সম্পর্কে", "About Us")}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {aboutOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="absolute left-1/2 top-full z-[70] mt-2 w-[310px] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                    >
                      <p className="mb-3 px-2 font-bengali text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                        {t("পরিচিতি ও মিডিয়া", "About & Media")}
                      </p>
                      <div className="space-y-1">
                        {aboutLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setAboutOpen(false)}
                            className="block rounded-2xl px-3 py-2.5 text-sm font-medium font-bengali text-foreground transition-colors hover:bg-primary/8"
                          >
                            <span className="block font-semibold">{link.label}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {link.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Academic Dropdown */}
              <div className="relative" onMouseEnter={() => setAcademicOpen(true)} onMouseLeave={() => setAcademicOpen(false)}>
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold font-bengali transition-all ${
                    academicLinks.some((l) => l.to === location.pathname)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-primary/8"
                  }`}
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
                      className="absolute left-1/2 top-full z-[70] mt-2 w-[300px] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
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

              {/* Admission Dropdown */}
              <div className="relative" onMouseEnter={() => setAdmissionOpen(true)} onMouseLeave={() => setAdmissionOpen(false)}>
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold font-bengali transition-all ${
                    admissionLinks.some((l) => l.to === location.pathname)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-primary/8"
                  }`}
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
                      className="absolute left-1/2 top-full z-[70] mt-2 w-[320px] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
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

              {/* Main Links: News & Contact */}
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

              <div className="mx-2 h-8 w-px bg-border/70" />
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

              <button
                onClick={() => setMobileHomeOpen(!mobileHomeOpen)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <span>{t("হোম", "Home")}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileHomeOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileHomeOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <Link
                      to="/"
                      onClick={() => {
                        setIsOpen(false);
                        setMobileHomeOpen(false);
                      }}
                      className="block rounded-xl py-2 pl-8 pr-4 font-bengali font-medium text-foreground hover:bg-secondary"
                    >
                      {t("হোম", "Home")}
                    </Link>
                    {homeLinks.map((link) => (
                      <button
                        key={link.hash}
                        type="button"
                        onClick={() => handleHomeSectionNavigate(link.hash)}
                        className="block w-full rounded-xl py-2 pl-8 pr-4 text-left font-bengali font-medium text-foreground hover:bg-secondary"
                      >
                        {link.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* About Us Mobile Accordion */}
              <button
                type="button"
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 font-bengali font-medium text-foreground hover:bg-secondary"
              >
                <span>{t("আমাদের সম্পর্কে", "About Us")}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileAboutOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    {aboutLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => {
                          setIsOpen(false);
                          setMobileAboutOpen(false);
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

              {/* Main Links: News & Contact */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;



