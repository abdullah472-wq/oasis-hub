import { useMemo, useState } from "react";
import { Edit3, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createManagerDraft, type ManagerDraft } from "@/lib/adminDashboard";
import type { FirestoreUserProfile } from "@/lib/adminUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ManagerPermissionsForm from "./ManagerPermissionsForm";

interface ManagersPageProps {
  managers: FirestoreUserProfile[];
  onSave: (manager: ManagerDraft) => Promise<void>;
  onDelete: (uid: string) => Promise<void>;
}

const ManagersPage = ({ managers, onSave, onDelete }: ManagersPageProps) => {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<ManagerDraft | null>(null);

  const managerSummary = useMemo(
    () => ({
      total: managers.length,
      active: managers.filter((item) => item.status === "active").length,
      restricted: managers.filter((item) => item.permissions.length <= 3).length,
    }),
    [managers],
  );

  const startCreate = () => setDraft(createManagerDraft());
  const startEdit = (manager: FirestoreUserProfile) =>
    setDraft({
      uid: manager.uid,
      fullName: manager.fullName,
      email: manager.email,
      password: "",
      role: manager.role === "guardian" ? "guardian" : "manager",
      status: manager.status,
      permissions: manager.permissions,
    });
  const closeDialog = () => setDraft(null);

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.fullName.trim() || !draft.email.trim()) return;
    if (!draft.uid && !draft.password.trim()) return;
    await onSave({ ...draft, email: draft.email.trim().toLowerCase() });
    closeDialog();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title={t("মোট ম্যানেজার", "Total Managers")} value={managerSummary.total} description={t("বর্তমান ড্যাশবোর্ড অ্যাকাউন্ট", "Current dashboard accounts")} />
        <SummaryCard title={t("সক্রিয়", "Active")} value={managerSummary.active} description={t("যারা বর্তমানে লগইন করতে পারে", "Can currently log in")} />
        <SummaryCard title={t("সীমিত এক্সেস", "Restricted")} value={managerSummary.restricted} description={t("৩ বা কম পারমিশন আছে", "3 or fewer permissions")} />
      </div>

      <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="font-bengali text-xl">{t("ম্যানেজার পারমিশন সেন্টার", "Manager Permission Center")}</CardTitle>
            <CardDescription className="font-bengali">{t("এখান থেকে প্রতিটি ম্যানেজারের অ্যাক্সেস আলাদাভাবে নিয়ন্ত্রণ করুন", "Control each manager's access individually")}</CardDescription>
          </div>
          <Button onClick={startCreate} className="rounded-2xl font-bengali">
            <Plus className="mr-2 h-4 w-4" />
            {t("নতুন ম্যানেজার", "New Manager")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {managers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center">
              <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-primary/70" />
              <p className="font-bengali text-base font-medium">{t("এখনও কোনো ম্যানেজার তৈরি করা হয়নি", "No manager has been created yet")}</p>
              <p className="mt-1 font-bengali text-sm text-muted-foreground">{t("প্রথম ম্যানেজার অ্যাকাউন্ট তৈরি করে নির্দিষ্ট মডিউলের পারমিশন দিন", "Create the first manager account and assign module permissions")}</p>
            </div>
          ) : (
            managers.map((manager) => (
              <div key={manager.uid} className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bengali text-lg font-semibold text-foreground">{manager.fullName}</h3>
                      <Badge variant={manager.status === "active" ? "default" : "secondary"} className="rounded-full capitalize">
                        {manager.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{manager.email}</p>
                    <div className="flex flex-wrap gap-2">
                      {manager.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="rounded-full bg-white">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-2xl font-bengali" onClick={() => startEdit(manager)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      {t("এডিট", "Edit")}
                    </Button>
                    <Button variant="outline" className="rounded-2xl font-bengali text-red-600 hover:text-red-600" onClick={() => void onDelete(manager.uid)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("মুছুন", "Delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">
              {draft?.uid ? t("ম্যানেজার কনফিগারেশন", "Manager Configuration") : t("নতুন ম্যানেজার", "New Manager")}
            </DialogTitle>
            <DialogDescription className="font-bengali">
              {t("নিচের পারমিশনগুলো টগল করে মডিউলভিত্তিক অ্যাক্সেস দিন বা বন্ধ করুন", "Toggle permissions below to grant or revoke module-level access")}
            </DialogDescription>
          </DialogHeader>

          {draft && <ManagerPermissionsForm value={draft} onChange={setDraft} />}

          <DialogFooter>
            <Button variant="outline" className="rounded-2xl font-bengali" onClick={closeDialog}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button className="rounded-2xl font-bengali" onClick={handleSave}>
              {t("সংরক্ষণ করুন", "Save Manager")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SummaryCard = ({ title, value, description }: { title: string; value: number; description: string }) => (
  <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.35)]">
    <CardContent className="space-y-2 p-6">
      <p className="font-bengali text-sm text-muted-foreground">{title}</p>
      <p className="font-display text-3xl font-semibold text-foreground">{value}</p>
      <p className="font-bengali text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default ManagersPage;
