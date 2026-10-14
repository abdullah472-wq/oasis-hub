import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "@/pages/Index";
import About from "@/pages/About";
import Achievements from "@/pages/Achievements";
import AppDownloadPage from "@/pages/AppDownloadPage";
import NoticeBoard from "@/pages/NoticeBoard";
import VirtualTour from "@/pages/VirtualTour";
import Admission from "@/pages/Admission";
import Gallery from "@/pages/Gallery";
import MediaCenter from "@/pages/MediaCenter";
import News from "@/pages/News";
import Events from "@/pages/Events";
import AdmissionForm from "@/pages/AdmissionForm";
import Contact from "@/pages/Contact";
import Ramadan from "@/pages/Ramadan";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const wrap = (ui: React.ReactElement) => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>{ui}</BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

describe("All Public Pages Rendering", () => {
  it("renders Index", () => { render(wrap(<Index />)); });
  it("renders About", () => { render(wrap(<About />)); });
  it("renders Achievements", () => { render(wrap(<Achievements />)); });
  it("renders AppDownloadPage", () => { render(wrap(<AppDownloadPage />)); });
  it("renders NoticeBoard", () => { render(wrap(<NoticeBoard />)); });
  it("renders VirtualTour", () => { render(wrap(<VirtualTour />)); });
  it("renders Admission", () => { render(wrap(<Admission />)); });
  it("renders Gallery", () => { render(wrap(<Gallery />)); });
  it("renders MediaCenter", () => { render(wrap(<MediaCenter />)); });
  it("renders News", () => { render(wrap(<News />)); });
  it("renders Events", () => { render(wrap(<Events />)); });
  it("renders AdmissionForm", () => { render(wrap(<AdmissionForm />)); });
  it("renders Contact", () => { render(wrap(<Contact />)); });
  it("renders Ramadan", () => { render(wrap(<Ramadan />)); });
  it("renders NotFound", () => { render(wrap(<NotFound />)); });
});
