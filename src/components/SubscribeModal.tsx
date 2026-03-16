import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribeToNews } from "@/lib/subscribers";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscribeModal = ({ isOpen, onClose }: SubscribeModalProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await subscribeToNews({ email, phone: "", name: "" });
      setSubscribed(true);
      setEmail("");
    } catch (err) {
      setError(t("আগেই সাবস্ক্রাইব করা হয়েছে!", "Already subscribed!"));
    }
    setLoading(false);
  };

  const handleClose = () => {
    setSubscribed(false);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-xl relative my-auto"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>

              {subscribed ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bengali text-xl font-bold text-foreground mb-2">
                    {t("ধন্যবাদ!", "Thank You!")}
                  </h3>
                  <p className="font-bengali text-muted-foreground">
                    {t("আপনি সফলভাবে সাবস্ক্রাইব করেছেন!", "You have successfully subscribed!")}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bengali"
                  >
                    {t("বন্ধ করুন", "Close")}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-bengali text-xl font-bold text-foreground text-center mb-2">
                    {t("সংবাদ সাবস্ক্রাইব", "Subscribe to News")}
                  </h3>
                  <p className="font-bengali text-muted-foreground text-center text-sm mb-6">
                    {t("সর্বশেষ সংবাদ পেতে ইমেইল দিন", "Enter your email to get latest news")}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="font-bengali text-sm font-medium text-foreground mb-1 block">
                        {t("ইমেইল", "Email")}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t("আপনার ইমেইল", "your@email.com")}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border font-bengali text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm font-bengali text-center">{error}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bengali font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        t("অপেক্ষা করুন...", "Please wait...")
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t("সাবস্ক্রাইব করুন", "Subscribe")}
                        </>
                      )}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscribeModal;
