import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  GraduationCap,
  Palmtree,
  PartyPopper,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { getEvents, deleteEvent, type Event } from "@/lib/events";
import { EventDialog } from "./EventDialog";

const typeStyles: Record<
  Event["type"],
  { labelBn: string; labelEn: string; bg: string; text: string; dot: string; icon: any }
> = {
  exam: {
    labelBn: "পরীক্ষা",
    labelEn: "Exam",
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    icon: GraduationCap,
  },
  holiday: {
    labelBn: "ছুটি",
    labelEn: "Holiday",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: Palmtree,
  },
  event: {
    labelBn: "অনুষ্ঠান",
    labelEn: "Event",
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    icon: PartyPopper,
  },
  other: {
    labelBn: "অন্যান্য",
    labelEn: "Other",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: HelpCircle,
  },
};

export const EventManager = () => {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
      toast.error(t("ইভেন্ট লোড করতে ব্যর্থ হয়েছে", "Failed to load events"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const stats = useMemo(() => {
    const total = events.length;
    const exams = events.filter((e) => e.type === "exam").length;
    const holidays = events.filter((e) => e.type === "holiday").length;
    const programs = events.filter((e) => e.type === "event").length;
    return { total, exams, holidays, programs };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        evt.titleBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evt.descriptionBn && evt.descriptionBn.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === "all" || evt.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [events, searchTerm, selectedType]);

  const handleEdit = (event: Event) => {
    setEventToEdit(event);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEventToEdit(null);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete?.id) return;
    try {
      setIsDeleting(true);
      await deleteEvent(eventToDelete.id);
      toast.success(t("ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে", "Event deleted successfully"));
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setEventToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(t("ইভেন্ট মুছতে সমস্যা হয়েছে", "Failed to delete event"));
    } finally {
      setIsDeleting(false);
    }
  };

  const getEventStatus = (startDate: string, endDate?: string) => {
    const today = new Date().toISOString().split("T")[0];
    const end = endDate || startDate;

    if (end < today) {
      return { labelBn: "সম্পন্ন", labelEn: "Past", color: "bg-muted text-muted-foreground" };
    }
    if (startDate <= today && end >= today) {
      return { labelBn: "চলমান", labelEn: "Ongoing Today", color: "bg-emerald-500 text-white animate-pulse" };
    }
    return { labelBn: "আসন্ন", labelEn: "Upcoming", color: "bg-primary/10 text-primary border border-primary/20" };
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

      return `${sFormatted} - ${eFormatted}`;
    } catch {
      return startDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bengali text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {t("ইভেন্ট ও ক্যালেন্ডার ব্যবস্থাপনা", "Events & Calendar Management")}
          </h2>
          <p className="font-bengali text-xs text-muted-foreground mt-1">
            {t(
              "শিক্ষা প্রতিষ্ঠানের বার্ষিক অনুষ্ঠানসূচি, পরীক্ষা ও ছুটির দিনগুলো সরাসরি পাবলিক পেজের সাথে সংযুক্ত",
              "Manage institutional events, exams, and holidays synced directly with the public calendar"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/events"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-3.5 py-2 font-bengali text-xs font-semibold text-foreground transition-all hover:bg-secondary hover:shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("পাবলিক ইভেন্ট পেজ দেখুন", "View Public Page")}
          </Link>

          <Button
            onClick={handleCreateNew}
            className="gap-2 rounded-xl font-bengali text-xs font-bold shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            {t("নতুন ইভেন্ট যোগ করুন", "Add Event")}
          </Button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bengali text-xs text-muted-foreground">
              {t("মোট ইভেন্ট", "Total Events")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bengali text-xs text-muted-foreground">
              {t("পরীক্ষা", "Exams")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{stats.exams}</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bengali text-xs text-muted-foreground">
              {t("ছুটির তালিকা", "Holidays")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Palmtree className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.holidays}</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bengali text-xs text-muted-foreground">
              {t("অনুষ্ঠানসূচি", "Programs")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <PartyPopper className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.programs}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("ইভেন্টের শিরোনাম বা বিবরণ খুঁজুন...", "Search events by title...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 rounded-xl pl-9 text-xs font-bengali"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", labelBn: "সব", labelEn: "All" },
            { id: "event", labelBn: "অনুষ্ঠান", labelEn: "Events" },
            { id: "exam", labelBn: "পরীক্ষা", labelEn: "Exams" },
            { id: "holiday", labelBn: "ছুটি", labelEn: "Holidays" },
            { id: "other", labelBn: "অন্যান্য", labelEn: "Others" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`rounded-xl px-3 py-1.5 font-bengali text-xs font-semibold transition-all ${
                selectedType === type.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {lang === "bn" ? type.labelBn : type.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Events List / Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="font-bengali text-xs text-muted-foreground">
              {t("ইভেন্ট তালিকা লোড হচ্ছে...", "Loading events...")}
            </p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <CalendarIcon className="h-7 w-7" />
          </div>
          <h3 className="font-bengali text-base font-bold text-foreground">
            {t("কোনো ইভেন্ট পাওয়া যায়নি", "No events found")}
          </h3>
          <p className="font-bengali text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            {searchTerm || selectedType !== "all"
              ? t("অনুসন্ধান ফিল্টারের সাথে মিলে এমন কোনো ইভেন্ট নেই", "Try adjusting your search or filters")
              : t("এখনো কোনো ইভেন্ট যুক্ত করা হয়নি। এখনই প্রথম ইভেন্ট যোগ করুন।", "Get started by adding your first event")}
          </p>
          <Button onClick={handleCreateNew} className="gap-2 rounded-xl font-bengali text-xs">
            <Plus className="h-4 w-4" />
            {t("নতুন ইভেন্ট যোগ করুন", "Add First Event")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const typeConfig = typeStyles[event.type] || typeStyles.other;
            const TypeIcon = typeConfig.icon;
            const status = getEventStatus(event.startDate, event.endDate);

            return (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  {/* Top Bar with Type and Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${typeConfig.bg} ${typeConfig.text}`}
                    >
                      <TypeIcon className="h-3 w-3" />
                      {lang === "bn" ? typeConfig.labelBn : typeConfig.labelEn}
                    </span>

                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                      {lang === "bn" ? status.labelBn : status.labelEn}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bengali text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {lang === "bn" ? event.titleBn : event.titleEn || event.titleBn}
                  </h3>

                  {event.titleEn && lang === "bn" && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {event.titleEn}
                    </p>
                  )}

                  {/* Date Range */}
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatDateRange(event.startDate, event.endDate)}</span>
                  </div>

                  {/* Description snippet */}
                  {(event.descriptionBn || event.descriptionEn) && (
                    <p className="mt-2.5 font-bengali text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {lang === "bn"
                        ? event.descriptionBn || event.descriptionEn
                        : event.descriptionEn || event.descriptionBn}
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-border/60 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(event)}
                    className="h-8 gap-1.5 rounded-lg px-2.5 font-bengali text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {t("সম্পাদনা", "Edit")}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEventToDelete(event)}
                    className="h-8 gap-1.5 rounded-lg px-2.5 font-bengali text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("মুছুন", "Delete")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        eventToEdit={eventToEdit}
        onSuccess={loadEvents}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(eventToDelete)} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="font-bengali text-lg font-bold">
              {t("আপনি কি নিশ্চিত এই ইভেন্টটি মুছে ফেলতে চান?", "Are you sure you want to delete this event?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bengali text-xs text-muted-foreground">
              {eventToDelete && (
                <span className="font-semibold text-foreground">
                  "{eventToDelete.titleBn}"{" "}
                </span>
              )}
              {t(
                "মুছে ফেললে এটি পাবলিক ইভেন্ট ক্যালেন্ডার থেকেও সাথে সাথে অপসারিত হবে।",
                "Once deleted, it will also be removed immediately from the public calendar."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl font-bengali">
              {t("বাতিল", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl bg-destructive font-bengali text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("মুছে ফেলা হচ্ছে...", "Deleting...") : t("হ্যাঁ, মুছে ফেলুন", "Yes, Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventManager;
