import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";

import { springIn, springInDelay } from "@/lib/animations";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("যোগাযোগ", "Contact Us")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Map & addresses */}
            <motion.div {...springIn} className="space-y-6">
              <div className="rounded-[2rem] overflow-hidden h-64 md:h-80 bg-secondary">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233667.82239144022!2d90.25487055!3d23.7808405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563962a294a7!2sDhaka!5e0!3m2!1sen!2sbd!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Location Map"
                />
              </div>

              {[
                { campus: t("বালক ক্যাম্পাস", "Boys Campus"), address: t("উত্তরা, ঢাকা-১২৩০", "Uttara, Dhaka-1230"), phone: "+880 1XXX-XXXXXX" },
                { campus: t("বালিকা ক্যাম্পাস", "Girls Campus"), address: t("মিরপুর, ঢাকা-১২১৬", "Mirpur, Dhaka-1216"), phone: "+880 1XXX-XXXXXX" },
              ].map((c, i) => (
                <div key={i} className="card-institutional p-6">
                  <h3 className="font-bengali text-lg font-bold text-foreground mb-2">{c.campus}</h3>
                  <p className="font-bengali text-muted-foreground">📍 {c.address}</p>
                  <p className="font-bengali text-muted-foreground">📞 {c.phone}</p>
                </div>
              ))}
            </motion.div>

            {/* Contact form */}
            <motion.div {...springIn} transition={{ ...springIn.transition, delay: 0.15 }} className="card-institutional p-8">
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-6">{t("আমাদের লিখুন", "Write to Us")}</h2>
              <div className="space-y-4">
                {[t("আপনার নাম", "Your Name"), t("ইমেইল", "Email"), t("মোবাইল", "Mobile")].map((label) => (
                  <div key={label}>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{label}</label>
                    <input className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                ))}
                <div>
                  <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{t("বার্তা", "Message")}</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 4 }}
                  className="squishy-button font-bengali w-full"
                >
                  {t("পাঠান", "Send")}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
