import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold mb-4">
              {t("ইসলামিক একাডেমি", "Islamic Academy")}
            </h3>
            <p className="font-bengali text-primary-foreground/80 leading-relaxed">
              {t(
                "ঈমান ও শ্রেষ্ঠত্বের ভিত্তি গড়ি। আমাদের লক্ষ্য হলো ইসলামিক মূল্যবোধের আলোকে আধুনিক শিক্ষা প্রদান।",
                "Building foundations of faith and excellence. Our mission is to provide modern education in the light of Islamic values."
              )}
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">
              {t("দ্রুত লিংক", "Quick Links")}
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/about", label: t("আমাদের সম্পর্কে", "About Us") },
                { to: "/admission", label: t("ভর্তি তথ্য", "Admission Info") },
                { to: "/results", label: t("পরীক্ষার ফলাফল", "Exam Results") },
                { to: "/contact", label: t("যোগাযোগ", "Contact") },
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
            <div className="space-y-2 font-bengali text-primary-foreground/80">
              <p>📍 {t("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}</p>
              <p>📞 +880 1XXX-XXXXXX</p>
              <p>✉️ info@islamicacademy.edu.bd</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center text-primary-foreground/60 text-sm font-bengali">
          © 2026 {t("ইসলামিক একাডেমি। সর্বস্বত্ব সংরক্ষিত।", "Islamic Academy. All rights reserved.")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
