import { useState } from "react";
import { ShieldCheck, UserCheck, History } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUsersTable } from "@/components/admin/management/AdminUsersTable";
import { ActivityLogTable } from "@/components/admin/management/ActivityLogTable";

export const AdminManagement = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <AdminLayout
      title={t("অ্যাডমিন ও নিরাপত্তা", "Admin & Security")}
      subtitle={t(
        "অ্যাডমিন অ্যাকাউন্ট, রোলস (RBAC) ও সিস্টেম অডিট অ্যাক্টিভিটি লগ",
        "Manage admin accounts, roles, and system audit activity logs"
      )}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md h-11 bg-muted/70 p-1">
            <TabsTrigger value="users" className="gap-2 font-medium">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>{t("অ্যাডমিন ব্যবহারকারী", "Admin Accounts")}</span>
            </TabsTrigger>

            <TabsTrigger value="logs" className="gap-2 font-medium">
              <History className="h-4 w-4 text-emerald-600" />
              <span>{t("সিস্টেম অডিট লগ", "Audit Logs")}</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="users" className="focus-visible:outline-none focus-visible:ring-0">
              <AdminUsersTable />
            </TabsContent>

            <TabsContent value="logs" className="focus-visible:outline-none focus-visible:ring-0">
              <ActivityLogTable />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminManagement;
