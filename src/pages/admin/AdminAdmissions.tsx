import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { AdmissionsManager } from "@/components/admin/admissions/AdmissionsManager";

export const AdminAdmissions = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("অনলাইন ভর্তি আবেদন ও শিক্ষার্থী নিবন্ধন", "Online Admissions & Enrollment")}
      subtitle={t(
        "ওয়েবসাইটে দাখিলকৃত অনলাইন ভর্তি আবেদনসমূহ যাচাই, তথ্য সংশোধন, অনুমোদন ও শিক্ষার্থী নিবন্ধন পরিচালনা করুন",
        "Manage, review, modify, and approve incoming online student admission applications"
      )}
    >
      <AdmissionsManager />
    </AdminLayout>
  );
};

export default AdminAdmissions;
