import { Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { AchievementManager } from "@/components/admin/content/AchievementManager";

export const AdminAchievements = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("অর্জন ও সাফল্য ব্যবস্থাপনা", "Achievements & Milestones")}
      subtitle={t(
        "প্রতিষ্ঠানের উল্লেখযোগ্য সাফল্য, সম্মাননা, জাতীয় ও আন্তর্জাতিক পুরস্কারসমূহ পরিচালনা করুন",
        "Manage institutional milestones, awards, honors, and competitive achievements"
      )}
    >
      <div className="space-y-6">
        <AchievementManager />
      </div>
    </AdminLayout>
  );
};

export default AdminAchievements;
