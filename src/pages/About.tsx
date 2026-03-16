import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import { Quote } from "lucide-react";

import { springIn, springInDelay } from "@/lib/animations";

const About = () => {
  const { t } = useLanguage();

  const milestones = [
    { year: "2013", title: t("প্রতিষ্ঠা", "Founded"), desc: t("আননূর শিক্ষা পরিবার যাত্রা শুরু", "Annoor Education Family journey began") },
    { year: "2013", title: t("বালিকা ক্যাম্পাস", "Girls Campus"), desc: t("মেয়েদের জন্য আলাদা ক্যাম্পাস চালু", "Separate campus for girls established") },
    { year: "2017", title: t("১০০০ শিক্ষার্থী", "1000 Students"), desc: t("শিক্ষার্থী সংখ্যা ১০০০ ছাড়িয়ে গেছে", "Student count exceeded 1000") },
    { year: "2020", title: t("ডিজিটাল শিক্ষা", "Digital Education"), desc: t("আধুনিক প্রযুক্তি নির্ভর শিক্ষা ব্যবস্থা", "Technology-driven education system") },
    { year: "2024", title: t("জাতীয় পুরস্কার", "National Award"), desc: t("শ্রেষ্ঠ ইসলামিক শিক্ষা প্রতিষ্ঠান পুরস্কার", "Best Islamic educational institution award") },
  ];

  const leadership = [
    {
      name: t("হাফেজ আমানুল্লাহ", "Hafez Amanullah"),
      role: t("প্রধান শিক্ষক", "Principal"),
      phone: "01820-811511",
      quote: t("\"শিক্ষাই জাতির মেরুদণ্ড। আমরা চাই প্রতিটি শিক্ষার্থী যেন ইসলামিক মূল্যবোধের সাথে আধুনিক জ্ঞান অর্জন করে।\"", "\"Education is the backbone of a nation. We want every student to acquire modern knowledge along with Islamic values.\""),
      quoteEn: "Education is the backbone of a nation. We want every student to acquire modern knowledge along with Islamic values.",
    },
    {
      name: t("মুফতি আব্দুল্লাহ আল মামুন", "Mufti Abdullah Al Mamon"),
      role: t("ম্যানেজার", "Manager"),
      phone: "01312200043, 01581818368",
      quote: t("\"আমাদের লক্ষ্য সন্তানদের এমনভাবে গড়ে তোলা যাতে তারা দুনিয়া ও আখিরাতে সফল হয়।\"", "\"Our goal is to shape children in such a way that they succeed in both this world and the hereafter.\""),
      quoteEn: "Our goal is to shape children in such a way that they succeed in both this world and the hereafter.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img src={heroImg} alt="Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1 {...springIn} className="font-bengali text-primary-foreground text-center" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
            {t("আমাদের সম্পর্কে", "About Us")}
          </motion.h1>
        </div>
        <WaveDivider className="absolute bottom-0" />
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: t("আমাদের লক্ষ্য", "Our Mission"), desc: t("ইসলামিক মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে প্রতিটি শিক্ষার্থীকে একজন আদর্শ মানুষ হিসেবে গড়ে তোলা।", "To develop each student as an ideal human being through the integration of Islamic values and modern education.") },
              { title: t("আমাদের দৃষ্টিভঙ্গি", "Our Vision"), desc: t("ইসলামিক শিক্ষায় বিশ্বমানের একটি প্রতিষ্ঠান হিসেবে পরিচিতি লাভ করা।", "To be recognized as a world-class institution in Islamic education.") },
            ].map((item, i) => (
              <motion.div key={i} {...springIn} transition={springInDelay(i * 0.15)} className="card-institutional p-8">
                <h2 className="font-bengali text-2xl font-bold text-foreground mb-4">{item.title}</h2>
                <p className="font-bengali text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2 {...springIn} className="font-bengali text-center text-foreground mb-12" style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)" }}>
            {t("নেতৃত্ব", "Leadership")}
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {leadership.map((leader, i) => (
              <motion.div
                key={i}
                {...springIn}
                transition={springInDelay(i * 0.15)}
                className="card-institutional p-8"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Quote className="w-8 h-8 text-accent flex-shrink-0" />
                  <p className="font-bengali text-muted-foreground italic leading-relaxed">
                    {leader.quote}
                  </p>
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="font-bengali text-xl font-bold text-foreground">{leader.name}</h3>
                  <p className="font-bengali text-accent font-medium">{leader.role}</p>
                  <p className="font-bengali text-sm text-muted-foreground mt-1">{leader.phone}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            {...springIn}
            className="font-bengali text-center text-foreground mb-10"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            {t("শিক্ষা পদ্ধতি", "Teaching Methodology")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t(
              [
                "পবিত্র কোরআনের সহীহ-শুদ্ধ তিলাওয়াত শিক্ষাদান।",
                "সহজ সরলভাবে তাজবীদ শিক্ষাদান।",
                "নামাজের দোয়া, নামাজের পরবর্তী দোয়া, সকাল-সন্ধ্যার দোয়াসহ বিভিন্ন পঠিতব্য মাসনুন দোয়াসমূহ শিক্ষাদান।",
                "আক্বিদা, ইবাদত, মুয়ামালাত ও আখলাকের লক্ষ্যে কুরআন হাদিস ও সালাফের (পূর্বসূরীদের) নির্ভরযোগ্য বিভিন্ন কিতাব থেকে নির্বাচিত অংশের তা'লিম ও আলোচনা।",
                "সপ্তাহে একদিন আমলী, নামাজ, জরুরী মাসায়েল হাতে কলমে শিক্ষাদান।",
                "নির্বাচিত শিক্ষার্থীদেরকে সপ্তাহে একদিন কুরআন মাজীদ থেকে ঈমান-আক্বিদা, আদব-কায়দা ও আখলাক সংক্রান্ত নির্বাচিত কিছু সুরা ও আয়াতের তরজমা ও সংক্ষিপ্ত ব্যাখ্যা পাঠদান।",
                "বিভিন্ন ক্লাসশীট প্রদান।",
                "প্রতিদিন কুরআন মাজীদ বিভাগের শিক্ষার্থীদের জন্য সম্মিলিত মাশক।",
                "শিশু-কিশোরদের জন্য আত্মউন্নয়নে মাসিক আনন্দ মাহফিলের আয়োজন।",
                "বিভিন্ন উপলক্ষকে কেন্দ্র করে বিষয় ভিত্তিক আলোচনা।"
              ],
              [
                "Teaching the correct and proper recitation (Tilawah) of the Holy Quran.",
                "Teaching Tajweed (rules of Quranic recitation) in a simple and easy manner.",
                "Teaching Masnoon supplications including prayers during Salah, post-Salah duas, and morning & evening adhkar.",
                "Ta'leem and discussion of selected passages from the Quran, Hadith, and reliable classical works of the Salaf — focusing on Aqeedah (belief), Ibadah (worship), Mu'amalat (dealings), and Akhlaq (character).",
                "Once a week — practical hands-on training in Amali Salah (performing prayer correctly) and essential Islamic rulings (Masail).",
                "Once a week for selected students — translation and brief explanation of chosen Surahs and Ayahs related to faith, etiquette, and character from the Holy Quran.",
                "Regular class handouts and worksheets provided to students.",
                "Daily group Mashq (Quran recitation practice) for all Quran department students.",
                "Monthly Ananda Mahfil (joyful gathering) organized for children and young students focused on self-improvement.",
                "Topic-based discussions and sessions held on various occasions and events throughout the year."
              ]
            ).map((point, i) => (
              <motion.div
                key={i}
                {...springIn}
                transition={springInDelay(i * 0.05)}
                className="flex items-start gap-3 p-4 bg-card rounded-xl"
              >
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="font-bengali text-muted-foreground text-sm leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2 {...springIn} className="font-bengali text-center text-foreground mb-12" style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}>
            {t("আমাদের যাত্রা", "Our Journey")}
          </motion.h2>
          <div className="relative">
            {/* Vine line */}
            <svg className="absolute left-6 md:left-1/2 top-0 h-full w-8 -translate-x-1/2" viewBox="0 0 32 100" preserveAspectRatio="none">
              <path d="M16,0 C20,20 12,30 16,50 C20,70 12,80 16,100" stroke="hsl(165, 85%, 15%)" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <motion.div key={i} {...springIn} transition={springInDelay(i * 0.1)} className={`relative flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-accent border-4 border-primary -translate-x-1/2 z-10" />
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="card-institutional p-6">
                      <span className="text-accent font-display font-bold text-lg">{m.year}</span>
                      <h3 className="font-bengali text-lg font-bold text-foreground mt-1">{m.title}</h3>
                      <p className="font-bengali text-muted-foreground text-sm mt-1">{m.desc}</p>
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
