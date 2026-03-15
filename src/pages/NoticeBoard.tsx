import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";

import { springIn, springInDelay } from "@/lib/animations";

const allNotices = [
  { id: 1, date: "2026-03-15", category: "exam", title: "বার্ষিক পরীক্ষার সময়সূচি প্রকাশিত", titleEn: "Annual Exam Schedule Published" },
  { id: 2, date: "2026-03-10", category: "holiday", title: "বসন্তকালীন ছুটির নোটিশ", titleEn: "Spring Break Notice" },
  { id: 3, date: "2026-03-05", category: "meeting", title: "অভিভাবক সভার তারিখ নির্ধারিত", titleEn: "Parent Meeting Date Fixed" },
  { id: 4, date: "2026-02-28", category: "admission", title: "২০২৬ শিক্ষাবর্ষের ভর্তি চলছে", titleEn: "Admission Open for 2026" },
  { id: 5, date: "2026-02-20", category: "event", title: "বার্ষিক ক্রীড়া প্রতিযোগিতা", titleEn: "Annual Sports Competition" },
  { id: 6, date: "2026-02-15", category: "exam", title: "মডেল টেস্ট পরীক্ষার ফলাফল", titleEn: "Model Test Results" },
  { id: 7, date: "2026-02-01", category: "event", title: "মিলাদুন্নবী উদযাপন", titleEn: "Milad-un-Nabi Celebration" },
  { id: 8, date: "2026-01-20", category: "holiday", title: "শীতকালীন ছুটির বিজ্ঞপ্তি", titleEn: "Winter Break Announcement" },
];

const categories = [
  { value: "all", label: "সকল", labelEn: "All" },
  { value: "exam", label: "পরীক্ষা", labelEn: "Exam" },
  { value: "holiday", label: "ছুটি", labelEn: "Holiday" },
  { value: "admission", label: "ভর্তি", labelEn: "Admission" },
  { value: "event", label: "অনুষ্ঠান", labelEn: "Event" },
  { value: "meeting", label: "সভা", labelEn: "Meeting" },
];

const NoticeBoard = () => {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = allNotices.filter((n) => {
    const matchCat = category === "all" || n.category === category;
    const matchSearch = (lang === "bn" ? n.title : n.titleEn).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("নোটিশ বোর্ড", "Notice Board")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Search */}
          <motion.div {...springIn} className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder={t("নোটিশ খুঁজুন...", "Search notices...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[2rem] bg-card border border-border font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </motion.div>

          {/* Categories */}
          <motion.div {...springIn} className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-full font-bengali text-sm font-medium transition-all ${
                  category === cat.value
                    ? "bg-primary text-primary-foreground shadow-[0_4px_0_0_#042f24]"
                    : "bg-secondary text-foreground hover:bg-accent/20"
                }`}
              >
                {lang === "bn" ? cat.label : cat.labelEn}
              </button>
            ))}
          </motion.div>

          {/* Notice cards (sticky note style) */}
          <div className="space-y-4">
            {filtered.map((notice, i) => (
              <motion.div
                key={notice.id}
                {...springIn}
                transition={{ ...springIn.transition, delay: i * 0.06 }}
                className="card-institutional p-6 border-l-4 border-accent cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bengali text-lg font-bold text-foreground">
                      {lang === "bn" ? notice.title : notice.titleEn}
                    </h3>
                    <span className="text-xs font-semibold text-accent mt-2 inline-block bg-accent/10 px-3 py-1 rounded-full">
                      {lang === "bn"
                        ? categories.find((c) => c.value === notice.category)?.label
                        : categories.find((c) => c.value === notice.category)?.labelEn}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground shrink-0">{notice.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NoticeBoard;
