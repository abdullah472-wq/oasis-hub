import { useState, useEffect } from "react";
import { Loader2, Calendar as CalendarIcon, Tag, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveEvent, updateEvent, type Event } from "@/lib/events";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: Event | null;
  onSuccess: () => void;
}

export const EventDialog = ({
  isOpen,
  onClose,
  eventToEdit,
  onSuccess,
}: EventDialogProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    titleBn: "",
    titleEn: "",
    startDate: "",
    endDate: "",
    type: "event" as Event["type"],
    descriptionBn: "",
    descriptionEn: "",
  });

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        titleBn: eventToEdit.titleBn || "",
        titleEn: eventToEdit.titleEn || "",
        startDate: eventToEdit.startDate || "",
        endDate: eventToEdit.endDate || "",
        type: eventToEdit.type || "event",
        descriptionBn: eventToEdit.descriptionBn || "",
        descriptionEn: eventToEdit.descriptionEn || "",
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        titleBn: "",
        titleEn: "",
        startDate: today,
        endDate: today,
        type: "event",
        descriptionBn: "",
        descriptionEn: "",
      });
    }
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titleBn.trim()) {
      toast.error(t("ইভেন্টের বাংলা শিরোনাম আবশ্যক", "Event Bangla title is required"));
      return;
    }

    if (!formData.startDate) {
      toast.error(t("শুরুর তারিখ নির্ধারণ করুন", "Please select a start date"));
      return;
    }

    setLoading(true);

    try {
      if (eventToEdit?.id) {
        await updateEvent(eventToEdit.id, {
          titleBn: formData.titleBn.trim(),
          titleEn: formData.titleEn.trim() || formData.titleBn.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate || formData.startDate,
          type: formData.type,
          descriptionBn: formData.descriptionBn.trim() || undefined,
          descriptionEn: formData.descriptionEn.trim() || undefined,
        });
        toast.success(t("ইভেন্ট সফলভাবে আপডেট করা হয়েছে", "Event updated successfully"));
      } else {
        await saveEvent({
          titleBn: formData.titleBn.trim(),
          titleEn: formData.titleEn.trim() || formData.titleBn.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate || formData.startDate,
          type: formData.type,
          descriptionBn: formData.descriptionBn.trim() || undefined,
          descriptionEn: formData.descriptionEn.trim() || undefined,
        });
        toast.success(t("নতুন ইভেন্ট যুক্ত করা হয়েছে", "New event added successfully"));
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save event:", error);
      toast.error(t("ইভেন্ট সংরক্ষণ ব্যর্থ হয়েছে", "Failed to save event"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-bengali text-xl font-bold">
                {eventToEdit
                  ? t("ইভেন্ট সম্পাদনা করুন", "Edit Event")
                  : t("নতুন ইভেন্ট তৈরি করুন", "Create New Event")}
              </DialogTitle>
              <DialogDescription className="font-bengali text-xs text-muted-foreground mt-0.5">
                {t(
                  "এই ইভেন্টটি পাবলিক ইভেন্ট ক্যালেন্ডারে প্রদর্শিত হবে",
                  "This event will be published directly to the public calendar"
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Event Type */}
          <div className="space-y-1.5">
            <Label className="font-bengali text-xs font-semibold">
              {t("ইভেন্টের ধরন", "Event Type")} *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(val: Event["type"]) => setFormData((prev) => ({ ...prev, type: val }))}
            >
              <SelectTrigger className="rounded-xl h-11 font-bengali">
                <SelectValue placeholder={t("ধরন নির্বাচন করুন", "Select Type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event" className="font-bengali">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {t("অনুষ্ঠান (Event)", "Event / Program")}
                  </span>
                </SelectItem>
                <SelectItem value="exam" className="font-bengali">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    {t("পরীক্ষা (Exam)", "Exam / Evaluation")}
                  </span>
                </SelectItem>
                <SelectItem value="holiday" className="font-bengali">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {t("ছুটি (Holiday)", "Holiday / Vacation")}
                  </span>
                </SelectItem>
                <SelectItem value="other" className="font-bengali">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    {t("অন্যান্য (Other)", "Other")}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title Bangla */}
          <div className="space-y-1.5">
            <Label htmlFor="titleBn" className="font-bengali text-xs font-semibold">
              {t("ইভেন্টের শিরোনাম (বাংলা)", "Event Title (Bangla)")} *
            </Label>
            <Input
              id="titleBn"
              placeholder={t("যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক উৎসব", "e.g., Annual Sports Day")}
              value={formData.titleBn}
              onChange={(e) => setFormData((prev) => ({ ...prev, titleBn: e.target.value }))}
              required
              className="rounded-xl h-11 font-bengali"
            />
          </div>

          {/* Title English */}
          <div className="space-y-1.5">
            <Label htmlFor="titleEn" className="font-bengali text-xs font-semibold">
              {t("ইভেন্টের শিরোনাম (ইংরেজি)", "Event Title (English)")}
            </Label>
            <Input
              id="titleEn"
              placeholder="e.g. Annual Sports & Cultural Ceremony"
              value={formData.titleEn}
              onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
              className="rounded-xl h-11"
            />
          </div>

          {/* Date Range: Start & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="font-bengali text-xs font-semibold">
                {t("শুরুর তারিখ", "Start Date")} *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                required
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="font-bengali text-xs font-semibold">
                {t("সমাপ্তির তারিখ (ঐচ্ছিক)", "End Date (Optional)")}
              </Label>
              <Input
                id="endDate"
                type="date"
                min={formData.startDate}
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          {/* Description Bangla */}
          <div className="space-y-1.5">
            <Label htmlFor="descriptionBn" className="font-bengali text-xs font-semibold">
              {t("বিস্তারিত বিবরণ (বাংলা)", "Description (Bangla)")}
            </Label>
            <Textarea
              id="descriptionBn"
              rows={3}
              placeholder={t("অনুষ্ঠানের সময়সূচি, স্থান বা বিস্তারিত তথ্য...", "Details about the event...")}
              value={formData.descriptionBn}
              onChange={(e) => setFormData((prev) => ({ ...prev, descriptionBn: e.target.value }))}
              className="rounded-xl font-bengali resize-none"
            />
          </div>

          {/* Description English */}
          <div className="space-y-1.5">
            <Label htmlFor="descriptionEn" className="font-bengali text-xs font-semibold">
              {t("বিস্তারিত বিবরণ (ইংরেজি - ঐচ্ছিক)", "Description (English - Optional)")}
            </Label>
            <Textarea
              id="descriptionEn"
              rows={2}
              placeholder="Event details, schedule or notes..."
              value={formData.descriptionEn}
              onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
              className="rounded-xl resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl font-bengali"
            >
              {t("বাতিল", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl font-bengali font-semibold shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("সংরক্ষণ হচ্ছে...", "Saving...")}
                </>
              ) : eventToEdit ? (
                t("আপডেট করুন", "Update Event")
              ) : (
                t("ইভেন্ট প্রকাশ করুন", "Publish Event")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
