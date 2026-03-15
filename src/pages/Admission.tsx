import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";

import { springIn, springInDelay } from "@/lib/animations";

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

            <motion.div {...springIn} transition={springInDelay(0.15)} className="card-institutional p-8">
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-4">{t("ফি কাঠামো", "Fee Structure")}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="font-bengali text-sm font-semibold text-foreground py-2 pr-2">{t("ফি ধরন", "Fee Type")}</th>
                      <th className="font-bengali text-sm font-semibold text-foreground py-2 pr-2">{t("পরিমাণ", "Amount")}</th>
                      <th className="font-bengali text-sm font-semibold text-foreground py-2">{t("মন্তব্য", "Note")}</th>
                    </tr>
                  </thead>
                  <tbody className="font-bengali text-muted-foreground">
                    {[
                      { type: t("মাসিক টিউশন (অনাবাসিক)", "Monthly Tuition (Non-residential)"), amount: "৳৫০০ — ৳২,৫০০", note: t("ক্লাস অনুযায়ী", "Varies by class") },
                      { type: t("মাসিক টিউশন (আবাসিক)", "Monthly Tuition (Residential)"), amount: "৳৪,৫০০ — ৳৬,০০০", note: t("আবাসিক সুবিধাসহ", "With boarding facilities") },
                      { type: t("ভর্তি ফি", "Admission Fee"), amount: "৳৩,০০০", note: t("এককালীন", "One-time") },
                      { type: t("পরীক্ষা ফি", "Exam Fee"), amount: "৳৮০ — ৳৫০০", note: t("প্রতি পরীক্ষায়, ক্লাস অনুযায়ী", "Per exam, varies by class") },
                      { type: t("অন্যান্য", "Others"), amount: t("প্রযোজ্য", "Applicable"), note: t("বই, ড্রেস, পরিবহন", "Books, Dress, Transport") },
                    ].map((fee, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 pr-2">{fee.type}</td>
                        <td className="py-2 pr-2 font-display font-bold text-foreground">{fee.amount}</td>
                        <td className="py-2 text-sm">{fee.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Academic Calendar */}
          <motion.div {...springIn} transition={springInDelay(0.2)} className="card-institutional p-8 mb-16">
            <h2 className="font-bengali text-2xl font-bold text-foreground mb-4">{t("একাডেমিক ক্যালেন্ডার", "Academic Calendar")}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bengali text-lg font-semibold text-foreground mb-3">{t("পরীক্ষা সমূহ", "Examinations")}</h3>
                <ul className="space-y-2 font-bengali text-muted-foreground">
                  {[
                    t("মাসিক পরীক্ষা", "Monthly Exam"),
                    t("ত্রৈমাসিক পরীক্ষা", "Quarterly Exam"),
                    t("বার্ষিক পরীক্ষা", "Annual Exam"),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent mt-1">●</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bengali text-lg font-semibold text-foreground mb-3">{t("বার্ষিক ছুটি", "Annual Holidays")}</h3>
                <ul className="space-y-2 font-bengali text-muted-foreground">
                  {[
                    t("ঈদুল ফিতর", "Eid ul-Fitr"),
                    t("ঈদুল আযহা", "Eid ul-Adha"),
                    t("শীতকালীন ছুটি", "Winter Vacation"),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent mt-1">●</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

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
                transition={{ type: "spring" as const, bounce: 0.3 }}
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
