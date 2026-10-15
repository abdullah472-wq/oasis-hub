import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { AdmissionInfoManager } from "@/components/admin/admission/AdmissionInfoManager";

export const AdminAdmissionInfo = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("ফি ও ভর্তি নির্দেশিকা ব্যবস্থাপনা", "Fees & Admission Management")}
      subtitle={t(
        "প্রতিষ্ঠানের অনাবাসিক ও আবাসিক টিউশন ফি, ভর্তি ফি, ভর্তির নিয়মাবলী ও প্রয়োজনীয় ডকুমেন্ট তালিকা হালনাগাদ করুন",
        "Manage institutional tuition, residential fees, admission rules, and document requirements"
      )}
    >
      <AdmissionInfoManager />
    </AdminLayout>
  );
};

export default AdminAdmissionInfo;
