import { useState, useEffect, useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Users, Award, GraduationCap, Send, CheckCircle } from "lucide-react";
import type { Review } from "@/lib/reviews";
import { useLanguage } from "@/contexts/LanguageContext";
import PwaHomeCard from "@/components/PwaHomeCard";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";

import { springIn, springInDelay } from "@/lib/animations";

const tahfizLogo = "/logos/tahfiz-logo.jpeg";
const islamiaLogo = "/logos/islamia-logo.jpeg";
const girlsHifzLogo = "/logos/girls-hifz-logo.jpeg";
const girlsIslamiaLogo = "/logos/girls-islamia-logo.jpeg";

const AnimatedCounter = ({ value }: { value: string }) => {
  const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const suffix = value.replace(/[0-9]/g, "");
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = num / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= num) {
              setCount(num);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [num, hasAnimated]);

  return (
    <div ref={ref} className="text-3xl font-display font-bold text-foreground tabular-nums">
      {count}{suffix}
    </div>
  );
};

const Index = () => {
  const { t, lang } = useLanguage();
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRelation, setReviewRelation] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;

    import("@/lib/reviews")
      .then(({ getApprovedReviews }) => getApprovedReviews())
      .then((items) => {
        if (isMounted) {
          setReviews(items);
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  const defaultReviews = [
    { name: t("মোঃ রহিম উদ্দিন", "Md. Rahim Uddin"), relation: t("অভিভাবক", "Guardian"), review: t("\"আমার সন্তান এই মাদরাসায় পড়ার পর খুবই ভালো পরিবর্তন দেখতে পাচ্ছি। সে এখন নামাজ পড়ে, কোরআন পড়ে এবং আগের চেয়ে অনেক বেশি মানসিকভাবে শান্তিপূর্ণ।\"", "\"I have seen great changes in my child since joining this madrasha. Now he prays, reads the Quran, and is much more mentally calm than before.\"") },
    { name: t("ফাতেমা বেগম", "Fatema Begum"), relation: t("অভিভাবক", "Guardian"), review: t("\"এই প্রতিষ্ঠানের শিক্ষকরা খুবই আদর স্নেহের সাথে পড়াশোনা করান। আমার মেয়ে এখানে খুবই ভালোভাবে লেখাপড়া শিখছে।\"", "\"The teachers here teach with great care and love. My daughter is learning very well at this institution.\"") },
    { name: t("আব্দুল করিম", "Abdul Karim"), relation: t("অভিভাবক", "Guardian"), review: t("\"মাদরাসার পরিবেশ খুবই ভালো। সন্তানকে এখানে রেখে আমি নিশ্চিত যে সে সঠিক ইসলামিক শিক্ষা পাচ্ছে।\"", "\"The environment of the madrasha is very good. I am confident that my child is receiving proper Islamic education here.\"") },
    { name: t("সালমা আক্তার", "Salma Akter"), relation: t("অভিভাবক", "Guardian"), review: t("\"আমার ছেলে এখানে পড়ে হাফেজ হয়েছে। শিক্ষকদের তত্ত্বাবধানে সে কোরআন মুখস্থ করেছে। আমরা খুবই গর্বিত।\"", "\"My son became a Hafez while studying here. He memorized the Quran under the supervision of the teachers. We are very proud.\"") },
  ];
  const allReviews = reviews.length > 0 ? reviews : defaultReviews;

  // Auto-play slider every 5 seconds
  useEffect(() => {
    if (allReviews.length === 0) return;
    const totalSlides = isMobile ? allReviews.length : Math.ceil(allReviews.length / 2);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [allReviews.length, isMobile]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const totalSlides = isMobile ? allReviews.length : Math.ceil(allReviews.length / 2);
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentSlide((prev) => (prev + 1) % totalSlides);
      else setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const { submitReview } = await import("@/lib/reviews");
      await submitReview({
        name: reviewName,
        relation: reviewRelation,
        review: reviewText,
        reviewEn: reviewText,
      });
      setReviewSubmitted(true);
      setReviewName("");
      setReviewRelation("");
      setReviewText("");
    } catch (error) {
      console.error(error);
    }
    setReviewLoading(false);
  };

  const stats = [
  { icon: Users, value: "1200+", label: t("শিক্ষার্থী", "Students") },
  { icon: BookOpen, value: "50+", label: t("শিক্ষক", "Teachers") },
  { icon: Award, value: "15+", label: t("বছরের অভিজ্ঞতা", "Years Experience") },
  { icon: GraduationCap, value: "98%", label: t("পাশের হার", "Pass Rate") }];


  const notices = [
  { date: "15 Mar 2026", title: t("বার্ষিক পরীক্ষার সময়সূচি প্রকাশিত", "Annual Exam Schedule Published") },
  { date: "10 Mar 2026", title: t("বসন্তকালীন ছুটির নোটিশ", "Spring Break Notice") },
  { date: "05 Mar 2026", title: t("অভিভাবক সভার তারিখ নির্ধারিত", "Parent Meeting Date Fixed") }];


  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] overflow-hidden flex items-center justify-start">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Islamic Academy Campus"
            className="w-full h-full object-cover"
            fetchpriority="high"
            sizes="100vw"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <motion.div {...springIn} className="max-w-2xl">
            <h1 className="font-bengali text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-4" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
              {t("একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে", "Building Foundations of Faith & Excellence")}
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
              <Link to="/virtual-tour">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 4 }}
                  className="squishy-button-gold font-bengali bg-green-600 hover:bg-green-700">
                  🎥 {t("ভার্চুয়াল ট্যুর", "Virtual Tour")}
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

        <WaveDivider className="absolute bottom-0 left-0 right-0" />
      </section>

      <PwaHomeCard />

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="card-institutional p-6 text-center">
              
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <AnimatedCounter value={stat.value} />
                <div className="text-sm font-bengali text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Religious Education Message */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            {...springIn}
            className="text-center"
          >
            <h2 className="font-bengali text-2xl md:text-3xl font-bold text-foreground mb-6">
              {t("দ্বীনি শিক্ষা পিতা-মাতার কর্তব্য", "Religious Education is the Duty of Parents")}
            </h2>
            <div className="bg-secondary/50 rounded-2xl p-6 md:p-8">
              <p className="font-bengali text-muted-foreground leading-relaxed mb-6">
                {t(
                  "রাসুল (সা.) ইরশাদ করেন 'তোমাদের মধ্যে সর্বোত্তম ঐ ব্যক্তি যে কোরআন কারীমের ইলম নিজে শিখে এবং অন্যকে শিখায়'। (সহীহ বুখারী-২/৭৫২) অন্য হাদীসে এসেছে, যেব্যক্তি কুরআন শিখে সে অনুযায়ী আমল করে, কিয়ামতের দিন তার পিতা-মাতাকে নূরের তাজ (মুকুট) পরানো হবে। সূর্যের আলোয় তোমাদের ঘর যেমন ঝলমল করে ওঠে, সে মুকুটের জ্যোতি তার চেয়েও অধিক সুন্দর ও মনোরম হবে। (পিতা-মাতার সম্মানই যদি এই হয় তবে) যে ব্যাক্তি নিজে কুরআন অনুযায়ী আমল করে তার ব্যপারে তোমাদের কী ধারণা? (নিশ্চই তার সম্মান হবে আরও বেশি)। (সুনানে আবু দাউদ১/২০৫) সন্তানকে কুরআনের শিক্ষায় শিক্ষিত করে পিতা-মাতা কেমন সৌভাগ্যের অধিকারী হন, বর্ণিত হাদীস দুটি থেকে তা সহজেই অনুধাবন করা যায়। কুরআন শিক্ষা অর্জনের মাধ্যমে এই সন্তান যেন দুনিয়া-আখেরাতে চিরসম্মানের অধিকারী হয়।",
                  "The Prophet (peace be upon him) said, 'The best among you is the one who learns the Quran and teaches it to others.' (Sahih Bukhari, 2/752) In another hadith, it is said that the person who learns the Quran and acts upon it, on the Day of Resurrection his parents will be crowned with a crown of light. The light of that crown will be more beautiful and pleasant than the light of your house shining in the sun. (If this is the honor of parents, then) what do you think about the person who acts upon the Quran? (Surely his honor will be greater). (Sunan Abu Dawud, 1/205) The two hadiths mentioned above clearly show how fortunate parents are to educate their children in the teachings of the Quran. By acquiring Quranic education, this child will be worthy of eternal honor in this world and the hereafter."
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* We Are At Your Service */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            {...springIn}
            className="font-bengali text-center text-foreground mb-4"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)" }}>
            {t("আমরা আপনার সেবায়", "We Are at Your Service")}
          </motion.h2>
          <motion.p
            {...springIn}
            className="font-bengali text-center text-muted-foreground mb-10"
          >
            {t("একই সময়ে · একই খরচে · একই স্থানে", "At the same time · At the same cost · At the same place")}
          </motion.p>

          {/* USP Box */}
          <motion.div
            {...springIn}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="bg-card rounded-2xl p-6 md:p-8 text-center">
              <h3 className="font-bengali text-xl font-bold text-foreground mb-3">
                {t("Quadruple Education System — Islamic & General Education Together", "Quadruple Education System — Islamic & General Education Together")}
              </h3>
              <p className="font-bengali text-muted-foreground">
                {t("আমরা একটি অনন্য চতুর্মাত্রিক শিক্ষা ব্যবস্থা প্রদান করি যেখানে ইসলামিক জ্ঞান ও সাধারণ শিক্ষা একসাথে এগিয়ে চলে।", "We offer a unique Quadruple Education System — where Islamic knowledge and General education grow hand in hand.")}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-bengali text-foreground">
                  🕌 4 {t("প্রতিষ্ঠান", "Institutions")}
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-bengali text-foreground">
                  👦 {t("ছেলে ও মেয়ে আলাদা", "Boys & Girls Separate")}
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-bengali text-foreground">
                  📍 {t("একই স্থান", "One Location")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Institutions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: t("আননূর তাহফিজুল কোরআন মাদরাসা ও মডেল একাডেমি (বালক শাখা)", "Annoor Tahfizul Quran Madrasah & Model Academy"),
                subtitle: t("বালক শাখা", "Boys Branch"),
                depts: t(["নূরানী — সাধারণ শিক্ষা সহ", "নাজারা — সাধারণ শিক্ষা সহ", "হিফজুল কোরআন — (সাধারণ শিক্ষা ছাড়া)", "হিফজ রিভিশন + কিতাব শাখা — সাধারণ শিক্ষা সহ"], ["Noorani — with General Education", "Nazara — with General Education", "Hifzul Quran — (without General Education", "Hifz Revision + Kitab Section — with General Education"]),
                logo: tahfizLogo,
              },
              {
                title: t("আননূর ইসলামিয়া মডেল মাদরাসা", "Annoor Islamia Model Madrasah"),
                subtitle: t("বালক শাখা", "Boys Branch"),
                depts: t(["নূরানী — সাধারণ শিক্ষা সহ", "নাজারা — সাধারণ শিক্ষা সহ", "হিফজুল কোরআন — (সাধারণ শিক্ষা ছাড়া)", "হিফজ রিভিশন + কিতাব শাখা — সাধারণ শিক্ষা সহ"], ["Nurani — with General Education", "Nazara — with General Education", "Hifzul Quran — (without General Education)", "Hifz Revision + Kitab Section — with General Education"]),
                logo: islamiaLogo,
              },
              {
                title: t("আননূর গার্লস হিফজুল কোরআন মাদরাসা", "Annoor Girls Hifzul Quran Madrasah"),
                subtitle: t("মেয়ে শাখা", "Girls Branch"),
                depts: t(["নূরানী", "নাজারা", "হিফজুল কোরআন", "হিফজ রিভিশন ডিভিশন"], ["Nurani", "Nazara", "Hifzul Quran", "Hifz Revision Division"]),
                logo: girlsHifzLogo,
              },
              {
                title: t("আননূর ইসলামিয়া গার্লস মাদরাসা", "Annoor Islamia Girls Madrasah"),
                subtitle: t("মেয়ে শাখা", "Girls Branch"),
                depts: t(["নূরানী — সাধারণ শিক্ষা সহ", "নাজারা — সাধারণ শিক্ষা সহ", "কিতাব শাখা — সাধারণ শিক্ষা সহ"], ["Nurani — with General Education", "Nazara — with General Education", "Kitab Section — with General Education"]),
                logo: girlsIslamiaLogo,
              },
            ].map((inst, i) => (
              <motion.div
                key={i}
                {...springIn}
                transition={springInDelay(i * 0.1)}
                className="card-institutional p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={inst.logo}
                    alt={inst.title}
                    className="h-12 w-auto object-contain shrink-0"
                    loading="lazy"
                    sizes="48px"
                    decoding="async"
                  />
                  <div>
                    <h3 className="font-bengali text-lg font-bold text-foreground">{inst.title}</h3>
                    <p className="font-bengali text-sm text-accent">{inst.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {inst.depts.map((dept: string, j: number) => (
                    <p key={j} className="font-bengali text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {dept}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Students Future */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            {...springIn}
            className="text-center"
          >
            <h2 className="font-bengali text-2xl md:text-3xl font-bold text-foreground mb-6">
              {t("আমাদের শিক্ষার্থীদের ভবিষ্যৎ", "Our Students' Future")}
            </h2>
            <div className="bg-secondary/50 rounded-2xl p-6 md:p-8">
              <p className="font-bengali text-muted-foreground leading-relaxed">
                {t(
                  "এ প্রতিষ্ঠানের শিক্ষার্থীরা শুধু দ্বীনি আলেমই হবে না বরং তারা হবে বিশ্ববিদ্যালয় পর্যায়ের ডিগ্রিধারী (অনার্স, মাস্টার্স ও পর্যায়ক্রমে পিএইচডি)। জাতীয় ও আন্তজাতিক পর্যায়ে মর্যাদার পদ ও স্থানে নিজেদের জায়গা করে নিতে পারবে। একদিকে হবে কুরআনের হাফেজ, আলেম, ইসলামী চিন্তাবিদ, গবেষক, শিক্ষক ও দাঈ। অন্যদিকে হবে ডাক্তার, ইঞ্জিনিয়ার, ব্যারিস্টার, প্রশাসনিক কর্মকর্তা, উদ্যোক্তা, ব্যবসায়ী ও অন্যান্য পেশাজীবী।",
                  "The students of this institution will not merely become Islamic scholars — they will be degree holders at university level (Bachelor's, Master's, and progressively PhD). They will be able to establish themselves in prestigious positions at both national and international levels. On one hand, they will become Huffaz of the Quran, Islamic scholars, thinkers, researchers, teachers, and Da'ees (callers to Islam). On the other hand, they will become doctors, engineers, barristers, administrative officers, entrepreneurs, businesspeople, and professionals in various other fields."
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Madrasha Features */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            {...springIn}
            className="font-bengali text-center text-foreground mb-10"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            {t("মাদরাসার বৈশিষ্ট্য", "Features of the Madrasha")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t(
              [
                "দেশবরেণ্য আলেম-উলমার সার্বিক তত্ত্বাবধানে পরিচালিত।",
                "প্রশিক্ষণপ্রাপ্ত অভিজ্ঞ শিক্ষকমন্ডলী দ্বারা পাঠদান।",
                "কোমলমতি শিশুদের সহজ-সরল উপায়ে পাঠদান।",
                "শারীরিক ও মানসিক নির্যাতনমুক্ত মাদরাসা।",
                "নিরাপত্তার জন্য সিকিউরিটি গার্ড ও শিক্ষার্থীদের জন্য খাদেমের ব্যবস্থা।",
                "কোলাহলমুক্ত নিরিবিলি মনোরম পরিবেশ।",
                "সার্বক্ষণিক সিসি ক্যামেরায় পর্যবেক্ষণ।",
                "অমনোযোগী শিক্ষার্থীদের জন্য বিশেষ ব্যবস্থা।",
                "তালিমের সাথে তারবিয়াতের সমান গুরুত্বসহ বাস্তব অনুশীলন।",
                "বার্ষিক শিক্ষাসফর, ইসলামী সাংস্কৃতি প্রশিক্ষণ ও বিনোদনের সুব্যবস্থা।",
                "ইংরেজি ও আরবি ভাষায় কথোপকথোনের যোগ্যতা অর্জন।",
                "নিজস্ব চিকিৎসকের মাধ্যমে নিয়মিত সুস্বাস্থ্য পরিচর্যা।",
                "স্বচ্ছতা, জবাবদিহিতা ও দায়িত্বশীলতার প্রতিশ্রুতি।",
                "বিভিন্ন বিষয়ে অধ্যায়নের জন্য উন্মুক্ত পাঠাগার।",
                "ক্লাসের পড়া ক্লাসেই আদায়, তাই শিক্ষার্থীদের প্রাইভেট পড়তে হয় না।",
                "সুপ্ত প্রতিভা বিকাশে নিয়মিত সাংস্কৃতিক প্রশিক্ষণ।",
                "হাতের লেখা সুন্দরকরণে নিয়মিত হ্যান্ডরাইটিং প্রশিক্ষণ।",
                "নিজস্ব ব্যবস্থাপনায় সার্বক্ষণিক বিদ্যুৎ ব্যবস্থা।",
                "শিক্ষার্থীদের প্রাথমিক চিকিৎসার ব্যবস্থা।",
                "শীতকালে গরম পানির ব্যবস্থা।",
                "শিক্ষকের তত্ত্বাবধানে বিকালে খেলাধুলার ব্যবস্থা।",
                "প্রবাসী পিতামাতার সন্তানের বিশেষ নিরাপত্তা ও অভিভাবকের দায়িত্ব গ্রহণ।",
                "সিকিউরিটির মাধ্যমে বিশেষ নিরাপত্তা ও ২৪ ঘণ্টা গেটলক।",
                "প্রশিক্ষণপ্রাপ্ত শিক্ষকমণ্ডলী ও আদর স্নেহের মাধ্যমে পড়াশোনার আনন্দঘন পরিবেশ।",
                "রুটিন অনুযায়ী স্বাস্থ্যসম্মত ঘরোয়া পরিবেশে পাকানো সু-স্বাদু খানা পরিবেশন।",
                "স্পোকেন ইংলিশ এর বিশেষ ক্লাসের ব্যবস্থা।"
              ],
              [
                "Operated under the overall supervision of nationally renowned Islamic scholars.",
                "Teaching conducted by trained and experienced faculty.",
                "Child-friendly teaching methods for young and tender-minded students.",
                "A madrasha completely free from physical and mental abuse.",
                "Security guards for safety and dedicated caretakers for students.",
                "A peaceful, noise-free, and pleasant learning environment.",
                "Round-the-clock CCTV surveillance.",
                "Special arrangements for inattentive or struggling students.",
                "Equal emphasis on Taleem (education) and Tarbiyah (character building) with practical training.",
                "Annual educational trips, Islamic cultural training, and recreational facilities.",
                "Opportunity to develop conversational skills in English and Arabic.",
                "Regular health care through a dedicated in-house physician.",
                "Commitment to transparency, accountability, and responsibility.",
                "An open library for study across various subjects.",
                "Classwork completed in class — no private tutoring required.",
                "Regular cultural training to nurture hidden talents.",
                "Regular handwriting improvement sessions.",
                "Uninterrupted electricity through own power management system.",
                "First aid facilities available for students at all times.",
                "Hot water facilities during winter.",
                "Supervised outdoor sports and play sessions in the afternoon.",
                "Special care and guardianship responsibilities accepted for children of expatriate parents.",
                "24-hour gate lock and special security through dedicated security personnel.",
                "A joyful and loving learning environment created by trained and caring teachers.",
                "Nutritious, homestyle, hygienic meals served according to a fixed routine.",
                "Special Spoken English classes available."
              ]
            ).filter((_, i) => showAllFeatures || i < 10).map((point, i) => (
              <motion.div
                key={i}
                {...springIn}
                transition={springInDelay(i * 0.05)}
                className="flex items-start gap-3 p-4 bg-card rounded-xl"
              >
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="font-bengali text-muted-foreground text-sm leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </div>

          {/* Show More Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bengali font-medium hover:bg-primary/90 transition-colors"
            >
              {showAllFeatures ? t("কম দেখুন", "Show Less") : t("আরও দেখুন", "Show More")}
            </button>
          </div>
        </div>
      </section>

      {/* Guardians Speech */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            {...springIn}
            className="font-bengali text-center text-foreground mb-4"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            {t("অভিভাবকদের মতামত", "What Guardians Say")}
          </motion.h2>
          
          <div className="text-center mb-8">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bengali font-medium hover:bg-primary/90 transition-colors"
            >
              {showReviewForm ? t("বাতিল", "Cancel") : t("রিভিউ দিন", "Write a Review")}
            </button>
          </div>

          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/50 rounded-2xl p-6 mb-10"
            >
              {reviewSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="font-bengali text-lg text-foreground">{t("ধন্যবাদ! আপনার রিভিউ জমা হয়েছে। অনুমোদনের পর দেখা যাবে।", "Thank you! Your review has been submitted. It will be visible after approval.")}</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bengali text-sm font-medium mb-1 block">{t("আপনার নাম", "Your Name")} *</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border font-bengali"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bengali text-sm font-medium mb-1 block">{t("আপনার সম্পর্ক", "Your Relation")} *</label>
                      <select
                        value={reviewRelation}
                        onChange={(e) => setReviewRelation(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border font-bengali"
                        required
                      >
                        <option value="">{t("সিলেক্ট করুন", "Select")}</option>
                        <option value={t("অভিভাবক", "Guardian")}>{t("অভিভাবক", "Guardian")}</option>
                        <option value={t("প্রাক্তন শিক্ষার্থী", "Ex-Student")}>{t("প্রাক্তন শিক্ষার্থী", "Ex-Student")}</option>
                        <option value={t("স্থানীয়", "Local")}>{t("স্থানীয়", "Local")}</option>
                        <option value={t("অন্যান্য", "Other")}>{t("অন্যান্য", "Other")}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bengali text-sm font-medium mb-1 block">{t("আপনার মতামত", "Your Review")} *</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border font-bengali"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={reviewLoading}
                    whileHover={{ scale: reviewLoading ? 1 : 1.02 }}
                    whileTap={{ scale: reviewLoading ? 1 : 0.98 }}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bengali font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {reviewLoading ? t("অপেক্ষা করুন...", "Please wait...") : (
                      <>
                        <Send className="w-4 h-4" />
                        {t("জমা দিন", "Submit Review")}
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}

          {/* Reviews Carousel */}
          {(() => {
            return (
              <>
                {/* Mobile: 1 card per slide */}
                <div className="relative md:hidden">
                  <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {allReviews.map((item, i) => (
                        <div key={i} className="w-full flex-shrink-0 px-2">
                          <div className="bg-secondary/50 rounded-2xl p-6">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                                {item.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bengali font-bold text-foreground">{item.name}</h4>
                                <p className="font-bengali text-sm text-muted-foreground">{item.relation}</p>
                              </div>
                            </div>
                            <p className="font-bengali text-muted-foreground italic leading-relaxed">"{lang === "bn" ? item.review : item.reviewEn || item.review}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {allReviews.length > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      {allReviews.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`h-2 rounded-full transition-all ${currentSlide === i ? "bg-primary w-8" : "bg-secondary w-2"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop: 2 cards per slide */}
                <div className="relative hidden md:block">
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${Math.min(currentSlide, Math.ceil(allReviews.length / 2) - 1) * 100}%)` }}
                    >
                      {Array.from({ length: Math.ceil(allReviews.length / 2) }).map((_, slideIndex) => (
                        <div key={slideIndex} className="w-full flex-shrink-0">
                          <div className="grid grid-cols-2 gap-6 px-2">
                            {allReviews.slice(slideIndex * 2, (slideIndex + 1) * 2).map((item, i) => (
                              <div key={i} className="bg-secondary/50 rounded-2xl p-6">
                                <div className="flex items-start gap-3 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                                    {item.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bengali font-bold text-foreground">{item.name}</h4>
                                    <p className="font-bengali text-sm text-muted-foreground">{item.relation}</p>
                                  </div>
                                </div>
                                <p className="font-bengali text-muted-foreground italic leading-relaxed">"{lang === "bn" ? item.review : item.reviewEn || item.review}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {Math.ceil(allReviews.length / 2) > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      {Array.from({ length: Math.ceil(allReviews.length / 2) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`h-2 rounded-full transition-all ${currentSlide === i ? "bg-primary w-8" : "bg-secondary w-2"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Notices */}
      <section className="py-16">
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

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-bengali text-center text-foreground mb-10"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)" }}>
            {t("সচরাচর জিজ্ঞাসা", "Frequently Asked Questions")}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: t("ভর্তির প্রক্রিয়া কী?", "What is the admission process?"),
                  a: t(
                    "প্রতি বছর জানুয়ারি-মার্চ মাসে ভর্তি কার্যক্রম চলে। অনলাইনে বা সরাসরি ফরম সংগ্রহ করে পূরণ করতে হবে। ভর্তি পরীক্ষায় উত্তীর্ণ হলে ভর্তি নিশ্চিত করা হয়।",
                    "Admissions run from January to March each year. Collect the form online or in person, fill it out, and pass the entrance test to confirm enrollment."
                  ),
                },
                {
                  q: t("মাসিক বেতন কত?", "What are the monthly fees?"),
                  a: t(
                    "বিভাগভেদে মাসিক বেতন ভিন্ন হয়। নূরানী ও নাজারা বিভাগে ৫০০-৮০০ টাকা এবং হিফজ বিভাগে ১০০০-১৫০০ টাকা। বিস্তারিত জানতে ভর্তি অফিসে যোগাযোগ করুন।",
                    "Monthly fees vary by department. Noorani & Nazara: 500-800 BDT, Hifz: 1000-1500 BDT. Contact the admission office for details."
                  ),
                },
                {
                  q: t("ক্লাসের সময়সূচি কেমন?", "What is the class schedule?"),
                  a: t(
                    "সকাল ৮:০০ টা থেকে দুপুর ১:০০ টা পর্যন্ত সাধারণ শিক্ষা এবং বিকাল ২:৩০ টা থেকে ৫:০০ টা পর্যন্ত ইসলামিক শিক্ষা কার্যক্রম চলে। শুক্রবার ও শনিবার সাপ্তাহিক ছুটি।",
                    "General education runs 8:00 AM – 1:00 PM and Islamic studies 2:30 PM – 5:00 PM. Friday and Saturday are weekly holidays."
                  ),
                },
                {
                  q: t("ছেলে ও মেয়ে কি আলাদা পড়ে?", "Are boys and girls taught separately?"),
                  a: t(
                    "হ্যাঁ, ছেলে ও মেয়ে সম্পূর্ণ আলাদা শাখায় পড়াশোনা করে। বালক শাখা ও বালিকা শাখা পৃথকভাবে পরিচালিত হয়।",
                    "Yes, boys and girls study in completely separate branches. The boys' and girls' sections are managed independently."
                  ),
                },
                {
                  q: t("আবাসিক ব্যবস্থা আছে কি?", "Is there a residential facility?"),
                  a: t(
                    "হ্যাঁ, হিফজ বিভাগের ছাত্রদের জন্য আবাসিক ব্যবস্থা রয়েছে। থাকা-খাওয়া সহ সার্বক্ষণিক তত্ত্বাবধানে শিক্ষা কার্যক্রম পরিচালিত হয়।",
                    "Yes, residential facilities are available for Hifz department students, including accommodation, meals, and round-the-clock supervision."
                  ),
                },
                {
                  q: t("পরীক্ষা পদ্ধতি কেমন?", "What is the examination system?"),
                  a: t(
                    "বছরে তিনটি পরীক্ষা অনুষ্ঠিত হয় — প্রথম সাময়িক, দ্বিতীয় সাময়িক ও বার্ষিক পরীক্ষা। এছাড়া মাসিক মূল্যায়ন ও দৈনিক সবক পরীক্ষা নেওয়া হয়।",
                    "Three exams are held per year — First Term, Second Term, and Annual. Additionally, monthly assessments and daily lesson tests are conducted."
                  ),
                },
              ].map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="card-institutional border-none px-6"
                >
                  <AccordionTrigger className="font-bengali text-foreground text-left hover:no-underline py-5 text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-bengali text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </div>);

};

export default Index;
