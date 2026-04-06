import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, EyeOff, HandHeart, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RamadanSettings } from "@/lib/ramadanSettings";
import type { RamadanSponsor, RamadanSponsorStatus, RamadanSponsorUpdateInput } from "@/lib/ramadanSponsors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, ModuleShell, ToggleRow, shellCardClass } from "../AdminPagePrimitives";

interface RamadanManagerPageProps {
  settings: RamadanSettings;
  requests: RamadanSponsor[];
  onSaveSettings: (settings: Pick<RamadanSettings, "isPublic">) => Promise<void>;
  onSaveRequest: (id: string, payload: RamadanSponsorUpdateInput) => Promise<void>;
  onDeleteRequest: (id: string) => Promise<void>;
}

const statusTone: Record<RamadanSponsorStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function RamadanManagerPage({
  settings,
  requests,
  onSaveSettings,
  onSaveRequest,
  onDeleteRequest,
}: RamadanManagerPageProps) {
  const { t } = useLanguage();
  const [isPublic, setIsPublic] = useState(settings.isPublic);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RamadanSponsorUpdateInput | null>(null);

  useEffect(() => {
    setIsPublic(settings.isPublic);
  }, [settings.isPublic]);

  const summary = useMemo(() => {
    const approved = requests.filter((item) => item.status === "approved");
    const pending = requests.filter((item) => item.status === "pending");
    return {
      totalRequests: requests.length,
      pendingCount: pending.length,
      approvedAmount: approved.reduce((sum, item) => sum + item.amount, 0),
      approvedDays: new Set(approved.map((item) => item.day)).size,
    };
  }, [requests]);

  const startEdit = (item: RamadanSponsor) => {
    setEditingId(item.id ?? null);
    setDraft({
      name: item.name,
      phone: item.phone,
      day: item.day,
      percentage: item.percentage,
      amount: item.amount,
      comment: item.comment || "",
      studentId: item.studentId || "",
      status: item.status,
      adminNote: item.adminNote || "",
    });
  };

  const resetEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!editingId || !draft) return;
    await onSaveRequest(editingId, draft);
    resetEdit();
  };

  return (
    <ModuleShell
      title={t("রমাদান ম্যানেজমেন্ট", "Ramadan Management")}
      description={t(
        "পাবলিক রমাদান পেজ দেখানো/হাইড করা, sponsorship request approve করা, এবং request edit বা delete করুন",
        "Show or hide the public Ramadan page and approve, edit, or delete sponsorship requests",
      )}
      icon={<CalendarDays className="h-5 w-5" />}
    >
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <Card className={shellCardClass}>
            <CardContent className="space-y-4 p-6">
              <h3 className="font-bengali text-lg font-semibold text-foreground">
                {t("পাবলিক পেজ কন্ট্রোল", "Public Page Control")}
              </h3>
              <ToggleRow
                label={t("রমাদান পেজ পাবলিকভাবে দেখান", "Show Ramadan page publicly")}
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Button className="rounded-2xl font-bengali" onClick={() => void onSaveSettings({ isPublic })}>
                {t("রমাদান সেটিংস সংরক্ষণ", "Save Ramadan Settings")}
              </Button>
            </CardContent>
          </Card>

          <Card className={shellCardClass}>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              {[
                { labelBn: "মোট রিকোয়েস্ট", labelEn: "Total Requests", value: summary.totalRequests, icon: HandHeart },
                { labelBn: "পেন্ডিং", labelEn: "Pending", value: summary.pendingCount, icon: CheckCircle2 },
                { labelBn: "অনুমোদিত টাকা", labelEn: "Approved Amount", value: `৳${summary.approvedAmount}`, icon: CalendarDays },
                { labelBn: "কভার হওয়া দিন", labelEn: "Covered Days", value: summary.approvedDays, icon: EyeOff },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.labelEn} className="rounded-3xl border border-border/70 bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bengali text-xs text-muted-foreground">{t(item.labelBn, item.labelEn)}</p>
                        <p className="font-display text-2xl font-bold text-foreground">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card className={shellCardClass}>
          <CardContent className="space-y-4 p-6">
            <div>
              <h3 className="font-bengali text-lg font-semibold text-foreground">
                {t("স্পন্সর রিকোয়েস্ট", "Sponsor Requests")}
              </h3>
              <p className="font-bengali text-sm text-muted-foreground">
                {t("নতুন request approve করুন, প্রয়োজন হলে এডিট করুন, এবং অপ্রয়োজনীয় request delete করুন", "Approve, edit, or delete incoming requests")}
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center font-bengali text-sm text-muted-foreground">
                {t("এখনও কোনো রমাদান sponsorship request আসেনি", "No Ramadan sponsorship requests yet")}
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((item) => {
                  const isEditing = editingId === item.id && draft;

                  return (
                    <div key={item.id} className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bengali text-base font-semibold text-foreground">{item.name}</h4>
                            <Badge variant="outline" className={`rounded-full border ${statusTone[item.status]}`}>
                              {t(
                                item.status === "pending"
                                  ? "পেন্ডিং"
                                  : item.status === "approved"
                                    ? "অনুমোদিত"
                                    : "রিজেক্টেড",
                                item.status,
                              )}
                            </Badge>
                          </div>
                          <p className="font-bengali text-sm text-muted-foreground">
                            {t(`${item.day} রমাদান`, `Day ${item.day}`)} • {item.phone} • {item.percentage}% • ৳{item.amount}
                          </p>
                          {item.comment && <p className="font-bengali text-sm text-muted-foreground">{item.comment}</p>}
                          {item.studentId && (
                            <p className="font-bengali text-xs text-muted-foreground">
                              {t("স্টুডেন্ট আইডি", "Student ID")}: {item.studentId}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {item.id && item.status === "pending" && (
                            <Button
                              variant="secondary"
                              className="rounded-2xl font-bengali"
                              onClick={() =>
                                void onSaveRequest(item.id!, {
                                  name: item.name,
                                  phone: item.phone,
                                  day: item.day,
                                  percentage: item.percentage,
                                  amount: item.amount,
                                  comment: item.comment || "",
                                  studentId: item.studentId || "",
                                  status: "approved",
                                  adminNote: item.adminNote || "",
                                })
                              }
                            >
                              {t("একসেপ্ট", "Accept")}
                            </Button>
                          )}
                          <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => startEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl text-red-600 hover:text-red-600"
                            onClick={() => item.id && void onDeleteRequest(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-5 grid gap-4 rounded-3xl border border-border/70 bg-card p-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label={t("নাম", "Name")}>
                              <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="rounded-2xl" />
                            </Field>
                            <Field label={t("মোবাইল", "Phone")}>
                              <Input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className="rounded-2xl" />
                            </Field>
                          </div>

                          <div className="grid gap-4 md:grid-cols-4">
                            <Field label={t("দিন", "Day")}>
                              <Input type="number" min={1} max={25} value={draft.day} onChange={(event) => setDraft({ ...draft, day: Number(event.target.value) || 1 })} className="rounded-2xl" />
                            </Field>
                            <Field label={t("শেয়ার %", "Share %")}>
                              <Input type="number" min={1} max={100} value={draft.percentage} onChange={(event) => setDraft({ ...draft, percentage: Number(event.target.value) || 0 })} className="rounded-2xl" />
                            </Field>
                            <Field label={t("টাকা", "Amount")}>
                              <Input type="number" min={0} value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) || 0 })} className="rounded-2xl" />
                            </Field>
                            <Field label={t("স্ট্যাটাস", "Status")}>
                              <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as RamadanSponsorStatus })} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
                                <option value="pending">{t("পেন্ডিং", "Pending")}</option>
                                <option value="approved">{t("অনুমোদিত", "Approved")}</option>
                                <option value="rejected">{t("রিজেক্টেড", "Rejected")}</option>
                              </select>
                            </Field>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label={t("স্টুডেন্ট আইডি", "Student ID")}>
                              <Input value={draft.studentId || ""} onChange={(event) => setDraft({ ...draft, studentId: event.target.value })} className="rounded-2xl" />
                            </Field>
                            <Field label={t("অ্যাডমিন নোট", "Admin Note")}>
                              <Input value={draft.adminNote || ""} onChange={(event) => setDraft({ ...draft, adminNote: event.target.value })} className="rounded-2xl" />
                            </Field>
                          </div>

                          <Field label={t("কমেন্ট", "Comment")}>
                            <Textarea value={draft.comment || ""} onChange={(event) => setDraft({ ...draft, comment: event.target.value })} className="rounded-2xl" rows={3} />
                          </Field>

                          <div className="flex flex-wrap gap-3">
                            <Button className="rounded-2xl font-bengali" onClick={() => void saveEdit()}>
                              {t("আপডেট সংরক্ষণ", "Save Update")}
                            </Button>
                            <Button variant="outline" className="rounded-2xl font-bengali" onClick={resetEdit}>
                              {t("বাতিল", "Cancel")}
                            </Button>
                            <Button
                              variant="secondary"
                              className="rounded-2xl font-bengali"
                              onClick={() => {
                                if (!editingId) return;
                                const approvedDraft = { ...draft, status: "approved" as const };
                                setDraft(approvedDraft);
                                void onSaveRequest(editingId, approvedDraft).then(resetEdit);
                              }}
                            >
                              {t("একসেপ্ট করুন", "Accept")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  );
}
