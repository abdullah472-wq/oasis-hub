import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import GuardianRegisterForm from "@/components/guardian-registration/GuardianRegisterForm";
import WaveDivider from "@/components/WaveDivider";

const GuardianRegisterPage = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <section className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-primary px-4 py-16 text-center">
        <div className="relative z-10 max-w-3xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2rem, 6vw, 3.25rem)" }}>
            {t("গার্ডিয়ান রেজিস্ট্রেশন", "Guardian Registration")}
          </motion.h1>
          <p className="mt-4 font-bengali text-base text-primary-foreground/85 md:text-lg">
            {t("নিজের তথ্য ও শিক্ষার্থীর তথ্য দিয়ে অ্যাকাউন্ট রেজিস্ট্রেশন করুন", "Register your account with guardian and student information")}
          </p>
        </div>
        <WaveDivider className="absolute bottom-0 left-0 right-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-4 py-2 font-bengali text-sm text-foreground transition-colors hover:bg-secondary">
              <ArrowLeft className="h-4 w-4" />
              {t("লগইন পেইজে ফিরে যান", "Back to login")}
            </Link>
          </div>

          {submitted ? (
            <div className="rounded-[32px] border border-emerald-200 bg-white p-10 text-center shadow-[0_24px_80px_-50px_rgba(16,24,40,0.35)]">
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-600" />
              <h2 className="font-bengali text-2xl font-semibold text-foreground">
                {t("রেজিস্ট্রেশন জমা হয়েছে", "Registration Submitted")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl font-bengali text-base text-muted-foreground">
                {t("আপনার রেজিস্ট্রেশন গ্রহণ করা হয়েছে। অ্যাডমিন অনুমোদনের পর আপনি লগইন করতে পারবেন।", "Your registration has been received. You will be able to log in after admin approval.")}
              </p>
              <div className="mt-6">
                <Link to="/admin" className="inline-flex rounded-2xl bg-primary px-5 py-3 font-bengali text-primary-foreground transition-opacity hover:opacity-90">
                  {t("লগইনে যান", "Go to Login")}
                </Link>
              </div>
            </div>
          ) : (
            <GuardianRegisterForm onSuccess={() => setSubmitted(true)} />
          )}
        </div>
      </section>
    </div>
  );
};

export default GuardianRegisterPage;
