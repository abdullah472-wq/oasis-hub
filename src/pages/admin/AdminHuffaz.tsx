import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { HuffazManager } from "@/components/admin/huffaz/HuffazManager";

export const AdminHuffaz = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("কৃতি হাফেজ তালিকা ও সম্মাননা ব্যবস্থাপনা", "Wall of Huffaz Management")}
      subtitle={t(
        "পবিত্র কুরআনুল কারীম হেফজ সম্পন্নকারী কৃতি শিক্ষার্থীদের ব্যাচভিত্তিক তালিকা, দস্তারবন্দী সম্মাননা পাগড়ী ও সনদ পরিচালনা করুন",
        "Manage graduating Huffaz records, completion years, awards, and turban honors"
      )}
    >
      <HuffazManager />
    </AdminLayout>
  );
};

export default AdminHuffaz;
