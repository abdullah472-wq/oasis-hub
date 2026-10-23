import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";

import AdminMedia from "@/pages/admin/AdminMedia";
import AdminWebContent from "@/pages/admin/AdminWebContent";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminNotices from "@/pages/admin/AdminNotices";
import AdminManagement from "@/pages/admin/AdminManagement";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminNews from "@/pages/admin/AdminNews";
import AdminCurriculum from "@/pages/admin/AdminCurriculum";
import AdminDownloads from "@/pages/admin/AdminDownloads";
import AdminTeachers from "@/pages/admin/AdminTeachers";
import AdminHuffaz from "@/pages/admin/AdminHuffaz";
import AdminAdmissionInfo from "@/pages/admin/AdminAdmissionInfo";
import AdminAdmissions from "@/pages/admin/AdminAdmissions";
import AdminReviews from "@/pages/admin/AdminReviews";
import { AdmissionsManager } from "@/components/admin/admissions/AdmissionsManager";

// Also test the layout and components
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { VideoManager } from "@/components/admin/media/VideoManager";
import { GalleryManager } from "@/components/admin/media/GalleryManager";
import { DownloadsManager } from "@/components/admin/media/DownloadsManager";
import { MarqueeManager } from "@/components/admin/content/MarqueeManager";
import { HeroBannerManager } from "@/components/admin/content/HeroBannerManager";
import { AchievementManager } from "@/components/admin/content/AchievementManager";
import { TestimonialModeration } from "@/components/admin/content/TestimonialModeration";
import { EventManager } from "@/components/admin/content/EventManager";
import { NewsManager } from "@/components/admin/content/NewsManager";
import { AdminUsersTable } from "@/components/admin/management/AdminUsersTable";
import { ActivityLogTable } from "@/components/admin/management/ActivityLogTable";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { CampusAddressForm } from "@/components/admin/settings/CampusAddressForm";
import { BrandingSettingsForm } from "@/components/admin/settings/BrandingSettingsForm";
import { NoticeTable } from "@/components/admin/notices/NoticeTable";

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>{ui}</BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

describe("Admin CMS Modules and Pages", () => {
  it("verifies all page exports and components exist", () => {
    expect(AdminMedia).toBeDefined();
    expect(AdminWebContent).toBeDefined();
    expect(AdminDashboard).toBeDefined();
    expect(AdminNotices).toBeDefined();
    expect(AdminManagement).toBeDefined();
    expect(AdminSettings).toBeDefined();
    expect(AdminLogin).toBeDefined();
    expect(AdminEvents).toBeDefined();
    expect(AdminNews).toBeDefined();
    expect(AdminLayout).toBeDefined();
    expect(VideoManager).toBeDefined();
    expect(GalleryManager).toBeDefined();
    expect(DownloadsManager).toBeDefined();
    expect(MarqueeManager).toBeDefined();
    expect(HeroBannerManager).toBeDefined();
    expect(AchievementManager).toBeDefined();
    expect(TestimonialModeration).toBeDefined();
    expect(EventManager).toBeDefined();
    expect(NewsManager).toBeDefined();
    expect(AdminUsersTable).toBeDefined();
    expect(ActivityLogTable).toBeDefined();
    expect(GeneralSettingsForm).toBeDefined();
    expect(CampusAddressForm).toBeDefined();
    expect(BrandingSettingsForm).toBeDefined();
    expect(NoticeTable).toBeDefined();
  });

  it("renders AdminLogin", () => {
    renderWithProviders(<AdminLogin />);
  });

  it("renders AdminDashboard", () => {
    renderWithProviders(<AdminDashboard />);
  });

  it("renders AdminMedia", () => {
    renderWithProviders(<AdminMedia />);
  });

  it("renders AdminEvents", () => {
    renderWithProviders(<AdminEvents />);
  });

  it("renders AdminNews", () => {
    renderWithProviders(<AdminNews />);
  });

  it("renders AdminWebContent", () => {
    renderWithProviders(<AdminWebContent />);
  });

  it("renders AdminNotices", () => {
    renderWithProviders(<AdminNotices />);
  });

  it("renders AdminManagement", () => {
    renderWithProviders(<AdminManagement />);
  });

  it("renders AdminSettings", () => {
    renderWithProviders(<AdminSettings />);
  });

  it("renders AdminCurriculum", () => {
    renderWithProviders(<AdminCurriculum />);
  });

  it("renders AdminDownloads", () => {
    renderWithProviders(<AdminDownloads />);
  });

  it("renders AdminTeachers", () => {
    renderWithProviders(<AdminTeachers />);
  });

  it("renders AdminHuffaz", () => {
    renderWithProviders(<AdminHuffaz />);
  });

  it("renders AdminAdmissionInfo", () => {
    renderWithProviders(<AdminAdmissionInfo />);
  });

  it("renders AdminAdmissions and AdmissionsManager", () => {
    expect(AdminAdmissions).toBeDefined();
    expect(AdmissionsManager).toBeDefined();
    renderWithProviders(<AdminAdmissions />);
  });

  it("renders AdminReviews and TestimonialModeration", () => {
    expect(AdminReviews).toBeDefined();
    renderWithProviders(<AdminReviews />);
  });
});
