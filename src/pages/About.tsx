import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";

import { springIn, springInDelay } from "@/lib/animations";

const About = () => {
  const { t } = useLanguage();

  const milestones = [
    { year: "2010", title: t("প্রতিষ্ঠা", "Founded"), desc: t("স্বপ্ন ও আদর্শ নিয়ে যাত্রা শুরু", "Started with a dream and vision") },
    { year: "2013", title: t("বালিকা ক্যাম্পাস", "Girls Campus"), desc: t("মেয়েদের জন্য আলাদা ক্যাম্পাস চালু", "Separate campus for girls established") },
    { year: "2017", title: t("১০০০ শিক্ষার্থী", "1000 Students"), desc: t("শিক্ষার্থী সংখ্যা ১০০০ ছাড়িয়ে গেছে", "Student count exceeded 1000") },
    { year: "2020", title: t("ডিজিটাল শিক্ষা", "Digital Education"), desc: t("আধুনিক প্রযুক্তি নির্ভর শিক্ষা ব্যবস্থা", "Technology-driven education system") },
    { year: "2024", title: t("জাতীয় পুরস্কার", "National Award"), desc: t("শ্রেষ্ঠ ইসলামিক শিক্ষা প্রতিষ্ঠান পুরস্কার", "Best Islamic educational institution award") },
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
