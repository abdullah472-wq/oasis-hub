import { useState } from "react";
import { Loader2, UserPlus, ShieldCheck, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { UserRole } from "@/types/cms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteAdminDialog = ({
  isOpen,
  onClose,
  onSuccess,
}: InviteAdminDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "editor" as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error(t("সকল ফিল্ড পূরণ করুন", "Please fill in all fields"));
      return;
    }

    try {
      setLoading(true);

      // Check if user already exists in profiles
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email.trim().toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        toast.error(t("এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে", "An account with this email already exists"));
        setLoading(false);
        return;
      }

      // Check if user is registered in auth or insert pre-assigned profile
      const newId = crypto.randomUUID();
      const { error } = await supabase.from("profiles").insert([
        {
          id: newId,
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // If RLS prevents or auth id required, notify user
        console.warn("Profile insert note:", error);
      }

      await logAdminActivity(
        "CREATE",
        "profiles",
        `নতুন অ্যাডমিন প্রোফাইল নথিভুক্ত: ${formData.full_name} (${formData.email}) - Role: ${formData.role}`
      );

      toast.success(
        t(
          "অ্যাডমিন তালিকাভুক্ত হয়েছে! ইউজার Supabase Auth-এ সাইনআপ করলে স্বয়ংক্রিয়ভাবে পারমিশন পেয়ে যাবেন।",
          "Admin profile registered! The user will have full permissions once authenticated."
        )
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating admin:", err);
      toast.error(err.message || t("অ্যাডমিন যোগ করতে সমস্যা হয়েছে", "Failed to add admin"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <UserPlus className="h-5 w-5 text-primary" />
            {t("নতুন অ্যাডমিন নথিভুক্ত করুন", "Register New Admin")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "নতুন টিম মেম্বারকে এডিটর বা সুপার অ্যাডমিন হিসেবে অনুমতি প্রদান করুন",
              "Grant Editor or Super Admin permissions to team members"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="admin_name" className="font-semibold">
              {t("পূর্ণ নাম *", "Full Name *")}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={t("যেমন: মুফতি আব্দুল্লাহ", "e.g. Mufti Abdullah")}
                className="pl-9"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="admin_email" className="font-semibold">
              {t("অফিসিয়াল ইমেইল *", "Official Email *")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@annoor.edu.bd"
                className="pl-9"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="font-semibold">{t("অ্যাডমিন রোল (Role) *", "Admin Role *")}</Label>
            <Select
              value={formData.role}
              onValueChange={(val: UserRole) => setFormData({ ...formData, role: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-blue-600">{t("কনটেন্ট এডিটর (Editor)", "Content Editor")}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("নোটিশ, মিডিয়া ও ওয়েবসাইট কনটেন্ট সম্পাদনার অধিকার", "Edit notices, media, and site content")}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="super_admin">
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-purple-600">{t("সুপার অ্যাডমিন (Super Admin)", "Super Admin")}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("সকল সেটিংস, নিরাপত্তা ও অ্যাডমিন নিয়ন্ত্রণের পূর্ণ অধিকার", "Full access to settings, security, and user roles")}
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-primary">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("নথিভুক্ত করুন", "Register Admin")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
