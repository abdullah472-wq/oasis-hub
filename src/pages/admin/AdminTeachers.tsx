import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { FacultyManager } from "@/components/admin/teachers/FacultyManager";

export const AdminTeachers = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("শিক্ষক ও পরিচালকমণ্ডলী ব্যবস্থাপনা", "Faculty & Management")}
      subtitle={t(
        "প্রতিষ্ঠানের পরিচালনা পরিষদ, বালক ও বালিকা ক্যাম্পাসের শিক্ষক এবং প্রশাসনিক স্টাফদের প্রোফাইল পরিচালনা করুন",
        "Manage governing board, faculty members of boys and girls campuses, and administrative staff"
      )}
    >
      <FacultyManager />
    </AdminLayout>
  );
};

export default AdminTeachers;
