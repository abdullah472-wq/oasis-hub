import { useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  GUARDIAN_CLASS_OPTIONS,
  GUARDIAN_SECTION_OPTIONS,
  normalizeGuardianStudentId,
  registerGuardian,
  type GuardianRegistrationInput,
  type GuardianRelationship,
} from "@/lib/guardianRegistration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const defaultForm: GuardianRegistrationInput = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  gender: "male",
  relationship: "Father",
  address: "",
  nid: "",
  studentId: "",
  studentName: "",
  className: "",
  section: "",
  monthlyFee: undefined,
};

const Field = ({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <label className="space-y-2">
    <span className="font-bengali text-sm font-medium text-foreground">
      {label}
      {required ? <span className="ml-1 text-destructive">*</span> : null}
    </span>
    {children}
  </label>
);

const GuardianRegisterPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState<GuardianRegistrationInput>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateForm = <K extends keyof GuardianRegistrationInput>(key: K, value: GuardianRegistrationInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateGender = (gender: GuardianRegistrationInput["gender"]) => {
    setForm((current) => ({
      ...current,
      gender,
      studentId: normalizeGuardianStudentId(current.studentId, gender),
    }));
  };

  const updateStudentId = (studentId: string) => {
    setForm((current) => ({
      ...current,
      studentId: normalizeGuardianStudentId(studentId, current.gender),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await registerGuardian({
        ...form,
        studentId: normalizeGuardianStudentId(form.studentId, form.gender),
      });
      setSubmitted(true);
      setForm(defaultForm);
    } catch (submissionError) {
      const code =
        typeof submissionError === "object" && submissionError !== null && "code" in submissionError
          ? String((submissionError as { code?: string }).code)
          : "";
      const message = submissionError instanceof Error ? submissionError.message : "";

      if (message === "student-id-required") {
        setError(t("সঠিক স্টুডেন্ট আইডি দিন", "Please enter a valid student ID"));
      } else if (message === "student-already-linked") {
        setError(t("এই স্টুডেন্ট আইডির সাথে আগে থেকেই একটি গার্ডিয়ান যুক্ত আছে", "This student ID is already linked to a guardian"));
      } else if (message === "permission-denied" || code === "permission-denied") {
        setError(
          t(
            "রেজিস্ট্রেশন এই মুহূর্তে সম্পন্ন হচ্ছে না। Firebase / Firestore permission settings চেক করতে হবে",
            "Registration cannot be completed right now. Firebase / Firestore permission settings need to be checked",
          ),
        );
      } else if (code === "auth/email-already-in-use") {
        setError(t("এই ইমেইল দিয়ে আগেই একটি অ্যাকাউন্ট আছে", "An account already exists with this email"));
      } else if (code === "auth/weak-password") {
        setError(t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে", "Password must be at least 6 characters"));
      } else if (code === "auth/invalid-email") {
        setError(t("সঠিক ইমেইল ঠিকানা দিন", "Please enter a valid email address"));
      } else if (code === "auth/operation-not-allowed") {
        setError(
          t(
            "Firebase Authentication-এ Email/Password sign-in চালু করা নেই",
            "Email/Password sign-in is not enabled in Firebase Authentication",
          ),
        );
      } else {
        setError(t("গার্ডিয়ান রেজিস্ট্রেশন সম্পন্ন করা যায়নি", "Could not complete guardian registration"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_34%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-4 py-2 font-bengali text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("হোমে ফিরে যান", "Back to home")}
          </Link>

          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardContent className="space-y-6 p-8 text-center md:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <h1 className="font-bengali text-3xl font-bold text-foreground md:text-4xl">
                  {t("রেজিস্ট্রেশন সফলভাবে জমা হয়েছে", "Registration submitted successfully")}
                </h1>
                <p className="font-bengali text-sm leading-7 text-muted-foreground md:text-base">
                  {t(
                    "আপনার তথ্য জমা হয়েছে। অ্যাডমিন অনুমোদনের পর গার্ডিয়ান অ্যাকাউন্ট active হবে।",
                    "Your information has been submitted. The guardian account will be activated after admin approval.",
                  )}
                </p>
                <p className="font-bengali text-sm leading-7 text-muted-foreground md:text-base">
                  {t(
                    "অফিশিয়াল অ্যাপ ডাউনলোড করে রাখুন। অনুমোদন সম্পন্ন হলে সেখান থেকে লগইন করতে পারবেন।",
                    "Keep the official app installed. Once approved, you will be able to log in there.",
                  )}
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild className="rounded-2xl font-bengali">
                  <Link to="/apk?registered=1">
                    <Download className="mr-2 h-4 w-4" />
                    {t("অফিশিয়াল অ্যাপ ডাউনলোড", "Download official app")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl font-bengali">
                  <Link to="/guardian-register">{t("আরেকটি রেজিস্ট্রেশন করুন", "Submit another registration")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_34%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-4 py-2 font-bengali text-sm text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("হোমে ফিরে যান", "Back to home")}
        </Link>

        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardContent className="space-y-6 p-8 md:p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-primary/10 text-primary">
                <UserPlus className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <h1 className="font-bengali text-3xl font-bold text-foreground md:text-4xl">
                  {t("গার্ডিয়ান রেজিস্ট্রেশন", "Guardian Registration")}
                </h1>
                <p className="font-bengali text-sm leading-7 text-muted-foreground md:text-base">
                  {t(
                    "নিজের তথ্য ও শিক্ষার্থীর তথ্য দিয়ে গার্ডিয়ান অ্যাকাউন্টের জন্য আবেদন করুন।",
                    "Apply for a guardian account using your information and the student's information.",
                  )}
                </p>
              </div>

              <div className="rounded-[28px] border border-primary/10 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bengali text-base font-semibold text-foreground">
                      {t("অনুমোদনের পর অ্যাকাউন্ট active হবে", "The account becomes active after approval")}
                    </p>
                    <p className="font-bengali text-sm leading-6 text-muted-foreground">
                      {t(
                        "রেজিস্ট্রেশন জমা হওয়ার পর অ্যাডমিন যাচাই করবেন। অনুমোদনের আগে লগইন করা যাবে না।",
                        "After submission, the admin will verify the request. You will not be able to log in before approval.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
            <CardHeader>
              <CardTitle className="font-bengali text-2xl">{t("রেজিস্ট্রেশন ফর্ম", "Registration Form")}</CardTitle>
              <CardDescription className="font-bengali">
                {t("স্টার চিহ্নিত ঘরগুলো পূরণ করা আবশ্যক", "Fields marked with a star are required")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("গার্ডিয়ানের নাম", "Guardian name")} required>
                    <Input value={form.fullName} onChange={(event) => updateForm("fullName", event.target.value)} className="rounded-2xl" required />
                  </Field>
                  <Field label={t("মোবাইল নম্বর", "Phone number")} required>
                    <Input value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="rounded-2xl" required />
                  </Field>
                  <Field label={t("মাসিক ফি", "Monthly fee")}>
                    <Input
                      type="number"
                      min="0"
                      value={form.monthlyFee ?? ""}
                      onChange={(event) => updateForm("monthlyFee", event.target.value ? Number(event.target.value) : undefined)}
                      className="rounded-2xl"
                      placeholder="1500"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("ইমেইল", "Email")} required>
                    <Input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} className="rounded-2xl" required />
                  </Field>
                  <Field label={t("পাসওয়ার্ড", "Password")} required>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(event) => updateForm("password", event.target.value)}
                      className="rounded-2xl"
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("লিঙ্গ", "Gender")} required>
                    <select
                      value={form.gender}
                      onChange={(event) => updateGender(event.target.value as GuardianRegistrationInput["gender"])}
                      className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                      required
                    >
                      <option value="male">{t("ছেলে", "Boy")}</option>
                      <option value="female">{t("মেয়ে", "Girl")}</option>
                    </select>
                  </Field>
                  <Field label={t("সম্পর্ক", "Relationship")} required>
                    <select
                      value={form.relationship}
                      onChange={(event) => updateForm("relationship", event.target.value as GuardianRelationship)}
                      className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                      required
                    >
                      <option value="Father">{t("পিতা", "Father")}</option>
                      <option value="Mother">{t("মাতা", "Mother")}</option>
                      <option value="Guardian">{t("অভিভাবক", "Guardian")}</option>
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("স্টুডেন্ট আইডি", "Student ID")} required>
                    <Input
                      value={form.studentId}
                      onChange={(event) => updateStudentId(event.target.value)}
                      className="rounded-2xl"
                      required
                    />
                  </Field>
                  <Field label={t("শিক্ষার্থীর নাম", "Student name")} required>
                    <Input value={form.studentName} onChange={(event) => updateForm("studentName", event.target.value)} className="rounded-2xl" required />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("শ্রেণি", "Class")} required>
                    <select
                      value={form.className}
                      onChange={(event) => updateForm("className", event.target.value)}
                      className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                      required
                    >
                      <option value="">{t("শ্রেণি নির্বাচন করুন", "Select class")}</option>
                      {GUARDIAN_CLASS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t("সেকশন", "Section")} required>
                    <select
                      value={form.section}
                      onChange={(event) => updateForm("section", event.target.value)}
                      className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                      required
                    >
                      <option value="">{t("সেকশন নির্বাচন করুন", "Select section")}</option>
                      {GUARDIAN_SECTION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("ঠিকানা", "Address")}>
                    <Input value={form.address} onChange={(event) => updateForm("address", event.target.value)} className="rounded-2xl" />
                  </Field>
                  <Field label={t("এনআইডি", "NID")}>
                    <Input value={form.nid} onChange={(event) => updateForm("nid", event.target.value)} className="rounded-2xl" />
                  </Field>
                </div>

                {error ? <p className="font-bengali text-sm text-destructive">{error}</p> : null}

                <Button type="submit" className="h-11 w-full rounded-2xl font-bengali" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("জমা হচ্ছে...", "Submitting...")}
                    </>
                  ) : (
                    t("রেজিস্ট্রেশন জমা দিন", "Submit registration")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuardianRegisterPage;
