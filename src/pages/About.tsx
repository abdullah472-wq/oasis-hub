import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  BookOpen,
  Award,
  Users,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Compass,
  Building2,
  Layers,
  Camera,
  Check,
  Briefcase,
  Mail,
  Copy,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings, formatRegistrationNumber } from "@/lib/siteSettings";
import {
  getFacultyList,
  getCachedFaculty,
  FACULTY_UPDATED_EVENT,
  type FacultyMember,
} from "@/lib/faculty";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import { springIn, springInDelay } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const About = () => {
  const { t, lang } = useLanguage();
  const { settings } = useSiteSettings();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const stats = [
    {
      num: "110+",
      numEn: "110+",
      label: t("বর্তমান শিক্ষার্থী", "Active Students"),
      sub: t("সার্বক্ষণিক পাঠরত", "Enrolled students"),
      icon: Users,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/30",
    },
    {
      num: "40+",
      numEn: "40+",
      label: t("সনদপ্রাপ্ত হাফেজে কুরআন", "Certified Huffaz"),
      sub: t("দস্তারবন্দী ও সম্মাননা প্রাপ্ত", "With Dastarbandi honors"),
      icon: Award,
      color: "from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
    },
    {
      num: "10+",
      numEn: "10+",
      label: t("বিজ্ঞ শিক্ষক ও শিক্ষিকা", "Dedicated Teachers"),
      sub: t("অভিজ্ঞ ও দ্বীনদার ফ্যাকাল্টি", "Experienced scholars"),
      icon: GraduationCap,
      color: "from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400",
      border: "border-blue-500/30",
    },
    {
      num: "৫+",
      numEn: "5+",
      label: t("বছরের গৌরবময় ঐতিহ্য", "Years of Trust"),
      sub: t("২০২১ খ্রি. হতে অবিচল পথচলা", "Founded in 2021"),
      icon: Calendar,
      color: "from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400",
      border: "border-purple-500/30",
    },
  ];

  const corePillars = [
    {
      title: t("সহীহ কুরআন ও হিফজ", "Quranic Tajweed & Hifz"),
      desc: t(
        "বিশুদ্ধ মাখরাজ ও তাজবীদের সাথে কুরআন শিক্ষা এবং আন্তর্জাতিক মানের নিয়মিত হিফজুল কুরআন প্রশিক্ষণ।",
        "Learning Quran with proper Tajweed and international-standard Hifz training.",
      ),
      icon: BookOpen,
      badge: t("প্রথম স্তম্ভ", "Pillar 1"),
    },
    {
      title: t("যুগোপযোগী আধুনিক জেনারেল শিক্ষা", "Modern General Education"),
      desc: t(
        "বাংলা, ইংরেজি, গণিত ও বিজ্ঞানে জাতীয় শিক্ষাক্রম অনুসারে শক্ত ভিত্তি যাতে শিক্ষার্থীরা ডাক্তার, ইঞ্জিনিয়ার ও বিশেষজ্ঞ হতে পারে।",
        "Solid foundation in Bengali, English, Math, and Science according to national standards.",
      ),
      icon: Compass,
      badge: t("দ্বিতীয় স্তম্ভ", "Pillar 2"),
    },
    {
      title: t("সুন্নাহভিত্তিক চরিত্র ও তারবিয়াহ", "Sunnah-Based Tarbiyah & Akhlaq"),
      desc: t(
        "দৈনন্দিন মাসনূন দোয়া, শিষ্টাচার, সততা, দেশপ্রেম ও বড়দের সম্মান করার মাধ্যমে খাঁটি মুসলিম ও সুনাগরিক গঠন।",
        "Cultivating character, modesty, ethics, Sunnah habits, and genuine civic responsibility.",
      ),
      icon: HeartHandshake,
      badge: t("তৃতীয় স্তম্ভ", "Pillar 3"),
    },
    {
      title: t("নিরাপদ ও সুশৃঙ্খল পরিবেশ", "Safe & Nurturing Environment"),
      desc: t(
        "সিসিটিভি নজরদারি, স্বাস্থ্যসম্মত পুষ্টিকর খাবার এবং সার্বক্ষণিক দায়িত্বশীল ও স্নেহময় তত্ত্বাবধান।",
        "24/7 CCTV surveillance, healthy boarding diet, and round-the-clock caring supervision.",
      ),
      icon: ShieldCheck,
      badge: t("চতুর্থ স্তম্ভ", "Pillar 4"),
    },
  ];

  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>(() => getCachedFaculty());

  useEffect(() => {
    let mounted = true;
    void getFacultyList().then((data) => {
      if (mounted) {
        setFacultyMembers((prev) => {
          if (
            prev.length === data.length &&
            prev.every(
              (p, i) =>
                p.id === data[i]?.id &&
                p.updated_at === data[i]?.updated_at &&
                p.order_index === data[i]?.order_index
            )
          ) {
            return prev;
          }
          return data;
        });
      }
    });

    const handleSync = (e?: Event) => {
      if (!mounted) return;
      if (e instanceof CustomEvent && Array.isArray(e.detail)) {
        setFacultyMembers(e.detail);
        return;
      }
      setFacultyMembers(getCachedFaculty());
    };

    window.addEventListener(FACULTY_UPDATED_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      mounted = false;
      window.removeEventListener(FACULTY_UPDATED_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const amanullahMember = facultyMembers.find(
    (m) => m.id === "fac-mgmt-2" || m.name_bn.includes("আমানুল্লাহ")
  );
  const mamonMember = facultyMembers.find(
    (m) => m.id === "fac-mgmt-1" || m.name_bn.includes("আব্দুল্লাহ")
  );

  const leadership = [
    {
      name: settings.principal_name_bn
        ? (lang === "bn" ? settings.principal_name_bn : settings.principal_name_en || settings.principal_name_bn)
        : amanullahMember
        ? (lang === "bn" ? amanullahMember.name_bn : amanullahMember.name_en || amanullahMember.name_bn)
        : t("হাফেজ আমানউল্লাহ", "Hafez Amanullah"),
      role: settings.principal_title_bn
        ? (lang === "bn" ? settings.principal_title_bn : settings.principal_title_en || settings.principal_title_bn)
        : amanullahMember
        ? (lang === "bn" ? amanullahMember.designation_bn : amanullahMember.designation_en || amanullahMember.designation_bn)
        : t("প্রধান শিক্ষক ও হিফজ প্রধান", "Principal & Head of Hifz"),
      qualification: amanullahMember?.qualification_bn
        ? (lang === "bn" ? amanullahMember.qualification_bn : amanullahMember.qualification_en || amanullahMember.qualification_bn)
        : t("আন্তর্জাতিক সনদপ্রাপ্ত ক্বারী ও সিনিয়র হাফেজে কুরআন", "Certified International Qari & Senior Hafez"),
      phone: settings.principal_phone || amanullahMember?.phone || settings.phone_primary || "01820-811511",
      email: settings.principal_email || amanullahMember?.email || settings.email_primary || "principal@annoor.edu.bd",
      experience: amanullahMember?.experience_bn
        ? (lang === "bn" ? amanullahMember.experience_bn : amanullahMember.experience_en || amanullahMember.experience_bn)
        : t("১৪+ বছরের পাঠদান ও প্রাতিষ্ঠানিক পরিচালনা", "14+ Years in Teaching & Leadership"),
      quote: settings.principal_message_bn
        ? (lang === "bn" ? settings.principal_message_bn : settings.principal_message_en || settings.principal_message_bn)
        : t(
            "কুরআন হলো জীবনের হেদায়েতের নূর। আমরা চাই আমাদের শিক্ষার্থীরা বিশুদ্ধ কুরআন বক্ষে ধারণ করে ডাক্তার, ইঞ্জিনিয়ার, অধ্যাপক বা আদর্শ আলেম হয়ে জাতির মুখ উজ্জ্বল করুক।",
            "The Quran is the light of guidance. We strive for students who hold the Quran in their hearts while excelling as doctors, engineers, professors, or noble scholars.",
          ),
      image: settings.principal_image_url || amanullahMember?.image_url || "/gallery/campus_main.jpg",
    },
    {
      name: settings.founder_name_bn
        ? (lang === "bn" ? settings.founder_name_bn : settings.founder_name_en || settings.founder_name_bn)
        : mamonMember
        ? (lang === "bn" ? mamonMember.name_bn : mamonMember.name_en || mamonMember.name_bn)
        : t("মুফতি আব্দুল্লাহ আল মামুন", "Mufti Abdullah Al Mamon"),
      role: settings.founder_title_bn
        ? (lang === "bn" ? settings.founder_title_bn : settings.founder_title_en || settings.founder_title_bn)
        : mamonMember
        ? (lang === "bn" ? mamonMember.designation_bn : mamonMember.designation_en || mamonMember.designation_bn)
        : t("ম্যানেজার ও প্রতিষ্ঠাতা পরিচালক", "Manager & Founding Director"),
      qualification: mamonMember?.qualification_bn
        ? (lang === "bn" ? mamonMember.qualification_bn : mamonMember.qualification_en || mamonMember.qualification_bn)
        : t("দাওরায়ে হাদিস ও উচ্চতর ইফতা, শিক্ষাবিদ ও সংগঠক", "Dawra-e-Hadith & Higher Ifta, Islamic Scholar"),
      phone: settings.founder_phone || mamonMember?.phone || "01312-200043, 01581-818368",
      email: mamonMember?.email || settings.email_primary || "manager@annoor.edu.bd",
      experience: mamonMember?.experience_bn
        ? (lang === "bn" ? mamonMember.experience_bn : mamonMember.experience_en || mamonMember.experience_bn)
        : t("৬+ বছর শিক্ষা ব্যবস্থাপনা ও প্রাতিষ্ঠানিক উন্নয়ন", "6+ Years Education Administration"),
      quote: settings.founder_message_bn
        ? (lang === "bn" ? settings.founder_message_bn : settings.founder_message_en || settings.founder_message_bn)
        : t(
            "শিক্ষা শুধু বইয়ের পাতার মুখস্থ নয়, এটি শিশুর চিন্তা ও চরিত্রের আত্মিক পরিশুদ্ধি। আননূর তাহফিজুল কুরআন মাদরাসায় আমরা প্রতিটি সন্তানকে আন্তরিক ভালোবাসা ও দায়িত্বশীলতার সাথে গড়ে তুলি।",
            "Education is not mere textbook cramming; it is the spiritual and intellectual purification of a child's character with deep love and institutional care.",
          ),
      image:
        settings.founder_image_url ||
        (mamonMember?.image_url && !mamonMember.image_url.includes("example.com")
          ? mamonMember.image_url
          : "/abdullah.png"),
    },
  ];

  const methodologyPoints = [
    {
      title: t("সহীহ ও বিশুদ্ধ তিলাওয়াত", "Correct Recitation"),
      desc: t("প্রতিটি হরফের মাখরাজ ও সিফাত তাজবীদের মূল নিয়ম অনুযায়ী মুখস্থ ও নিয়মিত মশকের মাধ্যমে পাঠদান।", "Systematic Tajweed rules, vocal drills, and accurate articulation from day one."),
    },
    {
      title: t("হুসনে সওত ও সুন্দর লাহানে তেলাওয়াত", "Melodious Quranic Tone"),
      desc: t("আন্তর্জাতিক ক্বারীদের অনুকরণে সুন্দর সুর ও সুমধুর কণ্ঠে কুরআন তিলাওয়াত শিক্ষা।", "Training in melodious recitation tones inspired by renowned international Qaris."),
    },
    {
      title: t("ব্যবহারিক নামাজ ও মাসনূন আমল", "Practical Salah & Daily Sunnah"),
      desc: t("ওযু, গোসল, ফরজ-ওয়াজিব নামাজ এবং সকাল-সন্ধ্যার প্রাত্যহিক দোয়ার নিয়মিত ব্যবহারিক প্রয়োগ।", "Daily hands-on practice of wudu, 5 daily prayers, and Sunnah supplications."),
    },
    {
      title: t("আকীদা, ইবাদত ও আখলাক শিক্ষা", "Aqeedah, Worship & Akhlaq"),
      desc: t("সহজ ভাষায় খাঁটি তাওহীদ, নবীপ্রেম, মা-বাবার আনুগত্য এবং সদাচরণের ক্লাসরুম প্রশিক্ষণ।", "Foundational lessons in pure Islamic monotheism, ethics, and devotion to parents."),
    },
    {
      title: t("দুর্বল শিক্ষার্থীদের বিশেষ তত্ত্বাবধান", "Dedicated Care for Slow Learners"),
      desc: t("প্রত্যেক শিক্ষার্থীর মানসিক ধারণক্ষমতা অনুযায়ী সান্ধ্যকালীন বিশেষ সাহায্য ও পুনরাবৃত্তি ক্লাস।", "Individualized evening reinforcement sessions tailored to each learner's pace."),
    },
    {
      title: t("সাপ্তাহিক ও মাসিক প্রগ্রেস রিপোর্ট", "Periodic Progress Evaluation"),
      desc: t("নিয়মিত পরীক্ষা, মূল্যায়ন ডায়েরি ও অভিভাবকদের সাথে ফলপ্রসূ আলোচনার মাধ্যমে অগ্রগতির পর্যবেক্ষণ।", "Consistent exams, progress logs, and constructive parent-teacher conferences."),
    },
  ];

  const campusFeatures = [
    {
      campusName: t(
        `${settings.institution_name_bn || "প্রধান একাডেমিক ভবন"} (Main Academic Wing)`,
        `${settings.institution_name_en || "Main Academic Wing"}`
      ),
      location: t(
        settings.address_boys_campus_bn || "মেইন রোড, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর",
        settings.address_boys_campus_en || "Main Road, Kapasia Bazar, Kapasia, Gazipur"
      ),
      phone: [settings.phone_primary, settings.phone_secondary].filter(Boolean).join(", ") || "01820-811511, 01581-818368",
      highlights: [
        t("নূরানী, নাজেরা ও হিফজুল কুরআন বিভাগ", "Nurani, Nazara & Hifz Sections"),
        t("জেনারেল আধুনিক প্রাথমিক শিক্ষা (প্লে — ৫ম)", "Modern General Primary (Play - Class 5)"),
        t("মাল্টিমিডিয়া স্মার্ট ক্লাসরুম ও সেন্ট্রাল লাইব্রেরি", "Multimedia Smart Classrooms & Central Library"),
        t("সুবিশাল নামাজখানা ও নিয়মিত সাংস্কৃতিক আয়োজন", "Spacious prayer hall and Islamic cultural events"),
      ],
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      campusName: t("আবাসিক ছাত্রাবাস ও শিক্ষার্থী যত্ন (Boarding & Student Care)", "Boarding & Student Care"),
      location: t(
        settings.address_boys_campus_bn || "মাদরাসা ক্যাম্পাস সংলগ্ন নিজস্ব আবাসিক ভবন, কাপাসিয়া, গাজীপুর",
        settings.address_boys_campus_en || "Campus residential building, Kapasia, Gazipur"
      ),
      phone: [settings.founder_phone, settings.phone_secondary, settings.phone_primary].filter(Boolean).join(", ") || settings.phone_primary,
      highlights: [
        t("স্বাস্থ্যসম্মত নিজস্ব ডাইনিং ও পুষ্টিকর ৩ বেলা খাবার", "In-house hygienic dining with nutritious meals"),
        t("সার্বক্ষণিক ওস্তাদগণের স্নেহময় তত্ত্বাবধান ও সান্নিধ্য", "24/7 caring supervision and direct teacher mentorship"),
        t("সিসিটিভি ক্যামেরা ও সার্বক্ষণিক নিরাপত্তা ব্যবস্থা", "Full CCTV surveillance and 24/7 security care"),
        t("সার্বক্ষণিক বিদ্যুৎ ব্যাকআপ ও নিরাপদ বিশুদ্ধ পানি", "24/7 power backup and pure drinking water supply"),
      ],
      badgeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
    },
  ];

  const hasBefaq = Boolean(settings.befaq_reg_no?.trim() || settings.befaq_cert_no?.trim());
  const hasHuffaz = Boolean(settings.huffaz_reg_no?.trim() || settings.huffaz_cert_no?.trim());
  const hasNurani = Boolean(settings.nurani_reg_no?.trim() || settings.nurani_cert_no?.trim());
  const hasAnyBoard = hasBefaq || hasHuffaz || hasNurani;
  const activeBoardsCount = (hasBefaq ? 1 : 0) + (hasHuffaz ? 1 : 0) + (hasNurani ? 1 : 0);
  const hasInstitutionalInfo = Boolean(
    settings.trade_license_no?.trim() ||
    (settings.emis_code?.trim() && settings.emis_code !== "12345678") ||
    settings.founding_year
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/95 via-primary to-primary/90 text-primary-foreground pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-18">
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src={settings.hero_image_url || heroImg}
            alt="Campus Background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/80 z-0" />

        <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div {...springIn} className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-emerald-200 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>
                {t(
                  `স্থাপিত: ${settings.founding_year || "২০২১"} খ্রি.${
                    settings.trade_license_no ? ` | ট্রেড লাইসেন্স: ${settings.trade_license_no}` : ""
                  }${
                    formatRegistrationNumber(settings, "bn")
                      ? ` | ${formatRegistrationNumber(settings, "bn")}`
                      : ""
                  }`,
                  `Est. ${settings.founding_year || "2021"}${
                    settings.trade_license_no ? ` | Lic: ${settings.trade_license_no}` : ""
                  }${
                    formatRegistrationNumber(settings, "en")
                      ? ` | ${formatRegistrationNumber(settings, "en")}`
                      : ""
                  }`
                )}
              </span>
            </span>
          </motion.div>

          <motion.h1
            {...springIn}
            transition={springInDelay(0.1)}
            className="font-bengali font-extrabold tracking-tight text-white mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.15 }}
          >
            {t("আমাদের সম্পর্কে", "About Us")}
          </motion.h1>

          <motion.p
            {...springIn}
            transition={springInDelay(0.15)}
            className="font-bengali text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed"
          >
            {t(
              `${settings.institution_name_bn || "আননূর তাহফিজুল কুরআন মাদরাসা"} — কুরআন-সুন্নাহর সঠিক দিকনির্দেশনা ও যুগোপযোগী আধুনিক শিক্ষার সমন্বয়ে এক অনন্য আদর্শ বিদ্যাপীঠ। গাজীপুরের কাপাসিয়ায় ${settings.founding_year || "২০২১"} সাল থেকে আস্থার সাথে গড়ে তুলছি আগামীর চরিত্রবান নেতৃত্ব।`,
              `${settings.institution_name_en || "Annoor Tahfizul Quran Madrasa"} — A prestigious educational institution harmonizing authentic Quranic values with modern academic excellence in Kapasia, Gazipur since ${settings.founding_year || "2021"}.`
            )}
          </motion.p>

          <motion.div
            {...springIn}
            transition={springInDelay(0.2)}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Link to="/admission">
              <Button size="lg" className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-bengali font-bold px-7 shadow-lg gap-2">
                <GraduationCap className="h-5 w-5" />
                <span>{t("ভর্তি আবেদন করুন", "Apply for Admission")}</span>
              </Button>
            </Link>
            <Link to="/teachers">
              <Button size="lg" variant="outline" className="rounded-full border-primary-foreground/30 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-white font-bengali font-semibold px-6 backdrop-blur-sm gap-2">
                <Users className="h-5 w-5" />
                <span>{t("শিক্ষক পরিচিতি", "Meet Faculty")}</span>
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="ghost" className="rounded-full text-white/90 hover:text-white hover:bg-white/10 font-bengali px-5 gap-2">
                <Phone className="h-4 w-4" />
                <span>{t("যোগাযোগ করুন", "Contact Us")}</span>
              </Button>
            </Link>
          </motion.div>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="py-12 -mt-10 relative z-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={idx}
                  {...springIn}
                  transition={springInDelay(idx * 0.08)}
                  className={`rounded-2xl border ${s.border} bg-card/90 backdrop-blur-sm p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-display font-extrabold text-foreground mb-1">
                    {lang === "bn" ? s.num : s.numEn}
                  </div>
                  <h3 className="font-bengali font-bold text-sm sm:text-base text-foreground mb-1">
                    {s.label}
                  </h3>
                  <p className="font-bengali text-xs text-muted-foreground">
                    {s.sub}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= BOARD AFFILIATIONS & REGISTRATIONS ================= */}
      {(hasAnyBoard || hasInstitutionalInfo) && (
        <section id="boards" className="scroll-mt-24 sm:scroll-mt-28 py-14 md:py-20 bg-gradient-to-b from-card/40 via-card/80 to-card/40 border-y border-border/80 relative overflow-hidden">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="outline" className="mb-3 px-3.5 py-1 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("বোর্ড স্বীকৃতি ও অধিভুক্তি", "Board Affiliations & Registrations")}</span>
              </Badge>
              <h2 className="font-bengali font-extrabold text-3xl sm:text-4xl text-foreground">
                {t("স্বীকৃত শিক্ষাবোর্ড ও কেন্দ্রীয় প্রাতিষ্ঠানিক নিবন্ধন", "Recognized Education Boards & Institutional Affiliations")}
              </h2>
              <p className="mt-3 font-bengali text-muted-foreground text-base max-w-2xl mx-auto">
                {t(
                  "আমাদের মাদরাসা জাতীয় কওমি শিক্ষাবোর্ড, আন্তর্জাতিক হিফজুল কুরআন মান সংস্থা ও নূরানী শিক্ষাবোর্ড কর্তৃক অনুমোদিত ও নিবন্ধিত প্রতিষ্ঠান।",
                  "Officially registered and recognized under premier national Qawmi, Huffaz, and Nurani education boards."
                )}
              </p>
            </div>

            {hasAnyBoard && (
              <div
                className={`grid gap-6 ${
                  activeBoardsCount === 1
                    ? "max-w-md mx-auto"
                    : activeBoardsCount === 2
                    ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                    : "grid-cols-1 md:grid-cols-3"
                }`}
              >
                {/* Befaq */}
                {hasBefaq && (
                  <motion.div
                    {...springIn}
                    transition={springInDelay(0.08)}
                    className="rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/5 via-card to-card p-6 sm:p-7 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                          <Award className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 border border-emerald-500/20 font-bengali">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{t("কওমি শিক্ষাবোর্ড", "Qawmi Board")}</span>
                        </span>
                      </div>

                      <h3 className="font-bengali text-lg sm:text-xl font-bold text-foreground mb-2 leading-snug">
                        {settings.befaq_name || t("বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (বেফাক)", "Befaqul Madarisil Arabia Bangladesh")}
                      </h3>
                      <p className="font-bengali text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                        {t(
                          "বাংলাদেশ সরকারের স্বীকৃতিপ্রাপ্ত সর্বোচ্চ কওমি মাদরাসা শিক্ষাবোর্ড। কওমি ধারার আদর্শ শিক্ষাক্রম, কেন্দ্রীয় পরীক্ষা ও সরকারি মান অনুযায়ী পরিচালিত।",
                          "The apex national Qawmi madrasa education board recognized by the Government of Bangladesh."
                        )}
                      </p>
                    </div>

                    <div className="border-t border-border/80 pt-4 space-y-2.5">
                      {settings.befaq_reg_no?.trim() && (
                        <div className="rounded-xl bg-muted/60 p-3 border border-border/60">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[11px] font-medium text-muted-foreground block font-bengali">
                                {t("বোর্ড রেজিষ্ট্রেশন নম্বর:", "Befaq Reg. Number:")}
                              </span>
                              <span className="font-mono text-xs sm:text-sm font-bold text-foreground truncate block">
                                {settings.befaq_reg_no}
                              </span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(settings.befaq_reg_no!, "befaq")}
                              title={t("কপি করুন", "Copy")}
                            >
                              {copiedKey === "befaq" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      )}

                      {settings.befaq_cert_no?.trim() && (
                        <div className="rounded-xl bg-emerald-500/10 p-2.5 border border-emerald-500/20">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block font-bengali">
                                {t("বেফাক সনদ নম্বর / Certificate No:", "Certificate Number:")}
                              </span>
                              <span className="font-mono text-xs font-bold text-foreground truncate block">
                                {settings.befaq_cert_no}
                              </span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(settings.befaq_cert_no!, "befaq_cert")}
                              title={t("কপি করুন", "Copy")}
                            >
                              {copiedKey === "befaq_cert" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Huffaz Board */}
                {hasHuffaz && (
                  <motion.div
                    {...springIn}
                    transition={springInDelay(0.14)}
                    className="rounded-3xl border border-blue-500/25 bg-gradient-to-b from-blue-500/5 via-card to-card p-6 sm:p-7 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600 border border-blue-500/20 font-bengali">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{t("হিফজ মান নিয়ন্ত্রণ", "Hifz Accreditation")}</span>
                        </span>
                      </div>

                      <h3 className="font-bengali text-lg sm:text-xl font-bold text-foreground mb-2 leading-snug">
                        {settings.huffaz_name || t("হুফ্ফাজুল কুরআন ফাউন্ডেশন বাংলাদেশ", "Huffazul Quran Foundation Bangladesh")}
                      </h3>
                      <p className="font-bengali text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                        {t(
                          "আন্তর্জাতিক মানের সহীহ তাজবীদ, লাহজা ও হিফজ মান তদারককারী দেশের শীর্ষ হুফফাজ সংস্থা। নিয়মিত অডিট ও কেন্দ্রীয় দস্তারবন্দী সনদ প্রদানকারী।",
                          "Premier national Huffaz foundation overseeing international Tajweed standards, audits, and formal Dastarbandi certification."
                        )}
                      </p>
                    </div>

                    <div className="border-t border-border/80 pt-4 space-y-2.5">
                      {settings.huffaz_reg_no?.trim() && (
                        <div className="rounded-xl bg-muted/60 p-3 border border-border/60">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[11px] font-medium text-muted-foreground block font-bengali">
                                {t("হুফ্ফাজ রেজিষ্ট্রেশন নম্বর:", "Huffaz Reg. Number:")}
                              </span>
                              <span className="font-mono text-xs sm:text-sm font-bold text-foreground truncate block">
                                {settings.huffaz_reg_no}
                              </span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(settings.huffaz_reg_no!, "huffaz")}
                              title={t("কপি করুন", "Copy")}
                            >
                              {copiedKey === "huffaz" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      )}

                      {settings.huffaz_cert_no?.trim() && (
                        <div className="rounded-xl bg-blue-500/10 p-2.5 border border-blue-500/20">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 block font-bengali">
                                {t("হুফ্ফাজ সনদ নম্বর / Certificate No:", "Certificate Number:")}
                              </span>
                              <span className="font-mono text-xs font-bold text-foreground truncate block">
                                {settings.huffaz_cert_no}
                              </span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(settings.huffaz_cert_no!, "huffaz_cert")}
                              title={t("কপি করুন", "Copy")}
                            >
                              {copiedKey === "huffaz_cert" ? <Check className="h-3.5 w-3.5 text-blue-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Nurani Board */}
                {hasNurani && (
                  <motion.div
                    {...springIn}
                    transition={springInDelay(0.2)}
                    className="rounded-3xl border border-purple-500/25 bg-gradient-to-b from-purple-500/5 via-card to-card p-6 sm:p-7 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-600 border border-purple-500/20 font-bengali">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{t("নূরানী শিক্ষাবোর্ড", "Nurani Board")}</span>
                        </span>
                      </div>

                      <h3 className="font-bengali text-lg sm:text-xl font-bold text-foreground mb-2 leading-snug">
                        {settings.nurani_name || t("নূরানী তা'লীমুল কুরআন বোর্ড বাংলাদেশ", "Nurani Talimul Quran Board Bangladesh")}
                      </h3>
                      <p className="font-bengali text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                        {t(
                          "শিশুদের অল্প সময়ে বিশুদ্ধ কুরআন তেলাওয়াত, মাসনূন আমল, বাংলা, ইংরেজি, গণিত ও আদব-আখলাক শিক্ষাদানের বৈজ্ঞানিক ও সর্বজনস্বীকৃত বোর্ড।",
                          "Acclaimed pedagogy delivering Quran recitation fluency, foundational Islamic manners, and general academics for early childhood."
                        )}
                      </p>
                    </div>

                    <div className="border-t border-border/80 pt-4 space-y-2.5">
                      {settings.nurani_reg_no?.trim() && (
                        <div className="rounded-xl bg-muted/60 p-3 border border-border/60">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[11px] font-medium text-muted-foreground block font-bengali">
                                {t("নূরানী বোর্ড রেজিষ্ট্রেশন নম্বর:", "Nurani Reg. Number:")}
                              </span>
                              <span className="font-mono text-xs sm:text-sm font-bold text-foreground truncate block">
                                {settings.nurani_reg_no}
                              </span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(settings.nurani_reg_no!, "nurani")}
                              title={t("কপি করুন", "Copy")}
                            >
                              {copiedKey === "nurani" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      )}

                      {settings.nurani_cert_no?.trim() && (
                        <div className="rounded-xl bg-purple-500/10 p-2.5 border border-purple-500/20">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 block font-bengali">
                                {t("নূরানী সনদ নম্বর / Certificate No:", "Certificate Number:")}
                              </span>
                              <span className="font-mono text-xs font-bold text-foreground truncate block">
                                {settings.nurani_cert_no}
                              </span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(settings.nurani_cert_no!, "nurani_cert")}
                              title={t("কপি করুন", "Copy")}
                            >
                              {copiedKey === "nurani_cert" ? <Check className="h-3.5 w-3.5 text-purple-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Institutional summary bar */}
            {hasInstitutionalInfo && (
              <div className="mt-8 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 text-center">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bengali text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{settings.institution_name_bn}</span>
                  </span>
                  {settings.founding_year && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{t(`প্রতিষ্ঠার সাল: ${settings.founding_year} খ্রি.`, `Founded: ${settings.founding_year}`)}</span>
                    </span>
                  )}
                  {settings.trade_license_no && (
                    <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/25">
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      <span>{t(`ট্রেড লাইসেন্স নং: ${settings.trade_license_no}`, `Trade License No: ${settings.trade_license_no}`)}</span>
                      <button
                        onClick={() => handleCopy(settings.trade_license_no!, "license")}
                        className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title={t("কপি করুন", "Copy")}
                      >
                        {copiedKey === "license" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </span>
                  )}
                  {Boolean(formatRegistrationNumber(settings, lang === "bn" ? "bn" : "en")) && (
                    <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-primary">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>{formatRegistrationNumber(settings, lang === "bn" ? "bn" : "en")}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= MISSION & VISION ================= */}
      <section id="mission-vision" className="scroll-mt-24 sm:scroll-mt-28 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 px-3.5 py-1 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
              {t("আমাদের রূপকল্প ও লক্ষ্য", "Vision & Mission")}
            </Badge>
            <h2 className="font-bengali font-extrabold text-3xl sm:text-4xl text-foreground">
              {t("দ্বীন ও আধুনিকতার সুষম সমন্বয়ে আত্মবিশ্বাসী প্রজন্ম", "Balancing Islamic Values with Modern Confidence")}
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Mission */}
            <motion.div
              {...springIn}
              className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-card to-card p-8 sm:p-10 shadow-lg"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="mb-4 font-bengali text-2xl font-bold text-foreground">
                {t("আমাদের মিশন (লক্ষ্য ও উদ্দেশ্য)", "Our Mission")}
              </h3>
              <p className="font-bengali text-base sm:text-lg leading-relaxed text-muted-foreground mb-6">
                {t(
                  "পবিত্র কুরআন ও সুন্নাহর মৌলিক শিক্ষার আলোকবর্তিকা প্রতিটি শিশুর অন্তরে প্রজ্জ্বলিত করে তাদের চারিত্রিক পবিত্রতা, আধুনিক অ্যাকাডেমিক উৎকর্ষ এবং সামাজিক নেতৃত্বের উপযোগী করে গড়ে তোলা।",
                  "To ignite the light of Quran and Sunnah within every child, nurturing moral integrity, modern academic distinction, and future leadership capabilities.",
                )}
              </p>
              <ul className="space-y-3 font-bengali text-sm text-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{t("আন্তর্জাতিক মানের সহীহ কুরআন ও তাজবীদ প্রশিক্ষণ", "International Tajweed & Quranic excellence")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{t("জাতীয় শিক্ষাক্রম অনুযায়ী বাংলা, ইংরেজি ও গণিতে দক্ষতা", "Fluency in Bengali, English, Math per national syllabus")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{t("আদর্শ আখলাক, আদব ও মানবিক মূল্যবোধের নিরবচ্ছিন্ন চর্চা", "Continuous practice of adab, modesty, and civic values")}</span>
                </li>
              </ul>
            </motion.div>

            {/* Vision */}
            <motion.div
              {...springIn}
              transition={springInDelay(0.1)}
              className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-card to-card p-8 sm:p-10 shadow-lg"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="mb-4 font-bengali text-2xl font-bold text-foreground">
                {t("আমাদের ভিশন (দূরদৃষ্টি)", "Our Vision")}
              </h3>
              <p className="font-bengali text-base sm:text-lg leading-relaxed text-muted-foreground mb-6">
                {t(
                  "বাংলাদেশ ও বিশ্বমঞ্চে এমন একটি অনুকরণীয় আদর্শ ইসলামিক শিক্ষাপ্রতিষ্ঠান হিসেবে প্রতিষ্ঠিত হওয়া, যেখান থেকে উত্তীর্ণ শিক্ষার্থীরা হবে একাধারে কুরআনের ধারক এবং আধুনিক বিজ্ঞান ও প্রজ্ঞায় অগ্রসর আলোকবর্তিকা।",
                  "To stand as an exemplary Islamic educational institution whose graduates embody the Quran in spirit while excelling in modern science, ethics, and intellectual wisdom.",
                )}
              </p>
              <ul className="space-y-3 font-bengali text-sm text-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>{t("১০০% দ্বীনি ও নিরাপদ আবাসিক-অনাবাসিক পরিবেশ", "100% Islamic, disciplined, and safe residential setup")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>{t("অভিজ্ঞ ওলামায়ে কেরাম ও দক্ষ শিক্ষকদের সার্বক্ষণিক তত্ত্বাবধান", "Round-the-clock guidance by qualified scholars & educators")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>{t("জাতি গঠনে সৎ, খোদাভীরু ও প্রতিভাবান নাগরিক উপহার দেওয়া", "Nurturing God-fearing, capable, and patriotic citizens")}</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 4 CORE PILLARS ================= */}
      <section id="pillars" className="scroll-mt-24 sm:scroll-mt-28 py-16 bg-muted/40 border-y border-border">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 px-3.5 py-1 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
              {t("আমাদের মূল ভিত্তি", "Core Tenets")}
            </Badge>
            <h2 className="font-bengali font-extrabold text-3xl sm:text-4xl text-foreground">
              {t("যে ৪টি স্তম্ভের ওপর আমাদের শিক্ষা ব্যবস্থা প্রতিষ্ঠিত", "Four Pillars of Our Educational Framework")}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {corePillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  {...springIn}
                  transition={springInDelay(i * 0.08)}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground font-bengali bg-muted px-2.5 py-1 rounded-full">
                        {p.badge}
                      </span>
                    </div>
                    <h3 className="font-bengali text-lg font-bold text-foreground mb-2">
                      {p.title}
                    </h3>
                    <p className="font-bengali text-sm text-muted-foreground leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= DUAL CAMPUSES SHOWCASE ================= */}
      <section id="campuses" className="scroll-mt-24 sm:scroll-mt-28 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 px-3.5 py-1 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
              {t("ক্যাম্পাস পরিচিতি", "Our Campuses")}
            </Badge>
            <h2 className="font-bengali font-extrabold text-3xl sm:text-4xl text-foreground">
              {t("আমাদের আধুনিক ও সুবিন্যস্ত ক্যাম্পাস", "Our Modern & Well-Organized Campus")}
            </h2>
            <p className="mt-3 font-bengali text-muted-foreground text-base max-w-2xl mx-auto">
              {t(
                "কাপাসিয়ার প্রাণকেন্দ্রে আধুনিক সুযোগ-সুবিধা, নিরাপদ আবাসন ও মনোরম পরিবেশে পবিত্র কুরআন ও সাধারণ শিক্ষার সমন্বিত পাঠদান।",
                "Operating modern campus facilities with safe boarding and serene environment in Kapasia.",
              )}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {campusFeatures.map((c, idx) => (
              <motion.div
                key={idx}
                {...springIn}
                transition={springInDelay(idx * 0.1)}
                className="rounded-3xl border border-border bg-card p-8 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${c.badgeColor}`}>
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{c.campusName}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3 text-muted-foreground mb-4">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="font-bengali text-sm leading-relaxed text-foreground/90 font-medium">
                      {c.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground mb-6">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <p className="font-bengali text-sm text-foreground/80 font-mono">
                      {c.phone}
                    </p>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <h4 className="font-bengali font-bold text-sm text-foreground mb-3">
                      {t("প্রধান সুবিধাসমূহ:", "Key Highlights:")}
                    </h4>
                    <ul className="space-y-2.5 font-bengali text-sm text-muted-foreground">
                      {c.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link to="/virtual-tour" className="flex-1">
                    <Button variant="outline" className="w-full rounded-2xl font-bengali text-xs gap-2">
                      <Camera className="h-3.5 w-3.5" />
                      <span>{t("ভার্চুয়াল ট্যুর দেখুন", "Virtual Tour")}</span>
                    </Button>
                  </Link>
                  <Link to="/contact" className="flex-1">
                    <Button variant="default" className="w-full rounded-2xl font-bengali text-xs gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{t("যোগাযোগ ও ম্যাপ", "Directions")}</span>
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TEACHING METHODOLOGY ================= */}
      <section id="methodology" className="scroll-mt-24 sm:scroll-mt-28 py-16 md:py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 px-3.5 py-1 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
              {t("শিক্ষা পদ্ধতি ও বৈশিষ্ট্য", "Teaching Methodology")}
            </Badge>
            <h2 className="font-bengali font-extrabold text-3xl sm:text-4xl text-foreground">
              {t("আমাদের অনন্য পাঠদান কৌশল ও পরিচর্যা", "Our Distinctive Pedagogy & Care")}
            </h2>
            <p className="mt-3 font-bengali text-muted-foreground text-base max-w-2xl mx-auto">
              {t(
                "গতানুগতিক ধারার বাইরে প্রতিটি শিক্ষার্থীর জন্য আন্তরিক সান্নিধ্য, তাজবীদভিত্তিক ড্রিল ও সৃজনশীল পাঠদান প্রক্রিয়া।",
                "Going beyond conventional rote learning with personalized mentorship and creative engagement.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methodologyPoints.map((point, index) => (
              <motion.div
                key={index}
                {...springIn}
                transition={springInDelay(index * 0.06)}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground font-mono">
                      0{index + 1}
                    </span>
                    <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-bengali text-lg font-bold text-foreground mb-2">
                    {point.title}
                  </h3>
                  <p className="font-bengali text-sm leading-relaxed text-muted-foreground">
                    {point.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/curriculum">
              <Button size="lg" className="rounded-2xl px-8 font-bengali font-bold gap-2">
                <span>{t("সম্পূর্ণ শিক্ষাক্রম ও সিলেবাস বিস্তারিত দেখুন", "View Full Curriculum & Syllabus")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= LEADERSHIP & GUIDING VISION ================= */}
      <section id="leadership" className="scroll-mt-24 sm:scroll-mt-28 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 px-3.5 py-1 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
              {t("পরিচালকমণ্ডলী ও নেতৃত্ব", "Leadership & Guidance")}
            </Badge>
            <h2 className="font-bengali font-extrabold text-3xl sm:text-4xl text-foreground">
              {t("দিকনির্দেশনায় অভিজ্ঞ উলামায়ে কেরাম ও শিক্ষাবিদ", "Led by Renowned Scholars & Visionary Academics")}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {leadership.map((leader, index) => (
              <motion.div
                key={leader.name}
                {...springIn}
                transition={springInDelay(index * 0.12)}
                className="rounded-3xl border border-border bg-card p-8 shadow-lg flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start gap-5 mb-6">
                    <div className="relative shrink-0">
                      <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md">
                        <img
                          src={leader.image}
                          alt={leader.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            if (leader.name.includes("আব্দুল্লাহ") || leader.name.toLowerCase().includes("abdullah")) {
                              e.currentTarget.src = "/abdullah.png";
                            } else {
                              e.currentTarget.src = "/gallery/campus_main.jpg";
                            }
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow">
                        <Briefcase className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bengali text-xl font-bold text-foreground">
                        {leader.name}
                      </h3>
                      <p className="font-bengali font-semibold text-sm text-primary">
                        {leader.role}
                      </p>
                      <p className="font-bengali text-xs text-muted-foreground mt-0.5">
                        {leader.qualification}
                      </p>
                      <span className="inline-block mt-2 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground/80 font-bengali">
                        {leader.experience}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/50 p-4 border border-border/60 mb-6">
                    <p className="font-bengali italic text-sm leading-relaxed text-foreground/90">
                      "{leader.quote}"
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono text-foreground font-semibold">{leader.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono text-xs">{leader.email}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/teachers">
              <Button variant="outline" size="lg" className="rounded-full px-8 font-bengali font-bold gap-2">
                <span>{t("আমাদের সকল শিক্ষক ও স্টাফ তালিকা দেখুন", "Meet All Faculty & Teachers")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* ================= FINAL CALL TO ACTION ================= */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/95 to-emerald-900 text-primary-foreground p-8 sm:p-14 text-center shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-white backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{t("নতুন শিক্ষাবর্ষে সীমিত আসনে ভর্তি চলছে", "Admissions Open for New Academic Session")}</span>
              </span>

              <h2 className="font-bengali font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                {t(
                  "আপনার প্রিয় সন্তানের উজ্জ্বল দ্বীনি ও আধুনিক ভবিষ্যৎ গড়ুন",
                  "Build a Bright Islamic & Academic Future for Your Child",
                )}
              </h2>

              <p className="font-bengali text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                {t(
                  "সহীহ কুরআন তেলাওয়াত, চরিত্র গঠন ও আধুনিক সাধারণ শিক্ষার অপূর্ব সমন্বয়ে আননূর তাহফিজুল কুরআন মাদরাসায় এখনই যোগাযোগ অথবা অনলাইনে ভর্তি আবেদন করুন।",
                  "Connect with Annoor Tahfizul Quran Madrasa or apply online today to ensure your child's moral, spiritual, and intellectual excellence.",
                )}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link to="/admission">
                  <Button size="lg" className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-bengali font-bold px-8 shadow-xl gap-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>{t("অনলাইন ভর্তি আবেদন", "Online Admission")}</span>
                  </Button>
                </Link>
                <Link to="/downloads">
                  <Button size="lg" variant="outline" className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white font-bengali font-semibold px-7 backdrop-blur-sm gap-2">
                    <Layers className="h-5 w-5" />
                    <span>{t("সিলেবাস ও প্রসপেক্টাস", "Syllabus & Routine")}</span>
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="ghost" className="rounded-full text-white hover:bg-white/10 font-bengali px-6 gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{t("সরাসরি ক্যাম্পাস যোগাযোগ", "Campus Contact")}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
