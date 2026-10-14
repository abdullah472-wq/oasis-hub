import { useState, useEffect, useRef } from "react";
import { Loader2, UploadCloud, Sparkles, Image as ImageIcon, Save, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase, uploadCmsFile, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const BrandingSettingsForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [faviconUrl, setFaviconUrl] = useState<string>("");

  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedFaviconFile, setSelectedFaviconFile] = useState<File | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("logo_url, favicon_url")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setLogoUrl(data.logo_url || "");
        setFaviconUrl(data.favicon_url || "");
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

  const handleSave = async () => {
    try {
      setSaving(true);
      let finalLogoUrl = logoUrl;
      let finalFaviconUrl = faviconUrl;

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

      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            id: 1,
            logo_url: finalLogoUrl || null,
            favicon_url: finalFaviconUrl || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `ব্র্যান্ডিং লোগো ও ফেভিকন পরিবর্তন`
      );

      toast.success(t("ব্র্যান্ডিং সফলভাবে আপডেট হয়েছে", "Branding updated successfully"));
      setSelectedLogoFile(null);
      setSelectedFaviconFile(null);
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
          {t("প্রতিষ্ঠানের অফিসিয়াল লোগো ও ব্র্যান্ডিং", "Official Branding & Logo")}
        </CardTitle>
        <CardDescription>
          {t(
            "Supabase Storage-এর `cms-branding` বাকেটে ওয়েবসাইটের মূল লোগো এবং ব্রাউজার ফেভিকন আপলোড করুন",
            "Upload primary institution logos and browser favicons directly to Supabase Storage"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
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

        <div className="flex justify-end pt-2 border-t border-border/40">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{t("ব্র্যান্ডিং সংরক্ষণ করুন", "Save Branding")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
