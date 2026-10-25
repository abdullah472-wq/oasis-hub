import { useState, useEffect } from "react";
import { Loader2, Building2, Phone, Mail, Hash, Calendar, GraduationCap, Save, Award, ShieldCheck, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { broadcastSiteSettingsUpdated, defaultSiteSettings, getCachedSiteSettings, updateSiteSettingsRemote } from "@/lib/siteSettings";
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

  const [formData, setFormData] = useState(() => {
    const cached = getCachedSiteSettings();
    return {
      institution_name_bn: cached.institution_name_bn || defaultSiteSettings.institution_name_bn,
      institution_name_en: cached.institution_name_en || defaultSiteSettings.institution_name_en,
      tagline_bn: cached.tagline_bn || defaultSiteSettings.tagline_bn || "",
      tagline_en: cached.tagline_en || defaultSiteSettings.tagline_en || "",
      emis_code: cached.emis_code === "12345678" ? "" : (cached.emis_code || ""),
      founding_year: cached.founding_year || defaultSiteSettings.founding_year || "2021",
      phone_primary: cached.phone_primary || defaultSiteSettings.phone_primary,
      phone_secondary: cached.phone_secondary || "",
      whatsapp_number: cached.whatsapp_number || defaultSiteSettings.whatsapp_number,
      email_primary: cached.email_primary || defaultSiteSettings.email_primary,
      admission_status: (cached.admission_status || "open") as AdmissionStatusType,
      befaq_name: cached.befaq_name || defaultSiteSettings.befaq_name || "বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (বেফাক)",
      befaq_reg_no: cached.befaq_reg_no || "",
      befaq_cert_no: cached.befaq_cert_no || "",
      huffaz_name: cached.huffaz_name || defaultSiteSettings.huffaz_name || "হুফ্ফাজুল কুরআন ফাউন্ডেশন বাংলাদেশ",
      huffaz_reg_no: cached.huffaz_reg_no || "",
      huffaz_cert_no: cached.huffaz_cert_no || "",
      nurani_name: cached.nurani_name || defaultSiteSettings.nurani_name || "নূরানী তা'লীমুল কুরআন বোর্ড বাংলাদেশ",
      nurani_reg_no: cached.nurani_reg_no || "",
      nurani_cert_no: cached.nurani_cert_no || "",
      trade_license_no: cached.trade_license_no || "",
    };
  });

  useEffect(() => {
    let isMounted = true;
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

        if (isMounted && data) {
          const cleanBn =
            data.institution_name_bn === "আননূর তাহফিজুল কুরআন মাদরাসা ও মডেল একাডেমী"
              ? defaultSiteSettings.institution_name_bn
              : (data.institution_name_bn || defaultSiteSettings.institution_name_bn);

          const cleanEn =
            data.institution_name_en === "Annoor Tahfizul Quran Madrasa & Model Academy"
              ? defaultSiteSettings.institution_name_en
              : (data.institution_name_en || defaultSiteSettings.institution_name_en);

          const cleanEmis = data.emis_code === "12345678" ? "" : (data.emis_code || "");

          setFormData({
            institution_name_bn: cleanBn,
            institution_name_en: cleanEn,
            tagline_bn: data.tagline_bn || defaultSiteSettings.tagline_bn || "",
            tagline_en: data.tagline_en || defaultSiteSettings.tagline_en || "",
            emis_code: cleanEmis,
            founding_year: data.founding_year || defaultSiteSettings.founding_year || "2021",
            phone_primary: data.phone_primary || defaultSiteSettings.phone_primary,
            phone_secondary: data.phone_secondary || defaultSiteSettings.phone_secondary || "",
            whatsapp_number: data.whatsapp_number || defaultSiteSettings.whatsapp_number,
            email_primary: data.email_primary || defaultSiteSettings.email_primary,
            admission_status: data.admission_status || "open",
            befaq_name: data.befaq_name ?? defaultSiteSettings.befaq_name ?? "বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (বেফাক)",
            befaq_reg_no: data.befaq_reg_no ?? "",
            befaq_cert_no: data.befaq_cert_no ?? "",
            huffaz_name: data.huffaz_name ?? defaultSiteSettings.huffaz_name ?? "হুফ্ফাজুল কুরআন ফাউন্ডেশন বাংলাদেশ",
            huffaz_reg_no: data.huffaz_reg_no ?? "",
            huffaz_cert_no: data.huffaz_cert_no ?? "",
            nurani_name: data.nurani_name ?? defaultSiteSettings.nurani_name ?? "নূরানী তা'লীমুল কুরআন বোর্ড বাংলাদেশ",
            nurani_reg_no: data.nurani_reg_no ?? "",
            nurani_cert_no: data.nurani_cert_no ?? "",
            trade_license_no: data.trade_license_no ?? "",
          });
        }
      } catch (err: any) {
        console.error("Error fetching site settings:", err);
        if (isMounted) toast.error(t("সেটিংস লোড করতে সমস্যা হয়েছে", "Failed to load settings"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

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
        tagline_bn: formData.tagline_bn.trim() || null,
        tagline_en: formData.tagline_en.trim() || null,
        emis_code: formData.emis_code.trim() || null,
        founding_year: formData.founding_year.trim() || null,
        phone_primary: formData.phone_primary.trim(),
        phone_secondary: formData.phone_secondary.trim() || null,
        whatsapp_number: formData.whatsapp_number.trim(),
        email_primary: formData.email_primary.trim(),
        admission_status: formData.admission_status,
        befaq_name: formData.befaq_name.trim() || null,
        befaq_reg_no: formData.befaq_reg_no.trim() || null,
        befaq_cert_no: formData.befaq_cert_no.trim() || null,
        huffaz_name: formData.huffaz_name.trim() || null,
        huffaz_reg_no: formData.huffaz_reg_no.trim() || null,
        huffaz_cert_no: formData.huffaz_cert_no.trim() || null,
        nurani_name: formData.nurani_name.trim() || null,
        nurani_reg_no: formData.nurani_reg_no.trim() || null,
        nurani_cert_no: formData.nurani_cert_no.trim() || null,
        trade_license_no: formData.trade_license_no.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Resilient remote updater handles schema cache and broadcasts sync
      await updateSiteSettingsRemote(payload);

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `সাধারণ প্রতিষ্ঠান তথ্য ও পরিচিতি সেটিংস আপডেট`
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

          {/* Tagline / Slogan */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tagline_bn" className="font-semibold">
                {t("স্লোগান / মূলনীতি (বাংলা)", "Slogan / Tagline (Bangla)")}
              </Label>
              <Input
                id="tagline_bn"
                value={formData.tagline_bn}
                onChange={(e) => setFormData({ ...formData, tagline_bn: e.target.value })}
                placeholder="যেমন: একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagline_en" className="font-semibold">
                {t("স্লোগান / মূলনীতি (ইংরেজি)", "Slogan / Tagline (English)")}
              </Label>
              <Input
                id="tagline_en"
                value={formData.tagline_en}
                onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                placeholder="e.g. Building Faith, Knowledge & Character Together"
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

          {/* Board Affiliations & Registrations */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bengali font-bold text-sm text-foreground">
                    {t("বোর্ড স্বীকৃতি, অধিভুক্তি ও রেজিস্ট্রেশন নম্বর", "Board Affiliations & Registration Numbers")}
                  </h4>
                  <p className="text-xs text-muted-foreground font-bengali">
                    {t(
                      "এখানে এন্ট্রি করা বোর্ডের নাম ও রেজি. নম্বর সরাসরি 'আমাদের সম্পর্কে' (About Us) পেজে ভেরিফাইড ব্যাজসহ প্রদর্শিত হবে",
                      "Board names and registration numbers entered here will appear on the public 'About Us' page with verified badges"
                    )}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                <span>{t("About Us পেজে লাইভ", "Live on About Us")}</span>
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Befaq */}
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 font-bold text-xs">
                    ১
                  </span>
                  <span className="font-bengali font-bold text-xs text-foreground">
                    {t("বেফাকুল মাদারিসিল আরাবিয়া (বেফাক)", "Befaqul Madarisil Arabia")}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="befaq_name" className="text-xs font-medium text-muted-foreground">
                    {t("বোর্ডের নাম", "Board Name")}
                  </Label>
                  <Input
                    id="befaq_name"
                    value={formData.befaq_name}
                    onChange={(e) => setFormData({ ...formData, befaq_name: e.target.value })}
                    placeholder="বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (বেফাক)"
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="befaq_reg_no" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 font-semibold">
                    {t("বেফাক রেজি: নম্বর", "Befaq Reg. No")}
                  </Label>
                  <Input
                    id="befaq_reg_no"
                    value={formData.befaq_reg_no}
                    onChange={(e) => setFormData({ ...formData, befaq_reg_no: e.target.value })}
                    placeholder="যেমন: B-12345 বা রেজি নং"
                    className="text-xs h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="befaq_cert_no" className="text-xs font-medium text-muted-foreground font-semibold">
                    {t("বেফাক সনদ নম্বর / Certificate No.", "Befaq Certificate No.")}
                  </Label>
                  <Input
                    id="befaq_cert_no"
                    value={formData.befaq_cert_no}
                    onChange={(e) => setFormData({ ...formData, befaq_cert_no: e.target.value })}
                    placeholder="যেমন: CERT-12345 বা সনদ নং"
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>

              {/* Huffaz Board */}
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 font-bold text-xs">
                    ২
                  </span>
                  <span className="font-bengali font-bold text-xs text-foreground">
                    {t("হুফ্ফাজুল কুরআন ফাউন্ডেশন", "Huffazul Quran Foundation")}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="huffaz_name" className="text-xs font-medium text-muted-foreground">
                    {t("সংস্থা / বোর্ডের নাম", "Board / Body Name")}
                  </Label>
                  <Input
                    id="huffaz_name"
                    value={formData.huffaz_name}
                    onChange={(e) => setFormData({ ...formData, huffaz_name: e.target.value })}
                    placeholder="হুফ্ফাজুল কুরআন ফাউন্ডেশন বাংলাদেশ"
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="huffaz_reg_no" className="text-xs font-medium text-blue-700 dark:text-blue-400 font-semibold">
                    {t("হুফ্ফাজ রেজি: নম্বর", "Huffaz Reg. No")}
                  </Label>
                  <Input
                    id="huffaz_reg_no"
                    value={formData.huffaz_reg_no}
                    onChange={(e) => setFormData({ ...formData, huffaz_reg_no: e.target.value })}
                    placeholder="যেমন: HQF-98765 বা রেজি নং"
                    className="text-xs h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="huffaz_cert_no" className="text-xs font-medium text-muted-foreground font-semibold">
                    {t("হুফ্ফাজ সনদ নম্বর / Certificate No.", "Huffaz Certificate No.")}
                  </Label>
                  <Input
                    id="huffaz_cert_no"
                    value={formData.huffaz_cert_no}
                    onChange={(e) => setFormData({ ...formData, huffaz_cert_no: e.target.value })}
                    placeholder="যেমন: HQF-CERT-98765 বা সনদ নং"
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>

              {/* Nurani Board */}
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/15 text-purple-600 font-bold text-xs">
                    ৩
                  </span>
                  <span className="font-bengali font-bold text-xs text-foreground">
                    {t("নূরানী তা'লীমুল কুরআন বোর্ড", "Nurani Talimul Quran Board")}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nurani_name" className="text-xs font-medium text-muted-foreground">
                    {t("বোর্ডের নাম", "Board Name")}
                  </Label>
                  <Input
                    id="nurani_name"
                    value={formData.nurani_name}
                    onChange={(e) => setFormData({ ...formData, nurani_name: e.target.value })}
                    placeholder="নূরানী তা'লীমুল কুরআন বোর্ড বাংলাদেশ"
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nurani_reg_no" className="text-xs font-medium text-purple-700 dark:text-purple-400 font-semibold">
                    {t("নূরানী বোর্ড রেজি: নম্বর", "Nurani Reg. No")}
                  </Label>
                  <Input
                    id="nurani_reg_no"
                    value={formData.nurani_reg_no}
                    onChange={(e) => setFormData({ ...formData, nurani_reg_no: e.target.value })}
                    placeholder="যেমন: NTQB-54321 বা রেজি নং"
                    className="text-xs h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nurani_cert_no" className="text-xs font-medium text-muted-foreground font-semibold">
                    {t("নূরানী সনদ নম্বর / Certificate No.", "Nurani Certificate No.")}
                  </Label>
                  <Input
                    id="nurani_cert_no"
                    value={formData.nurani_cert_no}
                    onChange={(e) => setFormData({ ...formData, nurani_cert_no: e.target.value })}
                    placeholder="যেমন: NTQB-CERT-54321 বা সনদ নং"
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Government Trade License Number */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 font-bold text-xs">
                    ৪
                  </span>
                  <div>
                    <h5 className="font-bengali font-bold text-xs sm:text-sm text-foreground">
                      {t("সরকারি ট্রেড লাইসেন্স নম্বর (Trade License No)", "Trade License Number")}
                    </h5>
                    <p className="text-[11px] text-muted-foreground font-bengali">
                      {t("স্থানীয় পৌরসভা/ইউনিয়ন পরিষদ অনুমোদিত প্রাতিষ্ঠানিক ট্রেড লাইসেন্স নম্বর", "Authorized Institutional Trade License Number")}
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-80">
                  <Input
                    id="trade_license_no"
                    value={formData.trade_license_no}
                    onChange={(e) => setFormData({ ...formData, trade_license_no: e.target.value })}
                    placeholder="যেমন: TRAD/KAP/2024/XXXX"
                    className="h-9 font-mono text-xs bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
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
