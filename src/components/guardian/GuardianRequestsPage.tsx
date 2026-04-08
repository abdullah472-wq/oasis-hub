import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { GuardianRequest } from "@/lib/adminDashboard";
import type { GuardianProfile } from "@/lib/guardianDashboardService";
import { createGuardianRequest } from "@/lib/guardianRequests";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GuardianRequestsPageProps {
  guardian: GuardianProfile;
  requests: GuardianRequest[];
  onCreated: (request: GuardianRequest) => void;
}

const GuardianRequestsPage = ({ guardian, requests, onCreated }: GuardianRequestsPageProps) => {
  const { t } = useLanguage();
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!topic.trim() || !message.trim()) {
      setError(t("বিষয় ও বার্তা দুটোই লিখতে হবে", "Both topic and message are required"));
      return;
    }

    setSaving(true);
    try {
      const created = await createGuardianRequest({
        guardianUid: guardian.uid,
        studentId: guardian.studentId,
        guardianName: guardian.fullName,
        studentName: guardian.studentName,
        topic,
        message,
      });

      onCreated(created);
      setTopic("");
      setMessage("");
      setSuccess(t("রিকোয়েস্ট পাঠানো হয়েছে", "Request sent successfully"));
    } catch (submissionError) {
      const code =
        typeof submissionError === "object" &&
        submissionError !== null &&
        "code" in submissionError
          ? String((submissionError as { code?: string }).code)
          : "";
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : typeof submissionError === "string"
            ? submissionError
            : "";

      if (code === "permission-denied") {
        setError(t("Firestore rules এই রিকোয়েস্ট অনুমোদন করছে না", "Firestore rules are blocking this request"));
      } else if (code === "unauthenticated") {
        setError(t("লগইন সেশন পাওয়া যায়নি। আবার লগইন করুন", "Authentication session was not found. Please log in again."));
      } else {
        setError(
          t("রিকোয়েস্ট পাঠানো যায়নি। আবার চেষ্টা করুন", "Request could not be sent. Please try again") +
            (code || message ? ` [${code || message}]` : ""),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
        <CardHeader>
          <CardTitle className="font-bengali text-xl">{t("নতুন রিকোয়েস্ট পাঠান", "Send a New Request")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label className="font-bengali text-sm font-medium text-foreground">{t("বিষয়", "Topic")}</label>
              <Input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="rounded-2xl"
                placeholder={t("যেমন: বকেয়া ফি / ফলাফলের কপি", "Example: Due fees / Result copy")}
              />
            </div>

            <div className="space-y-2">
              <label className="font-bengali text-sm font-medium text-foreground">{t("বার্তা", "Message")}</label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="rounded-2xl"
                rows={5}
                placeholder={t("আপনার প্রয়োজন বা অনুরোধ বিস্তারিত লিখুন", "Write your request details")}
              />
            </div>

            {error && <p className="font-bengali text-sm text-red-600">{error}</p>}
            {success && <p className="font-bengali text-sm text-emerald-600">{success}</p>}

            <Button type="submit" className="rounded-2xl font-bengali" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {t("রিকোয়েস্ট পাঠান", "Send Request")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
        <CardHeader>
          <CardTitle className="font-bengali text-xl">{t("আমার রিকোয়েস্টসমূহ", "My Requests")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 ? (
            <p className="font-bengali text-sm text-muted-foreground">
              {t("এখনও কোনো রিকোয়েস্ট পাঠানো হয়নি", "No requests have been sent yet")}
            </p>
          ) : (
            requests.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bengali text-sm font-semibold text-foreground">{item.topic}</p>
                    <p className="mt-1 font-bengali text-xs text-muted-foreground">{item.message}</p>
                  </div>
                  <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 font-bengali text-xs">
                    {item.status === "pending"
                      ? t("পেন্ডিং", "Pending")
                      : item.status === "in-review"
                        ? t("রিভিউতে", "In Review")
                        : t("সমাধান", "Resolved")}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardianRequestsPage;
