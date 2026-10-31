import { Suspense, lazy, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/lib/siteSettings";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoticeTicker from "@/components/NoticeTicker";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import AdmissionFloatingFAB from "@/components/admission/AdmissionFloatingFAB";
import NasheedPlayer from "@/components/NasheedPlayer";

// Public Pages
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Achievements = lazy(() => import("./pages/Achievements"));
const NoticeBoard = lazy(() => import("./pages/NoticeBoard"));
const VirtualTour = lazy(() => import("./pages/VirtualTour"));
const Admission = lazy(() => import("./pages/Admission"));
const Gallery = lazy(() => import("./pages/Gallery"));
const MediaCenter = lazy(() => import("./pages/MediaCenter"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const News = lazy(() => import("./pages/News"));
const Events = lazy(() => import("./pages/Events"));
const AdmissionForm = lazy(() => import("./pages/AdmissionForm"));
const Curriculum = lazy(() => import("./pages/Curriculum"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Huffaz = lazy(() => import("./pages/Huffaz"));
const Downloads = lazy(() => import("./pages/Downloads"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Modular Supabase Single-Institution CMS Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminNotices = lazy(() => import("./pages/admin/AdminNotices"));
const AdminCurriculum = lazy(() => import("./pages/admin/AdminCurriculum"));
const AdminTeachers = lazy(() => import("./pages/admin/AdminTeachers"));
const AdminHuffaz = lazy(() => import("./pages/admin/AdminHuffaz"));
const AdminAdmissionInfo = lazy(() => import("./pages/admin/AdminAdmissionInfo"));
const AdminAdmissions = lazy(() => import("./pages/admin/AdminAdmissions"));
const AdminDownloads = lazy(() => import("./pages/admin/AdminDownloads"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminAchievements = lazy(() => import("./pages/admin/AdminAchievements"));
const AdminWebContent = lazy(() => import("./pages/admin/AdminWebContent"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminManagement = lazy(() => import("./pages/admin/AdminManagement"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16">
    <div className="text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <p className="font-display text-sm text-muted-foreground">লোডিং হচ্ছে...</p>
    </div>
  </div>
);

const ROUTE_PAGE_METAS: Record<
  string,
  { bn: string; en: string; descBn: string; descEn: string }
> = {
  "/": {
    bn: "হোম",
    en: "Home",
    descBn: "আননূর তাহফিজুল কুরআন মাদরাসা (কাপাসিয়া, গাজীপুর) — নূরানী, নাজেরা, আন্তর্জাতিক মানের হিফজুল কুরআন ও সমন্বিত আধুনিক শিক্ষা প্রতিষ্ঠান।",
    descEn: "Annoor Tahfizul Quran Madrasa (Kapasia, Gazipur) — International standard Hifzul Quran, Noorani and integrated modern education.",
  },
  "/about": {
    bn: "আমাদের সম্পর্কে",
    en: "About Us",
    descBn: "আননূর তাহফিজুল কুরআন মাদরাসার পরিচিতি, লক্ষ্য, উদ্দেশ্য, বৈশিষ্ট্য এবং প্রশাসনিক ইতিহাস জানুন।",
    descEn: "Learn about the mission, vision, history, and administrative excellence of Annoor Tahfizul Quran Madrasa.",
  },
  "/achievements": {
    bn: "আমাদের অর্জন",
    en: "Achievements",
    descBn: "জাতীয় ও বিভাগীয় হিফজুল কুরআন প্রতিযোগিতা ও মেধা অন্বেষণে আননূর মাদরাসার সাফল্য ও অর্জন।",
    descEn: "National and division-level achievements and awards of Annoor Tahfizul Quran Madrasa students.",
  },
  "/notices": {
    bn: "নোটিশ বোর্ড",
    en: "Notice Board",
    descBn: "মাদরাসার সাম্প্রতিক নোটিশ, একাডেমিক ঘোষণা, পরীক্ষার রুটিন ও প্রাতিষ্ঠানিক জরুরি নির্দেশনাবলী।",
    descEn: "Latest academic notices, institutional announcements, exam schedules, and official circulars.",
  },
  "/virtual-tour": {
    bn: "ভার্চুয়াল ক্যাম্পাস ট্যুর",
    en: "Virtual Tour",
    descBn: "আননূর মাদরাসার আধুনিক শ্রেণিকক্ষ, ক্যাম্পাস প্রাঙ্গণ ও হোস্টেল সুবিধার ভার্চুয়াল ভিডিও ট্যুর।",
    descEn: "Experience our campus, modern classrooms, library, and boarding facilities through our virtual tour.",
  },
  "/admission": {
    bn: "ভর্তি তথ্য ও ফি নির্দেশিকা",
    en: "Admission Info",
    descBn: "ভর্তি নির্দেশিকা, যোগ্যতা, প্রয়োজনীয় কাগজপত্র, ফি কাঠামো এবং নতুন শিক্ষাবর্ষে ভর্তির পূর্ণাঙ্গ নিয়মাবলী।",
    descEn: "Admission guidelines, eligibility criteria, required documents, fee structure, and enrollment procedures.",
  },
  "/admission-form": {
    bn: "অনলাইন ভর্তি ফরম",
    en: "Online Admission Form",
    descBn: "অনলাইন ভর্তি আবেদন ফরম পূরণ করুন এবং তাৎক্ষণিক অ্যাপ্লিকেশন ট্র্যাকিং কোড সংগ্রহ করুন।",
    descEn: "Complete the online admission application form and receive your applicant tracking number instantly.",
  },
  "/gallery": {
    bn: "ফটো গ্যালারি",
    en: "Gallery",
    descBn: "ক্যাম্পাস জীবন, হিফজ ক্লাস, পুরস্কার বিতরণী ও বিভিন্ন অনুষ্ঠানের আনন্দঘন মুহূর্তের ফটো গ্যালারি।",
    descEn: "Photo gallery featuring campus life, Hifz classes, prize ceremonies, and institutional events.",
  },
  "/media": {
    bn: "মিডিয়া সেন্টার",
    en: "Media Center",
    descBn: "কুরআন তিলাওয়াত, ইসলামিক সংগীত, মাদরাসার ভিডিও ডকুমেন্টারি ও ভিডিও মিডিয়া কনটেন্ট।",
    descEn: "Media center featuring Quran recitations, Islamic nasheed, video documentaries, and lectures.",
  },
  "/news": {
    bn: "সংবাদ ও বিজ্ঞপ্তি",
    en: "News",
    descBn: "আননূর মাদরাসার সর্বশেষ সংবাদ, শিক্ষামূলক প্রতিবেদন ও সমসাময়িক কার্যক্রমের খবরাখবর।",
    descEn: "Latest news, updates, educational features, and campus happenings from Annoor Madrasa.",
  },
  "/events": {
    bn: "ইভেন্ট ক্যালেন্ডার",
    en: "Events",
    descBn: "বার্ষিক ক্রীড়া প্রতিযোগিতা, সাংস্কৃতিক অনুষ্ঠান, সেমিনার ও ইসলামিক সম্মেলন ক্যালেন্ডার।",
    descEn: "Academic calendar, annual sports, cultural events, seminars, and Islamic conferences.",
  },
  "/curriculum": {
    bn: "শিক্ষা কারিকুলাম ও সিলেবাস",
    en: "Curriculum",
    descBn: "নূরানী, নাজেরা, হিফজুল কুরআন ও জেনারেল শিক্ষার পূর্ণাঙ্গ সিলেবাস এবং আধুনিক শিক্ষাক্রম বিন্যাস।",
    descEn: "Detailed academic curriculum and syllabus for Noorani, Nazera, Hifzul Quran, and modern general education.",
  },
  "/downloads": {
    bn: "ডাউনলোড কর্নার",
    en: "Downloads",
    descBn: "ভর্তি ফরম, বার্ষিক সিলেবাস, ক্লাস ও পরীক্ষার রুটিন, একাডেমিক ক্যালেন্ডার ও প্রসপেক্টাস ডাউনলোড।",
    descEn: "Download admission forms, annual syllabus, class routines, academic calendars, and prospectus.",
  },
  "/teachers": {
    bn: "শিক্ষক ও পরিচালকমণ্ডলী",
    en: "Teachers & Staff",
    descBn: "অভিজ্ঞ শিক্ষকমণ্ডলী, আন্তর্জাতিক মানের ক্বারী ও সুযোগ্য পরিচালনা পরিষদের পরিচিতি ও প্রোফাইল।",
    descEn: "Meet our qualified faculty members, certified Qaris, and esteemed governing body of Annoor Madrasa.",
  },
  "/huffaz": {
    bn: "কৃতি হাফেজদের তালিকা",
    en: "Wall of Huffaz",
    descBn: "আননূর তাহফিজুল কুরআন মাদরাসার কৃতি হাফেজদের তালিকা ও হিফজ সমাপনের গৌরবোজ্জ্বল ইতিহাস।",
    descEn: "Wall of Huffaz — Celebrating the brilliant Quran memorizers of Annoor Tahfizul Quran Madrasa.",
  },
  "/contact": {
    bn: "যোগাযোগ ও ক্যাম্পাস লোকেশন",
    en: "Contact Us",
    descBn: "যোগাযোগের পূর্ণাঙ্গ ঠিকানা, ফোন নম্বর, ইমেইল, গুগল ম্যাপ লোকেশন ও সরাসরি বার্তা পাঠানোর ফরম।",
    descEn: "Contact details, official phone numbers, email address, campus map location, and inquiry form.",
  },
  "/sitemap": {
    bn: "সাইটম্যাপ",
    en: "Sitemap",
    descBn: "আননূর তাহফিজুল কুরআন মাদরাসা ওয়েবসাইটের সকল পেজ ও সেবার পূর্ণাঙ্গ সাইটম্যাপ।",
    descEn: "Complete HTML sitemap and directory of all pages across the Annoor Madrasa portal.",
  },
  "/privacy-policy": {
    bn: "গোপনীয়তা নীতিমালা",
    en: "Privacy Policy",
    descBn: "শিক্ষার্থী ও অভিভাবকদের তথ্যের নিরাপত্তা, সুরক্ষা ও গোপনীয়তা সংক্রান্ত প্রাতিষ্ঠানিক নীতিমালা।",
    descEn: "Institutional privacy policy regarding data protection, security, and guardian consent.",
  },
};

const AppShell = () => {
  const location = useLocation();
  const { lang } = useLanguage();
  const { settings } = useSiteSettings();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPortalRoute = isAdminRoute;
  const isFirstRender = useRef(true);

  useEffect(() => {
    const siteTitle = "আননূর তাহফিজুল কুরআন মাদরাসা | Annoor Tahfizul Quran Madrasa";
    const baseName = lang === "bn"
      ? (settings.institution_name_bn || "আননূর তাহফিজুল কুরআন মাদরাসা")
      : (settings.institution_name_en || "Annoor Tahfizul Quran Madrasa");

    const metaInfo = ROUTE_PAGE_METAS[location.pathname];
    const pageLabel = metaInfo ? (lang === "bn" ? metaInfo.bn : metaInfo.en) : "";
    const computedTitle =
      location.pathname === "/"
        ? siteTitle
        : isAdminRoute
          ? `${lang === "bn" ? "অ্যাডমিন প্যানেল" : "Admin Dashboard"} | ${baseName}`
          : pageLabel
            ? `${pageLabel} | ${baseName}`
            : siteTitle;

    document.title = computedTitle;

    // Dynamic canonical link & robots & meta description update
    if (typeof document !== "undefined") {
      const robotsMeta = document.querySelector<HTMLMetaElement>("meta[name='robots']");
      if (robotsMeta) {
        robotsMeta.setAttribute("content", isAdminRoute ? "noindex, nofollow" : "index, follow");
      }

      const canonicalBase =
        typeof window !== "undefined" && window.location.hostname === "annoor.codbotbd.com"
          ? "https://annoor.codbotbd.com"
          : (typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://annoor.codbotbd.com");

      // Root URL should strictly end with trailing slash according to canonical standard
      const cleanPath = location.pathname === "/" ? "/" : location.pathname.replace(/\/+$/, "");
      const canonicalHref = `${canonicalBase}${cleanPath}`;

      let canonicalLink = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonicalHref);

      if (metaInfo) {
        const descText = lang === "bn" ? metaInfo.descBn : metaInfo.descEn;

        const descMeta = document.querySelector<HTMLMetaElement>("meta[name='description']");
        if (descMeta) descMeta.setAttribute("content", descText);

        const ogTitle = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
        if (ogTitle) ogTitle.setAttribute("content", computedTitle);

        const ogDesc = document.querySelector<HTMLMetaElement>("meta[property='og:description']");
        if (ogDesc) ogDesc.setAttribute("content", descText);

        const ogUrl = document.querySelector<HTMLMetaElement>("meta[property='og:url']");
        if (ogUrl) ogUrl.setAttribute("content", canonicalHref);
      }

      // Track SPA pageview in Meta Pixel on route changes (skipping initial render which fired from index.html)
      if (isFirstRender.current) {
        isFirstRender.current = false;
      } else {
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("track", "PageView");
        }
      }
    }
  }, [location.pathname, lang, settings, isAdminRoute]);

  return (
    <>
      <ScrollToTop />
      {!isPortalRoute && <NoticeTicker />}
      {!isPortalRoute && <Navbar />}
      <main>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public Institutional Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/notices" element={<NoticeBoard />} />
              <Route path="/virtual-tour" element={<VirtualTour />} />
              <Route path="/admission" element={<Admission />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/media" element={<MediaCenter />} />
              <Route path="/news" element={<News />} />
              <Route path="/events" element={<Events />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/huffaz" element={<Huffaz />} />
              <Route path="/admission-form" element={<AdmissionForm />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              {/* Modular CMS Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/notices" element={<AdminNotices />} />
              <Route path="/admin/curriculum" element={<AdminCurriculum />} />
              <Route path="/admin/downloads" element={<AdminDownloads />} />
              <Route path="/admin/teachers" element={<AdminTeachers />} />
              <Route path="/admin/huffaz" element={<AdminHuffaz />} />
              <Route path="/admin/admission-info" element={<AdminAdmissionInfo />} />
              <Route path="/admin/admissions" element={<AdminAdmissions />} />
              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/media" element={<AdminMedia />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/achievements" element={<AdminAchievements />} />
              <Route path="/admin/content" element={<AdminWebContent />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/admins" element={<AdminManagement />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Legacy & Crawled Route Redirects to eliminate GSC Soft 404s */}
              <Route path="/courses" element={<Navigate to="/curriculum" replace />} />
              <Route path="/courses/*" element={<Navigate to="/curriculum" replace />} />
              <Route path="/faq" element={<Navigate to="/admission" replace />} />
              <Route path="/faq/*" element={<Navigate to="/admission" replace />} />
              <Route path="/privacy" element={<Navigate to="/about" replace />} />
              <Route path="/privacy/*" element={<Navigate to="/about" replace />} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isPortalRoute && <Footer />}
      {!isPortalRoute && (
        <>
          <NasheedPlayer />
          <AdmissionFloatingFAB />
          <WhatsAppFAB />
        </>
      )}
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LanguageProvider>
            <AuthProvider>
              <BrowserRouter>
                <ErrorBoundary>
                  <AppShell />
                </ErrorBoundary>
              </BrowserRouter>
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
