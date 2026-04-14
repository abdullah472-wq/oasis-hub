import { Loader2, ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { registerGuardian } from "@/lib/guardianRegistration";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GuardianInfoSection from "./GuardianInfoSection";
import StudentInfoSection from "./StudentInfoSection";
import { guardianRegisterSchema, type GuardianRegisterValues } from "./schema";

interface GuardianRegisterFormProps {
  onSuccess: () => void;
}

const defaultValues: GuardianRegisterValues = {
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
};

const guardianStepFields: Array<keyof GuardianRegisterValues> = [
  "fullName",
  "phone",
  "email",
  "password",
  "gender",
  "relationship",
  "address",
  "nid",
];

const GuardianRegisterForm = ({ onSuccess }: GuardianRegisterFormProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const form = useForm<GuardianRegisterValues>({
    resolver: zodResolver(guardianRegisterSchema),
    defaultValues,
  });

  const handleNext = async () => {
    const valid = await form.trigger(guardianStepFields);
    if (valid) setStep(2);
  };

  const onSubmit = async (values: GuardianRegisterValues) => {
    try {
      await registerGuardian(values);
      onSuccess();
      form.reset(defaultValues);
      setStep(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      if (message === "student-already-linked") {
        setStep(2);
        form.setError("studentId", {
          type: "manual",
          message: t("এই শিক্ষার্থী আইডির সাথে আগে থেকেই একটি গার্ডিয়ান যুক্ত আছে", "A guardian is already linked to this student ID"),
        });
        return;
      }

      if (message.includes("auth/email-already-in-use")) {
        setStep(1);
        form.setError("email", {
          type: "manual",
          message: t("এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে", "An account already exists for this email"),
        });
        return;
      }

      if (message === "permission-denied") {
        form.setError("root", {
          type: "manual",
          message: t(
            "রেজিস্ট্রেশন এখনো Firebase rules এ অনুমোদিত নয়। Firestore rules আপডেট করতে হবে।",
            "Guardian registration is currently blocked by Firestore rules. Update your Firestore rules first.",
          ),
        });
        return;
      }

      form.setError("root", {
        type: "manual",
        message: t("রেজিস্ট্রেশন জমা হয়নি। আবার চেষ্টা করুন।", "Registration failed. Please try again."),
      });
    }
  };

  const steps = [
    {
      key: 1,
      titleBn: "গার্ডিয়ানের তথ্য",
      titleEn: "Guardian Information",
      helperBn: "অ্যাকাউন্টের তথ্য দিন",
      helperEn: "Account details",
      icon: ShieldCheck,
    },
    {
      key: 2,
      titleBn: "শিক্ষার্থীর তথ্য",
      titleEn: "Student Information",
      helperBn: "শিক্ষার্থীর পরিচিতি দিন",
      helperEn: "Student details",
      icon: CheckCircle2,
    },
  ] as const;

  return (
    <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_24px_80px_-50px_rgba(16,24,40,0.35)]">
      <CardContent className="space-y-8 p-6 md:p-8">
        <div className="flex items-center gap-3 rounded-3xl bg-primary/5 px-4 py-4 text-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bengali text-sm font-semibold uppercase tracking-[0.2em]">{t("গার্ডিয়ান পোর্টাল", "Guardian Portal")}</p>
            <p className="font-bengali text-sm text-muted-foreground">{t("অনুমোদনের পর আপনি লগইন করে আপনার সন্তানের তথ্য দেখতে পারবেন", "After approval, you will be able to log in and view your student's information")}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((item) => {
            const Icon = item.icon;
            const active = step === item.key;
            const done = step > item.key;

            return (
              <div
                key={item.key}
                className={`rounded-3xl border px-4 py-4 transition-all ${
                  active
                    ? "border-primary bg-primary/8 shadow-sm"
                    : done
                      ? "border-emerald-200 bg-emerald-50/80"
                      : "border-border/60 bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-600 text-white" : "bg-white text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bengali text-base font-semibold text-foreground">{t(item.titleBn, item.titleEn)}</p>
                    <p className="font-bengali text-xs text-muted-foreground">{t(item.helperBn, item.helperEn)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 ? <GuardianInfoSection control={form.control} /> : <StudentInfoSection control={form.control} />}

            {form.formState.errors.root?.message && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bengali text-sm text-red-700">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              {step === 2 ? (
                <Button type="button" variant="outline" className="h-12 rounded-2xl font-bengali text-base" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("পূর্বের ধাপ", "Previous Step")}
                </Button>
              ) : (
                <div />
              )}

              {step === 1 ? (
                <Button type="button" className="h-12 rounded-2xl font-bengali text-base" onClick={() => void handleNext()}>
                  {t("পরের ধাপ", "Next Step")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="h-12 rounded-2xl font-bengali text-base" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("রেজিস্ট্রেশন জমা দিন", "Submit Registration")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GuardianRegisterForm;
