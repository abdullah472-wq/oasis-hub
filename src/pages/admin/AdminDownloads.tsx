import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { DownloadsManager } from "@/components/admin/media/DownloadsManager";

export const AdminDownloads = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("ডাউনলোড কর্নার ও রিসোর্স ব্যবস্থাপনা", "Download Corner & Resources Management")}
      subtitle={t(
        "প্রতিষ্ঠানের বার্ষিক সিলেবাস, ক্লাস ও পরীক্ষার রুটিন, ভর্তি নির্দেশিকা এবং একাডেমিক ক্যালেন্ডার পরিচালনা করুন",
        "Manage institutional syllabuses, class & exam routines, admission guidelines, and calendars"
      )}
    >
      <DownloadsManager />
    </AdminLayout>
  );
};

export default AdminDownloads;
