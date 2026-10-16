import { useState, useEffect, useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Award,
  GraduationCap,
  Send,
  CheckCircle,
  Briefcase,
  Copy,
  Share2,
  Crown,
  FileDown,
  Sparkles,
  ArrowRight,
  School,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  Eye,
  Camera,
  HeartHandshake,
} from "lucide-react";
import type { Review } from "@/lib/reviews";
import { useLanguage } from "@/contexts/LanguageContext";
import PwaHomeCard from "@/components/PwaHomeCard";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import { getNotices, type Notice } from "@/lib/notices";
import { springIn, springInDelay } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/siteSettings";

const AnimatedCounter = ({ value }: { value: string }) => {
  const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const suffix = value.replace(/[0-9]/g, "");
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setCount(num);
      return;
    }
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
    <div ref={ref} className="text-3xl lg:text-4xl font-display font-extrabold text-foreground tabular-nums tracking-tight">
      {count}{suffix}
    </div>
  );
};

const Index = () => {
  const { t, lang } = useLanguage();
  const { settings } = useSiteSettings();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRelation, setReviewRelation] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [homeNotices, setHomeNotices] = useState<Notice[]>([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const featuresSectionRef = useRef<HTMLElement | null>(null);
  const reviewSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  const openReviewSection = (smooth = true) => {
    setShowReviewForm(true);
    window.requestAnimationFrame(() => {
      reviewSectionRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
    });
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>, smooth = true) => {
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
    });
  };

  useEffect(() => {
    const handleSectionHash = () => {
      if (window.location.hash === "#write-review" || window.location.hash === "#reviews") {
        openReviewSection(false);
        return;
      }
      if (window.location.hash === "#madrasha-features") {
        scrollToSection(featuresSectionRef, false);
      }
    };

    handleSectionHash();
    window.addEventListener("hashchange", handleSectionHash);
    return () => window.removeEventListener("hashchange", handleSectionHash);
  }, []);

  const defaultReviews = [
    {
      name: t("মোঃ রহিম উদ্দিন", "Md. Rahim Uddin"),
      relation: t("অভিভাবক", "Guardian"),
      review: t(
        '"আমার সন্তান এই মাদরাসায় পড়ার পর খুবই ভালো পরিবর্তন দেখতে পাচ্ছি। সে এখন নামাজ পড়ে, কোরআন পড়ে এবং আগের চেয়ে অনেক বেশি বিনয়ী ও দায়িত্ববান।"',
        '"I have seen great changes in my child since joining this madrasha. Now he prays, reads the Quran, and is much more polite and responsible."'
      ),
    },
    {
      name: t("মুহাম্মদ রফিকুল ইসলাম", "Muhammad Rafiqul Islam"),
      relation: t("অভিভাবক", "Guardian"),
      review: t(
        '"এই প্রতিষ্ঠানের শিক্ষকরা খুবই আদর স্নেহের সাথে পড়াশোনা করান। সুশৃঙ্খল ও আন্তরিক পরিবেশে সন্তান খুব আনন্দের সাথে সহীহ কোরআন ও প্রাতিষ্ঠানিক শিক্ষা শিখছে।"',
        '"The teachers here teach with great care and dedication. In a disciplined and warm environment, my child is happily learning the Quran and academic education."'
      ),
    },
    {
      name: t("আব্দুল করিম", "Abdul Karim"),
      relation: t("অভিভাবক", "Guardian"),
      review: t(
        '"মাদরাসার জেনারেল ও হিফজ সমন্বিত পাঠ্যক্রম অত্যন্ত প্রশংসনীয়। সন্তানকে এখানে রেখে আমি নিশ্চিত যে সে সঠিক ইসলামিক ও প্রাতিষ্ঠানিক শিক্ষা পাচ্ছে।"',
        '"The integrated general and Hifz curriculum is commendable. I am confident that my child is receiving proper Islamic and formal schooling."'
      ),
    },
    {
      name: t("সালমা আক্তার", "Salma Akter"),
      relation: t("অভিভাবক", "Guardian"),
      review: t(
        '"আমার ছেলে এখান থেকে অল্প সময়ে অত্যন্ত সুনামের সাথে হিফজ সম্পন্ন করেছে। শিক্ষকদের নিবিড় তত্ত্বাবধানে সে সহীহ তাজবীদে কুরআন মুখস্থ করেছে। আমরা গর্বিত।"',
        '"My son completed his Hifz here with distinction. Under the close care of the teachers, he memorized the Quran with proper Tajweed. We are proud."'
      ),
    },
  ];

  const allReviews = reviews.length > 0 ? reviews : defaultReviews;

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

  const reviewShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#write-review`
      : "/#write-review";

  const setTemporaryShareFeedback = (message: string) => {
    setShareFeedback(message);
    window.setTimeout(() => setShareFeedback(""), 2500);
  };

  const handleCopyReviewLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewShareUrl);
      setTemporaryShareFeedback(t("রিভিউ ফর্মের লিংক কপি হয়েছে", "Review form link copied"));
    } catch (error) {
      console.error(error);
      setTemporaryShareFeedback(t("লিংক কপি করা যায়নি", "Could not copy the link"));
    }
  };

  const handleShareReviewLink = async () => {
    if (typeof navigator === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("রিভিউ ফর্ম", "Review Form"),
          text: t("এই লিংকে গিয়ে সরাসরি রিভিউ দিন", "Use this link to submit a review directly"),
          url: reviewShareUrl,
        });
        setTemporaryShareFeedback(t("রিভিউ ফর্ম শেয়ার করা হয়েছে", "Review form shared"));
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error(error);
      }
    }
    await handleCopyReviewLink();
  };

  const stats = [
    { icon: Users, value: "350+", label: t("বর্তমান শিক্ষার্থী", "Active Students") },
    { icon: Crown, value: "115+", label: t("কৃতি হাফেজ সমাবর্তন", "Huffaz Graduates") },
    { icon: BookOpen, value: "30+", label: t("অভিজ্ঞ শিক্ষকমণ্ডলী", "Expert Teachers") },
    { icon: Award, value: "5+", label: t("বছরের নির্ভরযোগ্য ঐতিহ্য", "Years of Trust (Est. 2021)") },
  ];

  const academicTracks = [
    {
      titleBn: "নূরানী ও নাজেরা বিভাগ",
      titleEn: "Nurani & Nazara Track",
      descBn: "সহীহ মাখরাজ ও তাজবীদের সাথে কুরআন শিক্ষা, সুন্দর হস্তলিপি ও প্রাথমিক বাংলা, ইংরেজি, গণিত পাঠদান।",
      descEn: "Authentic Makhraj & Tajweed foundations paired with Arabic calligraphy and primary subjects.",
      badge: "বয়স: ৪ — ৭ বছর",
      badgeEn: "Age: 4 — 7 yrs",
      color: "from-primary/10 to-primary/5 text-primary border-primary/20",
      accent: "bg-primary",
      icon: BookOpen,
      link: "/curriculum",
    },
    {
      titleBn: "হিফজুল কুরআন বিভাগ",
      titleEn: "Hifzul Quran Track",
      descBn: "সুললিত তিলাওয়াত, আন্তর্জাতিক মানের সবকপারা দাওর চক্র ও বিশিষ্ট হাফেজগণের সার্বক্ষণিক নিবিড় তত্ত্বাবধান।",
      descEn: "Comprehensive Quranic memorization under renowned Hafez instructors with strict revision cycles.",
      badge: "আবাসিক ও অনাবাসিক",
      badgeEn: "Residential & Day",
      color: "from-amber-500/10 to-amber-500/5 text-amber-700 border-amber-500/20",
      accent: "bg-amber-600",
      icon: Crown,
      link: "/curriculum",
    },
    {
      titleBn: "জেনারেল সমন্বিত প্রাথমিক",
      titleEn: "Integrated Primary Track",
      descBn: "জাতীয় শিক্ষাক্রমের সাথে সমন্বিত স্মার্ট ক্লাসরুমে ইংরেজি, গণিত, বিজ্ঞান, সাধারণ জ্ঞান ও আইসিটি শিক্ষা।",
      descEn: "Modern national curriculum education with multimedia smart classrooms, English & Science labs.",
      badge: "প্লে — ৫ম শ্রেণি",
      badgeEn: "Play — Grade 5",
      color: "from-sky-500/10 to-sky-500/5 text-sky-700 border-sky-500/20",
      accent: "bg-sky-600",
      icon: GraduationCap,
      link: "/curriculum",
    },
    {
      titleBn: "আদর্শ তারবিয়াত ও নৈতিক শিক্ষা",
      titleEn: "Islamic Tarbiyah & Ethics",
      descBn: "সুন্নাহর বাস্তব আমল, উত্তম চরিত্র গঠন, দোয়া-মাসনূন আদব ও সার্বক্ষণিক ওস্তাদগণের স্নেহময় তত্ত্বাবধান।",
      descEn: "Practical Sunnah implementation, Islamic manners, character building and caring teacher mentorship.",
      badge: "আমল ও আখলাক",
      badgeEn: "Character & Ethics",
      color: "from-emerald-500/10 to-emerald-500/5 text-emerald-700 border-emerald-500/20",
      accent: "bg-emerald-600",
      icon: ShieldCheck,
      link: "/about",
    },
  ];

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
        ]
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
        ]
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
        ]
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
        ]
      ),
    },
  ];

  const displayedNotices =
    homeNotices.length > 0
      ? homeNotices
      : [
        {
          id: "fallback-1",
          createdAt: Date.parse("2026-03-15"),
          titleBn: "বার্ষিক পরীক্ষার সময়সূচি ও প্রবেশপত্র বিতরণ সংক্রান্ত নোটিশ",
          titleEn: "Annual Exam Schedule & Admit Card Distribution Notice",
        },
        {
          id: "fallback-2",
          createdAt: Date.parse("2026-03-10"),
          titleBn: "রমজান ও পবিত্র ঈদুল ফিতরের বাৎসরিক ছুটির তালিকা",
          titleEn: "Ramadan & Eid-ul-Fitr Annual Holiday Notice",
        },
        {
          id: "fallback-3",
          createdAt: Date.parse("2026-03-05"),
          titleBn: "১ম সাময়িক অভিভাবক সমাবেশ ও ফলাফল প্রকাশ সভা",
          titleEn: "First Term Parent-Teacher Conference & Result Meeting",
        },
      ];

  return (
    <div className="bg-background">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[500px] lg:min-h-[560px] overflow-hidden flex items-start justify-start pt-4 pb-12 sm:pt-6 sm:pb-14 lg:pt-6 lg:pb-16">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Annoor Education Family Campus"
            className="w-full h-full object-cover object-center"
            fetchpriority="high"
            sizes="100vw"
            decoding="async"
          />
          {/* Subtle top vignette shadow to enhance navbar contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />
          {/* Institutional rich brand primary gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-transparent/60" />
        </div>

        <div className="relative container mx-auto px-4 pt-2 pb-6 sm:pt-3 sm:pb-8 lg:pt-4 lg:pb-8">
          <motion.div {...springIn} className="max-w-2xl text-left space-y-4 sm:space-y-4.5">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-100 backdrop-blur-md border border-white/20 shadow-md">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
              <span style={{ fontFamily: "'Noto Serif Bengali', serif" }}>
                {t("প্রতিষ্ঠিত ২০২১ইং", "(Est. 2021)")}
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 5.2vw, 3.5rem)",
                fontFamily: "'Noto Serif Bengali', serif",
              }}
              className="font-extrabold leading-[1.2] md:leading-[1.22] tracking-tight text-white drop-shadow-md"
            >
              {t("একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে", "Building Faith, Knowledge & Character Together")}
            </h1>

            <p
              style={{ fontFamily: "'Noto Serif Bengali', serif" }}
              className="text-sm sm:text-base md:text-lg text-primary-foreground/90 leading-relaxed max-w-xl"
            >
              {t(
                "সাধারণ শিক্ষার আধুনিক মানসম্মত পাঠ্যক্রম এবং পবিত্র কুরআনের ঐশী আলো—এই দুইয়ের এক অনন্য মেলবন্ধনে আপনার সন্তানকে আদর্শ নাগরিক ও দ্বীনের খাঁটি খাদেম হিসেবে গড়ে তোলাই আমাদের অঙ্গীকার।",
                "Providing modern general education alongside authentic Quranic memorization across our two serene campuses in Kapasia, Gazipur."
              )}
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1.5">
              <Link to="/admission">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="squishy-button-gold font-bengali flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg"
                >
                  <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{t("ভর্তি তথ্য ও ফি", "Admission Info")}</span>
                </motion.button>
              </Link>

              <Link to="/downloads">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="squishy-button font-bengali flex items-center justify-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg backdrop-blur-md"
                >
                  <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{t("ডাউনলোড কর্নার", "Downloads")}</span>
                </motion.button>
              </Link>

              <Link to="/virtual-tour">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="squishy-button-outline border-white/40 text-white hover:bg-white/10 font-bengali flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm"
                >
                  <span className="text-xs sm:text-sm">🎥</span>
                  <span>{t("ভার্চুয়াল ট্যুর", "Virtual Tour")}</span>
                </motion.button>
              </Link>
            </div>

            {/* Quick Feature Badges */}
            <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-2 text-xs font-bengali text-slate-200">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm border border-white/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>{t("নূরানী ও নাজেরা", "Nurani & Nazara")}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm border border-white/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>{t("হিফজুল কুরআন", "Hifzul Quran")}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm border border-white/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>{t("জেনারেল প্লে—৫ম শ্রেণি", "Play—Class 5")}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm border border-white/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>{t("আবাসিক ও ডে-কেয়ার", "Boarding & Day")}</span>
              </span>
            </div>
          </motion.div>
        </div>

        <WaveDivider className="absolute bottom-0 left-0 right-0" />
      </section>

      <PwaHomeCard />

      {/* ================= STATS COUNTERS ================= */}
      <section className="py-14 sm:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-institutional p-6 text-center rounded-3xl border border-border/70 hover:shadow-lg transition-all group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <AnimatedCounter value={stat.value} />
                <div className="text-xs sm:text-sm font-bengali font-semibold text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ACADEMIC PROGRAMS SHOWCASE ================= */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{t("আমাদের শিক্ষা কারিকুলাম", "Academic Curriculum")}</span>
            </div>
            <h2 className="font-bengali text-2xl sm:text-4xl font-bold text-foreground">
              {t("শিক্ষা বিভাগসমূহ ও বিশেষ প্রোগ্রাম", "Educational Tracks & Special Programs")}
            </h2>
            <p className="mx-auto max-w-2xl font-bengali text-sm text-muted-foreground">
              {t(
                "দ্বীনি শিক্ষার সুদৃঢ় ভিত্তির সাথে সাথে আধুনিক যুগের উপযোগী স্কিল ও জ্ঞানের সমন্বয়ে প্রস্তুত কারিকুলাম।",
                "Harmonizing Islamic tarbiya with contemporary academic excellence across all age groups."
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {academicTracks.map((track, i) => {
              const Icon = track.icon;
              return (
                <motion.div
                  key={i}
                  {...springIn}
                  transition={springInDelay(i * 0.08)}
                  className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`h-11 w-11 rounded-2xl ${track.accent} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[11px] font-semibold bg-muted/60">
                        {lang === "bn" ? track.badge : track.badgeEn}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bengali text-lg font-bold text-foreground mb-1.5">
                        {lang === "bn" ? track.titleBn : track.titleEn}
                      </h3>
                      <p className="font-bengali text-xs text-muted-foreground leading-relaxed">
                        {lang === "bn" ? track.descBn : track.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-border/50 mt-5">
                    <Link
                      to={track.link}
                      className="inline-flex items-center gap-1.5 font-bengali text-xs font-bold text-primary hover:text-primary/80 transition-colors group"
                    >
                      <span>{t("বিস্তারিত কারিকুলাম", "View Curriculum")}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link to="/curriculum">
              <Button className="rounded-2xl px-6 py-6 font-bengali font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md">
                <span>{t("সম্পূর্ণ শিক্ষা কারিকুলাম ও সিলেবাস দেখুন", "View Full Curriculum & Syllabus")}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= WALL OF HUFFAZ PROMO BANNER ================= */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-primary/10 to-card p-8 sm:p-12 shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>{t("পবিত্র কুরআন হিফজ সমাবর্তন ও গৌরবগাঁথা", "Wall of Huffaz • Sacred Memorizers")}</span>
                </div>

                <h2 className="font-bengali text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
                  {t(
                    "আলহামদুলিল্লাহ, এ পর্যন্ত শতাধিক শিক্ষার্থী সম্পূর্ণ পবিত্র কুরআন হিফজ সম্পন্ন করেছেন",
                    "Praising Allah: Over 115+ Students have Completed Full Quran Memorization"
                  )}
                </h2>

                <p className="font-bengali text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {t(
                    "আন্তর্জাতিক মানের তাজবীদ ও মাখরাজ সহকারে কোমলমতি শিক্ষার্থীদের হৃদয়ে কুরআনে কারীম সংরক্ষণ আমাদের অন্যতম প্রধান সাধনা। প্রতি বছর বর্ণাঢ্য দস্তারবন্দী সমাবর্তন অনুষ্ঠানের মাধ্যমে তাদের মাথায় সম্মাননার পাগড়ি পরিয়ে দেওয়া হয়।",
                    "Preserving the Holy Quran in the hearts of young believers with Tajweed precision. Honored annually with honorary graduation turbans (Dastarbandi)."
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link to="/huffaz">
                    <Button className="rounded-xl font-bengali font-bold text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-md">
                      <Crown className="h-4 w-4" />
                      <span>{t("কৃতি হাফেজদের তালিকা দেখুন", "Explore Wall of Huffaz")}</span>
                    </Button>
                  </Link>

                  <Link to="/gallery">
                    <Button variant="outline" className="rounded-xl font-bengali text-xs sm:text-sm gap-2">
                      <Camera className="h-4 w-4" />
                      <span>{t("দস্তারবন্দী ফটো গ্যালারি", "Convocation Photos")}</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center bg-card/90 border border-amber-500/20 rounded-3xl p-6 text-center space-y-3 shadow-lg">
                <div className="h-16 w-16 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <Crown className="h-8 w-8 text-amber-600" />
                </div>
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-foreground">
                  ১১৮+ জন
                </div>
                <p className="font-bengali text-xs text-muted-foreground">
                  {t("২০২১ থেকে ২০২৬ পর্যন্ত সম্মানিত গ্র্যাজুয়েট হাফেজ", "Graduated Huffaz from 2021 to 2026")}
                </p>
                <div className="pt-2 border-t border-border/60 w-full flex justify-around text-xs font-semibold text-primary">
                  <span>২০২৪ ব্যাচ: ১৬ জন</span>
                  <span>২০২৫ ব্যাচ: ১৯ জন</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RELIGIOUS EDUCATION MESSAGE ================= */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div {...springIn} className="text-center">
            <div className="rounded-[2.5rem] border border-border/60 bg-card/95 p-6 sm:p-10 shadow-lg">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("পবিত্র আমানত", "A Sacred Trust")}</span>
              </div>
              <h2 className="mb-4 font-bengali text-2xl font-bold text-foreground md:text-3xl leading-tight">
                {t(
                  "সন্তানকে দ্বীনি শিক্ষায় গড়ে তোলা প্রতিটি অভিভাবকের পবিত্র আমানত",
                  "Nurturing a child with Deeni education is a sacred trust for every parent"
                )}
              </h2>
              <div className="mx-auto mb-6 max-w-3xl rounded-2xl bg-primary/5 p-4 sm:p-5 border border-primary/10">
                <p className="font-bengali text-sm sm:text-base font-semibold leading-relaxed text-foreground">
                  {t(
                    'রাসূল (সা.) ইরশাদ করেন: "তোমাদের মধ্যে সর্বোত্তম ঐ ব্যক্তি, যে নিজে কুরআন শিখে এবং অন্যকে শেখায়।" (সহীহ বুখারী)',
                    'The Prophet (peace be upon him) said: "The best among you is the one who learns the Quran and teaches it to others." (Sahih Bukhari)'
                  )}
                </p>
              </div>
              <p className="mx-auto max-w-2xl font-bengali text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t(
                  "পবিত্র কোরআনের শিক্ষায় শিক্ষিত সন্তান কেবল নিজের জন্য নয়, বরং কিয়ামতের কঠিন দিনে তার পিতা-মাতার জন্যও হবে সম্মানের মুকুট। পরকালীন মুক্তি এবং দুনিয়াবী জীবনে আদর্শ সন্তান উপহার দিতে আমরা আপনার পাশে আছি।",
                  "A child educated in the light of the Quran becomes a crown of honor for parents on the Day of Judgment. We stand beside you in nurturing your child toward lasting success in both worlds."
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= TWO CAMPUSES SHOWCASE ================= */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 space-y-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {t("ক্যাম্পাস পরিচিতি", "Campuses & Facilities")}
            </Badge>
            <h2 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
              {t("আমাদের আধুনিক ও সুপরিকল্পিত ক্যাম্পাস", "Our Modern & Well-Planned Campus")}
            </h2>
            <p className="font-bengali text-xs sm:text-sm text-muted-foreground">
              {t("কাপাসিয়ার প্রাণকেন্দ্রে শিক্ষার্থীদের জন্য সম্পূর্ণ নিরিবিলি, নিরাপদ ও সুশৃঙ্খল শিক্ষাঙ্গন", "Safe, disciplined, and academically rich campus in the heart of Kapasia, Gazipur")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Academic Wing */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 text-xs">
                    {t("একাডেমিক ভবন", "Academic Wing")}
                  </Badge>
                  <span className="text-xs font-semibold text-accent">
                    {t("প্লে — ৫ম ও হিফজ", "Play — Grade 5 & Hifz")}
                  </span>
                </div>
                <h3 className="font-bengali text-xl font-bold text-foreground">
                  {t("আননূর তাহফিজুল কুরআন মাদরাসা", "Annoor Tahfizul Quran Madrasa")}
                </h3>
                <p className="font-bengali text-xs text-muted-foreground leading-relaxed">
                  {t(
                    "সুবিশাল ক্যাম্পাস, আধুনিক মাল্টিমিডিয়া ক্লাসরুম, সহীহ তাজবীদে হিফজুল কুরআন বিভাগ, সেন্ট্রাল লাইব্রেরি ও প্রতিদিন বিকেলে শরীরচর্চা ও খেলাধুলার সুব্যবস্থা।",
                    "Spacious campus building, multimedia smart classrooms, authentic Tajweed Hifz department, library, and sports facility."
                  )}
                </p>
                <div className="space-y-2 text-xs font-bengali text-muted-foreground pt-2 border-t border-border/50">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{t("মেইন রোড, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর", "Main Road, Kapasia Bazar, Kapasia, Gazipur")}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>01581-818368, 01820-811511</span>
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                <Link to="/contact" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  <span>{t("যোগাযোগ ও ম্যাপ", "Contact & Location")}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/virtual-tour">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                    <span>🎥 {t("ভার্চুয়াল ট্যুর", "Virtual Tour")}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Boarding & Student Life */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-600 text-white font-semibold px-3 py-1 text-xs">
                    {t("আবাসিক ছাত্রাবাস", "Residential Boarding")}
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-600">
                    {t("আবাসিক ও ডে-কেয়ার", "Residential & Day Care")}
                  </span>
                </div>
                <h3 className="font-bengali text-xl font-bold text-foreground">
                  {t("নিরাপদ ও সুশৃঙ্খল আবাসন ব্যবস্থা", "Safe & Caring Boarding Facility")}
                </h3>
                <p className="font-bengali text-xs text-muted-foreground leading-relaxed">
                  {t(
                    "স্বাস্থ্যসম্মত পুষ্টিকর ৩ বেলা খাবার, সার্বক্ষণিক ওস্তাদগণের স্নেহময় তত্ত্বাবধান, সিসিটিভি ক্যামেরা নিয়ন্ত্রিত নিরাপত্তা ব্যবস্থা এবং শীতকালে গরম পানির সুবিধা।",
                    "Hygienic nutritious meals 3 times a day, 24/7 caring teacher supervision, round-the-clock CCTV security, and winter warm water."
                  )}
                </p>
                <div className="space-y-2 text-xs font-bengali text-muted-foreground pt-2 border-t border-border/50">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{t("সার্বক্ষণিক বিদ্যুৎ ও নিরাপদ বিশুদ্ধ পানি", "24/7 Power Backup & Pure Drinking Water")}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{t("নিয়মিত স্বাস্থ্য পরীক্ষা ও চিকিৎসা সেবা", "Regular Health Checkup & First-Aid Care")}</span>
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                <Link to="/admission-form" className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                  <span>{t("অনলাইন ভর্তি ফরম", "Admission Form")}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                    <span>{t("সুযোগ-সুবিধা জানুন", "View Facilities")}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STUDENTS FUTURE ================= */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-2">
            <h2 className="font-bengali text-2xl font-bold text-primary md:text-3xl">
              {t("আমাদের শিক্ষার্থীদের ভবিষ্যৎ", "Our Students' Future")}
            </h2>
            <p className="mx-auto max-w-2xl font-bengali text-sm text-muted-foreground leading-relaxed">
              {t(
                "আমরা বিশ্বাস করি, দ্বীনি শিক্ষার আলো ও সাধারণ শিক্ষার দক্ষতা—এই দুইয়ের সমন্বয়ই ভবিষ্যৎকে আলোকিত করে।",
                "Faith-based values coupled with real-world skills empower our graduates to lead society."
              )}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-bengali text-lg font-semibold text-foreground">
                {t("উচ্চশিক্ষা", "Higher Education")}
              </h3>
              <p className="mt-2 font-bengali text-xs sm:text-sm leading-6 text-muted-foreground">
                {t(
                  "অনার্স, মাস্টার্স ও পিএইচডি পর্যায়ের ডিগ্রি অর্জনের মাধ্যমে দেশ-বিদেশে মেধার স্বাক্ষর রাখার প্রস্তুতি।",
                  "Focus on Honors, Masters, and PhD degrees to leave a mark of excellence globally."
                )}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-bengali text-lg font-semibold text-foreground">
                {t("দ্বীনি নেতৃত্ব", "Religious Leadership")}
              </h3>
              <p className="mt-2 font-bengali text-xs sm:text-sm leading-6 text-muted-foreground">
                {t(
                  "হাফেজে কোরআন, ইসলামি চিন্তাবিদ, গবেষক ও শিক্ষক হিসেবে সমাজ গঠনে দায়িত্বশীল ভূমিকা পালন।",
                  "Prepare as Hafez, Islamic scholars, researchers, and dedicated teachers."
                )}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-bengali text-lg font-semibold text-foreground">
                {t("পেশাগত শ্রেষ্ঠত্ব", "Professional Excellence")}
              </h3>
              <p className="mt-2 font-bengali text-xs sm:text-sm leading-6 text-muted-foreground">
                {t(
                  "ডাক্তার, ইঞ্জিনিয়ার, প্রশাসনিক কর্মকর্তা ও উদ্যোক্তা হিসেবে নৈতিকতার সাথে কর্মজীবনে সাফল্য।",
                  "Build ethics and skills to become doctors, engineers, civil servants, and entrepreneurs."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DOWNLOAD CORNER PROMO ================= */}
      <section className="py-14 bg-gradient-to-r from-[#08185A] via-[#0D1D66] to-[#040D33] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-accent font-semibold border border-white/10">
                <FileDown className="h-3.5 w-3.5" />
                <span>{t("ডাউনলোড কর্নার ২০২৬", "Download Corner 2026")}</span>
              </div>
              <h3 className="font-bengali text-2xl sm:text-3xl font-bold text-white">
                {t("সিলেবাস, ক্লাস রুটিন ও ভর্তি ফরম সংগ্রহ করুন", "Download Syllabus, Routines & Forms")}
              </h3>
              <p className="font-bengali text-xs sm:text-sm text-slate-200/90 max-w-xl">
                {t(
                  "সকল শ্রেণির বার্ষিক সিলেবাস, পরীক্ষা ও আবাসিক আমল রুটিন এবং প্রিন্টযোগ্য ভর্তি ফরম পিডিএফ আকারে সহজেই ডাউনলোড করুন।",
                  "Instant PDF downloads for annual syllabuses, master class routines, and admission brochures."
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to="/downloads">
                <Button className="rounded-xl px-6 py-6 font-bengali font-bold text-sm bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shadow-lg">
                  <FileDown className="h-4 w-4" />
                  <span>{t("ডাউনলোড সেন্টারে যান", "Go to Downloads")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MADRASHA FEATURES ================= */}
      <section id="madrasha-features" ref={featuresSectionRef} className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...springIn} className="text-center mb-10 space-y-2">
            <h2 className="font-bengali text-2xl sm:text-4xl font-bold text-foreground">
              {t("মাদরাসার বৈশিষ্ট্য", "Features of the Madrasha")}
            </h2>
            <p className="font-bengali text-xs sm:text-sm text-muted-foreground">
              {t("কেন আপনার সন্তানের জন্য আননূর শিক্ষা পরিবার সেরা পছন্দ", "Key standout qualities of our institution")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featureGroups.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                {...springIn}
                transition={springInDelay(groupIndex * 0.08)}
                className="card-institutional h-full p-6 md:p-8 rounded-3xl"
              >
                <div className="mb-6 flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
                    {groupIndex + 1}
                  </span>
                  <div>
                    <h3 className="font-bengali text-xl font-bold text-foreground md:text-2xl">{group.title}</h3>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {group.points.map((point, pointIndex) => (
                    <div key={`${group.id}-${pointIndex}`} className="flex items-start gap-3 rounded-2xl bg-secondary/35 px-4 py-3.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <p className="font-bengali text-xs leading-6 text-muted-foreground md:text-[14px]">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GUARDIANS OPINIONS & REVIEWS ================= */}
      <section id="reviews" ref={reviewSectionRef} className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...springIn} className="text-center mb-6 space-y-2">
            <h2 className="font-bengali text-2xl sm:text-4xl font-bold text-foreground">
              {t("অভিভাবকদের মতামত", "What Guardians Say")}
            </h2>
            <p className="font-bengali text-xs sm:text-sm text-muted-foreground">
              {t("আমাদের শিক্ষার্থীদের অগ্রগতি ও পরিবেশ সম্পর্কে অভিভাবকগণের আন্তরিক মূল্যায়ন", "Feedback and real experiences shared by respected parents")}
            </p>
          </motion.div>

          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bengali font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-colors shadow-sm"
            >
              {showReviewForm ? t("বাতিল", "Cancel") : t("মতামত বা রিভিউ দিন", "Write a Review")}
            </button>
            <button
              type="button"
              onClick={() => void handleShareReviewLink()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 font-bengali text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{t("ফর্ম শেয়ার", "Share Form")}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleCopyReviewLink()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 font-bengali text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{t("লিংক কপি", "Copy Link")}</span>
            </button>
          </div>

          {shareFeedback ? (
            <p className="mb-6 text-center font-bengali text-xs text-muted-foreground">{shareFeedback}</p>
          ) : null}

          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/80 shadow-md rounded-3xl p-6 mb-10 max-w-2xl mx-auto"
            >
              {reviewSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="font-bengali text-lg text-foreground">
                    {t("ধন্যবাদ! আপনার রিভিউ জমা হয়েছে। পর্যালোচনার পর প্রকাশিত হবে।", "Thank you! Your review has been submitted for moderation.")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bengali text-xs font-semibold mb-1 block">{t("আপনার নাম", "Your Name")} *</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-background border border-border font-bengali text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bengali text-xs font-semibold mb-1 block">{t("আপনার সম্পর্ক", "Your Relation")} *</label>
                      <select
                        value={reviewRelation}
                        onChange={(e) => setReviewRelation(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-background border border-border font-bengali text-xs"
                        required
                      >
                        <option value="">{t("সিলেক্ট করুন", "Select")}</option>
                        <option value={t("অভিভাবক", "Guardian")}>{t("অভিভাবক", "Guardian")}</option>
                        <option value={t("প্রাক্তন শিক্ষার্থী", "Ex-Student")}>{t("প্রাক্তন শিক্ষার্থী", "Ex-Student")}</option>
                        <option value={t("স্থানীয় বাসিন্দা", "Local Resident")}>{t("স্থানীয় বাসিন্দা", "Local Resident")}</option>
                        <option value={t("শুভাকাঙ্ক্ষী", "Well Wisher")}>{t("শুভাকাঙ্ক্ষী", "Well Wisher")}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bengali text-xs font-semibold mb-1 block">{t("আপনার মতামত", "Your Review")} *</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border font-bengali text-xs"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={reviewLoading}
                    whileHover={{ scale: reviewLoading ? 1 : 1.02 }}
                    whileTap={{ scale: reviewLoading ? 1 : 0.98 }}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bengali font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {reviewLoading ? (
                      t("অপেক্ষা করুন...", "Please wait...")
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t("রিভিউ জমা দিন", "Submit Review")}</span>
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}

          {/* Reviews Carousel */}
          <div className="relative">
            {/* Mobile View */}
            <div className="relative md:hidden">
              <div
                className="overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {allReviews.map((item, i) => (
                    <div key={i} className="w-full flex-shrink-0 px-2">
                      <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bengali font-bold text-foreground text-sm">{item.name}</h4>
                            <p className="font-bengali text-xs text-muted-foreground">{item.relation}</p>
                          </div>
                        </div>
                        <p className="font-bengali text-xs leading-relaxed text-muted-foreground italic">
                          "{lang === "bn" ? item.review : item.reviewEn || item.review}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop View */}
            <div className="relative hidden md:block">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${Math.min(currentSlide, Math.ceil(allReviews.length / 2) - 1) * 100
                      }%)`,
                  }}
                >
                  {Array.from({ length: Math.ceil(allReviews.length / 2) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-2 gap-6 px-2">
                        {allReviews.slice(slideIndex * 2, (slideIndex + 1) * 2).map((item, i) => (
                          <div key={i} className="bg-card border border-border/70 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                                {item.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bengali font-bold text-foreground text-sm">{item.name}</h4>
                                <p className="font-bengali text-xs text-muted-foreground">{item.relation}</p>
                              </div>
                            </div>
                            <p className="font-bengali text-xs leading-relaxed text-muted-foreground italic">
                              "{lang === "bn" ? item.review : item.reviewEn || item.review}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dots */}
            {allReviews.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: isMobile ? allReviews.length : Math.ceil(allReviews.length / 2) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${currentSlide === i ? "bg-primary w-8" : "bg-muted-foreground/30 w-2"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= RECENT NOTICES ================= */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div {...springIn} className="text-center mb-10 space-y-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {t("জরুরি বার্তা", "Announcements")}
            </Badge>
            <h2 className="font-bengali text-2xl sm:text-4xl font-bold text-foreground">
              {t("সাম্প্রতিক নোটিশ ও বিজ্ঞপ্তি", "Recent Notices & Announcements")}
            </h2>
          </motion.div>

          <div className="space-y-4">
            {displayedNotices.map((notice, i) => {
              const noticeDate = new Date(notice.createdAt);
              const dayLabel = noticeDate.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { day: "2-digit" });
              const monthLabel = noticeDate.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { month: "short" });
              const noticeTitle = lang === "bn" ? notice.titleBn : notice.titleEn || notice.titleBn;
              return (
                <motion.div
                  key={notice.id || i}
                  {...springIn}
                  transition={springInDelay(i * 0.08)}
                  className="rounded-2xl border border-border/70 bg-card p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 rounded-2xl px-4 py-2 text-center shrink-0 border border-primary/15">
                      <div className="text-[11px] font-bold text-primary uppercase">{monthLabel}</div>
                      <div className="text-xl font-display font-extrabold text-foreground">{dayLabel}</div>
                    </div>
                    <div>
                      <p className="font-bengali text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {noticeTitle}
                      </p>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{noticeDate.toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <Link to="/notices" className="text-xs font-semibold text-primary hover:underline shrink-0 hidden sm:inline-flex items-center gap-1">
                    <span>{t("দেখুন", "View")}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/notices">
              <Button variant="outline" className="rounded-xl font-bengali text-xs font-bold gap-2">
                <span>{t("সকল নোটিশ বোর্ড দেখুন", "View All Notices")}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...springIn} className="text-center mb-10 space-y-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {t("জিজ্ঞাসা ও উত্তর", "FAQ")}
            </Badge>
            <h2 className="font-bengali text-2xl sm:text-4xl font-bold text-foreground">
              {t("অভিভাবকদের সচরাচর জিজ্ঞাসা", "Frequently Asked Questions")}
            </h2>
            <p className="font-bengali text-xs text-muted-foreground">
              {t("ভর্তি, ফি ও অ্যাকাডেমিক পরিবেশ সম্পর্কিত সাধারণ প্রশ্নের উত্তর", "Quick answers regarding admission, boarding, and curriculum")}
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: t("ভর্তির প্রক্রিয়া ও সময় কখন?", "What is the admission timeline and process?"),
                a: t(
                  "প্রতি বছর নভেম্বর থেকে মার্চ মাস পর্যন্ত নতুন শিক্ষাবর্ষের ভর্তি কার্যক্রম পরিচালিত হয়। অনলাইনে অথবা ক্যাম্পাসে সরাসরি এসে ফরম সংগ্রহ করা যাবে। প্রাথমিক মৌখিক ও লিখিত মূল্যায়নের পর ভর্তি নিশ্চিত করা হয়।",
                  "Admissions run from November through March. Forms are available online and on campus. Enrollment is confirmed following entrance assessment."
                ),
              },
              {
                q: t("মাসিক বেতন ও ফি কাঠামো কেমন?", "What is the fee structure?"),
                a: t(
                  "মাসিক টিউশন ফি অনাবাসিক শিক্ষার্থীদের জন্য ৳১,০০০ — ৳২,৫০০ এবং আবাসিক শিক্ষার্থীদের জন্য ৳৫,০০০ — ৳৯,০০০ (আবাসিক বাসস্থান ও পুষ্টিকর খাবারসহ)। এককালীন ভর্তি ফি ৳৩,০০০। বিস্তারিত জানতে 'ভর্তি তথ্য' পেজ দেখুন।",
                  "Day tuition is ৳1,000 — ৳2,500/month. Residential boarding is ৳5,000 — ৳9,000/month including meals and lodging. One-time admission fee is ৳3,000."
                ),
              },
              {
                q: t("মাদরাসার আবাসন ও অনাবাসিক ব্যবস্থা সম্পর্কে জানতে চাই", "Can you explain the residential and day-care options?"),
                a: t(
                  "আমাদের মাদরাসায় অনাবাসিক, ডে-কেয়ার এবং সম্পূর্ণ আবাসিক তিন ধরনের ব্যবস্থা রয়েছে। আবাসিক শিক্ষার্থীদের জন্য সার্বক্ষণিক ওস্তাদগণের সান্নিধ্যে থাকা, নিবিড় পরিচর্যা ও স্বাস্থ্যসম্মত খাবারের নির্ভরযোগ্য পরিবেশ নিশ্চিত করা হয়।",
                  "We offer Day-care, Non-residential, and full Residential boarding options with round-the-clock teacher mentorship and hygienic meals."
                ),
              },
              {
                q: t("হিফজের পাশাপাশি জেনারেল ক্লাসের সুবিধা কেমন?", "How are Hifz and general schooling integrated?"),
                a: t(
                  "আমাদের মূল বৈশিষ্ট্যই হলো সমন্বিত শিক্ষা। হিফজের নতুন সবক ও দাওরের পাশাপাশি প্রতিদিন গণিত, ইংরেজি, বাংলা ও সাধারণ জ্ঞান ক্লাসে পাঠদান করা হয়, যার ফলে শিক্ষার্থী যেকোনো সময় মূলধারার স্কুলে কৃতিত্বের সাথে অংশ নিতে পারে।",
                  "Our core strength is integrated learning. Alongside Hifz lessons, daily periods for Math, English, Bengali, and Science are included in the master routine."
                ),
              },
              {
                q: t("আবাসিক হোস্টেলে খাবার ও নিরাপত্তার ব্যবস্থা কেমন?", "What are the boarding and security standards?"),
                a: t(
                  "সম্পূর্ণ সিসিটিভি ক্যামেরা নিয়ন্ত্রিত ও ২৪ ঘণ্টা সিকিউরিটি গার্ড দ্বারা সুরক্ষিত। ঘরোয়া স্বাস্থ্যসম্মত ৩ বেলা খাবার, শীতকালে গরম পানির ব্যবস্থা এবং নিবেদিত খাদেম দ্বারা ছাত্রদের সার্বক্ষণিক সেবা প্রদান করা হয়।",
                  "Round-the-clock CCTV surveillance, trained security guards, hygienic meals, winter warm water, and caring residential staff."
                ),
              },
            ].map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border/70 rounded-2xl px-6 shadow-xs overflow-hidden"
              >
                <AccordionTrigger className="font-bengali text-foreground text-left hover:no-underline py-4 text-sm sm:text-base font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-bengali text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default Index;
