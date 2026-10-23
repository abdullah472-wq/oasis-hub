import { useState, useEffect, useRef, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
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
  ChevronLeft,
  ChevronRight,
  Eye,
  Camera,
  HeartHandshake,
  Building2,
  DoorOpen,
  Sun,
  Lock,
  Zap,
  Droplets,
  UtensilsCrossed,
  Star,
  ExternalLink,
  Globe,
} from "lucide-react";
import type { Review, ReviewPlatform } from "@/lib/reviews";
import { useLanguage } from "@/contexts/LanguageContext";
import PwaHomeCard from "@/components/PwaHomeCard";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import { getNotices, type Notice } from "@/lib/notices";
import { springIn, springInDelay } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/siteSettings";

const GoogleIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const FacebookIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TrustpilotIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#00B67A" d="M12 0l3.708 7.514 8.292 1.205-6 5.849 1.416 8.258L12 18.927l-7.416 3.9 1.416-8.258-6-5.849 8.292-1.205z" />
    <path fill="#005128" d="M12 18.927l-7.416 3.9 1.416-8.258-6-5.849 8.292-1.205L12 0v18.927z" opacity="0.3" />
  </svg>
);

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
  const location = useLocation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRelation, setReviewRelation] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | ReviewPlatform>("all");
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

  const scrollToTargetElement = (elementId: string, smooth = true) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const nav = document.querySelector("nav");
    const navHeight = nav ? Math.min(nav.offsetHeight, 90) : 80;
    const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    const hash = location.hash || window.location.hash;
    if (!hash) return;

    if (hash === "#write-review") {
      setShowReviewForm(true);
    }

    const sectionId = hash.replace(/^#/, "");
    const timer1 = setTimeout(() => {
      scrollToTargetElement(sectionId, true);
    }, 100);
    const timer2 = setTimeout(() => {
      scrollToTargetElement(sectionId, true);
    }, 350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.hash]);

  const defaultReviews: Review[] = [
    {
      name: t("মোঃ রহিম উদ্দিন", "Md. Rahim Uddin"),
      relation: t("অভিভাবক · হিফজ বিভাগ", "Guardian · Hifz Dept"),
      review: t(
        '"আমার সন্তান এই মাদরাসায় পড়ার পর খুবই ভালো পরিবর্তন দেখতে পাচ্ছি। সে এখন নামাজ পড়ে, কোরআন পড়ে এবং আগের চেয়ে অনেক বেশি বিনয়ী ও দায়িত্ববান।"',
        '"I have seen great changes in my child since joining this madrasha. Now he prays, reads the Quran, and is much more polite and responsible."'
      ),
      rating: 5,
      platform: "google",
      approved: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
      name: t("মুহাম্মদ রফিকুল ইসলাম", "Muhammad Rafiqul Islam"),
      relation: t("অভিভাবক · ৬ষ্ঠ শ্রেণি", "Guardian · Class 6"),
      review: t(
        '"এই প্রতিষ্ঠানের শিক্ষকরা খুবই আদর স্নেহের সাথে পড়াশোনা করান। সুশৃঙ্খল ও আন্তরিক পরিবেশে সন্তান খুব আনন্দের সাথে সহীহ কোরআন ও প্রাতিষ্ঠানিক শিক্ষা শিখছে।"',
        '"The teachers here teach with great care and dedication. In a disciplined and warm environment, my child is happily learning the Quran and academic education."'
      ),
      rating: 5,
      platform: "facebook",
      approved: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
    {
      name: t("আব্দুল করিম", "Abdul Karim"),
      relation: t("অভিভাবক · নূরানী বিভাগ", "Guardian · Noorani Dept"),
      review: t(
        '"মাদরাসার জেনারেল ও হিফজ সমন্বিত পাঠ্যক্রম অত্যন্ত প্রশংসনীয়। সন্তানকে এখানে রেখে আমি নিশ্চিত যে সে সঠিক ইসলামিক ও প্রাতিষ্ঠানিক শিক্ষা পাচ্ছে।"',
        '"The integrated general and Hifz curriculum is commendable. I am confident that my child is receiving proper Islamic and formal schooling."'
      ),
      rating: 5,
      platform: "google",
      approved: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    },
    {
      name: t("সালমা আক্তার", "Salma Akter"),
      relation: t("অভিভাবক · হিফজ সমাপনী", "Guardian · Hifz Graduate"),
      review: t(
        '"আমার ছেলে এখান থেকে অল্প সময়ে অত্যন্ত সুনামের সাথে হিফজ সম্পন্ন করেছে। শিক্ষকদের নিবিড় তত্ত্বাবধানে সে সহীহ তাজবীদে কুরআন মুখস্থ করেছে। আমরা গর্বিত।"',
        '"My son completed his Hifz here with distinction. Under the close care of the teachers, he memorized the Quran with proper Tajweed. We are proud."'
      ),
      rating: 5,
      platform: "trustpilot",
      approved: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    },
    {
      name: t("ইঞ্জিনিয়ার তানভীর আহমেদ", "Engr. Tanvir Ahmed"),
      relation: t("অভিভাবক ও শুভানুধ্যায়ী", "Guardian & Well-wisher"),
      review: t(
        '"মাদরাসার নিজস্ব ৫ তলা সুরম্য ভবন, সিসিটিভি নিরাপত্তা ও স্বাস্থ্যসম্মত পরিবেশ দেখে অত্যন্ত সন্তুষ্ট হয়েছি। বর্তমান সময়ে এমন আদর্শ ইসলামিক বিদ্যাপীঠ সত্যিই বিরল।"',
        '"Very impressed by the institution\'s own 5-story modern building, CCTV security, and hygienic environment. Truly a standout modern Islamic academy."'
      ),
      rating: 5,
      platform: "facebook",
      approved: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    },
    {
      name: t("মাওলানা মুস্তাফিজুর রহমান", "Mawlana Mustafizur Rahman"),
      relation: t("স্থানীয় বাসিন্দা ও অভিভাবক", "Local Resident & Guardian"),
      review: t(
        '"ওস্তাদদের সুন্দর আখলাক এবং ছাত্রদের নিয়মিত তিলাওয়াত শুনলে মন জুড়িয়ে যায়। এলাকার সেরা ও বিশ্বস্ত মাদরাসা হিসেবে আননূর শিক্ষা পরিবার শীর্ষস্থানে রয়েছে।"',
        '"The exemplary character of the teachers and beautiful recitation of the students is truly inspiring. Annoor is undoubtedly the top trusted madrasa in the area."'
      ),
      rating: 5,
      platform: "google",
      approved: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    },
    {
      name: t("ফারহানা ইয়াসমিন", "Farhana Yasmin"),
      relation: t("হিফজ ও ইসলামিক শিক্ষা অভিভাবক", "Hifz & Islamic Guardian"),
      review: t(
        '"মাদরাসার ওয়েবসাইট থেকে সরাসরি আবেদন করে ও যোগাযোগ করে খুবই চমৎকার অভিজ্ঞতা পেয়েছি। ভর্তি প্রক্রিয়া, নিয়মিত অগ্রগতি ও শিক্ষকদের সার্বক্ষণিক সহযোগিতা প্রশংসনীয়।"',
        '"A wonderful experience applying directly through the madrasa website. The transparent admission system and continuous care from teachers are truly commendable."'
      ),
      rating: 5,
      platform: "website",
      approved: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    },
    {
      name: t("মাসুদ রানা", "Masud Rana"),
      relation: t("অভিভাবক · নাজেরা শাখা", "Guardian · Nazera"),
      review: t(
        '"অনলাইনে নিয়মিত পরীক্ষার রেজাল্ট, বার্ষিক সিলেবাস ও নোটিশ পাওয়া যায় যা আমাদের মতো কর্মজীবী অভিভাবকদের জন্য অনেক বড় স্বস্তি। আননূর শিক্ষা পরিবারের সফলতা কামনা করি।"',
        '"Getting exam results, syllabus, and notices directly online is a huge relief for working parents like us. Wishing Annoor continued success."'
      ),
      rating: 5,
      platform: "website",
      approved: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    },
  ];

  const allReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return defaultReviews;
    }
    const customNames = new Set(reviews.map((r) => r.name.trim().toLowerCase()));
    const nonDuplicatedDefaults = defaultReviews.filter(
      (d) => !customNames.has(d.name.trim().toLowerCase())
    );
    return [...reviews, ...nonDuplicatedDefaults];
  }, [reviews, defaultReviews]);

  const filteredReviews = useMemo(() => {
    if (selectedPlatform === "all") return allReviews;
    return allReviews.filter((r) => (r.platform || "google") === selectedPlatform);
  }, [allReviews, selectedPlatform]);

  const platformCounts = useMemo(() => {
    return {
      all: allReviews.length,
      google: allReviews.filter((r) => (r.platform || "google") === "google").length,
      facebook: allReviews.filter((r) => r.platform === "facebook").length,
      trustpilot: allReviews.filter((r) => r.platform === "trustpilot").length,
      website: allReviews.filter((r) => r.platform === "website").length,
    };
  }, [allReviews]);

  useEffect(() => {
    if (filteredReviews.length === 0) return;
    const totalSlides = isMobile ? filteredReviews.length : Math.ceil(filteredReviews.length / 2);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [filteredReviews.length, isMobile]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const totalSlides = isMobile ? filteredReviews.length : Math.ceil(filteredReviews.length / 2);
    if (Math.abs(diff) > 50 && totalSlides > 1) {
      if (diff > 0) setCurrentSlide((prev) => (prev + 1) % totalSlides);
      else setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewRelation || !reviewText.trim()) {
      toast.error(t("অনুগ্রহ করে সকল তথ্য পূরণ করুন", "Please fill in all required fields"));
      return;
    }
    setReviewLoading(true);
    try {
      const { submitReview } = await import("@/lib/reviews");
      await submitReview({
        name: reviewName.trim(),
        relation: reviewRelation.trim(),
        review: reviewText.trim(),
        reviewEn: reviewText.trim(),
        rating: reviewRating,
        platform: "website",
      });
      setReviewSubmitted(true);
      toast.success(
        t("ধন্যবাদ! আপনার রিভিউ জমা হয়েছে। পর্যালোচনার পর প্রকাশিত হবে।", "Thank you! Your review has been submitted for moderation.")
      );
      setReviewName("");
      setReviewRelation("");
      setReviewText("");
      setReviewRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(t("রিভিউ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Failed to submit review. Please try again."));
    } finally {
      setReviewLoading(false);
    }
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
    { icon: Users, value: "110+", label: t("বর্তমান শিক্ষার্থী", "Active Students") },
    { icon: Crown, value: "40+", label: t("কৃতি হাফেজ সমাবর্তন", "Huffaz Graduates") },
    { icon: BookOpen, value: "10+", label: t("অভিজ্ঞ শিক্ষকমণ্ডলী", "Expert Teachers") },
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
                "Providing modern general education alongside authentic Quranic memorization at our serene campus in Kapasia, Gazipur."
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
                    "আলহামদুলিল্লাহ, এ পর্যন্ত ৪০+ শিক্ষার্থী সম্পূর্ণ পবিত্র কুরআন হিফজ সম্পন্ন করেছেন",
                    "Praising Allah: Over 40+ Students have Completed Full Quran Memorization"
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
                  {t("৪০+ জন", "40+ Huffaz")}
                </div>
                <p className="font-bengali text-xs text-muted-foreground">
                  {t("২০২১ থেকে ২০২৬ পর্যন্ত সম্মানিত গ্র্যাজুয়েট হাফেজ", "Graduated Huffaz from 2021 to 2026")}
                </p>
                <div className="pt-2 border-t border-border/60 w-full flex justify-around text-xs font-semibold text-primary">
                  <span>{t("২০২৪ ব্যাচ: ৬ জন", "Batch 2024: 6")}</span>
                  <span>{t("২০২৫ ব্যাচ: ৯ জন", "Batch 2025: 9")}</span>
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

      {/* ================= CAMPUS INFRASTRUCTURE & FACILITIES ================= */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>{t("ক্যাম্পাস পরিকাঠামো ও সুবিধা", "Campus Infrastructure & Facilities")}</span>
            </div>
            <h2 className="font-bengali text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              {t("৫ তলা নিজস্ব আধুনিক ভবন ও বিশ্বমানের নিরাপদ পরিবেশ", "Our 5-Story Own Modern Campus & World-Class Safe Environment")}
            </h2>
            <p className="font-bengali text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t(
                "কাপাসিয়ার প্রাণকেন্দ্রে শিক্ষার্থীদের সর্বোচ্চ নিরাপত্তা, মানসম্মত ক্লাসরুম, শারীরিক প্রফুল্লতা ও সুশৃঙ্খল পরিবেশের সমন্বয়ে গড়ে তোলা নিজস্ব স্থায়ী শিক্ষাঙ্গন।",
                "A permanent 5-story private campus in the heart of Kapasia designed for maximum student safety, dedicated spacious learning, and physical & moral development."
              )}
            </p>
          </div>

          <div className="space-y-8">
            {/* 1. Featured Master Banner: 5-Story Own Modern Building */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-950/10 p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden group">
              {/* Decorative ambient glow */}
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />

              <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-3 py-1 text-xs shadow-sm">
                      <Building2 className="h-3.5 w-3.5 mr-1.5" />
                      {t("৫ তলা নিজস্ব আধুনিক ভবন", "5-Story Own Modern Building")}
                    </Badge>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {t("১০০% নিজস্ব স্থায়ী ভবন • কোনো ভাড়া বাড়ি নয়", "100% Own Permanent Campus • Not a Rented Facility")}
                    </span>
                  </div>

                  <h3 className="font-bengali text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground leading-snug">
                    {t(
                      "সুপরিকল্পিত ৫ তলা সুরম্য নিজস্ব ক্যাম্পাস — দীর্ঘস্থায়ী ও নিরিবিলি শিক্ষাঙ্গন",
                      "A Well-Planned 5-Story Permanent Campus for Undisturbed Learning"
                    )}
                  </h3>

                  <p className="font-bengali text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t(
                      `ভাড়া করা কোনো অস্থায়ী বাড়িতে নয়, বরং শিক্ষার্থীদের নিরবচ্ছিন্ন ভবিষ্যৎ ও স্থায়ী নিরাপদ পরিবেশ নিশ্চিত করতে ${settings.institution_name_bn || "আননূর তাহফিজুল কুরআন মাদরাসা"} পরিচালিত হচ্ছে নিজস্ব ৫ তলা বিশিষ্ট আধুনিক সুরম্য ভবনে। যেখানে প্রশাসনিক দফতর, একাডেমিক জোন, আন্তর্জাতিক মানের হিফজ বিভাগ ও স্বাস্থ্যসম্মত ছাত্রাবাস অত্যন্ত সুশৃঙ্খলভাবে বিন্যস্ত।`,
                      `Operating from a dedicated, permanent 5-story building rather than a rented property, ${settings.institution_name_en || "Annoor Madrasa"} guarantees uninterrupted safety and comfort with structured academic wings, an international standard Hifz department, library, and boarding facilities.`
                    )}
                  </p>

                  {/* Planned Floor-by-Floor Architecture Tags */}
                  <div className="pt-2 space-y-2">
                    <p className="font-bengali text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("ভবনের সুপরিকল্পিত তলা-ভিত্তিক বিন্যাস:", "Planned Floor-by-Floor Architecture:")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bengali">
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/70 backdrop-blur-sm px-3.5 py-2.5 text-foreground hover:border-emerald-500/40 transition-colors">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">G</span>
                        <span>{t("গ্রাউন্ড ফ্লোর: অফিস, অভ্যর্থনা ও অভিভাবক লাউঞ্জ", "Ground: Office, Reception & Guest Lounge")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/70 backdrop-blur-sm px-3.5 py-2.5 text-foreground hover:border-teal-500/40 transition-colors">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold text-xs">{t("১–৩", "1–3")}</span>
                        <span>{t("১ম — ৩য় তলা: প্লে থেকে ৫ম শ্রেণির আলাদা প্রশস্ত ক্লাসরুম", "1st–3rd: Separate Classrooms for Play–Grade 5")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/70 backdrop-blur-sm px-3.5 py-2.5 text-foreground hover:border-amber-500/40 transition-colors">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">{t("৪র্থ", "4th")}</span>
                        <span>{t("৪র্থ তলা: হিফজুল কুরআন বিভাগ ও সেন্ট্রাল লাইব্রেরি", "4th: Hifzul Quran Department & Library")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/70 backdrop-blur-sm px-3.5 py-2.5 text-foreground hover:border-blue-500/40 transition-colors">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs">{t("৫ম", "5th")}</span>
                        <span>{t("৫ম তলা: আবাসিক ছাত্রাবাস ও পরিচ্ছন্ন ডাইনিং", "5th: Residential Boarding & Dining")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Quick Highlights & Action Card */}
                <div className="lg:col-span-4 flex flex-col justify-center gap-4 bg-muted/40 dark:bg-muted/20 border border-border/70 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
                      <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-3xl font-black text-foreground font-mono">{t("৫ তলা", "5-Story")}</span>
                      <p className="text-xs text-muted-foreground font-bengali font-semibold mt-0.5">
                        {t("স্থায়ী নিজস্ব আধুনিক ভবন", "Permanent Private Campus")}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-2.5 text-xs font-bengali text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{t(settings.address_boys_campus_bn || "মেইন রোড, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর", settings.address_boys_campus_en || "Main Road, Kapasia Bazar, Gazipur")}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{[settings.phone_secondary, settings.phone_primary].filter(Boolean).join(", ") || "01581-818368, 01820-811511"}</span>
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <Link to="/contact" className="w-full">
                      <Button variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl gap-1.5 shadow-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{t("ক্যাম্পাস লোকেশন ও ম্যাপ", "Campus Location & Map")}</span>
                      </Button>
                    </Link>
                    <Link to="/virtual-tour" className="w-full">
                      <Button variant="outline" className="w-full text-xs rounded-xl gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 border-border">
                        <span>🎥 {t("ভার্চুয়াল ক্যাম্পাস ট্যুর", "Virtual Campus Tour")}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Three Core Infrastructure Pillars Grid */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1: আলাদা আলাদা ক্লাস রুম */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <DoorOpen className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                      {t("সুপরিসর ক্লাসরুম", "Spacious Classrooms")}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bengali text-lg sm:text-xl font-bold text-foreground">
                      {t("আলাদা আলাদা সুপরিসর ক্লাসরুম", "Dedicated Separate Classrooms")}
                    </h4>
                    <p className="font-bengali text-xs text-muted-foreground mt-2 leading-relaxed">
                      {t(
                        "এক শ্রেণির পড়াশোনার কোলাহল যাতে অন্য শ্রেণিতে কোনো ব্যাঘাত না ঘটায়, সেজন্য প্রতিটি শ্রেণির শিক্ষার্থীদের জন্য রয়েছে সম্পূর্ণ পৃথক ও প্রশস্ত ক্লাসরুম। ক্লাসরুমগুলোতে রয়েছে পর্যাপ্ত প্রাকৃতিক আলো-বাতাস এবং আধুনিক হোয়াইটবোর্ড।",
                        "To eliminate classroom disturbance, each grade operates in a completely separate, airy, and well-lit classroom equipped with modern learning boards."
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-bengali text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t("প্রতিটি ক্লাসের জন্য সম্পূর্ণ পৃথক ও কোলাহলমুক্ত পাঠদান কক্ষ", "Fully segregated and noise-free study environment")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t("পর্যাপ্ত প্রাকৃতিক আলো-বাতাস ও মাল্টিমিডিয়া সাপোর্ট", "Natural air-flow, modern lighting & smart displays")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t("সীমিত শিক্ষার্থী আসন — শিক্ষক প্রতিটি শিশুর প্রতি নিবিড় যত্নশীল", "Optimal teacher-student ratio for personal care")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-border/50">
                  <Link to="/about" className="text-xs font-bold text-emerald-600 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                    <span>{t("একাডেমিক ক্লাসরুম সম্পর্কে জানুন", "Explore Academic Rooms")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Card 2: খেলার জন্য সুবিশাল ছাদ (৫ ফিট বাউন্ডারি সহ) */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Sun className="h-6 w-6" />
                    </div>
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                      {t("৫ ফিট বাউন্ডারি ওয়াল", "5ft Safety Wall")}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bengali text-lg sm:text-xl font-bold text-foreground">
                      {t("খেলার জন্য সুবিশাল ছাদ (৫ ফিট বাউন্ডারি সহ)", "Spacious Rooftop Playzone (5ft Safety Wall)")}
                    </h4>
                    <p className="font-bengali text-xs text-muted-foreground mt-2 leading-relaxed">
                      {t(
                        "শিক্ষার্থীদের মানসিক প্রফুল্লতা ও শারীরিক সুস্থতার জন্য ভবনের শীর্ষে রয়েছে উন্মুক্ত সুবিশাল খেলার ছাদ। ছোট শিশুদের ১০০% নিরাপত্তার নিশ্চয়তায় পুরো ছাদের চারপাশ জুড়ে নির্মাণ করা হয়েছে ৫ ফিট উঁচু মজবুত নিরাপত্তা বাউন্ডারি ওয়াল।",
                        "For physical wellness and recreational freshness, the open rooftop features a secured 5ft high reinforced boundary wall ensuring complete safety during daily sports and outdoor activities."
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-bengali text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t("শিশুদের সুরক্ষায় ছাদের চারপাশে ৫ ফিট উঁচু মজবুত বাউন্ডারি ওয়াল", "5-foot high perimeter boundary wall for child safety")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t("প্রতিদিন বিকেলে ওস্তাদগণের উপস্থিতিতে শরীরচর্চা ও খেলাধুলা", "Daily afternoon supervised physical exercise and play")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t("উন্মুক্ত বাতাস ও মনোরম পরিবেশে মানসিক বিকাশ ও সতেজতা", "Open-air refreshing ambiance promoting mental health")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-border/50">
                  <Link to="/gallery" className="text-xs font-bold text-amber-600 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                    <span>{t("খেলার মাঠ ও ছাদের ছবি দেখুন", "View Play Area Photos")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Card 3: ২৪ ঘণ্টা সিকিউরিটি গার্ড এবং গেট লক */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Lock className="h-6 w-6" />
                    </div>
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                      {t("২৪/৭ সার্বক্ষণিক গার্ড", "24/7 Guarded")}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bengali text-lg sm:text-xl font-bold text-foreground">
                      {t("২৪ ঘণ্টা সিকিউরিটি গার্ড ও সার্বক্ষণিক গেট লক", "24-Hour Security Guard & Locked Gate System")}
                    </h4>
                    <p className="font-bengali text-xs text-muted-foreground mt-2 leading-relaxed">
                      {t(
                        "আমাদের মাদরাসায় শিক্ষার্থীদের নিরাপত্তাই প্রধান অগ্রাধিকার। প্রধান ফটকে সার্বক্ষণিক ২৪ ঘণ্টা বিশ্বস্ত সিকিউরিটি গার্ড দায়িত্ব পালন করেন এবং গেট সবসময় তালাবদ্ধ (Gate Locked) রাখা হয়। অনুমতি ও অভিভাবক ছাড়া কোনো বহিরাগতের প্রবেশ নিষেধ।",
                        "Student safety is our utmost priority. The entrance gate remains securely locked 24/7 guarded by trained security personnel. Strictly no unauthorized visitors are permitted."
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-bengali text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{t("২৪ ঘণ্টা সার্বক্ষণিক ইউনিফর্মধারী প্রশিক্ষিত সিকিউরিটি গার্ড", "24/7 active vigilant security guard protection")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{t("প্রধান ফটক সর্বদা তালাবদ্ধ ও কঠোর বহিরাগত প্রবেশ নিষেধাজ্ঞা", "Main gate strictly locked with visitor log control")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{t("ক্যাম্পাস, সিঁড়ি ও করিডোরে সার্বক্ষণিক হাই-ডেফিনিশন CCTV নজরদারি", "HD CCTV surveillance throughout all floors & entryways")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-border/50">
                  <Link to="/admission-form" className="text-xs font-bold text-blue-600 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                    <span>{t("অনলাইন ভর্তি আবেদন করুন", "Apply for Admission")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Bottom Quick Facilities Strip (৪টি সার্বক্ষণিক নিশ্চয়তা) */}
            <div className="rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md p-5 sm:p-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bengali">
                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/40 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{t("সার্বক্ষণিক বিদ্যুৎ", "24/7 Power")}</p>
                    <p className="text-[11px] text-muted-foreground">{t("শক্তিশালী জেনারেটর ব্যাকআপ", "Generator backup")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/40 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{t("নিরাপদ বিশুদ্ধ পানি", "Pure Drinking Water")}</p>
                    <p className="text-[11px] text-muted-foreground">{t("উন্নত ফিল্টারিং ব্যবস্থা", "Modern multi-stage filter")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/40 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{t("স্বাস্থ্যসম্মত ৩ বেলা খাবার", "Nutritious 3 Meals")}</p>
                    <p className="text-[11px] text-muted-foreground">{t("আবাসিকদের জন্য টাটকা খাবার", "Hygienic fresh diet")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/40 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{t("শীতকালে গরম পানি", "Winter Warm Water")}</p>
                    <p className="text-[11px] text-muted-foreground">{t("অজু ও গোসলের বিশেষ সুবিধা", "Geyser warm water for wudu")}</p>
                  </div>
                </div>
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
      <section id="madrasha-features" ref={featuresSectionRef} className="py-16 scroll-mt-24 sm:scroll-mt-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...springIn} className="text-center mb-10 space-y-2">
            <h2 className="font-bengali text-2xl sm:text-4xl font-bold text-foreground">
              {t("মাদরাসার বৈশিষ্ট্য", "Features of the Madrasha")}
            </h2>
            <p className="font-bengali text-xs sm:text-sm text-muted-foreground">
              {t("কেন আপনার সন্তানের জন্য আননূর তাহফিজুল কুরআন মাদ্রাসা সেরা পছন্দ", "Key standout qualities of our institution")}
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

      {/* ================= GUARDIANS OPINIONS & PLATFORM REVIEWS ================= */}
      <section id="reviews" ref={reviewSectionRef} className="py-16 sm:py-20 bg-muted/20 relative overflow-hidden scroll-mt-24 sm:scroll-mt-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...springIn} className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary font-bengali">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("অভিভাবকদের অভিজ্ঞতা ও পাবলিক রিভিউ", "Guardian Experience & Public Reviews")}</span>
            </div>
            <h2 className="font-bengali text-2xl sm:text-4xl font-bold text-foreground">
              {t("অভিভাবকদের মতামত ও রেটিং", "Guardian Ratings & Testimonials")}
            </h2>
            <p className="font-bengali text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Google Business, Facebook Page ও Trustpilot-এ সম্মানিত অভিভাবক ও শুভানুধ্যায়ীদের বাস্তব অভিজ্ঞতা ও রেটিং",
                "Real ratings and verified reviews shared across Google Business, Facebook, and Trustpilot"
              )}
            </p>
          </motion.div>

          {/* Platform Trust Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Website Direct Reviews Card */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-sm flex items-center justify-center font-bold">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground font-bengali">{t("ওয়েবসাইট রিভিউ", "Website Reviews")}</h4>
                    <span className="text-[10px] text-muted-foreground font-bengali">{t("সরাসরি মতামত", "Direct Feedback")}</span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-primary">5.0</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[11px] font-semibold text-primary font-bengali ml-1.5">
                  ({t("১০০% ভেরিফাইড", "100% Verified")})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline font-bengali group mt-1"
              >
                <span>{t("ওয়েবসাইটে মতামত দিন", "Write on Website")}</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Google Reviews Card */}
            <a
              href="https://g.page/r/Cap4g2uq6V3eEAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-500/5 via-card to-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-red-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                    <GoogleIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground font-bengali">Google Reviews</h4>
                    <span className="text-[10px] text-muted-foreground font-bengali">{t("ভেরিফাইড রেটিং", "Verified Rating")}</span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-foreground">4.9</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[11px] font-semibold text-muted-foreground font-bengali ml-1.5">
                  ({t("৪৮+ রিভিউ", "48+ Reviews")})
                </span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 group-hover:text-red-700 font-bengali mt-1"
              >
                <span>{t("গুগলে রিভিউ দেখুন / লিখুন", "View on Google")}</span>
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>

            {/* Facebook Recommendations Card */}
            <a
              href="https://www.facebook.com/profile.php?id=61595529418669&sk=reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-500/5 via-card to-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                    <FacebookIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground font-bengali">Facebook Page</h4>
                    <span className="text-[10px] text-muted-foreground font-bengali">{t("অফিসিয়াল পেজ", "Official Page")}</span>
                  </div>
                </div>
                <span className="text-sm font-black font-bengali text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {t("১০০%", "100%")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[11px] font-semibold text-muted-foreground font-bengali ml-1.5">
                  ({t("রিকমেন্ডেড", "Recommended")})
                </span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 font-bengali mt-1"
              >
                <span>{t("ফেসবুকে মতামত দেখুন", "View on Facebook")}</span>
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>

            {/* Trustpilot Score Card */}
            <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500/5 via-card to-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                    <TrustpilotIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground font-bengali">Trustpilot</h4>
                    <span className="text-[10px] text-muted-foreground font-bengali">{t("পাবলিক স্কোর", "Public Score")}</span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-emerald-700">4.8</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 mb-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                ))}
                <span className="text-[11px] font-semibold text-emerald-700 font-bengali ml-1.5">
                  ({t("এক্সিলেন্ট", "Excellent")})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bengali mt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("অভিভাবকদের শীর্ষ আস্থা", "Top Guardian Trust")}</span>
              </div>
            </div>
          </div>

          {/* Platform Filters and Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedPlatform("all");
                  setCurrentSlide(0);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bengali font-semibold whitespace-nowrap transition-all ${selectedPlatform === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background border border-border/70 text-muted-foreground hover:bg-muted"
                  }`}
              >
                <span>{t("সকল রিভিউ", "All Reviews")}</span>
                <span className="ml-1 text-[10px] opacity-75">({platformCounts.all})</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPlatform("website");
                  setCurrentSlide(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bengali font-semibold whitespace-nowrap transition-all ${selectedPlatform === "website"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background border border-border/70 text-muted-foreground hover:bg-muted"
                  }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{t("ওয়েবসাইট রিভিউ", "Website")}</span>
                <span className="text-[10px] opacity-75">({platformCounts.website})</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPlatform("google");
                  setCurrentSlide(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bengali font-semibold whitespace-nowrap transition-all ${selectedPlatform === "google"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-background border border-border/70 text-muted-foreground hover:bg-muted"
                  }`}
              >
                <GoogleIcon className="h-3.5 w-3.5" />
                <span>Google</span>
                <span className="text-[10px] opacity-75">({platformCounts.google})</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPlatform("facebook");
                  setCurrentSlide(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bengali font-semibold whitespace-nowrap transition-all ${selectedPlatform === "facebook"
                  ? "bg-[#1877F2] text-white shadow-sm"
                  : "bg-background border border-border/70 text-muted-foreground hover:bg-muted"
                  }`}
              >
                <FacebookIcon className="h-3.5 w-3.5" />
                <span>Facebook</span>
                <span className="text-[10px] opacity-75">({platformCounts.facebook})</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPlatform("trustpilot");
                  setCurrentSlide(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bengali font-semibold whitespace-nowrap transition-all ${selectedPlatform === "trustpilot"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-background border border-border/70 text-muted-foreground hover:bg-muted"
                  }`}
              >
                <TrustpilotIcon className="h-3.5 w-3.5" />
                <span>Trustpilot</span>
                <span className="text-[10px] opacity-75">({platformCounts.trustpilot})</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bengali font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
              >
                {showReviewForm ? t("বাতিল", "Cancel") : t("মতামত বা রিভিউ দিন", "Write a Review")}
              </button>

              <button
                type="button"
                onClick={() => void handleShareReviewLink()}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 font-bengali text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                title={t("ফর্ম শেয়ার", "Share Form")}
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("শেয়ার", "Share")}</span>
              </button>

              <button
                type="button"
                onClick={() => void handleCopyReviewLink()}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 font-bengali text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                title={t("লিংক কপি", "Copy Link")}
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("কপি", "Copy")}</span>
              </button>
            </div>
          </div>

          {shareFeedback ? (
            <p className="mb-6 text-center font-bengali text-xs text-muted-foreground">{shareFeedback}</p>
          ) : null}

          {/* Review Submission Form */}
          {showReviewForm && (
            <motion.div
              id="write-review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/80 shadow-md rounded-3xl p-6 mb-10 max-w-2xl mx-auto scroll-mt-28"
            >
              {reviewSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="font-bengali text-lg text-foreground font-semibold">
                    {t("ধন্যবাদ! আপনার রিভিউ জমা হয়েছে। পর্যালোচনার পর প্রকাশিত হবে।", "Thank you! Your review has been submitted for moderation.")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setReviewSubmitted(false)}
                    className="mt-5 px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bengali text-xs font-semibold transition-colors"
                  >
                    {t("আরেকটি রিভিউ লিখুন", "Submit Another Review")}
                  </button>
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
                      <label className="font-bengali text-xs font-semibold mb-1 block">{t("আপনার সম্পর্ক / পরিচয়", "Your Relation")} *</label>
                      <select
                        value={reviewRelation}
                        onChange={(e) => setReviewRelation(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-background border border-border font-bengali text-xs"
                        required
                      >
                        <option value="">{t("সিলেক্ট করুন", "Select")}</option>
                        <option value={t("অভিভাবক", "Guardian")}>{t("অভিভাবক", "Guardian")}</option>
                        <option value={t("হিফজ বিভাগের অভিভাবক", "Hifz Guardian")}>{t("হিফজ বিভাগের অভিভাবক", "Hifz Guardian")}</option>
                        <option value={t("প্রাক্তন শিক্ষার্থী", "Ex-Student")}>{t("প্রাক্তন শিক্ষার্থী", "Ex-Student")}</option>
                        <option value={t("স্থানীয় বাসিন্দা", "Local Resident")}>{t("স্থানীয় বাসিন্দা", "Local Resident")}</option>
                        <option value={t("শুভাকাঙ্ক্ষী", "Well Wisher")}>{t("শুভাকাঙ্ক্ষী", "Well Wisher")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bengali text-xs font-semibold mb-1 block">{t("রেটিং (স্টার)", "Rating")}</label>
                    <select
                      value={reviewRating.toString()}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border font-bengali text-xs"
                    >
                      <option value="5">{t("★★★★★ (5 Stars - চমৎকার)", "★★★★★ (5 Stars - Excellent)")}</option>
                      <option value="4">{t("★★★★☆ (4 Stars - খুব ভালো)", "★★★★☆ (4 Stars - Very Good)")}</option>
                      <option value="3">{t("★★★☆☆ (3 Stars - ভালো)", "★★★☆☆ (3 Stars - Good)")}</option>
                      <option value="2">★★☆☆☆ (2 Stars)</option>
                      <option value="1">★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bengali text-xs font-semibold mb-1 block">{t("আপনার মূল্যবান মতামত", "Your Review")} *</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      placeholder={t("প্রতিষ্ঠানের শিক্ষা পরিবেশ নিয়ে আপনার প্রতিক্রিয়া...", "Share your feedback...")}
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
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12 rounded-3xl bg-card border border-border/70 p-6">
                <Star className="h-8 w-8 text-amber-400 mx-auto mb-2 opacity-60" />
                <p className="font-bengali text-sm text-foreground font-semibold">
                  {t("এই প্ল্যাটফর্মে এখনো কোনো রিভিউ যুক্ত হয়নি।", "No reviews in this platform yet.")}
                </p>
                <p className="font-bengali text-xs text-muted-foreground mt-1">
                  {t("আপনিই প্রথম রিভিউটি লিখে উৎসাহিত করুন!", "Be the first to share your experience!")}
                </p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bengali text-xs font-semibold"
                >
                  {t("প্রথম রিভিউ দিন", "Write First Review")}
                </button>
              </div>
            ) : (
              <>
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
                      {filteredReviews.map((item, i) => (
                        <div key={i} className="w-full flex-shrink-0 px-2">
                          <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${item.platform === "facebook"
                                  ? "bg-blue-50 text-[#1877F2] border border-blue-200"
                                  : item.platform === "trustpilot"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : item.platform === "website"
                                      ? "bg-primary/10 text-primary border border-primary/25"
                                      : "bg-red-50 text-red-600 border border-red-200"
                                  }`}>
                                  {item.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-bengali font-bold text-foreground text-sm">{item.name}</h4>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" title={t("যাচাইকৃত", "Verified")} />
                                  </div>
                                  <p className="font-bengali text-xs text-muted-foreground">
                                    {lang === "bn" ? item.relation : item.relationEn || item.relation}
                                  </p>
                                </div>
                              </div>

                              {/* Platform Badge */}
                              <div>
                                {item.platform === "facebook" ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-semibold text-[#1877F2]">
                                    <FacebookIcon className="h-3 w-3" />
                                    <span>Facebook</span>
                                  </span>
                                ) : item.platform === "trustpilot" ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    <TrustpilotIcon className="h-3 w-3" />
                                    <span>Trustpilot</span>
                                  </span>
                                ) : item.platform === "website" ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/25 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                                    <Globe className="h-3 w-3" />
                                    <span>{t("ওয়েবসাইট রিভিউ", "Website Review")}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">
                                    <GoogleIcon className="h-3 w-3" />
                                    <span>Google Review</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-1 text-amber-400 mb-3">
                              {Array.from({ length: item.rating || 5 }).map((_, starIdx) => (
                                <Star key={starIdx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              ))}
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
                        transform: `translateX(-${Math.min(currentSlide, Math.ceil(filteredReviews.length / 2) - 1) * 100}%)`,
                      }}
                    >
                      {Array.from({ length: Math.ceil(filteredReviews.length / 2) }).map((_, slideIndex) => (
                        <div key={slideIndex} className="w-full flex-shrink-0">
                          <div className={`grid gap-6 px-2 ${filteredReviews.length === 1 ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-2"}`}>
                            {filteredReviews.slice(slideIndex * 2, (slideIndex + 1) * 2).map((item, i) => (
                              <div key={i} className="bg-card border border-border/70 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${item.platform === "facebook"
                                      ? "bg-blue-50 text-[#1877F2] border border-blue-200"
                                      : item.platform === "trustpilot"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : item.platform === "website"
                                          ? "bg-primary/10 text-primary border border-primary/25"
                                          : "bg-red-50 text-red-600 border border-red-200"
                                      }`}>
                                      {item.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="font-bengali font-bold text-foreground text-sm">{item.name}</h4>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" title={t("যাচাইকৃত", "Verified")} />
                                      </div>
                                      <p className="font-bengali text-xs text-muted-foreground">
                                        {lang === "bn" ? item.relation : item.relationEn || item.relation}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Platform Badge */}
                                  <div>
                                    {item.platform === "facebook" ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-semibold text-[#1877F2]">
                                        <FacebookIcon className="h-3 w-3" />
                                        <span>Facebook</span>
                                      </span>
                                    ) : item.platform === "trustpilot" ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                        <TrustpilotIcon className="h-3 w-3" />
                                        <span>Trustpilot</span>
                                      </span>
                                    ) : item.platform === "website" ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/25 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                                        <Globe className="h-3 w-3" />
                                        <span>{t("ওয়েবসাইট রিভিউ", "Website Review")}</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">
                                        <GoogleIcon className="h-3 w-3" />
                                        <span>Google Review</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Stars */}
                                <div className="flex items-center gap-1 text-amber-400 mb-3">
                                  {Array.from({ length: item.rating || 5 }).map((_, starIdx) => (
                                    <Star key={starIdx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>

                                <p className="font-bengali text-xs sm:text-sm leading-relaxed text-muted-foreground italic">
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

                {/* Carousel Controls: Prev, Dots, Next */}
                {(isMobile ? filteredReviews.length : Math.ceil(filteredReviews.length / 2)) > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        const total = isMobile ? filteredReviews.length : Math.ceil(filteredReviews.length / 2);
                        setCurrentSlide((prev) => (prev - 1 + total) % total);
                      }}
                      className="p-1.5 rounded-full border border-border/80 bg-background text-foreground hover:bg-muted transition-colors shadow-xs"
                      aria-label="Previous review"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: isMobile ? filteredReviews.length : Math.ceil(filteredReviews.length / 2) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`h-2 rounded-full transition-all ${currentSlide === i ? "bg-primary w-8" : "bg-muted-foreground/30 w-2"
                            }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const total = isMobile ? filteredReviews.length : Math.ceil(filteredReviews.length / 2);
                        setCurrentSlide((prev) => (prev + 1) % total);
                      }}
                      className="p-1.5 rounded-full border border-border/80 bg-background text-foreground hover:bg-muted transition-colors shadow-xs"
                      aria-label="Next review"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
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
