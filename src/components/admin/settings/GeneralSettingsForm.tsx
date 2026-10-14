import { useState, useEffect } from "react";
import { Loader2, Building2, Phone, Mail, Hash, Calendar, GraduationCap, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SiteSettings, AdmissionStatusType } from "@/types/cms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const GeneralSettingsForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    institution_name_bn: "আননূর শিক্ষা পরিবার",
    institution_name_en: "Annoor Education Family",
    emis_code: "",
    founding_year: "2015",
    phone_primary: "01700000000",
    phone_secondary: "",
    whatsapp_number: "01700000000",
    email_primary: "info@annoor.edu.bd",
    admission_status: "open" as AdmissionStatusType,
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
          institution_name_bn: data.institution_name_bn || "",
          institution_name_en: data.institution_name_en || "",
          emis_code: data.emis_code || "",
          founding_year: data.founding_year || "",
          phone_primary: data.phone_primary || "",
          phone_secondary: data.phone_secondary || "",
          whatsapp_number: data.whatsapp_number || "",
          email_primary: data.email_primary || "",
          admission_status: data.admission_status || "open",
        });
      }
    } catch (err: any) {
      console.error("Error fetching site settings:", err);
      toast.error(t("সেটিংস লোড করতে সমস্যা হয়েছে", "Failed to load settings"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.institution_name_bn.trim() || !formData.email_primary.trim()) {
      toast.error(t("প্রতিষ্ঠানের নাম এবং ইমেইল আবশ্যক", "Institution name and email are required"));
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: 1,
        institution_name_bn: formData.institution_name_bn.trim(),
        institution_name_en: formData.institution_name_en.trim(),
        emis_code: formData.emis_code.trim() || null,
        founding_year: formData.founding_year.trim() || null,
        phone_primary: formData.phone_primary.trim(),
        phone_secondary: formData.phone_secondary.trim() || null,
        whatsapp_number: formData.whatsapp_number.trim(),
        email_primary: formData.email_primary.trim(),
        admission_status: formData.admission_status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `সাধারণ প্রতিষ্ঠান তথ্য ও যোগাযোগ সেটিংস আপডেট`
      );

      toast.success(t("সেটিংস সফলভাবে সংরক্ষিত হয়েছে", "Settings saved successfully"));
    } catch (err: any) {
      console.error("Error saving site settings:", err);
      toast.error(err.message || t("সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">{t("সেটিংস লোড হচ্ছে...", "Loading settings...")}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {t("প্রাতিষ্ঠানিক পরিচিতি ও যোগাযোগ তথ্য", "General Profile & Official Contact")}
        </CardTitle>
        <CardDescription>
          {t(
            "প্রতিষ্ঠানের নাম, কোড, হটলাইন ও কেন্দ্রীয় ভর্তি স্ট্যাটাস নির্ধারণ করুন",
            "Configure institution bilingual names, official helpline numbers, and admission status"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bilingual Names */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inst_name_bn" className="font-semibold">
                {t("প্রতিষ্ঠানের নাম (বাংলা) *", "Institution Name (Bangla) *")}
              </Label>
              <Input
                id="inst_name_bn"
                value={formData.institution_name_bn}
                onChange={(e) => setFormData({ ...formData, institution_name_bn: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inst_name_en" className="font-semibold">
                {t("প্রতিষ্ঠানের নাম (ইংরেজি) *", "Institution Name (English) *")}
              </Label>
              <Input
                id="inst_name_en"
                value={formData.institution_name_en}
                onChange={(e) => setFormData({ ...formData, institution_name_en: e.target.value })}
                required
              />
            </div>
          </div>

          {/* EMIS Code, Founding Year & Admission Status */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="emis_code" className="flex items-center gap-1 font-semibold">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                {t("EMIS / রেজিস্ট্রেশন কোড", "EMIS / Reg. Code")}
              </Label>
              <Input
                id="emis_code"
                value={formData.emis_code}
                onChange={(e) => setFormData({ ...formData, emis_code: e.target.value })}
                placeholder="12345678"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="founding_year" className="flex items-center gap-1 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {t("প্রতিষ্ঠার সাল", "Founding Year")}
              </Label>
              <Input
                id="founding_year"
                value={formData.founding_year}
                onChange={(e) => setFormData({ ...formData, founding_year: e.target.value })}
                placeholder="2015"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 font-semibold">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                {t("ভর্তি কার্যক্রম স্ট্যাটাস *", "Admission Status *")}
              </Label>
              <Select
                value={formData.admission_status}
                onValueChange={(val: AdmissionStatusType) => setFormData({ ...formData, admission_status: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">
                    <span className="font-medium text-emerald-600">● {t("ভর্তি চলছে (Open)", "Admission Open")}</span>
                  </SelectItem>
                  <SelectItem value="upcoming">
                    <span className="font-medium text-amber-600">● {t("শীঘ্রই শুরু (Upcoming)", "Upcoming")}</span>
                  </SelectItem>
                  <SelectItem value="closed">
                    <span className="font-medium text-rose-600">● {t("ভর্তি বন্ধ (Closed)", "Admission Closed")}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Helpline & Email */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone_primary" className="flex items-center gap-1 font-semibold">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                {t("প্রধান হটলাইন নম্বর *", "Primary Phone / Hotline *")}
              </Label>
              <Input
                id="phone_primary"
                value={formData.phone_primary}
                onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                placeholder="017XXXXXXXX"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp_number" className="flex items-center gap-1 font-semibold">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                {t("হোয়াটসঅ্যাপ নম্বর *", "WhatsApp Number *")}
              </Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="017XXXXXXXX"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email_primary" className="flex items-center gap-1 font-semibold">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                {t("অফিসিয়াল ইমেইল *", "Official Email *")}
              </Label>
              <Input
                id="email_primary"
                type="email"
                value={formData.email_primary}
                onChange={(e) => setFormData({ ...formData, email_primary: e.target.value })}
                placeholder="info@annoor.edu.bd"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="gap-2 bg-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{t("সেটিংস সংরক্ষণ করুন", "Save Settings")}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
