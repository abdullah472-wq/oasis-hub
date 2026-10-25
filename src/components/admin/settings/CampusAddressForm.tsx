import { useState, useEffect } from "react";
import {
  Loader2,
  MapPin,
  Share2,
  Save,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Building2,
  Instagram,
  Video,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  defaultSiteSettings,
  getCachedSiteSettings,
  updateSiteSettingsRemote,
} from "@/lib/siteSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const CampusAddressForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(() => {
    const cached = getCachedSiteSettings();
    return {
      phone_primary: cached.phone_primary || defaultSiteSettings.phone_primary || "",
      phone_secondary: cached.phone_secondary || defaultSiteSettings.phone_secondary || "",
      whatsapp_number: cached.whatsapp_number || defaultSiteSettings.whatsapp_number || "",
      email_primary: cached.email_primary || defaultSiteSettings.email_primary || "",
      website_url: cached.website_url || defaultSiteSettings.website_url || "",
      address_boys_campus_bn: cached.address_boys_campus_bn || defaultSiteSettings.address_boys_campus_bn || "",
      address_boys_campus_en: cached.address_boys_campus_en || defaultSiteSettings.address_boys_campus_en || "",
      google_maps_url: cached.google_maps_url || defaultSiteSettings.google_maps_url || "",
      facebook_url: cached.facebook_url || defaultSiteSettings.facebook_url || "",
      facebook_group_url: cached.facebook_group_url || defaultSiteSettings.facebook_group_url || "",
      youtube_url: cached.youtube_url || defaultSiteSettings.youtube_url || "",
      instagram_url: cached.instagram_url || defaultSiteSettings.instagram_url || "",
      tiktok_url: cached.tiktok_url || defaultSiteSettings.tiktok_url || "",
      twitter_url: cached.twitter_url || defaultSiteSettings.twitter_url || "",
    };
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFormData({
          phone_primary: data.phone_primary || defaultSiteSettings.phone_primary || "",
          phone_secondary: data.phone_secondary || defaultSiteSettings.phone_secondary || "",
          whatsapp_number: data.whatsapp_number || defaultSiteSettings.whatsapp_number || "",
          email_primary: data.email_primary || defaultSiteSettings.email_primary || "",
          website_url: data.website_url || defaultSiteSettings.website_url || "",
          address_boys_campus_bn: data.address_boys_campus_bn || defaultSiteSettings.address_boys_campus_bn || "",
          address_boys_campus_en: data.address_boys_campus_en || defaultSiteSettings.address_boys_campus_en || "",
          google_maps_url: data.google_maps_url || defaultSiteSettings.google_maps_url || "",
          facebook_url: data.facebook_url || defaultSiteSettings.facebook_url || "",
          facebook_group_url: data.facebook_group_url || defaultSiteSettings.facebook_group_url || "",
          youtube_url: data.youtube_url || defaultSiteSettings.youtube_url || "",
          instagram_url: data.instagram_url || defaultSiteSettings.instagram_url || "",
          tiktok_url: data.tiktok_url || defaultSiteSettings.tiktok_url || "",
          twitter_url: data.twitter_url || defaultSiteSettings.twitter_url || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching campus addresses:", err);
      toast.error(t("ক্যাম্পাস ও যোগাযোগ তথ্য লোড করতে সমস্যা হয়েছে", "Failed to load campus & contact info"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        id: 1,
        phone_primary: formData.phone_primary.trim() || null,
        phone_secondary: formData.phone_secondary.trim() || null,
        whatsapp_number: formData.whatsapp_number.trim() || null,
        email_primary: formData.email_primary.trim() || null,
        website_url: formData.website_url.trim() || null,
        address_boys_campus_bn: formData.address_boys_campus_bn.trim() || null,
        address_boys_campus_en: formData.address_boys_campus_en.trim() || null,
        address_girls_campus_bn: null,
        address_girls_campus_en: null,
        google_maps_url: formData.google_maps_url.trim() || null,
        facebook_url: formData.facebook_url.trim() || null,
        facebook_group_url: formData.facebook_group_url.trim() || null,
        youtube_url: formData.youtube_url.trim() || null,
        instagram_url: formData.instagram_url.trim() || null,
        tiktok_url: formData.tiktok_url.trim() || null,
        twitter_url: formData.twitter_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Resilient remote updater handles schema cache issues and keeps local cache in sync
      await updateSiteSettingsRemote(payload);

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `ক্যাম্পাস ঠিকানা, হেল্পলাইন ও সোশ্যাল মিডিয়া লিঙ্ক আপডেট`
      );

      toast.success(
        t(
          "ক্যাম্পাস ও সোশ্যাল মিডিয়া লিঙ্ক সফলভাবে সংরক্ষিত হয়েছে",
          "Campus & social media links saved successfully"
        )
      );
    } catch (err: any) {
      console.error("Error saving campus settings:", err);
      toast.error(err.message || t("সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save campus info"));
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Official Helplines & Online Contact */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {t("অফিসিয়াল যোগাযোগ ও হেল্পলাইন", "Official Contact & Helplines")}
            </CardTitle>
          </div>
          <CardDescription>
            {t("ওয়েবসাইটের হেডার, ফুটার ও নোটিশ বোর্ডে সরাসরি প্রদর্শিত ফোন ও ইমেইল", "Primary communication channels displayed across website header and footer")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_primary" className="font-semibold text-primary">
                {t("প্রধান হটলাইন নম্বর *", "Primary Helpline *")}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone_primary"
                  className="pl-9 font-mono"
                  value={formData.phone_primary}
                  onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                  placeholder="01820811511"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_secondary">{t("বিকল্প যোগাযোগ নম্বর", "Secondary Phone")}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone_secondary"
                  className="pl-9 font-mono"
                  value={formData.phone_secondary}
                  onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                  placeholder="01581818368"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="font-semibold text-emerald-600 dark:text-emerald-400">
                {t("হোয়াটসঅ্যাপ নম্বর *", "WhatsApp Number *")}
              </Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                <Input
                  id="whatsapp_number"
                  className="pl-9 font-mono"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="01581818368"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_primary">{t("অফিসিয়াল ইমেইল ঠিকানা", "Official Email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email_primary"
                  type="email"
                  className="pl-9"
                  value={formData.email_primary}
                  onChange={(e) => setFormData({ ...formData, email_primary: e.target.value })}
                  placeholder="info@annoor.edu.bd"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">{t("ওয়েবসাইট URL", "Website URL")}</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website_url"
                  className="pl-9"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://annoor.edu.bd"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campus Physical Address */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">
              {t("ক্যাম্পাস অবস্থান ও ঠিকানা", "Campus Physical Address")}
            </CardTitle>
          </div>
          <CardDescription>
            {t("মাদরাসার স্থায়ী ক্যাম্পাস অবস্থান ও অফিসিয়াল ঠিকানা", "Official physical campus location and street address")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_boys_campus_bn" className="font-semibold text-primary">
              {t("মাদরাসা ক্যাম্পাস ঠিকানা (বাংলা) *", "Madrasa Campus Address (Bangla) *")}
            </Label>
            <Textarea
              id="address_boys_campus_bn"
              rows={2}
              value={formData.address_boys_campus_bn}
              onChange={(e) => setFormData({ ...formData, address_boys_campus_bn: e.target.value })}
              placeholder="যেমন: মেইন রোড, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_boys_campus_en">{t("ক্যাম্পাস ঠিকানা (ইংরেজি)", "Campus Address (English)")}</Label>
            <Textarea
              id="address_boys_campus_en"
              rows={2}
              value={formData.address_boys_campus_en}
              onChange={(e) => setFormData({ ...formData, address_boys_campus_en: e.target.value })}
              placeholder="e.g. Main Road, Kapasia Bazar, Kapasia, Gazipur"
            />
          </div>
        </CardContent>
      </Card>

      {/* Map Embed and Social Links */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-lg">
              {t("গুগল ম্যাপ ও সোশ্যাল মিডিয়া লিঙ্ক", "Google Maps & Social Media Links")}
            </CardTitle>
          </div>
          <CardDescription>
            {t("ওয়েবসাইটের যোগাযোগ, ফুটার ও সোশ্যাল সেকশনে প্রদর্শিত লিঙ্কসমূহ", "Direct links on website footer, contact page, and campus locator")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_maps_url">{t("গুগল ম্যাপ লিংক / Embed URL", "Google Maps Link / URL")}</Label>
            <Input
              id="google_maps_url"
              value={formData.google_maps_url}
              onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Social Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_url">{t("ফেসবুক পেজ / প্রোফাইল URL", "Facebook Page URL")}</Label>
              <Input
                id="facebook_url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook_group_url">{t("ফেসবুক অফিসিয়াল গ্রুপ URL", "Facebook Group URL")}</Label>
              <Input
                id="facebook_group_url"
                value={formData.facebook_group_url}
                onChange={(e) => setFormData({ ...formData, facebook_group_url: e.target.value })}
                placeholder="https://facebook.com/groups/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_url">{t("ইউটিউব চ্যানেল URL", "YouTube Channel URL")}</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/50">
            <div className="space-y-2">
              <Label htmlFor="instagram_url" className="flex items-center gap-1.5">
                <Instagram className="h-4 w-4 text-pink-600" />
                <span>{t("ইনস্টাগ্রাম প্রোফাইল URL", "Instagram Profile URL")}</span>
              </Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok_url" className="flex items-center gap-1.5">
                <Video className="h-4 w-4 text-slate-800 dark:text-slate-200" />
                <span>{t("টিকটক প্রোফাইল URL", "TikTok Profile URL")}</span>
              </Label>
              <Input
                id="tiktok_url"
                value={formData.tiktok_url}
                onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/@..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_url" className="flex items-center gap-1.5">
                <Twitter className="h-4 w-4 text-sky-500" />
                <span>{t("টুইটার / X প্রোফাইল URL", "Twitter / X Profile URL")}</span>
              </Label>
              <Input
                id="twitter_url"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://x.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[170px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("সংরক্ষণ হচ্ছে...", "Saving...")}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{t("পরিবর্তন সংরক্ষণ করুন", "Save Changes")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
