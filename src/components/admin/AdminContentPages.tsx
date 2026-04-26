import { useEffect, useMemo, useState } from "react";
import { Award, BellRing, CalendarDays, ChevronDown, ExternalLink, FileText, ImageIcon, Link2, MessageSquareQuote, Pencil, Radio, Save, Search, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { getDownloadUrl } from "@/lib/upload";
import type { NewsPost } from "@/lib/news";
import type { GalleryImage } from "@/lib/gallery";
import type { Event } from "@/lib/events";
import type { Notice } from "@/lib/notices";
import type { Result } from "@/lib/results";
import type { Review } from "@/lib/reviews";
import type { RunningNoticeSettings } from "@/lib/runningNoticeSettings";
import type { AchievementItem } from "@/lib/achievements";
import type { StudentRecord } from "@/lib/students";
import { createClientId } from "@/lib/uuid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BilingualInput,
  BilingualTextarea,
  EmptyState,
  Field,
  FilePicker,
  FormCard,
  ItemCard,
  ModuleShell,
  ToggleRow,
  shellCardClass,
  BellFileIcon,
} from "./AdminPagePrimitives";

export const NewsManagerPage = ({
  items,
  onSave,
  onDelete,
}: {
  items: NewsPost[];
  onSave: (payload: Omit<NewsPost, "createdAt" | "date">, image: File | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({ titleBn: "", titleEn: "", excerptBn: "", excerptEn: "" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const existing = items.find((item) => item.id === editingId);
      await onSave(
        {
          id: editingId || undefined,
          titleBn: form.titleBn,
          titleEn: form.titleEn,
          excerptBn: form.excerptBn,
          excerptEn: form.excerptEn,
          imageUrl: existing?.imageUrl,
        },
        image,
      );
      setForm({ titleBn: "", titleEn: "", excerptBn: "", excerptEn: "" });
      setImage(null);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("News publish failed:", error);
      toast.error(t("সংবাদ প্রকাশ করা যায়নি", "Could not publish news"));
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (item: NewsPost) => {
    setForm({
      titleBn: item.titleBn,
      titleEn: item.titleEn,
      excerptBn: item.excerptBn,
      excerptEn: item.excerptEn,
    });
    setImage(null);
    setEditingId(item.id || null);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ titleBn: "", titleEn: "", excerptBn: "", excerptEn: "" });
    setImage(null);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <ModuleShell
      title={t("সংবাদ ম্যানেজমেন্ট", "News Management")}
      description={t("সাইটের সর্বশেষ সংবাদ ও আপডেট এখান থেকে প্রকাশ করুন", "Publish the latest news and updates here")}
      actionLabel={showForm ? t("ফর্ম বন্ধ করুন", "Close form") : t("নতুন সংবাদ", "New News")}
      onAction={() => (showForm ? resetForm() : setShowForm(true))}
      icon={<FileText className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving} submitLabel={editingId ? t("আপডেট ও রিপাবলিশ করুন", "Update and republish") : t("সংরক্ষণ করুন", "Save")}>
          <BilingualInput labelBn="শিরোনাম" labelEn="Title" valueBn={form.titleBn} valueEn={form.titleEn} onBnChange={(value) => setForm((current) => ({ ...current, titleBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))} />
          <BilingualTextarea labelBn="সারাংশ" labelEn="Excerpt" valueBn={form.excerptBn} valueEn={form.excerptEn} onBnChange={(value) => setForm((current) => ({ ...current, excerptBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, excerptEn: value }))} />
          <FilePicker label={t("কভার ছবি", "Cover image")} file={image} onFileChange={setImage} accept="image/*" />
          {editingId ? (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" className="rounded-2xl font-bengali" onClick={resetForm}>
                {t("এডিট বাতিল", "Cancel edit")}
              </Button>
            </div>
          ) : null}
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো সংবাদ প্রকাশ করা হয়নি", "No news has been published yet")} /> : items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.titleBn}
              meta={item.date}
              onDelete={() => item.id && void onDelete(item.id)}
              trailing={
                <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => startEditing(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("এডিট", "Edit")}
                </Button>
              }
            >
              <p className="font-bengali text-sm text-muted-foreground">{item.excerptBn}</p>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const GalleryManagerPage = ({
  items,
  onCreate,
  onDelete,
}: {
  items: GalleryImage[];
  onCreate: (payload: Omit<GalleryImage, "id" | "src" | "createdAt">, image: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t, lang } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({ titleBn: "", titleEn: "", category: "campus" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!image) return;
    setSaving(true);
    await onCreate(form, image);
    setForm({ titleBn: "", titleEn: "", category: "campus" });
    setImage(null);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <ModuleShell
      title={t("গ্যালারি ম্যানেজমেন্ট", "Gallery Management")}
      description={t("ক্যাম্পাস, অনুষ্ঠান ও কার্যক্রমের ছবি সাজিয়ে রাখুন", "Manage campus, event, and activity photos")}
      actionLabel={t("নতুন ছবি", "New Photo")}
      onAction={() => setShowForm((current) => !current)}
      icon={<ImageIcon className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput labelBn="ছবির শিরোনাম" labelEn="Image title" valueBn={form.titleBn} valueEn={form.titleEn} onBnChange={(value) => setForm((current) => ({ ...current, titleBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))} />
          <Field label={t("ক্যাটাগরি", "Category")}>
            <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
              <option value="campus">{t("ক্যাম্পাস", "Campus")}</option>
              <option value="event">{t("ইভেন্ট", "Event")}</option>
              <option value="activity">{t("অ্যাক্টিভিটি", "Activity")}</option>
            </select>
          </Field>
          <FilePicker label={t("ছবি আপলোড", "Upload image")} file={image} onFileChange={setImage} accept="image/*" />
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো গ্যালারি ছবি নেই", "No gallery images yet")} className="md:col-span-2 xl:col-span-3" /> : items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={item.src} alt={item.titleBn} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bengali text-sm font-medium">{item.titleBn}</p>
                    <Badge variant="secondary" className="mt-2 rounded-full">{item.category}</Badge>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-2xl text-red-600 hover:text-red-600" onClick={() => item.id && void onDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const EventsManagerPage = ({
  items,
  onCreate,
  onDelete,
}: {
  items: Event[];
  onCreate: (payload: Omit<Event, "id" | "createdAt">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titleBn: "", titleEn: "", startDate: "", endDate: "", type: "event" as Event["type"], descriptionBn: "", descriptionEn: "" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onCreate({ ...form, endDate: form.endDate || form.startDate });
    setForm({ titleBn: "", titleEn: "", startDate: "", endDate: "", type: "event", descriptionBn: "", descriptionEn: "" });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <ModuleShell
      title={t("ইভেন্ট ম্যানেজমেন্ট", "Events Management")}
      description={t("ক্যালেন্ডার, ছুটি, পরীক্ষা ও বিশেষ ইভেন্ট পরিচালনা করুন", "Manage calendar, holidays, exams, and special events")}
      actionLabel={t("নতুন ইভেন্ট", "New Event")}
      onAction={() => setShowForm((current) => !current)}
      icon={<CalendarDays className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput labelBn="ইভেন্টের নাম" labelEn="Event title" valueBn={form.titleBn} valueEn={form.titleEn} onBnChange={(value) => setForm((current) => ({ ...current, titleBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))} />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t("শুরুর তারিখ", "Start date")}><input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none" /></Field>
            <Field label={t("শেষ তারিখ", "End date")}><input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none" /></Field>
            <Field label={t("ধরণ", "Type")}>
              <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as Event["type"] }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
                <option value="event">{t("ইভেন্ট", "Event")}</option>
                <option value="holiday">{t("ছুটি", "Holiday")}</option>
                <option value="exam">{t("পরীক্ষা", "Exam")}</option>
                <option value="other">{t("অন্যান্য", "Other")}</option>
              </select>
            </Field>
          </div>
          <BilingualTextarea labelBn="বিবরণ" labelEn="Description" valueBn={form.descriptionBn} valueEn={form.descriptionEn} onBnChange={(value) => setForm((current) => ({ ...current, descriptionBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))} />
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো ইভেন্ট নেই", "No events yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={item.titleBn} meta={`${item.startDate}${item.endDate ? ` - ${item.endDate}` : ""}`} onDelete={() => item.id && void onDelete(item.id)}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full capitalize">{item.type}</Badge>
                {item.descriptionBn && <p className="font-bengali text-sm text-muted-foreground">{item.descriptionBn}</p>}
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const NoticesManagerPage = ({
  items,
  onCreate,
  onDelete,
  noticeSettings,
  onSaveNoticeSettings,
}: {
  items: Notice[];
  onCreate: (payload: Omit<Notice, "id" | "createdAt" | "pdfUrl">, file: File | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  noticeSettings: RunningNoticeSettings;
  onSaveNoticeSettings: (settings: Pick<RunningNoticeSettings, "runningNoticeEnabled" | "runningNotices">) => Promise<void>;
}) => {
  const { t, lang } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [form, setForm] = useState({ titleBn: "", titleEn: "", descriptionBn: "", descriptionEn: "" });
  const [noticeDraft, setNoticeDraft] = useState(noticeSettings);
  const [savingNoticeBar, setSavingNoticeBar] = useState(false);
  const [expandedNotices, setExpandedNotices] = useState<Record<string, boolean>>({});
  const [expandedPublishedNotices, setExpandedPublishedNotices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNoticeDraft(noticeSettings);
  }, [noticeSettings]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onCreate(form, pdf);
      setForm({ titleBn: "", titleEn: "", descriptionBn: "", descriptionEn: "" });
      setPdf(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const addRunningNotice = () => {
    setNoticeDraft((current) => ({
      ...current,
      runningNotices: [
        ...current.runningNotices,
        {
          id: createClientId(),
          textBn: "",
          textEn: "",
          link: "",
          publishDate: new Date().toISOString().slice(0, 10),
          priority: current.runningNotices.length + 1,
          active: true,
        },
      ],
    }));
  };

  const updateRunningNotice = (
    id: string,
    field: "textBn" | "textEn" | "link" | "publishDate" | "priority" | "active",
    value: string | number | boolean,
  ) => {
    setNoticeDraft((current) => ({
      ...current,
      runningNotices: current.runningNotices.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const removeRunningNotice = (id: string) => {
    setNoticeDraft((current) => ({
      ...current,
      runningNotices: current.runningNotices.filter((item) => item.id !== id),
    }));
  };

  const toggleNoticeExpanded = (id: string) => {
    setExpandedNotices((current) => ({ ...current, [id]: !(current[id] ?? true) }));
  };

  const togglePublishedNoticeExpanded = (id: string) => {
    setExpandedPublishedNotices((current) => ({ ...current, [id]: !(current[id] ?? false) }));
  };

  const saveRunningNoticeBar = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingNoticeBar(true);
    try {
      await onSaveNoticeSettings({
        runningNoticeEnabled: noticeDraft.runningNoticeEnabled,
        runningNotices: noticeDraft.runningNotices,
      });
    } finally {
      setSavingNoticeBar(false);
    }
  };

  const dateLocale = lang === "bn" ? "bn-BD" : "en-US";
  const sortedRunningNotices = useMemo(
    () => noticeDraft.runningNotices.slice().sort((a, b) => a.priority - b.priority),
    [noticeDraft.runningNotices],
  );
  const activeRunningCount = noticeDraft.runningNotices.filter((item) => item.active).length;
  const noticesWithPdf = items.filter((item) => Boolean(item.pdfUrl)).length;
  const latestNoticeDate = items[0]
    ? new Date(items[0].createdAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })
    : t("নেই", "None");

  return (
    <ModuleShell
      title={t("নোটিশ ম্যানেজমেন্ট", "Notice Management")}
      description={t("অফিশিয়াল নোটিশ, পিডিএফ সার্কুলার এবং রানিং নোটিশ বার এখান থেকে পরিচালনা করুন", "Manage official notices, PDF circulars, and the running notice bar from here")}
      actionLabel={showForm ? t("ফর্ম বন্ধ করুন", "Close form") : t("নতুন নোটিশ", "New Notice")}
      onAction={() => setShowForm((current) => !current)}
      icon={<BellFileIcon className="h-5 w-5" />}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-md transition-all hover:shadow-xl">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-1/2 rounded-full bg-primary/10 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bengali text-sm text-muted-foreground">{t("প্রকাশিত নোটিশ", "Published notices")}</p>
              <p className="text-3xl font-bold text-foreground">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-md transition-all hover:shadow-xl">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-1/2 rounded-full bg-blue-500/10 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 transition-colors group-hover:bg-blue-500/20">
              <ExternalLink className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bengali text-sm text-muted-foreground">{t("পিডিএফ সার্কুলার", "PDF circulars")}</p>
              <p className="text-3xl font-bold text-foreground">{noticesWithPdf}</p>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-md transition-all hover:shadow-xl">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-1/2 rounded-full bg-green-500/10 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15 text-green-600 transition-colors group-hover:bg-green-500/20">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bengali text-sm text-muted-foreground">{t("সক্রিয় রানিং আইটেম", "Active ticker items")}</p>
              <p className="text-3xl font-bold text-foreground">{activeRunningCount}</p>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-md transition-all hover:shadow-xl">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-1/2 rounded-full bg-orange-500/10 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 transition-colors group-hover:bg-orange-500/20">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bengali text-sm text-muted-foreground">{t("সর্বশেষ প্রকাশ", "Latest publish")}</p>
              <p className="font-bengali text-lg font-semibold text-foreground">{latestNoticeDate}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="notices" className="w-full">
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-1">
          <TabsTrigger
            value="notices"
            className="flex-1 rounded-xl font-bengali font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
          >
            {t("প্রকাশিত নোটিশ", "Published Notices")} ({items.length})
          </TabsTrigger>
          <TabsTrigger
            value="ticker"
            className="flex-1 rounded-xl font-bengali font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
          >
            {t("রানিং নোটিশ বার", "Running Notice Bar")} ({activeRunningCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notices" className="mt-0 space-y-6">
          {showForm && (
            <FormCard onSubmit={submit} saving={saving}>
              <BilingualInput labelBn="নোটিশ শিরোনাম" labelEn="Notice title" valueBn={form.titleBn} valueEn={form.titleEn} onBnChange={(value) => setForm((current) => ({ ...current, titleBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))} />
              <BilingualTextarea labelBn="নোটিশ বিবরণ" labelEn="Notice description" valueBn={form.descriptionBn} valueEn={form.descriptionEn} onBnChange={(value) => setForm((current) => ({ ...current, descriptionBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))} />
              <FilePicker label={t("পিডিএফ নোটিশ", "Notice PDF")} file={pdf} onFileChange={setPdf} accept="application/pdf" />
            </FormCard>
          )}

          <Card className={shellCardClass}>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-bengali text-lg font-semibold text-foreground">{t("প্রকাশিত নোটিশ", "Published notices")}</h3>
                  <p className="font-bengali text-sm text-muted-foreground">{t("সাইটের নোটিশ বোর্ডে যেগুলো দেখা যাচ্ছে", "Visible on the public notice board")}</p>
                </div>
                <Badge variant="secondary" className="w-fit rounded-lg font-bengali">
                  {items.length} {t("আইটেম", "items")}
                </Badge>
              </div>

              {items.length === 0 ? (
                <EmptyState text={t("এখনও কোনো নোটিশ নেই", "No notices yet")} />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const noticeKey = item.id || [item.createdAt, item.titleBn].join("-");
                    const title = lang === "bn" ? item.titleBn : item.titleEn || item.titleBn;
                    const description = lang === "bn" ? item.descriptionBn : item.descriptionEn || item.descriptionBn;
                    const hasDetails = Boolean(description || item.pdfUrl);
                    const isExpanded = expandedPublishedNotices[noticeKey] ?? false;
                    const publishedDate = new Date(item.createdAt).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <div key={noticeKey} className="rounded-lg border border-border/70 bg-background p-4 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="rounded-lg font-bengali">
                                {publishedDate}
                              </Badge>
                              {item.pdfUrl ? (
                                <Badge variant="secondary" className="rounded-lg font-bengali">
                                  PDF
                                </Badge>
                              ) : null}
                            </div>
                            <h4 className="font-bengali text-base font-semibold text-foreground">{title}</h4>
                            {hasDetails && isExpanded ? (
                              <div className="space-y-2 border-t border-border/60 pt-3">
                                {description ? <p className="whitespace-pre-line font-bengali text-sm leading-6 text-muted-foreground">{description}</p> : null}
                                {item.pdfUrl ? (
                                  <a href={getDownloadUrl(item.pdfUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bengali text-sm font-medium text-primary hover:underline">
                                    <ExternalLink className="h-4 w-4" />
                                    {t("পিডিএফ দেখুন", "View PDF")}
                                  </a>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {hasDetails ? (
                              <Button type="button" variant="outline" className="rounded-lg font-bengali" onClick={() => togglePublishedNoticeExpanded(noticeKey)}>
                                <ChevronDown className={["mr-2 h-4 w-4 transition-transform", isExpanded ? "rotate-180" : ""].join(" ").trim()} />
                                {isExpanded ? t("লুকান", "Collapse") : t("দেখুন", "Expand")}
                              </Button>
                            ) : null}
                            <Button type="button" variant="outline" size="icon" className="rounded-lg text-red-600 hover:text-red-600" onClick={() => item.id && void onDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ticker" className="mt-0">
          <form onSubmit={saveRunningNoticeBar}>
            <Card className={shellCardClass}>
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BellRing className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-bengali text-lg font-semibold text-foreground">{t("রানিং নোটিশ বার", "Running notice bar")}</h3>
                        <p className="font-bengali text-sm text-muted-foreground">
                          {t("মেইন নেভিগেশন বারের উপরের বার্তার ক্রম, লিংক এবং দৃশ্যমানতা ঠিক করুন", "Control the message order, links, and visibility above the main navigation")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={noticeDraft.runningNoticeEnabled ? "default" : "secondary"} className="rounded-lg font-bengali">
                        {noticeDraft.runningNoticeEnabled ? t("লাইভ", "Live") : t("লুকানো", "Hidden")}
                      </Badge>
                      <Badge variant="outline" className="rounded-lg font-bengali">
                        {activeRunningCount}/{noticeDraft.runningNotices.length} {t("সক্রিয়", "active")}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" className="rounded-lg font-bengali" onClick={addRunningNotice}>
                      {t("আইটেম যোগ করুন", "Add item")}
                    </Button>
                    <Button type="submit" className="rounded-lg font-bengali" disabled={savingNoticeBar}>
                      <Save className="mr-2 h-4 w-4" />
                      {savingNoticeBar ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("নোটিশ বার সংরক্ষণ", "Save notice bar")}
                    </Button>
                  </div>
                </div>

                <ToggleRow
                  label={t("রানিং নোটিশ দেখান", "Show running notice")}
                  checked={noticeDraft.runningNoticeEnabled}
                  onCheckedChange={(checked) => setNoticeDraft((current) => ({ ...current, runningNoticeEnabled: checked }))}
                />

                <div className="space-y-3">
                  {sortedRunningNotices.length === 0 ? (
                    <EmptyState text={t("এখনও কোনো রানিং নোটিশ যোগ করা হয়নি", "No running notice items added yet")} />
                  ) : (
                    sortedRunningNotices.map((item, index) => {
                      const isExpanded = expandedNotices[item.id] ?? true;
                      const previewText = lang === "bn" ? item.textBn || item.textEn : item.textEn || item.textBn;
                      const publishDate = item.publishDate
                        ? new Date(item.publishDate + "T00:00:00").toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })
                        : t("তারিখ নেই", "No date");

                      return (
                        <div key={item.id} className="rounded-lg border border-border/70 bg-background shadow-sm">
                          <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="rounded-lg">#{index + 1}</Badge>
                                <Badge variant={item.active ? "default" : "secondary"} className="rounded-lg font-bengali">
                                  {item.active ? t("সক্রিয়", "Active") : t("বন্ধ", "Inactive")}
                                </Badge>
                                <span className="font-bengali text-xs text-muted-foreground">{publishDate}</span>
                              </div>
                              <p className="line-clamp-2 font-bengali text-sm font-medium text-foreground">
                                {previewText || t("খালি নোটিশ আইটেম", "Empty notice item")}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                variant={item.active ? "secondary" : "outline"}
                                className="rounded-lg font-bengali"
                                onClick={() => updateRunningNotice(item.id, "active", !item.active)}
                              >
                                {item.active ? t("বন্ধ করুন", "Deactivate") : t("চালু করুন", "Activate")}
                              </Button>
                              <Button type="button" variant="outline" className="rounded-lg font-bengali" onClick={() => toggleNoticeExpanded(item.id)}>
                                <ChevronDown className={["mr-2 h-4 w-4 transition-transform", isExpanded ? "rotate-180" : ""].join(" ").trim()} />
                                {isExpanded ? t("লুকান", "Collapse") : t("এডিট", "Edit")}
                              </Button>
                              <Button type="button" variant="ghost" className="rounded-lg font-bengali text-destructive hover:text-destructive" onClick={() => removeRunningNotice(item.id)}>
                                {t("রিমুভ", "Remove")}
                              </Button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="space-y-4 border-t border-border/70 p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <Field label={t("নোটিশ টেক্সট (বাংলা)", "Notice text (Bangla)")}>
                                  <textarea
                                    value={item.textBn}
                                    onChange={(event) => updateRunningNotice(item.id, "textBn", event.target.value)}
                                    className="min-h-[110px] w-full rounded-lg border border-input bg-background px-4 py-3 font-bengali text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  />
                                </Field>
                                <Field label={t("Notice text (English)", "Notice text (English)")}>
                                  <textarea
                                    value={item.textEn}
                                    onChange={(event) => updateRunningNotice(item.id, "textEn", event.target.value)}
                                    className="min-h-[110px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  />
                                </Field>
                              </div>

                              <div className="grid gap-4 md:grid-cols-[1fr_180px_130px]">
                                <Field label={t("লিংক", "Link")}>
                                  <div className="relative">
                                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                      value={item.link || ""}
                                      onChange={(event) => updateRunningNotice(item.id, "link", event.target.value)}
                                      className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                      placeholder="/notices অথবা https://..."
                                    />
                                  </div>
                                </Field>
                                <Field label={t("প্রকাশের তারিখ", "Publish date")}>
                                  <input
                                    type="date"
                                    value={item.publishDate}
                                    onChange={(event) => updateRunningNotice(item.id, "publishDate", event.target.value)}
                                    className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  />
                                </Field>
                                <Field label={t("Priority", "Priority")}>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.priority}
                                    onChange={(event) => updateRunningNotice(item.id, "priority", Number(event.target.value) || 1)}
                                    className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
};

export const ResultsManagerPage = ({
  items,
  students,
  onCreate,
  onDelete,
}: {
  items: Result[];
  students: StudentRecord[];
  onCreate: (payload: Omit<Result, "id" | "createdAt" | "pdfUrl">, file: File | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [studentIdFocused, setStudentIdFocused] = useState(false);
  const [form, setForm] = useState({
    exam: "",
    examEn: "",
    className: "",
    classNameEn: "",
    campus: "both" as Result["campus"],
    entryType: "manual" as Result["entryType"],
    studentId: "",
    studentName: "",
    section: "",
    position: "",
    totalMarks: "",
    obtainedMarks: "",
    gpa: "",
    grade: "",
    remarksBn: "",
    remarksEn: "",
  });

  const normalizeDigits = (value: string) =>
    value.replace(/[০-৯]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0x09e6 + 0x30));

  const normalizeSearch = (value: string) => normalizeDigits(value).trim().toLowerCase();

  const studentById = useMemo(
    () => new Map(students.map((student) => [normalizeSearch(student.studentId), student])),
    [students],
  );

  const applyStudentSelection = (student: StudentRecord) => {
    setForm((current) => ({
      ...current,
      studentId: student.studentId || current.studentId,
      studentName: student.studentName || current.studentName,
      className: student.className || current.className,
      section: student.section || current.section,
    }));
    setStudentIdFocused(false);
  };

  const studentSuggestions = useMemo(() => {
    const keyword = normalizeSearch(form.studentId);

    if (!keyword) {
      return students.slice(0, 8);
    }

    return students
      .filter((student) => {
        const id = normalizeSearch(student.studentId);
        const name = normalizeSearch(student.studentName);
        return id.includes(keyword) || name.includes(keyword);
      })
      .slice(0, 8);
  }, [form.studentId, students]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.entryType === "pdf" && !pdf) return;

    setSaving(true);
    try {
      await onCreate(
        {
          exam: form.exam,
          examEn: form.examEn,
          className: form.className,
          classNameEn: form.classNameEn,
          campus: form.campus,
          resultType: form.entryType === "pdf" ? "group" : "personal",
          entryType: form.entryType || "manual",
          studentId: form.studentId.trim(),
          studentName: form.studentName.trim(),
          section: form.section.trim(),
          position: Number(form.position || 0),
          totalMarks: Number(form.totalMarks || 0),
          obtainedMarks: Number(form.obtainedMarks || 0),
          gpa: Number(form.gpa || 0),
          grade: form.grade.trim(),
          remarksBn: form.remarksBn.trim(),
          remarksEn: form.remarksEn.trim(),
        },
        form.entryType === "pdf" ? pdf : null,
      );
      setForm({
        exam: "",
        examEn: "",
        className: "",
        classNameEn: "",
        campus: "both",
        entryType: "manual",
        studentId: "",
        studentName: "",
        section: "",
        position: "",
        totalMarks: "",
        obtainedMarks: "",
        gpa: "",
        grade: "",
        remarksBn: "",
        remarksEn: "",
      });
      setPdf(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const isManual = form.entryType === "manual";
  const manualResults = items.filter((item) => (item.entryType ?? "pdf") === "manual");
  const pdfResults = items.filter((item) => (item.entryType ?? "pdf") === "pdf" || Boolean(item.pdfUrl));
  const manualResultsByClass = manualResults.reduce<Record<string, Result[]>>((acc, item) => {
    const key = item.className || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const manualClassNames = Object.keys(manualResultsByClass).sort((a, b) => a.localeCompare(b));
  const getCampusLabel = (campus: Result["campus"]) => {
    if (campus === "boys") return t("বালক", "Boys");
    if (campus === "girls") return t("বালিকা", "Girls");
    return t("উভয়", "Both");
  };

  return (
    <ModuleShell
      title={t("রেজাল্ট ম্যানেজমেন্ট", "Results Management")}
      description={t("পার্সোনাল ও গ্রুপ রেজাল্ট এখান থেকে যোগ, সাজানো ও প্রকাশ করুন", "Add, organize, and publish personal and group results from here")}
      actionLabel={showForm ? t("ফর্ম বন্ধ করুন", "Close form") : t("নতুন রেজাল্ট", "New Result")}
      onAction={() => setShowForm((current) => !current)}
      icon={<FileText className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving} submitLabel={t("রেজাল্ট সংরক্ষণ করুন", "Save result")}>
          <BilingualInput labelBn="পরীক্ষার নাম" labelEn="Exam name" valueBn={form.exam} valueEn={form.examEn} onBnChange={(value) => setForm((current) => ({ ...current, exam: value }))} onEnChange={(value) => setForm((current) => ({ ...current, examEn: value }))} />
          <BilingualInput labelBn="শ্রেণি" labelEn="Class" valueBn={form.className} valueEn={form.classNameEn} onBnChange={(value) => setForm((current) => ({ ...current, className: value }))} onEnChange={(value) => setForm((current) => ({ ...current, classNameEn: value }))} />
          <Field label={t("ক্যাম্পাস", "Campus")}>
            <select value={form.campus} onChange={(event) => setForm((current) => ({ ...current, campus: event.target.value as Result["campus"] }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
              <option value="both">{t("উভয়", "Both")}</option>
              <option value="boys">{t("বালক", "Boys")}</option>
              <option value="girls">{t("বালিকা", "Girls")}</option>
            </select>
          </Field>
          <Field label={t("রেজাল্টের ধরন", "Result type")}>
            <select
              value={form.entryType}
              onChange={(event) => setForm((current) => ({ ...current, entryType: event.target.value as Result["entryType"] }))}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
            >
              <option value="manual">{t("পার্সোনাল রেজাল্ট", "Personal result")}</option>
              <option value="pdf">{t("গ্রুপ রেজাল্ট", "Group result")}</option>
            </select>
          </Field>

          {isManual ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("স্টুডেন্ট আইডি", "Student ID")}>
                  <div className="relative">
                    <div className="relative">
                      <Input
                        value={form.studentId}
                        onFocus={() => setStudentIdFocused(true)}
                        onBlur={() => setTimeout(() => setStudentIdFocused(false), 120)}
                        onChange={(event) => {
                          const nextStudentId = event.target.value;
                          const matchedStudent = studentById.get(normalizeSearch(nextStudentId));

                          setForm((current) => ({
                            ...current,
                            studentId: nextStudentId,
                            studentName: matchedStudent?.studentName || "",
                            className: matchedStudent?.className || current.className,
                            section: matchedStudent?.section || "",
                          }));
                        }}
                        className="rounded-2xl pl-10"
                        placeholder={t("স্টুডেন্ট আইডি লিখে খুঁজুন", "Type student ID to search")}
                      />
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <p className="mt-2 font-bengali text-xs text-muted-foreground">
                      {t("ডিজিট ধরে ধরে সার্চ করুন, তারপর ট্যাপ করলে নাম অটো ফিল হবে", "Search digit by digit, then tap to auto-fill the student name")}
                    </p>
                    {studentIdFocused ? (
                      <div className="absolute z-20 mt-2 max-h-52 w-full overflow-auto rounded-2xl border border-border bg-background p-1 shadow-lg">
                        {studentSuggestions.length > 0 ? (
                          studentSuggestions.map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                applyStudentSelection(student);
                              }}
                              className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-secondary"
                            >
                              <span className="font-bengali text-sm font-semibold text-foreground">{student.studentId}</span>
                              <span className="font-bengali text-xs text-muted-foreground">
                                {student.studentName} - {student.className} - {student.section || "-"}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 font-bengali text-xs text-muted-foreground">
                            {t("কোনো স্টুডেন্ট পাওয়া যায়নি", "No student found")}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </Field>
                <Field label={t("শিক্ষার্থীর নাম", "Student name")}>
                  <Input value={form.studentName} onChange={(event) => setForm((current) => ({ ...current, studentName: event.target.value }))} className="rounded-2xl" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-5">
                <Field label={t("সেকশন", "Section")}>
                  <Input value={form.section} onChange={(event) => setForm((current) => ({ ...current, section: event.target.value }))} className="rounded-2xl" />
                </Field>
                <Field label={t("পজিশন", "Position")}>
                  <Input type="number" min="0" value={form.position} onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))} className="rounded-2xl" />
                </Field>
                <Field label={t("মোট নম্বর", "Total marks")}>
                  <Input type="number" min="0" value={form.totalMarks} onChange={(event) => setForm((current) => ({ ...current, totalMarks: event.target.value }))} className="rounded-2xl" />
                </Field>
                <Field label={t("প্রাপ্ত নম্বর", "Obtained marks")}>
                  <Input type="number" min="0" value={form.obtainedMarks} onChange={(event) => setForm((current) => ({ ...current, obtainedMarks: event.target.value }))} className="rounded-2xl" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("GPA", "GPA")}>
                  <Input type="number" min="0" max="5" step="0.01" value={form.gpa} onChange={(event) => setForm((current) => ({ ...current, gpa: event.target.value }))} className="rounded-2xl" />
                </Field>
                <Field label={t("গ্রেড", "Grade")}>
                  <Input value={form.grade} onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))} className="rounded-2xl" placeholder={t("A+, A, B...", "A+, A, B...")} />
                </Field>
              </div>
              <BilingualTextarea
                labelBn="মন্তব্য"
                labelEn="Remarks"
                valueBn={form.remarksBn}
                valueEn={form.remarksEn}
                onBnChange={(value) => setForm((current) => ({ ...current, remarksBn: value }))}
                onEnChange={(value) => setForm((current) => ({ ...current, remarksEn: value }))}
              />
            </>
          ) : (
            <FilePicker label={t("রেজাল্ট পিডিএফ", "Result PDF")} file={pdf} onFileChange={setPdf} accept="application/pdf" />
          )}
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো রেজাল্ট আপলোড করা হয়নি", "No results uploaded yet")} /> : (
            <>
              {manualClassNames.map((className) => (
                <div key={className} className="space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="font-bengali text-sm font-semibold text-foreground">
                    {t("পার্সোনাল রেজাল্ট ফোল্ডার", "Personal Result Folder")}: {className || t("অনির্ধারিত", "Uncategorized")}
                  </p>
                  <div className="space-y-3">
                    {manualResultsByClass[className].map((item) => (
                      <ItemCard key={item.id} title={`${item.exam} - ${item.className}`} meta={`${getCampusLabel(item.campus)} • ${t("পার্সোনাল", "Personal")}`} onDelete={() => item.id && void onDelete(item.id)}>
                        <div className="space-y-1">
                          <p className="font-bengali text-sm text-foreground">
                            {item.studentName || "-"} {item.studentId ? `• ${item.studentId}` : ""}
                          </p>
                          <p className="font-bengali text-xs text-muted-foreground">
                            {t("প্রাপ্ত", "Obtained")}: {Number(item.obtainedMarks || 0)} / {Number(item.totalMarks || 0)} • GPA: {Number(item.gpa || 0)} • {t("গ্রেড", "Grade")}: {item.grade || "-"}
                          </p>
                          <p className="font-bengali text-xs text-muted-foreground">
                            {t("পজিশন", "Position")}: {Number(item.position || 0) || "-"}
                          </p>
                          {(item.remarksBn || item.remarksEn) && <p className="font-bengali text-xs text-muted-foreground">{item.remarksBn || item.remarksEn}</p>}
                        </div>
                      </ItemCard>
                    ))}
                  </div>
                </div>
              ))}

              {pdfResults.length > 0 ? (
                <div className="space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="font-bengali text-sm font-semibold text-foreground">{t("গ্রুপ রেজাল্ট ফোল্ডার", "Group Result Folder")}</p>
                  <div className="space-y-3">
                    {pdfResults.map((item) => (
                      <ItemCard key={item.id} title={`${item.exam} - ${item.className}`} meta={`${getCampusLabel(item.campus)} • ${t("গ্রুপ", "Group")}`} onDelete={() => item.id && void onDelete(item.id)}>
                        {item.pdfUrl ? <a href={getDownloadUrl(item.pdfUrl)} target="_blank" rel="noopener noreferrer" className="font-bengali text-sm text-primary hover:underline">{t("পিডিএফ ডাউনলোড", "Download PDF")}</a> : null}
                      </ItemCard>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const ReviewsManagerPage = ({
  items,
  onApprove,
  onDelete,
}: {
  items: Review[];
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t, lang } = useLanguage();

  return (
    <ModuleShell
      title={t("রিভিউ ম্যানেজমেন্ট", "Reviews Management")}
      description={t("অভিভাবক ও শিক্ষার্থীদের রিভিউ অনুমোদন বা সরিয়ে দিন", "Approve or remove reviews from guardians and students")}
      icon={<MessageSquareQuote className="h-5 w-5" />}
    >
      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো রিভিউ জমা পড়েনি", "No reviews submitted yet")} /> : items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.name}
              meta={item.relation}
              onDelete={() => item.id && void onDelete(item.id)}
              trailing={!item.approved && item.id ? <Button size="sm" className="rounded-xl font-bengali" onClick={() => void onApprove(item.id!)}>{t("অনুমোদন", "Approve")}</Button> : undefined}
            >
              <p className="font-bengali text-sm text-muted-foreground italic">"{lang === "bn" ? item.review : item.reviewEn || item.review}"</p>
              <Badge variant={item.approved ? "default" : "secondary"} className="mt-3 rounded-full">{item.approved ? t("অনুমোদিত", "Approved") : t("অপেক্ষায়", "Pending")}</Badge>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const AchievementsManagerPage = ({
  items,
  onCreate,
  onDelete,
}: {
  items: AchievementItem[];
  onCreate: (payload: Omit<AchievementItem, "id" | "createdAt">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titleBn: "",
    titleEn: "",
    descriptionBn: "",
    descriptionEn: "",
    year: new Date().getFullYear().toString(),
    categoryBn: "",
    categoryEn: "",
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onCreate(form);
    setForm({
      titleBn: "",
      titleEn: "",
      descriptionBn: "",
      descriptionEn: "",
      year: new Date().getFullYear().toString(),
      categoryBn: "",
      categoryEn: "",
    });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <ModuleShell
      title={t("অর্জন ম্যানেজমেন্ট", "Achievements Management")}
      description={t("সার্টিফিকেট, স্বীকৃতি ও প্রতিষ্ঠানের গুরুত্বপূর্ণ অর্জন এখান থেকে প্রকাশ করুন", "Publish certificates, recognitions, and major institutional achievements from here")}
      actionLabel={t("নতুন অর্জন", "New Achievement")}
      onAction={() => setShowForm((current) => !current)}
      icon={<Award className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput
            labelBn="অর্জনের শিরোনাম"
            labelEn="Achievement title"
            valueBn={form.titleBn}
            valueEn={form.titleEn}
            onBnChange={(value) => setForm((current) => ({ ...current, titleBn: value }))}
            onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))}
          />
          <BilingualInput
            labelBn="ক্যাটাগরি"
            labelEn="Category"
            valueBn={form.categoryBn}
            valueEn={form.categoryEn}
            onBnChange={(value) => setForm((current) => ({ ...current, categoryBn: value }))}
            onEnChange={(value) => setForm((current) => ({ ...current, categoryEn: value }))}
          />
          <Field label={t("বছর", "Year")}>
            <input
              value={form.year}
              onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              placeholder="2026"
            />
          </Field>
          <BilingualTextarea
            labelBn="বিবরণ"
            labelEn="Description"
            valueBn={form.descriptionBn}
            valueEn={form.descriptionEn}
            onBnChange={(value) => setForm((current) => ({ ...current, descriptionBn: value }))}
            onEnChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))}
          />
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? (
            <EmptyState text={t("এখনও কোনো অর্জন প্রকাশ করা হয়নি", "No achievements have been published yet")} />
          ) : (
            items.map((item) => (
              <ItemCard key={item.id} title={item.titleBn} meta={item.year} onDelete={() => item.id && void onDelete(item.id)}>
                <div className="space-y-2">
                  {item.categoryBn ? (
                    <Badge variant="secondary" className="rounded-full">
                      {item.categoryBn}
                    </Badge>
                  ) : null}
                  <p className="font-bengali text-sm leading-7 text-muted-foreground">{item.descriptionBn}</p>
                </div>
              </ItemCard>
            ))
          )}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};




