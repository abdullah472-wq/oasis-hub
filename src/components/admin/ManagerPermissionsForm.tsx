import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { permissionCatalog, type AdminPermission, type ManagerDraft } from "@/lib/adminDashboard";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ManagerPermissionsFormProps {
  value: ManagerDraft;
  onChange: (next: ManagerDraft) => void;
}

const ManagerPermissionsForm = ({ value, onChange }: ManagerPermissionsFormProps) => {
  const { t } = useLanguage();

  const selectedPermissions = useMemo(() => new Set(value.permissions), [value.permissions]);

  const togglePermission = (permission: AdminPermission, checked: boolean) => {
    const nextPermissions = checked
      ? Array.from(new Set([...value.permissions, permission]))
      : value.permissions.filter((item) => item !== permission);

    onChange({ ...value, permissions: nextPermissions });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3">
          <p className="font-bengali text-xs text-muted-foreground">{t("রোল", "Role")}</p>
          <div className="mt-2">
            <Badge variant="secondary" className="rounded-full capitalize">
              {value.role}
            </Badge>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3 md:col-span-2">
          <p className="font-bengali text-xs text-muted-foreground">{t("পারমিশন গাইড", "Permission guide")}</p>
          <p className="mt-2 font-bengali text-sm text-foreground">
            {t(
              "শুধু প্রয়োজনীয় access দিন, তাহলে manager dashboard কম জটিল এবং বেশি focused থাকবে।",
              "Grant only the access needed so the manager dashboard stays focused and easier to use.",
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="font-bengali">{t("পূর্ণ নাম", "Full name")}</Label>
          <Input
            value={value.fullName}
            onChange={(event) => onChange({ ...value, fullName: event.target.value })}
            placeholder={t("ম্যানেজারের নাম", "Manager name")}
            className="rounded-2xl"
          />
          <p className="font-bengali text-xs text-muted-foreground">
            {t("লিস্টে এই নামটাই দেখা যাবে", "This name is shown in manager lists")}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="font-bengali">{t("ইমেইল", "Email")}</Label>
          <Input
            type="email"
            value={value.email}
            onChange={(event) => onChange({ ...value, email: event.target.value })}
            placeholder="manager@example.com"
            className="rounded-2xl"
          />
          <p className="font-bengali text-xs text-muted-foreground">
            {t("ম্যানেজার এই ইমেইল দিয়ে লগইন করবে", "The manager signs in with this email")}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="font-bengali">{t("লগইন পাসওয়ার্ড", "Login password")}</Label>
          <Input
            type="text"
            value={value.password}
            onChange={(event) => onChange({ ...value, password: event.target.value })}
            placeholder={t("অন্তত ৬ অক্ষর", "At least 6 characters")}
            className="rounded-2xl"
          />
          <p className="font-bengali text-xs text-muted-foreground">
            {value.uid
              ? t("ফাঁকা রাখলে আগের পাসওয়ার্ড অপরিবর্তিত থাকবে", "Leave blank to keep the current password")
              : t("প্রথম লগইনের জন্য একটি শক্তিশালী পাসওয়ার্ড দিন", "Set a strong password for first sign-in")}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
          <div>
            <p className="font-bengali text-sm font-medium">{t("অ্যাকাউন্ট স্ট্যাটাস", "Account status")}</p>
            <p className="font-bengali text-xs text-muted-foreground">
              {t("বন্ধ করলে এই অ্যাকাউন্ট dashboard-এ ঢুকতে পারবে না", "Disabled accounts cannot access the dashboard")}
            </p>
          </div>
          <Switch
            checked={value.status === "active"}
            onCheckedChange={(checked) => onChange({ ...value, status: checked ? "active" : "inactive" })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
          <p className="font-bengali text-sm font-medium">{t("পারমিশন", "Permissions")}</p>
          <p className="mt-1 font-bengali text-xs text-muted-foreground">
            {t(
              "প্রতিটি toggle নির্দিষ্ট module-এর navigation, page access, এবং action control করে।",
              "Each toggle controls navigation, page access, and some actions for a specific module.",
            )}
          </p>
        </div>

        {permissionCatalog.map((group) => (
          <div key={group.groupKey} className="rounded-3xl border border-border/70 bg-muted/20 p-4">
            <div className="mb-3">
              <h4 className="font-bengali text-sm font-semibold text-foreground">{t(group.groupLabelBn, group.groupLabelEn)}</h4>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {group.items.map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm transition-colors hover:border-primary/40"
                >
                  <Checkbox
                    checked={selectedPermissions.has(item.key)}
                    onCheckedChange={(checked) => togglePermission(item.key, checked === true)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <p className="font-bengali text-sm font-medium">{t(item.labelBn, item.labelEn)}</p>
                    <p className="text-xs text-muted-foreground">{item.key}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerPermissionsForm;
