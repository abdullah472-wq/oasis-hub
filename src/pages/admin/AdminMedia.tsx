import { useState } from "react";
import { Film, Video, Image as ImageIcon, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoManager } from "@/components/admin/media/VideoManager";
import { GalleryManager } from "@/components/admin/media/GalleryManager";
import { DownloadsManager } from "@/components/admin/media/DownloadsManager";

export const AdminMedia = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <AdminLayout
      title={t("মিডিয়া সেন্টার", "Media Center")}
      subtitle={t(
        "ইউটিউব ভিডিও, ফটো গ্যালারি ও ডাউনলোড রিসোর্স ব্যবস্থাপনা",
        "Manage YouTube videos, photo gallery, and downloadable documents"
      )}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg h-11 bg-muted/70 p-1">
            <TabsTrigger value="videos" className="gap-2 font-medium">
              <Video className="h-4 w-4 text-red-600" />
              <span>{t("ইউটিউব ভিডিও", "Videos")}</span>
            </TabsTrigger>

            <TabsTrigger value="gallery" className="gap-2 font-medium">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <span>{t("ফটো গ্যালারি", "Gallery")}</span>
            </TabsTrigger>

            <TabsTrigger value="downloads" className="gap-2 font-medium">
              <Download className="h-4 w-4 text-emerald-600" />
              <span>{t("ডাউনলোড রিসোর্স", "Downloads")}</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="videos" className="focus-visible:outline-none focus-visible:ring-0">
              <VideoManager />
            </TabsContent>

            <TabsContent value="gallery" className="focus-visible:outline-none focus-visible:ring-0">
              <GalleryManager />
            </TabsContent>

            <TabsContent value="downloads" className="focus-visible:outline-none focus-visible:ring-0">
              <DownloadsManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
