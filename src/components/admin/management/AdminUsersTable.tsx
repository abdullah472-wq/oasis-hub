import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  Search,
  RotateCw,
  Mail,
  Calendar,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Profile, UserRole } from "@/types/cms";
import { InviteAdminDialog } from "./InviteAdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AdminUsersTable = () => {
  const { t } = useLanguage();
  const { profile: currentAdminProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ profile: Profile; newRole: UserRole } | null>(null);

  const isCurrentSuperAdmin = currentAdminProfile?.role === "super_admin";

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles((data as Profile[]) || []);
    } catch (err: any) {
      console.error("Error fetching admin profiles:", err);
      toast.error(t("অ্যাডমিন তালিকা লোড করতে সমস্যা হয়েছে", "Failed to load admin profiles"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget) return;
    const { profile, newRole } = roleChangeTarget;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", profile.id);

      if (error) throw error;

      await logAdminActivity(
        "UPDATE",
        "profiles",
        `রোল পরিবর্তন: "${profile.full_name}" (${profile.email}) -> ${newRole}`
      );

      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, role: newRole } : p))
      );

      toast.success(
        t(
          `"${profile.full_name}"-এর রোল সফলভাবে আপডেট হয়েছে`,
          `Role updated successfully for "${profile.full_name}"`
        )
      );
      setRoleChangeTarget(null);
    } catch (err: any) {
      console.error("Error changing role:", err);
      toast.error(t("রোল পরিবর্তন করতে সমস্যা হয়েছে", "Failed to change role"));
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || p.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [profiles, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    const total = profiles.length;
    const superAdmins = profiles.filter((p) => p.role === "super_admin").length;
    const editors = profiles.filter((p) => p.role === "editor").length;
    return { total, superAdmins, editors };
  }, [profiles]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/60 shadow-xs backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("মোট অ্যাডমিন ব্যবহারকারী", "Total Admin Users")}
              </p>
              <p className="text-xl font-bold tracking-tight">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-xs backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("সুপার অ্যাডমিন", "Super Admins")}
              </p>
              <p className="text-xl font-bold tracking-tight text-purple-600">
                {stats.superAdmins}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-xs backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("কনটেন্ট এডিটর", "Content Editors")}
              </p>
              <p className="text-xl font-bold tracking-tight text-blue-600">
                {stats.editors}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("নাম বা ইমেইল দিয়ে খুঁজুন...", "Search name or email...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder={t("রোল ফিল্টার", "Filter Role")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("সকল রোল", "All Roles")}</SelectItem>
              <SelectItem value="super_admin">{t("সুপার অ্যাডমিন", "Super Admin")}</SelectItem>
              <SelectItem value="editor">{t("এডিটর", "Editor")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchProfiles}
            disabled={loading}
            title={t("রিফ্রেশ", "Refresh")}
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => setIsInviteOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t("নতুন অ্যাডমিন", "Invite Admin")}</span>
          </Button>
        </div>
      </div>

      {/* Table View */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>{t("অ্যাডমিন ব্যবহারকারী", "Admin User")}</TableHead>
              <TableHead className="w-[180px]">{t("রোল (Role)", "Role")}</TableHead>
              <TableHead className="w-[160px]">{t("যুক্ত হওয়ার তারিখ", "Joined Date")}</TableHead>
              <TableHead className="w-[140px] text-right">{t("পারমিশন পরিবর্তন", "Role Assignment")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RotateCw className="h-5 w-5 animate-spin text-primary" />
                    <span>{t("অ্যাডমিন তালিকা লোড হচ্ছে...", "Loading admin profiles...")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserCheck className="h-8 w-8 text-muted-foreground/40" />
                    <p>{t("কোনো অ্যাডমিন প্রোফাইল পাওয়া যায়নি", "No admin profiles found")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((p) => {
                const isSelf = currentAdminProfile?.id === p.id;
                return (
                  <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          {p.avatar_url && <AvatarImage src={p.avatar_url} alt={p.full_name} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {p.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">
                              {p.full_name}
                            </span>
                            {isSelf && (
                              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary">
                                {t("আপনি", "You")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {p.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {p.role === "super_admin" ? (
                        <Badge className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 gap-1 border-purple-200">
                          <ShieldCheck className="h-3 w-3" />
                          {t("সুপার অ্যাডমিন", "Super Admin")}
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 gap-1 border-blue-200">
                          <UserCheck className="h-3 w-3" />
                          {t("কনটেন্ট এডিটর", "Content Editor")}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(p.created_at)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {isCurrentSuperAdmin && !isSelf ? (
                        <Select
                          value={p.role}
                          onValueChange={(val: UserRole) => {
                            if (val !== p.role) {
                              setRoleChangeTarget({ profile: p, newRole: val });
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 w-[130px] ml-auto text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">{t("এডিটর", "Editor")}</SelectItem>
                            <SelectItem value="super_admin">{t("সুপার অ্যাডমিন", "Super Admin")}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center justify-end gap-1">
                          <Lock className="h-3 w-3" />
                          {isSelf ? t("লগইনকৃত", "Active") : t("সুরক্ষিত", "Protected")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Dialog */}
      <InviteAdminDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={fetchProfiles}
      />

      {/* Role Change Confirmation */}
      <AlertDialog
        open={!!roleChangeTarget}
        onOpenChange={(open) => !open && setRoleChangeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("অ্যাডমিন পারমিশন পরিবর্তন করতে চান?", "Confirm Role Change?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `"${roleChangeTarget?.profile.full_name}"-এর নতুন ভূমিকা হিসেবে "${roleChangeTarget?.newRole === "super_admin" ? "সুপার অ্যাডমিন" : "এডিটর"}" নির্ধারণ করা হবে।`,
                `Change role of "${roleChangeTarget?.profile.full_name}" to "${roleChangeTarget?.newRole}".`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRoleChange}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t("হ্যাঁ, পরিবর্তন করুন", "Yes, Change Role")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
