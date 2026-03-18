import { Link } from "react-router-dom";
import { Facebook, Youtube, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center overflow-hidden">
                <img src="/src/assets/logos/site-logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">
                  {t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}
                </h3>
                <p className="font-bengali text-sm text-primary-foreground/60">
                  {t("প্রতিষ্ঠিত ২০১৩", "Founded 2013")}
                </p>
              </div>
            </div>
            <p className="font-bengali text-primary-foreground/80 leading-relaxed">
              {t(
                "ঈমান ও শ্রেষ্ঠত্বের ভিত্তি গড়ি। আমাদের লক্ষ্য হলো ইসলামিক মূল্যবোধের আলোকে আধুনিক শিক্ষা প্রদান।",
                "Building foundations of faith and excellence. Our mission is to provide modern education in the light of Islamic values."
              )}
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://www.facebook.com/share/17MH16oxjo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@annooreducationfamily?si=IN4-grDKsDtDt3qC"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">
              {t("দ্রুত লিংক", "Quick Links")}
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/about", label: t("আমাদের সম্পর্কে", "About Us") },
                { to: "/admission", label: t("ভর্তি তথ্য", "Admission Info") },
                { to: "/news", label: t("সংবাদ", "News") },
                { to: "/results", label: t("পরীক্ষার ফলাফল", "Exam Results") },
                { to: "/contact", label: t("যোগাযোগ", "Contact") },
                { to: "/admin", label: t("অ্যাডমিন", "Admin") },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-bengali text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">
              {t("যোগাযোগ", "Contact")}
            </h4>
            <div className="space-y-3 font-bengali text-primary-foreground/80 text-sm">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{t("মেইন রোড, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর", "Main Road, Kapasia Bazar, Kapasia, Gazipur")}</span>
              </p>
              
              <div className="border-t border-primary-foreground/20 pt-3 mt-3">
                <p className="font-semibold text-primary-foreground">{t("প্রধান শিক্ষক", "Principal")}</p>
                <p>হাফেজ আমানুল্লাহ</p>
                <p>01820-811511</p>
              </div>
              
              <div className="border-t border-primary-foreground/20 pt-3 mt-3">
                <p className="font-semibold text-primary-foreground">{t("ম্যানেজার", "Manager")}</p>
                <p>মুফতি আব্দুল্লাহ আল মামুন</p>
                <p>01312200043 (Nagad/Rocket)</p>
                <p>01581818368 (Bkash/WhatsApp)</p>
              </div>

              <div className="border-t border-primary-foreground/20 pt-3 mt-3">
                <p className="font-semibold text-primary-foreground">{t("ব্যাংক", "Bank")}</p>
                <p>Islami Bank Bangladesh PLC, Kapasia Branch</p>
                <p>A/C: 20503760201161316</p>
                <p>Name: Abdullah Al Mamon Ikbal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center text-primary-foreground/60 text-sm font-bengali">
          © 2026 {t("আননূর শিক্ষা পরিবার। সর্বস্বত্ব সংরক্ষিত।", "Annoor Education Family. All rights reserved.")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
