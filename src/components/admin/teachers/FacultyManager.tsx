import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  RotateCw,
  Building,
  Briefcase,
  Star,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  getFacultyList,
  getCachedFaculty,
  deleteFacultyMember,
  saveFacultyMember,
  FACULTY_UPDATED_EVENT,
  type FacultyMember,
  type FacultyRoleCategory,
  type CampusType,
} from "@/lib/faculty";
import { FacultyDialog } from "./FacultyDialog";

export const FacultyManager = () => {
  const { t } = useLanguage();
  const [faculty, setFaculty] = useState<FacultyMember[]>(() => getCachedFaculty());
  const [loading, setLoading] = useState(() => faculty.length === 0);
  const [searchQuery, setSearchQuery] = useState("");

  const [categoryFilter, setCategoryFilter] = useState<"all" | FacultyRoleCategory>("all");
  const [campusFilter, setCampusFilter] = useState<"all" | CampusType>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FacultyMember | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<FacultyMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (showLoading: boolean = faculty.length === 0) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getFacultyList();
      setFaculty(data);
    } catch (err) {
      console.error("Failed to load faculty:", err);
      toast.error(t("তথ্য লোড করতে সমস্যা হয়েছে", "Failed to load data"));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(faculty.length === 0);

    const handleSync = (e?: Event) => {
      if (e instanceof CustomEvent && Array.isArray(e.detail)) {
        setFaculty(e.detail);
        return;
      }
      setFaculty(getCachedFaculty());
    };

    window.addEventListener(FACULTY_UPDATED_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(FACULTY_UPDATED_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleToggleStatus = async (item: FacultyMember) => {
    try {
      await saveFacultyMember({
        ...item,
        is_active: !item.is_active,
      });
      toast.success(
        !item.is_active
          ? t("সদস্য সক্রিয় করা হয়েছে", "Member activated")
          : t("সদস্য নিষ্ক্রিয় করা হয়েছে", "Member deactivated")
      );
      loadData();
    } catch (err) {
      toast.error(t("স্ট্যাটাস পরিবর্তন ব্যর্থ", "Failed to toggle status"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    try {
      setIsDeleting(true);
      await deleteFacultyMember(target.id);
      toast.success(t("সদস্য সফলভাবে মুছে ফেলা হয়েছে", "Member deleted"));
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      console.error("Delete faculty error:", err);
      toast.error(err?.message || t("মুছে ফেলতে ব্যর্থ", "Failed to delete member"));
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return faculty.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (campusFilter !== "all" && item.campus !== "both" && item.campus !== campusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          item.name_bn.toLowerCase().includes(q) ||
          item.name_en.toLowerCase().includes(q);
        const matchDesig =
          item.designation_bn.toLowerCase().includes(q) ||
          item.designation_en.toLowerCase().includes(q);
        const matchSubject = item.subject_bn?.toLowerCase().includes(q);
        const matchId = item.teacher_id?.toLowerCase().includes(q);
        const matchNid = item.nid?.toLowerCase().includes(q);
        if (!matchName && !matchDesig && !matchSubject && !matchId && !matchNid) return false;
      }
      return true;
    });
  }, [faculty, categoryFilter, campusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bengali text-xl font-bold text-foreground">
                {t("শিক্ষক ও পরিচালকমণ্ডলী ব্যবস্থাপনা", "Faculty & Governing Body")}
              </h2>
              <p className="font-bengali text-xs text-muted-foreground">
                {t(
                  "পরিচালনা পরিষদ, শিক্ষকবৃন্দ এবং সহায়ক কর্মকর্তা-কর্মচারীদের তালিকা পরিচালনা করুন",
                  "Manage governing board, educators, and staff members"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/teachers"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 font-bengali text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{t("পাবলিক পেজ দেখুন", "View Public Page")}</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="rounded-xl font-bengali text-xs gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("রিফ্রেশ", "Refresh")}</span>
          </Button>

          <Button
            onClick={() => {
              setSelectedMember(null);
              setDialogOpen(true);
            }}
            className="rounded-xl font-bengali text-xs gap-1.5 bg-primary"
          >
            <Plus className="h-4 w-4" />
            <span>{t("নতুন সদস্য যোগ করুন", "Add Member")}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", labelBn: "সকল", labelEn: "All" },
              { id: "management", labelBn: "পরিচালনা পর্ষদ", labelEn: "Management" },
              { id: "teacher", labelBn: "শিক্ষকমণ্ডলী", labelEn: "Teachers" },
              { id: "staff", labelBn: "কর্মকর্তা/স্টাফ", labelEn: "Staff" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bengali font-medium transition-colors ${
                  categoryFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t(tab.labelBn, tab.labelEn)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t("নাম বা পদবি দিয়ে খুঁজুন...", "Search member...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 h-8.5 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Campus Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground font-bengali">
            {t("ক্যাম্পাস ফিল্টার:", "Campus:")}
          </span>
          {[
            { id: "all", labelBn: "সকল শিক্ষক ও সদস্য", labelEn: "All Faculty" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCampusFilter(c.id as any)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bengali font-medium transition-colors ${
                campusFilter === c.id
                  ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t(c.labelBn, c.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-bengali text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="py-3 px-4 font-semibold">{t("ক্রম", "Order")}</th>
                <th className="py-3 px-4 font-semibold">{t("সদস্য তথ্য", "Member")}</th>
                <th className="py-3 px-4 font-semibold">{t("পদবি ও বিভাগ", "Designation & Dept")}</th>
                <th className="py-3 px-4 font-semibold">{t("ক্যাটাগরি", "Category")}</th>
                <th className="py-3 px-4 font-semibold">{t("ক্যাম্পাস", "Campus")}</th>
                <th className="py-3 px-4 font-semibold text-center">{t("স্ট্যাটাস", "Status")}</th>
                <th className="py-3 px-4 text-right font-semibold">{t("অ্যাকশন", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    {t("লোড হচ্ছে...", "Loading...")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    {t("কোনো শিক্ষক বা সদস্য পাওয়া যায়নি", "No members found")}
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-muted-foreground">
                      {member.order_index}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name_bn}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                            {member.name_bn.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-foreground">{member.name_bn}</p>
                          {member.name_en && (
                            <p className="text-[11px] text-muted-foreground">{member.name_en}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {member.teacher_id && (
                              <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded-md">
                                ID: {member.teacher_id}
                              </span>
                            )}
                            {member.nid && (
                              <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                                NID: {member.nid}
                              </span>
                            )}
                          </div>
                          {member.qualification_bn && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {member.qualification_bn}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{member.designation_bn}</p>
                      {member.subject_bn && (
                        <p className="text-xs text-muted-foreground">{member.subject_bn}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                          member.category === "management"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : member.category === "teacher"
                            ? "bg-primary/10 text-primary"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {member.category === "management"
                          ? t("পরিচালনা পর্ষদ", "Management")
                          : member.category === "teacher"
                          ? t("শিক্ষক", "Teacher")
                          : t("স্টাফ", "Staff")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {member.campus === "boys"
                        ? t("বালক শাখা", "Boys")
                        : member.campus === "girls"
                        ? t("বালিকা শাখা", "Girls")
                        : t("উভয় ক্যাম্পাস", "Both")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Switch
                        checked={member.is_active}
                        onCheckedChange={() => handleToggleStatus(member)}
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMember(member);
                          setDialogOpen(true);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(member)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Dialog */}
      <FacultyDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={loadData}
        facultyItem={selectedMember}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!isDeleting && !open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent className="font-bengali">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {t("সদস্য তথ্য মুছে ফেলতে চান?", "Are you sure you want to delete?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              "{deleteTarget?.name_bn}" {t("মুছে ফেলা হলে তার প্রোফাইল আর প্রদর্শিত হবে না।", "will be permanently removed.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting}>
              {t("বাতিল", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2 min-w-[120px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("মুছে ফেলা হচ্ছে...", "Deleting...")}</span>
                </>
              ) : (
                t("হ্যাঁ, মুছে ফেলুন", "Yes, Delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
