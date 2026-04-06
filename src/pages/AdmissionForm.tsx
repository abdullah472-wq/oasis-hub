import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Clock3,
  GraduationCap,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { submitAdmission } from "@/lib/admission";
import { uploadImage } from "@/lib/upload";

const classOptions = Array.from({ length: 10 }, (_, index) => index + 1);

const fieldClass =
  "w-full rounded-2xl border border-border/80 bg-background/90 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const textAreaClass = `${fieldClass} min-h-[104px] resize-none`;

const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] md:p-8">
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h2 className="font-bengali text-xl font-bold text-foreground md:text-2xl">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-foreground">
      {label} {required ? <span className="text-destructive">*</span> : null}
    </span>
    {children}
  </label>
);

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

  const completionCount = useMemo(() => {
    const trackedValues = [
      formData.studentName,
      formData.birthDate,
      formData.gender,
      formData.religion,
      formData.class,
      formData.campus,
      formData.fatherName,
      formData.fatherPhone,
      formData.motherName,
      formData.presentAddress,
      formData.permanentAddress,
    ];

    return trackedValues.filter(Boolean).length;
  }, [formData]);

  const completionPercent = Math.round((completionCount / 11) * 100);

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
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-transparent">
        <section className="relative overflow-hidden bg-primary px-4 py-20 text-primary-foreground md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/16">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h1 className="font-bengali text-3xl font-bold md:text-5xl">
                {t("ভর্তি আবেদন সফলভাবে জমা হয়েছে", "Admission request submitted successfully")}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-primary-foreground/85 md:text-lg">
                {t(
                  "আপনার তথ্য আমরা গ্রহণ করেছি। যাচাই সম্পন্ন হলে মাদ্রাসা অফিস থেকে ফোন বা মেসেজের মাধ্যমে যোগাযোগ করা হবে।",
                  "We have received your application. Our office will contact you by phone or message after verification.",
                )}
              </p>
            </motion.div>
          </div>
          <WaveDivider className="absolute bottom-0 left-0" />
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              {
                icon: Clock3,
                title: t("রিভিউ চলবে", "Under review"),
                description: t("ভর্তি অফিস আপনার তথ্য যাচাই করবে।", "The admission office will verify your information."),
              },
              {
                icon: Phone,
                title: t("যোগাযোগ করা হবে", "We will contact you"),
                description: t("প্রয়োজনে সাক্ষাৎকার বা অতিরিক্ত কাগজপত্র চাওয়া হতে পারে।", "Interview or additional documents may be requested if needed."),
              },
              {
                icon: ShieldCheck,
                title: t("স্ট্যাটাস পেন্ডিং", "Status is pending"),
                description: t("চূড়ান্ত অনুমোদনের আগে আবেদনটি অপেক্ষমাণ থাকবে।", "The application remains pending until final approval."),
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 text-center shadow-[0_22px_70px_-50px_rgba(15,23,42,0.6)]">
                <item.icon className="mx-auto mb-4 h-8 w-8 text-primary" />
                <h2 className="font-bengali text-lg font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <section className="relative overflow-hidden bg-primary px-4 pb-24 pt-16 text-primary-foreground md:pb-28 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              {t("অনলাইন ভর্তি", "Online admission")}
            </span>
            <h1 className="mt-5 font-bengali text-4xl font-bold leading-tight md:text-6xl">
              {t("নতুন শিক্ষার্থীর ভর্তি আবেদন অনলাইনে জমা দিন", "Submit a new student admission application online")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
              {t(
                "প্রয়োজনীয় তথ্য পূরণ করে ছবি সংযুক্ত করুন। আপনার আবেদন জমা হওয়ার পর মাদ্রাসা অফিস যাচাই করে দ্রুত যোগাযোগ করবে।",
                "Complete the required information and attach a photo. After submission, the madrasa office will review the application and contact you promptly.",
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                t("শিক্ষার্থী তথ্য", "Student details"),
                t("অভিভাবক তথ্য", "Guardian details"),
                t("ক্যাম্পাস নির্বাচন", "Campus selection"),
              ].map((tag) => (
                <span key={tag} className="rounded-full bg-white/14 px-4 py-2 text-sm text-white">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
        <WaveDivider className="absolute bottom-0 left-0" />
      </section>

      <section className="px-4 py-14 md:py-16">
        <div className="mx-auto mb-8 grid max-w-6xl gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[1.75rem] border border-border/70 bg-card/95 p-5 shadow-[0_22px_70px_-50px_rgba(15,23,42,0.6)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("ফর্ম সম্পন্ন", "Form progress")}</p>
                <h2 className="font-display text-3xl font-bold text-foreground">{completionPercent}%</h2>
              </div>
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-primary/10">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${completionPercent}%` }} />
            </div>
          </motion.div>

          {[
            t("শিক্ষার্থী ও শ্রেণির তথ্য দিন", "Provide student and class information"),
            t("পিতা-মাতার মোবাইল নম্বর সঠিক দিন", "Enter accurate parent phone numbers"),
            t("প্রয়োজনে শিক্ষার্থীর ছবি যুক্ত করুন", "Attach the student photo if available"),
          ].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.04 }}
              className="rounded-[1.75rem] border border-border/70 bg-card/95 p-5 shadow-[0_22px_70px_-50px_rgba(15,23,42,0.6)]"
            >
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <SectionCard
              icon={GraduationCap}
              title={t("শিক্ষার্থীর তথ্য", "Student information")}
              description={t(
                "শিক্ষার্থীর মৌলিক পরিচয়, জন্মতারিখ, শ্রেণি ও ক্যাম্পাস নির্বাচন করুন।",
                "Provide the student identity, birth date, class, and preferred campus.",
              )}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={t("নাম (ইংরেজি)", "Name (English)")} required>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </Field>
                <Field label={t("নাম (বাংলা)", "Name (Bangla)")}>
                  <input
                    type="text"
                    value={formData.studentNameBn}
                    onChange={(e) => setFormData({ ...formData, studentNameBn: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label={t("জন্ম তারিখ", "Birth date")} required>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </Field>
                <Field label={t("লিঙ্গ", "Gender")} required>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className={fieldClass}
                    required
                  >
                    <option value="">{t("নির্বাচন করুন", "Select one")}</option>
                    <option value="male">{t("ছাত্র", "Male")}</option>
                    <option value="female">{t("ছাত্রী", "Female")}</option>
                  </select>
                </Field>
                <Field label={t("ধর্ম", "Religion")} required>
                  <select
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className={fieldClass}
                    required
                  >
                    <option value="">{t("নির্বাচন করুন", "Select one")}</option>
                    <option value="islam">{t("ইসলাম", "Islam")}</option>
                    <option value="hindu">{t("হিন্দু", "Hindu")}</option>
                    <option value="christian">{t("খ্রিস্টান", "Christian")}</option>
                    <option value="other">{t("অন্যান্য", "Other")}</option>
                  </select>
                </Field>
                <Field label={t("শ্রেণি", "Class")} required>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className={fieldClass}
                    required
                  >
                    <option value="">{t("নির্বাচন করুন", "Select one")}</option>
                    {classOptions.map((value) => (
                      <option key={value} value={`Class ${value}`}>
                        {lang === "bn" ? `${value}ম শ্রেণি` : `Class ${value}`}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("ক্যাম্পাস", "Campus")} required>
                  <select
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                    className={fieldClass}
                    required
                  >
                    <option value="">{t("নির্বাচন করুন", "Select one")}</option>
                    <option value="boys">{t("বালক ক্যাম্পাস", "Boys campus")}</option>
                    <option value="girls">{t("বালিকা ক্যাম্পাস", "Girls campus")}</option>
                  </select>
                </Field>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-dashed border-primary/30 bg-primary/5 p-4">
                <Field label={t("শিক্ষার্থীর ছবি", "Student photo")}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {photo ? photo.name : t("ছবি আপলোড করুন", "Upload an image")}
                        </p>
                        <p>{t("JPG, PNG বা মোবাইল ক্যামেরার ছবি দেওয়া যাবে", "JPG, PNG, or camera photo is allowed")}</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                      className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground md:w-auto"
                    />
                  </div>
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              icon={Phone}
              title={t("অভিভাবকের তথ্য", "Guardian information")}
              description={t(
                "পিতা ও মাতার নাম, মোবাইল নম্বর এবং বাংলায় নাম থাকলে সেটিও যুক্ত করুন।",
                "Add father and mother names, phone numbers, and Bangla names where available.",
              )}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={t("পিতার নাম (ইংরেজি)", "Father's name (English)")} required>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </Field>
                <Field label={t("পিতার নাম (বাংলা)", "Father's name (Bangla)")}>
                  <input
                    type="text"
                    value={formData.fatherNameBn}
                    onChange={(e) => setFormData({ ...formData, fatherNameBn: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label={t("পিতার মোবাইল নম্বর", "Father's phone")} required>
                  <input
                    type="tel"
                    value={formData.fatherPhone}
                    onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </Field>
                <div className="hidden md:block" />
                <Field label={t("মাতার নাম (ইংরেজি)", "Mother's name (English)")} required>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </Field>
                <Field label={t("মাতার নাম (বাংলা)", "Mother's name (Bangla)")}>
                  <input
                    type="text"
                    value={formData.motherNameBn}
                    onChange={(e) => setFormData({ ...formData, motherNameBn: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label={t("মাতার মোবাইল নম্বর", "Mother's phone")}>
                  <input
                    type="tel"
                    value={formData.motherPhone}
                    onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              icon={MapPin}
              title={t("ঠিকানা", "Address")}
              description={t(
                "বর্তমান ও স্থায়ী ঠিকানা উল্লেখ করুন। চাইলে বাংলায় আলাদা করে লিখতে পারবেন।",
                "Provide present and permanent addresses. Bangla versions can also be added if needed.",
              )}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={t("বর্তমান ঠিকানা", "Present address")} required>
                  <textarea
                    value={formData.presentAddress}
                    onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                    className={textAreaClass}
                    required
                  />
                </Field>
                <Field label={t("বর্তমান ঠিকানা (বাংলা)", "Present address (Bangla)")}>
                  <textarea
                    value={formData.presentAddressBn}
                    onChange={(e) => setFormData({ ...formData, presentAddressBn: e.target.value })}
                    className={textAreaClass}
                  />
                </Field>
                <Field label={t("স্থায়ী ঠিকানা", "Permanent address")} required>
                  <textarea
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    className={textAreaClass}
                    required
                  />
                </Field>
                <Field label={t("স্থায়ী ঠিকানা (বাংলা)", "Permanent address (Bangla)")}>
                  <textarea
                    value={formData.permanentAddressBn}
                    onChange={(e) => setFormData({ ...formData, permanentAddressBn: e.target.value })}
                    className={textAreaClass}
                  />
                </Field>
              </div>
            </SectionCard>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-[1.6rem] bg-primary px-6 py-4 font-bengali text-base font-semibold text-primary-foreground shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.75)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {t("ভর্তি আবেদন জমা দিন", "Submit admission application")}
            </motion.button>
          </form>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bengali text-lg font-bold text-foreground">{t("আবেদনের নির্দেশনা", "Application guide")}</h2>
                  <p className="text-sm text-muted-foreground">{t("জমা দেওয়ার আগে একবার মিলিয়ে নিন", "Review before submitting")}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground">
                {[
                  t("ইংরেজি নাম ও মোবাইল নম্বর অবশ্যই সঠিকভাবে লিখুন।", "Please enter the English name and mobile numbers accurately."),
                  t("ভর্তি নিশ্চিতকরণের জন্য অফিস থেকে কল আসতে পারে।", "The office may call for admission confirmation."),
                  t("ছবি ছাড়া আবেদন করা যাবে, তবে ছবি দিলে যাচাই সহজ হবে।", "Applications can be submitted without a photo, but adding one helps verification."),
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
              <h2 className="font-bengali text-lg font-bold text-foreground">{t("যা প্রয়োজন হতে পারে", "What you may need")}</h2>
              <div className="mt-4 grid gap-3">
                {[
                  {
                    icon: GraduationCap,
                    title: t("শিক্ষার্থীর তথ্য", "Student information"),
                    text: t("জন্মতারিখ, শ্রেণি, ক্যাম্পাস", "Birth date, class, campus"),
                  },
                  {
                    icon: Phone,
                    title: t("অভিভাবকের যোগাযোগ", "Guardian contact"),
                    text: t("পিতা-মাতার মোবাইল নম্বর", "Father and mother phone numbers"),
                  },
                  {
                    icon: ImagePlus,
                    title: t("ছবি", "Photo"),
                    text: t("সাম্প্রতিক একটি ছবি", "A recent student photo"),
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default AdmissionFormPage;
