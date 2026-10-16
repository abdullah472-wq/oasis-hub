import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
import Index from "./pages/Index";
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
const AdminWebContent = lazy(() => import("./pages/admin/AdminWebContent"));
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

const AppShell = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPortalRoute = isAdminRoute;

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
              <Route path="/admin/content" element={<AdminWebContent />} />
              <Route path="/admin/admins" element={<AdminManagement />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

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
