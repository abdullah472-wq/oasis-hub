import { useState } from "react";
import { Settings, Building2, MapPin, Sparkles, CreditCard, Users, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { CampusAddressForm } from "@/components/admin/settings/CampusAddressForm";
import { BankingSettingsForm } from "@/components/admin/settings/BankingSettingsForm";
import { LeadershipSettingsForm } from "@/components/admin/settings/LeadershipSettingsForm";
import { BrandingSettingsForm } from "@/components/admin/settings/BrandingSettingsForm";
import { ThemeSettingsForm } from "@/components/admin/settings/ThemeSettingsForm";

export const AdminSettings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <AdminLayout
      title={t("প্রতিষ্ঠান সেটিংস", "Institution Settings")}
      subtitle={t(
        "প্রতিষ্ঠানের পরিচিতি, লোগো, ক্যাম্পাসসমূহ, ব্যাংক একাউন্ট এবং দায়িত্বশীলদের তথ্য পরিচালনা করুন",
        "Manage institution identity, logos, campuses, banking credentials, and leadership profiles"
      )}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-5xl h-auto bg-muted/70 p-1 gap-1">
            <TabsTrigger value="general" className="gap-2 py-2 font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{t("পরিচিতি ও মূল তথ্য", "General & Identity")}</span>
            </TabsTrigger>

            <TabsTrigger value="campus" className="gap-2 py-2 font-medium">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>{t("ক্যাম্পাস ও যোগাযোগ", "Contact & Location")}</span>
            </TabsTrigger>

            <TabsTrigger value="banking" className="gap-2 py-2 font-medium">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>{t("ব্যাংক ও ফি পেমেন্ট", "Banking & Payment")}</span>
            </TabsTrigger>

            <TabsTrigger value="leadership" className="gap-2 py-2 font-medium">
              <Users className="h-4 w-4 text-sky-600" />
              <span>{t("দায়িত্বশীল ও নেতৃত্ব", "Leadership")}</span>
            </TabsTrigger>

            <TabsTrigger value="branding" className="gap-2 py-2 font-medium">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>{t("লোগো ও ব্যানার", "Branding")}</span>
            </TabsTrigger>

            <TabsTrigger value="theme" className="gap-2 py-2 font-medium">
              <Palette className="h-4 w-4 text-rose-500" />
              <span>{t("কালার ও থিম", "Theme & Colors")}</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="general" className="focus-visible:outline-none focus-visible:ring-0">
              <GeneralSettingsForm />
            </TabsContent>

            <TabsContent value="campus" className="focus-visible:outline-none focus-visible:ring-0">
              <CampusAddressForm />
            </TabsContent>

            <TabsContent value="banking" className="focus-visible:outline-none focus-visible:ring-0">
              <BankingSettingsForm />
            </TabsContent>

            <TabsContent value="leadership" className="focus-visible:outline-none focus-visible:ring-0">
              <LeadershipSettingsForm />
            </TabsContent>

            <TabsContent value="branding" className="focus-visible:outline-none focus-visible:ring-0">
              <BrandingSettingsForm />
            </TabsContent>

            <TabsContent value="theme" className="focus-visible:outline-none focus-visible:ring-0">
              <ThemeSettingsForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
