import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, ArrowLeft, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const AdminLogin = () => {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-bengali text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("মূল ওয়েবসাইটে ফিরে যান", "Back to Website")}
          </Link>
        </div>

        {/* Login Card */}
        <Card className="rounded-[2rem] border-border/80 bg-card/95 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="font-display text-2xl font-bold text-foreground">
                {t("অ্যাডমিন লগইন", "Admin Login")}
              </CardTitle>
              <CardDescription className="font-bengali text-xs text-muted-foreground mt-1">
                {t("আননূর শিক্ষা পরিবার - সেন্ট্রাল সিএমএস পোর্টাল", "Annoor Education Family - CMS Portal")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-center font-bengali text-xs text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bengali text-xs font-semibold">
                  {t("অ্যাডমিন ইমেইল", "Admin Email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@annoor.edu.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bengali text-xs font-semibold">
                  {t("পাসওয়ার্ড", "Password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl pl-10 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl font-bengali text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("লগইন হচ্ছে...", "Signing in...")}
                  </>
                ) : (
                  t("লগইন করুন", "Sign In")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
