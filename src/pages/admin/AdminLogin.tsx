import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowLeft, Shield, Eye, EyeOff, Sparkles, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AdminLogin = () => {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const message = err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড যাচাই করুন।";
      if (message.includes("Invalid login credentials")) {
        setError(t("ভুল ইমেইল বা পাসওয়ার্ড। পুনরায় চেষ্টা করুন।", "Invalid email or password. Please try again."));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseMasterCredentials = () => {
    setEmail("admin@gmail.com");
    setPassword("oasis2026");
    setError(null);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md space-y-6"
      >
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 font-bengali text-xs font-medium text-muted-foreground backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card hover:text-foreground hover:shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            {t("মূল ওয়েবসাইটে ফিরে যান", "Back to Website")}
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("সিকিউর সিএমএস", "Secure CMS")}
          </span>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/80 bg-card/85 p-8 shadow-2xl backdrop-blur-xl transition-all md:p-10">
          {/* Subtle top card accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          {/* Header Section */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary to-emerald-600 opacity-20 blur-lg" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-b from-primary to-emerald-800 text-primary-foreground shadow-xl shadow-primary/25">
                <Shield className="h-9 w-9 stroke-[2.2]" />
              </div>
            </motion.div>

            <h1 className="font-bengali text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {t("অ্যাডমিন লগইন", "Admin Login")}
            </h1>
            <p className="mt-1.5 font-bengali text-xs text-muted-foreground">
              {t("আননূর শিক্ষা পরিবার · সেন্ট্রাল সিএমএস পোর্টাল", "Annoor Education Family · Central CMS Portal")}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-center font-bengali text-xs font-medium text-destructive shadow-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="font-bengali text-xs font-semibold text-foreground">
                {t("অ্যাডমিন ইমেইল", "Admin Email")}
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 rounded-2xl border-border/80 bg-background/50 pl-11 pr-4 text-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bengali text-xs font-semibold text-foreground">
                  {t("পাসওয়ার্ড", "Password")}
                </Label>
                <button
                  type="button"
                  onClick={handleUseMasterCredentials}
                  className="font-bengali text-[11px] font-medium text-primary hover:underline"
                >
                  {t("পাসওয়ার্ড সাহায্য?", "Password Help?")}
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-2xl border-border/80 bg-background/50 pl-11 pr-11 text-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Helper Master Key Pill */}
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3 text-left">
              <div className="flex items-start gap-2.5">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="text-xs">
                  <p className="font-bengali font-semibold text-foreground">
                    {t("মাস্টার অ্যাডমিন অ্যাক্সেস", "Master Admin Access")}
                  </p>
                  <p className="mt-0.5 font-bengali text-[11px] text-muted-foreground">
                    {t(
                      "মাস্টার পাসওয়ার্ড: oasis2026 (ইমেইল যেকোনো বৈধ ইমেইল যেমন admin@gmail.com ব্যবহার করলেই লগইন হবে)",
                      "Master password: oasis2026 (Enter any email like admin@gmail.com to sign in directly)"
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleUseMasterCredentials}
                    className="mt-1.5 inline-flex items-center gap-1 font-bengali text-[11px] font-bold text-primary hover:underline"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {t("এক ক্লিকে অটো-ফিল করুন", "Auto-fill Credentials")}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-13 w-full rounded-2xl bg-gradient-to-r from-primary via-emerald-700 to-primary py-3.5 font-bengali text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/35 active:scale-[0.99] disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("লগইন যাচাই হচ্ছে...", "Signing In...")}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t("লগইন করুন", "Sign In to Dashboard")}
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center font-bengali text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("আননূর শিক্ষা পরিবার। সর্বস্বত্ব সংরক্ষিত।", "Annoor Education Family. All rights reserved.")}
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
