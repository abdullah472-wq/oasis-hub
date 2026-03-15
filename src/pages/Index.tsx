import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Users, Award, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import boysImg from "@/assets/boys-campus.jpg";
import girlsImg from "@/assets/girls-campus.jpg";

import { springIn, springInDelay } from "@/lib/animations";

const Index = () => {
  const { t } = useLanguage();

  const stats = [
  { icon: Users, value: "1200+", label: t("শিক্ষার্থী", "Students") },
  { icon: BookOpen, value: "50+", label: t("শিক্ষক", "Teachers") },
  { icon: Award, value: "15+", label: t("বছরের অভিজ্ঞতা", "Years Experience") },
  { icon: GraduationCap, value: "98%", label: t("পাশের হার", "Pass Rate") }];


  const notices = [
  { date: "15 Mar 2026", title: t("বার্ষিক পরীক্ষার সময়সূচি প্রকাশিত", "Annual Exam Schedule Published") },
  { date: "10 Mar 2026", title: t("বসন্তকালীন ছুটির নোটিশ", "Spring Break Notice") },
  { date: "05 Mar 2026", title: t("অভিভাবক সভার তারিখ নির্ধারিত", "Parent Meeting Date Fixed") }];


  const prayerTimes = [
  { name: t("ফজর", "Fajr"), time: "5:15 AM" },
  { name: t("যোহর", "Dhuhr"), time: "12:30 PM" },
  { name: t("আসর", "Asr"), time: "4:15 PM" },
  { name: t("মাগরিব", "Maghrib"), time: "6:05 PM" },
  { name: t("ইশা", "Isha"), time: "7:30 PM" }];


  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] overflow-hidden flex items-center justify-start">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Islamic Academy Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <motion.div {...springIn} className="max-w-2xl">
            <h1 className="font-bengali text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-4" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
              {t("ঈমান ও শ্রেষ্ঠত্বের ভিত্তি গড়ি", "Building Foundations of Faith & Excellence")}
            </h1>
            <p className="font-bengali text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              {t(
                "আমাদের দুইটি ক্যাম্পাসে ইসলামিক মূল্যবোধের আলোকে আধুনিক শিক্ষা প্রদান করা হয়।",
                "We provide modern education grounded in Islamic values across our two campuses."
              )}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/admission">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 4 }}
                  className="squishy-button-gold font-bengali">
                  
                  {t("ভর্তি তথ্য", "Admission Info")}
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 4 }}
                  className="squishy-button-outline border-primary-foreground text-primary-foreground shadow-[0_6px_0_0_rgba(255,255,255,0.3)] font-bengali">
                  
                  {t("আমাদের সম্পর্কে", "About Us")}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Prayer Times floating widget */}
        <motion.div
          {...springIn}
          transition={springInDelay(0.3)}
          className="absolute top-8 right-4 md:right-8 bg-card/80 backdrop-blur-md rounded-[2rem] p-5 shadow-[var(--shadow-soft)] hidden md:block">
          
          <h3 className="font-display text-sm font-bold text-foreground mb-3 text-center">
            🕌 {t("নামাজের সময়", "Prayer Times")}
          </h3>
          <div className="space-y-2">
            {prayerTimes.map((p) =>
            <div key={p.name} className="flex justify-between gap-6 text-sm font-bengali">
                <span className="text-muted-foreground">{p.name}</span>
                <span className="font-semibold text-foreground">{p.time}</span>
              </div>
            )}
          </div>
        </motion.div>

        <WaveDivider className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Stats */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) =>
            <motion.div
              key={i}
              {...springIn}
              transition={springInDelay(i * 0.1)}
              className="card-institutional p-6 text-center">
              
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-3xl font-display font-bold text-foreground">{stat.value}</div>
                <div className="text-sm font-bengali text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Campus Cards */}
      <section className="bg-secondary py-16">
        <WaveDivider flip color="fill-background" className="absolute -top-16 md:-top-24" />
        <div className="container mx-auto px-4">
          <motion.h2
            {...springIn}
            className="font-bengali text-center text-foreground mb-12"
            style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}>
            
            {t("আমাদের ক্যাম্পাসসমূহ", "Our Campuses")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
            { img: boysImg, title: t("বালক ক্যাম্পাস", "Boys Campus"), desc: t("উচ্চমানের শিক্ষা ও ইসলামিক পরিবেশে ছেলেদের জন্য আদর্শ শিক্ষাপ্রতিষ্ঠান।", "An ideal institution for boys with quality education in an Islamic environment.") },
            { img: girlsImg, title: t("বালিকা ক্যাম্পাস", "Girls Campus"), desc: t("মেয়েদের জন্য নিরাপদ ও উন্নত শিক্ষা পরিবেশ।", "A safe and enriching educational environment for girls.") }].
            map((campus, i) =>
            <motion.div
              key={i}
              {...springIn}
              transition={springInDelay(i * 0.15)}
              whileHover={{ y: -8 }}
              className="aspect-[4/5] rounded-[3rem] overflow-hidden relative group cursor-pointer">
              
                <img src={campus.img} alt={campus.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent/80" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-bengali text-2xl font-bold text-foreground mb-2">{campus.title}</h3>
                  <p className="font-bengali text-foreground/80 text-sm leading-relaxed">{campus.desc}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <WaveDivider color="fill-secondary" />

      {/* Notices */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            {...springIn}
            className="font-bengali text-center text-foreground mb-10"
            style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}>
            
            {t("সাম্প্রতিক নোটিশ", "Recent Notices")}
          </motion.h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {notices.map((notice, i) =>
            <motion.div
              key={i}
              {...springIn}
              transition={springInDelay(i * 0.1)}
              className="card-institutional p-6 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer">
              
                <div className="bg-accent/20 rounded-2xl px-4 py-2 text-center shrink-0">
                  <div className="text-xs font-semibold text-accent">{notice.date.split(" ")[1]}</div>
                  <div className="text-xl font-display font-bold text-foreground">{notice.date.split(" ")[0]}</div>
                </div>
                <p className="font-bengali text-foreground font-medium">{notice.title}</p>
              </motion.div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link to="/notices">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, y: 4 }}
                className="squishy-button font-bengali">
                
                {t("সকল নোটিশ দেখুন", "View All Notices")}
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </div>);

};

export default Index;