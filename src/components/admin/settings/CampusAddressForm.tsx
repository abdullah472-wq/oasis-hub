import { useState, useEffect } from "react";
import { Loader2, MapPin, Share2, Save, Globe, Phone, Mail, MessageCircle, Link as LinkIcon, Building2 } from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { broadcastSiteSettingsUpdated, defaultSiteSettings, getCachedSiteSettings } from "@/lib/siteSettings";
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
      address_girls_campus_bn: cached.address_girls_campus_bn || defaultSiteSettings.address_girls_campus_bn || "",
      address_girls_campus_en: cached.address_girls_campus_en || defaultSiteSettings.address_girls_campus_en || "",
      google_maps_url: cached.google_maps_url || defaultSiteSettings.google_maps_url || "",
      facebook_url: cached.facebook_url || defaultSiteSettings.facebook_url || "",
      facebook_group_url: cached.facebook_group_url || defaultSiteSettings.facebook_group_url || "",
      youtube_url: cached.youtube_url || defaultSiteSettings.youtube_url || "",
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
          address_girls_campus_bn: data.address_girls_campus_bn || defaultSiteSettings.address_girls_campus_bn || "",
          address_girls_campus_en: data.address_girls_campus_en || defaultSiteSettings.address_girls_campus_en || "",
          google_maps_url: data.google_maps_url || defaultSiteSettings.google_maps_url || "",
          facebook_url: data.facebook_url || defaultSiteSettings.facebook_url || "",
          facebook_group_url: data.facebook_group_url || defaultSiteSettings.facebook_group_url || "",
          youtube_url: data.youtube_url || defaultSiteSettings.youtube_url || "",
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
        address_girls_campus_bn: formData.address_girls_campus_bn.trim() || null,
        address_girls_campus_en: formData.address_girls_campus_en.trim() || null,
        google_maps_url: formData.google_maps_url.trim() || null,
        facebook_url: formData.facebook_url.trim() || null,
        facebook_group_url: formData.facebook_group_url.trim() || null,
        youtube_url: formData.youtube_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      // Broadcast update across entire application in real-time
      broadcastSiteSettingsUpdated(payload);

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `ক্যাম্পাস ঠিকানা, হেল্পলাইন ও সোশ্যাল মিডিয়া লিঙ্ক আপডেট`
      );

      toast.success(t("ক্যাম্পাস ও যোগাযোগ লিঙ্ক সফলভাবে সংরক্ষিত হয়েছে", "Campus & contact settings saved successfully"));
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
              {t("অফিসিয়াল যোগাযোগ ও হেল্পলাইন", "Official Contact Numbers & Channels")}
            </CardTitle>
          </div>
          <CardDescription>
            {t("ওয়েবসাইটের হেডার, ফুটার ও কন্টাক্ট পেজের হটলাইন ও ইমেইল", "Hotlines and contact details across header, footer and contact pages")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_primary" className="font-semibold text-emerald-700 dark:text-emerald-400">
                {t("প্রধান ফোন / হটলাইন *", "Primary Phone / Hotline *")}
              </Label>
              <Input
                id="phone_primary"
                value={formData.phone_primary}
                onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                placeholder="018XXXXXXXX"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_secondary">{t("বিকল্প ফোন / অফিস", "Secondary Phone / Office")}</Label>
              <Input
                id="phone_secondary"
                value={formData.phone_secondary}
                onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                placeholder="015XXXXXXXX"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="font-semibold text-[#128C7E]">
                {t("হোয়াটসঅ্যাপ হেল্পলাইন *", "WhatsApp Helpline *")}
              </Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="015XXXXXXXX"
                className="font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email_primary">{t("অফিসিয়াল ইমেইল", "Official Email")}</Label>
              <Input
                id="email_primary"
                type="email"
                value={formData.email_primary}
                onChange={(e) => setFormData({ ...formData, email_primary: e.target.value })}
                placeholder="info@institution.edu.bd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">{t("অফিসিয়াল ওয়েবসাইট URL", "Official Website URL")}</Label>
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://institution.edu.bd"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campus Physical Addresses */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">
              {t("ক্যাম্পাস অবস্থান ও ঠিকানা", "Campus Physical Addresses")}
            </CardTitle>
          </div>
          <CardDescription>
            {t("প্রধান একাডেমিক ক্যাম্পাস এবং আবাসিক/অন্যান্য শাখার ঠিকানা", "Main academic campus and residential/branch addresses")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_boys_campus_bn" className="font-semibold text-emerald-700 dark:text-emerald-400">
              {t("প্রধান / বালক ক্যাম্পাস ঠিকানা (বাংলা) *", "Main Academic Campus (Bangla) *")}
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
            <Label htmlFor="address_boys_campus_en">{t("প্রধান ক্যাম্পাস ঠিকানা (ইংরেজি)", "Main Academic Campus (English)")}</Label>
            <Textarea
              id="address_boys_campus_en"
              rows={2}
              value={formData.address_boys_campus_en}
              onChange={(e) => setFormData({ ...formData, address_boys_campus_en: e.target.value })}
              placeholder="e.g. Main Road, Kapasia Bazar, Kapasia, Gazipur"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50">
            <Label htmlFor="address_girls_campus_bn">{t("আবাসিক / বালিকা ক্যাম্পাস ঠিকানা (বাংলা)", "Residential / Girls Campus (Bangla)")}</Label>
            <Textarea
              id="address_girls_campus_bn"
              rows={2}
              value={formData.address_girls_campus_bn}
              onChange={(e) => setFormData({ ...formData, address_girls_campus_bn: e.target.value })}
              placeholder="যেমন: মাদরাসা ক্যাম্পাস সংলগ্ন নিজস্ব আবাসিক ভবন, কাপাসিয়া, গাজীপুর"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_girls_campus_en">{t("আবাসিক / বালিকা ক্যাম্পাস ঠিকানা (ইংরেজি)", "Residential / Girls Campus (English)")}</Label>
            <Textarea
              id="address_girls_campus_en"
              rows={2}
              value={formData.address_girls_campus_en}
              onChange={(e) => setFormData({ ...formData, address_girls_campus_en: e.target.value })}
              placeholder="e.g. Campus Residential Building, Kapasia, Gazipur"
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
            {t("ওয়েবসাইটের যোগাযোগ ও ফুটার সেকশনে সরাসরি সংযোগ", "Direct links on website footer, contact page and campus locator")}
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
              <Label htmlFor="facebook_group_url">{t("ফেসবুক অফিসিয়াল গ্রুপ URL", "Facebook Group URL")}</Label>
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
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[170px]"
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
