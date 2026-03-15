import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const NoticeTicker = () => {
  const { t } = useLanguage();
  const notices = [
    t("📢 ভর্তি চলছে ২০২৬ শিক্ষাবর্ষের জন্য!", "📢 Admission Open for 2026 Academic Year!"),
    t("🌙 রমজান ইফতার স্পন্সরশিপ প্রোগ্রাম চালু!", "🌙 Ramadan Iftar Sponsorship Program Active!"),
    t("📋 বার্ষিক পরীক্ষার ফলাফল প্রকাশিত", "📋 Annual Exam Results Published"),
    t("🎉 বার্ষিক ক্রীড়া প্রতিযোগিতা আসছে শীঘ্রই", "🎉 Annual Sports Competition Coming Soon"),
  ];

  return (
    <div className="notice-ticker overflow-hidden relative">
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {notices.map((notice, i) => (
          <span key={i} className="font-bengali text-sm md:text-base cursor-pointer hover:underline">
            {notice}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default NoticeTicker;
