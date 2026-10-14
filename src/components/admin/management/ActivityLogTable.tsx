import { useState, useEffect, useMemo } from "react";
import {
  History,
  Search,
  RotateCw,
  PlusCircle,
  FileEdit,
  Trash2,
  LogIn,
  LogOut,
  ShieldAlert,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ActivityLog } from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export const ActivityLogTable = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as ActivityLog[]) || []);
    } catch (err: any) {
      console.error("Error fetching activity logs:", err);
      toast.error(t("অডিট লগ লোড করতে সমস্যা হয়েছে", "Failed to load audit logs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200 gap-1">
            <PlusCircle className="h-3 w-3" />
            CREATE
          </Badge>
        );
      case "UPDATE":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-200 gap-1">
            <FileEdit className="h-3 w-3" />
            UPDATE
          </Badge>
        );
      case "DELETE":
        return (
          <Badge className="bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border-rose-200 gap-1">
            <Trash2 className="h-3 w-3" />
            DELETE
          </Badge>
        );
      case "LOGIN":
        return (
          <Badge className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 border-purple-200 gap-1">
            <LogIn className="h-3 w-3" />
            LOGIN
          </Badge>
        );
      case "LOGOUT":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200 gap-1">
            <LogOut className="h-3 w-3" />
            LOGOUT
          </Badge>
        );
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getModuleBadge = (moduleName: string) => {
    switch (moduleName) {
      case "notices":
        return <Badge variant="secondary">{t("নোটিশ", "Notices")}</Badge>;
      case "media_videos":
      case "media":
        return <Badge variant="secondary">{t("ইউটিউব ভিডিও", "Videos")}</Badge>;
      case "gallery_items":
        return <Badge variant="secondary">{t("গ্যালারি", "Gallery")}</Badge>;
      case "downloads":
        return <Badge variant="secondary">{t("ডাউনলোড", "Downloads")}</Badge>;
      case "marquee_notices":
        return <Badge variant="secondary">{t("মারকুই", "Marquee")}</Badge>;
      case "hero_banners":
        return <Badge variant="secondary">{t("হিরো ব্যানার", "Hero")}</Badge>;
      case "achievements":
        return <Badge variant="secondary">{t("অর্জন", "Achievements")}</Badge>;
      case "testimonials":
        return <Badge variant="secondary">{t("টেস্টিমোনিয়াল", "Reviews")}</Badge>;
      case "site_settings":
      case "settings":
        return <Badge variant="secondary">{t("সেটিংস", "Settings")}</Badge>;
      case "profiles":
      case "admins":
        return <Badge variant="secondary">{t("অ্যাডমিন", "Admins")}</Badge>;
      default:
        return <Badge variant="outline">{moduleName}</Badge>;
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchQuery.trim() ||
        log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.module.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      const matchesModule =
        moduleFilter === "all" ||
        log.module.toLowerCase().includes(moduleFilter.toLowerCase());

      return matchesSearch && matchesAction && matchesModule;
    });
  }, [logs, searchQuery, actionFilter, moduleFilter]);

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("ইউজার বা কাজের বিবরণ খুঁজুন...", "Search user or activity...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Action Filter */}
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={t("অ্যাকশন", "Action")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("সকল অ্যাকশন", "All Actions")}</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="LOGIN">LOGIN</SelectItem>
              <SelectItem value="LOGOUT">LOGOUT</SelectItem>
            </SelectContent>
          </Select>

          {/* Module Filter */}
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={t("মডিউল", "Module")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("সকল মডিউল", "All Modules")}</SelectItem>
              <SelectItem value="notices">{t("নোটিশ", "Notices")}</SelectItem>
              <SelectItem value="media">{t("মিডিয়া", "Media")}</SelectItem>
              <SelectItem value="gallery">{t("গ্যালারি", "Gallery")}</SelectItem>
              <SelectItem value="downloads">{t("ডাউনলোড", "Downloads")}</SelectItem>
              <SelectItem value="marquee">{t("মারকুই", "Marquee")}</SelectItem>
              <SelectItem value="hero">{t("হিরো ব্যানার", "Hero Banners")}</SelectItem>
              <SelectItem value="achievements">{t("অর্জন", "Achievements")}</SelectItem>
              <SelectItem value="testimonials">{t("টেস্টিমোনিয়াল", "Reviews")}</SelectItem>
              <SelectItem value="settings">{t("সেটিংস", "Settings")}</SelectItem>
              <SelectItem value="profiles">{t("অ্যাডমিন", "Admins")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={fetchLogs}
          disabled={loading}
          title={t("রিফ্রেশ", "Refresh")}
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Table View */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[110px]">{t("অ্যাকশন", "Action")}</TableHead>
              <TableHead className="w-[120px]">{t("মডিউল", "Module")}</TableHead>
              <TableHead>{t("অ্যাক্টিভিটি বিবরণ", "Activity Details")}</TableHead>
              <TableHead className="w-[200px]">{t("ইউজার / অ্যাডমিন", "User / Admin")}</TableHead>
              <TableHead className="w-[180px] text-right">{t("সময়", "Timestamp")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RotateCw className="h-5 w-5 animate-spin text-primary" />
                    <span>{t("লগ লোড হচ্ছে...", "Loading activity logs...")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="h-8 w-8 text-muted-foreground/40" />
                    <p>{t("কোনো অডিট লগ রেকর্ড পাওয়া যায়নি", "No activity logs recorded")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell>
                    {getModuleBadge(log.module)}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {log.details}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-[180px] font-mono" title={log.user_email}>
                        {log.user_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatTimestamp(log.created_at)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
