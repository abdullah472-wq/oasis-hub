import { Link } from "react-router-dom";
import { Facebook, Youtube, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/%E0%A6%86%E0%A6%A8%E0%A6%A8%E0%A7%82%E0%A6%B0+%E0%A6%A4%E0%A6%BE%E0%A6%B9%E0%A6%AB%E0%A6%BF%E0%A6%9C%E0%A7%81%E0%A6%B2+%E0%A6%95%E0%A7%81%E0%A6%B0%E0%A6%86%E0%A6%A8+%E0%A6%AE%E0%A6%BE%E0%A6%A6%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A6%BE+%E0%A6%93+%E0%A6%AE%E0%A6%A1%E0%A7%87%E0%A6%B2+%E0%A6%8F%E0%A6%95%E0%A6%BE%E0%A6%A1%E0%A7%87%E0%A6%AE%E0%A7%80/@24.1119189,90.5677945,21z/data=!4m6!3m5!1s0x3755d59d76b2ffd9:0xde5de9aa6b8378aa!8m2!3d24.1118467!4d90.5680587!16s%2Fg%2F11khdsnx7w?entry=ttu&g_ep=EgoyMDI2MDMzMS4wIKXMDSoASAFQAw%3D%3D";
const siteLogo = "/site-logo.png";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <div>
      <footer
        className="bg-[#0c4a3e] text-primary-foreground"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-foreground/10">
                  <img
                    src={siteLogo}
                    alt="Annoor Education Family logo"
                    className="h-full w-full object-cover"
                    sizes="48px"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{t("আননূর শিক্ষা পরিবার", "Annoor Education Family")}</h3>
                  <p className="font-bengali text-sm text-primary-foreground/60">{t("\u09aa\u09cd\u09b0\u09a4\u09bf\u09b7\u09cd\u09a0\u09bf\u09a4 \u09e8\u09e6\u09e7\u09e9", "Founded 2013")}</p>
                </div>
              </div>
              <p className="font-bengali leading-relaxed text-primary-foreground/80">{t("সাধারণ শিক্ষার আধুনিক সিলেবাস এবং পবিত্র কোরআনের নূর—এই দুইয়ের এক অনন্য সমন্বয়ে আমরা আপনার সন্তানকে গড়ে তুলতে বদ্ধপরিকর। আমাদের মূল লক্ষ্য হলো স্কুলের জেনারেল শিক্ষার পাশাপাশি প্রতিটি শিক্ষার্থীকে পরিপূর্ণ হাফেজে কোরআন ও উচ্চতর ইসলামী শিক্ষায় শিক্ষিত করে তোলা, যাতে তারা নৈতিকতা ও আধুনিকতার এক বলিষ্ঠ মেলবন্ধন হিসেবে আত্মপ্রকাশ করতে পারে। ", "We are committed to nurturing your child through a unique harmony of modern general education and the light of the Holy Quran. Our core goal is to educate every student in higher Islamic learning alongside mainstream schooling and help them become complete memorizers of the Quran, so they may emerge as a strong blend of morality and modernity.")}</p>
              <div className="mt-4 flex gap-4">
                <a href="https://www.facebook.com/share/17MH16oxjo/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"><Facebook className="h-5 w-5" /></a>
                <a href="https://youtube.com/@annooreducationfamily" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"><Youtube className="h-5 w-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-display text-lg font-semibold">{t("\u09a6\u09cd\u09b0\u09c1\u09a4 \u09b2\u09bf\u0982\u0995", "Quick Links")}</h4>
              <div className="flex flex-col gap-2">
                {[
                  { to: "/about", label: t("\u0986\u09ae\u09be\u09a6\u09c7\u09b0 \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09c7", "About Us") },
                  { to: "/admission", label: t("\u09ad\u09b0\u09cd\u09a4\u09bf \u09a4\u09a5\u09cd\u09af", "Admission Info") },
                  { to: "/news", label: t("\u09b8\u0982\u09ac\u09be\u09a6", "News") },
                  { to: "/results", label: t("\u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u09ab\u09b2\u09be\u09ab\u09b2", "Exam Results") },
                  { to: "/contact", label: t("\u09af\u09cb\u0997\u09be\u09af\u09cb\u0997", "Contact") },
                ].map((link) => (
                  <Link key={link.to} to={link.to} className="font-bengali text-primary-foreground/70 transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-display text-lg font-semibold">{t("\u09af\u09cb\u0997\u09be\u09af\u09cb\u0997", "Contact")}</h4>
              <div className="space-y-3 text-sm font-bengali text-primary-foreground/80">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent hover:underline"
                  >
                    {t("\u09ae\u09c7\u0987\u09a8 \u09b0\u09cb\u09a1, \u0995\u09be\u09aa\u09be\u09b8\u09bf\u09df\u09be \u09ac\u09be\u099c\u09be\u09b0, \u0995\u09be\u09aa\u09be\u09b8\u09bf\u09df\u09be, \u0997\u09be\u099c\u09c0\u09aa\u09c1\u09b0", "Main Road, Kapasia Bazar, Kapasia, Gazipur")}
                  </a>
                </p>
                <div className="mt-3 border-t border-primary-foreground/20 pt-3">
                  <p className="font-semibold text-primary-foreground">{t("\u09aa\u09cd\u09b0\u09a7\u09be\u09a8 \u09b6\u09bf\u0995\u09cd\u09b7\u0995", "Principal")}</p>
                  <p>{t("\u09b9\u09be\u09ab\u09c7\u099c \u0986\u09ae\u09be\u09a8\u09c1\u09b2\u09cd\u09b2\u09be\u09b9", "Hafez Amanullah")}</p>
                  <p>01820-811511</p>
                </div>
                <div className="mt-3 border-t border-primary-foreground/20 pt-3">
                  <p className="font-semibold text-primary-foreground">{t("\u09ae\u09cd\u09af\u09be\u09a8\u09c7\u099c\u09be\u09b0", "Manager")}</p>
                  <p>{t("\u09ae\u09c1\u09ab\u09a4\u09bf \u0986\u09ac\u09cd\u09a6\u09c1\u09b2\u09cd\u09b2\u09be\u09b9 \u0986\u09b2 \u09ae\u09be\u09ae\u09c1\u09a8", "Mufti Abdullah Al Mamon")}</p>
                  <p>01312200043</p>
                  <p>01581818368</p>
                </div>
                <div className="mt-3 border-t border-primary-foreground/20 pt-3">
                  <p className="font-semibold text-primary-foreground">{t("\u09ac\u09cd\u09af\u09be\u0982\u0995", "Bank")}</p>
                  <p>Islami Bank Bangladesh PLC, Kapasia Branch</p>
                  <p>A/C: 20503760201161316</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center text-sm font-bengali text-primary-foreground/60">
            &copy; 2026 {t("আননূর শিক্ষা পরিবার। সর্বস্বত্ব সংরক্ষিত।", "Annoor Education Family. All rights reserved.")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

