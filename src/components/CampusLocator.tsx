import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Building2,
  Share2,
  Maximize2,
  Minimize2,
  Sparkles,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/lib/siteSettings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const CampusLocator: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const institutionNameBn =
    settings.institution_name_bn || "";
  const institutionNameEn =
    settings.institution_name_en || "";

  const addressBn =
    settings.address_boys_campus_bn ||
    settings.address_office_bn ||
    "";
  const addressEn =
    settings.address_boys_campus_en ||
    settings.address_office_en ||
    "";

  const phone = settings.phone_primary || "";
  const secondaryPhone = settings.phone_secondary || "";
  const rawWa = (settings.whatsapp_number || settings.hotline_or_whatsapp || phone).replace(/[^0-9]/g, "");
  const cleanWa = rawWa.startsWith("88") ? rawWa : `88${rawWa}`;

  const coords = { lat: 24.1118467, lng: 90.5680587 };

  const mapsUrl =
    settings.google_maps_url ||
    "https://maps.google.com";

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  const embedUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}&hl=bn&z=19&output=embed`;

  const copyText = (text: string, fieldId: string, successMsg: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(successMsg);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div
      className={`rounded-3xl border border-border/80 bg-card shadow-xl overflow-hidden transition-all ${
        isFullscreen ? "fixed inset-4 z-50 rounded-2xl shadow-2xl overflow-y-auto" : ""
      } ${className}`}
    >
      {/* ================= HEADER ================= */}
      <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Compass className="h-3.5 w-3.5" />
              <span>{t("গুগল ম্যাপস লাইভ লোকেটর", "Google Maps Live Locator")}</span>
            </div>
            <h3 className="font-bengali text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t("ক্যাম্পাসের অবস্থান ও গুগল ম্যাপস ডিরেকশন", "Campus Location & Live Directions")}
            </h3>
            <p className="font-bengali text-xs sm:text-sm text-muted-foreground">
              {t(
                "সহজেই আমাদের ক্যাম্পাসে পৌঁছাতে লাইভ ম্যাপ, সঠিক রুট, ল্যান্ডমার্ক ও যোগাযোগ তথ্য দেখুন।",
                "View verified live map, easiest driving route, nearby landmark, and direct helplines."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl h-10 gap-1.5 text-xs font-bengali"
              title={isFullscreen ? t("ছোট করুন", "Exit Fullscreen") : t("পূর্ণ স্ক্রিন করুন", "Fullscreen")}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span>{isFullscreen ? t("ছোট স্ক্রিন", "Normal View") : t("ফুল স্ক্রিন", "Full View")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ================= MAIN SPLIT BODY ================= */}
      <div className="grid lg:grid-cols-12 min-h-[480px]">
        {/* Left Side: Campus Details & Direct Actions (5 Cols) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-border/70 p-5 sm:p-6 space-y-5 bg-muted/20 flex flex-col justify-between">
          <div className="space-y-4 font-bengali">
            {/* Title & Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-0.5">
                  {t("প্রধান ক্যাম্পাস", "Main Campus")}
                </Badge>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t("অফিস খোলা আছে", "Open Now")}
                </span>
              </div>

              <h4 className="font-bold text-xl sm:text-2xl text-foreground">
                {t(institutionNameBn, institutionNameEn)}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  "নূরানী, নাজেরা ও আন্তর্জাতিক মানের হিফজুল কুরআন বিভাগ",
                  "Nurani, Nazara & International Hifzul Quran Division"
                )}
              </p>
            </div>

            {/* Address Box */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("ক্যাম্পাসের সঠিক ঠিকানা:", "Verified Address:")}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5 leading-relaxed">
                      {t(addressBn, addressEn)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      t(addressBn, addressEn),
                      "address",
                      t("ঠিকানা সফলভাবে কপি করা হয়েছে", "Address copied successfully")
                    )
                  }
                  className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  {copiedField === "address" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedField === "address" ? t("কপি হয়েছে", "Copied") : t("ঠিকানা কপি করুন", "Copy Address")}</span>
                </button>

                <span className="font-mono text-[11px] text-muted-foreground">
                  {coords.lat}, {coords.lng}
                </span>
              </div>
            </div>

            {/* Landmark & Visiting Hours */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border/60">
                <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">
                    {t("সহজ ল্যান্ডমার্ক:", "Nearby Landmark:")}{" "}
                  </span>
                  <span className="text-muted-foreground">
                    {t(
                      "কাপাসিয়া বাজার মেইন রোড, সিঙ্গার শোরুমের ঠিক পাশেই অবস্থিত।",
                      "Main road of Kapasia Bazar, directly adjacent to Singer Showroom."
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border/60">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">
                    {t("অফিস সময়তালিকা:", "Visiting Hours:")}{" "}
                  </span>
                  <span className="text-muted-foreground">
                    {t(
                      "শনি — বৃহস্পতি: সকাল ৮:০০ - বিকাল ৫:০০ (আবাসিক ২৪ ঘণ্টা)",
                      "Sat — Thu: 8:00 AM - 5:00 PM (Residential 24/7)"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              <Navigation className="h-4 w-4" />
              <span>{t("গুগল ম্যাপে সরাসরি যাওয়ার রুট", "Get Driving Route on Google Maps")}</span>
            </a>
          </div>

          {/* Quick Hotline Box */}
          <div className="rounded-2xl border border-border/60 bg-card p-3.5 space-y-2 font-bengali text-xs mt-3">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span className="flex items-center gap-1.5 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("সরাসরি কল ও হোয়াটসঅ্যাপ", "Direct Hotline & WhatsApp")}</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">24/7 Available</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`tel:${phone.replace(/[^0-9]/g, "")}`}
                className="flex-1 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{phone}</span>
              </a>
              {secondaryPhone && (
                <a
                  href={`tel:${secondaryPhone.replace(/[^0-9]/g, "")}`}
                  className="py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center justify-center transition-colors"
                  title={secondaryPhone}
                >
                  <Phone className="h-3.5 w-3.5 text-sky-600" />
                </a>
              )}
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-[#128C7E] transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Live Dynamic Google Map (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-background relative">
          {/* Top Floating Map Action Bar */}
          <div className="p-3 sm:p-3.5 border-b border-border/70 bg-card/85 backdrop-blur-sm flex items-center justify-between gap-3 flex-wrap font-bengali text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-foreground">
                {t("গুগল ম্যাপে লাইভ অবস্থান", "Live Location View")}
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                • {t("কাপাসিয়া বাজার, গাজীপুর", "Kapasia Bazar, Gazipur")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 hover:bg-muted font-semibold text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                <span>{t("ম্যাপ অ্যাপে খুলুন", "Open in App")}</span>
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyText(
                    mapsUrl,
                    "map-link",
                    t("ম্যাপ লিঙ্ক কপি করা হয়েছে", "Map link copied to clipboard")
                  )
                }
                className="rounded-xl h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
                title={t("শেয়ার করুন", "Share URL")}
              >
                {copiedField === "map-link" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                <span>{t("শেয়ার", "Share")}</span>
              </Button>
            </div>
          </div>

          {/* Interactive Map Iframe */}
          <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] bg-muted/20">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Annoor Tahfizul Quran Madrasa Location"
              className="w-full h-full min-h-[380px] sm:min-h-[460px]"
            />

            {/* Bottom floating landmark pill */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-2.5 sm:p-3 shadow-lg max-w-sm pointer-events-auto font-bengali text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{t("পরিচিত ল্যান্ডমার্ক:", "Verified Landmark:")}</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                  {t("ভেরিফাইড", "Verified")}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {t(
                  "কাপাসিয়া বাজার মেইন রোড, সিঙ্গার শোরুমের ঠিক পাশেই অবস্থিত।",
                  "Kapasia Bazar Main Road, right beside Singer Showroom."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusLocator;
