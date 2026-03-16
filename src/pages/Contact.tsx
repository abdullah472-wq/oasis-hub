import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { MapPin, Phone, Mail, Send, CheckCircle } from "lucide-react";

import { springIn, springInDelay } from "@/lib/animations";

const Contact = () => {
  const { t, lang } = useLanguage();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const campuses = [
    {
      name: t("বালক ক্যাম্পাস", "Boys Campus"),
      nameEn: "Boys Branch",
      address: t("মেইন রোড, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর", "Main Road, Kapasia Bazar, Kapasia, Gazipur"),
      addressEn: "Main Road, Kapasia Bazar, Kapasia, Gazipur",
      phone: "+880 1581818368",
    },
    {
      name: t("বালিকা ক্যাম্পাস", "Girls Campus"),
      nameEn: "Girls Branch",
      address: t("বাশতলা মোড়, কলেজ রোড, কাপাসিয়া, গাজীপুর", "Bashtola More, College Road, Kapasia, Gazipur"),
      addressEn: "Bashtola More, College Road, Kapasia, Gazipur",
      phone: "+880 1820811511",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage: ${formData.message}`;
    const whatsappUrl = `https://wa.me/8801820811511?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setSubmitted(true);
  };

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
          {/* Campus Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {campuses.map((campus, i) => (
              <motion.div
                key={i}
                {...springIn}
                transition={springInDelay(i * 0.1)}
                className="card-institutional p-6"
              >
                <h3 className="font-bengali text-xl font-bold text-foreground mb-4">{campus.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="font-bengali text-muted-foreground">
                      {lang === "bn" ? campus.address : campus.addressEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href={`tel:${campus.phone}`} className="font-bengali text-primary font-medium hover:underline">
                      {campus.phone}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Map */}
            <motion.div {...springIn} className="space-y-6">
              <div className="rounded-[2rem] overflow-hidden h-64 md:h-80 bg-secondary">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3647.301768800869!2d90.25656731558386!3d23.99380098055383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375ae78e58d2d58d%3A0x5a4d4f4f4f4f4f4f!2sKapasia%2C%20Gazipur!5e0!3m2!1sen!2sbd!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Location Map"
                />
              </div>

              {/* General Contact */}
              <div className="card-institutional p-6">
                <h3 className="font-bengali text-lg font-bold text-foreground mb-4">{t("সাধারণ যোগাযোগ", "General Contact")}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href="mailto:abdullahalmamon472@gmail.com" className="font-bengali text-muted-foreground hover:text-primary">
                      abdullahalmamon472@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href="tel:+8801820811511" className="font-bengali text-primary font-medium hover:underline">
                      +880 1820811511
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.div {...springIn} transition={springInDelay(0.15)} className="card-institutional p-8">
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-6">{t("আমাদের লিখুন", "Write to Us")}</h2>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="font-bengali text-lg text-foreground">{t("মেসেজ পাঠানো হয়েছে!", "Message sent!")}</p>
                  <p className="font-bengali text-muted-foreground mt-2">{t("আমরা শীঘ্রই যোগাযোগ করব", "We will contact you soon")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{t("আপনার নাম", "Your Name")} *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{t("ইমেইল", "Email")}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{t("মোবাইল", "Mobile")} *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{t("বার্তা", "Message")} *</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, y: 4 }}
                    className="squishy-button font-bengali w-full flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {t("হোয়াটসঅ্যাপে পাঠান", "Send via WhatsApp")}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
