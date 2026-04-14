import { motion } from "framer-motion";
import { Eye, Quote, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import { springIn, springInDelay } from "@/lib/animations";

const About = () => {
  const { t } = useLanguage();

  const milestones = [
    {
      year: "2013",
      title: t("প্রতিষ্ঠা", "Founded"),
      desc: t("আননূর শিক্ষা পরিবারের যাত্রা শুরু", "The journey of Annoor Education Family began"),
    },
    {
      year: "2013",
      title: t("বালিকা ক্যাম্পাস", "Girls Campus"),
      desc: t("মেয়েদের জন্য আলাদা ক্যাম্পাস চালু", "A separate campus for girls was launched"),
    },
    {
      year: "2017",
      title: t("২৫০+ শিক্ষার্থী", "250+ Students"),
      desc: t("শিক্ষার্থীর সংখ্যা ২৫০+ অতিক্রম করে ", "The student count crossed two hundred and fifty"),
    },
    {
      year: "2020",
      title: t("ডিজিটাল শিক্ষা", "Digital Education"),
      desc: t("আধুনিক প্রযুক্তিনির্ভর শিক্ষা ব্যবস্থার সূচনা", "A technology-supported learning system was introduced"),
    },
    {
      year: "2024",
      title: t("জাতীয় শিক্ষাক্রমে অন্তভূক্তি", "National Recognition"),
      desc: t("ইসলামি শিক্ষায় অবদানের জন্য বিশেষ স্বীকৃতি অর্জন", "Received notable recognition for contribution to Islamic education"),
    },
  ];

  const leadership = [
    {
      name: t("হাফেজ আমানুল্লাহ", "Hafez Amanullah"),
      role: t("প্রধান শিক্ষক", "Principal"),
      phone: "01820-811511",
      quote: t(
        "শিক্ষাই জাতির মেরুদণ্ড। আমরা চাই প্রতিটি শিক্ষার্থী ইসলামি মূল্যবোধের সাথে আধুনিক জ্ঞান অর্জন করুক।",
        "Education is the backbone of a nation. We want every student to gain modern knowledge together with Islamic values.",
      ),
    },
    {
      name: t("মুফতি আব্দুল্লাহ আল মামুন", "Mufti Abdullah Al Mamon"),
      role: t("ম্যানেজার", "Manager"),
      phone: "01312200043, 01581818368",
      quote: t(
        "আমাদের লক্ষ্য সন্তানদের এমনভাবে গড়ে তোলা যাতে তারা দুনিয়া ও আখিরাতে সফল হয়।",
        "Our goal is to shape children in a way that helps them succeed in both this world and the hereafter.",
      ),
    },
  ];

  const methodology = t(
    [
      "পবিত্র কোরআনের সহিহ-শুদ্ধ তিলাওয়াত শিক্ষা প্রদান।",
      "সহজ ও কার্যকরভাবে তাজবীদ শিক্ষা।",
      "নামাজ, সকাল-সন্ধ্যার দোয়া এবং প্রয়োজনীয় মাসনূন আমল শিক্ষা।",
      "আকীদা, ইবাদত, আখলাক ও দৈনন্দিন জীবনের ইসলামী আদর্শভিত্তিক পাঠদান।",
      "সপ্তাহে নির্ধারিত সময়ে ব্যবহারিক আমল ও জরুরি মাসআলা শেখানো।",
      "নির্বাচিত শিক্ষার্থীদের জন্য কুরআনের আয়াত ও সূরার অর্থ ও সংক্ষিপ্ত ব্যাখ্যা।",
      "বিভিন্ন ক্লাসশিট, অনুশীলনী ও পুনরাবৃত্তির ব্যবস্থা।",
      "প্রতিদিন কুরআন বিভাগের শিক্ষার্থীদের জন্য সম্মিলিত মাশক।",
      "শিশু-কিশোরদের আত্মউন্নয়নে নিয়মিত আনন্দ মাহফিল ও অনুপ্রেরণামূলক আয়োজন।",
      "বিভিন্ন উপলক্ষে বিষয়ভিত্তিক আলোচনা ও তারবিয়ত সেশন।",
    ],
    [
      "Correct and proper recitation of the Holy Quran.",
      "Simple and effective Tajweed instruction.",
      "Teaching prayer, morning-evening duas, and essential Sunnah practices.",
      "Lessons grounded in aqeedah, worship, character, and Islamic life values.",
      "Practical sessions for core acts of worship and essential masail.",
      "Selected Quran translations and brief explanations for chosen students.",
      "Class sheets, practice materials, and revision routines.",
      "Daily group practice for Quran department students.",
      "Regular motivational and joyful gatherings for children and teens.",
      "Topic-based discussions and tarbiyah sessions on important occasions.",
    ],
  );

  return (
    <div>
      <section className="relative h-72 overflow-hidden md:h-96">
        <img src={heroImg} alt="Campus" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            {...springIn}
            className="font-bengali text-center text-primary-foreground"
            style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}
          >
            {t("আমাদের সম্পর্কে", "About Us")}
          </motion.h1>
        </div>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#064E3B]">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mb-4 font-bengali text-xl font-semibold text-[#064E3B]">
                {t("আমাদের লক্ষ্য", "Our Mission")}
              </h2>
              <p className="font-bengali text-lg leading-8 text-muted-foreground">
                {t(
                  "ইসলামি মূল্যবোধ ও আধুনিক শিক্ষার এক অনন্য সমন্বয়ে প্রতিটি শিক্ষার্থীকে নৈতিকতা সম্পন্ন, দক্ষ এবং একজন আদর্শ মানুষ হিসেবে গড়ে তোলা।",
                  "To shape every student into a principled, capable, and ideal human being through a unique blend of Islamic values and modern education.",
                )}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#064E3B]">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="mb-4 font-bengali text-xl font-semibold text-[#064E3B]">
                {t("আমাদের দৃষ্টিভঙ্গি", "Our Vision")}
              </h2>
              <p className="font-bengali text-lg leading-8 text-muted-foreground">
                {t(
                  "ইসলামি ও নৈতিক শিক্ষার প্রসারে একটি বিশ্বস্ত, মানসম্মত এবং অনুকরণীয় শিক্ষা প্রতিষ্ঠান হিসেবে পরিচিতি লাভ করা।",
                  "To become a trusted, high-quality, and exemplary institution in promoting Islamic and moral education.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.h2
            {...springIn}
            className="mb-10 text-center font-bengali font-bold text-foreground"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3rem)" }}
          >
            {t("শিক্ষা পদ্ধতি", "Teaching Methodology")}
          </motion.h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {methodology.map((point, index) => (
              <motion.div
                key={`${index}-${point}`}
                {...springIn}
                transition={springInDelay(index * 0.05)}
                className="flex items-start gap-3 rounded-xl bg-card p-4"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="font-bengali text-sm leading-relaxed text-muted-foreground">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.h2
            {...springIn}
            className="mb-12 text-center font-bengali font-bold text-foreground"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3rem)" }}
          >
            {t("নেতৃত্ব", "Leadership")}
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-2">
            {leadership.map((leader, index) => (
              <motion.div key={leader.name} {...springIn} transition={springInDelay(index * 0.15)} className="card-institutional p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-emerald-50 text-sm font-semibold text-[#064E3B]">
                      {t("ছবি", "Photo")}
                    </div>
                    <Quote className="h-7 w-7 shrink-0 text-accent" />
                  </div>
                  <p className="font-bengali italic leading-relaxed text-muted-foreground">{leader.quote}</p>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <h3 className="font-bengali text-xl font-bold text-foreground">{leader.name}</h3>
                  <p className="font-bengali font-medium text-accent">{leader.role}</p>
                  <p className="mt-1 font-bengali text-sm text-muted-foreground">{leader.phone}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.h2
            {...springIn}
            className="mb-12 text-center font-bengali font-bold text-foreground"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3rem)" }}
          >
            {t("আমাদের যাত্রা", "Our Journey")}
          </motion.h2>
          <div className="relative">
            <div className="absolute left-6 top-0 h-full w-1.5 -translate-x-1/2 rounded-full bg-emerald-800/70 md:left-1/2" />
            <div className="space-y-12">
              {milestones.map((item, index) => (
                <motion.div key={`${item.year}-${item.title}`} {...springIn} transition={springInDelay(index * 0.1)} className={`relative flex items-center gap-6 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="absolute left-6 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-emerald-800 bg-white text-sm font-bold text-emerald-800 md:left-1/2">
                    {item.year}
                  </div>
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="card-institutional p-6">
                      <h3 className="font-bengali text-lg font-bold text-foreground">{item.title}</h3>
                      <p className="mt-1 font-bengali text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
