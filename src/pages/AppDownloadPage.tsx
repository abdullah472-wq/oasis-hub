import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAppDownloadSettings, type AppDownloadSettings } from "@/lib/appDownloadSettings";
import { downloadFile } from "@/lib/upload";

const defaultSettings: AppDownloadSettings = {
  enabled: false,
  apkUrl: "",
  version: "",
  releaseNotesBn: "",
  releaseNotesEn: "",
  fileName: "",
  fileSizeLabel: "",
  updatedAt: 0,
};

const AppDownloadPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [settings, setSettings] = useState<AppDownloadSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const showRegistrationNotice = new URLSearchParams(location.search).get("registered") === "1";

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const next = await getAppDownloadSettings();
        if (active) setSettings(next);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const hasDownload = settings.enabled && settings.apkUrl.trim();
  const fileName = settings.fileName.trim() || "guardian-app.apk";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,74,62,0.12),_transparent_35%),linear-gradient(180deg,#f7faf6_0%,#eef5ed_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-4 py-2 font-bengali text-sm text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("হোমে ফিরে যান", "Back to home")}
        </Link>

        <Card className="rounded-[32px] border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Smartphone className="h-8 w-8" />
            </div>
            <CardTitle className="font-bengali text-3xl">{t("গার্ডিয়ান অ্যাপ ডাউনলোড", "Download Guardian App")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {showRegistrationNotice ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bengali text-lg font-semibold text-foreground">
                      {t("রেজিস্ট্রেশন জমা হয়েছে", "Registration Submitted")}
                    </p>
                    <p className="font-bengali text-sm text-muted-foreground">
                      {t("আপনার রেজিস্ট্রেশন গ্রহণ করা হয়েছে। অ্যাডমিন অনুমোদনের পর আপনি লগইন করতে পারবেন।", "Your registration has been received. You will be able to log in after admin approval.")}
                    </p>
                    <p className="font-bengali text-sm text-muted-foreground">
                      {t("এখনই Official Annoor App ডাউনলোড করুন। অ্যাপ ডাউনলোড করে ইনস্টল করুন, অনুমোদনের পর সেখান থেকে লগইন করতে পারবেন।", "Download Official Annoor App now. Download and install the app; after approval you can log in from there.")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {loading ? (
              <p className="text-center font-bengali text-muted-foreground">{t("অ্যাপ তথ্য লোড হচ্ছে...", "Loading app information...")}</p>
            ) : hasDownload ? (
              <>
                <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    {settings.version ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {t("ভার্সন", "Version")}: {settings.version}
                      </span>
                    ) : null}
                    {settings.fileSizeLabel ? (
                      <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-foreground">
                        {t("সাইজ", "Size")}: {settings.fileSizeLabel}
                      </span>
                    ) : null}
                  </div>

                  {(settings.releaseNotesBn || settings.releaseNotesEn) ? (
                    <p className="mt-4 font-bengali text-sm text-muted-foreground">
                      {t(settings.releaseNotesBn || settings.releaseNotesEn, settings.releaseNotesEn || settings.releaseNotesBn)}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => void downloadFile(settings.apkUrl, fileName)}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 font-bengali text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("APK ডাউনলোড করুন", "Download APK")}
                </button>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
                <p className="font-bengali text-base font-semibold text-foreground">
                  {t("এখনও কোনো APK প্রকাশ করা হয়নি", "No APK has been published yet")}
                </p>
                <p className="mt-2 font-bengali text-sm text-muted-foreground">
                  {t("অনুগ্রহ করে পরে আবার চেষ্টা করুন বা প্রতিষ্ঠানের সাথে যোগাযোগ করুন", "Please try again later or contact the institution")}
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <Button asChild variant="outline" className="rounded-2xl font-bengali">
                <Link to="/">{t("à¦¹à§‹à¦®à§‡ à¦«à¦¿à¦°à§‡ à¦¯à¦¾à¦¨", "Back to home")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppDownloadPage;
