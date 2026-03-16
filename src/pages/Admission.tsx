import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { Link } from "react-router-dom";

import { springIn, springInDelay } from "@/lib/animations";

const Admission = () => {
  const { t } = useLanguage();

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

          {/* Apply Button */}
          <motion.div {...springIn} className="card-institutional p-8 text-center">
            <h2 className="font-bengali text-2xl font-bold text-foreground mb-4">{t("অনলাইনে ভর্তির জন্য আবেদন করুন", "Apply Online for Admission")}</h2>
            <p className="font-bengali text-muted-foreground mb-6">
              {t("অনলাইন ভর্তি ফর্ম পূরণ করে সহজেই আবেদন করুন।", "Easily apply by filling out the online admission form.")}
            </p>
            <Link to="/admission-form">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="squishy-button font-bengali px-8 py-3"
              >
                {t("অনলাইন ভর্তি ফর্ম", "Online Admission Form")}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Admission;
