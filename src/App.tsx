import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoticeTicker from "@/components/NoticeTicker";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import Index from "./pages/Index";
const About = lazy(() => import("./pages/About"));
const Teachers = lazy(() => import("./pages/Teachers"));
const NoticeBoard = lazy(() => import("./pages/NoticeBoard"));
const Results = lazy(() => import("./pages/Results"));
const VirtualTour = lazy(() => import("./pages/VirtualTour"));
const Admission = lazy(() => import("./pages/Admission"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const Ramadan = lazy(() => import("./pages/Ramadan"));
const Admin = lazy(() => import("./pages/Admin"));
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <NoticeTicker />
          <Navbar />
          <main>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/teachers" element={<Teachers />} />
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
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <WhatsAppFAB />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
