import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoticeTicker from "@/components/NoticeTicker";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import Index from "./pages/Index";
import About from "./pages/About";
import Teachers from "./pages/Teachers";
import NoticeBoard from "./pages/NoticeBoard";
import Results from "./pages/Results";
import VirtualTour from "./pages/VirtualTour";
import Admission from "./pages/Admission";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Ramadan from "./pages/Ramadan";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import Events from "./pages/Events";
import AdmissionForm from "./pages/AdmissionForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <BrowserRouter>
          <NoticeTicker />
          <Navbar />
          <main>
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
          </main>
          <Footer />
          <WhatsAppFAB />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
