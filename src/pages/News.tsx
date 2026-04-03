import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Mail, Send, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { Link } from "react-router-dom";
import { getNewsFromFirestore, NewsPost } from "@/lib/news";
import { subscribeToNews } from "@/lib/subscribers";

interface NewsItem {
  id: number;
  titleBn: string;
  titleEn: string;
  excerptBn: string;
  excerptEn: string;
  date: string;
  image?: string;
}

const defaultNews: NewsItem[] = [
  {
    id: 1,
    titleBn: "বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬",
    titleEn: "Annual Sports Competition 2026",
    excerptBn: "আগামী মাসে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে। সকল শিক্ষার্থীদের অংশগ্রহণ করতে আমন্ত্রণ জানানো হচ্ছে।",
    excerptEn: "Annual sports competition will be held next month. All students are invited to participate.",
    date: "১৫ মার্চ, ২০২৬",
    image: "https://images.unsplash.com/photo-1461896836934- voices-47d840221a20?w=600",
  },
  {
    id: 2,
    titleBn: "নতুন কম্পিউটার ল্যাব উদ্বোধন",
    titleEn: "New Computer Lab Inauguration",
    excerptBn: "আমাদের নতুন আধুনিক কম্পিউটার ল্যাব উদ্বোধন করা হয়েছে। শিক্ষার্থীরা এখন সর্বোত্তম প্রযুক্তি ব্যবহার করে শিখতে পারবে।",
    excerptEn: "Our new modern computer lab has been inaugurated. Students can now learn using the best technology.",
    date: "১০ মার্চ, ২০২৬",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
  },
  {
    id: 3,
    titleBn: "ভর্তি আবেদন শুরু ২০২৬",
    titleEn: "Admission Application Started 2026",
    excerptBn: "২০২৬ শিক্ষাবর্ষের জন্য ভর্তি আবেদন শুরু হয়েছে। আগ্রহী শিক্ষার্থীরা আবেদন করতে পারবে।",
    excerptEn: "Admission application for 2026 academic year has started. Interested students can apply now.",
    date: "৫ মার্চ, ২০২৬",
  },
  {
    id: 4,
    titleBn: "বিজ্ঞান মেলা অনুষ্ঠিত",
    titleEn: "Science Fair Held",
    excerptBn: "বিদ্যালয়ের বার্ষিক বিজ্ঞান মেলা অনুষ্ঠিত হয়েছে। শিক্ষার্থীরা তাদের নানা প্রকল্প প্রদর্শন করেছে।",
    excerptEn: "The school's annual science fair was held. Students showcased their various projects.",
    date: "১ মার্চ, ২০২৬",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600",
  },
];

const News = () => {
  const { t, lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Subscription state
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subName, setSubName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");

  useEffect(() => {
    getNewsFromFirestore()
      .then(setNewsPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubLoading(true);
    setSubError("");
    try {
      await subscribeToNews({ email: subEmail, phone: subPhone, name: subName });
      setSubscribed(true);
      setSubEmail("");
      setSubPhone("");
      setSubName("");
    } catch (error) {
      setSubError(t("আগেই সাবস্ক্রাইব করা হয়েছে!", "Already subscribed!"));
    }
    setSubLoading(false);
  };

  const adminPosts = newsPosts.map((p) => ({
    id: parseInt(p.id?.replace(/\D/g, "") || "0"),
    titleBn: p.titleBn,
    titleEn: p.titleEn,
    excerptBn: p.excerptBn,
    excerptEn: p.excerptEn,
    date: p.date,
    image: p.imageUrl,
  }));

  const newsData = [...adminPosts, ...defaultNews];

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bengali text-primary-foreground"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}
        >
          {t("সংবাদ", "News")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Subscription Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-institutional p-8 mb-12"
          >
            <div className="text-center mb-6">
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-2">
                {t("সংবাদ সাবস্ক্রাইব করুন", "Subscribe to News")}
              </h2>
              <p className="font-bengali text-muted-foreground">
                {t("সর্বশেষ সংবাদ পেতে সাবস্ক্রাইব করুন", "Subscribe to get the latest news")}
              </p>
            </div>
            
            {subscribed ? (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="font-bengali text-lg text-foreground">
                  {t("সাবস্ক্রিপশন সফল!", "Subscription successful!")}
                </p>
                <p className="font-bengali text-muted-foreground">
                  {t("আপনাকে ধন্যবাদ!", "Thank you!")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <div className="grid gap-4">
                  <div>
                    <input
                      type="text"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      placeholder={t("আপনার নাম", "Your Name")}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder={t("ইমেইল", "Email") + " *"}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={subPhone}
                      onChange={(e) => setSubPhone(e.target.value)}
                      placeholder={t("মোবাইল নম্বর", "Mobile Number")}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {subError && (
                    <p className="text-red-500 text-sm font-bengali text-center">{subError}</p>
                  )}
                  <motion.button
                    type="submit"
                    disabled={subLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="squishy-button font-bengali flex items-center justify-center gap-2"
                  >
                    {subLoading ? (
                      <Mail className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {t("সাবস্ক্রাইব", "Subscribe")}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>

          <div className="grid gap-8">
            {newsData.map((news, index) => (
              <motion.article
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-institutional overflow-hidden"
              >
                <div className="md:flex">
                  {news.image && (
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img
                        src={news.image}
                        alt={lang === "bn" ? news.titleBn : news.titleEn}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 md:flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      <span className="font-bengali">{news.date}</span>
                    </div>
                    <h2 className="font-bengali text-xl font-bold mb-3 text-foreground">
                      {lang === "bn" ? news.titleBn : news.titleEn}
                    </h2>
                    <p className="font-bengali text-muted-foreground mb-4">
                      {lang === "bn" ? news.excerptBn : news.excerptEn}
                    </p>
                    <Link
                      to="/notices"
                      className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                    >
                      {t("বিস্তারিত", "Read More")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
