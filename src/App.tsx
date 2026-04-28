import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoticeTicker from "@/components/NoticeTicker";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { isAdminEnabled } from "@/lib/admin";
import { getTodayDateKey, trackAppDailyOpen, trackWebsiteDailyVisitor } from "@/lib/engagementAnalytics";
import Index from "./pages/Index";
const About = lazy(() => import("./pages/About"));
const Achievements = lazy(() => import("./pages/Achievements"));
const GuardianPortal = lazy(() => import("./pages/GuardianPortal"));
const GuardianRegisterPage = lazy(() => import("./pages/GuardianRegisterPage"));
const GuardianLogin = lazy(() => import("./pages/GuardianLogin"));
const AppDownloadPage = lazy(() => import("./pages/AppDownloadPage"));
const NoticeBoard = lazy(() => import("./pages/NoticeBoard"));
const Results = lazy(() => import("./pages/Results"));
const VirtualTour = lazy(() => import("./pages/VirtualTour"));
const Admission = lazy(() => import("./pages/Admission"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const Ramadan = lazy(() => import("./pages/Ramadan"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const News = lazy(() => import("./pages/News"));
const Events = lazy(() => import("./pages/Events"));
const AdmissionForm = lazy(() => import("./pages/AdmissionForm"));

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
      <p className="font-display text-sm text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

const AppShell = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isGuardianRoute = location.pathname.startsWith("/guardian");
  const isPortalRoute = isAdminRoute || isGuardianRoute;

  useEffect(() => {
    if (typeof window === "undefined" || isPortalRoute) return;

    const dateKey = getTodayDateKey();
    const websiteKey = `oasis_visit_${dateKey}`;
    const appOpenKey = `oasis_app_open_${dateKey}`;

    if (!window.localStorage.getItem(websiteKey)) {
      window.localStorage.setItem(websiteKey, "1");
      void trackWebsiteDailyVisitor().catch(() => undefined);
    }

    const mediaMatch = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
    const iosStandalone = "standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isStandalone = mediaMatch || iosStandalone;

    if (isStandalone && !window.localStorage.getItem(appOpenKey)) {
      window.localStorage.setItem(appOpenKey, "1");
      void trackAppDailyOpen().catch(() => undefined);
    }
  }, [isPortalRoute]);

  return (
    <>
      <ScrollToTop />
      {!isPortalRoute && <NoticeTicker />}
      {!isPortalRoute && <Navbar />}
      <main>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/guardian-register" element={<GuardianRegisterPage />} />
            <Route path="/guardian-login" element={<GuardianLogin />} />
            <Route path="/apk" element={<AppDownloadPage />} />
            <Route path="/guardian/*" element={<GuardianPortal />} />
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/results" element={<Results />} />
            <Route path="/virtual-tour" element={<VirtualTour />} />
            <Route path="/admission" element={<Admission />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/news" element={<News />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admission-form" element={<AdmissionForm />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/ramadan" element={<Ramadan />} />
            <Route path="/admin/*" element={isAdminEnabled ? <AdminPortal /> : <NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isPortalRoute && <Footer />}
      {!isPortalRoute && <WhatsAppFAB />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
