import { Link } from "react-router-dom";
import { Facebook, Youtube, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import siteLogo from "@/assets/logos/site-logo.png";

const FooterDivider = () => (
  <svg viewBox="0 0 1440 80" className="w-full h-20" preserveAspectRatio="none">
    <defs>
      <linearGradient id="footerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="100%" stopColor="#0c4a3e" />
      </linearGradient>
    </defs>
    <path fill="url(#footerGrad)" d="M0,80 L0,30 C360,60 720,10 1080,40 C1260,55 1380,45 1440,30 L1440,80 Z" />
  </svg>
);

const Footer = () => {
  const { t } = useLanguage();

  return (
    <div>
      <FooterDivider />
      <footer
        className="bg-[#0c4a3e] text-primary-foreground"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={siteLogo}
                    alt="Annoor Education Family logo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}</h3>
                  <p className="font-bengali text-sm text-primary-foreground/60">{t("প্রতিষ্ঠিত ২০১৩", "Founded 2013")}</p>
                </div>
              </div>
              <p className="font-bengali text-primary-foreground/80 leading-relaxed">{t("ঈমান ও শ্রেষ্ঠত্বের ভিত্তি গড়ি। আমাদের লক্ষ্য হলো ইসলামিক মূল্যবোধের আলোকে আধুনিক শিক্ষা প্রদান।", "Building foundations of faith and excellence. Our mission is to provide modern education in the light of Islamic values.")}</p>
              <div className="flex gap-4 mt-4">
                <a href="https://www.facebook.com/share/17MH16oxjo/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="https://youtube.com/@annooreducationfamily" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">{t("দ্রুত লিংক", "Quick Links")}</h4>
              <div className="flex flex-col gap-2">
                {[{ to: "/about", label: t("আমাদের সম্পর্কে", "About Us") }, { to: "/admission", label: t("ভর্তি তথ্য", "Admission Info") }, { to: "/news", label: t("সংবাদ", "News") }, { to: "/results", label: t("পরীক্ষার ফলাফল", "Exam Results") }, { to: "/contact", label: t("যোগাযোগ", "Contact") }, { to: "/admin", label: t("অ্যাডমিন", "Admin") }].map((link) => (<Link key={link.to} to={link.to} className="font-bengali text-primary-foreground/70 hover:text-accent transition-colors">{link.label}</Link>))}
              </div>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">{t("যোগাযোগ", "Contact")}</h4>
              <div className="space-y-3 font-bengali text-primary-foreground/80 text-sm">
                <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{t("মেইন রোড, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর", "Main Road, Kapasia Bazar, Kapasia, Gazipur")}</span></p>
                <div className="border-t border-primary-foreground/20 pt-3 mt-3">
                  <p className="font-semibold text-primary-foreground">{t("প্রধান শিক্ষক", "Principal")}</p>
                  <p>হাফেজ আমানুল্লাহ</p><p>01820-811511</p>
                </div>
                <div className="border-t border-primary-foreground/20 pt-3 mt-3">
                  <p className="font-semibold text-primary-foreground">{t("ম্যানেজার", "Manager")}</p>
                  <p>মুফতি আব্দুল্লাহ আল মামুন</p><p>01312200043</p><p>01581818368</p>
                </div>
                <div className="border-t border-primary-foreground/20 pt-3 mt-3">
                  <p className="font-semibold text-primary-foreground">{t("ব্যাংক", "Bank")}</p>
                  <p>Islami Bank Bangladesh PLC, Kapasia Branch</p><p>A/C: 20503760201161316</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center text-primary-foreground/60 text-sm font-bengali">
            © 2026 {t("আননূর শিক্ষা পরিবার। সর্বস্বত্ব সংরক্ষিত।", "Annoor Education Family. All rights reserved.")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
