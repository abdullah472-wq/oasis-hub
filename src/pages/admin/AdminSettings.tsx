import { useState } from "react";
import { Settings, Building2, MapPin, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { CampusAddressForm } from "@/components/admin/settings/CampusAddressForm";
import { BrandingSettingsForm } from "@/components/admin/settings/BrandingSettingsForm";

export const AdminSettings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <AdminLayout
      title={t("প্রতিষ্ঠান সেটিংস", "Institution Settings")}
      subtitle={t(
        "প্রতিষ্ঠানের পরিচিতি, লোগো, ক্যাম্পাসসমূহ এবং যোগাযোগ তথ্য পরিচালনা করুন",
        "Manage institution profile, official branding, campus locations, and contacts"
      )}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg h-11 bg-muted/70 p-1">
            <TabsTrigger value="general" className="gap-2 font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{t("পরিচিতি ও যোগাযোগ", "General")}</span>
            </TabsTrigger>

            <TabsTrigger value="campus" className="gap-2 font-medium">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>{t("ক্যাম্পাস ঠিকানা", "Campuses")}</span>
            </TabsTrigger>

            <TabsTrigger value="branding" className="gap-2 font-medium">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>{t("লোগো ও ব্র্যান্ডিং", "Branding")}</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="general" className="focus-visible:outline-none focus-visible:ring-0">
              <GeneralSettingsForm />
            </TabsContent>

            <TabsContent value="campus" className="focus-visible:outline-none focus-visible:ring-0">
              <CampusAddressForm />
            </TabsContent>

            <TabsContent value="branding" className="focus-visible:outline-none focus-visible:ring-0">
              <BrandingSettingsForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
