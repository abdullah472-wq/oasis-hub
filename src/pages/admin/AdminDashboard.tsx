import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/lib/siteSettings";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { DashboardMetrics } from "@/components/admin/dashboard/DashboardMetrics";
import { RecentActivityList } from "@/components/admin/dashboard/RecentActivityList";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";

export const AdminDashboard = () => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  return (
    <AdminLayout
      title={t("ড্যাশবোর্ড ওভারভিউ", "Dashboard Overview")}
      subtitle={`${settings.institution_name_bn || "আননূর শিক্ষা পরিবার"} - ${t("সেন্ট্রাল সিএমএস সারাংশ", "CMS Summary")}`}
    >
      <div className="space-y-8">
        {/* KPI Metrics */}
        <section>
          <DashboardMetrics />
        </section>

        {/* Action Shortcuts & Recent Activity */}
        <section className="grid gap-6 lg:grid-cols-2 items-start">
          <QuickActions />
          <RecentActivityList />
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
