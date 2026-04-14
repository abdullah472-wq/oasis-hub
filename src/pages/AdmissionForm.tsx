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
const defaultInterviewReferences = Array.from({ length: 3 }, () => ({
  name: "",
  relation: "",
  mobile: "",
}));

const fieldClass =
  "w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15";

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
  <section className="rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-[0_22px_70px_-52px_rgba(14,116,144,0.38)] md:p-7">
    <div className="mb-5 flex items-start gap-4 border-b border-sky-100 pb-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h2 className="font-bengali text-xl font-bold text-slate-900 md:text-[1.65rem]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
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
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
    residencyType: "" as "" | "residential" | "non-residential" | "day-care",
    interviewReferences: defaultInterviewReferences,
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
    <div className="bg-gradient-to-b from-sky-50 via-white to-white">
      <section className="relative overflow-hidden px-4 pb-20 pt-10 md:pb-24 md:pt-14">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] border border-sky-200 bg-white shadow-[0_30px_90px_-55px_rgba(14,116,144,0.45)]">
            <div className="h-4 bg-gradient-to-r from-sky-700 via-sky-500 to-sky-700" />
            <div className="grid gap-8 p-6 md:grid-cols-[auto_1fr] md:p-8">
              <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-sky-100 bg-sky-50/70 px-6 py-5 text-center">
                <img src="/site-logo.png" alt="Site logo" className="h-20 w-20 object-contain md:h-24 md:w-24" />
                <span className="mt-4 rounded-full border border-sky-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  {t("অনলাইন ভর্তি", "Online admission")}
                </span>
              </div>

              <div>
                <h1 className="font-bengali text-3xl font-bold leading-[1.24] text-slate-900 md:text-5xl">
                  {t("আননূর শিক্ষা পরিবার ভর্তি আবেদন ফর্ম", "Annoor Education Family Admission Form")}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                  {t(
                    "প্রিন্ট করা অফিসিয়াল ভর্তি ফর্মের ধরন অনুসরণ করে প্রয়োজনীয় তথ্য পূরণ করুন। আপনার আবেদন জমা হওয়ার পর মাদ্রাসা অফিস তথ্য যাচাই করে যোগাযোগ করবে।",
                    "Complete the required details following our official admission form structure. After submission, the madrasa office will verify the information and contact you.",
                  )}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">{t("ফরম ধাপ", "Form stage")}</p>
                    <p className="mt-1 font-bengali text-lg font-bold text-slate-900">{t("প্রাথমিক আবেদন", "Initial application")}</p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">{t("আবেদনের অগ্রগতি", "Progress")}</p>
                    <p className="mt-1 font-display text-2xl font-bold text-slate-900">{completionPercent}%</p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">{t("আসন ধরন", "Seat type")}</p>
                    <p className="mt-1 font-bengali text-lg font-bold text-slate-900">
                      {formData.residencyType === "residential"
                        ? t("আবাসিক", "Residential")
                        : formData.residencyType === "non-residential"
                          ? t("অনাবাসিক", "Non-residential")
                          : formData.residencyType === "day-care"
                            ? t("ডে-কেয়ার", "Day care")
                            : t("আবাসিক / অনাবাসিক / ডে-কেয়ার", "Residential / Non-residential / Day care")}
                    </p>
                  </div>
                </div>
              </div>
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
            className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_22px_70px_-55px_rgba(14,116,144,0.28)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{t("ফর্ম সম্পন্ন", "Form progress")}</p>
                <h2 className="font-display text-3xl font-bold text-slate-900">{completionPercent}%</h2>
              </div>
              <GraduationCap className="h-8 w-8 text-sky-700" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-sky-100">
              <div className="h-full rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${completionPercent}%` }} />
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
              className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_22px_70px_-55px_rgba(14,116,144,0.28)]"
            >
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                <span>{item}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_330px]">
          <div className="space-y-6">
            <section className="rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-[0_22px_70px_-52px_rgba(14,116,144,0.38)] md:p-7">
              <div className="mb-5 flex items-start gap-4 border-b border-sky-100 pb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bengali text-xl font-bold text-slate-900 md:text-[1.65rem]">ভর্তিচ্ছু শিক্ষার্থীদের অঙ্গীকারনামা</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    প্রতিষ্ঠানটির শৃঙ্খলা ও শিক্ষার পরিবেশ রক্ষায় প্রতিটি শিক্ষার্থীকে নিচের বিষয়গুলো মেনে চলার অঙ্গীকার করতে হবে:
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 md:p-5">
                  <h3 className="font-bengali text-base font-semibold text-slate-900">শৃঙ্খলা ও আচরণনীতি</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {[
                      "প্রতিষ্ঠানের বর্তমান ও ভবিষ্যতে গৃহিত সকল নিয়ম-কানুন অক্ষরে অক্ষরে পালন করা।",
                      "পড়াশোনা ব্যতীত অন্য কোনো অনর্থক কাজে সময় ব্যয় না করা এবং আদর্শ পরিপন্থী কোনো বই-পুস্তক বা ম্যাগাজিন না পড়া।",
                      "সর্বদা সুন্নতি তরীকা মোতাবেক জীবন যাপন, নির্ধারিত পোশাক পরিধান এবং উন্নত চারিত্রিক গুণাবলী অর্জন করা।",
                      "নিজেকে এবং নিজের চারপাশ সর্বদা পরিষ্কার-পরিচ্ছন্ন রাখা।",
                      "শিক্ষক ও মুরুব্বিদের সম্মান করা এবং সহপাঠী ও কর্মচারীদের সাথে সদাচরণ করা।",
                      "প্রতিষ্ঠানের আসবাবপত্র ও সম্পদ আমানত হিসেবে ব্যবহার করা এবং অপচয় (পানি, বিদ্যুৎ) রোধে সচেষ্ট থাকা।",
                      "অধ্যয়নরত অবস্থায় মোবাইল ফোন, টেপ রেকর্ডার বা এ জাতীয় কোনো ইলেকট্রনিক ডিভাইস ব্যবহার না করা।",
                      "কর্তৃপক্ষের অনুমতি ব্যতিরেকে মাদরাসার সীমানার বাইরে না যাওয়া।",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-white p-4 md:p-5">
                  <h3 className="font-bengali text-base font-semibold text-slate-900">অভিভাবকদের জন্য প্রয়োজনীয় জ্ঞাতব্য ও শর্তাবলী</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    আপনার সন্তানকে সুশিক্ষিত ও আদর্শ মানুষ হিসেবে গড়ে তুলতে আমাদের সাথে আপনাদের সহযোগিতা একান্ত কাম্য:
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {[
                      "মাদরাসা কর্তৃপক্ষ কর্তৃক অর্পিত সকল দায়িত্ব এবং নিয়ম-কানুন মেনে চলা।",
                      "সন্তানের পড়াশোনার নিয়মিত উন্নতি বা অবনতির খোঁজ নেওয়া।",
                      "কোনো নিয়ম ভঙ্গ বা অপ্রীতিকর ঘটনার ক্ষেত্রে কর্তৃপক্ষের নেওয়া চূড়ান্ত সিদ্ধান্ত মেনে নেওয়া।",
                      "প্রতি ইংরেজি মাসের ৫ তারিখের মধ্যে মাদরাসার বেতন ও অন্যান্য খরচ পরিশোধ করা।",
                      "ছুটি শেষে নির্দিষ্ট সময়ে সন্তানকে মাদরাসায় পৌঁছে দেওয়া এবং নিজ দায়িত্বে নিয়ে যাওয়া।",
                      "সপ্তাহে একদিন (নির্ধারিত দিনে) নির্দিষ্ট সময়ের বাইরে মোবাইলে সন্তানের সাথে কথা না বলা।",
                      "মাদরাসা থেকে অনুমতি ছাড়া কেউ পালিয়ে গেলে বা হারিয়ে গেলে তার দায়ভার অভিভাবকের।",
                      "কোনো শিক্ষার্থী মাসে মাত্র ৭ দিন অবস্থান করলেও পুরো মাসের বেতন প্রদান করতে হবে এবং ভর্তির সময় জমা দেওয়া টাকা ফেরতযোগ্য নয়।",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 md:p-5">
                  <h3 className="font-bengali text-base font-semibold text-slate-900">আমাদের একান্ত পালনীয় নীতিসমূহ</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {[
                      "প্রতিষ্ঠানের আইন ও শৃঙ্খলা সর্বদা মেনে চলা।",
                      "সচ্চরিত্রতা, ভদ্রতা ও পরিচ্ছন্নতা বজায় রাখা।",
                      "ইলমে দ্বীনের চর্চাকেই জীবনের একমাত্র লক্ষ্য বানানো।",
                      "ইজতিমায়ী আমলের পাবন্দি করা এবং সুন্নাত মোতাবেক জীবন যাপন করা।",
                      "শিক্ষক ও মুরুব্বিদের প্রতি যথাযথ সম্মান প্রদর্শন করা।",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-4 md:flex-row md:items-center md:justify-between">
                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={rulesAccepted}
                      onChange={(e) => setRulesAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-sky-300 text-sky-700 focus:ring-sky-500/40"
                    />
                    আমি উপরোক্ত শর্তাবলী পড়েছি এবং সম্মত আছি।
                  </label>
                  <button
                    type="button"
                    className="rounded-xl bg-sky-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!rulesAccepted}
                    onClick={() => {
                      setShowForm(true);
                      setTimeout(() => {
                        document.getElementById("admission-form")?.scrollIntoView({ behavior: "smooth" });
                      }, 80);
                    }}
                  >
                    পরের ধাপে যান
                  </button>
                </div>
              </div>
            </section>

            {showForm && (
              <form id="admission-form" onSubmit={handleSubmit} className="space-y-6">
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
                <Field label={t("আবাসিক / অনাবাসিক / ডে-কেয়ার", "Residential / Non-residential / Day care")} required>
                  <select
                    value={formData.residencyType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        residencyType: e.target.value as "" | "residential" | "non-residential" | "day-care",
                      })
                    }
                    className={fieldClass}
                    required
                  >
                    <option value="">{t("নির্বাচন করুন", "Select one")}</option>
                    <option value="residential">{t("আবাসিক", "Residential")}</option>
                    <option value="non-residential">{t("অনাবাসিক", "Non-residential")}</option>
                    <option value="day-care">{t("ডে-কেয়ার", "Day care")}</option>
                  </select>
                </Field>
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-dashed border-sky-300 bg-sky-50/70 p-4">
                <Field label={t("শিক্ষার্থীর ছবি", "Student photo")}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {photo ? photo.name : t("ছবি আপলোড করুন", "Upload an image")}
                        </p>
                        <p>{t("JPG, PNG বা মোবাইল ক্যামেরার ছবি দেওয়া যাবে", "JPG, PNG, or camera photo is allowed")}</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                      className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sky-700 file:px-4 file:py-2 file:font-medium file:text-white md:w-auto"
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

              <div className="mt-6 rounded-[1.25rem] border border-sky-100 bg-sky-50/45 p-4 md:p-5">
                <div className="mb-4">
                  <h3 className="font-bengali text-lg font-bold text-slate-900">{t("সাক্ষাৎপ্রার্থী / রেফারেন্স", "Interview candidate / reference")}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {t(
                      "এই অংশটি ঐচ্ছিক। প্রয়োজন হলে ৩ জনের নাম, সম্পর্ক ও মোবাইল নম্বর দিন।",
                      "This section is optional. Add up to 3 names, relations, and mobile numbers if needed.",
                    )}
                  </p>
                </div>

                <div className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 md:grid-cols-[1.3fr_0.9fr_1fr]">
                  <span>{t("নাম", "Name")}</span>
                  <span>{t("সম্পর্ক", "Relation")}</span>
                  <span>{t("মোবাইল", "Mobile")}</span>
                </div>

                <div className="mt-3 space-y-3">
                  {formData.interviewReferences.map((reference, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-[1.3fr_0.9fr_1fr]">
                      <input
                        type="text"
                        value={reference.name}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            interviewReferences: current.interviewReferences.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: e.target.value } : item,
                            ),
                          }))
                        }
                        className={fieldClass}
                        placeholder={t("পূর্ণ নাম", "Full name")}
                      />
                      <input
                        type="text"
                        value={reference.relation}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            interviewReferences: current.interviewReferences.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, relation: e.target.value } : item,
                            ),
                          }))
                        }
                        className={fieldClass}
                        placeholder={t("সম্পর্ক", "Relation")}
                      />
                      <input
                        type="tel"
                        value={reference.mobile}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            interviewReferences: current.interviewReferences.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, mobile: e.target.value } : item,
                            ),
                          }))
                        }
                        className={fieldClass}
                        placeholder={t("মোবাইল নম্বর", "Mobile number")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-[1.35rem] bg-sky-700 px-6 py-4 font-bengali text-base font-semibold text-white shadow-[0_18px_45px_-22px_rgba(3,105,161,0.72)] transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {t("ভর্তি আবেদন জমা দিন", "Submit admission application")}
            </motion.button>
              </form>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-[0_24px_80px_-52px_rgba(14,116,144,0.32)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bengali text-lg font-bold text-slate-900">{t("আবেদনের নির্দেশনা", "Application guide")}</h2>
                  <p className="text-sm text-slate-500">{t("জমা দেওয়ার আগে একবার মিলিয়ে নিন", "Review before submitting")}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                {[
                  t("ইংরেজি নাম ও মোবাইল নম্বর অবশ্যই সঠিকভাবে লিখুন।", "Please enter the English name and mobile numbers accurately."),
                  t("ভর্তি নিশ্চিতকরণের জন্য অফিস থেকে কল আসতে পারে।", "The office may call for admission confirmation."),
                  t("ছবি ছাড়া আবেদন করা যাবে, তবে ছবি দিলে যাচাই সহজ হবে।", "Applications can be submitted without a photo, but adding one helps verification."),
                  t("আবাসিক, অনাবাসিক বা ডে-কেয়ার অপশন এখান থেকেই নির্বাচন করুন।", "Select residential, non-residential, or day-care from the form itself."),
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-[0_24px_80px_-52px_rgba(14,116,144,0.32)]">
              <h2 className="font-bengali text-lg font-bold text-slate-900">{t("যা প্রয়োজন হতে পারে", "What you may need")}</h2>
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
                  {
                    icon: ShieldCheck,
                    title: t("অফিস যাচাই", "Office verification"),
                    text: t("সিরিয়াল ও অফিস অনুমোদন পরে নির্ধারিত হবে", "Serial and office approval will be assigned later"),
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-sky-100 bg-sky-50/45 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600">{item.text}</p>
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
