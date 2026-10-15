import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveHafezRecord, type HafezRecord } from "@/lib/huffaz";

interface HafezDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hafezItem?: HafezRecord | null;
}

export const HafezDialog = ({
  isOpen,
  onClose,
  onSuccess,
  hafezItem,
}: HafezDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [fatherNameBn, setFatherNameBn] = useState("");
  const [fatherNameEn, setFatherNameEn] = useState("");
  const [completionYear, setCompletionYear] = useState("2025");
  const [durationBn, setDurationBn] = useState("");
  const [durationEn, setDurationEn] = useState("");
  const [ageAtCompletion, setAgeAtCompletion] = useState("");
  const [campus, setCampus] = useState<"boys" | "girls">("boys");
  const [teacherNameBn, setTeacherNameBn] = useState("");
  const [teacherNameEn, setTeacherNameEn] = useState("");
  const [districtBn, setDistrictBn] = useState("");
  const [districtEn, setDistrictEn] = useState("");
  const [awardTitleBn, setAwardTitleBn] = useState("");
  const [awardTitleEn, setAwardTitleEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (hafezItem) {
      setNameBn(hafezItem.name_bn || "");
      setNameEn(hafezItem.name_en || "");
      setFatherNameBn(hafezItem.father_name_bn || "");
      setFatherNameEn(hafezItem.father_name_en || "");
      setCompletionYear(hafezItem.completion_year || "2025");
      setDurationBn(hafezItem.duration_bn || "");
      setDurationEn(hafezItem.duration_en || "");
      setAgeAtCompletion(hafezItem.age_at_completion || "");
      setCampus(hafezItem.campus || "boys");
      setTeacherNameBn(hafezItem.teacher_name_bn || "");
      setTeacherNameEn(hafezItem.teacher_name_en || "");
      setDistrictBn(hafezItem.district_bn || "");
      setDistrictEn(hafezItem.district_en || "");
      setAwardTitleBn(hafezItem.award_title_bn || "");
      setAwardTitleEn(hafezItem.award_title_en || "");
      setImageUrl(hafezItem.image_url || "");
      setIsFeatured(Boolean(hafezItem.is_featured));
      setOrderIndex(hafezItem.order_index || 1);
      setIsActive(hafezItem.is_active !== false);
    } else {
      setNameBn("");
      setNameEn("");
      setFatherNameBn("");
      setFatherNameEn("");
      setCompletionYear(new Date().getFullYear().toString());
      setDurationBn("");
      setDurationEn("");
      setAgeAtCompletion("");
      setCampus("boys");
      setTeacherNameBn("");
      setTeacherNameEn("");
      setDistrictBn("");
      setDistrictEn("");
      setAwardTitleBn("");
      setAwardTitleEn("");
      setImageUrl("");
      setIsFeatured(false);
      setOrderIndex(1);
      setIsActive(true);
    }
  }, [hafezItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !completionYear.trim()) {
      toast.error(t("হাফেজের নাম এবং সমাপ্তির বছর আবশ্যক", "Name and year are required"));
      return;
    }

    try {
      setLoading(true);
      await saveHafezRecord({
        id: hafezItem?.id,
        name_bn: nameBn.trim(),
        name_en: nameEn.trim() || nameBn.trim(),
        father_name_bn: fatherNameBn.trim() || undefined,
        father_name_en: fatherNameEn.trim() || fatherNameBn.trim() || undefined,
        completion_year: completionYear.trim(),
        duration_bn: durationBn.trim() || undefined,
        duration_en: durationEn.trim() || durationBn.trim() || undefined,
        age_at_completion: ageAtCompletion.trim() || undefined,
        campus,
        teacher_name_bn: teacherNameBn.trim() || undefined,
        teacher_name_en: teacherNameEn.trim() || teacherNameBn.trim() || undefined,
        district_bn: districtBn.trim() || undefined,
        district_en: districtEn.trim() || districtBn.trim() || undefined,
        award_title_bn: awardTitleBn.trim() || undefined,
        award_title_en: awardTitleEn.trim() || awardTitleBn.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        is_featured: isFeatured,
        order_index: Number(orderIndex) || 1,
        is_active: isActive,
      });

      toast.success(
        hafezItem
          ? t("হাফেজ রেকর্ড সফলভাবে আপডেট হয়েছে", "Record updated successfully")
          : t("নতুন হাফেজ রেকর্ড যুক্ত হয়েছে", "Added to Wall of Huffaz")
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save hafez record error:", err);
      toast.error(t("সংরক্ষণ ব্যর্থ হয়েছে", "Failed to save record"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-bengali">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {hafezItem
              ? t("কৃতি হাফেজ তথ্য সম্পাদনা", "Edit Hafez Record")
              : t("নতুন হাফেজ যুক্ত করুন (Wall of Huffaz)", "Add to Wall of Huffaz")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs sm:text-sm">
          {/* Row 1: Name */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("হাফেজের নাম (বাংলা) *", "Name (BN) *")}
              </Label>
              <Input
                placeholder="যেমন: হাফেজ মোঃ তাওহীদুল ইসলাম"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("হাফেজের নাম (ইংরেজি)", "Name (EN)")}
              </Label>
              <Input
                placeholder="e.g. Hafez Md. Tawhidul Islam"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Father Name */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("পিতার নাম (বাংলা)", "Father's Name (BN)")}
              </Label>
              <Input
                placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                value={fatherNameBn}
                onChange={(e) => setFatherNameBn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("পিতার নাম (ইংরেজি)", "Father's Name (EN)")}
              </Label>
              <Input
                placeholder="e.g. Md. Rafiqul Islam"
                value={fatherNameEn}
                onChange={(e) => setFatherNameEn(e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Year & Campus */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("হিফজ সমাপন ব্যাচ / বছর *", "Completion Year *")}
              </Label>
              <Input
                placeholder="যেমন: 2025"
                value={completionYear}
                onChange={(e) => setCompletionYear(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ক্যাম্পাস শাখা *", "Campus Section *")}
              </Label>
              <Select
                value={campus}
                onValueChange={(val: any) => setCampus(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">{t("বালক শাখা (হাফেজ)", "Boys Section")}</SelectItem>
                  <SelectItem value="girls">{t("বালিকা শাখা (হাফেজা)", "Girls Section")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Duration & Age */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("হিফজ সমাপ্তিকাল (যেমন: ২ বছর ৪ মাস)", "Duration (e.g. 2 Years 4 Months)")}
              </Label>
              <Input
                placeholder="যেমন: ২ বছর ৪ মাস"
                value={durationBn}
                onChange={(e) => setDurationBn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("সমাপ্তির বয়স (যেমন: ১২ বছর)", "Age at Completion")}
              </Label>
              <Input
                placeholder="যেমন: ১২ বছর"
                value={ageAtCompletion}
                onChange={(e) => setAgeAtCompletion(e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Supervising Teacher & District */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("তত্ত্বাবধায়ক ওস্তাদ / শিক্ষক", "Supervising Teacher")}
              </Label>
              <Input
                placeholder="যেমন: হাফেজ আমানুল্লাহ"
                value={teacherNameBn}
                onChange={(e) => setTeacherNameBn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("জেলা / ঠিকানা", "District / Address")}
              </Label>
              <Input
                placeholder="যেমন: কাপাসিয়া, গাজীপুর"
                value={districtBn}
                onChange={(e) => setDistrictBn(e.target.value)}
              />
            </div>
          </div>

          {/* Row 6: Award / Honor Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("সম্মাননা পদবী / পুরস্কার (ঐচ্ছিক)", "Award / Honor Title")}
            </Label>
            <Input
              placeholder="যেমন: দস্তারবন্দী সম্মাননা পাগড়ী ও মুহতামিম স্বর্ণপদক"
              value={awardTitleBn}
              onChange={(e) => setAwardTitleBn(e.target.value)}
            />
          </div>

          {/* Row 7: Order & Image */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ছবির লিংক (ঐচ্ছিক)", "Image URL")}
              </Label>
              <Input
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ক্রম (Order Index)", "Order Index")}
              </Label>
              <Input
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">{t("শীর্ষ স্থান / গোল্ডেন মেডেলিস্ট (Featured)", "Featured Honoree")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("কার্ডে বিশেষ স্বর্ণালী স্টার ও ব্যাজ প্রদর্শিত হবে", "Shows a special golden star honor badge on the card")}
                </p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div>
                <Label className="text-sm font-semibold">{t("ওয়েবসাইটে প্রদর্শন (Active)", "Display on Website")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("বন্ধ রাখলে পাবলিক পেজে প্রদর্শিত হবে না", "Inactive items are hidden from public view")}
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save Hafez")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
