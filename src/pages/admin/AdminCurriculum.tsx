import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { CurriculumManager } from "@/components/admin/curriculum/CurriculumManager";

export const AdminCurriculum = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("শিক্ষা কারিকুলাম ম্যানেজমেন্ট", "Academic Curriculum Management")}
      subtitle={t(
        "শিক্ষা প্রতিষ্ঠানের বিভিন্ন বিভাগের পাঠ্যক্রম, সিলেবাস, বয়সসীমা ও বিশেষ সুবিধাসমূহ পরিচালনা করুন",
        "Manage departmental curriculum, course durations, syllabuses, and key highlights"
      )}
    >
      <CurriculumManager />
    </AdminLayout>
  );
};

export default AdminCurriculum;
