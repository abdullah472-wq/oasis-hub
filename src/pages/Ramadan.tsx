import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { Calendar, Phone, Send, CheckCircle, Users } from "lucide-react";

import { springIn, springInDelay } from "@/lib/animations";
import { getRamadanSponsors, addRamadanSponsor, RamadanSponsor } from "@/lib/ramadanSponsors";

const Ramadan = () => {
  const { t, lang } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPercent, setSelectedPercent] = useState<number>(25);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sponsors, setSponsors] = useState<RamadanSponsor[]>([]);

  const TOTAL_DAYS = 25;
  const COST_PER_DAY = 5000;
  const MAX_SPONSOR_DAY = 25;

  useEffect(() => {
    getRamadanSponsors()
      .then(setSponsors)
      .catch(console.error);
  }, []);

  // Calculate sponsorship percentage for each day
  const getSponsorshipPercent = (day: number) => {
    let totalPercent = 0;
    sponsors.forEach(s => {
      if (s.day === day) {
        totalPercent += s.percentage;
      }
    });
    return Math.min(totalPercent, 100);
  };

  const getSponsorsForDay = (day: number) => {
    return sponsors.filter(s => s.day === day);
  };

  const isDayAvailable = (day: number) => {
    return day <= MAX_SPONSOR_DAY && getSponsorshipPercent(day) < 100;
  };

  const calculateCost = () => {
    return (selectedPercent / 100) * COST_PER_DAY;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    
    setLoading(true);
    try {
      await addRamadanSponsor({
        name: sponsorName,
        phone: sponsorPhone,
        day: selectedDay,
        percentage: selectedPercent,
        amount: calculateCost(),
        comment,
        studentId,
      });
      
      const updatedSponsors = await getRamadanSponsors();
      setSponsors(updatedSponsors);
      
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting sponsor:", error);
    }
    setLoading(false);
  };

  const percentageOptions = [
    { value: 25, amount: COST_PER_DAY * 0.25, label: "25%", labelBn: "২৫%", amountBn: "৳১,২৫০" },
    { value: 50, amount: COST_PER_DAY * 0.50, label: "50%", labelBn: "৫০%", amountBn: "৳২,৫০০" },
    { value: 100, amount: COST_PER_DAY, label: "100%", labelBn: "১০০%", amountBn: "৳৫,০০০" },
  ];

  return (
    <div>
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
              {t("ইফতার স্পন্সরশিপ প্রোগ্রামে অংশ নিন এবং পুরস্কৃত হন।", "Join our Iftar sponsorship program and be rewarded.")}
            </p>
            <p className="font-bengali text-primary-foreground/80 text-xl mb-4">
              {t("প্রতিদিনের ইফতার মাত্র ৳৫০০০", "Each iftar costs only ৳5000")}
            </p>
          </motion.div>
        </div>
        <WaveDivider className="absolute bottom-0" color="fill-[hsla(40,30%,98%,0.94)]" />
      </section>

      {/* Sponsorship Calendar */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...springIn} className="card-institutional p-8">
            <h2 className="font-bengali text-2xl font-bold text-foreground text-center mb-6">
              {t("ইফতার স্পন্সর করুন", "Sponsor an Iftar")}
            </h2>
            <p className="font-bengali text-muted-foreground text-center mb-8">
              {t(`১-${MAX_SPONSOR_DAY} রমজান পর্যন্ত স্পন্সর করা যাবে। প্রতিদিন ৪জন স্পন্সর হতে পারবে।`, `Sponsor from day 1 to ${MAX_SPONSOR_DAY}. Max 4 sponsors per day.`)}
            </p>

            {/* Calendar Grid with Percentage */}
            <div className="grid grid-cols-6 md:grid-cols-10 gap-2 mb-8">
              {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
                const percent = getSponsorshipPercent(day);
                const daySponsors = getSponsorsForDay(day);
                const available = isDayAvailable(day) && percent < 100;
                
                return (
                  <button
                    key={day}
                    onClick={() => available && setSelectedDay(day)}
                    disabled={!available}
                    className={`py-2 rounded-lg font-bengali text-sm transition-all relative ${
                      selectedDay === day
                        ? "bg-accent text-foreground ring-2 ring-accent"
                        : available
                          ? "bg-secondary text-foreground hover:bg-accent/20 cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span className="block">{day}</span>
                    {percent > 0 && (
                      <div 
                        className={`absolute bottom-0 left-0 right-0 rounded-b-lg ${
                          percent === 100 ? "bg-green-500" : percent >= 75 ? "bg-yellow-500" : "bg-accent"
                        }`}
                        style={{ height: `${percent}%`, opacity: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded opacity-50"></div>
                <span className="font-bengali text-muted-foreground">{t("পূর্ণ", "Full")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded opacity-50"></div>
                <span className="font-bengali text-muted-foreground">{t("অধিকাংশ", "Almost Full")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent rounded opacity-50"></div>
                <span className="font-bengali text-muted-foreground">{t("আংশিক", "Partial")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded"></div>
                <span className="font-bengali text-muted-foreground">{t("খালি", "Available")}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sponsor Form */}
      {selectedDay && (
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-institutional p-8"
            >
              <h3 className="font-bengali text-xl font-bold text-foreground text-center mb-6">
                {t("স্পন্সরশিপ ফর্ম", "Sponsorship Form")}
              </h3>

              {/* Percentage Selection */}
              <div className="mb-6">
                <label className="font-bengali text-sm font-medium text-foreground mb-3 block text-center">
                  {t("কতটুকু স্পন্সর করবেন?", "How much to sponsor?")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {percentageOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedPercent(opt.value)}
                      className={`py-3 rounded-xl font-bengali font-bold transition-all ${
                        selectedPercent === opt.value
                          ? "bg-accent text-foreground"
                          : "bg-secondary text-foreground hover:bg-accent/20"
                      }`}
                    >
                      {lang === "bn" ? opt.labelBn : opt.label}
                      <span className="block text-xs font-normal opacity-70">
                        {lang === "bn" ? opt.amountBn : `৳${opt.amount}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sponsorship Details */}
              <div className="bg-accent/10 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bengali text-muted-foreground">{t("স্পন্সর করা দিন", "Sponsoring Day")}</span>
                  <span className="font-bengali font-bold text-foreground">{selectedDay} {t("রমজান", "Ramadan")}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bengali text-muted-foreground">{t("স্পন্সর পারসেন্ট", "Sponsorship Percentage")}</span>
                  <span className="font-bengali font-bold text-foreground">{selectedPercent}%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-accent/20">
                  <span className="font-bengali font-bold text-foreground">{t("মোট খরচ", "Total Cost")}</span>
                  <span className="font-display text-2xl font-bold text-accent">৳{calculateCost()}</span>
                </div>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="font-bengali text-lg text-foreground">{t("ধন্যবাদ! স্পন্সরশিপ সফল!", "Thank you! Sponsorship successful!")}</p>
                  <p className="font-bengali text-muted-foreground mt-2">{t("আমরা শীঘ্রই যোগাযোগ করব", "We will contact you soon")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{t("আপনার নাম", "Your Name")} *</label>
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">{t("মোবাইল নম্বর", "Mobile Number")} *</label>
                    <input
                      type="tel"
                      value={sponsorPhone}
                      onChange={(e) => setSponsorPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">
                      {t("স্টুডেন্ট আইডি (ঐচ্ছিক)", "Student ID (Optional)")}
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder={t("আমাদের স্টুডেন্ট হলে আইডি দিন", "If your child is student, provide ID")}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="font-bengali text-sm font-medium text-foreground mb-1 block">
                      {t("মন্তব্য (ঐচ্ছিক)", "Comment (Optional)")}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t("কোনো বিশেষ কিছু বলতে চাইলে লিখুন", "Any special message")}
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="squishy-button-gold font-bengali w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      t("অপেক্ষা করুন...", "Please wait...")
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t("সাবমিট করুন", "Submit")}
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Current Sponsors */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div {...springIn} className="card-institutional p-8">
            <h2 className="font-bengali text-2xl font-bold text-foreground text-center mb-6 flex items-center justify-center gap-2">
              <Users className="w-6 h-6" />
              {t("আমাদের স্পন্সরগণ", "Our Sponsors")}
            </h2>
            
            <div className="space-y-4">
              {sponsors.length === 0 ? (
                <p className="font-bengali text-muted-foreground text-center">{t("এখনো কোনো স্পন্সর নেই", "No sponsors yet")}</p>
              ) : (
                sponsors.map((sponsor, idx) => (
                  <div key={idx} className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bengali font-bold text-foreground">{sponsor.name}</h4>
                        <p className="font-bengali text-sm text-muted-foreground">{sponsor.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bengali text-sm bg-accent/20 text-accent px-2 py-1 rounded-lg font-bold">
                          {sponsor.percentage}% = ৳{sponsor.amount}
                        </span>
                        <p className="font-bengali text-xs text-muted-foreground mt-1">
                          {t("রমজান", "Ramadan")} {sponsor.day}
                        </p>
                      </div>
                    </div>
                    {sponsor.comment && (
                      <p className="font-bengali text-sm text-muted-foreground italic">"{sponsor.comment}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...springIn} className="card-institutional p-8">
            <h2 className="font-bengali text-2xl font-bold text-foreground text-center mb-6">
              {t("পেমেন্ট অপশন", "Payment Options")}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bengali font-semibold text-foreground">Nagad / Rocket</p>
                  </div>
                </div>
                <span className="font-display font-bold text-accent">01312200043</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bengali font-semibold text-foreground">Bkash / WhatsApp</p>
                  </div>
                </div>
                <span className="font-display font-bold text-accent">01581818368</span>
              </div>

              <div className="p-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">🏦</span>
                  </div>
                  <div>
                    <p className="font-bengali font-semibold text-foreground">Islami Bank Bangladesh PLC</p>
                    <p className="font-bengali text-sm text-muted-foreground">Kapasia Branch</p>
                  </div>
                </div>
                <div className="pl-13 space-y-1 text-sm">
                  <p className="font-bengali text-muted-foreground">A/C: <span className="font-display font-bold text-foreground">20503760201161316</span></p>
                  <p className="font-bengali text-muted-foreground">Name: <span className="font-display font-bold text-foreground">Abdullah Al Mamon Ikbal</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Ramadan;
