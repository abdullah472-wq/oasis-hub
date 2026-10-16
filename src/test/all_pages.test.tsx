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
import NoticeBoard from "@/pages/NoticeBoard";
import VirtualTour from "@/pages/VirtualTour";
import Admission from "@/pages/Admission";
import Gallery from "@/pages/Gallery";
import MediaCenter from "@/pages/MediaCenter";
import News from "@/pages/News";
import Events from "@/pages/Events";
import AdmissionForm from "@/pages/AdmissionForm";
import Curriculum from "@/pages/Curriculum";
import Downloads from "@/pages/Downloads";
import Teachers from "@/pages/Teachers";
import Huffaz from "@/pages/Huffaz";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import Sitemap from "@/pages/Sitemap";

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
  it("renders NoticeBoard", () => { render(wrap(<NoticeBoard />)); });
  it("renders VirtualTour", () => { render(wrap(<VirtualTour />)); });
  it("renders Admission", () => { render(wrap(<Admission />)); });
  it("renders Gallery", () => { render(wrap(<Gallery />)); });
  it("renders MediaCenter", () => { render(wrap(<MediaCenter />)); });
  it("renders News", () => { render(wrap(<News />)); });
  it("renders Events", () => { render(wrap(<Events />)); });
  it("renders AdmissionForm", () => { render(wrap(<AdmissionForm />)); });
  it("renders Curriculum", () => { render(wrap(<Curriculum />)); });
  it("renders Downloads", () => { render(wrap(<Downloads />)); });
  it("renders Teachers", () => { render(wrap(<Teachers />)); });
  it("renders Huffaz", () => { render(wrap(<Huffaz />)); });
  it("renders Contact", () => { render(wrap(<Contact />)); });
  it("renders NotFound", () => { render(wrap(<NotFound />)); });
  it("renders Sitemap", () => { render(wrap(<Sitemap />)); });
});
