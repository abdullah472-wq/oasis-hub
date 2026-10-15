import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Smartphone,
  Sparkles,
  ChevronRight,
  CreditCard,
  MessageCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/%E0%A6%86%E0%A6%A8%E0%A6%A8%E0%A7%82%E0%A6%B0+%E0%A6%A4%E0%A6%BE%E0%A6%B9%E0%A6%AB%E0%A6%BF%E0%A6%9C%E0%A7%81%E0%A6%B2+%E0%A6%95%E0%A7%81%E0%A6%B0%E0%A6%86%E0%A6%A8+%E0%A6%AE%E0%A6%BE%E0%A6%A6%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A6%BE+%E0%A6%93+%E0%A6%AE%E0%A6%A1%E0%A7%87%E0%A6%B2+%E0%A6%8F%E0%A6%95%E0%A6%BE%E0%A6%A1%E0%A7%87%E0%A6%AE%E0%A7%80/@24.1119189,90.5677945,21z/data=!4m6!3m5!1s0x3755d59d76b2ffd9:0xde5de9aa6b8378aa!8m2!3d24.1118467!4d90.5680587!16s%2Fg%2F11khdsnx7w?entry=ttu&g_ep=EgoyMDI2MDMzMS4wIKXMDSoASAFQAw%3D%3D";

const siteLogo = "/site-logo.png";
const BANK_ACCOUNT_NUMBER = "20503760201161316";

const Footer = () => {
  const { t } = useLanguage();
  const [copiedBank, setCopiedBank] = useState(false);

  const handleCopyBank = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT_NUMBER);
    setCopiedBank(true);
    toast.success(t("ব্যাংক অ্যাকাউন্ট নম্বর কপি করা হয়েছে!", "Bank account number copied!"));
    setTimeout(() => setCopiedBank(false), 2500);
  };

  return (
    <footer className="relative overflow-hidden border-t border-emerald-900/40 bg-gradient-to-b from-[#073328] via-[#05261d] to-[#031712] text-primary-foreground">
      {/* Subtle Islamic Geometric Accent Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Top Ambient Glow Line */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500/20 via-accent/60 to-emerald-500/20" />

      {/* Institutional Top Strip: Hotline & Fast Action */}
      <div className="border-b border-white/10 bg-black/20 py-3.5 backdrop-blur-md">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 text-xs font-bengali sm:flex-row sm:text-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 text-emerald-100 sm:justify-start">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              <Sparkles className="h-3 w-3" />
              {t("ভর্তি তথ্য ও সেবা", "Admissions & Info")}
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="text-white/80">
              {t("বালক ও বালিকা ক্যাম্পাস, কাপাসিয়া, গাজীপুর", "Boys & Girls Campus, Kapasia, Gazipur")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:01820811511"
              className="group flex items-center gap-1.5 font-medium text-emerald-200 transition-colors hover:text-white"
            >
              <Phone className="h-3.5 w-3.5 text-accent transition-transform group-hover:scale-110" />
              <span>০১৮২০-৮১১৫১১</span>
            </a>
            <span className="text-white/30">|</span>
            <Link
              to="/admission-form"
              className="inline-flex items-center gap-1 rounded-full bg-accent/90 px-3.5 py-1 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-accent hover:shadow-md active:scale-95"
            >
              <span>{t("অনলাইন ভর্তি ফরম", "Apply Online")}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer Content */}
      <div className="container relative mx-auto px-4 py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1: Brand & Identity (4 Cols on LG) */}
          <div className="space-y-5 lg:col-span-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-accent/40 bg-white/10 p-1 shadow-lg shadow-emerald-950/40 backdrop-blur-md">
                <img
                  src={siteLogo}
                  alt="Annoor Education Family logo"
                  className="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h3 className="font-bengali text-xl font-bold tracking-tight text-white drop-shadow-sm">
                  {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
                </h3>
                <p className="font-bengali text-xs font-medium text-accent">
                  {t("প্রতিষ্ঠিত: ২০১৩ • কাপাসিয়া, গাজীপুর", "Est. 2013 • Kapasia, Gazipur")}
                </p>
              </div>
            </div>

            <p className="font-bengali text-sm leading-relaxed text-emerald-100/75">
              {t(
                "সাধারণ শিক্ষার যুগোপযোগী সিলেবাস এবং পবিত্র কুরআনের নূর—এই দুইয়ের মেলবন্ধনে আপনার সন্তানকে পরিপূর্ণ নৈতিকতা, আধুনিক জ্ঞান ও ইসলামিক আদর্শে গড়ে তুলতে আমরা বদ্ধপরিকর।",
                "Dedicated to nurturing your child through the unique harmony of modern schooling and the light of the Holy Quran, fostering academic excellence with ethical leadership."
              )}
            </p>

            {/* Social Media Links */}
            <div>
              <p className="mb-2.5 font-bengali text-xs font-semibold uppercase tracking-wider text-emerald-200/80">
                {t("সোশ্যাল মিডিয়ায় যুক্ত থাকুন", "Connect With Us")}
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.facebook.com/share/17MH16oxjo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Page"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-100 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/30 active:scale-95"
                >
                  <Facebook className="h-5 w-5" />
                </a>

                <a
                  href="https://youtube.com/@annooreducationfamily"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Channel"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-100 backdrop-blur-sm transition-all hover:border-red-400/40 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
                >
                  <Youtube className="h-5 w-5" />
                </a>

                <a
                  href="https://wa.me/8801820811511"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Helpline"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-100 backdrop-blur-sm transition-all hover:border-emerald-400/40 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-600/30 active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Maps"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-100 backdrop-blur-sm transition-all hover:border-accent/40 hover:bg-accent hover:text-slate-950 hover:shadow-lg hover:shadow-accent/30 active:scale-95"
                >
                  <MapPin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2.5 Cols on LG) */}
          <div className="space-y-4 lg:col-span-2 lg:pl-2">
            <h4 className="flex items-center gap-2 font-bengali text-base font-bold text-white">
              <span className="h-4 w-1 rounded-full bg-accent" />
              {t("দ্রুত নেভিগেশন", "Quick Links")}
            </h4>
            <ul className="space-y-2 text-sm font-bengali">
              {[
                { to: "/about", label: t("আমাদের পরিচিতি", "About Us") },
                { to: "/curriculum", label: t("শিক্ষা কারিকুলাম", "Curriculum") },
                { to: "/teachers", label: t("শিক্ষক ও পরিচালকমণ্ডলী", "Teachers & Staff") },
                { to: "/huffaz", label: t("কৃতি হাফেজ তালিকা", "Wall of Huffaz") },
                { to: "/achievements", label: t("সাফল্য ও অর্জন", "Achievements") },
                { to: "/gallery", label: t("ফটো গ্যালারি", "Gallery") },
                { to: "/events", label: t("ইভেন্ট ক্যালেন্ডার", "Events") },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-1.5 text-emerald-100/75 transition-all duration-150 hover:translate-x-1 hover:text-accent"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-emerald-400/50 transition-colors group-hover:text-accent" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Admissions & Services (2.5 Cols on LG) */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="flex items-center gap-2 font-bengali text-base font-bold text-white">
              <span className="h-4 w-1 rounded-full bg-emerald-400" />
              {t("ভর্তি ও শিক্ষার্থী সেবা", "Admissions & Services")}
            </h4>
            <ul className="space-y-2 text-sm font-bengali">
              {[
                {
                  to: "/admission-form",
                  label: t("অনলাইন ভর্তি ফরম", "Online Admission Form"),
                  badge: t("চলছে", "Live"),
                },
                {
                  to: "/admission",
                  label: t("ভর্তি তথ্য ও ফি কাঠামো", "Admission Info & Fees"),
                },
                { to: "/notices", label: t("নোটিশ বোর্ড", "Notice Board") },
                { to: "/downloads", label: t("সিলেবাস ও ডাউনলোড", "Download Corner") },
                {
                  to: "/apk",
                  label: t("অ্যান্ড্রয়েড মোবাইল অ্যাপ", "Android Mobile App"),
                  icon: <Smartphone className="h-3.5 w-3.5 text-emerald-400" />,
                },
                { to: "/virtual-tour", label: t("ভার্চুয়াল ক্যাম্পাস ট্যুর", "Virtual Tour") },
                { to: "/contact", label: t("যোগাযোগ ও পরামর্শ", "Contact & Support") },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center justify-between text-emerald-100/75 transition-all duration-150 hover:translate-x-1 hover:text-accent"
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronRight className="h-3.5 w-3.5 text-emerald-400/50 transition-colors group-hover:text-accent" />
                      <span>{link.label}</span>
                    </span>
                    {link.badge && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Office Info (3 Cols on LG) */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="flex items-center gap-2 font-bengali text-base font-bold text-white">
              <span className="h-4 w-1 rounded-full bg-accent" />
              {t("যোগাযোগ ও অফিস", "Contact & Office")}
            </h4>

            <div className="space-y-3 font-bengali text-sm text-emerald-100/80">
              {/* Address with Map Link */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 transition-colors hover:text-accent"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent transition-transform group-hover:scale-110" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-white">
                      {t("ক্যাম্পাস অবস্থান:", "Campus Location:")}
                    </p>
                    <p className="text-emerald-100/70">
                      {t(
                        "মেইন রোড, কাপাসিয়া বাজার (পুরাতন সোনালী ব্যাংকের বিপরীতে), কাপাসিয়া, গাজীপুর।",
                        "Main Road, Kapasia Bazar (Opposite Old Sonali Bank), Kapasia, Gazipur."
                      )}
                    </p>
                  </div>
                </a>
              </div>

              {/* Direct Personnel Helplines */}
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <span className="font-semibold text-white">
                      {t("প্রধান শিক্ষক:", "Principal:")}
                    </span>{" "}
                    <span className="text-emerald-200">
                      {t("হাফেজ আমানুল্লাহ", "Hafez Amanullah")}
                    </span>
                  </div>
                  <a
                    href="tel:01820811511"
                    className="font-mono font-bold text-accent hover:underline"
                  >
                    01820-811511
                  </a>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-semibold text-white">
                      {t("ম্যানেজার:", "Manager:")}
                    </span>{" "}
                    <span className="text-emerald-200">
                      {t("মুফতি আব্দুল্লাহ আল মামুন", "Mufti Abdullah Al Mamon")}
                    </span>
                  </div>
                  <div className="text-right">
                    <a
                      href="tel:01312200043"
                      className="block font-mono font-bold text-accent hover:underline"
                    >
                      01312200043
                    </a>
                    <a
                      href="tel:01581818368"
                      className="block font-mono text-[11px] text-emerald-200/80 hover:underline"
                    >
                      01581-818368
                    </a>
                  </div>
                </div>
              </div>

              {/* Bank Tuition & Donation Details Card */}
              <div className="rounded-xl border border-accent/25 bg-accent/5 p-3 text-xs backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-accent">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>{t("ব্যাংক হিসাব (টিউশন ফি ও অনুদান)", "Bank Account (Tuition & Donation)")}</span>
                  </div>
                  <button
                    onClick={handleCopyBank}
                    className="inline-flex items-center gap-1 rounded-md bg-accent/20 px-2 py-0.5 text-[11px] font-medium text-accent transition-all hover:bg-accent hover:text-slate-950 active:scale-95"
                    title={t("হিসাব নম্বর কপি করুন", "Copy Account Number")}
                  >
                    {copiedBank ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedBank ? t("কপি হয়েছে", "Copied") : t("কপি", "Copy")}</span>
                  </button>
                </div>
                <p className="mt-1.5 text-white/90">
                  {t("ইসলামী ব্যাংক বাংলাদেশ পিএলসি, কাপাসিয়া শাখা", "Islami Bank Bangladesh PLC, Kapasia Branch")}
                </p>
                <p className="font-mono font-bold tracking-wide text-white">
                  A/C: {BANK_ACCOUNT_NUMBER}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs font-bengali text-emerald-100/60 md:flex-row">
            
            {/* Left: Copyright */}
            <div className="text-center md:text-left">
              <p>
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-white">
                  {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
                </span>
                । {t("সর্বস্বত্ব সংরক্ষিত।", "All rights reserved.")}
              </p>
            </div>

            {/* Center: Developer & Engineering Attribution */}
            <div className="flex items-center gap-1.5 text-center">
              <span>{t("পরিকল্পনা ও কারিগরি সহযোগিতায়", "Designed & Engineered by")}</span>
              <a
                href="https://codbot.pro.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-accent transition-all hover:text-white hover:underline"
              >
                <span>Codbot</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Right: CMS Admin Access Link */}
            <div className="flex items-center gap-3">
              <Link
                to="/admin/login"
                className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-emerald-200/80 transition-colors hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
              >
                <Shield className="h-3 w-3 text-accent transition-transform group-hover:scale-110" />
                <span>{t("অ্যাডমিন পোর্টাল", "Admin Portal")}</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
