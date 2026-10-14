import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Megaphone, Image as HeroIcon, Award, MessageSquareQuote, Calendar, Newspaper } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarqueeManager } from "@/components/admin/content/MarqueeManager";
import { HeroBannerManager } from "@/components/admin/content/HeroBannerManager";
import { AchievementManager } from "@/components/admin/content/AchievementManager";
import { TestimonialModeration } from "@/components/admin/content/TestimonialModeration";
import { EventManager } from "@/components/admin/content/EventManager";
import { NewsManager } from "@/components/admin/content/NewsManager";

export const AdminWebContent = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "marquee");

  useEffect(() => {
    if (tabParam && ["marquee", "hero", "news", "events", "achievements", "testimonials"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <AdminLayout
      title={t("ওয়েবসাইট কনটেন্ট", "Website Content")}
      subtitle={t(
        "মারকুই টিকার, হিরো ব্যানার, সংবাদ প্রকাশ, ইভেন্ট ক্যালেন্ডার, প্রতিষ্ঠানের অর্জন এবং রিভিউ ব্যবস্থাপনা",
        "Manage running ticker, homepage banners, news publishing, event calendar, milestones, and reviews"
      )}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 max-w-5xl h-auto p-1 bg-muted/70 gap-1 rounded-2xl">
            <TabsTrigger value="marquee" className="gap-2 font-medium rounded-xl py-2">
              <Megaphone className="h-4 w-4 text-amber-500" />
              <span>{t("মারকুই টিকার", "Marquee")}</span>
            </TabsTrigger>

            <TabsTrigger value="hero" className="gap-2 font-medium rounded-xl py-2">
              <HeroIcon className="h-4 w-4 text-blue-600" />
              <span>{t("হিরো ব্যানার", "Hero Banners")}</span>
            </TabsTrigger>

            <TabsTrigger value="news" className="gap-2 font-medium rounded-xl py-2">
              <Newspaper className="h-4 w-4 text-sky-500" />
              <span>{t("সংবাদ প্রকাশ", "News Publish")}</span>
            </TabsTrigger>

            <TabsTrigger value="events" className="gap-2 font-medium rounded-xl py-2">
              <Calendar className="h-4 w-4 text-rose-500" />
              <span>{t("ইভেন্ট ক্যালেন্ডার", "Events")}</span>
            </TabsTrigger>

            <TabsTrigger value="achievements" className="gap-2 font-medium rounded-xl py-2">
              <Award className="h-4 w-4 text-purple-600" />
              <span>{t("অর্জন ও সাফল্য", "Achievements")}</span>
            </TabsTrigger>

            <TabsTrigger value="testimonials" className="gap-2 font-medium rounded-xl py-2">
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

            <TabsContent value="news" className="focus-visible:outline-none focus-visible:ring-0">
              <NewsManager />
            </TabsContent>

            <TabsContent value="events" className="focus-visible:outline-none focus-visible:ring-0">
              <EventManager />
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
