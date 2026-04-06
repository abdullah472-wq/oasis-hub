import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface GuardianPendingPageProps {
  inactive?: boolean;
  onLogout?: () => void;
}

const GuardianPendingPage = ({ inactive = false, onLogout }: GuardianPendingPageProps) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_35%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
          <CardContent className="space-y-5 p-10 text-center">
            <h1 className="font-bengali text-3xl font-semibold text-foreground">
              {inactive ? t("এই অ্যাকাউন্টটি নিষ্ক্রিয়", "This account is inactive") : t("আপনার অ্যাকাউন্ট অনুমোদনের অপেক্ষায় আছে", "Your account is waiting for approval")}
            </h1>
            <p className="font-bengali text-muted-foreground">
              {inactive
                ? t("অ্যাকাউন্ট সক্রিয় করতে প্রশাসনের সাথে যোগাযোগ করুন।", "Please contact the administration to activate this account.")
                : t("আপনার রেজিস্ট্রেশন গ্রহণ করা হয়েছে। অ্যাডমিন অনুমোদনের পর আপনি ড্যাশবোর্ড ব্যবহার করতে পারবেন।", "Your registration has been received. You will be able to use the dashboard after admin approval.")}
            </p>
            <div className="flex justify-center gap-3">
              {onLogout && (
                <Button className="rounded-2xl font-bengali" onClick={onLogout}>
                  {t("লগআউট", "Logout")}
                </Button>
              )}
              <Button asChild variant="outline" className="rounded-2xl font-bengali">
                <Link to="/">{t("হোম পেইজে যান", "Back to Home")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuardianPendingPage;
