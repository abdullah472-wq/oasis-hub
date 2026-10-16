import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Compass,
  Home,
  Info,
  Award,
  Globe,
  Phone,
  FileCheck2,
  GraduationCap,
  BellRing,
  Download,
  BookOpen,
  Users,
  Sparkles,
  Newspaper,
  Calendar,
  Image,
  Video,
  FileCode,
  Shield,
  Search,
  ArrowUpRight,
  ChevronRight,
  Layers,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";

interface SitemapLink {
  path: string;
  isExternal?: boolean;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  icon: typeof Home;
  badgeBn?: string;
  badgeEn?: string;
}

interface SitemapCategory {
  id: string;
  titleBn: string;
  titleEn: string;
  icon: typeof Compass;
  accentColor: string;
  links: SitemapLink[];
}

const sitemapData: SitemapCategory[] = [
  {
    id: "core",
    titleBn: "প্রাতিষ্ঠানিক ও পরিচিতি",
    titleEn: "Institutional & Identity",
    icon: Home,
    accentColor: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    links: [
      {
        path: "/",
        titleBn: "মূল পাতা",
        titleEn: "Home Page",
        descBn: "প্রধান ক্যাম্পাস ওভারভিউ, গুরুত্বপূর্ণ নোটিশ ও সাম্প্রতিক কার্যক্রম",
        descEn: "Main campus overview, live announcements, and key programs",
        icon: Home,
        badgeBn: "প্রধান",
        badgeEn: "Main",
      },
      {
        path: "/about",
        titleBn: "আমাদের পরিচিতি",
        titleEn: "About Us",
        descBn: "প্রতিষ্ঠানের ইতিহাস, মূলনীতি, লক্ষ্য ও ভবিষ্যৎ কর্মপরিকল্পনা",
        descEn: "History, core principles, educational vision, and leadership",
        icon: Info,
      },
      {
        path: "/achievements",
        titleBn: "সাফল্য ও অর্জন",
        titleEn: "Achievements & Awards",
        descBn: "শিক্ষার্থী ও মাদরাসার বিশেষ স্বীকৃতি, সনদ ও বার্ষিক গৌরবগাঁথা",
        descEn: "Institutional recognitions, awards, and student achievements",
        icon: Award,
      },
      {
        path: "/virtual-tour",
        titleBn: "ভার্চুয়াল ক্যাম্পাস ট্যুর",
        titleEn: "Virtual Campus Tour",
        descBn: "৩৬০ ডিগ্রি ইন্টারেক্টিভ ক্যাম্পাস, শ্রেণিকক্ষ ও হোস্টেল পরিদর্শন",
        descEn: "360-degree interactive view of campus, classrooms, and facilities",
        icon: Globe,
      },
      {
        path: "/contact",
        titleBn: "যোগাযোগ ও অবস্থান",
        titleEn: "Contact & Location",
        descBn: "ক্যাম্পাসের গুগল ম্যাপ অবস্থান, জরুরি ফোন নম্বর ও সরাসরি অফিস তথ্য",
        descEn: "Google Maps directions, hotline numbers, and office contact",
        icon: Phone,
      },
    ],
  },
  {
    id: "admissions",
    titleBn: "ভর্তি ও শিক্ষার্থী সেবা",
    titleEn: "Admissions & Student Services",
    icon: GraduationCap,
    accentColor: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
    links: [
      {
        path: "/admission-form",
        titleBn: "অনলাইন ভর্তি আবেদন",
        titleEn: "Online Admission Form",
        descBn: "বাসায় বসেই সহজে ভর্তির ফর্ম পূরণ ও অনলাইন রেজিস্ট্রেশন প্রক্রিয়া",
        descEn: "Apply online seamlessly with student and guardian details",
        icon: FileCheck2,
        badgeBn: "চলছে",
        badgeEn: "Active",
      },
      {
        path: "/admission",
        titleBn: "ভর্তি নির্দেশিকা ও ফি",
        titleEn: "Admission Info & Fees",
        descBn: "ভর্তি যোগ্যতা, আবাসন সুবিধা, মাসিক বেতন ও প্রয়োজনীয় কাগজপত্র",
        descEn: "Eligibility criteria, accommodation, fees, and requirements",
        icon: GraduationCap,
      },
      {
        path: "/notices",
        titleBn: "নোটিশ বোর্ড",
        titleEn: "Notice Board",
        descBn: "ছুটি, পরীক্ষা, ফলাফল ও প্রাতিষ্ঠানিক সকল অফিসিয়াল সার্কুলার",
        descEn: "Official circulars, exam schedules, holidays, and announcements",
        icon: BellRing,
      },
      {
        path: "/downloads",
        titleBn: "ডাউনলোড ও রিসোর্স",
        titleEn: "Downloads & Syllabus",
        descBn: "সিলেবাস, বুক লিস্ট, একাডেমিক ক্যালেন্ডার ও পরীক্ষার রুটিন ডাউনলোড",
        descEn: "Syllabus, class book lists, academic routines, and forms",
        icon: Download,
      },
    ],
  },
  {
    id: "academic",
    titleBn: "শিক্ষা ও বিভাগীয় কার্যক্রম",
    titleEn: "Academic Curriculum & Faculty",
    icon: BookOpen,
    accentColor: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
    links: [
      {
        path: "/curriculum",
        titleBn: "শিক্ষা কারিকুলাম ও সিলেবাস",
        titleEn: "Curriculum & Syllabus",
        descBn: "নূরানী, নাজেরা, হিফজুল কুরআন এবং আধুনিক সাধারণ শিক্ষা বিভাগ",
        descEn: "Noorani, Nazera, Tahfizul Quran, and modern general schooling",
        icon: BookOpen,
      },
      {
        path: "/teachers",
        titleBn: "শিক্ষক ও পরিচালকমণ্ডলী",
        titleEn: "Teachers & Administration",
        descBn: "অভিজ্ঞ শিক্ষক, হাফেজ ও মাদরাসা পরিচালনা কমিটির পরিচিতি",
        descEn: "Profiles of distinguished Islamic scholars, teachers, and directors",
        icon: Users,
      },
      {
        path: "/huffaz",
        titleBn: "কৃতি হাফেজ তালিকা",
        titleEn: "Wall of Huffaz",
        descBn: "প্রতিষ্ঠান থেকে সফলভাবে পূর্ণ কুরআন হিফজ সমাপনকারীদের সম্মাননা তালিকা",
        descEn: "Honoring our students who successfully completed Hifz of the Holy Quran",
        icon: Sparkles,
        badgeBn: "সম্মাননা",
        badgeEn: "Honors",
      },
    ],
  },
  {
    id: "media",
    titleBn: "মিডিয়া, সংবাদ ও ইভেন্ট",
    titleEn: "Media, News & Events",
    icon: Newspaper,
    accentColor: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300",
    links: [
      {
        path: "/news",
        titleBn: "খবর ও সংবাদ আপডেট",
        titleEn: "Institutional News",
        descBn: "মাদরাসার চলমান কার্যক্রম, অনুষ্ঠান ও সাফল্য নিয়ে সর্বশেষ প্রতিবেদন",
        descEn: "Latest campus news reports, press updates, and highlights",
        icon: Newspaper,
      },
      {
        path: "/events",
        titleBn: "ইভেন্ট ও অনুষ্ঠানসূচি",
        titleEn: "Events Calendar",
        descBn: "বার্ষিক ক্রীড়া, দস্তারবন্দী সম্মেলন, সীরাত মাহফিল ও অভিভাবক সমাবেশ",
        descEn: "Calendar of conferences, sports, meetings, and gatherings",
        icon: Calendar,
      },
      {
        path: "/gallery",
        titleBn: "ফটো গ্যালারি",
        titleEn: "Photo Gallery",
        descBn: "শ্রেণিকক্ষ, হোস্টেল, পুরষ্কার বিতরণ ও বিভিন্ন প্রোগ্রামের স্থিরচিত্র",
        descEn: "Photographs of classrooms, student life, ceremonies, and campus",
        icon: Image,
      },
      {
        path: "/media",
        titleBn: "ভিডিও ও মিডিয়া সেন্টার",
        titleEn: "Video & Media Center",
        descBn: "ছাত্রদের সুললিত কুরআন তিলাওয়াত, হামদ-নাত ও ইসলামী বয়ান",
        descEn: "Video recitations of Quran, Islamic nasheeds, and speeches",
        icon: Video,
      },
    ],
  },
  {
    id: "technical",
    titleBn: "সার্চ ইঞ্জিন ও টেকনিক্যাল রিসোর্স",
    titleEn: "Search Engine & Technical Links",
    icon: FileCode,
    accentColor: "from-slate-500/10 to-zinc-500/10 border-slate-500/20 text-slate-700 dark:text-slate-300",
    links: [
      {
        path: "/sitemap.xml",
        isExternal: true,
        titleBn: "এক্সএমএল সাইটম্যাপ (XML Sitemap)",
        titleEn: "XML Sitemap Feed",
        descBn: "গুগল ও অন্যান্য সার্চ ইঞ্জিনের ক্রলিং ও ইনডেক্সিং এর জন্য ব্যবহৃত XML ফাইল",
        descEn: "Standard machine-readable XML feed used by Google & Bing web crawlers",
        icon: FileCode,
        badgeBn: "XML",
        badgeEn: "XML",
      },
      {
        path: "/robots.txt",
        isExternal: true,
        titleBn: "রোবটস ফাইল (Robots.txt)",
        titleEn: "Robots Configuration",
        descBn: "ওয়েব ক্রলার ও বটদের জন্য অনুমতি এবং ইন্ডেক্সিং এর নির্দেশনা",
        descEn: "Directives telling web spiders which pages are indexed or restricted",
        icon: Compass,
        badgeBn: "TXT",
        badgeEn: "TXT",
      },
      {
        path: "/admin/login",
        titleBn: "অ্যাডমিন পোর্টাল",
        titleEn: "CMS Admin Portal",
        descBn: "মাদরাসা কর্তৃপক্ষ ও শিক্ষকদের জন্য সুরক্ষিত কনটেন্ট ম্যানেজমেন্ট লগইন",
        descEn: "Authorized administrative login for portal and website management",
        icon: Shield,
        badgeBn: "লগইন",
        badgeEn: "Staff",
      },
    ],
  },
];

const Sitemap = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return sitemapData;
    }

    const query = searchTerm.toLowerCase().trim();

    return sitemapData
      .map((cat) => {
        const matchingLinks = cat.links.filter((link) => {
          return (
            link.titleBn.toLowerCase().includes(query) ||
            link.titleEn.toLowerCase().includes(query) ||
            link.descBn.toLowerCase().includes(query) ||
            link.descEn.toLowerCase().includes(query) ||
            link.path.toLowerCase().includes(query)
          );
        });

        return {
          ...cat,
          links: matchingLinks,
        };
      })
      .filter((cat) => cat.links.length > 0);
  }, [searchTerm]);

  const totalLinksCount = useMemo(() => {
    return sitemapData.reduce((acc, cat) => acc + cat.links.length, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Banner Hero */}
      <section className="relative flex min-h-[14rem] items-center justify-center overflow-hidden bg-primary py-12 md:min-h-[18rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_50%)]" />
        <motion.div {...springIn} className="relative z-10 container mx-auto px-4 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-accent backdrop-blur-md">
            <Compass className="h-4 w-4" />
            <span>{t("সাইট ডিরেক্টরি ও নেভিগেশন", "Site Directory & Navigation Index")}</span>
          </div>
          <h1
            className="font-bengali font-bold text-primary-foreground drop-shadow-sm"
            style={{ fontSize: "clamp(2.2rem, 6vw, 3.8rem)" }}
          >
            {t("ওয়েবসাইট সাইটম্যাপ", "Website Sitemap")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl font-bengali text-sm text-primary-foreground/85 md:text-base">
            {t(
              "আননূর শিক্ষা পরিবারের সকল বিভাগ, প্রাতিষ্ঠানিক পাতা ও শিক্ষার্থী সেবার একটি সমন্বিত ও সুসংগঠিত ডিরেক্টরি।",
              "A comprehensive, structured index of all sections, institutional pages, and student services of Annoor Education Family.",
            )}
          </p>
        </motion.div>
        <WaveDivider className="absolute bottom-0" />
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto mt-6 px-4">
        {/* Quick Toolbar: Search & Meta Stats */}
        <motion.div
          {...springIn}
          transition={springInDelay(0.04)}
          className="mb-10 rounded-[2rem] border border-border/70 bg-card/95 p-4 shadow-[0_20px_50px_-30px_rgba(16,24,40,0.25)] backdrop-blur-md md:p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t(
                  "যেকোনো পাতা বা বিষয় খুঁজুন (যেমন: ভর্তি, সিলেবাস, শিক্ষক, নোটিশ)...",
                  "Search pages or topics (e.g. admission, syllabus, teachers, notices)...",
                )}
                className="w-full rounded-2xl border border-border bg-background py-3.5 pl-12 pr-4 font-bengali text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 font-bengali text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-500/20 dark:text-emerald-300"
                title={t("সার্চ ইঞ্জিনের জন্য মূল XML সাইটম্যাপ দেখুন", "View raw XML sitemap feed for search engines")}
              >
                <FileCode className="h-4 w-4" />
                <span>{t("এক্সএমএল সাইটম্যাপ", "XML Sitemap Feed")}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-4 py-2.5 font-bengali text-xs font-semibold text-foreground transition-all hover:bg-secondary"
              >
                <Compass className="h-4 w-4 text-muted-foreground" />
                <span>{t("রোবটস ফাইল", "Robots.txt")}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>

              <div className="hidden rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 font-bengali text-xs text-muted-foreground lg:flex lg:items-center lg:gap-1.5">
                <Layers className="h-4 w-4 text-accent" />
                <span>
                  {t("মোট লিংক:", "Total Links:")}{" "}
                  <strong className="text-foreground">{totalLinksCount}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Filter Tag Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3 text-xs font-bengali text-muted-foreground">
            <span className="font-semibold text-foreground">{t("জনপ্রিয় অনুসন্ধান:", "Popular:")}</span>
            {[
              { label: t("অনলাইন ভর্তি", "Online Admission"), query: "ভর্তি" },
              { label: t("নোটিশ বোর্ড", "Notice Board"), query: "নোটিশ" },
              { label: t("সিলেবাস ও বই", "Syllabus & Books"), query: "ডাউনলোড" },
              { label: t("কৃতি হাফেজ", "Huffaz List"), query: "হাফেজ" },
              { label: t("শিক্ষক তালিকা", "Faculty"), query: "শিক্ষক" },
              { label: t("মোবাইল অ্যাপ", "Mobile App"), query: "অ্যাপ" },
            ].map((tag) => (
              <button
                key={tag.query}
                type="button"
                onClick={() => setSearchTerm(tag.query)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  searchTerm === tag.query
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/70 hover:bg-muted text-foreground/80"
                }`}
              >
                {tag.label}
              </button>
            ))}
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-xs text-red-500 hover:underline ml-2"
              >
                {t("রিসেট করুন", "Clear search")}
              </button>
            )}
          </div>
        </motion.div>

        {/* Categorized Sitemap Links Grid */}
        <div className="space-y-10">
          {filteredCategories.length === 0 ? (
            <div className="card-institutional p-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="font-bengali text-lg font-bold text-foreground">
                {t("কোনো পৃষ্ঠা বা ফলাফল পাওয়া যায়নি", "No matching pages found")}
              </h3>
              <p className="mt-1 font-bengali text-sm text-muted-foreground">
                {t(
                  "অনুসন্ধান শব্দটি পরিবর্তন করে আবার চেষ্টা করুন অথবা রিসেট বোতামে ক্লিক করুন।",
                  "Try a different search keyword or click clear to show all pages.",
                )}
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 rounded-xl bg-primary px-5 py-2 font-bengali text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                {t("সকল পাতা দেখুন", "Show All Pages")}
              </button>
            </div>
          ) : (
            filteredCategories.map((cat, catIndex) => {
              const CategoryIcon = cat.icon;
              return (
                <motion.section
                  key={cat.id}
                  {...springIn}
                  transition={springInDelay(catIndex * 0.05)}
                  className="rounded-[2rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-soft)] md:p-8"
                >
                  {/* Category Header */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CategoryIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="font-bengali text-xl font-bold text-foreground md:text-2xl">
                          {language === "en" ? cat.titleEn : cat.titleBn}
                        </h2>
                        <p className="font-bengali text-xs text-muted-foreground">
                          {cat.links.length}{" "}
                          {t("টি লিংক যুক্ত রয়েছে", "links available in this section")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Links Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.links.map((link) => {
                      const LinkIcon = link.icon;
                      const title = language === "en" ? link.titleEn : link.titleBn;
                      const description = language === "en" ? link.descEn : link.descBn;
                      const badge = language === "en" ? link.badgeEn : link.badgeBn;

                      const content = (
                        <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-background/60 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-md">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <LinkIcon className="h-5 w-5" />
                              </div>

                              <div className="flex items-center gap-1.5">
                                {badge && (
                                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-bengali text-[10px] font-bold text-accent-foreground border border-accent/30">
                                    {badge}
                                  </span>
                                )}
                                <div className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary">
                                  {link.isExternal ? (
                                    <ArrowUpRight className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                            </div>

                            <h3 className="mt-3.5 font-bengali text-base font-bold text-foreground transition-colors group-hover:text-primary">
                              {title}
                            </h3>

                            <p className="mt-1 font-bengali text-xs leading-relaxed text-muted-foreground">
                              {description}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-2 font-mono text-[11px] text-muted-foreground/75">
                            <span className="truncate">{link.path}</span>
                            <span className="font-bengali text-[10px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              {t("ভিজিট করুন", "Visit")} →
                            </span>
                          </div>
                        </div>
                      );

                      if (link.isExternal) {
                        return (
                          <a
                            key={link.path}
                            href={link.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-full"
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <Link key={link.path} to={link.path} className="block h-full">
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })
          )}
        </div>

        {/* SEO Information & Web Crawler Explanatory Card */}
        <motion.div
          {...springIn}
          className="mt-12 rounded-[2rem] border border-emerald-900/10 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-6 text-xs font-bengali leading-relaxed text-muted-foreground md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 md:max-w-3xl">
              <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                {t("সার্চ ইঞ্জিন ও সাইটম্যাপ তথ্য (SEO Information)", "Search Engine & Sitemap Details")}
              </h4>
              <p>
                {t(
                  "এই সাইটম্যাপটি গুগল, বিং এবং অন্যান্য সার্চ ইঞ্জিন ক্রলারদের দ্রুত এবং নিখুঁতভাবে ইনডেক্স করতে সহায়তা করে। আমাদের স্ট্যান্ডার্ড এক্সএমএল সাইটম্যাপটি স্বয়ংক্রিয়ভাবে আপডেট হয় এবং 'robots.txt' ফাইলের সাথে যুক্ত রয়েছে।",
                  "This sitemap helps Google, Bing, and other web spiders crawl and index the pages of Annoor Education Family accurately. Our standard XML sitemap is auto-generated and configured in robots.txt.",
                )}
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                {t(
                  "অনুমোদিত ঠিকানা: https://oasis-hub-eight.vercel.app/sitemap.xml",
                  "Canonical location: https://oasis-hub-eight.vercel.app/sitemap.xml",
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90"
              >
                {t("এক্সএমএল ভিউ", "View Raw XML")}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Sitemap;
