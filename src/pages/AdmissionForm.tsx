import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { submitAdmission } from "@/lib/admission";
import { uploadImage } from "@/lib/upload";

const AdmissionFormPage = () => {
  const { t, lang } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    studentNameBn: "",
    birthDate: "",
    gender: "",
    religion: "",
    fatherName: "",
    fatherNameBn: "",
    fatherPhone: "",
    motherName: "",
    motherNameBn: "",
    motherPhone: "",
    presentAddress: "",
    presentAddressBn: "",
    permanentAddress: "",
    permanentAddressBn: "",
    class: "",
    campus: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = "";
      if (photo) {
        imageUrl = await uploadImage(photo);
      }
      await submitAdmission({
        ...formData,
        imageUrl,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit:", error);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div>
        <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
          <motion.h1 {...{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>
            {t("ভর্তি আবেদন", "Admission Form")}
          </motion.h1>
          <WaveDivider className="absolute bottom-0" />
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-md text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-institutional p-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-bengali text-2xl font-bold mb-2">
                {t("আবেদন জমা হয়েছে!", "Application Submitted!")}
              </h2>
              <p className="font-bengali text-muted-foreground">
                {t("আমরা আপনার সাথে যোগাযোগ করব।", "We will contact you soon.")}
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>
          {t("ভর্তি আবেদন", "Admission Form")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <form onSubmit={handleSubmit} className="card-institutional p-8 space-y-8">
            <div>
              <h3 className="font-bengali text-lg font-bold mb-4 border-b pb-2">
                {t("শিক্ষার্থীর তথ্য", "Student Information")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("নাম (English)", "Name (English)")} *</label>
                  <input type="text" value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("নাম (বাংলা)", "Name (Bangla)")}</label>
                  <input type="text" value={formData.studentNameBn} onChange={(e) => setFormData({ ...formData, studentNameBn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("জন্ম তারিখ", "Birth Date")} *</label>
                  <input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("লিঙ্গ", "Gender")} *</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required>
                    <option value="">{t("নির্বাচন করুন", "Select")}</option>
                    <option value="male">{t("ছাত্র", "Male")}</option>
                    <option value="female">{t("ছাত্রী", "Female")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("ধর্ম", "Religion")} *</label>
                  <select value={formData.religion} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required>
                    <option value="">{t("নির্বাচন করুন", "Select")}</option>
                    <option value="islam">{t("ইসলাম", "Islam")}</option>
                    <option value="hindu">{t("হিন্দু", "Hindu")}</option>
                    <option value="christian">{t("খ্রিস্টান", "Christian")}</option>
                    <option value="other">{t("অন্যান্য", "Other")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("ছবি", "Photo")}</label>
                  <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bengali text-lg font-bold mb-4 border-b pb-2">
                {t("ভর্তি তথ্য", "Admission Information")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("শ্রেণি", "Class")} *</label>
                  <select value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required>
                    <option value="">{t("নির্বাচন করুন", "Select")}</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={`Class ${i + 1}`}>
                        {lang === "bn" ? `${i + 1}শ` : `Class ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("ক্যাম্পাস", "Campus")} *</label>
                  <select value={formData.campus} onChange={(e) => setFormData({ ...formData, campus: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required>
                    <option value="">{t("নির্বাচন করুন", "Select")}</option>
                    <option value="boys">{t("বালক ক্যাম্পাস", "Boys Campus")}</option>
                    <option value="girls">{t("বালিকা ক্যাম্পাস", "Girls Campus")}</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bengali text-lg font-bold mb-4 border-b pb-2">
                {t("পিতার তথ্য", "Father's Information")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("নাম (English)", "Name (English)")} *</label>
                  <input type="text" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("নাম (বাংলা)", "Name (Bangla)")}</label>
                  <input type="text" value={formData.fatherNameBn} onChange={(e) => setFormData({ ...formData, fatherNameBn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("ফোন", "Phone")} *</label>
                  <input type="tel" value={formData.fatherPhone} onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bengali text-lg font-bold mb-4 border-b pb-2">
                {t("মাতার তথ্য", "Mother's Information")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("নাম (English)", "Name (English)")} *</label>
                  <input type="text" value={formData.motherName} onChange={(e) => setFormData({ ...formData, motherName: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("নাম (বাংলা)", "Name (Bangla)")}</label>
                  <input type="text" value={formData.motherNameBn} onChange={(e) => setFormData({ ...formData, motherNameBn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("ফোন", "Phone")}</label>
                  <input type="tel" value={formData.motherPhone} onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bengali text-lg font-bold mb-4 border-b pb-2">
                {t("ঠিকানা", "Address")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("বর্তমান ঠিকানা", "Present Address")} *</label>
                  <textarea value={formData.presentAddress} onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" rows={2} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("স্থায়ী ঠিকানা", "Permanent Address")} *</label>
                  <textarea value={formData.permanentAddress} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" rows={2} required />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full squishy-button flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {t("জমা দিন", "Submit Application")}
            </motion.button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AdmissionFormPage;
