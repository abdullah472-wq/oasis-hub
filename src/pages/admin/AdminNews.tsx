import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { NewsManager } from "@/components/admin/content/NewsManager";

export const AdminNews = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("সংবাদ প্রকাশনা ও ব্যবস্থাপনা", "News Publishing & Management")}
      subtitle={t(
        "শিক্ষা প্রতিষ্ঠানের সাম্প্রতিক সংবাদ, কার্যক্রম, সাফল্য ও ঘোষণা সরাসরি ওয়েবসাইটে প্রকাশ করুন",
        "Publish news, events, achievements, and announcements directly to the public website"
      )}
    >
      <NewsManager />
    </AdminLayout>
  );
};

export default AdminNews;
