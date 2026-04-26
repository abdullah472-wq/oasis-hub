import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock3,
  HandHeart,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { springIn, springInDelay } from "@/lib/animations";
import { getRamadanSponsors, addRamadanSponsor, RamadanSponsor } from "@/lib/ramadanSponsors";
import { getRamadanSettings, type RamadanSettings } from "@/lib/ramadanSettings";

const TOTAL_DAYS = 25;
const COST_PER_DAY = 5000;
const MAX_SPONSOR_DAY = 25;

const Ramadan = () => {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<number | null>(1);
  const [selectedPercent, setSelectedPercent] = useState<number>(25);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [sponsors, setSponsors] = useState<RamadanSponsor[]>([]);

  useEffect(() => {
    let mounted = true;

    const syncPageState = () =>
      Promise.allSettled([getRamadanSponsors(), getRamadanSettings()])
        .then((results) => {
          if (!mounted) return;

          const [sponsorsResult, settingsResult] = results;

          if (sponsorsResult.status === "fulfilled") {
            setSponsors(sponsorsResult.value);
          } else {
            console.error("Failed to load Ramadan sponsors:", sponsorsResult.reason);
          }

          if (settingsResult.status === "fulfilled") {
            setIsPublic(settingsResult.value.isPublic);
          } else {
            console.error("Failed to load Ramadan visibility settings:", settingsResult.reason);
            setIsPublic(false);
          }
        })
        .finally(() => {
          if (mounted) setPageLoading(false);
        });

    void syncPageState();

    const syncVisibilityFromEvent = (event: Event) => {
      const customEvent = event as CustomEvent<RamadanSettings>;
      if (customEvent.detail && mounted) {
        setIsPublic(customEvent.detail.isPublic);
        setPageLoading(false);
      }
    };

    const syncVisibilityFromStorage = (event: StorageEvent) => {
      if (event.key === "oasis_ramadan_settings_v1") {
        void getRamadanSettings()
          .then((settings) => {
            if (mounted) setIsPublic(settings.isPublic);
          })
          .catch((error) => {
            console.error("Failed to sync Ramadan visibility settings:", error);
          });
      }
    };

    window.addEventListener("ramadan-settings-updated", syncVisibilityFromEvent as EventListener);
    window.addEventListener("storage", syncVisibilityFromStorage);

    return () => {
      mounted = false;
      window.removeEventListener("ramadan-settings-updated", syncVisibilityFromEvent as EventListener);
      window.removeEventListener("storage", syncVisibilityFromStorage);
    };
  }, []);

  const getSponsorshipPercent = (day: number) => {
    let totalPercent = 0;
    sponsors.forEach((sponsor) => {
      if (sponsor.day === day) totalPercent += sponsor.percentage;
    });
    return Math.min(totalPercent, 100);
  };

  const getSponsorsForDay = (day: number) => sponsors.filter((sponsor) => sponsor.day === day);
  const isDayAvailable = (day: number) => day <= MAX_SPONSOR_DAY && getSponsorshipPercent(day) < 100;
  const calculateCost = () => (selectedPercent / 100) * COST_PER_DAY;

  const totalRaised = useMemo(() => sponsors.reduce((sum, sponsor) => sum + sponsor.amount, 0), [sponsors]);
  const totalSponsoredDays = useMemo(
    () => Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).filter((day) => getSponsorshipPercent(day) > 0).length,
    [sponsors],
  );
  const fullySponsoredDays = useMemo(
    () => Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).filter((day) => getSponsorshipPercent(day) >= 100).length,
    [sponsors],
  );

  const availableDays = TOTAL_DAYS - fullySponsoredDays;
  const selectedDaySponsors = selectedDay ? getSponsorsForDay(selectedDay) : [];
  const selectedDayPercent = selectedDay ? getSponsorshipPercent(selectedDay) : 0;

  const percentageOptions = [
    { value: 25, amount: COST_PER_DAY * 0.25, label: "25%", amountLabel: `৳${COST_PER_DAY * 0.25}` },
    { value: 50, amount: COST_PER_DAY * 0.5, label: "50%", amountLabel: `৳${COST_PER_DAY * 0.5}` },
    { value: 100, amount: COST_PER_DAY, label: "100%", amountLabel: `৳${COST_PER_DAY}` },
  ];

  const packageCards = [
    {
      titleBn: "একক অংশীদার",
      titleEn: "Quarter Share",
      descriptionBn: "এক দিনের ইফতারের ২৫% স্পন্সর করে অংশ নিন",
      descriptionEn: "Sponsor 25% of one day’s iftar and take part in the reward",
      amount: COST_PER_DAY * 0.25,
      percent: 25,
    },
    {
      titleBn: "অর্ধেক ইফতার",
      titleEn: "Half Day Share",
      descriptionBn: "দুইজন মিলে এক দিনের ইফতার সহজে সম্পন্ন করতে পারবেন",
      descriptionEn: "Cover half of a day’s iftar with a shared contribution",
      amount: COST_PER_DAY * 0.5,
      percent: 50,
    },
    {
      titleBn: "পূর্ণ দিনের স্পন্সর",
      titleEn: "Full Day Sponsor",
      descriptionBn: "এক দিনের পূর্ণ ইফতার ও দোয়ার সওয়াব নিজের নামে নিন",
      descriptionEn: "Sponsor a full iftar day in your own name",
      amount: COST_PER_DAY,
      percent: 100,
    },
  ];

  const processSteps = [
    {
      icon: Calendar,
      titleBn: "দিন নির্বাচন",
      titleEn: "Choose a Day",
      textBn: "ক্যালেন্ডার থেকে খালি বা আংশিক খালি দিন বেছে নিন",
      textEn: "Pick an available or partially available day from the calendar",
    },
    {
      icon: HandHeart,
      titleBn: "অংশ নির্ধারণ",
      titleEn: "Select Share",
      textBn: "২৫%, ৫০% বা ১০০% অংশ থেকে আপনার সুবিধামতো নির্বাচন করুন",
      textEn: "Choose 25%, 50%, or 100% depending on your intention",
    },
    {
      icon: ShieldCheck,
      titleBn: "যোগাযোগ ও সম্পন্ন",
      titleEn: "Confirm & Complete",
      textBn: "ফর্ম জমা দিন, আমরা দ্রুত যোগাযোগ করে পেমেন্ট কনফার্ম করব",
      textEn: "Submit the form and we’ll quickly confirm the payment with you",
    },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDay) return;

    setLoading(true);
    try {
      await addRamadanSponsor({
        name: sponsorName,
        phone: sponsorPhone,
        day: selectedDay,
        percentage: selectedPercent,
        amount: calculateCost(),
        comment,
        studentId,
      });

      const updatedSponsors = await getRamadanSponsors();
      setSponsors(updatedSponsors);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting sponsor:", error);
    }
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-20">
        <p className="font-bengali text-base text-muted-foreground">{t("রমাদান পেজ লোড হচ্ছে...", "Loading Ramadan page...")}</p>
      </div>
    );
  }

  if (!isPublic) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20">
        <div className="card-institutional border border-border/70 p-10 text-center">
          <h1 className="font-bengali text-3xl font-bold text-foreground">
            {t("রমাদান পেজটি বর্তমানে হাইড রাখা হয়েছে", "The Ramadan page is currently hidden")}
          </h1>
          <p className="mt-4 font-bengali text-sm leading-7 text-muted-foreground">
            {t(
              "সর্বশেষ আপডেট বা sponsorship সহযোগিতার জন্য অনুগ্রহ করে প্রতিষ্ঠানের সাথে সরাসরি যোগাযোগ করুন।",
              "Please contact the institution directly for the latest updates or sponsorship support.",
            )}
          </p>
          <a href="tel:01581818368" className="squishy-button-gold mt-6 inline-flex items-center justify-center gap-2 font-bengali">
            <Phone className="h-4 w-4" />
            {t("যোগাযোগ করুন", "Contact Us")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-900 to-primary py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1440 500" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0,220 C230,120 430,340 720,210 C970,100 1160,290 1440,160 V500 H0 Z" fill="hsl(45 70% 50%)" />
          </svg>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div {...springIn} className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-primary-foreground/90 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                <span className="font-bengali">{t("রমাদান বিশেষ সহায়তা কর্মসূচি", "Special Ramadan Support Program")}</span>
              </div>
              <h1 className="font-bengali text-4xl font-bold text-primary-foreground md:text-6xl">
                {t("রমাদানের ইফতার স্পন্সর করুন", "Sponsor Iftar This Ramadan")}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl font-bengali text-base leading-8 text-primary-foreground/80 md:mx-0 md:text-lg">
                {t(
                  "আননূর শিক্ষা পরিবারের শিক্ষার্থীদের জন্য প্রতিদিনের ইফতার আয়োজনকে আরও সুন্দর ও নিয়মিত করতে আপনার অংশগ্রহণ খুবই মূল্যবান। এই page থেকে আপনি সহজে দিন বেছে নিয়ে সম্পূর্ণ বা আংশিক স্পন্সর করতে পারবেন।",
                  "Support daily iftar for students of Annoor Education Family with a clear, structured sponsorship journey. From this page you can choose a day and contribute fully or partially.",
                )}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <button type="button" onClick={() => document.getElementById("ramadan-calendar")?.scrollIntoView({ behavior: "smooth" })} className="squishy-button-gold inline-flex items-center justify-center gap-2 font-bengali">
                  <Calendar className="h-4 w-4" />
                  {t("দিন নির্বাচন করুন", "Choose a Sponsorship Day")}
                </button>
                <a href="tel:01581818368" className="squishy-button-outline inline-flex items-center justify-center gap-2 font-bengali">
                  <Phone className="h-4 w-4" />
                  {t("সরাসরি যোগাযোগ", "Direct Contact")}
                </a>
              </div>
            </motion.div>

            <motion.div {...springInDelay(0.1)} className="grid gap-4 sm:grid-cols-2">
              {[
                { labelBn: "মোট দিন", labelEn: "Total Days", value: TOTAL_DAYS },
                { labelBn: "আংশিক বা পূর্ণ স্পন্সর", labelEn: "Covered Days", value: totalSponsoredDays },
                { labelBn: "পূর্ণ স্পন্সর হয়েছে", labelEn: "Fully Covered", value: fullySponsoredDays },
              ].map((item) => (
                <div key={item.labelEn} className="rounded-3xl border border-white/15 bg-white/10 p-5 text-center shadow-lg backdrop-blur">
                  <p className="font-bengali text-sm text-primary-foreground/75">{t(item.labelBn, item.labelEn)}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-primary-foreground">{item.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <WaveDivider className="absolute bottom-0" color="fill-[hsla(40,30%,98%,0.94)]" />
      </section>
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div {...springIn} className="mb-10 text-center">
            <h2 className="font-bengali text-3xl font-bold text-foreground">{t("এক নজরে অংশগ্রহণের উপায়", "Simple Ways to Participate")}</h2>
            <p className="mx-auto mt-3 max-w-3xl font-bengali text-muted-foreground">
              {t("যারা দ্রুত সিদ্ধান্ত নিতে চান, তাদের জন্য নিচে সবচেয়ে জনপ্রিয় তিনটি স্পন্সর প্যাকেজ দেওয়া হলো।", "Here are the three most common sponsorship options for quick participation.")}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {packageCards.map((pack, index) => (
              <motion.div key={pack.titleEn} {...springInDelay(index * 0.08)} className="card-institutional border border-border/70 p-6">
                <div className="inline-flex rounded-full bg-accent/15 px-3 py-1 font-bengali text-sm font-semibold text-accent">{pack.percent}%</div>
                <h3 className="mt-4 font-bengali text-2xl font-bold text-foreground">{t(pack.titleBn, pack.titleEn)}</h3>
                <p className="mt-3 font-bengali text-sm leading-7 text-muted-foreground">{t(pack.descriptionBn, pack.descriptionEn)}</p>
                <p className="mt-6 font-display text-3xl font-bold text-primary">৳{pack.amount}</p>
                <button type="button" onClick={() => { setSelectedPercent(pack.percent); document.getElementById("ramadan-calendar")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-6 inline-flex items-center gap-2 font-bengali text-sm font-semibold text-primary hover:underline">
                  {t("এই প্যাকেজে এগিয়ে যান", "Continue with this package")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div {...springIn} className="card-institutional border border-border/70 p-8">
            <div className="mb-8 text-center">
              <h2 className="font-bengali text-3xl font-bold text-foreground">{t("কীভাবে স্পন্সর করবেন", "How Sponsorship Works")}</h2>
              <p className="mt-3 font-bengali text-muted-foreground">{t("সঠিক flow বুঝে খুব সহজে sponsorship সম্পন্ন করার জন্য এই তিনটি ধাপ অনুসরণ করুন।", "Follow these three steps to complete the sponsorship smoothly.")}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.titleEn} className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
                    <p className="mt-4 font-display text-lg font-semibold text-foreground">0{index + 1}</p>
                    <h3 className="mt-1 font-bengali text-lg font-bold text-foreground">{t(step.titleBn, step.titleEn)}</h3>
                    <p className="mt-2 font-bengali text-sm leading-7 text-muted-foreground">{t(step.textBn, step.textEn)}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="ramadan-calendar" className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <motion.div {...springIn} className="card-institutional border border-border/70 p-8">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-bengali text-2xl font-bold text-foreground">{t("ইফতার ক্যালেন্ডার", "Iftar Sponsorship Calendar")}</h2>
                  <p className="mt-2 font-bengali text-sm text-muted-foreground">{t(`১-${MAX_SPONSOR_DAY} রমাদান পর্যন্ত sponsorship নেওয়া হচ্ছে। একটি দিন একাধিক অংশে স্পন্সর করা যাবে।`, `Sponsorship is open for days 1-${MAX_SPONSOR_DAY}. Each day can be covered by multiple sponsors.`)}</p>
                </div>
                <div className="rounded-2xl bg-accent/10 px-4 py-3 text-center">
                  <p className="font-bengali text-xs text-muted-foreground">{t("প্রতি দিনের আনুমানিক খরচ", "Estimated cost per day")}</p>
                  <p className="font-display text-2xl font-bold text-accent">৳{COST_PER_DAY}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
                {Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).map((day) => {
                  const percent = getSponsorshipPercent(day);
                  const available = isDayAvailable(day);
                  const isSelected = selectedDay === day;
                  return (
                    <button key={day} type="button" onClick={() => available && setSelectedDay(day)} disabled={!available} className={`relative overflow-hidden rounded-2xl border px-2 py-4 text-center transition-all ${isSelected ? "border-accent bg-accent/15 text-foreground ring-2 ring-accent/40" : available ? "border-border/70 bg-card hover:border-accent/40 hover:bg-accent/10" : "cursor-not-allowed border-border/40 bg-muted/60 text-muted-foreground/60"}`}>
                      <div className="relative z-10">
                        <p className="font-display text-lg font-bold">{day}</p>
                        <p className="font-bengali text-[11px] text-muted-foreground">{t("রমাদান", "Ramadan")}</p>
                        <p className="mt-2 text-xs font-semibold text-foreground">{percent}%</p>
                      </div>
                      <div className={`absolute inset-x-0 bottom-0 ${percent >= 100 ? "bg-emerald-500/35" : percent >= 50 ? "bg-amber-400/30" : "bg-primary/15"}`} style={{ height: `${Math.max(percent, 6)}%` }} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                {[{ color: "bg-emerald-500/35", labelBn: "পূর্ণ স্পন্সর", labelEn: "Fully Covered" }, { color: "bg-amber-400/30", labelBn: "আংশিকভাবে পূর্ণ", labelEn: "Mostly Covered" }, { color: "bg-primary/15", labelBn: "চলমান", labelEn: "In Progress" }].map((item) => (
                  <div key={item.labelEn} className="flex items-center gap-2 font-bengali text-muted-foreground"><span className={`h-4 w-4 rounded ${item.color}`} />{t(item.labelBn, item.labelEn)}</div>
                ))}
              </div>
            </motion.div>

            <motion.div {...springInDelay(0.08)} className="card-institutional border border-border/70 p-8">
              <h3 className="font-bengali text-2xl font-bold text-foreground">{selectedDay ? t(`${selectedDay} রমাদানের অবস্থা`, `Day ${selectedDay} Snapshot`) : t("দিন নির্বাচন করুন", "Select a Day")}</h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-secondary/70 p-4">
                  <p className="font-bengali text-sm text-muted-foreground">{t("মোট স্পন্সর সম্পন্ন", "Coverage complete")}</p>
                  <p className="mt-2 font-display text-4xl font-bold text-foreground">{selectedDayPercent}%</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-card p-4 shadow-sm"><p className="font-bengali text-xs text-muted-foreground">{t("অবশিষ্ট", "Remaining")}</p><p className="mt-2 font-display text-2xl font-bold text-primary">{Math.max(0, 100 - selectedDayPercent)}%</p></div>
                  <div className="rounded-2xl bg-card p-4 shadow-sm"><p className="font-bengali text-xs text-muted-foreground">{t("আজকের আনুমানিক খরচ", "Estimated cost")}</p><p className="mt-2 font-display text-2xl font-bold text-primary">৳{COST_PER_DAY}</p></div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card p-4">
                  <p className="font-bengali text-sm font-semibold text-foreground">{t("এই দিনের বর্তমান স্পন্সর", "Current sponsors for this day")}</p>
                  {selectedDaySponsors.length === 0 ? <p className="mt-3 font-bengali text-sm text-muted-foreground">{t("এখনও কেউ এই দিনটি স্পন্সর করেননি। আপনি প্রথম হতে পারেন।", "No sponsor yet for this day. You can be the first.")}</p> : <div className="mt-3 space-y-3">{selectedDaySponsors.map((sponsor, index) => <div key={`${sponsor.name}-${index}`} className="rounded-2xl bg-secondary/50 p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-bengali text-sm font-semibold text-foreground">{sponsor.name}</p><p className="font-bengali text-xs text-muted-foreground">{sponsor.phone}</p></div><span className="rounded-full bg-accent/15 px-3 py-1 font-display text-sm font-bold text-accent">{sponsor.percentage}%</span></div></div>)}</div>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div {...springIn} className="space-y-6">
              <div className="card-institutional border border-border/70 p-8">
                <h2 className="font-bengali text-2xl font-bold text-foreground">
                  {t("স্পন্সরশিপ সারাংশ", "Sponsorship Summary")}
                </h2>
                <p className="mt-3 font-bengali text-sm leading-7 text-muted-foreground">
                  {t(
                    "একটি দিনের সম্পূর্ণ খরচ ৳৫০০০। আপনার সুবিধামতো ২৫%, ৫০% বা ১০০% অংশ নিয়ে অংশগ্রহণ করতে পারবেন।",
                    "A full day costs ৳5000. You can contribute 25%, 50%, or 100% based on your capacity.",
                  )}
                </p>

                <div className="mt-6 space-y-3">
                  {percentageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedPercent(option.value)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        selectedPercent === option.value
                          ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                          : "border-border/70 bg-card hover:border-accent/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-semibold text-foreground">{option.label}</p>
                          <p className="font-bengali text-sm text-muted-foreground">
                            {t("এই অংশে অংশগ্রহণ", "Participate with this share")}
                          </p>
                        </div>
                        <p className="font-display text-2xl font-bold text-primary">{option.amountLabel}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-secondary/70 p-4">
                    <p className="font-bengali text-xs text-muted-foreground">{t("নির্বাচিত দিন", "Selected Day")}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-foreground">
                      {selectedDay ? `${selectedDay}` : "--"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-secondary/70 p-4">
                    <p className="font-bengali text-xs text-muted-foreground">{t("আপনার অবদান", "Your Contribution")}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-foreground">৳{calculateCost()}</p>
                  </div>
                </div>
              </div>

              <div className="card-institutional border border-border/70 p-8">
                <h3 className="font-bengali text-xl font-bold text-foreground">
                  {t("বিশ্বাস ও স্বচ্ছতা", "Trust & Transparency")}
                </h3>
                <div className="mt-5 grid gap-4">
                  {[
                    {
                      icon: Phone,
                      titleBn: "দ্রুত যোগাযোগ",
                      titleEn: "Fast Communication",
                      textBn: "ফর্ম জমা দেওয়ার পর আমরা দ্রুত কল বা মেসেজে যোগাযোগ করি।",
                      textEn: "We contact sponsors quickly by call or message after submission.",
                    },
                    {
                      icon: CheckCircle,
                      titleBn: "আংশিক ও পূর্ণ উভয় সুযোগ",
                      titleEn: "Flexible Contribution",
                      textBn: "একটি দিনের পুরো খরচ না পারলেও আংশিকভাবে অংশ নিতে পারবেন।",
                      textEn: "Even if you cannot cover a full day, you can still contribute meaningfully.",
                    },
                    {
                      icon: Users,
                      titleBn: "শিক্ষার্থী-কেন্দ্রিক উদ্যোগ",
                      titleEn: "Student-Focused Initiative",
                      textBn: "সমস্ত আয়োজন মাদরাসার শিক্ষার্থীদের নিয়মিত ইফতার সেবার জন্য।",
                      textEn: "Every contribution directly supports student iftar arrangements.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.titleEn} className="rounded-2xl border border-border/70 bg-card p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bengali text-base font-bold text-foreground">
                              {t(item.titleBn, item.titleEn)}
                            </h4>
                            <p className="mt-1 font-bengali text-sm leading-7 text-muted-foreground">
                              {t(item.textBn, item.textEn)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div {...springInDelay(0.06)} className="card-institutional border border-border/70 p-8">
              <div className="mb-6">
                <h2 className="font-bengali text-2xl font-bold text-foreground">
                  {t("স্পন্সরশিপ ফর্ম", "Sponsorship Form")}
                </h2>
                <p className="mt-3 font-bengali text-sm leading-7 text-muted-foreground">
                  {t(
                    "নিচের তথ্যগুলো পূরণ করে অনুরোধ পাঠান। আমরা পেমেন্ট কনফার্মেশন ও পরবর্তী পদক্ষেপের জন্য আপনার সাথে যোগাযোগ করব।",
                    "Fill in the information below and submit your request. We will contact you for payment confirmation and next steps.",
                  )}
                </p>
              </div>

              {submitted ? (
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                  <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="h-6 w-6" />
                    <h3 className="font-bengali text-xl font-bold">
                      {t("ধন্যবাদ, আপনার sponsorship request গ্রহণ করা হয়েছে", "Thank you, your sponsorship request has been received")}
                    </h3>
                  </div>
                  <p className="mt-3 font-bengali text-sm leading-7 text-emerald-800/90 dark:text-emerald-200">
                    {t(
                      "আমরা খুব দ্রুত আপনার সঙ্গে যোগাযোগ করব এবং payment confirmation সম্পন্ন করব।",
                      "We will contact you very soon to complete payment confirmation.",
                    )}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-bengali text-sm font-semibold text-foreground">
                        {t("আপনার নাম", "Your Name")}
                      </label>
                      <input
                        type="text"
                        value={sponsorName}
                        onChange={(event) => setSponsorName(event.target.value)}
                        required
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-bengali text-sm font-semibold text-foreground">
                        {t("মোবাইল নম্বর", "Mobile Number")}
                      </label>
                      <input
                        type="tel"
                        value={sponsorPhone}
                        onChange={(event) => setSponsorPhone(event.target.value)}
                        required
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-bengali text-sm font-semibold text-foreground">
                        {t("নির্বাচিত দিন", "Selected Day")}
                      </label>
                      <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-3 font-display text-lg font-semibold text-foreground">
                        {selectedDay ? `${selectedDay} ${t("রমাদান", "Ramadan")}` : t("দিন নির্বাচন করুন", "Select a day")}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block font-bengali text-sm font-semibold text-foreground">
                        {t("স্পন্সর অংশ", "Sponsorship Share")}
                      </label>
                      <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-3 font-display text-lg font-semibold text-foreground">
                        {selectedPercent}% / ৳{calculateCost()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-bengali text-sm font-semibold text-foreground">
                      {t("স্টুডেন্ট আইডি (ঐচ্ছিক)", "Student ID (Optional)")}
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(event) => setStudentId(event.target.value)}
                      placeholder={t("শিক্ষার্থীর সঙ্গে সংযুক্ত থাকলে আইডি দিন", "Provide student ID if connected to a student")}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-bengali text-sm font-semibold text-foreground">
                      {t("বিশেষ মন্তব্য (ঐচ্ছিক)", "Special Comment (Optional)")}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={4}
                      placeholder={t("কোনো বিশেষ নিয়ত বা বার্তা থাকলে লিখুন", "Write any special intention or message")}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedDay}
                    className="squishy-button-gold inline-flex w-full items-center justify-center gap-2 font-bengali disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? t("অপেক্ষা করুন...", "Please wait...") : t("স্পন্সরশিপ অনুরোধ পাঠান", "Submit Sponsorship Request")}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <motion.div {...springIn} className="card-institutional border border-border/70 p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bengali text-2xl font-bold text-foreground">
                    {t("বর্তমান স্পন্সরগণ", "Current Sponsors")}
                  </h2>
                  <p className="mt-2 font-bengali text-sm text-muted-foreground">
                    {t("যারা ইতোমধ্যে অংশ নিয়েছেন, তাদের অবদান এখানে দেখা যাবে।", "Recent sponsor contributions are shown here.")}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-3 text-center">
                  <p className="font-bengali text-xs text-muted-foreground">{t("এখনও বাকি", "Days Remaining")}</p>
                  <p className="font-display text-2xl font-bold text-primary">{availableDays}</p>
                </div>
              </div>

              {sponsors.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-secondary/40 p-6 text-center">
                  <p className="font-bengali text-base text-muted-foreground">
                    {t("এখনও কোনো স্পন্সর নেই", "No sponsors yet")}
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {sponsors.slice(0, 8).map((sponsor) => (
                    <div key={sponsor.id ?? `${sponsor.name}-${sponsor.day}`} className="rounded-2xl border border-border/70 bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bengali text-base font-semibold text-foreground">{sponsor.name}</p>
                          <p className="mt-1 font-bengali text-xs text-muted-foreground">
                            {t(`${sponsor.day} রমাদান`, `Day ${sponsor.day}`)}
                          </p>
                        </div>
                        <span className="rounded-full bg-accent/10 px-3 py-1 font-display text-sm font-bold text-accent">
                          {sponsor.percentage}%
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-bengali text-sm text-muted-foreground">{sponsor.phone}</p>
                        <p className="font-display text-lg font-bold text-primary">৳{sponsor.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div {...springInDelay(0.08)} className="space-y-6">
              <div className="card-institutional border border-border/70 p-8">
                <h3 className="font-bengali text-2xl font-bold text-foreground">
                  {t("পেমেন্ট ও যোগাযোগ", "Payment & Contact")}
                </h3>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-secondary/70 p-4">
                    <p className="font-bengali text-sm font-semibold text-foreground">{t("নগদ / রকেট", "Nagad / Rocket")}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-primary">01312200043</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/70 p-4">
                    <p className="font-bengali text-sm font-semibold text-foreground">{t("বিকাশ / WhatsApp", "Bkash / WhatsApp")}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-primary">01581818368</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/70 p-4">
                    <p className="font-bengali text-sm font-semibold text-foreground">
                      {t("ইসলামী ব্যাংক বাংলাদেশ পিএলসি", "Islami Bank Bangladesh PLC")}
                    </p>
                    <p className="mt-2 font-bengali text-sm leading-7 text-muted-foreground">
                      {t("কাপাসিয়া শাখা | হিসাব: 20505 | আননূর শিক্ষা পরিবার", "Kapasia Branch | Account: 20505 | Annoor Education Family")}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href="tel:01581818368" className="squishy-button-gold inline-flex items-center justify-center gap-2 font-bengali">
                    <Phone className="h-4 w-4" />
                    {t("ফোন করুন", "Call Now")}
                  </a>
                  <a href="https://wa.me/8801581818368" target="_blank" rel="noreferrer" className="squishy-button-outline inline-flex items-center justify-center gap-2 font-bengali">
                    <Send className="h-4 w-4" />
                    {t("WhatsApp করুন", "WhatsApp")}
                  </a>
                </div>
              </div>

              <div className="card-institutional border border-border/70 p-8">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-6 w-6 text-primary" />
                  <h3 className="font-bengali text-xl font-bold text-foreground">
                    {t("আজই অংশ নিন", "Take Part Today")}
                  </h3>
                </div>
                <p className="mt-4 font-bengali text-sm leading-7 text-muted-foreground">
                  {t(
                    "রমাদানের প্রতিটি দিনের ইফতার একটি চলমান সাদাকাহ। আপনার সামর্থ্য অনুযায়ী অংশ নিন এবং শিক্ষার্থীদের জন্য দোয়ার অংশীদার হোন।",
                    "Each iftar day in Ramadan is an ongoing act of charity. Join according to your capacity and become part of the students’ prayers.",
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ramadan;
