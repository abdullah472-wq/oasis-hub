import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Copy, Mail, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getNewsFromFirestore, type NewsPost } from "@/lib/news";
import { subscribeToNews } from "@/lib/subscribers";
import { toast } from "sonner";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22 12.07C22 6.5 17.52 2 11.93 2C6.35 2 1.86 6.5 1.86 12.07C1.86 17.1 5.53 21.26 10.33 22v-7.05H7.7v-2.88h2.63V9.85c0-2.6 1.55-4.04 3.93-4.04c1.14 0 2.33.2 2.33.2v2.56h-1.31c-1.29 0-1.69.8-1.69 1.62v1.95h2.88l-.46 2.88h-2.42V22c4.8-.74 8.47-4.9 8.47-9.93Z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.5 2.75h-9A4.75 4.75 0 0 0 2.75 7.5v9A4.75 4.75 0 0 0 7.5 21.25h9A4.75 4.75 0 0 0 21.25 16.5v-9A4.75 4.75 0 0 0 16.5 2.75Zm3.25 13.75A3.25 3.25 0 0 1 16.5 19.75h-9a3.25 3.25 0 0 1-3.25-3.25v-9A3.25 3.25 0 0 1 7.5 4.25h9a3.25 3.25 0 0 1 3.25 3.25v9Z" />
    <path d="M12 7.25A4.75 4.75 0 1 0 16.75 12A4.76 4.76 0 0 0 12 7.25Zm0 7.98A3.23 3.23 0 1 1 15.23 12 3.23 3.23 0 0 1 12 15.23Z" />
    <circle cx="17.25" cy="6.75" r="0.9" />
  </svg>
);

const News = () => {
  const { t, lang } = useLanguage();
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");

  useEffect(() => {
    let active = true;

    getNewsFromFirestore()
      .then((items) => {
        if (active) {
          setNewsPosts(items);
        }
      })
      .catch(() => {
        if (active) {
          setNewsPosts([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const orderedPosts = useMemo(() => newsPosts, [newsPosts]);

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubLoading(true);
    setSubError("");

    try {
      await subscribeToNews({
        name: subName,
        email: subEmail,
        phone: subPhone,
      });
      setSubscribed(true);
      setSubName("");
      setSubEmail("");
      setSubPhone("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message === "already-subscribed") {
        setSubError(t("এই ইমেইল দিয়ে আগেই সাবস্ক্রাইব করা হয়েছে", "This email is already subscribed"));
      } else if (message === "permission-denied") {
        setSubError(t("সাবস্ক্রিপশন এখন সক্রিয় নয়। পরে আবার চেষ্টা করুন", "Subscriptions are not available right now. Please try again later"));
      } else {
        setSubError(t("সাবস্ক্রিপশন সম্পন্ন করা যায়নি", "Could not complete the subscription"));
      }
    } finally {
      setSubLoading(false);
    }
  };

  const buildShareUrl = (newsId: string) => {
    if (typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/news#news-${newsId}`;
  };

  const handleCopyLink = async (newsId: string) => {
    const url = buildShareUrl(newsId);
    if (!url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("লিংক কপি হয়েছে", "Link copied"));
    } catch {
      toast.error(t("লিংক কপি করা যায়নি", "Could not copy link"));
    }
  };

  const shareButtonClass =
    "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-2 font-bengali text-xs font-semibold text-foreground transition hover:border-primary/50 hover:text-primary";

  return (
    <div>
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-primary md:h-64">
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
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-institutional p-8">
              <h2 className="font-bengali text-3xl font-bold text-foreground">
                {t("প্রতিষ্ঠানের সংবাদ ও গুরুত্বপূর্ণ প্রকাশনা", "Institutional News and Important Publications")}
              </h2>
              <p className="mt-4 whitespace-pre-line font-bengali text-base leading-8 text-muted-foreground">
                {t(
                  "প্রতিষ্ঠানের বিভিন্ন কার্যক্রম, সাফল্য, ঘোষণাপত্র ও জনকল্যাণমূলক উদ্যোগের সংবাদ এখানে প্রকাশ করা হয়।",
                  "News about institutional activities, achievements, announcements, and community initiatives is published here.",
                )}
              </p>
              <div className="mt-6">
                <Link
                  to="/notices"
                  className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 font-bengali text-sm font-semibold text-primary transition hover:bg-primary/15"
                >
                  {t("নোটিশ বোর্ড দেখুন", "View Notice Board")}
                  <Send className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-institutional p-8">
              <div className="text-center">
                <h3 className="font-bengali text-2xl font-bold text-foreground">
                  {t("সংবাদ সাবস্ক্রিপশন", "News Subscription")}
                </h3>
                <p className="mt-2 font-bengali text-sm text-muted-foreground">
                  {t("ইমেইল দিয়ে সাবস্ক্রাইব করলে নতুন সংবাদ প্রকাশের খবর পেতে পারবেন", "Subscribe with your email to receive updates when new news is published")}
                </p>
              </div>

              {subscribed ? (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
                  <p className="font-bengali text-lg font-semibold text-foreground">
                    {t("সাবস্ক্রিপশন সফল হয়েছে", "Subscription successful")}
                  </p>
                  <p className="mt-1 font-bengali text-sm text-muted-foreground">
                    {t("নতুন সংবাদ প্রকাশ হলে আমরা আপনাকে জানাবো", "We will notify you when new news is published")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-6 space-y-4">
                  <input
                    type="text"
                    value={subName}
                    onChange={(event) => setSubName(event.target.value)}
                    placeholder={t("আপনার নাম", "Your name")}
                    className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 font-bengali text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="email"
                    value={subEmail}
                    onChange={(event) => setSubEmail(event.target.value)}
                    placeholder={`${t("ইমেইল", "Email")} *`}
                    className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 font-bengali text-foreground outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <input
                    type="tel"
                    value={subPhone}
                    onChange={(event) => setSubPhone(event.target.value)}
                    placeholder={t("মোবাইল নম্বর", "Mobile number")}
                    className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 font-bengali text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                  {subError ? <p className="font-bengali text-sm text-red-600">{subError}</p> : null}
                  <button
                    type="submit"
                    disabled={subLoading}
                    className="squishy-button flex w-full items-center justify-center gap-2 font-bengali"
                  >
                    {subLoading ? <Mail className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {t("সাবস্ক্রাইব করুন", "Subscribe")}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {loading ? (
            <div className="card-institutional p-10 text-center font-bengali text-muted-foreground">
              {t("সংবাদ লোড হচ্ছে...", "Loading news...")}
            </div>
          ) : orderedPosts.length === 0 ? (
            <div className="card-institutional p-10 text-center">
              <p className="font-bengali text-lg font-semibold text-foreground">
                {t("এখনও কোনো সংবাদ প্রকাশ করা হয়নি", "No news has been published yet")}
              </p>
              <p className="mt-2 font-bengali text-sm text-muted-foreground">
                {t("নতুন সংবাদ প্রকাশ হলে এখানে দেখা যাবে", "Published news items will appear here")}
              </p>
            </div>
          ) : (
            <div className="grid gap-8">
              {orderedPosts.map((news, index) => (
                <motion.article
                  key={news.id}
                  id={`news-${news.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="card-institutional overflow-hidden"
                >
                  <div className="md:flex">
                    {news.imageUrl ? (
                      <div className="relative h-48 md:h-auto md:w-1/3">
                        <img
                          src={news.imageUrl}
                          alt={lang === "bn" ? news.titleBn : news.titleEn}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="p-6 md:flex-1">
                      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="font-bengali">{news.date}</span>
                      </div>
                      <h2 className="font-bengali text-xl font-bold text-foreground md:text-2xl">
                        {lang === "bn" ? news.titleBn : news.titleEn}
                      </h2>
                      <p className="mt-3 whitespace-pre-line font-bengali leading-8 text-muted-foreground">
                        {lang === "bn" ? news.excerptBn : news.excerptEn}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(news.id)}
                          className={shareButtonClass}
                        >
                          <Copy className="h-4 w-4" />
                          {t("কপি লিংক", "Copy link")}
                        </button>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildShareUrl(news.id))}`}
                          target="_blank"
                          rel="noreferrer"
                          className={shareButtonClass}
                        >
                          <FacebookIcon className="h-4 w-4" />
                          Facebook
                        </a>
                        <a
                          href="https://m.me/"
                          target="_blank"
                          rel="noreferrer"
                          className={shareButtonClass}
                          onClick={() => handleCopyLink(news.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Messenger
                        </a>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `${lang === "bn" ? news.titleBn : news.titleEn} - ${buildShareUrl(news.id)}`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className={shareButtonClass}
                        >
                          <Send className="h-4 w-4" />
                          WhatsApp
                        </a>
                        <a
                          href="https://www.instagram.com/"
                          target="_blank"
                          rel="noreferrer"
                          className={shareButtonClass}
                          onClick={() => handleCopyLink(news.id)}
                        >
                          <InstagramIcon className="h-4 w-4" />
                          Instagram
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;
