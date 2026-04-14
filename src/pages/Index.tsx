import { useState, useEffect, useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Users, Award, GraduationCap, Send, CheckCircle, Briefcase } from "lucide-react";
import type { Review } from "@/lib/reviews";
import { useLanguage } from "@/contexts/LanguageContext";
import PwaHomeCard from "@/components/PwaHomeCard";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import { getNotices, type Notice } from "@/lib/notices";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRelation, setReviewRelation] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [homeNotices, setHomeNotices] = useState<Notice[]>([]);
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

  useEffect(() => {
    let active = true;

    getNotices()
      .then((items) => {
        if (active) {
          setHomeNotices(items.slice(0, 3));
        }
      })
      .catch(console.error);

    return () => {
      active = false;
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
  { icon: Users, value: "250+", label: t("শিক্ষার্থী", "Students") },
  { icon: BookOpen, value: "30+", label: t("শিক্ষক", "Teachers") },
  { icon: Award, value: "13+", label: t("বছরের অভিজ্ঞতা", "Years Experience") },
  { icon: GraduationCap, value: "98%", label: t("পাশের হার", "Pass Rate") }];


  const featureGroups = [
    {
      id: "academic",
      title: t("একাডেমিক শ্রেষ্ঠত্ব", "Academic Excellence"),
      points: t(
        [
          "দেশবরেণ্য আলেম-উলামাদের সার্বিক তত্ত্বাবধানে পরিচালিত।",
          "প্রশিক্ষণপ্রাপ্ত অভিজ্ঞ শিক্ষকমণ্ডলী ও আদর-স্নেহের মাধ্যমে আনন্দঘন পরিবেশে পাঠদান।",
          "ইংরেজি ও আরবি ভাষায় সাবলীল কথোপকথনের (Spoken) বিশেষ ক্লাসের ব্যবস্থা।",
          "ক্লাসের পড়া ক্লাসেই আদায় করা হয়, তাই আলাদা কোনো প্রাইভেট বা টিউশনির প্রয়োজন নেই।",
          "হাতের লেখা সুন্দরকরণে নিয়মিত বিশেষ হ্যান্ডরাইটিং প্রশিক্ষণ।",
        ],
        [
          "Operated under the supervision of renowned Islamic scholars.",
          "Experienced trained teachers create a joyful and caring learning environment.",
          "Special spoken English and Arabic conversation classes are arranged.",
          "Lessons are completed in class, so no separate private tutoring is needed.",
          "Regular handwriting development sessions help students improve presentation.",
        ],
      ),
    },
    {
      id: "tarbiya",
      title: t("তারবিয়াত ও মানসিক বিকাশ", "Tarbiya and Character Building"),
      points: t(
        [
          "তালিমের সাথে তারবিয়াতের (আদব-কায়দা) সমান গুরুত্ব ও বাস্তব অনুশীলন।",
          "কোমলমতি শিশুদের সহজ-সরল ও মনস্তাত্ত্বিক উপায়ে পাঠদান।",
          "সম্পূর্ণ শারীরিক ও মানসিক নির্যাতনমুক্ত আধুনিক মাদরাসা।",
          "সুপ্ত প্রতিভা বিকাশে নিয়মিত সাংস্কৃতিক প্রশিক্ষণ ও উন্মুক্ত পাঠাগার।",
          "বার্ষিক শিক্ষাসফর, ইসলামী সংস্কৃতি চর্চা ও সুস্থ বিনোদনের সুব্যবস্থা।",
        ],
        [
          "Equal emphasis is placed on tarbiya, manners, and real-life practice alongside learning.",
          "Young children are taught through simple, gentle, and age-sensitive methods.",
          "A modern madrasha environment free from physical and mental abuse.",
          "Regular cultural training and an open library help nurture hidden talents.",
          "Educational tours, Islamic cultural practice, and healthy recreation are arranged annually.",
        ],
      ),
    },
    {
      id: "security",
      title: t("নিরাপত্তা ও পর্যবেক্ষণ", "Security and Monitoring"),
      points: t(
        [
          "সার্বক্ষণিক সিসিটিভি ক্যামেরা পর্যবেক্ষণ ও ২৪ ঘণ্টা গেটলক ব্যবস্থা।",
          "নিরাপত্তার জন্য দক্ষ সিকিউরিটি গার্ড ও ছোট শিক্ষার্থীদের জন্য নিবেদিত খাদেম।",
          "প্রবাসী ও ব্যস্ত অভিভাবকদের সন্তানদের জন্য বিশেষ নিরাপত্তা ও অভিভাবকত্বের দায়িত্ব গ্রহণ।",
          "স্বচ্ছতা, জবাবদিহিতা ও দায়িত্বশীলতার দৃঢ় প্রতিশ্রুতি।",
        ],
        [
          "Round-the-clock CCTV coverage and a 24-hour gate-lock system ensure safety.",
          "Trained security guards and dedicated caretakers support younger students.",
          "Special protection and guardianship support are provided for children of expatriate and busy parents.",
          "The institution remains committed to transparency, accountability, and responsibility.",
        ],
      ),
    },
    {
      id: "facilities",
      title: t("উন্নত আবাসন ও জীবনমান", "Facilities and Comfort"),
      points: t(
        [
          "কোলাহলমুক্ত নিরিবিলি ও মনোরম পরিবেশ এবং সার্বক্ষণিক বিদ্যুৎ (জেনারেটর) ব্যবস্থা।",
          "নিজস্ব ব্যবস্থাপনায় স্বাস্থ্যসম্মত ও সুস্বাদু ঘরোয়া খাবার পরিবেশন।",
          "শীতকালে গরম পানির সুবিধা ও নিয়মিত সুস্বাস্থ্য পরিচর্যায় নিজস্ব চিকিৎসক।",
          "শিক্ষকের সরাসরি তত্ত্বাবধানে প্রতিদিন বিকেলে খেলাধুলার ব্যবস্থা।",
        ],
        [
          "Students enjoy a peaceful campus atmosphere with uninterrupted electricity and generator backup.",
          "Healthy and delicious homestyle meals are served under in-house management.",
          "Hot water in winter and regular health care support from an in-house doctor are available.",
          "Daily supervised afternoon sports help students stay healthy and active.",
        ],
      ),
    },
  ];

  const displayedNotices = homeNotices.length > 0
    ? homeNotices
    : [
        {
          id: "fallback-1",
          createdAt: Date.parse("2026-03-15"),
          titleBn: "বার্ষিক পরীক্ষার সময়সূচি প্রকাশিত",
          titleEn: "Annual Exam Schedule Published",
        },
        {
          id: "fallback-2",
          createdAt: Date.parse("2026-03-10"),
          titleBn: "বসন্তকালীন ছুটির নোটিশ",
          titleEn: "Spring Break Notice",
        },
        {
          id: "fallback-3",
          createdAt: Date.parse("2026-03-05"),
          titleBn: "অভিভাবক সভার তারিখ নির্ধারিত",
          titleEn: "Parent Meeting Date Fixed",
        },
      ];


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
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-[1.28] md:leading-[1.32] mb-4" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
              {t("একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে", "Building Foundations of Faith & Excellence")}
            </h1>
            <p className="font-display text-lg md:text-xl text-primary-foreground/90 mb-8 leading-[1.7]">
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
              <Link to="/achievements">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 4 }}
                  className="squishy-button-outline border-primary-foreground text-primary-foreground shadow-[0_6px_0_0_rgba(255,255,255,0.3)] font-bengali">
                  
                  {t("আমাদের অর্জন", "Our Achievements")}
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
            <div className="rounded-[2rem] border border-border/60 bg-card/90 p-6 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)] md:p-10">
              <div className="mx-auto mb-6 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                {t("পবিত্র আমানত", "A Sacred Trust")}
              </div>
              <h2 className="mb-5 font-bengali text-2xl font-bold text-foreground md:text-4xl leading-tight">
                {t(
                  "সন্তানকে দ্বীনি শিক্ষায় গড়ে তোলা প্রতিটি অভিভাবকের পবিত্র আমানত",
                  "Nurturing a child with Deeni education is a sacred trust for every parent",
                )}
              </h2>
              <div className="mx-auto mb-6 max-w-3xl rounded-3xl bg-primary/5 px-5 py-5">
                <p className="font-bengali text-base font-medium leading-8 text-foreground md:text-lg">
                  {t(
                    'রাসূল (সা.) ইরশাদ করেন: "তোমাদের মধ্যে সর্বোত্তম ঐ ব্যক্তি, যে নিজে কুরআন শিখে এবং অন্যকে শেখায়।" (সহীহ বুখারী)',
                    'The Prophet (peace be upon him) said: "The best among you is the one who learns the Quran and teaches it to others." (Sahih Bukhari)',
                  )}
                </p>
              </div>
              <p className="mx-auto max-w-3xl font-bengali text-muted-foreground leading-8 md:text-lg">
                {t(
                  "পবিত্র কোরআনের শিক্ষায় শিক্ষিত সন্তান কেবল নিজের জন্য নয়, বরং কিয়ামতের কঠিন দিনে তার পিতা-মাতার জন্যও হবে সম্মানের মুকুট। পরকালীন মুক্তি এবং দুনিয়াবী জীবনে আদর্শ সন্তান উপহার দিতে আমরা আপনার পাশে আছি। আপনার সন্তানকে কোরআনের আলোয় আলোকিত করে দুনিয়া ও আখেরাতের চিরস্থায়ী সফলতার পথে এগিয়ে দিন।",
                  "A child educated in the light of the Holy Quran becomes not only a source of goodness for himself, but also a crown of honor for his parents on the Day of Judgment. We stand beside you in helping your child grow into an ideal child for this world and a means of success in the hereafter. Illuminate your child with the light of the Quran and guide them toward lasting success in both worlds.",
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
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="font-bengali text-2xl font-bold text-[#064E3B] md:text-3xl">
              {t("আমাদের শিক্ষার্থীদের ভবিষ্যৎ", "Our Students' Future")}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl font-bengali text-base leading-8 text-muted-foreground">
              {t(
                "আমরা বিশ্বাস করি, দ্বীনি শিক্ষার আলো ও সাধারণ শিক্ষার দক্ষতা—এই দুইয়ের সমন্বয়ই ভবিষ্যৎকে আলোকিত করে। আমাদের শিক্ষার্থীরা জ্ঞান, নৈতিকতা ও পেশাগত দক্ষতায় এমনভাবে গড়ে উঠবে যেন তারা সমাজে নেতৃত্ব দিতে পারে।",
                "We believe the blend of religious guidance and general education shapes a brighter future. Our students grow in knowledge, values, and professional excellence so they can lead society with confidence.",
              )}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#064E3B]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-bengali text-lg font-semibold text-[#064E3B]">
                {t("উচ্চশিক্ষা", "Higher Education")}
              </h3>
              <p className="mt-3 font-bengali text-sm leading-7 text-muted-foreground">
                {t(
                  "অনার্স, মাস্টার্স ও পিএইচডি পর্যায়ের ডিগ্রি অর্জনের মাধ্যমে দেশ-বিদেশে মেধার স্বাক্ষর রাখার লক্ষ্য।",
                  "Focus on Honors, Masters, and PhD degrees to leave a mark of excellence nationally and globally.",
                )}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#064E3B]">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-bengali text-lg font-semibold text-[#064E3B]">
                {t("দ্বীনি নেতৃত্ব", "Religious Leadership")}
              </h3>
              <p className="mt-3 font-bengali text-sm leading-7 text-muted-foreground">
                {t(
                  "হাফেজে কোরআন, ইসলামি চিন্তাবিদ, গবেষক ও শিক্ষক হিসেবে দায়িত্বশীল ভূমিকা পালন।",
                  "Prepare as Hafez, Islamic thinkers, researchers, and dedicated teachers with responsibility.",
                )}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#064E3B]">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-bengali text-lg font-semibold text-[#064E3B]">
                {t("পেশাগত শ্রেষ্ঠত্ব", "Professional Excellence")}
              </h3>
              <p className="mt-3 font-bengali text-sm leading-7 text-muted-foreground">
                {t(
                  "ডাক্তার, ইঞ্জিনিয়ার, ব্যারিস্টার, প্রশাসনিক কর্মকর্তা ও উদ্যোক্তা হিসেবে দক্ষতা অর্জন।",
                  "Build skills to become doctors, engineers, barristers, administrative officers, and entrepreneurs.",
                )}
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50/60 px-6 py-5 text-center">
            <p className="font-bengali text-base font-semibold text-[#064E3B]">
              {t(
                "“দ্বীনি ও দুনিয়াবি শিক্ষার সমন্বয়ই আমাদের শিক্ষার্থীদের সত্যিকারের সফলতার পথে এগিয়ে নেয়।”",
                "\"The harmony of faith-based and general education guides our students toward true success.\"",
              )}
            </p>
          </div>
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featureGroups.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                {...springIn}
                transition={springInDelay(groupIndex * 0.08)}
                className="card-institutional h-full p-6 md:p-8"
              >
                <div className="mb-6 flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
                    {groupIndex + 1}
                  </span>
                  <div>
                    <h3 className="font-bengali text-xl font-bold text-foreground md:text-2xl">{group.title}</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {group.points.map((point, pointIndex) => (
                    <div key={`${group.id}-${pointIndex}`} className="flex items-start gap-3 rounded-2xl bg-secondary/35 px-4 py-4">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                      <p className="font-bengali text-sm leading-7 text-muted-foreground md:text-[15px]">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...springIn} className="mb-10 text-center">
            <h2
              className="font-bengali text-center text-foreground mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
            >
              {t("আমাদের অর্জন", "Our Achievements")}
            </h2>
            <p className="mx-auto max-w-3xl font-bengali text-muted-foreground leading-7">
              {t(
                "প্রতিষ্ঠানের বিভিন্ন সনদ, সম্মাননা ও শিক্ষার্থীদের কৃতিত্ব আমাদের মানসম্মত শিক্ষার ধারাবাহিকতার সাক্ষ্য বহন করে।",
                "Our certificates, recognitions, and student achievements reflect the continuity of our quality education.",
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: t("সনদ", "Certificates"),
                description: t(
                  "হিফজ, কিরাআত, প্রশিক্ষণ ও বিভিন্ন শিক্ষা কার্যক্রমে অর্জিত সনদসমূহ।",
                  "Certificates earned through Hifz, Qirat, training, and educational programs.",
                ),
              },
              {
                title: t("সম্মাননা", "Recognition"),
                description: t(
                  "প্রতিষ্ঠানের মান, শৃঙ্খলা ও ধারাবাহিক উন্নয়নের জন্য প্রাপ্ত স্বীকৃতি ও সম্মাননা।",
                  "Recognition received for institutional quality, discipline, and continuous growth.",
                ),
              },
              {
                title: t("প্রতিযোগিতায় সাফল্য", "Competition Success"),
                description: t(
                  "তিলাওয়াত, হামদ-নাত, সাধারণ জ্ঞান ও একাডেমিক প্রতিযোগিতায় শিক্ষার্থীদের কৃতিত্ব।",
                  "Student achievements in tilawat, hamd-naat, general knowledge, and academic competitions.",
                ),
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                {...springIn}
                transition={springInDelay(index * 0.08)}
                className="card-institutional h-full p-6 md:p-8"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-bengali text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 font-bengali text-sm leading-7 text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/achievements">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="squishy-button font-bengali"
              >
                {t("বিস্তারিত দেখুন", "View Details")}
              </motion.button>
            </Link>
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
            {displayedNotices.map((notice, i) => {
            const noticeDate = new Date(notice.createdAt);
            const dayLabel = noticeDate.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { day: "2-digit" });
            const monthLabel = noticeDate.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { month: "short" });
            const noticeTitle = lang === "bn" ? notice.titleBn : notice.titleEn || notice.titleBn;
            return <motion.div
              key={notice.id || i}
              {...springIn}
              transition={springInDelay(i * 0.1)}
              className="card-institutional p-6 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer">
              
                <div className="bg-accent/20 rounded-2xl px-4 py-2 text-center shrink-0">
                  <div className="text-xs font-semibold text-accent">{monthLabel}</div>
                  <div className="text-xl font-display font-bold text-foreground">{dayLabel}</div>
                </div>
                <p className="font-bengali text-foreground font-medium">{noticeTitle}</p>
              </motion.div>
            })}
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
                    "সকাল ৮:০০ টা থেকে দুপুর ১:০০ টা পর্যন্ত সাধারণ শিক্ষা এবং সকাল ৬:০০ টা থেকে ৮:০০ টা পর্যন্ত ইসলামিক শিক্ষা কার্যক্রম চলে। শুক্রবার সাপ্তাহিক ছুটি।",
                    "General education runs 8:00 AM – 1:00 PM and Islamic studies 6:00 AM – 8:00 AM. Friday is a weekly holiday."
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
