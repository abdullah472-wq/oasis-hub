import { useState, useEffect } from "react";
import { Loader2, UserCheck, Phone, MapPin, GraduationCap, Building2, Shield, Calendar, DollarSign, Hash } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAdmission, type AdmissionForm, type AdmissionStatus, CLASS_NAME_OPTIONS } from "@/lib/admission";

interface AdmissionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  admission: AdmissionForm | null;
  onSuccess: () => void;
}

export const AdmissionEditDialog = ({
  isOpen,
  onClose,
  admission,
  onSuccess,
}: AdmissionEditDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<AdmissionForm>>({});

  useEffect(() => {
    if (admission) {
      setFormData({
        studentName: admission.studentName || "",
        studentNameBn: admission.studentNameBn || "",
        birthDate: admission.birthDate || "",
        gender: admission.gender || "male",
        religion: admission.religion || "Islam",
        fatherName: admission.fatherName || "",
        fatherNameBn: admission.fatherNameBn || "",
        fatherPhone: admission.fatherPhone || "",
        motherName: admission.motherName || "",
        motherNameBn: admission.motherNameBn || "",
        motherPhone: admission.motherPhone || "",
        presentAddressBn: admission.presentAddressBn || admission.presentAddress || "",
        permanentAddressBn: admission.permanentAddressBn || admission.permanentAddress || "",
        class: admission.class || "",
        campus: admission.campus || "",
        residencyType: admission.residencyType || "non-residential",
        status: admission.status || "pending",
        approvedStudentId: admission.approvedStudentId || "",
        approvedRoll: admission.approvedRoll || undefined,
        approvedClass: admission.approvedClass || admission.class || "",
        approvedSection: admission.approvedSection || "",
        approvedMonthlyFee: admission.approvedMonthlyFee || undefined,
        adminNotes: admission.adminNotes || "",
      });
    }
  }, [admission, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admission?.id) return;

    setLoading(true);
    try {
      await updateAdmission(admission.id, {
        ...formData,
        presentAddress: formData.presentAddressBn || "",
        permanentAddress: formData.permanentAddressBn || "",
      });
      toast.success(t("আবেদন সফলভাবে সংশোধন করা হয়েছে", "Application modified successfully"));
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update admission:", err);
      toast.error(t("আবেদন সংশোধন করতে সমস্যা হয়েছে", "Failed to update admission"));
    } finally {
      setLoading(false);
    }
  };

  if (!admission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="font-bengali text-xl font-bold text-foreground">
                {t("অনলাইন ভর্তি আবেদন সংশোধন ও পর্যালোচনা", "Modify & Review Admission Application")}
              </DialogTitle>
              <DialogDescription className="font-bengali text-xs text-muted-foreground mt-0.5">
                {t("ট্র্যাকিং আইডি:", "Tracking ID:")}{" "}
                <span className="font-mono font-bold text-primary">
                  {admission.trackingId || admission.id}
                </span>{" "}
                | {admission.studentNameBn || admission.studentName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Status & Official Assignment */}
          <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/20 p-4 space-y-4">
            <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bengali font-bold text-sm">
              <Shield className="h-4 w-4" />
              <span>{t("ভর্তি স্ট্যাটাস ও প্রাতিষ্ঠানিক নির্ধারণ", "Admission Status & Institutional Assignment")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("আবেদনের বর্তমান অবস্থা", "Application Status")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: AdmissionStatus) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="font-bengali rounded-xl bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-bengali">
                    <SelectItem value="pending">{t("অপেক্ষমাণ (Pending)", "Pending")}</SelectItem>
                    <SelectItem value="approved">{t("অনুমোদিত (Approved)", "Approved")}</SelectItem>
                    <SelectItem value="rejected">{t("বাতিল (Rejected)", "Rejected")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("স্টুডেন্ট আইডি (অনুমোদিত হলে)", "Student ID")}
                </Label>
                <Input
                  placeholder="যেমন: STD-2026-045"
                  value={formData.approvedStudentId}
                  onChange={(e) => setFormData({ ...formData, approvedStudentId: e.target.value })}
                  className="rounded-xl font-mono text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("রোল নম্বর (অনুমোদিত)", "Assigned Roll")}
                </Label>
                <Input
                  type="number"
                  placeholder="যেমন: 12"
                  value={formData.approvedRoll || ""}
                  onChange={(e) => setFormData({ ...formData, approvedRoll: e.target.value ? Number(e.target.value) : undefined })}
                  className="rounded-xl font-mono text-xs bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("নির্ধারিত শাখা / সেকশন", "Assigned Section")}
                </Label>
                <Input
                  placeholder="যেমন: আলিফ / ক শাখা"
                  value={formData.approvedSection}
                  onChange={(e) => setFormData({ ...formData, approvedSection: e.target.value })}
                  className="rounded-xl font-bengali text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("অনুমোদিত মাসিক টিউশন ফি (টাকা)", "Monthly Tuition Fee (BDT)")}
                </Label>
                <Input
                  type="number"
                  placeholder="যেমন: 2500"
                  value={formData.approvedMonthlyFee || ""}
                  onChange={(e) => setFormData({ ...formData, approvedMonthlyFee: e.target.value ? Number(e.target.value) : undefined })}
                  className="rounded-xl font-mono text-xs bg-background"
                />
              </div>
            </div>
          </div>

          {/* Student Basic Information */}
          <div className="space-y-3">
            <h4 className="font-bengali font-bold text-sm text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>{t("শিক্ষার্থীর প্রাথমিক তথ্য", "Student Basic Information")}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("শিক্ষার্থীর নাম (বাংলা)", "Student Name (Bangla)")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.studentNameBn}
                  onChange={(e) => setFormData({ ...formData, studentNameBn: e.target.value })}
                  className="rounded-xl font-bengali text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("Student Name (English)", "Student Name (English)")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("জন্ম তারিখ", "Date of Birth")}
                </Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("লিঙ্গ", "Gender")}
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger className="font-bengali rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-bengali">
                    <SelectItem value="male">{t("ছাত্র (Male)", "Male")}</SelectItem>
                    <SelectItem value="female">{t("ছাত্রী (Female)", "Female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("ধর্ম", "Religion")}
                </Label>
                <Input
                  value={formData.religion}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="rounded-xl font-bengali text-xs"
                />
              </div>
            </div>
          </div>

          {/* Academic Track: Class, Campus, Residency */}
          <div className="space-y-3">
            <h4 className="font-bengali font-bold text-sm text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{t("আবেদিত শ্রেণি ও শাখা নির্ধারণ", "Applied Class & Campus")}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("শ্রেণি / বিভাগ", "Class / Track")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.class}
                  onValueChange={(val) => setFormData({ ...formData, class: val })}
                >
                  <SelectTrigger className="font-bengali rounded-xl text-xs">
                    <SelectValue placeholder={t("শ্রেণি নির্বাচন করুন", "Select class")} />
                  </SelectTrigger>
                  <SelectContent className="font-bengali">
                    {CLASS_NAME_OPTIONS.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                    <SelectItem value="নূরানী ও নাজেরা">{t("নূরানী ও নাজেরা", "Nurani & Nazara")}</SelectItem>
                    <SelectItem value="হিফজুল কুরআন">{t("হিফজুল কুরআন", "Hifzul Quran")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("ক্যাম্পাস শাখা", "Campus Branch")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.campus}
                  onValueChange={(val) => setFormData({ ...formData, campus: val })}
                >
                  <SelectTrigger className="font-bengali rounded-xl text-xs">
                    <SelectValue placeholder={t("ক্যাম্পাস নির্বাচন করুন", "Select campus")} />
                  </SelectTrigger>
                  <SelectContent className="font-bengali">
                    <SelectItem value="বালক শাখা (কাপাসিয়া বাজার)">{t("বালক শাখা (কাপাসিয়া বাজার)", "Boys Campus (Kapasia Bazar)")}</SelectItem>
                    <SelectItem value="বালিকা শাখা (বাঁশতলা মোড়)">{t("বালিকা শাখা (বাঁশতলা মোড়)", "Girls Campus (Bashtola More)")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("আবাসিক সুবিধা ধরন", "Residency Type")}
                </Label>
                <Select
                  value={formData.residencyType || "non-residential"}
                  onValueChange={(val: any) => setFormData({ ...formData, residencyType: val })}
                >
                  <SelectTrigger className="font-bengali rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-bengali">
                    <SelectItem value="non-residential">{t("অনাবাসিক (Non-residential)", "Non-residential")}</SelectItem>
                    <SelectItem value="residential">{t("আবাসিক (Residential)", "Residential")}</SelectItem>
                    <SelectItem value="day-care">{t("ডে-কেয়ার (Day-care)", "Day-care")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parents & Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bengali font-bold text-sm text-foreground flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>{t("পিতা-মাতার তথ্য ও যোগাযোগ", "Parents Information & Contacts")}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("পিতার নাম (বাংলা)", "Father Name (Bangla)")}
                </Label>
                <Input
                  value={formData.fatherNameBn}
                  onChange={(e) => setFormData({ ...formData, fatherNameBn: e.target.value })}
                  className="rounded-xl font-bengali text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("Father Name (English)", "Father Name (English)")}
                </Label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("পিতার মোবাইল নম্বর", "Father Mobile Number")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.fatherPhone}
                  onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                  className="rounded-xl font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("মাতার নাম (বাংলা)", "Mother Name (Bangla)")}
                </Label>
                <Input
                  value={formData.motherNameBn}
                  onChange={(e) => setFormData({ ...formData, motherNameBn: e.target.value })}
                  className="rounded-xl font-bengali text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("Mother Name (English)", "Mother Name (English)")}
                </Label>
                <Input
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("মাতার মোবাইল নম্বর", "Mother Mobile Number")}
                </Label>
                <Input
                  value={formData.motherPhone}
                  onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <h4 className="font-bengali font-bold text-sm text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{t("ঠিকানা", "Address Information")}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("বর্তমান ঠিকানা", "Present Address")}
                </Label>
                <Textarea
                  rows={2}
                  value={formData.presentAddressBn}
                  onChange={(e) => setFormData({ ...formData, presentAddressBn: e.target.value })}
                  className="rounded-xl font-bengali text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bengali text-xs font-semibold">
                  {t("স্থায়ী ঠিকানা", "Permanent Address")}
                </Label>
                <Textarea
                  rows={2}
                  value={formData.permanentAddressBn}
                  onChange={(e) => setFormData({ ...formData, permanentAddressBn: e.target.value })}
                  className="rounded-xl font-bengali text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="space-y-1.5">
            <Label className="font-bengali text-xs font-semibold text-muted-foreground">
              {t("অ্যাডমিন অভ্যন্তরীণ মন্তব্য ও পরীক্ষার নোট (Internal Notes)", "Admin Internal Notes")}
            </Label>
            <Textarea
              rows={2}
              placeholder="ভর্তি পরীক্ষা বা সাক্ষাৎকারের ফলাফল, বিশেষ বিবেচনা বা ফি ছাড়ের বিবরণ..."
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              className="rounded-xl font-bengali text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl font-bengali text-xs"
            >
              {t("বাতিল", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl font-bengali text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("পরিবর্তন সংরক্ষণ করুন", "Save Modifications")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
