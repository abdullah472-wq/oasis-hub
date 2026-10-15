import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Palmtree,
  PartyPopper,
  HelpCircle,
  Shield,
  Search,
  FileDown,
  Layers,
  MapPin,
  Share2,
  Copy,
  Send,
  AlertCircle,
  CalendarCheck2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import WaveDivider from "@/components/WaveDivider";
import heroImg from "@/assets/hero-campus.jpg";
import { getEvents, deleteEvent, type Event } from "@/lib/events";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { EventDialog } from "@/components/admin/content/EventDialog";

const typeStyles: Record<
  Event["type"],
  { labelBn: string; labelEn: string; bg: string; text: string; dot: string; border: string; icon: any }
> = {
  exam: {
    labelBn: "পরীক্ষা",
    labelEn: "Examination",
    bg: "bg-red-500/10 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    border: "border-red-500/30",
    icon: GraduationCap,
  },
  holiday: {
    labelBn: "ছুটি",
    labelEn: "Vacation / Holiday",
    bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/30",
    icon: Palmtree,
  },
  event: {
    labelBn: "অনুষ্ঠান",
    labelEn: "Program / Event",
    bg: "bg-blue-500/10 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    border: "border-blue-500/30",
    icon: PartyPopper,
  },
  other: {
    labelBn: "অন্যান্য",
    labelEn: "Notice / Other",
    bg: "bg-amber-500/10 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/30",
    icon: HelpCircle,
  },
};

const Events = () => {
  const { t, lang } = useLanguage();
  const { isAdmin } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Detailed Modal View
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  // Admin In-Place Create/Edit Dialog
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  // Admin Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMountedRef = useRef(true);

  const loadEvents = async () => {
    try {
      const items = await getEvents();
      if (isMountedRef.current) setEvents(items);
    } catch {
      if (isMountedRef.current) setEvents([]);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadEvents();

    const handleEventsUpdate = (e: any) => {
      if (!isMountedRef.current) return;
      if (e.detail && Array.isArray(e.detail)) {
        setEvents(e.detail);
      } else {
        loadEvents();
      }
    };

    window.addEventListener("oasis-events-updated", handleEventsUpdate);
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("oasis-events-updated", handleEventsUpdate);
    };
  }, []);

  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];
  const monthsEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

  const getEventsForDay = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => {
      const startDate = e.startDate;
      const endDate = e.endDate || startDate;
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const navigateMonth = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const resetToCurrentMonth = () => {
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    try {
      const s = new Date(startDate);
      const sFormatted = s.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      if (!endDate || endDate === startDate) {
        return sFormatted;
      }

      const e = new Date(endDate);
      const eFormatted = e.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return `${sFormatted} — ${eFormatted}`;
    } catch {
      return startDate;
    }
  };

  const getEventStatus = (startDate: string, endDate?: string) => {
    const today = new Date().toISOString().split("T")[0];
    const end = endDate || startDate;

    if (end < today) {
      return { labelBn: "সম্পন্ন", labelEn: "Past", color: "bg-muted text-muted-foreground" };
    }
    if (startDate <= today && end >= today) {
      return { labelBn: "আজ চলমান", labelEn: "Ongoing Today", color: "bg-emerald-500 text-white animate-pulse" };
    }
    return { labelBn: "আসন্ন", labelEn: "Upcoming", color: "bg-primary/10 text-primary border border-primary/20" };
  };

  const filteredListEvents = useMemo(() => {
    return events.filter((evt) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        evt.titleBn.toLowerCase().includes(q) ||
        evt.titleEn.toLowerCase().includes(q) ||
        (evt.descriptionBn && evt.descriptionBn.toLowerCase().includes(q));

      const matchesType = selectedType === "all" || evt.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [events, searchTerm, selectedType]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => (e.endDate || e.startDate) >= today)
      .slice(0, 5);
  }, [events]);

  const handleAdminCreate = () => {
    setEventToEdit(null);
    setAdminDialogOpen(true);
  };

  const handleAdminEdit = (event: Event, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEventToEdit(event);
    setAdminDialogOpen(true);
  };

  const handleAdminDelete = (event: Event, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete?.id) return;
    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete.id);
      toast.success(t("ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে", "Event deleted successfully"));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      if (activeEvent?.id === eventToDelete.id) {
        setActiveEvent(null);
      }
      await loadEvents();
    } catch {
      toast.error(t("ইভেন্ট মুছতে সমস্যা হয়েছে", "Failed to delete event"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyDetails = (event: Event) => {
    const text = `${event.titleBn} (${formatDateRange(event.startDate, event.endDate)})\n${event.descriptionBn || ""}`;
    navigator.clipboard.writeText(text);
    toast.success(t("ইভেন্টের বিবরণ কপি করা হয়েছে", "Event details copied"));
  };

  const makeGoogleCalendarUrl = (event: Event) => {
    const title = encodeURIComponent(event.titleBn);
    const details = encodeURIComponent(event.descriptionBn || "");
    const start = event.startDate.replace(/-/g, "");
    const end = (event.endDate || event.startDate).replace(/-/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ================= HERO BANNER ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/95 via-primary to-primary/90 text-primary-foreground pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="absolute inset-0 z-0 opacity-15">
          <img src={heroImg} alt="Events Campus" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/80 z-0" />

        <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-emerald-200 backdrop-blur-md mb-4">
            <CalendarCheck2 className="h-4 w-4 text-amber-300" />
            <span>{t("বার্ষিক একাডেমিক ও ইসলামিক ক্যালেন্ডার", "Annual Academic & Islamic Calendar")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-bengali font-extrabold tracking-tight text-white mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.15 }}
          >
            {t("ইভেন্ট ক্যালেন্ডার", "Events & Calendar")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-bengali text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed"
          >
            {t(
              "আননূর শিক্ষা পরিবারের পরীক্ষা সময়সূচি, পবিত্র রমজান ও ঈদের ছুটি, বার্ষিক দস্তারবন্দী ও সাংস্কৃতিক মাহফিলের পূর্ণাঙ্গ সময়রেখা।",
              "Schedule of exams, vacations, annual award ceremonies, and extracurricular programs across our campuses.",
            )}
          </motion.p>
        </div>

        <WaveDivider className="absolute bottom-0 text-background" />
      </section>


      {/* ================= MAIN EVENTS CONTENT ================= */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Controls & View Mode Toggle */}
          <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-2xl w-fit border border-border/80">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-xl font-bengali text-xs sm:text-sm font-bold transition-all ${
                  viewMode === "calendar"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarIcon className="h-4 w-4 inline-block mr-1.5" />
                {t("ক্যালেন্ডার ভিউ", "Calendar View")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-xl font-bengali text-xs sm:text-sm font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-4 w-4 inline-block mr-1.5" />
                {t("তালিকা ভিউ", "List View")}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link to="/downloads">
                <Button variant="outline" size="sm" className="rounded-2xl font-bengali text-xs gap-1.5 border-primary/20 hover:border-primary/50 text-foreground">
                  <FileDown className="h-3.5 w-3.5 text-primary" />
                  <span>{t("একাডেমিক ক্যালেন্ডার PDF", "Calendar PDF")}</span>
                </Button>
              </Link>

            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT 2 COLUMNS: CALENDAR GRID OR LIST VIEW */}
            <div className="lg:col-span-2 space-y-6">
              {viewMode === "calendar" ? (
                /* ================= CALENDAR MONTH VIEW ================= */
                <div className="rounded-[2rem] border border-border/80 bg-card p-6 sm:p-8 shadow-md">
                  {/* Month Navigation Header */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth(-1)}
                        className="rounded-xl h-9 w-9 text-foreground hover:bg-primary/10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth(1)}
                        className="rounded-xl h-9 w-9 text-foreground hover:bg-primary/10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <h2 className="font-bengali text-xl sm:text-2xl font-extrabold text-foreground">
                      {lang === "bn" ? months[selectedMonth] : monthsEn[selectedMonth]} {selectedYear}
                    </h2>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetToCurrentMonth}
                      className="rounded-xl font-bengali text-xs text-primary font-bold hover:bg-primary/10"
                    >
                      {t("বর্তমান মাস", "Today")}
                    </Button>
                  </div>

                  {/* Day of Week Labels */}
                  <div className="grid grid-cols-7 gap-2 text-center mb-3">
                    {["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"].map((day, i) => (
                      <div
                        key={i}
                        className={`text-xs font-bold py-2 font-bengali rounded-lg ${
                          i === 5
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                            : "text-muted-foreground"
                        }`}
                      >
                        {lang === "bn" ? day : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[96px] rounded-xl bg-muted/20 opacity-40" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dayEvents = getEventsForDay(day);
                      const isToday =
                        new Date().getDate() === day &&
                        new Date().getMonth() === selectedMonth &&
                        new Date().getFullYear() === selectedYear;

                      return (
                        <div
                          key={day}
                          className={`min-h-[72px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                            isToday
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                              : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs sm:text-sm font-bold font-mono ${
                                isToday
                                  ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                                  : "text-foreground"
                              }`}
                            >
                              {day}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>

                          <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => {
                              const config = typeStyles[event.type] || typeStyles.other;
                              return (
                                <button
                                  key={event.id}
                                  type="button"
                                  onClick={() => setActiveEvent(event)}
                                  className={`w-full text-left font-bengali text-[10px] sm:text-xs px-1.5 py-0.5 rounded-lg truncate border font-semibold transition-all hover:scale-[1.02] ${config.bg} ${config.text} ${config.border}`}
                                  title={lang === "bn" ? event.titleBn : event.titleEn}
                                >
                                  {lang === "bn" ? event.titleBn : event.titleEn}
                                </button>
                              );
                            })}
                            {dayEvents.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setActiveEvent(dayEvents[0])}
                                className="text-[10px] text-primary font-bold block text-center hover:underline"
                              >
                                +{dayEvents.length - 2} {t("আরও", "more")}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ================= LIST / AGENDA VIEW ================= */
                <div className="space-y-4">
                  {/* Search & Filter */}
                  <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("ইভেন্ট খুঁজুন...", "Search events...")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 rounded-xl font-bengali text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { id: "all", labelBn: "সব", labelEn: "All" },
                        { id: "exam", labelBn: "পরীক্ষা", labelEn: "Exams" },
                        { id: "holiday", labelBn: "ছুটি", labelEn: "Holidays" },
                        { id: "event", labelBn: "অনুষ্ঠান", labelEn: "Events" },
                        { id: "other", labelBn: "অন্যান্য", labelEn: "Others" },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`rounded-xl px-3 py-1 font-bengali text-xs font-semibold whitespace-nowrap transition-all ${
                            selectedType === type.id
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {lang === "bn" ? type.labelBn : type.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredListEvents.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                      <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="font-bengali text-sm text-muted-foreground">
                        {t("কোনো ইভেন্ট পাওয়া যায়নি", "No matching events found")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredListEvents.map((evt) => {
                        const config = typeStyles[evt.type] || typeStyles.other;
                        const TypeIcon = config.icon;
                        const status = getEventStatus(evt.startDate, evt.endDate);

                        return (
                          <div
                            key={evt.id}
                            onClick={() => setActiveEvent(evt)}
                            className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border ${config.bg} ${config.text} ${config.border}`}>
                                  <TypeIcon className="h-3 w-3" />
                                  {lang === "bn" ? config.labelBn : config.labelEn}
                                </span>
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                                  {lang === "bn" ? status.labelBn : status.labelEn}
                                </span>
                              </div>

                              <h3 className="font-bengali font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                {lang === "bn" ? evt.titleBn : evt.titleEn || evt.titleBn}
                              </h3>

                              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{formatDateRange(evt.startDate, evt.endDate)}</span>
                              </div>

                              {(evt.descriptionBn || evt.descriptionEn) && (
                                <p className="font-bengali text-xs text-muted-foreground line-clamp-2">
                                  {lang === "bn" ? evt.descriptionBn : evt.descriptionEn || evt.descriptionBn}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveEvent(evt)}
                                className="rounded-xl font-bengali text-xs h-8"
                              >
                                {t("বিস্তারিত", "Details")}
                              </Button>

                              {isAdmin && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleAdminEdit(evt, e)}
                                    className="h-8 w-8 rounded-lg text-sky-600 hover:bg-sky-500/10"
                                    title={t("সম্পাদনা", "Edit")}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleAdminDelete(evt, e)}
                                    className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-500/10"
                                    title={t("মুছুন", "Delete")}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: UPCOMING EVENTS & CATEGORY LEGEND */}
            <div className="space-y-6">
              {/* Upcoming Events Box */}
              <div className="rounded-[2rem] border border-border/80 bg-card p-6 shadow-md">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                  <h3 className="font-bengali text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>{t("আসন্ন ইভেন্টসমূহ", "Upcoming Events")}</span>
                  </h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {upcomingEvents.length}
                  </Badge>
                </div>

                {loading ? (
                  <div className="py-6 text-center text-xs text-muted-foreground font-bengali">
                    {t("লোড হচ্ছে...", "Loading...")}
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground font-bengali">
                    {t("আপাতত কোনো আসন্ন ইভেন্ট নেই", "No upcoming events scheduled")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((evt) => {
                      const config = typeStyles[evt.type] || typeStyles.other;
                      const TypeIcon = config.icon;
                      const status = getEventStatus(evt.startDate, evt.endDate);

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setActiveEvent(evt)}
                          className="group cursor-pointer rounded-2xl border border-border/60 bg-muted/30 p-3.5 hover:bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className={`inline-flex items-center gap-1 font-bold ${config.text}`}>
                              <TypeIcon className="h-3 w-3" />
                              {lang === "bn" ? config.labelBn : config.labelEn}
                            </span>
                            <span className="font-semibold text-primary font-mono text-[10px]">
                              {evt.startDate}
                            </span>
                          </div>

                          <h4 className="font-bengali font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {lang === "bn" ? evt.titleBn : evt.titleEn || evt.titleBn}
                          </h4>

                          <p className="font-bengali text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary shrink-0" />
                            <span>{formatDateRange(evt.startDate, evt.endDate)}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Event Types Color Legend */}
              <div className="rounded-[2rem] border border-border/80 bg-card p-6 shadow-md">
                <h3 className="font-bengali text-base font-bold text-foreground mb-4">
                  {t("ইভেন্ট ক্যাটাগরি পরিচিতি", "Event Types Legend")}
                </h3>
                <div className="space-y-2.5">
                  {(Object.keys(typeStyles) as Event["type"][]).map((typeKey) => {
                    const item = typeStyles[typeKey];
                    const Icon = item.icon;
                    return (
                      <div
                        key={typeKey}
                        className={`flex items-center justify-between p-2.5 rounded-xl border ${item.bg} ${item.border}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                          <Icon className={`h-4 w-4 ${item.text}`} />
                          <span className="font-bengali font-semibold text-xs text-foreground">
                            {lang === "bn" ? item.labelBn : item.labelEn}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold font-mono uppercase ${item.text}`}>
                          {item.labelEn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DETAILED EVENT VIEW MODAL ================= */}
      <Dialog open={Boolean(activeEvent)} onOpenChange={(open) => !open && setActiveEvent(null)}>
        {activeEvent && (
          <DialogContent className="max-w-xl rounded-[2rem] p-6 sm:p-8">
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = typeStyles[activeEvent.type] || typeStyles.other;
                    const Icon = config.icon;
                    return (
                      <Badge className={`border font-bengali text-xs px-2.5 py-0.5 gap-1 ${config.bg} ${config.text} ${config.border}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {lang === "bn" ? config.labelBn : config.labelEn}
                      </Badge>
                    );
                  })()}
                  {(() => {
                    const status = getEventStatus(activeEvent.startDate, activeEvent.endDate);
                    return (
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                        {lang === "bn" ? status.labelBn : status.labelEn}
                      </span>
                    );
                  })()}
                </div>

                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleAdminEdit(activeEvent);
                      setActiveEvent(null);
                    }}
                    className="h-8 rounded-xl font-bengali text-xs gap-1 border-sky-300 text-sky-700"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>{t("এডিট", "Edit")}</span>
                  </Button>
                )}
              </div>

              <DialogTitle className="font-bengali font-bold text-xl sm:text-2xl text-foreground leading-snug">
                {lang === "bn" ? activeEvent.titleBn : activeEvent.titleEn || activeEvent.titleBn}
              </DialogTitle>
              {lang === "bn" && activeEvent.titleEn && (
                <p className="text-xs sm:text-sm text-muted-foreground italic font-medium">
                  {activeEvent.titleEn}
                </p>
              )}
            </DialogHeader>

            <div className="my-5 space-y-4">
              {/* Date Box */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <CalendarCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-bengali">
                    {t("তারিখ ও সময়সূচি", "Schedule Date")}
                  </span>
                  <div className="font-bengali font-bold text-sm sm:text-base text-foreground">
                    {formatDateRange(activeEvent.startDate, activeEvent.endDate)}
                  </div>
                </div>
              </div>

              {/* Description */}
              {(activeEvent.descriptionBn || activeEvent.descriptionEn) && (
                <div className="rounded-2xl bg-muted/40 p-4 border border-border">
                  <h4 className="font-bengali font-bold text-xs text-muted-foreground uppercase mb-1.5">
                    {t("বিবরণ ও নির্দেশিকা", "Description & Instructions")}
                  </h4>
                  <p className="font-bengali text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-line">
                    {lang === "bn"
                      ? activeEvent.descriptionBn || activeEvent.descriptionEn
                      : activeEvent.descriptionEn || activeEvent.descriptionBn}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyDetails(activeEvent)}
                  className="rounded-xl font-bengali text-xs h-8 gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t("কপি", "Copy")}</span>
                </Button>

                <a
                  href={makeGoogleCalendarUrl(activeEvent)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold font-bengali hover:bg-muted"
                >
                  <CalendarIcon className="h-3.5 w-3.5 text-blue-600" />
                  Google Calendar
                </a>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveEvent(null)}
                className="rounded-xl font-bengali text-xs h-8"
              >
                {t("বন্ধ করুন", "Close")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ================= ADMIN CREATE/EDIT DIALOG ================= */}
      <EventDialog
        isOpen={adminDialogOpen}
        onClose={() => setAdminDialogOpen(false)}
        eventToEdit={eventToEdit}
        onSuccess={loadEvents}
      />

      {/* ================= ADMIN DELETE CONFIRMATION DIALOG ================= */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl w-fit mb-1">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="font-bengali text-lg font-bold">
              {t("ইভেন্টটি কি মুছে ফেলতে চান?", "Delete this event?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bengali text-xs text-muted-foreground">
              {eventToDelete && (
                <span className="block font-semibold text-foreground my-1.5 p-2 bg-muted/50 rounded-lg">
                  "{eventToDelete.titleBn}"
                </span>
              )}
              {t(
                "মুছে ফেললে এই ইভেন্টটি পাবলিক ক্যালেন্ডার ও ডাটাবেজ থেকে তাৎক্ষণিকভাবে অপসারিত হবে।",
                "Once deleted, this event will be immediately removed from the live calendar."
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

export default Events;
