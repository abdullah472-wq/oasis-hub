import { useEffect, useState } from "react";
import { Clock, ShieldCheck, FileText, Film, Globe, Settings, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ActivityLog } from "@/types/cms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const RecentActivityList = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching activity logs:", error);
        } else if (mounted) {
          setLogs(data || []);
        }
      } catch (err) {
        console.error("Failed to load activities:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchLogs();

    return () => {
      mounted = false;
    };
  }, []);

  const getActionBadgeVariant = (action: ActivityLog["action"]) => {
    switch (action) {
      case "CREATE":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200/50";
      case "UPDATE":
        return "bg-blue-500/10 text-blue-600 border-blue-200/50";
      case "DELETE":
        return "bg-rose-500/10 text-rose-600 border-rose-200/50";
      case "LOGIN":
      case "LOGOUT":
        return "bg-purple-500/10 text-purple-600 border-purple-200/50";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getModuleIcon = (module: ActivityLog["module"]) => {
    switch (module) {
      case "notices":
        return <FileText className="h-4 w-4 text-primary" />;
      case "media":
        return <Film className="h-4 w-4 text-purple-600" />;
      case "content":
        return <Globe className="h-4 w-4 text-teal-600" />;
      case "settings":
        return <Settings className="h-4 w-4 text-amber-600" />;
      case "admins":
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      default:
        return <Lock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatLogDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(t("bn-BD", "en-GB"), {
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
    <Card className="rounded-3xl border-border/70 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-bengali text-lg font-bold text-foreground">
              {t("সাম্প্রতিক কার্যক্রম", "Recent Activities")}
            </CardTitle>
            <CardDescription className="font-bengali text-xs text-muted-foreground mt-0.5">
              {t("অ্যাডমিনদের সর্বশেষ সম্পাদন ও লগইন রেকর্ড", "Audit trail of recent admin actions and updates")}
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full font-bengali text-xs">
            {logs.length} {t("টি রেকর্ড", "records")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center">
            <Clock className="mx-auto mb-2 h-7 w-7 text-muted-foreground/60" />
            <p className="font-bengali text-sm text-muted-foreground">
              {t("এখনও কোনো কার্যক্রম রেকর্ড পাওয়া যায়নি", "No recent activity recorded yet")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/80">
                    {getModuleIcon(log.module)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${getActionBadgeVariant(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="font-bengali text-xs font-semibold text-foreground">
                        {log.details}
                      </span>
                    </div>
                    <p className="font-bengali mt-0.5 text-[11px] text-muted-foreground">
                      {log.user_email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end text-[11px] text-muted-foreground sm:self-center">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatLogDate(log.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
