import { useState, useEffect } from "react";
import {
  Palette,
  Check,
  Sparkles,
  Save,
  RotateCcw,
  Sliders,
  Eye,
  Building2,
  ArrowRight,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings, broadcastSiteSettingsUpdated, updateSiteSettingsRemote } from "@/lib/siteSettings";
import { COLOR_PALETTES, applyColorPalette, ColorPalette } from "@/lib/colorPalettes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ThemeSettingsForm = () => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const [selectedPaletteId, setSelectedPaletteId] = useState<string>("royal-navy");
  const [customPrimary, setCustomPrimary] = useState<string>("#9F1239");
  const [customAccent, setCustomAccent] = useState<string>("#FB7185");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      const paletteId = settings.color_palette || "royal-navy";
      setSelectedPaletteId(paletteId);
      setIsCustomMode(paletteId === "custom");
      if (settings.primary_color) setCustomPrimary(settings.primary_color);
      if (settings.accent_color) setCustomAccent(settings.accent_color);
    }
  }, [settings]);

  // Live preview as user selects
  const handleSelectPalette = (palette: ColorPalette) => {
    setSelectedPaletteId(palette.id);
    setIsCustomMode(false);
    applyColorPalette(palette.id);
    toast.info(
      t(
        `"${palette.nameBn}" প্যালেটের লাইভ প্রিভিউ সক্রিয় হয়েছে`,
        `Previewing "${palette.nameEn}" palette`
      ),
      { duration: 1800 }
    );
  };

  const handleCustomPrimaryChange = (val: string) => {
    setCustomPrimary(val);
    if (isCustomMode) {
      applyColorPalette("custom", val, customAccent);
    }
  };

  const handleCustomAccentChange = (val: string) => {
    setCustomAccent(val);
    if (isCustomMode) {
      applyColorPalette("custom", customPrimary, val);
    }
  };

  const handleToggleCustomMode = () => {
    const nextCustom = !isCustomMode;
    setIsCustomMode(nextCustom);
    if (nextCustom) {
      setSelectedPaletteId("custom");
      applyColorPalette("custom", customPrimary, customAccent);
    } else {
      setSelectedPaletteId("royal-navy");
      applyColorPalette("royal-navy");
    }
  };

  const handleReset = () => {
    setSelectedPaletteId("royal-navy");
    setIsCustomMode(false);
    applyColorPalette("royal-navy");
    toast.info(t("ডিফল্ট রয়্যাল নেভি থিম প্রিভিউ করা হচ্ছে", "Reverted to Royal Navy preview"));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const chosenPalette = isCustomMode ? "custom" : selectedPaletteId;

      const payload = {
        id: 1,
        color_palette: chosenPalette,
        primary_color: isCustomMode ? customPrimary : null,
        accent_color: isCustomMode ? customAccent : null,
        updated_at: new Date().toISOString(),
      };

      // 1. Resilient remote updater handles schema cache and broadcasts sync
      await updateSiteSettingsRemote(payload);
      applyColorPalette(
        chosenPalette,
        isCustomMode ? customPrimary : null,
        isCustomMode ? customAccent : null
      );

      try {
        await logAdminActivity(
          "UPDATE",
          "site_settings",
          `ওয়েবসাইট কালার থিম পরিবর্তন: ${chosenPalette}`
        );
      } catch {}

      toast.success(
        t(
          "ওয়েবসাইট কালার প্যালেট সফলভাবে সংরক্ষিত ও কার্যকর হয়েছে!",
          "Website color palette saved and applied successfully across the entire site!"
        )
      );
    } catch (err: any) {
      console.error("Error saving theme:", err);
      toast.error(err.message || t("থিম সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save theme"));
    } finally {
      setSaving(false);
    }
  };

  const activePalette = COLOR_PALETTES.find((p) => p.id === selectedPaletteId);

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-primary/5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-bold font-bengali">
                  {t("ওয়েবসাইট কালার প্যালেট ও থিম নির্বাচন", "Website Color Palette & Theming")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm font-bengali">
                {t(
                  "যেকোনো একটি কালার প্যালেট নির্বাচন করুন। সংরক্ষিত হওয়ার সাথে সাথে পুরো পাবলিক ওয়েবসাইটের হেডার, ফুটার, বাটন, ব্যাজ ও কার্ড স্বয়ংক্রিয়ভাবে সেই রঙে রূপান্তর হয়ে যাবে।",
                  "Select a color scheme below. The entire public site header, footer, buttons, and accents will instantly reflect your choice."
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs font-bengali">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t("ডিফল্টে রিসেট", "Reset Default")}</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 text-xs font-bengali font-bold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("প্যালেট সংরক্ষণ করুন", "Save Palette")}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Live Preview Widget */}
        <CardContent className="p-5 sm:p-6 bg-card border-t border-border/40">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-bengali">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Eye className="h-4 w-4 text-primary" />
                {t("বর্তমান নির্বাচিত প্যালেটের লাইভ উপাদান প্রিভিউ:", "Live UI Elements Preview:")}
              </span>
              <span className="font-semibold text-primary">
                {isCustomMode
                  ? t("কাস্টম কালার মোড", "Custom Colors Mode")
                  : activePalette
                  ? t(activePalette.nameBn, activePalette.nameEn)
                  : t("রয়্যাল নেভি", "Royal Navy")}
              </span>
            </div>

            {/* Miniature Preview Sandbox */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-background shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bengali text-sm font-bold text-foreground">
                    {t(
                      settings.institution_name_bn || "আননূর তাহফিজুল কুরআন মাদরাসা",
                      settings.institution_name_en || "Annoor Tahfizul Quran Madrasa"
                    )}
                  </h4>
                  <p className="font-bengali text-xs text-muted-foreground">
                    {t("শিক্ষাবর্ষ ২০২৬ | ভর্তি চলছে", "Academic Year 2026 | Admissions Live")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Primary Button */}
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bengali text-xs font-bold shadow-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <span>{t("ভর্তি আবেদন", "Apply Now")}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {/* Accent Button */}
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-accent text-accent-foreground font-bengali text-xs font-bold shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t("ফি পরিশোধ", "Pay Fees")}</span>
                </button>

                {/* Accent Badge */}
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent border border-accent/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{t("বোর্ড স্বীকৃত", "Accredited")}</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Palette Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold font-bengali text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>{t("প্রি-সেট প্রাতিষ্ঠানিক প্যালেটসমূহ", "Preset Institutional Palettes")}</span>
          </h3>
          <span className="text-xs text-muted-foreground font-bengali">
            {t(`${COLOR_PALETTES.length}টি থিম উপলব্ধ`, `${COLOR_PALETTES.length} Themes Available`)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLOR_PALETTES.map((palette) => {
            const isSelected = !isCustomMode && selectedPaletteId === palette.id;
            const isGirlsTheme = palette.category === "girls";

            return (
              <div
                key={palette.id}
                onClick={() => handleSelectPalette(palette)}
                className={`relative cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md scale-[1.01]"
                    : "border-border/70 bg-card hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}

                <div className="space-y-3">
                  {/* Color Swatch Bars */}
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 flex-1 rounded-xl shadow-xs border border-black/10 flex items-center px-3 text-white text-[11px] font-mono font-bold"
                      style={{ backgroundColor: palette.preview.primaryHex }}
                    >
                      Primary
                    </div>
                    <div
                      className="h-10 w-24 rounded-xl shadow-xs border border-black/10 flex items-center px-2 text-white text-[11px] font-mono font-bold justify-center"
                      style={{ backgroundColor: palette.preview.accentHex }}
                    >
                      Accent
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        className={`text-[11px] font-medium ${
                          isGirlsTheme
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200"
                            : ""
                        }`}
                      >
                        {isGirlsTheme && <Heart className="h-3 w-3 mr-1 text-rose-500 fill-rose-500" />}
                        {t(palette.badgeBn, palette.badgeEn)}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-foreground font-bengali">
                      {t(palette.nameBn, palette.nameEn)}
                    </h4>
                    <p className="text-xs text-muted-foreground font-bengali mt-1 leading-relaxed">
                      {t(palette.descriptionBn, palette.descriptionEn)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>{palette.preview.primaryHex}</span>
                  <span>{palette.preview.accentHex}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Color Tuning Section */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-accent" />
              <CardTitle className="text-base sm:text-lg font-bold font-bengali">
                {t("কাস্টম কালার তৈরি (Custom Palette)", "Custom Color Tuning")}
              </CardTitle>
            </div>

            <Button
              variant={isCustomMode ? "default" : "outline"}
              size="sm"
              onClick={handleToggleCustomMode}
              className="text-xs font-bengali"
            >
              {isCustomMode
                ? t("কাস্টম মোড সক্রিয় ✓", "Custom Mode Active")
                : t("কাস্টম কালার ব্যবহার করুন", "Switch to Custom")}
            </Button>
          </div>
          <CardDescription className="text-xs font-bengali">
            {t(
              "আপনি যদি প্রি-সেট কালার ছাড়া নিজের কোনো বিশেষ ব্র্যান্ড কালার হেক্স কোড (#HEX) দিতে চান, তবে এখানে সিলেক্ট করুন।",
              "Enter custom hex codes for your unique institutional branding."
            )}
          </CardDescription>
        </CardHeader>

        {isCustomMode && (
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              {/* Primary Color Picker */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-card">
                <Label className="text-xs font-bold font-bengali text-foreground flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: customPrimary }} />
                  {t("মূল ব্র্যান্ড রঙ (Primary Color)", "Primary Brand Color")}
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customPrimary}
                    onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <Input
                    value={customPrimary}
                    onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                    placeholder="#9F1239"
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-card">
                <Label className="text-xs font-bold font-bengali text-foreground flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: customAccent }} />
                  {t("অ্যাকসেন্ট রঙ (Accent Color)", "Accent Highlight Color")}
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customAccent}
                    onChange={(e) => handleCustomAccentChange(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <Input
                    value={customAccent}
                    onChange={(e) => handleCustomAccentChange(e.target.value)}
                    placeholder="#FB7185"
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ThemeSettingsForm;
