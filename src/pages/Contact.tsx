import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle,
  Clock,
  Building2,
  CreditCard,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  User,
  ShieldCheck,
  Navigation,
  Globe,
  HelpCircle,
  ChevronRight,
  School,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings } from "@/lib/siteSettings";

const DEFAULT_MAPS_URL =
  "https://www.google.com/maps/place/%E0%A6%86%E0%A6%A8%E0%A6%A8%E0%A7%82%E0%A6%B0+%E0%A6%A4%E0%A6%BE%E0%A6%B9%E0%A6%AB%E0%A6%BF%E0%A6%9C%E0%A7%81%E0%A6%B2+%E0%A6%95%E0%A7%81%E0%A6%B0%E0%A6%86%E0%A6%A8+%E0%A6%AE%E0%A6%BE%E0%A6%A6%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A6%BE+%E0%A6%93+%E0%A6%AE%E0%A6%A1%E0%A7%87%E0%A6%B2+%E0%A6%8F%E0%A6%95%E0%A6%BE%E0%A6%A1%E0%A7%87%E0%A6%AE%E0%A7%80/@24.1119189,90.5677945,21z/data=!4m6!3m5!1s0x3755d59d76b2ffd9:0xde5de9aa6b8378aa!8m2!3d24.1118467!4d90.5680587!16s%2Fg%2F11khdsnx7w?entry=ttu&g_ep=EgoyMDI2MDMzMS4wIKXMDSoASAFQAw%3D%3D";
const GOOGLE_MAPS_URL = DEFAULT_MAPS_URL;

const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?q=%E0%A6%86%E0%A6%A8%E0%A6%A8%E0%A7%82%E0%A6%B0%20%E0%A6%A4%E0%A6%BE%E0%A6%B9%E0%A6%AB%E0%A6%BF%E0%A6%9C%E0%A7%81%E0%A6%B2%20%E0%A6%95%E0%A7%81%E0%A6%B0%E0%A6%86%E0%A6%A8%20%E0%A6%AE%E0%A6%BE%E0%A6%A6%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A6%BE%20%E0%A6%93%20%E0%A6%AE%E0%A6%A1%E0%A7%87%E0%A6%B2%20%E0%A6%8F%E0%A6%95%E0%A6%BE%E0%A6%A1%E0%A7%87%E0%A6%AE%E0%A7%80&ll=24.1118467,90.5680587&z=19&output=embed";

const Contact = () => {
  const { t, lang } = useLanguage();
  const { settings } = useSiteSettings();
  const mapsUrl = settings.google_maps_url || DEFAULT_MAPS_URL;
  const facebookUrl = settings.facebook_url || "https://www.facebook.com/AnnoorTahfizolQoranMadrashaKapasia";
  const youtubeUrl = settings.youtube_url || "https://www.youtube.com/@ANNOORMADRASA";
  const madrasaAddress = settings.address_boys_campus_bn || "মেইন রোড, কলেজ রোড মোড়, কাপাসিয়া বাজার (সিঙ্গার শোরুম এর পাশে), কাপাসিয়া, গাজীপুর-১৭৩০";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "admission",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === "bank") {
      setCopiedBank(true);
      toast.success(t("ব্যাংক হিসাব নম্বর কপি করা হয়েছে", "Bank account copied"));
      setTimeout(() => setCopiedBank(false), 2500);
    } else {
      setCopiedAddress(type);
      toast.success(t("ঠিকানা কপি করা হয়েছে", "Address copied"));
      setTimeout(() => setCopiedAddress(null), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subjectMap: Record<string, string> = {
      admission: "নতুন ভর্তি সংক্রান্ত (New Admission)",
      fees: "ফি ও টিউশন সংক্রান্ত (Fees & Accounts)",
      academic: "একাডেমিক ও সিলেবাস তথ্য (Academic Info)",
      meeting: "সরাসরি সাক্ষাৎ ও অ্যাপয়েন্টমেন্ট (Appointment)",
      general: "সাধারণ জিজ্ঞাসা (General Inquiry)",
    };

    const text = `*আননূর তাহফিজুল কুরআন মাদরাসা - অনলাইন যোগাযোগ বার্তা*\n\n` +
      `👤 *নাম:* ${formData.name}\n` +
      `📱 *মোবাইল:* ${formData.phone}\n` +
      (formData.email ? `✉️ *ইমেইল:* ${formData.email}\n` : "") +
      `🏛️ *প্রতিষ্ঠান:* আননূর তাহফিজুল কুরআন মাদরাসা (কাপাসিয়া বাজার)\n` +
      `📌 *বিষয়:* ${subjectMap[formData.subject] || formData.subject}\n\n` +
      `💬 *বার্তা:* \n${formData.message}\n\n` +
      `_ওয়েবসাইট অনলাইন যোগাযোগ ফর্ম থেকে প্রেরিত_`;

    const whatsappUrl = `https://wa.me/8801820811511?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ================= HERO HEADER ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary/95 to-primary/90 text-primary-foreground py-20 md:py-24">
        {/* Subtle decorative Islamic pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="container relative mx-auto px-4 text-center">
          <motion.div {...springIn} className="mx-auto max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-md border border-white/15 shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>{t("যোগাযোগ ও তথ্য সহায়তা কেন্দ্র", "Annoor Information & Support Hub")}</span>
            </div>

            <h1 className="font-bengali text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-sm">
              {t("যোগাযোগ ও ক্যাম্পাস পরিচিতি", "Contact Us & Campus Guide")}
            </h1>

            <p className="mx-auto max-w-2xl font-bengali text-sm text-emerald-100/90 sm:text-base leading-relaxed">
              {t(
                "আননূর তাহফিজুল কুরআন মাদরাসার অবস্থান, দায়িত্বশীল কর্মকর্তা, যোগাযোগ নম্বর ও সরাসরি দিকনির্দেশনা।",
                "Official contact numbers, principal and management helplines, bank details, and campus location of Annoor Tahfizul Quran Madrasa."
              )}
            </p>

            {/* Quick Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:01820811511"
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 border border-white/10 backdrop-blur-sm text-xs font-medium text-emerald-50 hover:bg-white/20 transition-colors"
              >
                <Phone className="h-4 w-4 text-accent" />
                <span>{t("প্রধান শিক্ষক:", "Principal:")} 01820-811511</span>
              </a>
              <a
                href="tel:01581818368"
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 border border-white/10 backdrop-blur-sm text-xs font-medium text-emerald-50 hover:bg-white/20 transition-colors"
              >
                <Phone className="h-4 w-4 text-sky-300" />
                <span>{t("ম্যানেজার:", "Manager:")} 01581-818368</span>
              </a>
              <a
                href="https://wa.me/8801820811511"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#25D366]/20 px-4 py-2 border border-[#25D366]/40 backdrop-blur-sm text-xs font-medium text-white hover:bg-[#25D366]/30 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>{t("সরাসরি হোয়াটসঅ্যাপ", "WhatsApp Chat")}</span>
              </a>
            </div>
          </motion.div>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>

      {/* ================= KEY PERSONS GRID ================= */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10 space-y-2">
            <h2 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
              {t("দায়িত্বশীল ব্যক্তিবর্গের সাথে যোগাযোগ", "Direct Contact with Key Personnel")}
            </h2>
            <p className="font-bengali text-sm text-muted-foreground">
              {t("শিক্ষা কার্যক্রম, ভর্তি ও প্রশাসনিক সহায়তায় সরাসরি কল বা হোয়াটসঅ্যাপ করুন", "Reach out directly for academic or administrative queries")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Principal */}
            <motion.div
              {...springIn}
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bengali font-bold text-lg text-foreground">
                    {t("হাফেজ আমানুল্লাহ", "Hafez Amanullah")}
                  </h3>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                    {t("প্রধান শিক্ষক (Principal)", "Principal")}
                  </Badge>
                </div>
              </div>
              <p className="font-bengali text-xs text-muted-foreground mb-4">
                {t(
                  "সার্বিক শিক্ষা পাঠ্যক্রম, হিফজ বিভাগীয় পর্যবেক্ষণ ও ছাত্র শৃঙ্খলা ব্যবস্থাপনা।",
                  "Academic supervision, Hifz curriculum coordination, and student welfare."
                )}
              </p>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <a
                  href="tel:01820811511"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-primary/10 text-xs font-semibold text-foreground hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>01820-811511</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t("কল করুন", "Call")}</span>
                </a>
                <a
                  href="https://wa.me/8801820811511"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-xs font-semibold text-[#128C7E] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </span>
                  <span className="text-[11px]">{t("মেসেজ পাঠান", "Message")}</span>
                </a>
              </div>
            </motion.div>

            {/* Manager */}
            <motion.div
              {...springIn}
              transition={springInDelay(0.1)}
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-lg">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bengali font-bold text-lg text-foreground">
                    {t("মুফতি আব্দুল্লাহ আল মামুন", "Mufti Abdullah Al Mamon")}
                  </h3>
                  <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs">
                    {t("ম্যানেজার ও সার্বিক পরিচালক", "Manager & Director")}
                  </Badge>
                </div>
              </div>
              <p className="font-bengali text-xs text-muted-foreground mb-4">
                {t(
                  "ভর্তি তথ্য, প্রশাসনিক ব্যবস্থাপনা, অভিভাবক পরামর্শ ও আর্থিক কার্যক্রম পরিচালনা।",
                  "Admission consultation, overall institutional management, and guardian relations."
                )}
              </p>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <a
                  href="tel:01312200043"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-sky-500/10 text-xs font-semibold text-foreground hover:text-sky-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sky-600" />
                    <span>01312-200043</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t("কল করুন", "Call")}</span>
                </a>
                <a
                  href="tel:01581818368"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-sky-500/10 text-xs font-semibold text-foreground hover:text-sky-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sky-600" />
                    <span>01581-818368</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t("বিকল্প", "Alt")}</span>
                </a>
              </div>
            </motion.div>

            {/* General Admission Desk */}
            <motion.div
              {...springIn}
              transition={springInDelay(0.2)}
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden sm:col-span-2 lg:col-span-1"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bengali font-bold text-lg text-foreground">
                    {t("কেন্দ্রীয় তথ্য ও ভর্তি ডেস্ক", "Central Admission Desk")}
                  </h3>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                    {t("সরাসরি সহায়তা", "Direct Support")}
                  </Badge>
                </div>
              </div>
              <p className="font-bengali text-xs text-muted-foreground mb-4">
                {t(
                  "অনলাইন ও অফলাইন ভর্তি ফরম, ফি তালিকা, সিলেবাস বা রুটিন সংক্রান্ত সাধারণ অনুসন্ধান।",
                  "Admission inquiries, tuition fees structure, syllabus & routine queries."
                )}
              </p>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <a
                  href="mailto:abdullahalmamon472@gmail.com"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-amber-500/10 text-xs font-semibold text-foreground hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Mail className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="truncate">abdullahalmamon472@gmail.com</span>
                  </span>
                  <span className="text-[11px] shrink-0 text-muted-foreground">{t("ইমেইল", "Mail")}</span>
                </a>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t("শনি - বৃহস্পতি: সকাল ৮:০০ - বিকাল ৫:০০", "Sat - Thu: 8:00 AM - 5:00 PM")}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CAMPUS DETAILS ================= */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8 space-y-2">
            <h2 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
              {t("ক্যাম্পাসের অবস্থান ও বিবরণ", "Campus Location & Details")}
            </h2>
            <p className="font-bengali text-sm text-muted-foreground">
              {t("কাপাসিয়ার প্রাণকেন্দ্রে শিক্ষার্থীদের জন্য সম্পূর্ণ নিরিবিলি, নিরাপদ ও সুশৃঙ্খল পরিবেশ", "Safe, serene, and disciplined learning environment in the heart of Kapasia, Gazipur")}
            </p>
          </div>

          <motion.div
            {...springIn}
            className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 text-xs">
                    {t("প্রধান ক্যাম্পাস", "Main Campus")}
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {t("আবাসিক ও অনাবাসিক", "Residential & Day")}
                  </span>
                </div>
                <h3 className="font-bengali text-2xl sm:text-3xl font-bold text-foreground">
                  {t("আননূর তাহফিজুল কুরআন মাদরাসা", "Annoor Tahfizul Quran Madrasa")}
                </h3>
                <p className="font-bengali text-xs sm:text-sm text-muted-foreground mt-1.5">
                  {t(
                    "নূরানী, নাজেরা, আন্তর্জাতিক মানের হিফজুল কুরআন এবং প্রাথমিক জেনারেল শিক্ষা সমন্বিত ক্যাম্পাস।",
                    "Integrated Nurani, Nazara, International Hifz and Primary General curriculum."
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bengali text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                >
                  <Navigation className="h-4 w-4" />
                  <span>{t("গুগল ম্যাপে দিকনির্দেশনা", "Get Directions")}</span>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(madrasaAddress, "address")}
                  className="rounded-xl text-xs sm:text-sm h-10 px-4 gap-2"
                >
                  {copiedAddress === "address" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedAddress === "address" ? t("কপি হয়েছে", "Copied") : t("ঠিকানা কপি", "Copy Address")}</span>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4 font-bengali">
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{t("ঠিকানা ও অবস্থান:", "Location:")}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {t("মেইন রোড, কলেজ রোড মোড়, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর।", "Main Road, College Road Mor, Kapasia Bazar, Kapasia, Gazipur.")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(madrasaAddress, settings.address_boys_campus_en || madrasaAddress)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{t("জরুরি হটলাইন ও যোগাযোগ:", "Direct Helplines:")}</p>
                    <div className="flex items-center gap-3 flex-wrap mt-0.5 text-sm font-semibold">
                      <a href={`tel:${(settings.phone_secondary || "01581818368").replace(/[^0-9]/g, "")}`} className="text-primary hover:underline font-mono">
                        {settings.phone_secondary || "01581-818368"}
                      </a>
                      <span className="text-muted-foreground">|</span>
                      <a href={`tel:${(settings.phone_primary || "01820811511").replace(/[^0-9]/g, "")}`} className="text-primary hover:underline font-mono">
                        {settings.phone_primary || "01820-811511"}
                      </a>
                      <span className="text-muted-foreground">|</span>
                      <a href="tel:01312200043" className="text-primary hover:underline font-mono">
                        01312-200043
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus Highlights list */}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 font-bengali">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  {t("ক্যাম্পাসের বিশেষ সুবিধাসমূহ", "Campus Features & Security")}
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{t("সিসিটিভি ও সিকিউরিটি গার্ড", "24/7 CCTV & Security")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{t("স্বাস্থ্যসম্মত নিজস্ব ডাইনিং", "Hygienic Dining")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{t("নিরিবিলি মনোরম পরিবেশ", "Serene Atmosphere")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{t("সার্বক্ষণিক বিদ্যুৎ ও পানি", "24/7 Power & Clean Water")}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= BANK DETAILS & OFFICE SCHEDULE ================= */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Bank Card */}
            <motion.div
              {...springIn}
              className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-card p-6 sm:p-8 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bengali text-lg font-bold text-foreground">
                    {t("ব্যাংক হিসাব (টিউশন ফি ও অনুদান)", "Bank Details (Fees & Donations)")}
                  </h3>
                  <p className="font-bengali text-xs text-muted-foreground">
                    {t("সরাসরি ব্যাংক বা মোবাইল ব্যাংকিংয়ের মাধ্যমে লেনদেন করুন", "Bank transfer and mobile banking info")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-background/80 p-4 space-y-3 font-bengali text-sm">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">{t("ব্যাংকের নাম:", "Bank Name:")}</span>
                  <span className="font-bold text-foreground">Islami Bank Bangladesh PLC</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">{t("শাখা:", "Branch:")}</span>
                  <span className="font-semibold text-foreground">{t("কাপাসিয়া শাখা, গাজীপুর", "Kapasia Branch, Gazipur")}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">{t("হিসাবের নাম:", "Account Title:")}</span>
                  <span className="font-semibold text-foreground">Annoor Education Family</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground">{t("হিসাব নম্বর (A/C):", "Account No:")}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      20503760201161316
                    </span>
                    <button
                      onClick={() => copyToClipboard("20503760201161316", "bank")}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      title={t("কপি করুন", "Copy")}
                    >
                      {copiedBank ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 text-xs font-bengali text-muted-foreground">
                <span className="font-semibold text-foreground">{t("বিকাশ / নগদ হেল্পলাইন:", "Bkash / Nagad:")}</span>
                <span className="font-mono font-medium">01820811511, 01581818368</span>
              </div>
            </motion.div>

            {/* Office Hours & Social Links */}
            <motion.div
              {...springIn}
              transition={springInDelay(0.1)}
              className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bengali text-lg font-bold text-foreground">
                      {t("অফিস সময় ও পরিদর্শনের নিয়মাবলী", "Office Hours & Visiting Schedule")}
                    </h3>
                    <p className="font-bengali text-xs text-muted-foreground">
                      {t("অভিভাবক ও শুভাকাঙ্ক্ষীদের জন্য উন্মুক্ত সময়তালিকা", "Visiting schedule for guardians & visitors")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 font-bengali text-xs sm:text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                    <span className="font-medium text-foreground">{t("শনিবার — বৃহস্পতিবার", "Saturday — Thursday")}</span>
                    <span className="font-semibold text-primary">{t("সকাল ৮:০০টা — বিকাল ৫:০০টা", "8:00 AM — 5:00 PM")}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                    <span className="font-medium text-foreground">{t("শুক্রবার (জুমআর দিন)", "Friday (Special Guardian Hour)")}</span>
                    <span className="font-semibold text-emerald-700">{t("দুপুর ২:৩০টা — মাগরিব পর্যন্ত", "2:30 PM — Maghrib")}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                    {t(
                      "জরুরি প্রয়োজনে বা বিশেষ সাক্ষাতের জন্য প্রধান শিক্ষক বা ম্যানেজারের নাম্বারে ফোনে আগে থেকে যোগাযোগ করার পরামর্শ দেওয়া হচ্ছে।",
                      "For special visits or urgent meetings, prior appointment via phone is recommended."
                    )}
                  </div>
                </div>
              </div>

              {/* Social Connect */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap">
                <span className="font-bengali text-xs font-semibold text-muted-foreground">
                  {t("সোশ্যাল মিডিয়ায় সংযুক্ত থাকুন:", "Connect Online:")}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-xs font-semibold"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors text-xs font-semibold"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= MAP & INTERACTIVE CONTACT FORM ================= */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Google Map Box (5 Cols) */}
            <motion.div {...springIn} className="lg:col-span-5 space-y-4">
              <div className="space-y-1">
                <h3 className="font-bengali text-xl font-bold text-foreground">
                  {t("গুগল ম্যাপে আমাদের অবস্থান", "Our Location on Google Maps")}
                </h3>
                <p className="font-bengali text-xs text-muted-foreground">
                  {t("সহজেই খুঁজে পেতে ম্যাপে জুম বা রুট দেখে নিন", "Zoom in or view route to easily find our campus")}
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm h-72 sm:h-80 relative">
                <iframe
                  src={GOOGLE_MAPS_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Annoor Tahfizul Quran Madrasa Location"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bengali text-xs font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t("গুগল ম্যাপস অ্যাপে পুরো লোকেশন খুলুন", "Open in Google Maps App")}</span>
                </a>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(mapsUrl);
                    toast.success(t("ম্যাপ লিঙ্ক কপি করা হয়েছে", "Map URL copied"));
                  }}
                  className="text-xs gap-1"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{t("শেয়ার", "Share")}</span>
                </Button>
              </div>
            </motion.div>

            {/* Smart Interactive Form (7 Cols) */}
            <motion.div
              {...springIn}
              transition={springInDelay(0.1)}
              className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm"
            >
              <div className="space-y-1 mb-6">
                <h3 className="font-bengali text-2xl font-bold text-foreground">
                  {t("অনলাইন বার্তা বা অনুসন্ধান পাঠান", "Send an Online Inquiry")}
                </h3>
                <p className="font-bengali text-xs text-muted-foreground">
                  {t(
                    "ফর্মটি পূরণ করে সরাসরি আমাদের অফিশিয়াল হোয়াটসঅ্যাপে বার্তা পাঠান। আমরা দ্রুত উত্তর দেব।",
                    "Fill out the form to instantly message our official WhatsApp. We will reply promptly."
                  )}
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h4 className="font-bengali text-xl font-bold text-foreground">
                    {t("বার্তাটি সফলভাবে প্রস্তুত করা হয়েছে!", "Message Prepared Successfully!")}
                  </h4>
                  <p className="font-bengali text-sm text-muted-foreground max-w-sm mx-auto">
                    {t(
                      "আপনার ব্রাউজারে হোয়াটসঅ্যাপ ওপেন হয়েছে। কোনো কারণে না খুললে নিচের বোতামে আবার ক্লিক করুন।",
                      "WhatsApp has been opened in your browser/app. If not, click below to try again."
                    )}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="font-bengali text-xs rounded-xl"
                    >
                      {t("নতুন বার্তা লিখুন", "Write Another Message")}
                    </Button>
                    <a
                      href="https://wa.me/8801820811511"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white font-bengali text-xs font-semibold hover:bg-[#128C7E] transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{t("হোয়াটসঅ্যাপ খুলুন", "Open WhatsApp")}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact_name" className="font-bengali font-semibold text-xs">
                        {t("আপনার নাম *", "Your Name *")}
                      </Label>
                      <Input
                        id="contact_name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("যেমন: মো: আরিফুল ইসলাম", "e.g. Md. Ariful Islam")}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact_phone" className="font-bengali font-semibold text-xs">
                        {t("মোবাইল নম্বর *", "Mobile Number *")}
                      </Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Subject Selector */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact_subject" className="font-bengali font-semibold text-xs">
                        {t("অনুসন্ধানের বিষয় *", "Inquiry Subject *")}
                      </Label>
                      <select
                        id="contact_subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full h-11 rounded-xl border border-input bg-background px-3 font-bengali text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="admission">{t("নতুন ভর্তি সংক্রান্ত (Admission)", "Admission")}</option>
                        <option value="fees">{t("ফি ও মাসিক খরচ (Fees & Tuition)", "Fees")}</option>
                        <option value="academic">{t("সিলেবাস ও শিক্ষা কার্যক্রম (Academic)", "Academic")}</option>
                        <option value="meeting">{t("সরাসরি সাক্ষাৎ (Appointment)", "Appointment")}</option>
                        <option value="general">{t("অন্যান্য সাধারণ জিজ্ঞাসা (General)", "General")}</option>
                      </select>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact_email" className="font-bengali font-semibold text-xs">
                        {t("ইমেইল (ঐচ্ছিক)", "Email (Optional)")}
                      </Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@gmail.com"
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contact_message" className="font-bengali font-semibold text-xs">
                      {t("আপনার বার্তা বা প্রশ্ন *", "Your Message *")}
                    </Label>
                    <Textarea
                      id="contact_message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t(
                        "আপনার বার্তা, শিক্ষার্থীর শ্রেণি বা যেকোনো জিজ্ঞাসা লিখুন...",
                        "Write your question, student's class, or requirements..."
                      )}
                      className="rounded-xl resize-none font-bengali text-sm"
                      required
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      type="submit"
                      className="w-full sm:flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bengali text-sm font-bold gap-2 shadow-sm transition-all"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{t("হোয়াটসঅ্যাপে তাৎক্ষণিক পাঠান", "Send via WhatsApp")}</span>
                    </Button>
                    <a
                      href="tel:01820811511"
                      className="w-full sm:w-auto h-12 px-5 rounded-xl border border-border/80 hover:bg-muted font-bengali text-xs font-semibold flex items-center justify-center gap-2 text-foreground transition-colors"
                    >
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{t("সরাসরি কল", "Quick Call")}</span>
                    </a>
                  </div>
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
