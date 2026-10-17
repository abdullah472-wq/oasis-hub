import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/lib/siteSettings";

const WhatsAppIcon = ({ className = "h-7 w-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const WhatsAppFAB = () => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const [isHovered, setIsHovered] = useState(false);

  const rawPhone = (settings.whatsapp_number || settings.phone_primary || "01581818368").replace(/[^0-9]/g, "");
  const phone = rawPhone.startsWith("88") ? rawPhone : `88${rawPhone}`;
  const greeting = encodeURIComponent(
    t(
      `আসসালামু আলাইকুম, ${settings.institution_name_bn || "আননূর তাহফিজুল কুরআন মাদরাসা"} সম্পর্কে কিছু তথ্য জানতে চাই।`,
      `Assalamu Alaikum, I would like to inquire about ${settings.institution_name_en || "Annoor Tahfizul Quran Madrasa"}.`
    )
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${greeting}`;

  return (
    <div
      className="fixed bottom-6 right-5 sm:right-6 z-[9998] flex items-center gap-2.5 pointer-events-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Pill Tooltip (slides out to the left on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-950/90 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
            </span>
            <span className="font-bengali tracking-wide text-emerald-100">
              {t("হোয়াটসঅ্যাপে কথা বলুন", "Chat on WhatsApp")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main WhatsApp Button with ripple & pulse */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#20ba59] via-[#25D366] to-[#2ee272] text-white shadow-[0_10px_25px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_35px_rgba(37,211,102,0.6)]"
        whileTap={{ scale: 0.92 }}
      >
        {/* Radar Ripple Waves */}
        <span
          className="pointer-events-none absolute -inset-2 rounded-full bg-[#25D366]/35 animate-ping opacity-60"
          style={{ animationDuration: "2.6s" }}
        />
        <span
          className="pointer-events-none absolute -inset-3.5 rounded-full border-2 border-[#25D366]/40 opacity-40 animate-pulse"
        />

        {/* Online Indicator Badge */}
        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center">
          <span className="absolute h-full w-full rounded-full bg-white opacity-40 animate-ping" />
          <span className="relative h-3 w-3 rounded-full border-2 border-white bg-emerald-400 shadow-xs" />
        </span>

        {/* WhatsApp Official Icon */}
        <WhatsAppIcon className="relative z-10 h-7 w-7 text-white drop-shadow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
      </motion.a>
    </div>
  );
};

export default WhatsAppFAB;
