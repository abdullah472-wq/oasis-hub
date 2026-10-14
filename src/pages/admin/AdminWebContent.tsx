import { useState } from "react";
import { Megaphone, Image as HeroIcon, Award, MessageSquareQuote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarqueeManager } from "@/components/admin/content/MarqueeManager";
import { HeroBannerManager } from "@/components/admin/content/HeroBannerManager";
import { AchievementManager } from "@/components/admin/content/AchievementManager";
import { TestimonialModeration } from "@/components/admin/content/TestimonialModeration";

export const AdminWebContent = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("marquee");

  return (
    <AdminLayout
      title={t("ওয়েবসাইট কনটেন্ট", "Website Content")}
      subtitle={t(
        "মারকুই টিকার, হিরো ব্যানার, প্রতিষ্ঠানের অর্জন এবং অভিভাবক রিভিউ ব্যবস্থাপনা",
        "Manage running ticker, homepage hero banners, institutional milestones, and reviews"
      )}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl h-11 bg-muted/70 p-1">
            <TabsTrigger value="marquee" className="gap-2 font-medium">
              <Megaphone className="h-4 w-4 text-amber-500" />
              <span>{t("মারকুই টিকার", "Marquee")}</span>
            </TabsTrigger>

            <TabsTrigger value="hero" className="gap-2 font-medium">
              <HeroIcon className="h-4 w-4 text-blue-600" />
              <span>{t("হিরো ব্যানার", "Hero Banners")}</span>
            </TabsTrigger>

            <TabsTrigger value="achievements" className="gap-2 font-medium">
              <Award className="h-4 w-4 text-purple-600" />
              <span>{t("অর্জন ও সাফল্য", "Achievements")}</span>
            </TabsTrigger>

            <TabsTrigger value="testimonials" className="gap-2 font-medium">
              <MessageSquareQuote className="h-4 w-4 text-emerald-600" />
              <span>{t("রিভিউ মডারেশন", "Testimonials")}</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="marquee" className="focus-visible:outline-none focus-visible:ring-0">
              <MarqueeManager />
            </TabsContent>

            <TabsContent value="hero" className="focus-visible:outline-none focus-visible:ring-0">
              <HeroBannerManager />
            </TabsContent>

            <TabsContent value="achievements" className="focus-visible:outline-none focus-visible:ring-0">
              <AchievementManager />
            </TabsContent>

            <TabsContent value="testimonials" className="focus-visible:outline-none focus-visible:ring-0">
              <TestimonialModeration />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWebContent;
