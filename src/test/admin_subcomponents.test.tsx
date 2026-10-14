import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";

import { VideoManager } from "@/components/admin/media/VideoManager";
import { VideoFormDialog } from "@/components/admin/media/VideoFormDialog";
import { GalleryManager } from "@/components/admin/media/GalleryManager";
import { GalleryFormDialog } from "@/components/admin/media/GalleryFormDialog";
import { DownloadsManager } from "@/components/admin/media/DownloadsManager";
import { DownloadFormDialog } from "@/components/admin/media/DownloadFormDialog";

import { MarqueeManager } from "@/components/admin/content/MarqueeManager";
import { MarqueeFormDialog } from "@/components/admin/content/MarqueeFormDialog";
import { HeroBannerManager } from "@/components/admin/content/HeroBannerManager";
import { HeroBannerDialog } from "@/components/admin/content/HeroBannerDialog";
import { AchievementManager } from "@/components/admin/content/AchievementManager";
import { AchievementDialog } from "@/components/admin/content/AchievementDialog";
import { TestimonialModeration } from "@/components/admin/content/TestimonialModeration";

import { AdminUsersTable } from "@/components/admin/management/AdminUsersTable";
import { InviteAdminDialog } from "@/components/admin/management/InviteAdminDialog";
import { ActivityLogTable } from "@/components/admin/management/ActivityLogTable";

import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { CampusAddressForm } from "@/components/admin/settings/CampusAddressForm";
import { BrandingSettingsForm } from "@/components/admin/settings/BrandingSettingsForm";

import { NoticeTable } from "@/components/admin/notices/NoticeTable";
import { NoticeFormDialog } from "@/components/admin/notices/NoticeFormDialog";

import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter } from "react-router-dom";

const wrap = (ui: React.ReactElement) => (
  <LanguageProvider>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </LanguageProvider>
);

describe("All CMS Components and Dialogs Rendering", () => {
  it("renders VideoManager and VideoFormDialog", () => {
    render(wrap(<VideoManager />));
    render(wrap(<VideoFormDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });

  it("renders GalleryManager and GalleryFormDialog", () => {
    render(wrap(<GalleryManager />));
    render(wrap(<GalleryFormDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });

  it("renders DownloadsManager and DownloadFormDialog", () => {
    render(wrap(<DownloadsManager />));
    render(wrap(<DownloadFormDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });

  it("renders MarqueeManager and MarqueeFormDialog", () => {
    render(wrap(<MarqueeManager />));
    render(wrap(<MarqueeFormDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });

  it("renders HeroBannerManager and HeroBannerDialog", () => {
    render(wrap(<HeroBannerManager />));
    render(wrap(<HeroBannerDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });

  it("renders AchievementManager and AchievementDialog", () => {
    render(wrap(<AchievementManager />));
    render(wrap(<AchievementDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });

  it("renders TestimonialModeration", () => {
    render(wrap(<TestimonialModeration />));
  });

  it("renders AdminUsersTable and InviteAdminDialog", () => {
    render(wrap(<AdminUsersTable />));
    render(wrap(<InviteAdminDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });

  it("renders ActivityLogTable", () => {
    render(wrap(<ActivityLogTable />));
  });

  it("renders Settings Forms", () => {
    render(wrap(<GeneralSettingsForm />));
    render(wrap(<CampusAddressForm />));
    render(wrap(<BrandingSettingsForm />));
  });

  it("renders NoticeTable and NoticeFormDialog", () => {
    render(wrap(<NoticeTable notices={[]} loading={false} onEdit={() => {}} onDelete={() => {}} />));
    render(wrap(<NoticeFormDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });
});
