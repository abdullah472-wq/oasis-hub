import { useState, useEffect, useRef } from "react";
import { Loader2, Users, User, Image as ImageIcon, UploadCloud, Save, Sparkles, Phone, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase, uploadCmsFile, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { broadcastSiteSettingsUpdated, defaultSiteSettings, getCachedSiteSettings } from "@/lib/siteSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const LeadershipSettingsForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(() => {
    const cached = getCachedSiteSettings();
    return {
      founder_name_bn: cached.founder_name_bn || defaultSiteSettings.founder_name_bn || "",
      founder_name_en: cached.founder_name_en || defaultSiteSettings.founder_name_en || "",
      founder_title_bn: cached.founder_title_bn || defaultSiteSettings.founder_title_bn || "",
      founder_title_en: cached.founder_title_en || defaultSiteSettings.founder_title_en || "",
      founder_message_bn: cached.founder_message_bn || defaultSiteSettings.founder_message_bn || "",
      founder_message_en: cached.founder_message_en || defaultSiteSettings.founder_message_en || "",
      founder_image_url: cached.founder_image_url || defaultSiteSettings.founder_image_url || "",
      founder_phone: cached.founder_phone || defaultSiteSettings.founder_phone || "",

      principal_name_bn: cached.principal_name_bn || defaultSiteSettings.principal_name_bn || "",
      principal_name_en: cached.principal_name_en || defaultSiteSettings.principal_name_en || "",
      principal_title_bn: cached.principal_title_bn || defaultSiteSettings.principal_title_bn || "",
      principal_title_en: cached.principal_title_en || defaultSiteSettings.principal_title_en || "",
      principal_message_bn: cached.principal_message_bn || defaultSiteSettings.principal_message_bn || "",
      principal_message_en: cached.principal_message_en || defaultSiteSettings.principal_message_en || "",
      principal_image_url: cached.principal_image_url || defaultSiteSettings.principal_image_url || "",
      principal_phone: cached.principal_phone || defaultSiteSettings.principal_phone || "",
      principal_email: cached.principal_email || defaultSiteSettings.principal_email || "",

      vice_principal_name_bn: cached.vice_principal_name_bn || defaultSiteSettings.vice_principal_name_bn || "",
      vice_principal_name_en: cached.vice_principal_name_en || defaultSiteSettings.vice_principal_name_en || "",
      vice_principal_title_bn: cached.vice_principal_title_bn || defaultSiteSettings.vice_principal_title_bn || "",
      vice_principal_title_en: cached.vice_principal_title_en || defaultSiteSettings.vice_principal_title_en || "",
      vice_principal_message_bn: cached.vice_principal_message_bn || defaultSiteSettings.vice_principal_message_bn || "",
      vice_principal_message_en: cached.vice_principal_message_en || defaultSiteSettings.vice_principal_message_en || "",
      vice_principal_image_url: cached.vice_principal_image_url || defaultSiteSettings.vice_principal_image_url || "",
      vice_principal_phone: cached.vice_principal_phone || defaultSiteSettings.vice_principal_phone || "",
      vice_principal_email: cached.vice_principal_email || defaultSiteSettings.vice_principal_email || "",
    };
  });

  const [founderFile, setFounderFile] = useState<File | null>(null);
  const [principalFile, setPrincipalFile] = useState<File | null>(null);
  const [vicePrincipalFile, setVicePrincipalFile] = useState<File | null>(null);

  const founderInputRef = useRef<HTMLInputElement>(null);
  const principalInputRef = useRef<HTMLInputElement>(null);
  const vicePrincipalInputRef = useRef<HTMLInputElement>(null);

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
          founder_name_bn: data.founder_name_bn || defaultSiteSettings.founder_name_bn || "",
          founder_name_en: data.founder_name_en || defaultSiteSettings.founder_name_en || "",
          founder_title_bn: data.founder_title_bn || defaultSiteSettings.founder_title_bn || "",
          founder_title_en: data.founder_title_en || defaultSiteSettings.founder_title_en || "",
          founder_message_bn: data.founder_message_bn || defaultSiteSettings.founder_message_bn || "",
          founder_message_en: data.founder_message_en || defaultSiteSettings.founder_message_en || "",
          founder_image_url: data.founder_image_url || defaultSiteSettings.founder_image_url || "",
          founder_phone: data.founder_phone || defaultSiteSettings.founder_phone || "",

          principal_name_bn: data.principal_name_bn || defaultSiteSettings.principal_name_bn || "",
          principal_name_en: data.principal_name_en || defaultSiteSettings.principal_name_en || "",
          principal_title_bn: data.principal_title_bn || defaultSiteSettings.principal_title_bn || "",
          principal_title_en: data.principal_title_en || defaultSiteSettings.principal_title_en || "",
          principal_message_bn: data.principal_message_bn || defaultSiteSettings.principal_message_bn || "",
          principal_message_en: data.principal_message_en || defaultSiteSettings.principal_message_en || "",
          principal_image_url: data.principal_image_url || defaultSiteSettings.principal_image_url || "",
          principal_phone: data.principal_phone || defaultSiteSettings.principal_phone || "",
          principal_email: data.principal_email || defaultSiteSettings.principal_email || "",

          vice_principal_name_bn: data.vice_principal_name_bn || defaultSiteSettings.vice_principal_name_bn || "",
          vice_principal_name_en: data.vice_principal_name_en || defaultSiteSettings.vice_principal_name_en || "",
          vice_principal_title_bn: data.vice_principal_title_bn || defaultSiteSettings.vice_principal_title_bn || "",
          vice_principal_title_en: data.vice_principal_title_en || defaultSiteSettings.vice_principal_title_en || "",
          vice_principal_message_bn: data.vice_principal_message_bn || defaultSiteSettings.vice_principal_message_bn || "",
          vice_principal_message_en: data.vice_principal_message_en || defaultSiteSettings.vice_principal_message_en || "",
          vice_principal_image_url: data.vice_principal_image_url || defaultSiteSettings.vice_principal_image_url || "",
          vice_principal_phone: data.vice_principal_phone || defaultSiteSettings.vice_principal_phone || "",
          vice_principal_email: data.vice_principal_email || defaultSiteSettings.vice_principal_email || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching leadership settings:", err);
      toast.error(t("নেতৃত্ব সেটিংস লোড করতে সমস্যা হয়েছে", "Failed to load leadership settings"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (
    file: File,
    setFile: (f: File | null) => void,
    field: "founder_image_url" | "principal_image_url" | "vice_principal_image_url"
  ) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন", "Please select an image file"));
      return;
    }
    setFile(file);
    setFormData((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      let finalFounderImg = formData.founder_image_url;
      let finalPrincipalImg = formData.principal_image_url;
      let finalVicePrincipalImg = formData.vice_principal_image_url;

      if (founderFile) {
        toast.info(t("প্রতিষ্ঠাতা পরিচালকের ছবি আপলোড হচ্ছে...", "Uploading founder photo..."));
        finalFounderImg = await uploadCmsFile("cms-branding", founderFile, "leadership");
      }

      if (principalFile) {
        toast.info(t("প্রধান শিক্ষকের ছবি আপলোড হচ্ছে...", "Uploading principal photo..."));
        finalPrincipalImg = await uploadCmsFile("cms-branding", principalFile, "leadership");
      }

      if (vicePrincipalFile) {
        toast.info(t("সহকারী প্রধানের ছবি আপলোড হচ্ছে...", "Uploading vice principal photo..."));
        finalVicePrincipalImg = await uploadCmsFile("cms-branding", vicePrincipalFile, "leadership");
      }

      const payload = {
        id: 1,
        founder_name_bn: formData.founder_name_bn.trim() || null,
        founder_name_en: formData.founder_name_en.trim() || null,
        founder_title_bn: formData.founder_title_bn.trim() || null,
        founder_title_en: formData.founder_title_en.trim() || null,
        founder_message_bn: formData.founder_message_bn.trim() || null,
        founder_message_en: formData.founder_message_en.trim() || null,
        founder_image_url: finalFounderImg || null,
        founder_phone: formData.founder_phone.trim() || null,

        principal_name_bn: formData.principal_name_bn.trim() || null,
        principal_name_en: formData.principal_name_en.trim() || null,
        principal_title_bn: formData.principal_title_bn.trim() || null,
        principal_title_en: formData.principal_title_en.trim() || null,
        principal_message_bn: formData.principal_message_bn.trim() || null,
        principal_message_en: formData.principal_message_en.trim() || null,
        principal_image_url: finalPrincipalImg || null,
        principal_phone: formData.principal_phone.trim() || null,
        principal_email: formData.principal_email.trim() || null,

        vice_principal_name_bn: formData.vice_principal_name_bn.trim() || null,
        vice_principal_name_en: formData.vice_principal_name_en.trim() || null,
        vice_principal_title_bn: formData.vice_principal_title_bn.trim() || null,
        vice_principal_title_en: formData.vice_principal_title_en.trim() || null,
        vice_principal_message_bn: formData.vice_principal_message_bn.trim() || null,
        vice_principal_message_en: formData.vice_principal_message_en.trim() || null,
        vice_principal_image_url: finalVicePrincipalImg || null,
        vice_principal_phone: formData.vice_principal_phone.trim() || null,
        vice_principal_email: formData.vice_principal_email.trim() || null,

        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      // Broadcast update across the whole application instantly
      broadcastSiteSettingsUpdated(payload);

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `দায়িত্বশীল ও নেতৃবৃন্দের প্রোফাইল এবং বাণী আপডেট`
      );

      toast.success(t("নেতৃবৃন্দের তথ্য ও বাণী সফলভাবে সংরক্ষিত হয়েছে", "Leadership profiles & messages saved successfully"));
      setFounderFile(null);
      setPrincipalFile(null);
      setVicePrincipalFile(null);
    } catch (err: any) {
      console.error("Error saving leadership settings:", err);
      toast.error(err.message || t("সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save leadership settings"));
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
      {/* 1. Founder / Chairman */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">
                {t("১. প্রতিষ্ঠাতা পরিচালক / সভাপতি (Founder / Chairman)", "1. Founder / Chairman")}
              </CardTitle>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {t("ফুটার ও অ্যাবাউট পেজ", "Footer & About Page")}
            </span>
          </div>
          <CardDescription>
            {t(
              "প্রতিষ্ঠাতা পরিচালকের নাম, পদবি, বাণী ও সরাসরি যোগাযোগ নম্বর",
              "Founder's profile, designation, institutional message and contact"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founder_name_bn">{t("নাম (বাংলা)", "Name (Bangla)")}</Label>
              <Input
                id="founder_name_bn"
                value={formData.founder_name_bn}
                onChange={(e) => setFormData({ ...formData, founder_name_bn: e.target.value })}
                placeholder="যেমন: মুফতি আব্দুল্লাহ আল মামুন"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founder_name_en">{t("নাম (ইংরেজি)", "Name (English)")}</Label>
              <Input
                id="founder_name_en"
                value={formData.founder_name_en}
                onChange={(e) => setFormData({ ...formData, founder_name_en: e.target.value })}
                placeholder="e.g. Mufti Abdullah Al Mamon"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founder_title_bn">{t("পদবি (বাংলা)", "Title (Bangla)")}</Label>
              <Input
                id="founder_title_bn"
                value={formData.founder_title_bn}
                onChange={(e) => setFormData({ ...formData, founder_title_bn: e.target.value })}
                placeholder="যেমন: ম্যানেজার ও প্রতিষ্ঠাতা পরিচালক"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founder_title_en">{t("পদবি (ইংরেজি)", "Title (English)")}</Label>
              <Input
                id="founder_title_en"
                value={formData.founder_title_en}
                onChange={(e) => setFormData({ ...formData, founder_title_en: e.target.value })}
                placeholder="e.g. Manager & Founding Director"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founder_phone">{t("যোগাযোগ নম্বর / হেল্পলাইন", "Phone Number")}</Label>
              <Input
                id="founder_phone"
                value={formData.founder_phone}
                onChange={(e) => setFormData({ ...formData, founder_phone: e.target.value })}
                placeholder="013XXXXXXXX"
                className="font-mono"
              />
            </div>
          </div>

          {/* Photo & Messages */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2">
            <div className="md:col-span-4 space-y-2">
              <Label>{t("ছবি (Photo)", "Photo")}</Label>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-dashed border-border/80 bg-muted/20">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-muted flex items-center justify-center">
                  {formData.founder_image_url ? (
                    <img
                      src={formData.founder_image_url}
                      alt="Founder"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <input
                  type="file"
                  ref={founderInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFileChange(f, setFounderFile, "founder_image_url");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => founderInputRef.current?.click()}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>{t("ছবি আপলোড করুন", "Upload Photo")}</span>
                </Button>
                <Input
                  value={formData.founder_image_url}
                  onChange={(e) => setFormData({ ...formData, founder_image_url: e.target.value })}
                  placeholder={t("অথবা ইমেজ URL দিন", "or enter image URL")}
                  className="text-xs h-7"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="founder_message_bn">{t("বাণী / বক্তব্য (বাংলা)", "Message / Speech (Bangla)")}</Label>
                <Textarea
                  id="founder_message_bn"
                  rows={3}
                  value={formData.founder_message_bn}
                  onChange={(e) => setFormData({ ...formData, founder_message_bn: e.target.value })}
                  placeholder="শিক্ষা শুধু বইয়ের পাতার মুখস্থ নয়, এটি শিশুর চিন্তা ও চরিত্রের আত্মিক পরিশুদ্ধি..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="founder_message_en">{t("বাণী / বক্তব্য (ইংরেজি)", "Message / Speech (English)")}</Label>
                <Textarea
                  id="founder_message_en"
                  rows={2}
                  value={formData.founder_message_en}
                  onChange={(e) => setFormData({ ...formData, founder_message_en: e.target.value })}
                  placeholder="Education is not mere textbook cramming; it is the spiritual and intellectual purification..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Principal / Headmaster */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {t("২. প্রধান শিক্ষক / মুহতামিম (Principal / Headmaster)", "2. Principal / Headmaster")}
              </CardTitle>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t("যোগাযোগ ও পরিচিতি পেজ", "Contact & About Page")}
            </span>
          </div>
          <CardDescription>
            {t(
              "প্রধান শিক্ষকের নাম, পদবি, বাণী, ছবি ও প্রাতিষ্ঠানিক যোগাযোগ তথ্য",
              "Principal's profile, designation, educational message and direct contact"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal_name_bn">{t("নাম (বাংলা)", "Name (Bangla)")}</Label>
              <Input
                id="principal_name_bn"
                value={formData.principal_name_bn}
                onChange={(e) => setFormData({ ...formData, principal_name_bn: e.target.value })}
                placeholder="যেমন: হাফেজ আমানউল্লাহ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal_name_en">{t("নাম (ইংরেজি)", "Name (English)")}</Label>
              <Input
                id="principal_name_en"
                value={formData.principal_name_en}
                onChange={(e) => setFormData({ ...formData, principal_name_en: e.target.value })}
                placeholder="e.g. Hafez Amanullah"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal_title_bn">{t("পদবি (বাংলা)", "Title (Bangla)")}</Label>
              <Input
                id="principal_title_bn"
                value={formData.principal_title_bn}
                onChange={(e) => setFormData({ ...formData, principal_title_bn: e.target.value })}
                placeholder="যেমন: প্রধান শিক্ষক ও হিফজ প্রধান"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal_title_en">{t("পদবি (ইংরেজি)", "Title (English)")}</Label>
              <Input
                id="principal_title_en"
                value={formData.principal_title_en}
                onChange={(e) => setFormData({ ...formData, principal_title_en: e.target.value })}
                placeholder="e.g. Principal & Head of Hifz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal_phone">{t("মোবাইল নম্বর", "Phone Number")}</Label>
              <Input
                id="principal_phone"
                value={formData.principal_phone}
                onChange={(e) => setFormData({ ...formData, principal_phone: e.target.value })}
                placeholder="018XXXXXXXX"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal_email">{t("ইমেইল", "Email")}</Label>
              <Input
                id="principal_email"
                type="email"
                value={formData.principal_email}
                onChange={(e) => setFormData({ ...formData, principal_email: e.target.value })}
                placeholder="principal@institution.edu.bd"
              />
            </div>
          </div>

          {/* Photo & Messages */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2">
            <div className="md:col-span-4 space-y-2">
              <Label>{t("ছবি (Photo)", "Photo")}</Label>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-dashed border-border/80 bg-muted/20">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/40 bg-muted flex items-center justify-center">
                  {formData.principal_image_url ? (
                    <img
                      src={formData.principal_image_url}
                      alt="Principal"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <input
                  type="file"
                  ref={principalInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFileChange(f, setPrincipalFile, "principal_image_url");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => principalInputRef.current?.click()}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>{t("ছবি আপলোড করুন", "Upload Photo")}</span>
                </Button>
                <Input
                  value={formData.principal_image_url}
                  onChange={(e) => setFormData({ ...formData, principal_image_url: e.target.value })}
                  placeholder={t("অথবা ইমেজ URL দিন", "or enter image URL")}
                  className="text-xs h-7"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="principal_message_bn">{t("বাণী / বক্তব্য (বাংলা)", "Message / Speech (Bangla)")}</Label>
                <Textarea
                  id="principal_message_bn"
                  rows={3}
                  value={formData.principal_message_bn}
                  onChange={(e) => setFormData({ ...formData, principal_message_bn: e.target.value })}
                  placeholder="কুরআন হলো জীবনের হেদায়েতের নূর। আমরা চাই আমাদের শিক্ষার্থীরা বিশুদ্ধ কুরআন বক্ষে ধারণ করে..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="principal_message_en">{t("বাণী / বক্তব্য (ইংরেজি)", "Message / Speech (English)")}</Label>
                <Textarea
                  id="principal_message_en"
                  rows={2}
                  value={formData.principal_message_en}
                  onChange={(e) => setFormData({ ...formData, principal_message_en: e.target.value })}
                  placeholder="The Quran is the light of guidance. We strive for students who hold the Quran in their hearts..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Vice Principal / Assistant Manager */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-sky-600" />
              <CardTitle className="text-lg">
                {t("৩. সহকারী প্রধান / ভাইস প্রিন্সিপাল (Vice Principal / Assistant Head)", "3. Vice Principal / Assistant Manager")}
              </CardTitle>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
              {t("একাডেমিক প্রশাসন", "Academic Administration")}
            </span>
          </div>
          <CardDescription>
            {t(
              "সহকারী প্রধান বা ভাইস প্রিন্সিপালের পরিচিতি, বার্তা ও যোগাযোগ নম্বর",
              "Vice principal / academic coordinator profile, message, and contact"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vice_principal_name_bn">{t("নাম (বাংলা)", "Name (Bangla)")}</Label>
              <Input
                id="vice_principal_name_bn"
                value={formData.vice_principal_name_bn}
                onChange={(e) => setFormData({ ...formData, vice_principal_name_bn: e.target.value })}
                placeholder="যেমন: মুফতি মাহমুদুল হাসান"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vice_principal_name_en">{t("নাম (ইংরেজি)", "Name (English)")}</Label>
              <Input
                id="vice_principal_name_en"
                value={formData.vice_principal_name_en}
                onChange={(e) => setFormData({ ...formData, vice_principal_name_en: e.target.value })}
                placeholder="e.g. Mufti Mahmudul Hasan"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vice_principal_title_bn">{t("পদবি (বাংলা)", "Title (Bangla)")}</Label>
              <Input
                id="vice_principal_title_bn"
                value={formData.vice_principal_title_bn}
                onChange={(e) => setFormData({ ...formData, vice_principal_title_bn: e.target.value })}
                placeholder="যেমন: সহকারী প্রধান শিক্ষক (একাডেমিক)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vice_principal_title_en">{t("পদবি (ইংরেজি)", "Title (English)")}</Label>
              <Input
                id="vice_principal_title_en"
                value={formData.vice_principal_title_en}
                onChange={(e) => setFormData({ ...formData, vice_principal_title_en: e.target.value })}
                placeholder="e.g. Vice Principal (Academic)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vice_principal_phone">{t("মোবাইল নম্বর", "Phone Number")}</Label>
              <Input
                id="vice_principal_phone"
                value={formData.vice_principal_phone}
                onChange={(e) => setFormData({ ...formData, vice_principal_phone: e.target.value })}
                placeholder="015XXXXXXXX"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vice_principal_email">{t("ইমেইল", "Email")}</Label>
              <Input
                id="vice_principal_email"
                type="email"
                value={formData.vice_principal_email}
                onChange={(e) => setFormData({ ...formData, vice_principal_email: e.target.value })}
                placeholder="academic@institution.edu.bd"
              />
            </div>
          </div>

          {/* Photo & Messages */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2">
            <div className="md:col-span-4 space-y-2">
              <Label>{t("ছবি (Photo)", "Photo")}</Label>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-dashed border-border/80 bg-muted/20">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-sky-500/40 bg-muted flex items-center justify-center">
                  {formData.vice_principal_image_url ? (
                    <img
                      src={formData.vice_principal_image_url}
                      alt="Vice Principal"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <input
                  type="file"
                  ref={vicePrincipalInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFileChange(f, setVicePrincipalFile, "vice_principal_image_url");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => vicePrincipalInputRef.current?.click()}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>{t("ছবি আপলোড করুন", "Upload Photo")}</span>
                </Button>
                <Input
                  value={formData.vice_principal_image_url}
                  onChange={(e) => setFormData({ ...formData, vice_principal_image_url: e.target.value })}
                  placeholder={t("অথবা ইমেজ URL দিন", "or enter image URL")}
                  className="text-xs h-7"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="vice_principal_message_bn">{t("বাণী / বক্তব্য (বাংলা)", "Message / Speech (Bangla)")}</Label>
                <Textarea
                  id="vice_principal_message_bn"
                  rows={3}
                  value={formData.vice_principal_message_bn}
                  onChange={(e) => setFormData({ ...formData, vice_principal_message_bn: e.target.value })}
                  placeholder="নিয়মিত পাঠদান ও নিবিড় পরিচর্যার মাধ্যমেই প্রতিটি শিক্ষার্থীর মেধার সর্বোচ্চ বিকাশ সম্ভব..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vice_principal_message_en">{t("বাণী / বক্তব্য (ইংরেজি)", "Message / Speech (English)")}</Label>
                <Textarea
                  id="vice_principal_message_en"
                  rows={2}
                  value={formData.vice_principal_message_en}
                  onChange={(e) => setFormData({ ...formData, vice_principal_message_en: e.target.value })}
                  placeholder="Through consistent guidance and compassionate mentorship, every student's latent potential can truly flourish..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
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
