import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCurriculum, type CurriculumProgram } from "@/lib/curriculum";

interface CurriculumDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  curriculum?: CurriculumProgram | null;
}

export const CurriculumDialog = ({
  isOpen,
  onClose,
  onSuccess,
  curriculum,
}: CurriculumDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [departmentBn, setDepartmentBn] = useState("");
  const [departmentEn, setDepartmentEn] = useState("");
  const [category, setCategory] = useState<CurriculumProgram["category"]>("nurani");
  const [ageGroupBn, setAgeGroupBn] = useState("");
  const [ageGroupEn, setAgeGroupEn] = useState("");
  const [durationBn, setDurationBn] = useState("");
  const [durationEn, setDurationEn] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [subjectsText, setSubjectsText] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (curriculum) {
      setDepartmentBn(curriculum.department_bn || "");
      setDepartmentEn(curriculum.department_en || "");
      setCategory(curriculum.category || "nurani");
      setAgeGroupBn(curriculum.age_group_bn || "");
      setAgeGroupEn(curriculum.age_group_en || "");
      setDurationBn(curriculum.duration_bn || "");
      setDurationEn(curriculum.duration_en || "");
      setDescriptionBn(curriculum.description_bn || "");
      setDescriptionEn(curriculum.description_en || "");
      setSubjectsText((curriculum.subjects_bn || []).join("\n"));
      setFeaturesText((curriculum.features_bn || []).join("\n"));
      setOrderIndex(curriculum.order_index || 1);
      setIsActive(curriculum.is_active !== false);
    } else {
      setDepartmentBn("");
      setDepartmentEn("");
      setCategory("nurani");
      setAgeGroupBn("৪ - ৭ বছর");
      setAgeGroupEn("4 - 7 Years");
      setDurationBn("২ বছর");
      setDurationEn("2 Years");
      setDescriptionBn("");
      setDescriptionEn("");
      setSubjectsText("");
      setFeaturesText("");
      setOrderIndex(1);
      setIsActive(true);
    }
  }, [curriculum, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentBn.trim()) {
      toast.error(t("বিভাগের নাম (বাংলা) আবশ্যক", "Department name in Bengali is required"));
      return;
    }

    try {
      setLoading(true);

      const subjects = subjectsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const features = featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      await saveCurriculum({
        id: curriculum?.id,
        department_bn: departmentBn.trim(),
        department_en: departmentEn.trim() || departmentBn.trim(),
        category,
        age_group_bn: ageGroupBn.trim(),
        age_group_en: ageGroupEn.trim() || ageGroupBn.trim(),
        duration_bn: durationBn.trim(),
        duration_en: durationEn.trim() || durationBn.trim(),
        description_bn: descriptionBn.trim(),
        description_en: descriptionEn.trim() || descriptionBn.trim(),
        subjects_bn: subjects,
        subjects_en: subjects,
        features_bn: features,
        features_en: features,
        order_index: Number(orderIndex) || 1,
        is_active: isActive,
      });

      toast.success(
        curriculum
          ? t("কারিকুলাম সফলভাবে আপডেট হয়েছে", "Curriculum updated successfully")
          : t("নতুন কারিকুলাম সফলভাবে যুক্ত হয়েছে", "Curriculum created successfully")
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(t("সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save curriculum"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl">
            {curriculum
              ? t("কারিকুলাম সম্পাদনা করুন", "Edit Curriculum Program")
              : t("নতুন শিক্ষা কারিকুলাম যুক্ত করুন", "Add New Curriculum Program")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-medium text-xs font-bengali">
                {t("বিভাগের নাম (বাংলা) *", "Department Name (Bengali) *")}
              </Label>
              <Input
                placeholder="যেমন: নূরানী বিভাগ (প্লে - ২য় শ্রেণি)"
                value={departmentBn}
                onChange={(e) => setDepartmentBn(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-xs">
                {t("বিভাগের নাম (ইংরেজি)", "Department Name (English)")}
              </Label>
              <Input
                placeholder="e.g. Nurani Section (Play - Grade 2)"
                value={departmentEn}
                onChange={(e) => setDepartmentEn(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="font-medium text-xs font-bengali">{t("ক্যাটাগরি", "Category")}</Label>
              <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nurani">{t("নূরানী বিভাগ", "Nurani")}</SelectItem>
                  <SelectItem value="nazara">{t("নাজেরা ও কিরাত", "Nazara & Qirat")}</SelectItem>
                  <SelectItem value="hifz">{t("হিফজুল কুরআন", "Hifzul Quran")}</SelectItem>
                  <SelectItem value="general">{t("জেনারেল সমন্বিত", "General Education")}</SelectItem>
                  <SelectItem value="tarbiya">{t("তারবিয়াত ও আদব", "Tarbiya & Ethics")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-xs font-bengali">{t("বয়সসীমা (বাংলা)", "Age Group (BN)")}</Label>
              <Input
                placeholder="যেমন: ৪ - ৭ বছর"
                value={ageGroupBn}
                onChange={(e) => setAgeGroupBn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-xs font-bengali">{t("কোর্স মেয়াদ (বাংলা)", "Duration (BN)")}</Label>
              <Input
                placeholder="যেমন: ২ বছর মেয়াদী"
                value={durationBn}
                onChange={(e) => setDurationBn(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-medium text-xs font-bengali">
              {t("বিভাগের বিবরণ ও লক্ষ্য (বাংলা)", "Department Description (Bengali)")}
            </Label>
            <Textarea
              placeholder="এই বিভাগে কী কী শেখানো হয় এবং পাঠদানের মূল উদ্দেশ্য লিখুন..."
              rows={3}
              value={descriptionBn}
              onChange={(e) => setDescriptionBn(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-medium text-xs font-bengali">
              {t("পাঠ্য বিষয় ও সিলেবাস (প্রতি লাইনে একটি বিষয়)", "Subjects & Syllabus (One per line)")}
            </Label>
            <Textarea
              placeholder={"নূরানী কায়দা ও আমপারা সহীহ মাখরাজ\nতাজবীদ ও মাসনূন দু'আ\nবাংলা সাহিত্য ও ব্যাকরণ\nপ্রাথমিক গণিত\nস্পোকেন ইংলিশ"}
              rows={4}
              value={subjectsText}
              onChange={(e) => setSubjectsText(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              {t("প্রতিটি লাইন আলাদা বিষয় হিসেবে ওয়েবসাইটে সুন্দর ব্যাজ আকারে দেখাবে।", "Each line will appear as an individual badge on the website.")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-medium text-xs font-bengali">
              {t("বিশেষ বৈশিষ্ট্য ও সুযোগ-সুবিধা (প্রতি লাইনে একটি)", "Key Highlights (One per line)")}
            </Label>
            <Textarea
              placeholder={"ক্লাসের পড়া ক্লাসেই সম্পূর্ণ আদায়\nখেলার ছলে আনন্দঘন পাঠদান পরিবেশ\nহাতের লেখা সুন্দরকরণে বিশেষ প্রশিক্ষণ"}
              rows={3}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center pt-2 border-t border-border/60">
            <div className="space-y-1.5">
              <Label className="font-medium text-xs font-bengali">{t("ক্রমিক নম্বর (সর্টিং)", "Order Index")}</Label>
              <Input
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Label htmlFor="active-status" className="font-medium text-xs font-bengali cursor-pointer">
                {t("ওয়েবসাইটে সক্রিয় থাকবে", "Active on Website")}
              </Label>
              <Switch id="active-status" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
              {loading
                ? t("সংরক্ষণ হচ্ছে...", "Saving...")
                : curriculum
                ? t("আপডেট করুন", "Update")
                : t("যুক্ত করুন", "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
