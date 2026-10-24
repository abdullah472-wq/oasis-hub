import { useState, useEffect, useRef } from "react";
import { Loader2, UploadCloud, Sparkles, Image as ImageIcon, Save, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase, uploadCmsFile, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { broadcastSiteSettingsUpdated } from "@/lib/siteSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const BrandingSettingsForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [faviconUrl, setFaviconUrl] = useState<string>("");
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");

  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedFaviconFile, setSelectedFaviconFile] = useState<File | null>(null);
  const [selectedHeroFile, setSelectedHeroFile] = useState<File | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from("site_settings")
        .select("logo_url, favicon_url, hero_image_url")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error && error.code === "42703") {
        // Graceful fallback if remote schema hasn't run the migration yet
        const fallback = await supabase
          .from("site_settings")
          .select("logo_url, favicon_url")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();
        data = fallback.data as any;
        error = fallback.error;
      }

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setLogoUrl(data.logo_url || "");
        setFaviconUrl(data.favicon_url || "");
        setHeroImageUrl(data.hero_image_url || "");
      }
    } catch (err: any) {
      console.error("Error fetching branding settings:", err);
      toast.error(t("ব্র্যান্ডিং তথ্য লোড করতে সমস্যা হয়েছে", "Failed to load branding info"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন", "Please select a valid image file"));
      return;
    }
    setSelectedLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  };

  const handleFaviconFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("অনুগ্রহ করে একটি আইকন বা ছবি সিলেক্ট করুন", "Please select a valid image file"));
      return;
    }
    setSelectedFaviconFile(file);
    setFaviconUrl(URL.createObjectURL(file));
  };

  const handleHeroFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন", "Please select a valid image file"));
      return;
    }
    setSelectedHeroFile(file);
    setHeroImageUrl(URL.createObjectURL(file));
  };

  const handleResetHero = () => {
    setSelectedHeroFile(null);
    setHeroImageUrl("");
    toast.info(t("ডিফল্ট ক্যাম্পাসের ছবি নির্বাচিত হয়েছে", "Default campus image selected"));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let finalLogoUrl = logoUrl;
      let finalFaviconUrl = faviconUrl;
      let finalHeroImageUrl = heroImageUrl;

      // Upload new logo to Supabase cms-branding bucket
      if (selectedLogoFile) {
        toast.info(t("লোগো Supabase Storage-এ আপলোড হচ্ছে...", "Uploading logo..."));
        finalLogoUrl = await uploadCmsFile("cms-branding", selectedLogoFile, "logos");
      }

      // Upload new favicon to Supabase cms-branding bucket
      if (selectedFaviconFile) {
        toast.info(t("ফেভিকন আপলোড হচ্ছে...", "Uploading favicon..."));
        finalFaviconUrl = await uploadCmsFile("cms-branding", selectedFaviconFile, "favicons");
      }

      // Upload new hero image to Supabase cms-branding bucket
      if (selectedHeroFile) {
        toast.info(t("হিরো ইমেজ আপলোড হচ্ছে...", "Uploading hero image..."));
        finalHeroImageUrl = await uploadCmsFile("cms-branding", selectedHeroFile, "hero");
      }

      const payload = {
        id: 1,
        logo_url: finalLogoUrl || null,
        favicon_url: finalFaviconUrl || null,
        hero_image_url: finalHeroImageUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      // Broadcast new logo, favicon, and hero image across all components in real-time
      broadcastSiteSettingsUpdated(payload);

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `ব্র্যান্ডিং লোগো, ফেভিকন ও হিরো ইমেজ পরিবর্তন`
      );

      toast.success(t("ব্র্যান্ডিং ও ব্যানার সফলভাবে আপডেট হয়েছে", "Branding & banner updated successfully"));
      setSelectedLogoFile(null);
      setSelectedFaviconFile(null);
      setSelectedHeroFile(null);
      fetchBranding();
    } catch (err: any) {
      console.error("Error saving branding:", err);
      toast.error(err.message || t("ব্র্যান্ডিং সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save branding"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">{t("লোড হচ্ছে...", "Loading...")}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          {t("প্রতিষ্ঠানের অফিসিয়াল লোগো, ফেভিকন ও ব্যানার", "Official Branding, Logo & Hero Banner")}
        </CardTitle>
        <CardDescription>
          {t(
            "Supabase Storage-এর `cms-branding` বাকেটে ওয়েবসাইটের মূল লোগো, ব্রাউজার ফেভিকন এবং হোমপেজ হিরো ব্যানার আপলোড করুন",
            "Upload primary institution logos, favicons, and homepage hero banner image to Supabase Storage"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Row 1: Logo & Favicon */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main Logo Uploader */}
          <div className="space-y-3 rounded-xl border border-border/70 p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">{t("প্রাতিষ্ঠানিক মূল লোগো (Header Logo)", "Primary Logo")}</Label>
              <span className="text-[11px] text-muted-foreground">PNG / WEBP (স্বচ্ছ ব্যাকগ্রাউন্ড)</span>
            </div>

            {logoUrl ? (
              <div className="relative rounded-lg border border-border/80 p-4 flex flex-col items-center justify-center bg-card shadow-inner">
                <div className="h-20 w-auto flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="max-h-20 max-w-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  className="mt-3 text-xs"
                >
                  {t("নতুন লোগো নির্বাচন করুন", "Change Logo")}
                </Button>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal-500/30 bg-teal-500/5 p-6 text-center cursor-pointer hover:border-teal-500/60 transition-colors"
              >
                <UploadCloud className="h-9 w-9 text-teal-600/70 mb-2" />
                <p className="text-xs font-semibold">{t("লোগো আপলোড করুন", "Upload Logo")}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">রিসাইজ: ৪০০x১২০ পিক্সেল সুপারিশকৃত</p>
              </div>
            )}

            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/webp,image/svg+xml,image/jpeg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleLogoFileChange(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Favicon Uploader */}
          <div className="space-y-3 rounded-xl border border-border/70 p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">{t("ব্রাউজার ট্যাব ফেভিকন (Favicon)", "Browser Favicon")}</Label>
              <span className="text-[11px] text-muted-foreground">PNG / ICO (বর্গাকার ১:১)</span>
            </div>

            {faviconUrl ? (
              <div className="relative rounded-lg border border-border/80 p-4 flex flex-col items-center justify-center bg-card shadow-inner">
                <div className="h-16 w-16 rounded-lg border border-border/60 bg-muted/30 p-2 flex items-center justify-center">
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => faviconInputRef.current?.click()}
                  className="mt-3 text-xs"
                >
                  {t("নতুন ফেভিকন নির্বাচন করুন", "Change Favicon")}
                </Button>
              </div>
            ) : (
              <div
                onClick={() => faviconInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal-500/30 bg-teal-500/5 p-6 text-center cursor-pointer hover:border-teal-500/60 transition-colors"
              >
                <UploadCloud className="h-9 w-9 text-teal-600/70 mb-2" />
                <p className="text-xs font-semibold">{t("ফেভিকন আপলোড করুন", "Upload Favicon")}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">সাইজ: ৩২x৩২ বা ৬৪x৬৪ পিক্সেল</p>
              </div>
            )}

            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png,image/x-icon,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFaviconFileChange(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        {/* Row 2: Website Hero Banner Image Upload */}
        <div className="space-y-3 rounded-xl border border-border/70 p-5 bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="font-semibold text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>{t("হোমপেজ হিরো ব্যানার ইমেজ (Hero Banner Image)", "Homepage Hero Banner Image")}</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(
                  "হোমপেজ ও পরিচিতি সেকশনের প্রধান ব্যাকগ্রাউন্ড ছবি। রেশিও: ১৬:৯ বা ১৯২০x১০৮০ পিক্সেল (JPG, WEBP, PNG)",
                  "Main background image for the hero section. Recommended ratio: 16:9 or 1920x1080px"
                )}
              </p>
            </div>

            {heroImageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetHero}
                className="text-xs text-muted-foreground hover:text-destructive gap-1 self-start sm:self-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t("ডিফল্ট ছবিতে ফিরুন", "Reset to Default")}</span>
              </Button>
            )}
          </div>

          {heroImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-slate-950 aspect-[21/9] sm:aspect-[16/6] flex items-center justify-center shadow-md group">
              <img
                src={heroImageUrl}
                alt="Hero Banner Preview"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => heroInputRef.current?.click()}
                  className="gap-1.5 shadow-lg text-xs font-semibold"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>{t("নতুন ছবি আপলোড করুন", "Upload New Image")}</span>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleResetHero}
                  className="gap-1.5 shadow-lg text-xs font-semibold"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{t("রিমুভ", "Remove")}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => heroInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 sm:p-10 text-center cursor-pointer hover:border-primary/60 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                {t("ক্যাম্পাসের হিরো ব্যানার আপলোড করুন", "Upload Campus Hero Banner")}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t(
                  "ক্যাম্পাস ভবনের সুন্দর ও উজ্জ্বল ছবি নির্বাচন করুন। ১৯২০x১০৮০ পিক্সেল সর্বোচ্চ রেজোলিউশন নিশ্চিত করে।",
                  "Select a high-quality wide campus photo. 1920x1080 resolution is recommended."
                )}
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-4 text-xs gap-1.5 font-semibold">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{t("কম্পিউটার থেকে ছবি ব্রাউজ করুন", "Browse Image")}</span>
              </Button>
            </div>
          )}

          <input
            ref={heroInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleHeroFileChange(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2 border-t border-border/40">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white min-w-[170px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("সংরক্ষণ হচ্ছে...", "Saving...")}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{t("ব্র্যান্ডিং ও ব্যানার সংরক্ষণ করুন", "Save Branding & Banner")}</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
