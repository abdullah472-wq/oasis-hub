import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";

const springIn = {
  initial: { y: 40, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true },
  transition: { type: "spring", bounce: 0.3 },
};

const Ramadan = () => {
  const { t } = useLanguage();

  // Simulated data
  const daysRemaining = 12;
  const iftarGoal = 500;
  const iftarSponsored = 340;
  const progressPercent = Math.round((iftarSponsored / iftarGoal) * 100);

  return (
    <div className="bg-accent/5">
      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary via-forest-deep to-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1440 400" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,200 C360,80 720,320 1080,160 C1260,80 1440,200 1440,200 V400 H0 Z" fill="hsl(45, 70%, 50%)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div {...springIn}>
            <div className="text-6xl md:text-8xl mb-4">🌙</div>
            <h1 className="font-bengali text-primary-foreground mb-4" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
              {t("রমজান মুবারক", "Ramadan Mubarak")}
            </h1>
            <p className="font-bengali text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              {t(
                "ইফতার স্পন্সরশিপ প্রোগ্রামে অংশ নিন এবং পুরস্কৃত হন।",
                "Join our Iftar sponsorship program and be rewarded."
              )}
            </p>

            {/* Days remaining counter */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block bg-accent text-foreground rounded-[2rem] px-8 py-4 shadow-lg"
            >
              <div className="text-sm font-bengali font-semibold">{t("বাকি আছে", "Days Remaining")}</div>
              <div className="text-4xl font-display font-bold">{daysRemaining}</div>
              <div className="text-sm font-bengali">{t("দিন", "days")}</div>
            </motion.div>
          </motion.div>
        </div>
        <WaveDivider className="absolute bottom-0" color="fill-[hsl(40,30%,98%)]" />
      </section>

      {/* Iftar Progress */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...springIn} className="card-institutional p-8 text-center">
            <h2 className="font-bengali text-2xl font-bold text-foreground mb-2">
              {t("ইফতার স্পন্সরশিপ লক্ষ্যমাত্রা", "Iftar Sponsorship Target")}
            </h2>
            <p className="font-bengali text-muted-foreground mb-6">
              {t(`${iftarSponsored}টি ইফতার স্পন্সর হয়েছে ${iftarGoal}টির মধ্যে`, `${iftarSponsored} iftars sponsored out of ${iftarGoal}`)}
            </p>

            <div className="w-full h-6 bg-secondary rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progressPercent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
            <span className="font-display text-2xl font-bold text-accent">{progressPercent}%</span>
          </motion.div>
        </div>
      </section>

      {/* Sponsor Info & Contact */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...springIn} className="card-institutional p-8 border-2 border-accent">
              <h3 className="font-bengali text-xl font-bold text-foreground mb-4">
                {t("ইফতার স্পন্সর করুন", "Sponsor an Iftar")}
              </h3>
              <div className="space-y-4 font-bengali text-muted-foreground">
                <p>{t("একটি ইফতারের খরচ মাত্র ৳৫০০", "One iftar costs only ৳500")}</p>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-secondary rounded-2xl">
                    <span>bKash</span>
                    <span className="font-bold text-foreground">01XXX-XXXXXX</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary rounded-2xl">
                    <span>Nagad</span>
                    <span className="font-bold text-foreground">01XXX-XXXXXX</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary rounded-2xl">
                    <span>{t("ব্যাংক", "Bank")}</span>
                    <span className="font-bold text-foreground">XXXX-XXXX-XXXX</span>
                  </div>
                </div>
              </div>

              <motion.a
                href="https://wa.me/880XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, y: 4 }}
                className="squishy-button-gold font-bengali w-full mt-6 flex items-center justify-center gap-2"
              >
                💬 {t("হোয়াটসঅ্যাপে যোগাযোগ", "Contact on WhatsApp")}
              </motion.a>
            </motion.div>

            <motion.div {...springIn} transition={{ ...springIn.transition, delay: 0.15 }} className="card-institutional p-8">
              <h3 className="font-bengali text-xl font-bold text-foreground mb-4">
                {t("স্পন্সরশিপ ফর্ম", "Sponsorship Form")}
              </h3>
              <div className="space-y-4">
                {[t("আপনার নাম", "Your Name"), t("মোবাইল নম্বর", "Mobile Number"), t("ইফতার সংখ্যা", "Number of Iftars")].map((label) => (
                  <div key={label}>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{label}</label>
                    <input className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                ))}
                <div>
                  <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{t("বার্তা", "Message")}</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 4 }}
                  className="squishy-button font-bengali w-full"
                >
                  {t("জমা দিন", "Submit")}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wave bottom */}
      <WaveDivider color="fill-primary" />
    </div>
  );
};

export default Ramadan;
