import { useState, useEffect } from "react";
import { Loader2, MapPin, Share2, Save, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const CampusAddressForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    address_boys_campus_bn: "",
    address_boys_campus_en: "",
    address_girls_campus_bn: "",
    address_girls_campus_en: "",
    google_maps_url: "",
    facebook_url: "",
    youtube_url: "",
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
          address_boys_campus_bn: data.address_boys_campus_bn || "",
          address_boys_campus_en: data.address_boys_campus_en || "",
          address_girls_campus_bn: data.address_girls_campus_bn || "",
          address_girls_campus_en: data.address_girls_campus_en || "",
          google_maps_url: data.google_maps_url || "",
          facebook_url: data.facebook_url || "",
          youtube_url: data.youtube_url || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching campus addresses:", err);
      toast.error(t("ক্যাম্পাস তথ্য লোড করতে সমস্যা হয়েছে", "Failed to load campus addresses"));
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
        address_boys_campus_bn: formData.address_boys_campus_bn.trim() || null,
        address_boys_campus_en: formData.address_boys_campus_en.trim() || null,
        address_girls_campus_bn: formData.address_girls_campus_bn.trim() || null,
        address_girls_campus_en: formData.address_girls_campus_en.trim() || null,
        google_maps_url: formData.google_maps_url.trim() || null,
        facebook_url: formData.facebook_url.trim() || null,
        youtube_url: formData.youtube_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `ক্যাম্পাস ঠিকানা ও সোশ্যাল মিডিয়া লিংক আপডেট`
      );

      toast.success(t("ক্যাম্পাস ও সোশ্যাল লিঙ্ক সফলভাবে সংরক্ষিত হয়েছে", "Campus and social links saved successfully"));
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
    <Card className="border-border/60 shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-amber-500" />
          {t("ক্যাম্পাস ঠিকানা ও সোশ্যাল মিডিয়া", "Campus Addresses & Social Media")}
        </CardTitle>
        <CardDescription>
          {t(
            "বালক ও বালিকা শাখার পূর্ণ ঠিকানা, গুগল ম্যাপস ও সামাজিক যোগাযোগ মাধ্যম",
            "Boys & Girls campus physical locations, Google Maps links, and official channels"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Boys Campus Address */}
          <div className="rounded-lg border border-border/70 p-4 bg-muted/20 space-y-3">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              {t("বালক শাখা ক্যাম্পাস (Boys Campus)", "Boys Campus")}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="boys_addr_bn">{t("ঠিকানা (বাংলা)", "Address (Bangla)")}</Label>
                <Textarea
                  id="boys_addr_bn"
                  value={formData.address_boys_campus_bn}
                  onChange={(e) => setFormData({ ...formData, address_boys_campus_bn: e.target.value })}
                  placeholder={t("যেমন: সেক্টর ৪, রোড ৭, উত্তরা, ঢাকা", "e.g. Sector 4, Road 7, Uttara, Dhaka")}
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="boys_addr_en">{t("ঠিকানা (ইংরেজি)", "Address (English)")}</Label>
                <Textarea
                  id="boys_addr_en"
                  value={formData.address_boys_campus_en}
                  onChange={(e) => setFormData({ ...formData, address_boys_campus_en: e.target.value })}
                  placeholder="e.g. Sector 4, Road 7, Uttara, Dhaka"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Girls Campus Address */}
          <div className="rounded-lg border border-border/70 p-4 bg-muted/20 space-y-3">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              {t("বালিকা শাখা ক্যাম্পাস (Girls Campus)", "Girls Campus")}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="girls_addr_bn">{t("ঠিকানা (বাংলা)", "Address (Bangla)")}</Label>
                <Textarea
                  id="girls_addr_bn"
                  value={formData.address_girls_campus_bn}
                  onChange={(e) => setFormData({ ...formData, address_girls_campus_bn: e.target.value })}
                  placeholder={t("যেমন: সেক্টর ৬, রোড ২, উত্তরা, ঢাকা", "e.g. Sector 6, Road 2, Uttara, Dhaka")}
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="girls_addr_en">{t("ঠিকানা (ইংরেজি)", "Address (English)")}</Label>
                <Textarea
                  id="girls_addr_en"
                  value={formData.address_girls_campus_en}
                  onChange={(e) => setFormData({ ...formData, address_girls_campus_en: e.target.value })}
                  placeholder="e.g. Sector 6, Road 2, Uttara, Dhaka"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Map & Social Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              {t("সোশ্যাল মিডিয়া ও গুগল ম্যাপস লিঙ্ক", "Social Media & Google Maps")}
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="google_maps_url">{t("গুগল ম্যাপস লোকেশন URL", "Google Maps URL")}</Label>
                <Input
                  id="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facebook_url">{t("ফেসবুক পেজ লিঙ্ক", "Facebook Page")}</Label>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/annoor"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="youtube_url">{t("ইউটিউব চ্যানেল লিঙ্ক", "YouTube Channel")}</Label>
                <Input
                  id="youtube_url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/@annoor"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{t("ক্যাম্পাস তথ্য সংরক্ষণ করুন", "Save Campus Info")}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
