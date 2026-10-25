import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CreditCard, Hash, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  saveFacultyMember,
  generateTeacherId,
  type FacultyMember,
  type FacultyRoleCategory,
  type CampusType,
} from "@/lib/faculty";

interface FacultyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  facultyItem?: FacultyMember | null;
}

export const FacultyDialog = ({
  isOpen,
  onClose,
  onSuccess,
  facultyItem,
}: FacultyDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nid, setNid] = useState("");
  const [joiningYear, setJoiningYear] = useState(new Date().getFullYear().toString());
  const [teacherId, setTeacherId] = useState("");
  const [designationBn, setDesignationBn] = useState("");
  const [designationEn, setDesignationEn] = useState("");
  const [category, setCategory] = useState<FacultyRoleCategory>("teacher");
  const [campus, setCampus] = useState<CampusType>("boys");
  const [subjectBn, setSubjectBn] = useState("");
  const [subjectEn, setSubjectEn] = useState("");
  const [qualificationBn, setQualificationBn] = useState("");
  const [qualificationEn, setQualificationEn] = useState("");
  const [experienceBn, setExperienceBn] = useState("");
  const [experienceEn, setExperienceEn] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (facultyItem) {
      setNameBn(facultyItem.name_bn || "");
      setNameEn(facultyItem.name_en || "");
      setNid(facultyItem.nid || "");
      setJoiningYear(
        facultyItem.joining_year ||
          (facultyItem.created_at
            ? new Date(facultyItem.created_at).getFullYear().toString()
            : new Date().getFullYear().toString())
      );
      setTeacherId(
        facultyItem.teacher_id ||
          generateTeacherId(facultyItem.joining_year, facultyItem.nid)
      );
      setDesignationBn(facultyItem.designation_bn || "");
      setDesignationEn(facultyItem.designation_en || "");
      setCategory(facultyItem.category || "teacher");
      setCampus(facultyItem.campus || "boys");
      setSubjectBn(facultyItem.subject_bn || "");
      setSubjectEn(facultyItem.subject_en || "");
      setQualificationBn(facultyItem.qualification_bn || "");
      setQualificationEn(facultyItem.qualification_en || "");
      setExperienceBn(facultyItem.experience_bn || "");
      setExperienceEn(facultyItem.experience_en || "");
      setPhone(facultyItem.phone || "");
      setEmail(facultyItem.email || "");
      setImageUrl(facultyItem.image_url || "");
      setOrderIndex(facultyItem.order_index || 1);
      setIsActive(facultyItem.is_active !== false);
    } else {
      setNameBn("");
      setNameEn("");
      setNid("");
      setJoiningYear(new Date().getFullYear().toString());
      setTeacherId("");
      setDesignationBn("");
      setDesignationEn("");
      setCategory("teacher");
      setCampus("boys");
      setSubjectBn("");
      setSubjectEn("");
      setQualificationBn("");
      setQualificationEn("");
      setExperienceBn("");
      setExperienceEn("");
      setPhone("");
      setEmail("");
      setImageUrl("");
      setOrderIndex(1);
      setIsActive(true);
    }
  }, [facultyItem, isOpen]);

  // Keep teacher ID synchronized when NID or joining year changes
  useEffect(() => {
    if (nid || joiningYear) {
      setTeacherId(generateTeacherId(joiningYear, nid));
    }
  }, [nid, joiningYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !designationBn.trim()) {
      toast.error(t("নাম এবং পদবি আবশ্যক", "Name and designation are required"));
      return;
    }

    const cleanNid = nid.replace(/\D/g, "").trim();
    const computedTeacherId = teacherId.trim() || generateTeacherId(joiningYear, cleanNid);

    try {
      setLoading(true);
      await saveFacultyMember({
        id: facultyItem?.id,
        teacher_id: computedTeacherId,
        nid: cleanNid || undefined,
        joining_year: joiningYear.trim() || undefined,
        name_bn: nameBn.trim(),
        name_en: nameEn.trim() || nameBn.trim(),
        designation_bn: designationBn.trim(),
        designation_en: designationEn.trim() || designationBn.trim(),
        category,
        campus,
        subject_bn: subjectBn.trim() || undefined,
        subject_en: subjectEn.trim() || subjectBn.trim() || undefined,
        qualification_bn: qualificationBn.trim() || undefined,
        qualification_en: qualificationEn.trim() || qualificationBn.trim() || undefined,
        experience_bn: experienceBn.trim() || undefined,
        experience_en: experienceEn.trim() || experienceBn.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        order_index: Number(orderIndex) || 1,
        is_active: isActive,
      });

      toast.success(
        facultyItem
          ? t("সদস্য তথ্য আপডেট হয়েছে", "Member updated successfully")
          : t("নতুন সদস্য যুক্ত হয়েছে", "New member added successfully")
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save faculty error:", err);
      toast.error(t("তথ্য সংরক্ষণ ব্যর্থ হয়েছে", "Failed to save member"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bengali text-xl">
            {facultyItem
              ? t("শিক্ষক/সদস্য তথ্য সম্পাদনা", "Edit Faculty / Member")
              : t("নতুন শিক্ষক বা সদস্য যুক্ত করুন", "Add Faculty / Member")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 font-bengali text-xs sm:text-sm">
          {/* Row 1: Name */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("নাম (বাংলা) *", "Name (BN) *")}
              </Label>
              <Input
                placeholder="যেমন: মাওলানা মোঃ আব্দুল করিম"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("নাম (ইংরেজি)", "Name (EN)")}
              </Label>
              <Input
                placeholder="e.g. Mawlana Md. Abdul Karim"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
          </div>

          {/* Teacher ID & NID Details Card */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="font-semibold text-xs text-foreground">
                  {t("জাতীয় পরিচয়পত্র ও শিক্ষক আইডি (Teacher ID)", "NID & Teacher ID Generator")}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-primary bg-primary/15 border border-primary/30 px-2.5 py-0.5 rounded-lg shadow-xs">
                {generateTeacherId(joiningYear, nid)}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* NID Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>{t("জাতীয় পরিচয়পত্র নম্বর (NID) *", "National ID (NID) *")}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {nid ? `${nid.length} ডিজিট` : t("১০/১৩/১৭ সংখ্যা", "10/13/17 digits")}
                  </span>
                </Label>
                <Input
                  placeholder="যেমন: 1235468452"
                  value={nid}
                  onChange={(e) => setNid(e.target.value.replace(/\D/g, ""))}
                  required
                  className="font-mono"
                />
              </div>

              {/* Joining Year Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {t("যোগদানের বছর (Joining Year) *", "Joining Year *")}
                </Label>
                <Input
                  type="number"
                  min="2000"
                  max="2099"
                  placeholder="যেমন: 2024"
                  value={joiningYear}
                  onChange={(e) => setJoiningYear(e.target.value)}
                  required
                  className="font-mono"
                />
              </div>
            </div>

            {/* Formula explanation & Computed Teacher ID Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl bg-background/80 border border-border/70 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">
                  {t("শিক্ষক আইডি:", "Teacher ID:")}
                </span>
                <span className="font-mono font-bold text-primary tracking-wide text-sm">
                  {generateTeacherId(joiningYear, nid)}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                (A: Annoor • T: Tahfiz • {joiningYear ? String(joiningYear).slice(-2) : "YY"}: যোগদানের সাল • NID)
              </span>
            </div>
          </div>

          {/* Row 2: Designation */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("পদবি (বাংলা) *", "Designation (BN) *")}
              </Label>
              <Input
                placeholder="যেমন: সিনিয়র শিক্ষক / প্রধান হিফজ প্রশিক্ষক"
                value={designationBn}
                onChange={(e) => setDesignationBn(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("পদবি (ইংরেজি)", "Designation (EN)")}
              </Label>
              <Input
                placeholder="e.g. Senior Teacher / Head of Hifz"
                value={designationEn}
                onChange={(e) => setDesignationEn(e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Category & Campus */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ক্যাটাগরি *", "Category *")}
              </Label>
              <Select
                value={category}
                onValueChange={(val: any) => setCategory(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">{t("শিক্ষকমণ্ডলী", "Teachers & Instructors")}</SelectItem>
                  <SelectItem value="management">{t("পরিচালনা পরিষদ", "Governing Body / Management")}</SelectItem>
                  <SelectItem value="staff">{t("কর্মকর্তা ও কর্মচারী", "Administrative & Support Staff")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ক্যাম্পাস *", "Campus *")}
              </Label>
              <Select
                value={campus}
                onValueChange={(val: any) => setCampus(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">{t("মাদরাসা ক্যাম্পাস", "Madrasa Campus")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Subject / Specialization */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("বিষয় / দায়িত্ব (বাংলা)", "Subject / Role (BN)")}
              </Label>
              <Input
                placeholder="যেমন: হিফজুল কুরআন ও তাজবীদ / গণিত"
                value={subjectBn}
                onChange={(e) => setSubjectBn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("বিষয় / দায়িত্ব (ইংরেজি)", "Subject / Role (EN)")}
              </Label>
              <Input
                placeholder="e.g. Quran Hifz & Tajweed / Mathematics"
                value={subjectEn}
                onChange={(e) => setSubjectEn(e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Qualification */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("শিক্ষাগত যোগ্যতা (বাংলা)", "Qualification (BN)")}
              </Label>
              <Input
                placeholder="যেমন: দাওরায়ে হাদিস ও এম.এ (আরবি)"
                value={qualificationBn}
                onChange={(e) => setQualificationBn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("শিক্ষাগত যোগ্যতা (ইংরেজি)", "Qualification (EN)")}
              </Label>
              <Input
                placeholder="e.g. Dawra-e-Hadith & M.A. in Arabic"
                value={qualificationEn}
                onChange={(e) => setQualificationEn(e.target.value)}
              />
            </div>
          </div>

          {/* Row 6: Experience & Order */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("অভিজ্ঞতা (যেমন: ৮ বছর)", "Experience (e.g. 8 Years)")}
              </Label>
              <Input
                placeholder="যেমন: ৮+ বছর পাঠদান"
                value={experienceBn}
                onChange={(e) => setExperienceBn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ডিসপ্লে ক্রম (Order)", "Order Index")}
              </Label>
              <Input
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Row 7: Contact Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ফোন নম্বর (ঐচ্ছিক)", "Phone (Optional)")}
              </Label>
              <Input
                placeholder="যেমন: 01820-811511"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("ইমেইল (ঐচ্ছিক)", "Email (Optional)")}
              </Label>
              <Input
                type="email"
                placeholder="e.g. teacher@annoor.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Image URL & Active Switch */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("ছবির লিংক / Photo URL (ঐচ্ছিক)", "Image URL (Optional)")}
            </Label>
            <Input
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-border p-4 bg-muted/30 flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">{t("ওয়েবসাইটে প্রদর্শন (Active)", "Display on Website")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("বন্ধ রাখলে সাধারণ দর্শকরা প্রোফাইল দেখতে পাবেন না", "Inactive members are hidden from public view")}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save Member")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
