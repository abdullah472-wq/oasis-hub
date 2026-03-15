import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";

import { springIn, springInDelay } from "@/lib/animations";

const teachers = {
  boys: [
    { name: "মোঃ আব্দুল করিম", nameEn: "Md. Abdul Karim", subject: "আরবি", subjectEn: "Arabic", qualification: "M.A. in Arabic" },
    { name: "মোঃ হাসান আলী", nameEn: "Md. Hasan Ali", subject: "গণিত", subjectEn: "Mathematics", qualification: "M.Sc. in Mathematics" },
    { name: "মোঃ রাশেদ ইসলাম", nameEn: "Md. Rashed Islam", subject: "বিজ্ঞান", subjectEn: "Science", qualification: "M.Sc. in Physics" },
    { name: "মোঃ তারেক আহমেদ", nameEn: "Md. Tarek Ahmed", subject: "ইংরেজি", subjectEn: "English", qualification: "M.A. in English" },
    { name: "হাফেজ মোঃ ইউসুফ", nameEn: "Hafez Md. Yusuf", subject: "কুরআন", subjectEn: "Quran", qualification: "Hafiz, Qari" },
    { name: "মোঃ ফারুক হোসেন", nameEn: "Md. Faruk Hossain", subject: "বাংলা", subjectEn: "Bengali", qualification: "M.A. in Bengali" },
  ],
  girls: [
    { name: "ফাতিমা খাতুন", nameEn: "Fatima Khatun", subject: "আরবি", subjectEn: "Arabic", qualification: "M.A. in Arabic" },
    { name: "আয়েশা সিদ্দিকা", nameEn: "Ayesha Siddika", subject: "গণিত", subjectEn: "Mathematics", qualification: "M.Sc. in Mathematics" },
    { name: "মারিয়াম আক্তার", nameEn: "Mariyam Akter", subject: "বিজ্ঞান", subjectEn: "Science", qualification: "M.Sc. in Chemistry" },
    { name: "হাফেজা রুকাইয়া", nameEn: "Hafeza Rukaiya", subject: "কুরআন", subjectEn: "Quran", qualification: "Hafiza, Qaria" },
    { name: "নাজমা বেগম", nameEn: "Nazma Begum", subject: "ইংরেজি", subjectEn: "English", qualification: "M.A. in English" },
    { name: "সালমা আক্তার", nameEn: "Salma Akter", subject: "বাংলা", subjectEn: "Bengali", qualification: "M.A. in Bengali" },
  ],
};

const Teachers = () => {
  const { t, lang } = useLanguage();
  const [campus, setCampus] = useState<"boys" | "girls">("boys");

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("শিক্ষকবৃন্দ", "Our Teachers")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Campus toggle */}
          <div className="flex justify-center gap-4 mb-12">
            {(["boys", "girls"] as const).map((c) => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, y: 4 }}
                onClick={() => setCampus(c)}
                className={`font-bengali ${campus === c ? "squishy-button" : "squishy-button-outline"}`}
              >
                {c === "boys" ? t("বালক ক্যাম্পাস", "Boys Campus") : t("বালিকা ক্যাম্পাস", "Girls Campus")}
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {teachers[campus].map((teacher, i) => (
              <motion.div
                key={`${campus}-${i}`}
                {...springIn}
                transition={{ ...springIn.transition, delay: i * 0.08 }}
                className="card-institutional p-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-secondary border-4 border-accent mx-auto mb-4 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-foreground">
                    {(lang === "bn" ? teacher.name : teacher.nameEn).charAt(0)}
                  </span>
                </div>
                <h3 className="font-bengali text-lg font-bold text-foreground">
                  {lang === "bn" ? teacher.name : teacher.nameEn}
                </h3>
                <p className="text-accent font-semibold text-sm mt-1">
                  {lang === "bn" ? teacher.subject : teacher.subjectEn}
                </p>
                <p className="text-muted-foreground text-sm mt-1">{teacher.qualification}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Teachers;
