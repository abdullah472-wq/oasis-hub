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
  Star,
  Clock,
  Compass,
  Sparkles,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  defaultSiteSettings,
  getCachedSiteSettings,
  updateSiteSettingsRemote,
  fetchSiteSettings,
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

      // Public Review Links & Ratings
      google_review_url: cached.google_review_url || defaultSiteSettings.google_review_url || "",
      facebook_review_url: cached.facebook_review_url || defaultSiteSettings.facebook_review_url || "",
      trustpilot_review_url: cached.trustpilot_review_url || "",
      google_rating_score: cached.google_rating_score || defaultSiteSettings.google_rating_score || "4.9",
      google_review_count: cached.google_review_count || defaultSiteSettings.google_review_count || "48+",

      // Contact Page Landmark, Helplines & Schedule
      contact_landmark_bn: cached.contact_landmark_bn || defaultSiteSettings.contact_landmark_bn || "",
      contact_landmark_en: cached.contact_landmark_en || defaultSiteSettings.contact_landmark_en || "",
      emergency_contact_phone: cached.emergency_contact_phone || defaultSiteSettings.emergency_contact_phone || "",
      office_hours_bn: cached.office_hours_bn || defaultSiteSettings.office_hours_bn || "",
      office_hours_en: cached.office_hours_en || defaultSiteSettings.office_hours_en || "",
      office_friday_hours_bn: cached.office_friday_hours_bn || defaultSiteSettings.office_friday_hours_bn || "",
      office_friday_hours_en: cached.office_friday_hours_en || defaultSiteSettings.office_friday_hours_en || "",
    };
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchSiteSettings(true);
      if (data) {
        setFormData({
          phone_primary: data.phone_primary || "",
          phone_secondary: data.phone_secondary || "",
          whatsapp_number: data.whatsapp_number || "",
          email_primary: data.email_primary || "",
          website_url: data.website_url || "",
          address_boys_campus_bn: data.address_boys_campus_bn || "",
          address_boys_campus_en: data.address_boys_campus_en || "",
          google_maps_url: data.google_maps_url || "",
          facebook_url: data.facebook_url || "",
          facebook_group_url: data.facebook_group_url || "",
          youtube_url: data.youtube_url || "",
          instagram_url: data.instagram_url || "",
          tiktok_url: data.tiktok_url || "",
          twitter_url: data.twitter_url || "",
          google_review_url: data.google_review_url || "",
          facebook_review_url: data.facebook_review_url || "",
          trustpilot_review_url: data.trustpilot_review_url || "",
          google_rating_score: data.google_rating_score || "4.9",
          google_review_count: data.google_review_count || "48+",
          contact_landmark_bn: data.contact_landmark_bn || "",
          contact_landmark_en: data.contact_landmark_en || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
          office_hours_bn: data.office_hours_bn || "",
          office_hours_en: data.office_hours_en || "",
          office_friday_hours_bn: data.office_friday_hours_bn || "",
          office_friday_hours_en: data.office_friday_hours_en || "",
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
        google_review_url: formData.google_review_url.trim() || null,
        facebook_review_url: formData.facebook_review_url.trim() || null,
        trustpilot_review_url: formData.trustpilot_review_url.trim() || null,
        google_rating_score: formData.google_rating_score.trim() || "4.9",
        google_review_count: formData.google_review_count.trim() || "48+",
        contact_landmark_bn: formData.contact_landmark_bn.trim() || null,
        contact_landmark_en: formData.contact_landmark_en.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
        office_hours_bn: formData.office_hours_bn.trim() || null,
        office_hours_en: formData.office_hours_en.trim() || null,
        office_friday_hours_bn: formData.office_friday_hours_bn.trim() || null,
        office_friday_hours_en: formData.office_friday_hours_en.trim() || null,
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

          {/* Landmark & Emergency Hotline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div className="space-y-1.5">
              <Label htmlFor="contact_landmark_bn" className="text-xs font-semibold font-bengali">
                {t("নিকটবর্তী ল্যান্ডমার্ক / দিকনির্দেশনা (বাংলা)", "Nearby Landmark / Directions (Bangla)")}
              </Label>
              <Input
                id="contact_landmark_bn"
                value={formData.contact_landmark_bn}
                onChange={(e) => setFormData({ ...formData, contact_landmark_bn: e.target.value })}
                placeholder="যেমন: কলেজ রোড মোড় (সিঙ্গার শোরুম এর পাশে)"
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact_landmark_en" className="text-xs font-semibold font-bengali">
                {t("নিকটবর্তী ল্যান্ডমার্ক / দিকনির্দেশনা (ইংরেজি)", "Nearby Landmark / Directions (English)")}
              </Label>
              <Input
                id="contact_landmark_en"
                value={formData.contact_landmark_en}
                onChange={(e) => setFormData({ ...formData, contact_landmark_en: e.target.value })}
                placeholder="e.g. College Road Crossing (Beside Singer Showroom)"
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="emergency_contact_phone" className="text-xs font-semibold font-bengali flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-rose-500" />
              <span>{t("জরুরি সহায়তা / ভিজিটর হেল্পলাইন", "Emergency / Visitor Helpline")}</span>
            </Label>
            <Input
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              placeholder="01312200043"
              className="text-xs sm:text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Office & Visitor Visiting Schedule */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">
              {t("অফিস সময় ও সাক্ষাতের সময়সূচি", "Office Hours & Visiting Schedule")}
            </CardTitle>
          </div>
          <CardDescription>
            {t("যোগাযোগ পেজে দর্শনার্থী ও অভিভাবকদের জন্য প্রদর্শিত অফিসিয়াল সময়তালিকা", "Official schedule shown on the Contact page for parents & visitors")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="office_hours_bn" className="text-xs font-semibold font-bengali">
                {t("নিয়মিত অফিস সময় (বাংলা - শনি হতে বৃহস্পতি)", "Regular Office Hours (Bangla)")}
              </Label>
              <Input
                id="office_hours_bn"
                value={formData.office_hours_bn}
                onChange={(e) => setFormData({ ...formData, office_hours_bn: e.target.value })}
                placeholder="সকাল ৮:০০টা — বিকাল ৫:০০টা"
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="office_hours_en" className="text-xs font-semibold font-bengali">
                {t("নিয়মিত অফিস সময় (ইংরেজি)", "Regular Office Hours (English)")}
              </Label>
              <Input
                id="office_hours_en"
                value={formData.office_hours_en}
                onChange={(e) => setFormData({ ...formData, office_hours_en: e.target.value })}
                placeholder="8:00 AM — 5:00 PM"
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="office_friday_hours_bn" className="text-xs font-semibold font-bengali">
                {t("শুক্রবার / বিশেষ অভিভাবক সময় (বাংলা)", "Friday / Special Visiting Hours (Bangla)")}
              </Label>
              <Input
                id="office_friday_hours_bn"
                value={formData.office_friday_hours_bn}
                onChange={(e) => setFormData({ ...formData, office_friday_hours_bn: e.target.value })}
                placeholder="দুপুর ২:৩০টা — মাগরিব পর্যন্ত"
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="office_friday_hours_en" className="text-xs font-semibold font-bengali">
                {t("শুক্রবার / বিশেষ অভিভাবক সময় (ইংরেজি)", "Friday / Special Visiting Hours (English)")}
              </Label>
              <Input
                id="office_friday_hours_en"
                value={formData.office_friday_hours_en}
                onChange={(e) => setFormData({ ...formData, office_friday_hours_en: e.target.value })}
                placeholder="2:30 PM — Maghrib"
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Review Links & Ratings */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <CardTitle className="text-lg">
              {t("গুগল ও ফেসবুক রিভিউ লিংক ও রেটিং", "Google & Facebook Review Links & Ratings")}
            </CardTitle>
          </div>
          <CardDescription>
            {t("হোমপেজের রিভিউ সেকশনে 'Google Reviews' এবং 'Facebook Page' কার্ডের সরাসরি রিভিউ লিংক ও রেটিং স্কোর", "Direct review submission links and public trust rating scores displayed on homepage")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="google_review_url" className="text-xs font-semibold font-bengali text-red-600 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" />
                <span>{t("Google Business Review লিংক (URL)", "Google Review Link (URL)")}</span>
              </Label>
              <Input
                id="google_review_url"
                value={formData.google_review_url}
                onChange={(e) => setFormData({ ...formData, google_review_url: e.target.value })}
                placeholder="https://g.page/r/.../review"
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="google_rating_score" className="text-xs font-semibold font-bengali">
                  {t("গুগল রেটিং", "Rating Score")}
                </Label>
                <Input
                  id="google_rating_score"
                  value={formData.google_rating_score}
                  onChange={(e) => setFormData({ ...formData, google_rating_score: e.target.value })}
                  placeholder="4.9"
                  className="text-xs sm:text-sm font-mono text-center font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="google_review_count" className="text-xs font-semibold font-bengali">
                  {t("রিভিউ সংখ্যা", "Count")}
                </Label>
                <Input
                  id="google_review_count"
                  value={formData.google_review_count}
                  onChange={(e) => setFormData({ ...formData, google_review_count: e.target.value })}
                  placeholder="48+"
                  className="text-xs sm:text-sm font-mono text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50">
            <div className="space-y-1.5">
              <Label htmlFor="facebook_review_url" className="text-xs font-semibold font-bengali text-blue-600">
                {t("ফেসবুক পেজ রিভিউ / মতামত লিংক (URL)", "Facebook Review / Feedback URL")}
              </Label>
              <Input
                id="facebook_review_url"
                value={formData.facebook_review_url}
                onChange={(e) => setFormData({ ...formData, facebook_review_url: e.target.value })}
                placeholder="https://www.facebook.com/.../reviews"
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trustpilot_review_url" className="text-xs font-semibold font-bengali text-emerald-600">
                {t("ট্রাস্টপাইলট রিভিউ লিংক (ঐচ্ছিক)", "Trustpilot Review URL (Optional)")}
              </Label>
              <Input
                id="trustpilot_review_url"
                value={formData.trustpilot_review_url}
                onChange={(e) => setFormData({ ...formData, trustpilot_review_url: e.target.value })}
                placeholder="https://www.trustpilot.com/review/..."
                className="text-xs sm:text-sm"
              />
            </div>
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
