import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, Film, ImageIcon, Download, Globe, MessageSquareQuote } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricItem {
  key: string;
  titleBn: string;
  titleEn: string;
  value: number;
  subtitleBn: string;
  subtitleEn: string;
  icon: typeof BellRing;
  colorClass: string;
  href: string;
}

export const DashboardMetrics = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    noticesCount: 0,
    publishedNoticesCount: 0,
    videosCount: 0,
    galleryCount: 0,
    downloadsCount: 0,
    activeTickerCount: 0,
    pendingReviewsCount: 0,
  });

  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      try {
        const [
          noticesRes,
          publishedNoticesRes,
          videosRes,
          galleryRes,
          downloadsRes,
          tickerRes,
          reviewsRes,
        ] = await Promise.all([
          supabase.from("notices").select("id", { count: "exact", head: true }),
          supabase.from("notices").select("id", { count: "exact", head: true }).eq("is_published", true),
          supabase.from("media_videos").select("id", { count: "exact", head: true }),
          supabase.from("gallery_items").select("id", { count: "exact", head: true }),
          supabase.from("downloads").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("marquee_notices").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_approved", false),
        ]);

        let pendingReviews = reviewsRes.count || 0;
        if (pendingReviews === 0 && typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("oasis_testimonials_cache");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                pendingReviews = parsed.filter((r) => !r.approved).length;
              }
            }
          } catch {
            // ignore
          }
        }

        if (!mounted) return;

        setMetrics({
          noticesCount: noticesRes.count || 0,
          publishedNoticesCount: publishedNoticesRes.count || 0,
          videosCount: videosRes.count || 0,
          galleryCount: galleryRes.count || 0,
          downloadsCount: downloadsRes.count || 0,
          activeTickerCount: tickerRes.count || 0,
          pendingReviewsCount: pendingReviews,
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchCounts();

    return () => {
      mounted = false;
    };
  }, []);

  const cards: MetricItem[] = [
    {
      key: "notices",
      titleBn: "মোট নোটিশ",
      titleEn: "Total Notices",
      value: metrics.noticesCount,
      subtitleBn: `${metrics.publishedNoticesCount}টি সক্রিয় প্রকাশিত`,
      subtitleEn: `${metrics.publishedNoticesCount} Published`,
      icon: BellRing,
      colorClass: "bg-blue-500/10 text-blue-600 border-blue-200/50",
      href: "/admin/notices",
    },
    {
      key: "videos",
      titleBn: "ভিডিও ও স্ট্রিম",
      titleEn: "Videos & Streams",
      value: metrics.videosCount,
      subtitleBn: "মিডিয়া সেন্টার ভিডিও",
      subtitleEn: "Media Center Videos",
      icon: Film,
      colorClass: "bg-purple-500/10 text-purple-600 border-purple-200/50",
      href: "/admin/media?tab=videos",
    },
    {
      key: "gallery",
      titleBn: "গ্যালারি ছবি",
      titleEn: "Gallery Photos",
      value: metrics.galleryCount,
      subtitleBn: "ক্যাম্পাস ও ইভেন্ট ছবি",
      subtitleEn: "Campus & Event Photos",
      icon: ImageIcon,
      colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
      href: "/admin/media?tab=gallery",
    },
    {
      key: "downloads",
      titleBn: "ফাইল ও ডাউনলোড",
      titleEn: "Public Downloads",
      value: metrics.downloadsCount,
      subtitleBn: "পাবলিক রিসোর্স ও ফর্ম",
      subtitleEn: "Resources & Forms",
      icon: Download,
      colorClass: "bg-amber-500/10 text-amber-600 border-amber-200/50",
      href: "/admin/downloads",
    },
    {
      key: "ticker",
      titleBn: "স্ক্রল টিকার নোটিশ",
      titleEn: "Marquee Ticker",
      value: metrics.activeTickerCount,
      subtitleBn: "হোমপেজে রানিং নোটিশ",
      subtitleEn: "Active Running Ticker",
      icon: Globe,
      colorClass: "bg-teal-500/10 text-teal-600 border-teal-200/50",
      href: "/admin/content?tab=marquee",
    },
    {
      key: "reviews",
      titleBn: "অপেক্ষমাণ রিভিউ",
      titleEn: "Pending Reviews",
      value: metrics.pendingReviewsCount,
      subtitleBn: "অনুমোদনের অপেক্ষায় (ক্লিক করুন)",
      subtitleEn: "Awaiting Moderation (Click to review)",
      icon: MessageSquareQuote,
      colorClass: "bg-rose-500/10 text-rose-600 border-rose-200/50",
      href: "/admin/reviews",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-3xl border-border/70 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-10 rounded-2xl" />
            </div>
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.key} to={card.href} className="block group">
            <Card className="relative overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-bengali text-xs font-semibold text-muted-foreground uppercase tracking-wide group-hover:text-primary transition-colors">
                    {t(card.titleBn, card.titleEn)}
                  </span>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110 ${card.colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-display text-3xl font-bold text-foreground">
                    {card.value.toLocaleString(t("bn-BD", "en-US"))}
                  </h3>
                  <p className="font-bengali mt-1 text-xs text-muted-foreground">
                    {t(card.subtitleBn, card.subtitleEn)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
