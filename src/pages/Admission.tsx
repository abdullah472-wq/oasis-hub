import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";

const springIn = {
  initial: { y: 40, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true },
  transition: { type: "spring", bounce: 0.3 },
};

const steps = [
  { key: "info", titleBn: "ব্যক্তিগত তথ্য", titleEn: "Personal Info" },
  { key: "academic", titleBn: "শিক্ষাগত তথ্য", titleEn: "Academic Info" },
  { key: "guardian", titleBn: "অভিভাবক তথ্য", titleEn: "Guardian Info" },
  { key: "confirm", titleBn: "নিশ্চিতকরণ", titleEn: "Confirmation" },
];

const Admission = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("ভর্তি তথ্য", "Admission")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      {/* Rules & Fees */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div {...springIn} className="card-institutional p-8">
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-4">{t("ভর্তির নিয়মাবলী", "Admission Rules")}</h2>
              <ul className="space-y-3 font-bengali text-muted-foreground">
                {[
                  t("শিক্ষার্থীকে অবশ্যই ভর্তি পরীক্ষায় উত্তীর্ণ হতে হবে", "Student must pass the admission test"),
                  t("পূর্ববর্তী শ্রেণির সনদপত্র প্রয়োজন", "Previous class certificate required"),
                  t("২ কপি পাসপোর্ট সাইজ ছবি", "2 passport size photos"),
                  t("জন্ম নিবন্ধন সনদের কপি", "Copy of birth certificate"),
                  t("অভিভাবকের জাতীয় পরিচয়পত্রের কপি", "Copy of guardian's NID"),
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent mt-1">●</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...springIn} transition={{ ...springIn.transition, delay: 0.15 }} className="card-institutional p-8">
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-4">{t("ফি কাঠামো", "Fee Structure")}</h2>
              <div className="space-y-3">
                {[
                  { label: t("ভর্তি ফি", "Admission Fee"), amount: "৳ 5,000" },
                  { label: t("মাসিক বেতন", "Monthly Tuition"), amount: "৳ 2,500" },
                  { label: t("পরীক্ষা ফি (বার্ষিক)", "Exam Fee (Annual)"), amount: "৳ 1,500" },
                  { label: t("উন্নয়ন ফি", "Development Fee"), amount: "৳ 2,000" },
                ].map((fee, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-bengali text-muted-foreground">{fee.label}</span>
                    <span className="font-display font-bold text-foreground">{fee.amount}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Multi-step form */}
          <motion.div {...springIn} className="card-institutional p-8">
            <h2 className="font-bengali text-2xl font-bold text-foreground mb-6">{t("অনলাইন ভর্তি ফর্ম", "Online Admission Form")}</h2>

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && <div className={`w-8 md:w-16 h-1 mx-1 rounded-full ${i < step ? "bg-primary" : "bg-secondary"}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.3 }}
              >
                {step === 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[t("শিক্ষার্থীর নাম", "Student Name"), t("জন্ম তারিখ", "Date of Birth"), t("শ্রেণি", "Class"), t("ক্যাম্পাস", "Campus")].map((label) => (
                      <div key={label}>
                        <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{label}</label>
                        <input className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[t("পূর্ববর্তী প্রতিষ্ঠান", "Previous Institution"), t("পূর্ববর্তী শ্রেণি", "Previous Class"), t("জিপিএ/ফলাফল", "GPA/Result"), t("বোর্ড/শিক্ষাবোর্ড", "Board")].map((label) => (
                      <div key={label}>
                        <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{label}</label>
                        <input className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[t("অভিভাবকের নাম", "Guardian Name"), t("সম্পর্ক", "Relation"), t("মোবাইল নম্বর", "Mobile Number"), t("ঠিকানা", "Address")].map((label) => (
                      <div key={label}>
                        <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{label}</label>
                        <input className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    ))}
                  </div>
                )}
                {step === 3 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="font-bengali text-xl font-bold text-foreground mb-2">{t("তথ্য যাচাই করুন", "Review Your Information")}</h3>
                    <p className="font-bengali text-muted-foreground">{t("সব তথ্য সঠিক থাকলে সাবমিট করুন।", "Submit if all information is correct.")}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, y: 4 }}
                onClick={() => setStep(Math.max(0, step - 1))}
                className={`squishy-button-outline font-bengali ${step === 0 ? "opacity-50 pointer-events-none" : ""}`}
              >
                {t("পূর্ববর্তী", "Previous")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, y: 4 }}
                onClick={() => step < 3 ? setStep(step + 1) : null}
                className="squishy-button font-bengali"
              >
                {step === 3 ? t("সাবমিট করুন", "Submit") : t("পরবর্তী", "Next")}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Admission;
