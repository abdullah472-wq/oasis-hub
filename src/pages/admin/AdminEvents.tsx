import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { EventManager } from "@/components/admin/content/EventManager";

export const AdminEvents = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("ইভেন্ট ক্যালেন্ডার ম্যানেজমেন্ট", "Events & Calendar Management")}
      subtitle={t(
        "শিক্ষা প্রতিষ্ঠানের বার্ষিক একাডেমিক ক্যালেন্ডার, পরীক্ষা, ছুটি ও অনুষ্ঠানসূচি পরিচালনা করুন",
        "Manage institutional calendar, exams, holidays, and campus programs"
      )}
    >
      <EventManager />
    </AdminLayout>
  );
};

export default AdminEvents;
