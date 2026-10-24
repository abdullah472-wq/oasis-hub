import { Image as HeroIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { HeroBannerManager } from "@/components/admin/content/HeroBannerManager";

export const AdminWebContent = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("ওয়েবসাইট ব্যানার ও স্লাইডার", "Website Hero Banners")}
      subtitle={t(
        "হোমপেজে প্রদর্শিত স্লাইডার ব্যানার, অ্যাকশন বাটন ও প্রচারমূলক ব্যানার পরিচালনা করুন",
        "Manage homepage hero slider banners, call-to-action buttons, and promotional banners"
      )}
    >
      <div className="space-y-6">
        <HeroBannerManager />
      </div>
    </AdminLayout>
  );
};

export default AdminWebContent;
