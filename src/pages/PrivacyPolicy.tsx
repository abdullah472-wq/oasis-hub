import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  FileText,
  UserCheck,
  Server,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/lib/siteSettings";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";

export const PrivacyPolicy = () => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const institutionName = t(
    settings.institution_name_bn || "আননূর তাহফিজুল কুরআন মাদরাসা",
    settings.institution_name_en || "Annoor Tahfizul Quran Madrasa"
  );

  const policySections = useMemo(
    () => [
      {
        icon: Lock,
        titleBn: "১. তথ্যের পরিধি ও সম্মতি",
        titleEn: "1. Scope & Consent",
        contentBn: `${institutionName}-এর ওয়েবসাইটে আপনাকে স্বাগতম। এই গোপনীয়তা নীতিমালায় বর্ণনা করা হয়েছে আমরা কীভাবে শিক্ষার্থী, অভিভাবক ও দর্শনার্থীদের ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, প্রক্রিয়াকরণ ও সংরক্ষণ করি। আমাদের ওয়েবসাইট এবং অনলাইন ভর্তি ফরম ব্যবহারের মাধ্যমে আপনি এই নীতিমালার শর্তাবলীতে সম্মতি প্রদান করছেন।`,
        contentEn: `Welcome to the official website of ${institutionName}. This Privacy Policy describes how we collect, use, process, and safeguard the personal data of students, parents, and visitors. By using our website and online admission services, you consent to the practices described in this policy.`,
      },
      {
        icon: FileText,
        titleBn: "২. সংগৃহীত তথ্যের ধরন",
        titleEn: "2. Information We Collect",
        contentBn: `আমরা মূলত শিক্ষা ও প্রাতিষ্ঠানিক কার্যক্রম পরিচালনার স্বার্থে প্রয়োজনীয় তথ্য সংগ্রহ করে থাকি:
• শিক্ষার্থী সংক্রান্ত তথ্য: শিক্ষার্থীর পূর্ণ নাম, জন্ম তারিখ, জাতীয় পরিচয়পত্র/জন্মনিবন্ধন নম্বর, রক্তের গ্রুপ, পূর্ববর্তী শ্রেণি ও ছবি।
• অভিভাবক সংক্রান্ত তথ্য: পিতা ও মাতার নাম, পেশা, সচল মোবাইল নম্বর, ইমেইল, বর্তমান ও স্থায়ী ঠিকানা।
• ব্যাংকিং ও লেনদেন তথ্য: অনলাইন ভর্তি ফি বা অনুদান প্রদানের ট্রানজেকশন আইডি (TxnID) এবং পেমেন্ট মেথড রেফারেন্স। আমরা কোনো ব্যাংক পাসওয়ার্ড বা ওটিপি (OTP) সংরক্ষণ করি না।
• ডিজিটাল লগ: সাইট ব্যবহারের সময় ব্রাউজার টাইপ, আইপি অ্যাড্রেস এবং ট্রাফিক অ্যানালিটিক্স।`,
        contentEn: `We collect essential information strictly required for academic administration and enrollment:
• Student Data: Full name, date of birth, birth certificate/NID number, blood group, prior school records, and photographs.
• Guardian Data: Father's/mother's name, occupation, active mobile number, email, and residential addresses.
• Transaction References: Transaction IDs (TxnID) and payment methods for admission fees or donations. We NEVER store banking passwords, PINs, or OTPs.
• Technical Logs: Standard browser type, IP addresses, and aggregated traffic analytics.`,
      },
      {
        icon: UserCheck,
        titleBn: "৩. তথ্যের ব্যবহার ও উদ্দেশ্য",
        titleEn: "3. How We Use Collected Data",
        contentBn: `সংগৃহীত তথ্যাবলী নিম্নলিখিত সুনির্দিষ্ট উদ্দেশ্যে ব্যবহৃত হয়:
১. অনলাইন ভর্তি আবেদন যাচাই-বাছাই ও নিশ্চিতকরণ।
২. শিক্ষার্থীর একাডেমিক ডাটাবেজ, রোল নম্বর ও আইডি কার্ড প্রস্তুতকরণ।
৩. পরীক্ষার ফলাফল, জরুরি নোটিশ এবং মাদরাসার আপডেট অভিভাবকদের কাছে এসএমএস (SMS) বা ফোন কলের মাধ্যমে পাঠানো।
৪. শিক্ষাবোর্ড (যেমন: বেফাক, নূরানী বোর্ড) এবং সরকারি রেগুলেশন অনুযায়ী সনদ প্রদান।`,
        contentEn: `The collected information is used solely for the following legitimate purposes:
1. Verification and processing of online student admission applications.
2. Generating student profiles, class rosters, and academic identity cards.
3. Transmitting exam results, emergency notices, and attendance alerts via SMS or phone calls.
4. Compliance with academic board accreditation and official certification procedures.`,
      },
      {
        icon: EyeOff,
        titleBn: "৪. তথ্যের গোপনীয়তা ও তৃতীয় পক্ষের নীতি",
        titleEn: "4. Information Disclosure & Third-Party Policy",
        contentBn: `আমরা কোনো অবস্থাতেই শিক্ষার্থী বা অভিভাবকদের ব্যক্তিগত তথ্য বাণিজ্যিক উদ্দেশ্যে কোনো তৃতীয় পক্ষের কাছে বিক্রয়, ভাড়া বা বিনিময় করি না। শুধুমাত্র আইনগত বাধ্যবাধকতা, শিক্ষা মন্ত্রণালয় বা বোর্ডের সরকারি নির্দেশিকা এবং প্রতিষ্ঠানের কারিগরি সেবাদাতা (যেমন: এসএমএস গেটওয়ে বা ক্লাউড সার্ভার) ছাড়া কারো কাছে তথ্য প্রকাশ করা হয় না।`,
        contentEn: `We strictly do NOT sell, rent, trade, or monetize student or guardian information to any external commercial entity. Information is only shared when mandated by law, government education authorities, or trusted technical partners (such as transactional SMS gateways and cloud databases) under strict confidentiality agreements.`,
      },
      {
        icon: Server,
        titleBn: "৫. ডাটা নিরাপত্তা ব্যবস্থা",
        titleEn: "5. Data Security & Storage",
        contentBn: `আমরা আধুনিক এনক্রিপশন (SSL/TLS), সুরক্ষিত ডেটাবেজ অ্যাক্সেস কন্ট্রোল এবং প্রশাসনিক নিরাপত্তা প্রটোকল ব্যবহার করি যাতে আপনার তথ্যের অননুমোদিত অ্যাক্সেস, পরিবর্তন বা বিনষ্টকরণ রোধ করা যায়। শুধুমাত্র অনুমোদিত প্রশাসনিক কর্মকর্তাগণ নির্দিষ্ট কাজের জন্য তথ্য দেখার অনুমতি পান।`,
        contentEn: `We employ modern encryption standards (SSL/TLS), secure role-based access controls, and administrative safeguards to prevent unauthorized access, alteration, or data breaches. Only authorized institutional staff have access to sensitive records on a need-to-know basis.`,
      },
      {
        icon: ShieldCheck,
        titleBn: "৬. অভিভাবকের অধিকার ও তথ্য সংশোধন",
        titleEn: "6. Parental Rights & Information Updates",
        contentBn: `অভিভাবকগণ যেকোনো সময় তাদের সন্তানের তথ্যের নির্ভুলতা যাচাই করতে পারেন এবং ঠিকানা বা ফোন নম্বরের পরিবর্তন হলে মাদরাসা অফিসে যোগাযোগ করে তা সংশোধন বা হালনাগাদ করার অধিকার রাখেন।`,
        contentEn: `Guardians have the right to review the accuracy of their child's records and request corrections or updates to contact details and residential addresses by contacting the administration office.`,
      },
    ],
    [institutionName]
  );

  return (
    <div className="bg-background min-h-screen">
      {/* ================= HERO HEADER ================= */}
      <section className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-primary pt-12 pb-16 md:min-h-[320px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_60%)]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <motion.div {...springIn} className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md border border-white/20 shadow-md mb-4">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>{t("তথ্য সুরক্ষা ও প্রাইভেসি পলিসি", "Data Protection & Privacy Policy")}</span>
          </div>

          <h1
            className="font-bengali font-bold text-white tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
          >
            {t("গোপনীয়তা নীতিমালা", "Privacy Policy")}
          </h1>

          <p className="mt-3 font-bengali text-sm md:text-base text-emerald-100/90 leading-relaxed max-w-2xl mx-auto">
            {t(
              `${institutionName}-এর শিক্ষার্থী ও অভিভাবকদের ব্যক্তিগত তথ্যের নিরাপত্তা এবং সুরক্ষা সংক্রান্ত প্রাতিষ্ঠানিক অঙ্গীকার`,
              `Institutional commitment to data protection and privacy for students and guardians at ${institutionName}`
            )}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-200/80">
            <Calendar className="h-3.5 w-3.5" />
            <span>{t("সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬", "Last Updated: October 2026")}</span>
          </div>
        </motion.div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        {/* Important Notice Callout */}
        <motion.div
          {...springIn}
          className="rounded-2xl border border-accent/30 bg-accent/5 p-6 md:p-7 shadow-xs mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-slate-950 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bengali font-bold text-base md:text-lg text-foreground">
              {t("আমাদের মূল প্রতিশ্রুতি", "Our Core Commitment")}
            </h3>
            <p className="font-bengali text-xs md:text-sm text-muted-foreground leading-relaxed">
              {t(
                "আমরা শিক্ষার্থীদের ব্যক্তিগত তথ্যকে আমানত হিসেবে গণ্য করি। দ্বীনি মূল্যবোধ ও নৈতিক দায়িত্ববোধ থেকে তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিত করতে আমরা প্রতিশ্রুতিবদ্ধ।",
                "We hold all student and guardian information as a sacred trust (Amanah). Upholding Islamic ethics and accountability, we ensure strict confidentiality and security."
              )}
            </p>
          </div>
        </motion.div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {policySections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <motion.article
                key={sec.titleEn}
                {...springIn}
                transition={springInDelay(idx * 0.05)}
                className="rounded-2xl border border-border/70 bg-card p-6 md:p-8 shadow-xs hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-bengali text-lg md:text-xl font-bold text-foreground">
                    {t(sec.titleBn, sec.titleEn)}
                  </h2>
                </div>
                <div className="font-bengali text-sm md:text-base leading-relaxed text-muted-foreground whitespace-pre-line pl-0 md:pl-13">
                  {t(sec.contentBn, sec.contentEn)}
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ================= CONTACT SUPPORT BOX ================= */}
        <motion.div
          {...springIn}
          transition={springInDelay(0.35)}
          className="mt-12 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <HelpCircle className="h-4 w-4" />
                <span>{t("গোপনীয়তা বা তথ্য সুরক্ষা নিয়ে কোনো প্রশ্ন আছে?", "Questions regarding Privacy?")}</span>
              </div>
              <h3 className="font-bengali text-xl font-bold text-foreground">
                {t("সরাসরি মাদরাসা অফিসে যোগাযোগ করুন", "Contact Our Administration Office")}
              </h3>
              <p className="font-bengali text-xs md:text-sm text-muted-foreground leading-relaxed">
                {t(
                  "তথ্য হালনাগাদ, সংশোধন বা প্রাইভেসি পলিসি সংক্রান্ত যেকোনো অনুসন্ধানের জন্য আমাদের হেল্পলাইনে কল বা ইমেইল করতে পারেন।",
                  "For data updates, corrections, or any privacy-related queries, feel free to reach out via our official hotline or email."
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
              {settings.phone_primary && (
                <a
                  href={`tel:${settings.phone_primary}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{settings.phone_primary}</span>
                </a>
              )}

              {settings.email_primary && (
                <a
                  href={`mailto:${settings.email_primary}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{settings.email_primary}</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Breadcrumb back navigation */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bengali text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            {t("হোম", "Home")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/admission-form" className="hover:text-primary transition-colors">
            {t("ভর্তি ফরম", "Admission Form")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{t("গোপনীয়তা নীতিমালা", "Privacy Policy")}</span>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
