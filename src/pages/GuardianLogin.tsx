import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GuardianLogin = () => {
  const { t } = useLanguage();
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const profile = await login(email, password);
      if (profile.role !== "guardian") {
        await logout();
        setError(t("??? ????????? ?????????? ??", "This is not a guardian account"));
        return;
      }
      if (profile.status !== "active") {
        setError(t("????? ????????? ?????????? ???? ????????? ????", "Your guardian account is not active yet"));
        return;
      }
      navigate("/guardian", { replace: true });
    } catch (err) {
      console.error("Guardian login failed", err);
      setError(t("????? ?? ????????? ???? ??", "Incorrect email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <Card className="w-full max-w-md rounded-3xl shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="font-bengali text-2xl font-semibold text-foreground">
            {t("????????? ????", "Guardian Login")}
          </CardTitle>
          <CardDescription className="font-bengali text-sm text-muted-foreground">
            {t("Firebase ?????-????????? ???? ???? ?? ????", "Sign in with your Firebase email and password")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bengali" htmlFor="email">
                {t("?????", "Email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali" htmlFor="password">
                {t("?????????", "Password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl"
                required
              />
            </div>
            {error && <p className="font-bengali text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="h-11 w-full rounded-2xl text-base font-semibold">
              <LogIn className="mr-2 h-5 w-5" /> {loading ? t("???? ?????...", "Signing in...") : t("???? ????", "Sign In")}
            </Button>
          </form>
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <Link to="/guardian-register" className="font-bengali font-semibold text-primary hover:underline">
              {t("????????? ????????????", "Register as guardian")}
            </Link>
            <Link to="/admin" className="font-bengali hover:underline">
              {t("???????? / ????????? ????", "Admin / Manager login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardianLogin;
