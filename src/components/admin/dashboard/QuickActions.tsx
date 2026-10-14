import { Link } from "react-router-dom";
import { PlusCircle, Video, ImagePlus, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
  const { t } = useLanguage();

  const actions = [
    {
      titleBn: "নতুন নোটিশ তৈরি",
      titleEn: "Create New Notice",
      descBn: "পিডিএফ ফাইল বা টেক্সট নোটিশ প্রকাশ করুন",
      descEn: "Publish text or PDF circulars",
      href: "/admin/notices?create=true",
      icon: PlusCircle,
      color: "from-blue-600 to-indigo-600",
    },
    {
      titleBn: "ইউটিউব ভিডিও যুক্ত",
      titleEn: "Add YouTube Video",
      descBn: "মিডিয়া সেন্টারে নতুন ভিডিও বা লাইভ যোগ করুন",
      descEn: "Embed video streams or playlists",
      href: "/admin/media?tab=videos",
      icon: Video,
      color: "from-purple-600 to-pink-600",
    },
    {
      titleBn: "গ্যালারিতে ছবি আপলোড",
      titleEn: "Upload Gallery Photos",
      descBn: "ক্যাম্পাস ও ইভেন্টের স্মৃতিময় মুহূর্ত",
      descEn: "Share photos of campus life",
      href: "/admin/media?tab=gallery",
      icon: ImagePlus,
      color: "from-emerald-600 to-teal-600",
    },
    {
      titleBn: "ইনস্টিটিউশন সেটিংস",
      titleEn: "Institution Settings",
      descBn: "মোবাইল, ইমেইল, ঠিকানা ও সোশ্যাল লিংক",
      descEn: "Update official campus information",
      href: "/admin/settings",
      icon: SlidersHorizontal,
      color: "from-amber-600 to-orange-600",
    },
  ];

  return (
    <Card className="rounded-3xl border-border/70 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="font-bengali text-lg font-bold text-foreground">
          {t("দ্রুত অ্যাকশন", "Quick Actions")}
        </CardTitle>
        <CardDescription className="font-bengali text-xs text-muted-foreground mt-0.5">
          {t("সবচেয়ে বেশি ব্যবহৃত কাজগুলো এক ক্লিকে শুরু করুন", "Direct shortcuts to everyday administrative tasks")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Button
                key={act.titleEn}
                asChild
                variant="outline"
                className="group flex h-auto flex-col items-start justify-between rounded-2xl border-border/70 p-4 text-left transition-all duration-200 hover:border-primary/40 hover:bg-secondary/40"
              >
                <Link to={act.href} className="w-full">
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${act.color} text-white shadow-sm`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <div className="mt-3">
                    <h4 className="font-bengali text-sm font-bold text-foreground">
                      {t(act.titleBn, act.titleEn)}
                    </h4>
                    <p className="font-bengali mt-0.5 text-xs text-muted-foreground">
                      {t(act.descBn, act.descEn)}
                    </p>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
