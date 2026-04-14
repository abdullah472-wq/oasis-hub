import { useEffect, useState } from "react";
import { Award, CalendarDays, FileText, ImageIcon, MessageSquareQuote, Pencil, Trash2 } from "lucide-react";
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
import { createClientId } from "@/lib/uuid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const { t } = useLanguage();
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
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [form, setForm] = useState({ titleBn: "", titleEn: "", descriptionBn: "", descriptionEn: "" });
  const [noticeDraft, setNoticeDraft] = useState(noticeSettings);
  const [savingNoticeBar, setSavingNoticeBar] = useState(false);
  const [expandedNotices, setExpandedNotices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNoticeDraft(noticeSettings);
  }, [noticeSettings]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onCreate(form, pdf);
    setForm({ titleBn: "", titleEn: "", descriptionBn: "", descriptionEn: "" });
    setPdf(null);
    setShowForm(false);
    setSaving(false);
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

  const saveRunningNoticeBar = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingNoticeBar(true);
    await onSaveNoticeSettings({
      runningNoticeEnabled: noticeDraft.runningNoticeEnabled,
      runningNotices: noticeDraft.runningNotices,
    });
    setSavingNoticeBar(false);
  };

  return (
    <ModuleShell
      title={t("নোটিশ ম্যানেজমেন্ট", "Notice Management")}
      description={t("অফিশিয়াল নোটিশ, পিডিএফ সার্কুলার এবং রানিং নোটিশ বার এখান থেকে পরিচালনা করুন", "Manage official notices, PDF circulars, and the running notice bar from here")}
      actionLabel={t("নতুন নোটিশ", "New Notice")}
      onAction={() => setShowForm((current) => !current)}
      icon={<BellFileIcon className="h-5 w-5" />}
    >
      <FormCard onSubmit={saveRunningNoticeBar} saving={savingNoticeBar} submitLabel={t("নোটিশ বার সংরক্ষণ", "Save notice bar")}>
        <div className="space-y-4 rounded-3xl border border-border/70 bg-muted/30 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="font-bengali text-base font-semibold text-foreground">{t("রানিং নোটিশ বার", "Running notice bar")}</h3>
              <p className="mt-1 font-bengali text-sm text-muted-foreground">
                {t("মেইন নেভিগেশন বারের উপরে চলমান নোটিশ এখান থেকে add, edit, remove এবং hide/show করুন", "Add, edit, remove, and hide/show the running notice above the main navigation bar from here")}
              </p>
            </div>
            <Button type="button" variant="outline" className="rounded-2xl" onClick={addRunningNotice}>
              {t("নতুন নোটিশ যোগ করুন", "Add notice item")}
            </Button>
          </div>

          <ToggleRow
            label={t("রানিং নোটিশ দেখান", "Show running notice")}
            checked={noticeDraft.runningNoticeEnabled}
            onCheckedChange={(checked) => setNoticeDraft((current) => ({ ...current, runningNoticeEnabled: checked }))}
          />

          <div className="space-y-4">
            {noticeDraft.runningNotices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background/80 px-4 py-6 text-center font-bengali text-sm text-muted-foreground">
                {t("এখনও কোনো রানিং নোটিশ যোগ করা হয়নি", "No running notice items added yet")}
              </div>
            ) : (
              noticeDraft.runningNotices
                .slice()
                .sort((a, b) => a.priority - b.priority)
                .map((item, index) => (
                  <div key={item.id} className="space-y-4 rounded-3xl border border-border/70 bg-background p-5 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="font-bengali text-sm font-semibold text-foreground">
                          {t("টিকার আইটেম", "Ticker item")} #{index + 1}
                        </h4>
                        <p className="font-bengali text-xs text-muted-foreground">
                          {t("কম priority number আগে দেখানো হবে", "Lower priority number appears first")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => toggleNoticeExpanded(item.id)}>
                          {(expandedNotices[item.id] ?? true) ? t("লুকান", "Collapse") : t("দেখুন", "Expand")}
                        </Button>
                        <ToggleRow
                          label={t("সক্রিয়", "Active")}
                          checked={item.active}
                          onCheckedChange={(checked) => updateRunningNotice(item.id, "active", checked)}
                        />
                        <Button type="button" variant="ghost" className="rounded-2xl text-destructive hover:text-destructive" onClick={() => removeRunningNotice(item.id)}>
                          {t("রিমুভ", "Remove")}
                        </Button>
                      </div>
                    </div>

                    {(expandedNotices[item.id] ?? true) && (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label={t("নোটিশ টেক্সট (বাংলা)", "Notice text (Bangla)")}>
                            <textarea
                              value={item.textBn}
                              onChange={(event) => updateRunningNotice(item.id, "textBn", event.target.value)}
                              className="min-h-[110px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                            />
                          </Field>
                          <Field label={t("Notice text (English)", "Notice text (English)")}>
                            <textarea
                              value={item.textEn}
                              onChange={(event) => updateRunningNotice(item.id, "textEn", event.target.value)}
                              className="min-h-[110px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                            />
                          </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <Field label={t("লিংক", "Link")}>
                            <input
                              value={item.link || ""}
                              onChange={(event) => updateRunningNotice(item.id, "link", event.target.value)}
                              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                              placeholder="/notices অথবা https://..."
                            />
                          </Field>
                          <Field label={t("প্রকাশের তারিখ", "Publish date")}>
                            <input
                              type="date"
                              value={item.publishDate}
                              onChange={(event) => updateRunningNotice(item.id, "publishDate", event.target.value)}
                              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                            />
                          </Field>
                          <Field label={t("Priority", "Priority")}>
                            <input
                              type="number"
                              min={1}
                              value={item.priority}
                              onChange={(event) => updateRunningNotice(item.id, "priority", Number(event.target.value) || 1)}
                              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
                            />
                          </Field>
                        </div>
                      </>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </FormCard>

      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput labelBn="নোটিশ শিরোনাম" labelEn="Notice title" valueBn={form.titleBn} valueEn={form.titleEn} onBnChange={(value) => setForm((current) => ({ ...current, titleBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))} />
          <BilingualTextarea labelBn="নোটিশ বিবরণ" labelEn="Notice description" valueBn={form.descriptionBn} valueEn={form.descriptionEn} onBnChange={(value) => setForm((current) => ({ ...current, descriptionBn: value }))} onEnChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))} />
          <FilePicker label={t("পিডিএফ নোটিশ", "Notice PDF")} file={pdf} onFileChange={setPdf} accept="application/pdf" />
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো নোটিশ নেই", "No notices yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={item.titleBn} meta={new Date(item.createdAt).toLocaleString("bn-BD")} onDelete={() => item.id && void onDelete(item.id)}>
              <div className="space-y-2">
                {item.descriptionBn && <p className="font-bengali text-sm text-muted-foreground whitespace-pre-line">{item.descriptionBn}</p>}
                {item.pdfUrl && <a href={getDownloadUrl(item.pdfUrl)} target="_blank" rel="noopener noreferrer" className="font-bengali text-sm text-primary hover:underline">{t("পিডিএফ দেখুন", "View PDF")}</a>}
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const ResultsManagerPage = ({
  items,
  onCreate,
  onDelete,
}: {
  items: Result[];
  onCreate: (payload: Omit<Result, "id" | "createdAt" | "pdfUrl">, file: File | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [form, setForm] = useState({ exam: "", examEn: "", className: "", classNameEn: "", campus: "both" as Result["campus"] });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onCreate(form, pdf);
    setForm({ exam: "", examEn: "", className: "", classNameEn: "", campus: "both" });
    setPdf(null);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <ModuleShell
      title={t("ফলাফল ম্যানেজমেন্ট", "Results Management")}
      description={t("পরীক্ষার ফলাফল আপলোড ও ক্যাম্পাসভিত্তিক ব্যবস্থাপনা করুন", "Upload results and manage them by campus")}
      actionLabel={t("নতুন ফলাফল", "New Result")}
      onAction={() => setShowForm((current) => !current)}
      icon={<FileText className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput labelBn="পরীক্ষার নাম" labelEn="Exam name" valueBn={form.exam} valueEn={form.examEn} onBnChange={(value) => setForm((current) => ({ ...current, exam: value }))} onEnChange={(value) => setForm((current) => ({ ...current, examEn: value }))} />
          <BilingualInput labelBn="শ্রেণি" labelEn="Class" valueBn={form.className} valueEn={form.classNameEn} onBnChange={(value) => setForm((current) => ({ ...current, className: value }))} onEnChange={(value) => setForm((current) => ({ ...current, classNameEn: value }))} />
          <Field label={t("ক্যাম্পাস", "Campus")}>
            <select value={form.campus} onChange={(event) => setForm((current) => ({ ...current, campus: event.target.value as Result["campus"] }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
              <option value="both">{t("উভয়", "Both")}</option>
              <option value="boys">{t("বালক", "Boys")}</option>
              <option value="girls">{t("বালিকা", "Girls")}</option>
            </select>
          </Field>
          <FilePicker label={t("ফলাফলের পিডিএফ", "Result PDF")} file={pdf} onFileChange={setPdf} accept="application/pdf" />
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো ফলাফল আপলোড করা হয়নি", "No results uploaded yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={`${item.exam} - ${item.className}`} meta={item.campus} onDelete={() => item.id && void onDelete(item.id)}>
              {item.pdfUrl && <a href={getDownloadUrl(item.pdfUrl)} target="_blank" rel="noopener noreferrer" className="font-bengali text-sm text-primary hover:underline">{t("পিডিএফ ডাউনলোড", "Download PDF")}</a>}
            </ItemCard>
          ))}
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




