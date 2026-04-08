import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, BadgeCheck, BookMarked, FileBadge2, Sparkles, Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";
import { getAchievements, type AchievementItem } from "@/lib/achievements";

const fallbackAchievements = [
  {
    icon: Award,
    titleBn: "বার্ষিক সেরা প্রতিষ্ঠান সম্মাননা",
    descriptionBn: "শিক্ষার মান, শৃঙ্খলা ও ফলাফলের ধারাবাহিকতার জন্য স্থানীয় পর্যায়ে সম্মাননা লাভ।",
    year: "2025",
    categoryBn: "প্রাতিষ্ঠানিক স্বীকৃতি",
  },
  {
    icon: BadgeCheck,
    titleBn: "হিফজ ও কিরাআত সনদ",
    descriptionBn: "হিফজ সমাপনকারী ও কিরাআতে দক্ষ শিক্ষার্থীদের জন্য সনদ প্রদান।",
    year: "2024",
    categoryBn: "ধর্মীয় শিক্ষা",
  },
  {
    icon: BookMarked,
    titleBn: "শিক্ষক প্রশিক্ষণ অংশগ্রহণ সনদ",
    descriptionBn: "আধুনিক পাঠদান পদ্ধতি ও তারবিয়াতভিত্তিক প্রশিক্ষণে অংশগ্রহণের স্বীকৃতি।",
    year: "2024",
    categoryBn: "শিক্ষক উন্নয়ন",
  },
  {
    icon: Trophy,
    titleBn: "বিভিন্ন শিক্ষা ও সাংস্কৃতিক প্রতিযোগিতায় সাফল্য",
    descriptionBn: "শিক্ষার্থীরা তিলাওয়াত, হামদ-নাত, সাধারণ জ্ঞান ও একাডেমিক প্রতিযোগিতায় কৃতিত্ব অর্জন করেছে।",
    year: "2023",
    categoryBn: "শিক্ষার্থী অর্জন",
  },
] as const;

const Achievements = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<AchievementItem[]>([]);

  useEffect(() => {
    void getAchievements()
      .then((nextItems) => setItems(nextItems))
      .catch(() => setItems([]));
  }, []);

  const highlights = [
    {
      icon: Trophy,
      title: t("সার্বিক শিক্ষা অর্জন", "Overall Academic Excellence"),
      description: t(
        "আমাদের শিক্ষার্থীরা একাডেমিক ফলাফল, কুরআন শিক্ষা ও নৈতিক গঠনে ধারাবাহিক সাফল্য অর্জন করে আসছে।",
        "Our students continue to achieve strong outcomes in academics, Quranic learning, and character development.",
      ),
    },
    {
      icon: FileBadge2,
      title: t("সনদ ও স্বীকৃতি", "Certificates and Recognition"),
      description: t(
        "বিভিন্ন প্রতিযোগিতা, প্রশিক্ষণ ও শিক্ষা কার্যক্রমে অংশগ্রহণের মাধ্যমে প্রতিষ্ঠান ও শিক্ষার্থীরা বিভিন্ন সনদ অর্জন করেছে।",
        "Through competitions, training, and academic programs, the institution and its students have earned various certificates.",
      ),
    },
    {
      icon: Sparkles,
      title: t("ভবিষ্যৎ লক্ষ্য", "Future Growth"),
      description: t(
        "নিয়মিত উন্নয়ন, মানোন্নয়ন ও নতুন নতুন অর্জনের মাধ্যমে আমরা সামনে এগিয়ে যেতে প্রতিশ্রুতিবদ্ধ।",
        "We are committed to moving forward through continuous improvement, quality enhancement, and new milestones.",
      ),
    },
  ];

  const publishedItems = items.length > 0 ? items : fallbackAchievements;

  return (
    <div>
      <section className="relative flex h-52 items-center justify-center overflow-hidden bg-primary md:h-72">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_45%)]" />
        <motion.div {...springIn} className="relative z-10 text-center">
          <h1 className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.4rem, 8vw, 4.2rem)" }}>
            {t("আমাদের অর্জন", "Our Achievements")}
          </h1>
          <p className="mt-3 font-bengali text-base text-primary-foreground/85 md:text-lg">
            {t(
              "প্রতিষ্ঠান, শিক্ষক ও শিক্ষার্থীদের বিভিন্ন সাফল্য, সনদ ও সম্মাননার সংক্ষিপ্ত উপস্থাপনা",
              "A concise presentation of the institution's certificates, recognitions, and milestones",
            )}
          </p>
        </motion.div>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            {...springIn}
            transition={springInDelay(0.04)}
            className="mb-8 grid gap-4 rounded-[2rem] border border-border/60 bg-card/90 p-5 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)] md:grid-cols-3"
          >
            <div className="rounded-3xl bg-primary/5 p-5 text-center">
              <p className="font-bengali text-sm text-muted-foreground">{t("প্রকাশিত অর্জন", "Published achievements")}</p>
              <p className="mt-2 font-bengali text-3xl font-bold text-primary">{publishedItems.length}</p>
            </div>
            <div className="rounded-3xl bg-accent/10 p-5 text-center">
              <p className="font-bengali text-sm text-muted-foreground">{t("মূল বিষয়", "Core focus")}</p>
              <p className="mt-2 font-bengali text-lg font-bold text-foreground">
                {t("সনদ, স্বীকৃতি ও কৃতিত্ব", "Certificates, recognition, and excellence")}
              </p>
            </div>
            <div className="rounded-3xl bg-primary/5 p-5 text-center">
              <p className="font-bengali text-sm text-muted-foreground">{t("আপডেট উৎস", "Update source")}</p>
              <p className="mt-2 font-bengali text-lg font-bold text-foreground">
                {t("অ্যাডমিন ড্যাশবোর্ড", "Admin dashboard")}
              </p>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item, index) => (
              <motion.div key={item.title} {...springIn} transition={springInDelay(index * 0.08)} className="card-institutional p-6">
                <item.icon className="mb-4 h-10 w-10 text-accent" />
                <h2 className="font-bengali text-xl font-bold text-foreground">{item.title}</h2>
                <p className="mt-3 font-bengali leading-7 text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div {...springIn} className="mb-10 text-center">
            <h2 className="font-bengali text-3xl font-bold text-foreground">
              {t("সনদ ও সম্মাননা", "Certificates and Recognition")}
            </h2>
            <p className="mt-3 font-bengali text-muted-foreground">
              {t(
                "নিচে ড্যাশবোর্ড থেকে প্রকাশিত উল্লেখযোগ্য অর্জনগুলো দেখানো হচ্ছে",
                "Below are the notable achievements published from the dashboard",
              )}
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {publishedItems.map((item, index) => (
              <motion.div
                key={`${"id" in item && item.id ? item.id : item.titleBn}-${item.year}-${index}`}
                {...springIn}
                transition={springInDelay(index * 0.08)}
                className="card-institutional flex gap-4 p-6"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                  {"icon" in item ? <item.icon className="h-7 w-7" /> : <Award className="h-7 w-7" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                      {item.categoryBn ? (
                        <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                          {item.categoryBn}
                        </span>
                      ) : null}
                      <h3 className="font-bengali text-xl font-bold text-foreground">{item.titleBn}</h3>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{item.year}</span>
                  </div>
                  <p className="mt-3 font-bengali leading-7 text-muted-foreground">{item.descriptionBn}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Achievements;
