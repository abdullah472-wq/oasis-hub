import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { TestimonialModeration } from "@/components/admin/content/TestimonialModeration";

export const AdminReviews = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout
      title={t("রিভিউ ও অভিভাবক মতামত মডারেশন", "Reviews & Testimonials Moderation")}
      subtitle={t(
        "ওয়েবসাইটে জমাকৃত রিভিউ যাচাই, অনুমোদন এবং প্রকাশনা পরিচালনা করুন",
        "Moderate, approve, and manage user reviews and testimonials submitted on the website"
      )}
    >
      <TestimonialModeration />
    </AdminLayout>
  );
};

export default AdminReviews;
