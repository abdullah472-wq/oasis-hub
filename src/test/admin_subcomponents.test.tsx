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
import { BankingSettingsForm } from "@/components/admin/settings/BankingSettingsForm";
import { LeadershipSettingsForm } from "@/components/admin/settings/LeadershipSettingsForm";

import { NoticeTable } from "@/components/admin/notices/NoticeTable";
import { NoticeFormDialog } from "@/components/admin/notices/NoticeFormDialog";
import { AdminAchievements } from "@/pages/admin/AdminAchievements";
import { AdminWebContent } from "@/pages/admin/AdminWebContent";

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
    render(wrap(<BankingSettingsForm />));
    render(wrap(<LeadershipSettingsForm />));
  });

  it("renders NoticeTable and NoticeFormDialog", () => {
    render(wrap(<NoticeTable notices={[]} loading={false} onEdit={() => {}} onDelete={() => {}} />));
    render(wrap(<NoticeFormDialog isOpen={true} onClose={() => {}} onSuccess={() => {}} />));
  });

  it("renders AdminAchievements and AdminWebContent pages", () => {
    render(wrap(<AdminAchievements />));
    render(wrap(<AdminWebContent />));
  });

  it("extracts YouTube video and playlist IDs correctly", async () => {
    const { extractYouTubeId, saveVideoItem, getVideoList } = await import("@/lib/videoService");
    
    // Normal video & Shorts
    expect(extractYouTubeId("https://www.youtube.com/watch?v=7X8II6J-6mU")).toBe("7X8II6J-6mU");
    expect(extractYouTubeId("https://youtu.be/7X8II6J-6mU")).toBe("7X8II6J-6mU");
    expect(extractYouTubeId("https://www.youtube.com/shorts/3XZ8m9_k2pA")).toBe("3XZ8m9_k2pA");
    expect(extractYouTubeId("https://youtube.com/shorts/3XZ8m9_k2pA?feature=share")).toBe("3XZ8m9_k2pA");

    // Playlist URL
    const playlistUrl = "https://www.youtube.com/watch?v=VFnUBYe9giM&list=PLSKwzh15e_dk";
    expect(extractYouTubeId(playlistUrl, "playlist")).toBe("PLSKwzh15e_dk");
    expect(extractYouTubeId(playlistUrl, "video")).toBe("VFnUBYe9giM");

    // Test saving video
    const saveRes = await saveVideoItem({
      title_bn: "টেস্ট ভিডিও",
      youtube_url: playlistUrl,
      youtube_video_id: "PLSKwzh15e_dk",
      type: "playlist",
      is_featured: false,
      order_index: 1,
    });
    expect(saveRes.success).toBe(true);
    expect(saveRes.item.title_bn).toBe("টেস্ট ভিডিও");

    // Test list retrieval
    const listRes = await getVideoList();
    expect(listRes.videos.length).toBeGreaterThan(0);
  });
});
