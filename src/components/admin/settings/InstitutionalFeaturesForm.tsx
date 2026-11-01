import { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  defaultFeatureGroups,
  getCachedSiteSettings,
  updateSiteSettingsRemote,
} from "@/lib/siteSettings";
import { logAdminActivity } from "@/lib/supabase/client";
import type { FeatureGroupItem } from "@/types/cms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const InstitutionalFeaturesForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<FeatureGroupItem[]>(() => {
    const cached = getCachedSiteSettings();
    if (Array.isArray(cached.institutional_features) && cached.institutional_features.length > 0) {
      return cached.institutional_features;
    }
    return defaultFeatureGroups;
  });

  useEffect(() => {
    const cached = getCachedSiteSettings();
    if (Array.isArray(cached.institutional_features) && cached.institutional_features.length > 0) {
      setFeatures(cached.institutional_features);
    }
  }, []);

  const handleTitleChange = (index: number, lang: "bn" | "en", value: string) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [lang === "bn" ? "title_bn" : "title_en"]: value,
      };
      return updated;
    });
  };

  const handlePointsChange = (index: number, lang: "bn" | "en", text: string) => {
    const lines = text.split("\n");
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [lang === "bn" ? "points_bn" : "points_en"]: lines,
      };
      return updated;
    });
  };

  const handleAddGroup = () => {
    const newGroup: FeatureGroupItem = {
      id: `feat-${Date.now()}`,
      title_bn: "নতুন বৈশিষ্ট্য বিভাগ",
      title_en: "New Feature Category",
      points_bn: ["প্রথম বিশেষ বৈশিষ্ট্য বা সুযোগ-সুবিধা", "দ্বিতীয় বিশেষ সুবিধা"],
      points_en: ["First distinctive advantage or feature", "Second key benefit"],
    };
    setFeatures((prev) => [...prev, newGroup]);
    toast.success(t("নতুন বৈশিষ্ট্য গ্রুপ যুক্ত হয়েছে", "New feature group added"));
  };

  const handleRemoveGroup = (index: number) => {
    if (features.length <= 1) {
      toast.error(t("অন্তত একটি বৈশিষ্ট্য গ্রুপ থাকা আবশ্যক", "At least one feature group is required"));
      return;
    }
    setFeatures((prev) => prev.filter((_, i) => i !== index));
    toast.info(t("বৈশিষ্ট্য গ্রুপ অপসারিত হয়েছে", "Feature group removed"));
  };

  const handleResetToDefault = () => {
    if (window.confirm(t("আপনি কি নিশ্চিত যে সকল বৈশিষ্ট্য ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?", "Are you sure you want to reset all features to defaults?"))) {
      setFeatures(defaultFeatureGroups);
      toast.success(t("ডিফল্ট বৈশিষ্ট্যসমূহ লোড করা হয়েছে", "Loaded default features"));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up empty lines from points
    const cleanedFeatures: FeatureGroupItem[] = features.map((f, i) => ({
      id: f.id || `feat-${i + 1}`,
      title_bn: f.title_bn.trim() || `বৈশিষ্ট্য ${i + 1}`,
      title_en: f.title_en.trim() || `Feature ${i + 1}`,
      points_bn: f.points_bn.map((p) => p.trim()).filter((p) => p.length > 0),
      points_en: f.points_en.map((p) => p.trim()).filter((p) => p.length > 0),
    }));

    try {
      setSaving(true);
      await updateSiteSettingsRemote({
        institutional_features: cleanedFeatures,
      });

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `মাদরাসার বৈশিষ্ট্য ও সুবিধা তালিকা আপডেট (${cleanedFeatures.length} গ্রুপ)`
      );

      toast.success(t("মাদরাসার বৈশিষ্ট্যসমূহ সফলভাবে সংরক্ষিত হয়েছে!", "Institutional features saved successfully!"));
    } catch (err: any) {
      console.error("Error saving features:", err);
      toast.error(err.message || t("বৈশিষ্ট্য সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save features"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-bold font-bengali text-foreground">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>{t("মাদরাসার অনন্য বৈশিষ্ট্য ও সুযোগ-সুবিধা", "Institution Standout Features & Facilities")}</span>
            </CardTitle>
            <CardDescription className="text-xs font-bengali text-muted-foreground">
              {t(
                "ওয়েবসাইটের মূল হোমপেজে 'মাদরাসার বৈশিষ্ট্য' সেকশনে প্রদর্শিত ক্যাটাগরি এবং পয়েন্টগুলো এখান থেকে সরাসরি পরিবর্তন বা পরিমার্জন করুন।",
                "Customize standout qualities, academic strengths, tarbiya methods, security, and hostel facilities shown on the homepage."
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="gap-1.5 rounded-xl text-xs font-bengali text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t("ডিফল্টে রিসেট", "Reset to Default")}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddGroup}
              className="gap-1.5 rounded-xl text-xs font-bengali"
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>{t("নতুন গ্রুপ যোগ করুন", "Add Group")}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-6">
            {features.map((group, groupIdx) => (
              <div
                key={group.id || groupIdx}
                className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                      {groupIdx + 1}
                    </span>
                    <span className="font-bengali font-bold text-sm text-foreground">
                      {group.title_bn || t("নতুন বৈশিষ্ট্য বিভাগ", "Feature Group")}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveGroup(groupIdx)}
                    disabled={features.length <= 1}
                    className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 h-8 rounded-lg"
                    title={t("এই গ্রুপটি মুছুন", "Delete this group")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("মুছে ফেলুন", "Delete")}</span>
                  </Button>
                </div>

                {/* Group Title Inputs */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground font-bengali">
                      {t("বিভাগের শিরোনাম (বাংলা) *", "Category Title (Bangla) *")}
                    </Label>
                    <Input
                      value={group.title_bn}
                      onChange={(e) => handleTitleChange(groupIdx, "bn", e.target.value)}
                      placeholder="যেমন: একাডেমিক শ্রেষ্ঠত্ব"
                      className="text-xs sm:text-sm bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground font-bengali">
                      {t("বিভাগের শিরোনাম (ইংরেজি)", "Category Title (English)")}
                    </Label>
                    <Input
                      value={group.title_en}
                      onChange={(e) => handleTitleChange(groupIdx, "en", e.target.value)}
                      placeholder="e.g. Academic Excellence"
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>
                </div>

                {/* Points Textareas */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-foreground font-bengali">
                        {t("সুযোগ-সুবিধাসমূহের বিবরণ (বাংলা)", "Features & Points (Bangla)")}
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-bengali">
                        {t("প্রতি লাইনে ১টি পয়েন্ট", "1 point per line")}
                      </span>
                    </div>
                    <Textarea
                      rows={6}
                      value={group.points_bn.join("\n")}
                      onChange={(e) => handlePointsChange(groupIdx, "bn", e.target.value)}
                      placeholder={"লাইন ১: দেশবরেণ্য আলেম-উলামাদের সার্বিক তত্ত্বাবধানে পরিচালিত।\nলাইন ২: প্রশিক্ষণপ্রাপ্ত অভিজ্ঞ শিক্ষকমণ্ডলী...\nলাইন ৩: আলাদা কোনো প্রাইভেট বা টিউশনির প্রয়োজন নেই।"}
                      className="font-bengali text-xs leading-relaxed bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-foreground font-bengali">
                        {t("সুযোগ-সুবিধাসমূহের বিবরণ (ইংরেজি)", "Features & Points (English)")}
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-bengali">
                        {t("প্রতি লাইনে ১টি পয়েন্ট", "1 point per line")}
                      </span>
                    </div>
                    <Textarea
                      rows={6}
                      value={group.points_en.join("\n")}
                      onChange={(e) => handlePointsChange(groupIdx, "en", e.target.value)}
                      placeholder={"Line 1: Operated under the supervision of renowned Islamic scholars.\nLine 2: Joyful and caring learning environment.\nLine 3: No separate private tutoring needed."}
                      className="text-xs leading-relaxed bg-background"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground font-bengali">
              {t(
                "সংরক্ষণ করার পর হোমপেজে ভিজিট করে সরাসরি নতুন বৈশিষ্ট্যগুলো দেখা যাবে।",
                "Saved changes will immediately appear in the 'Features of the Madrasha' section on the homepage."
              )}
            </p>

            <Button
              type="submit"
              disabled={saving}
              className="gap-2 rounded-xl font-bengali font-semibold px-6 shadow-sm w-full sm:w-auto"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("পরিবর্তন সংরক্ষণ করুন", "Save Changes")}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

