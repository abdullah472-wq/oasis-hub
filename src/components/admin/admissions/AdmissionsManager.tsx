import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Copy,
  Filter,
  FileSpreadsheet,
  Building2,
  Phone,
  User,
  GraduationCap,
  Shield,
  Eye,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  getAdmissions,
  updateAdmissionStatus,
  deleteAdmission,
  type AdmissionForm,
  type AdmissionStatus,
  CLASS_NAME_OPTIONS,
} from "@/lib/admission";
import { AdmissionEditDialog } from "./AdmissionEditDialog";
import { useSiteSettings } from "@/lib/siteSettings";

export const AdmissionsManager = () => {
  const { t, lang } = useLanguage();
  const { settings } = useSiteSettings();
  const [admissions, setAdmissions] = useState<AdmissionForm[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campusFilter, setCampusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionForm | null>(null);

  // View / Print Modal
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewAdmission, setViewAdmission] = useState<AdmissionForm | null>(null);

  // Delete Alert
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [admissionToDelete, setAdmissionToDelete] = useState<AdmissionForm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const items = await getAdmissions();
      setAdmissions(items);
    } catch (err) {
      console.error("Failed to load admissions:", err);
      toast.error(t("ভর্তি আবেদন লোড করতে সমস্যা হয়েছে", "Failed to load admission applications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setAdmissions(e.detail);
      } else {
        loadData();
      }
    };

    window.addEventListener("oasis-admissions-updated", handleUpdate);
    return () => {
      window.removeEventListener("oasis-admissions-updated", handleUpdate);
    };
  }, []);

  const stats = useMemo(() => {
    const total = admissions.length;
    const pending = admissions.filter((a) => a.status === "pending").length;
    const approved = admissions.filter((a) => a.status === "approved").length;
    const rejected = admissions.filter((a) => a.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [admissions]);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (item.studentNameBn || "").toLowerCase().includes(q) ||
        (item.studentName || "").toLowerCase().includes(q) ||
        (item.trackingId || "").toLowerCase().includes(q) ||
        (item.fatherPhone || "").includes(q) ||
        (item.fatherName || "").toLowerCase().includes(q) ||
        (item.fatherNameBn || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCampus =
        campusFilter === "all" ||
        (item.campus && item.campus.toLowerCase().includes(campusFilter.toLowerCase()));
      const matchesClass = classFilter === "all" || item.class === classFilter;

      return matchesSearch && matchesStatus && matchesCampus && matchesClass;
    });
  }, [admissions, searchQuery, statusFilter, campusFilter, classFilter]);

  const handleQuickStatus = async (item: AdmissionForm, newStatus: AdmissionStatus) => {
    if (!item.id) return;
    try {
      await updateAdmissionStatus(item.id, newStatus);
      toast.success(
        newStatus === "approved"
          ? t("আবেদনটি অনুমোদিত হিসেবে চিহ্নিত করা হয়েছে", "Application marked as approved")
          : t("আবেদনের স্ট্যাটাস পরিবর্তিত হয়েছে", "Status updated successfully")
      );
      await loadData();
    } catch {
      toast.error(t("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে", "Failed to update status"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!admissionToDelete?.id) return;
    setIsDeleting(true);
    try {
      await deleteAdmission(admissionToDelete.id);
      toast.success(t("আবেদনটি সফলভাবে মুছে ফেলা হয়েছে", "Admission deleted successfully"));
      setDeleteAlertOpen(false);
      setAdmissionToDelete(null);
      await loadData();
    } catch {
      toast.error(t("আবেদন মুছতে সমস্যা হয়েছে", "Failed to delete admission"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("কপি করা হয়েছে", "Copied to clipboard"));
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Links */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 text-emerald-600 rounded-2xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bengali text-xl font-bold text-foreground">
              {t("অনলাইন ভর্তি আবেদন ও শিক্ষার্থী নিবন্ধন", "Online Admissions & Enrollment")}
            </h2>
            <p className="font-bengali text-xs text-muted-foreground mt-0.5">
              {t(
                "পাবলিক পেজ থেকে জমা হওয়া অনলাইন ভর্তি আবেদনসমূহ যাচাই, সংশোধন, অনুমোদন ও প্রিন্ট করুন",
                "Review, modify, approve, and print online admission applications submitted by parents"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to="/admission-form" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl font-bengali text-xs h-10 px-3.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{t("অনলাইন ভর্তি ফর্ম দেখুন", "Public Admission Form")}</span>
            </Button>
          </Link>
          <Link to="/admin/admission-info">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl font-bengali text-xs h-10 px-3.5"
            >
              <span>{t("ফি ও নিয়মাবলী CMS", "Fees & Rules")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bengali text-xs text-muted-foreground font-medium">
              {t("মোট দাখিলকৃত আবেদন", "Total Submissions")}
            </p>
            <h3 className="text-2xl font-bold font-display text-foreground mt-1">
              {stats.total}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-amber-500/30 bg-amber-500/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bengali text-xs text-amber-700 dark:text-amber-400 font-medium">
              {t("অপেক্ষমাণ আবেদন", "Pending Review")}
            </p>
            <h3 className="text-2xl font-bold font-display text-amber-600 mt-1">
              {stats.pending}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bengali text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {t("অনুমোদিত আবেদন", "Approved")}
            </p>
            <h3 className="text-2xl font-bold font-display text-emerald-600 mt-1">
              {stats.approved}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-red-500/30 bg-red-500/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bengali text-xs text-red-700 dark:text-red-400 font-medium">
              {t("বাতিল আবেদন", "Rejected")}
            </p>
            <h3 className="text-2xl font-bold font-display text-red-600 mt-1">
              {stats.rejected}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-500/15 text-red-600 flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("শিক্ষার্থী, ট্র্যাকিং আইডি বা মোবাইল দিয়ে খুঁজুন...", "Search student, tracking ID, mobile...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-bengali rounded-xl text-xs h-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] font-bengali text-xs h-10 rounded-xl">
                <SelectValue placeholder={t("স্ট্যাটাস", "Status")} />
              </SelectTrigger>
              <SelectContent className="font-bengali text-xs">
                <SelectItem value="all">{t("সব স্ট্যাটাস", "All Status")}</SelectItem>
                <SelectItem value="pending">{t("অপেক্ষমাণ", "Pending")}</SelectItem>
                <SelectItem value="approved">{t("অনুমোদিত", "Approved")}</SelectItem>
                <SelectItem value="rejected">{t("বাতিল", "Rejected")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Campus Filter */}
            <Select value={campusFilter} onValueChange={setCampusFilter}>
              <SelectTrigger className="w-[140px] font-bengali text-xs h-10 rounded-xl">
                <SelectValue placeholder={t("ক্যাম্পাস", "Campus")} />
              </SelectTrigger>
              <SelectContent className="font-bengali text-xs">
                <SelectItem value="all">{t("উভয় ক্যাম্পাস", "All Campuses")}</SelectItem>
                <SelectItem value="বালক">{t("বালক শাখা", "Boys Campus")}</SelectItem>
                <SelectItem value="বালিকা">{t("বালিকা শাখা", "Girls Campus")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Class Filter */}
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[140px] font-bengali text-xs h-10 rounded-xl">
                <SelectValue placeholder={t("শ্রেণি", "Class")} />
              </SelectTrigger>
              <SelectContent className="font-bengali text-xs">
                <SelectItem value="all">{t("সব শ্রেণি", "All Classes")}</SelectItem>
                {CLASS_NAME_OPTIONS.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
                <SelectItem value="নূরানী ও নাজেরা">{t("নূরানী ও নাজেরা", "Nurani & Nazara")}</SelectItem>
                <SelectItem value="হিফজুল কুরআন">{t("হিফজুল কুরআন", "Hifzul Quran")}</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || statusFilter !== "all" || campusFilter !== "all" || classFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCampusFilter("all");
                  setClassFilter("all");
                }}
                className="font-bengali text-xs h-10 rounded-xl text-muted-foreground"
              >
                {t("রিসেট", "Reset")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="bg-card border border-border/80 rounded-3xl p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
          <p className="font-bengali text-xs text-muted-foreground">
            {t("ভর্তি আবেদন লোড হচ্ছে...", "Loading admission applications...")}
          </p>
        </div>
      ) : filteredAdmissions.length === 0 ? (
        <div className="bg-card border border-dashed border-border/80 rounded-3xl p-12 text-center">
          <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h4 className="font-bengali text-base font-bold text-foreground">
            {searchQuery || statusFilter !== "all"
              ? t("কোনো আবেদন পাওয়া যায়নি", "No matching applications found")
              : t("এখনও কোনো অনলাইন ভর্তি আবেদন জমা হয়নি", "No online applications submitted yet")}
          </h4>
          <p className="font-bengali text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {t(
              "পাবলিক ওয়েবসাইট থেকে অভিভাবকরা আবেদন ফরম জমা দিলে তা স্বয়ংক্রিয়ভাবে এখানে দৃশ্যমান হবে।",
              "When parents submit admission forms from the public website, they will appear here automatically."
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAdmissions.map((item) => {
            return (
              <div
                key={item.id}
                className="group bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Student & Guardian Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                      {item.trackingId || item.id}
                    </span>

                    {/* Status Badge */}
                    {item.status === "approved" && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-bengali gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{t("অনুমোদিত", "Approved")}</span>
                      </Badge>
                    )}
                    {item.status === "pending" && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-bengali gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{t("অপেক্ষমাণ", "Pending")}</span>
                      </Badge>
                    )}
                    {item.status === "rejected" && (
                      <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 text-xs font-bengali gap-1">
                        <XCircle className="h-3 w-3" />
                        <span>{t("বাতিল", "Rejected")}</span>
                      </Badge>
                    )}

                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(item.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <h3 className="font-bengali text-lg font-bold text-foreground">
                      {item.studentNameBn || item.studentName}
                    </h3>
                    {item.studentName && item.studentNameBn && (
                      <span className="text-xs text-muted-foreground font-medium">
                        ({item.studentName})
                      </span>
                    )}
                  </div>

                  {/* Badges Info Grid */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-bengali">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                      <span>{t("শ্রেণি:", "Class:")} {item.class}</span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>{item.campus}</span>
                    </span>

                    {item.residencyType && (
                      <span className="bg-muted px-2 py-0.5 rounded-md font-semibold text-foreground/80">
                        {item.residencyType === "residential"
                          ? t("আবাসিক", "Residential")
                          : item.residencyType === "day-care"
                          ? t("ডে-কেয়ার", "Day-care")
                          : t("অনাবাসিক", "Non-residential")}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-mono text-foreground font-semibold">{item.fatherPhone}</span>
                      <span className="text-muted-foreground">({item.fatherNameBn || item.fatherName})</span>
                    </span>

                    {item.approvedStudentId && (
                      <span className="text-emerald-700 dark:text-emerald-300 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        ID: {item.approvedStudentId} | Roll: {item.approvedRoll}
                      </span>
                    )}
                  </div>

                  {item.adminNotes && (
                    <div className="rounded-xl bg-muted/60 p-2 text-xs font-bengali text-muted-foreground border border-border/60">
                      <span className="font-bold text-foreground">{t("নোট:", "Note:")}</span> {item.adminNotes}
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/70">
                  {/* Edit / Modify Button (Crucial feature) */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAdmission(item);
                      setEditDialogOpen(true);
                    }}
                    className="rounded-xl font-bengali text-xs h-9 px-3 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                    title={t("আবেদন সংশোধন করুন", "Modify Application")}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>{t("সংশোধন / এডিট", "Modify / Edit")}</span>
                  </Button>

                  {/* View Details & Print Slip */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setViewAdmission(item);
                      setViewDialogOpen(true);
                    }}
                    className="rounded-xl font-bengali text-xs h-9 px-3 gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                    title={t("বিস্তারিত ও প্রবেশপত্র প্রিন্ট", "View details and print")}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{t("বিস্তারিত", "View")}</span>
                  </Button>

                  {/* Quick Status Toggles */}
                  {item.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleQuickStatus(item, "approved")}
                      className="rounded-xl font-bengali text-xs h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{t("অনুমোদন", "Approve")}</span>
                    </Button>
                  )}

                  {item.status === "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickStatus(item, "pending")}
                      className="rounded-xl font-bengali text-xs h-9 px-2.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                    >
                      <span>{t("রিভার্ট", "Revert")}</span>
                    </Button>
                  )}

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAdmissionToDelete(item);
                      setDeleteAlertOpen(true);
                    }}
                    className="rounded-xl text-xs h-9 px-2 text-destructive hover:bg-destructive/10"
                    title={t("মুছে ফেলুন", "Delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Modify Modal */}
      <AdmissionEditDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedAdmission(null);
        }}
        admission={selectedAdmission}
        onSuccess={loadData}
      />

      {/* View Details & Printable Admission Slip Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        {viewAdmission && (
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
            <DialogHeader className="border-b border-border pb-4 print:hidden">
              <div className="flex items-center justify-between">
                <DialogTitle className="font-bengali text-xl font-bold">
                  {t("ভর্তি আবেদন ও অফিসিয়াল প্রবেশপত্র", "Official Admission Slip")}
                </DialogTitle>
                <Button
                  onClick={handlePrintSlip}
                  size="sm"
                  className="rounded-xl font-bengali text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{t("প্রিন্ট স্লিপ", "Print Slip")}</span>
                </Button>
              </div>
            </DialogHeader>

            {/* Printable Admission Slip Body */}
            <div id="printable-admission-slip" className="p-4 sm:p-6 bg-white text-slate-900 rounded-2xl border border-slate-200 space-y-5">
              {/* Slip Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={settings.logo_url || "/site-logo.png"}
                    alt={settings.institution_name_en || "Madrasa Logo"}
                    className="h-16 w-16 object-contain"
                  />
                  <div>
                    <h2 className="font-bengali text-xl font-black text-slate-900">
                      {settings.institution_name_bn}
                    </h2>
                    <p className="text-xs text-slate-600 font-bengali">
                      {settings.institution_name_en}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {settings.emis_code && settings.emis_code !== "12345678" ? `সরকারি রেজি নং: ${settings.emis_code} | ` : ""}{settings.address_boys_campus_bn}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-lg bg-slate-900 text-white px-3 py-1 text-xs font-mono font-bold">
                    {viewAdmission.trackingId || viewAdmission.id}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    তারিখ: {new Date(viewAdmission.createdAt).toLocaleDateString("bn-BD")}
                  </p>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-bengali">শিক্ষার্থীর নাম (বাংলা):</span>
                  <p className="font-bold font-bengali text-sm text-slate-900">
                    {viewAdmission.studentNameBn || viewAdmission.studentName}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bengali">Student Name (English):</span>
                  <p className="font-bold font-mono text-sm text-slate-900">
                    {viewAdmission.studentName}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bengali">আবেদিত শ্রেণি:</span>
                  <p className="font-bold font-bengali text-slate-900">
                    {viewAdmission.class}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bengali">নির্বাচিত ক্যাম্পাস:</span>
                  <p className="font-bold font-bengali text-slate-900">
                    {viewAdmission.campus}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bengali">আবাসিক সুবিধা:</span>
                  <p className="font-bold font-bengali text-slate-900">
                    {viewAdmission.residencyType === "residential"
                      ? "আবাসিক"
                      : viewAdmission.residencyType === "day-care"
                      ? "ডে-কেয়ার"
                      : "অনাবাসিক"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bengali">জন্ম তারিখ ও লিঙ্গ:</span>
                  <p className="font-bold font-mono text-slate-900">
                    {viewAdmission.birthDate || "-"} ({viewAdmission.gender === "male" ? "ছাত্র" : "ছাত্রী"})
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bengali">পিতার নাম ও মোবাইল:</span>
                  <p className="font-bold font-bengali text-slate-900">
                    {viewAdmission.fatherNameBn || viewAdmission.fatherName} ({viewAdmission.fatherPhone})
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bengali">মাতার নাম ও মোবাইল:</span>
                  <p className="font-bold font-bengali text-slate-900">
                    {viewAdmission.motherNameBn || viewAdmission.motherName} ({viewAdmission.motherPhone || "-"})
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="text-xs border-t border-slate-200 pt-3">
                <span className="text-slate-500 font-bengali">ঠিকানা:</span>
                <p className="font-bengali text-slate-800 mt-0.5">
                  {viewAdmission.presentAddressBn || viewAdmission.presentAddress || "-"}
                </p>
              </div>

              {/* Approval Info (if approved) */}
              {viewAdmission.status === "approved" && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs flex justify-between items-center text-emerald-900 font-bengali">
                  <span>
                    <strong>ভর্তি স্ট্যাটাস:</strong> অনুমোদিত
                  </span>
                  <span>
                    <strong>আইডি:</strong> {viewAdmission.approvedStudentId || "-"} | <strong>রোল:</strong> {viewAdmission.approvedRoll || "-"}
                  </span>
                  <span>
                    <strong>মাসিক ফি:</strong> ৳{viewAdmission.approvedMonthlyFee || "-"}
                  </span>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-10 flex items-center justify-between text-xs text-slate-600 font-bengali border-t border-dashed border-slate-300">
                <div className="text-center">
                  <div className="border-t border-slate-400 w-32 mb-1" />
                  <span>অভিভাবকের স্বাক্ষর</span>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-400 w-32 mb-1" />
                  <span>ভর্তি শাখা প্রধান</span>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-400 w-32 mb-1" />
                  <span>মুহতামিম / প্রধান শিক্ষক</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewDialogOpen(false);
                  setSelectedAdmission(viewAdmission);
                  setEditDialogOpen(true);
                }}
                className="rounded-xl font-bengali text-xs"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                {t("সংশোধন করুন", "Modify")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewDialogOpen(false)}
                className="rounded-xl font-bengali text-xs"
              >
                {t("বন্ধ করুন", "Close")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl w-fit mb-1">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="font-bengali text-lg font-bold">
              {t("আবেদনটি কি মুছে ফেলতে চান?", "Delete this application?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bengali text-xs text-muted-foreground">
              {admissionToDelete && (
                <span className="block font-semibold text-foreground my-1.5 p-2 bg-muted/50 rounded-lg">
                  "{admissionToDelete.studentNameBn || admissionToDelete.studentName}" ({admissionToDelete.trackingId})
                </span>
              )}
              {t(
                "মুছে ফেললে এই আবেদনটি ডাটাবেজ থেকে স্থায়ীভাবে অপসারিত হবে।",
                "Once deleted, this application will be permanently removed from the records."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl font-bengali">
              {t("বাতিল", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl font-bengali bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? t("মুছে ফেলা হচ্ছে...", "Deleting...") : t("হ্যাঁ, মুছে ফেলুন", "Yes, Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdmissionsManager;
