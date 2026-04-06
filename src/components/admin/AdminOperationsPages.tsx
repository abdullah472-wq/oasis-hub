import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, Printer, UserCheck, Users, Video } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdmissionForm } from "@/lib/admission";
import type { Teacher } from "@/lib/teachers";
import type { VirtualTour } from "@/lib/virtualTour";
import type { AttendanceRecord, DashboardSettings, FeeRecord, GuardianRequest } from "@/lib/adminDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BilingualInput,
  BilingualTextarea,
  DeleteIconButton,
  EmptyState,
  Field,
  FilePicker,
  FormCard,
  ItemCard,
  ModuleShell,
  ToggleRow,
  shellCardClass,
} from "./AdminPagePrimitives";

export const TeachersManagerPage = ({
  items,
  onCreate,
  onDelete,
}: {
  items: Teacher[];
  onCreate: (payload: Omit<Teacher, "id" | "createdAt" | "imageUrl">, file: File | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", nameEn: "", designation: "", designationEn: "", campus: "boys" as Teacher["campus"] });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onCreate(form, image);
    setForm({ name: "", nameEn: "", designation: "", designationEn: "", campus: "boys" });
    setImage(null);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <ModuleShell
      title={t("শিক্ষক ম্যানেজমেন্ট", "Teachers Management")}
      description={t("শিক্ষকদের তথ্য, পদবি এবং ক্যাম্পাসভিত্তিক প্রোফাইল এখান থেকে সংরক্ষণ ও পরিচালনা করুন", "Manage teacher profiles, designations, and campus assignments from here")}
      actionLabel={t("নতুন শিক্ষক", "New Teacher")}
      onAction={() => setShowForm((current) => !current)}
      icon={<Users className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput labelBn="নাম" labelEn="Name" valueBn={form.name} valueEn={form.nameEn} onBnChange={(value) => setForm((current) => ({ ...current, name: value }))} onEnChange={(value) => setForm((current) => ({ ...current, nameEn: value }))} />
          <BilingualInput labelBn="পদবি" labelEn="Designation" valueBn={form.designation} valueEn={form.designationEn} onBnChange={(value) => setForm((current) => ({ ...current, designation: value }))} onEnChange={(value) => setForm((current) => ({ ...current, designationEn: value }))} />
          <Field label={t("ক্যাম্পাস", "Campus")}>
            <select value={form.campus} onChange={(event) => setForm((current) => ({ ...current, campus: event.target.value as Teacher["campus"] }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
              <option value="boys">{t("বালক", "Boys")}</option>
              <option value="girls">{t("বালিকা", "Girls")}</option>
            </select>
          </Field>
          <FilePicker label={t("শিক্ষকের ছবি", "Teacher image")} file={image} onFileChange={setImage} accept="image/*" />
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো শিক্ষক যোগ করা হয়নি", "No teachers added yet")} className="md:col-span-2 xl:col-span-3" /> : items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-2xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary">{item.name.charAt(0)}</div>}
                  <div>
                    <p className="font-bengali text-sm font-medium">{item.name}</p>
                    <p className="font-bengali text-xs text-muted-foreground">{item.designation}</p>
                    <Badge variant="secondary" className="mt-2 rounded-full">{item.campus}</Badge>
                  </div>
                </div>
                <DeleteIconButton onClick={() => item.id && void onDelete(item.id)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const VirtualToursManagerPage = ({
  items,
  onCreate,
  onDelete,
}: {
  items: VirtualTour[];
  onCreate: (payload: Omit<VirtualTour, "id" | "createdAt">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", titleEn: "", description: "", descriptionEn: "", videoUrl: "" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onCreate(form);
    setForm({ title: "", titleEn: "", description: "", descriptionEn: "", videoUrl: "" });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <ModuleShell
      title={t("ভার্চুয়াল ট্যুর ম্যানেজমেন্ট", "Virtual Tour Management")}
      description={t("ভিডিওভিত্তিক ক্যাম্পাস ট্যুর সংরক্ষণ, এডিট এবং প্রকাশ করুন", "Manage, edit, and publish video-based campus tours")}
      actionLabel={t("নতুন ট্যুর", "New Tour")}
      onAction={() => setShowForm((current) => !current)}
      icon={<Video className="h-5 w-5" />}
    >
      {showForm && (
        <FormCard onSubmit={submit} saving={saving}>
          <BilingualInput labelBn="ট্যুর শিরোনাম" labelEn="Tour title" valueBn={form.title} valueEn={form.titleEn} onBnChange={(value) => setForm((current) => ({ ...current, title: value }))} onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))} />
          <BilingualTextarea labelBn="বিবরণ" labelEn="Description" valueBn={form.description} valueEn={form.descriptionEn} onBnChange={(value) => setForm((current) => ({ ...current, description: value }))} onEnChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))} />
          <Field label={t("ভিডিও URL", "Video URL")}><Input value={form.videoUrl} onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))} className="rounded-2xl" placeholder="https://www.youtube.com/embed/..." /></Field>
        </FormCard>
      )}

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো ভার্চুয়াল ট্যুর নেই", "No virtual tours yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={item.title} meta={new Date(item.createdAt).toLocaleString("bn-BD")} onDelete={() => item.id && void onDelete(item.id)}>
              <div className="space-y-2">
                {item.description && <p className="font-bengali text-sm text-muted-foreground">{item.description}</p>}
                {item.videoUrl && <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="font-bengali text-sm text-primary hover:underline">{t("ভিডিও দেখুন", "Watch video")}</a>}
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const AdmissionsManagerPage = ({
  items,
  onDelete,
}: {
  items: AdmissionForm[];
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<AdmissionForm | null>(null);

  const buildAdmissionSummary = (item: AdmissionForm) =>
    [
      t("আবেদন সারাংশ", "Admission Summary"),
      "--------------------------------",
      `${t("শিক্ষার্থীর নাম", "Student name")}: ${item.studentNameBn || item.studentName}`,
      `${t("নাম (ইংরেজি)", "Name (English)")}: ${item.studentName}`,
      `${t("জন্ম তারিখ", "Birth date")}: ${item.birthDate || "-"}`,
      `${t("লিঙ্গ", "Gender")}: ${item.gender || "-"}`,
      `${t("ধর্ম", "Religion")}: ${item.religion || "-"}`,
      `${t("শ্রেণি", "Class")}: ${item.class || "-"}`,
      `${t("ক্যাম্পাস", "Campus")}: ${item.campus || "-"}`,
      "",
      `${t("পিতার নাম", "Father's name")}: ${item.fatherNameBn || item.fatherName}`,
      `${t("পিতার ফোন", "Father's phone")}: ${item.fatherPhone || "-"}`,
      `${t("মাতার নাম", "Mother's name")}: ${item.motherNameBn || item.motherName}`,
      `${t("মাতার ফোন", "Mother's phone")}: ${item.motherPhone || "-"}`,
      "",
      `${t("বর্তমান ঠিকানা", "Present address")}: ${item.presentAddressBn || item.presentAddress || "-"}`,
      `${t("স্থায়ী ঠিকানা", "Permanent address")}: ${item.permanentAddressBn || item.permanentAddress || "-"}`,
      "",
      `${t("স্ট্যাটাস", "Status")}: ${item.status}`,
      `${t("জমার সময়", "Submitted at")}: ${new Date(item.createdAt).toLocaleString("bn-BD")}`,
    ].join("\n");

  const selectedSummary = useMemo(() => (selectedItem ? buildAdmissionSummary(selectedItem) : ""), [selectedItem]);

  const downloadSummary = (item: AdmissionForm) => {
    const blob = new Blob([buildAdmissionSummary(item)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(item.studentName || "admission").replace(/\s+/g, "-").toLowerCase()}-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printSummary = (item: AdmissionForm) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const summary = buildAdmissionSummary(item)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />");

    printWindow.document.write(`
      <html>
        <head>
          <title>${item.studentName} - Admission Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            h1 { margin-bottom: 8px; }
            .meta { color: #4b5563; margin-bottom: 24px; }
            .card { border: 1px solid #d1d5db; border-radius: 16px; padding: 24px; line-height: 1.8; }
          </style>
        </head>
        <body>
          <h1>${t("ভর্তি আবেদন", "Admission Application")}</h1>
          <div class="meta">${item.studentNameBn || item.studentName}</div>
          <div class="card">${summary}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <ModuleShell
      title={t("ভর্তি আবেদন", "Admissions")}
      description={t("অনলাইন ভর্তি আবেদনগুলো পর্যালোচনা, যাচাই এবং প্রয়োজন হলে মুছে ফেলুন", "Review, verify, and remove incoming online admission applications")}
      icon={<Users className="h-5 w-5" />}
    >
      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("এখনও কোনো আবেদন জমা পড়েনি", "No applications yet")} /> : items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.studentNameBn || item.studentName}
              meta={`${item.class} • ${item.campus}`}
              onDelete={() => item.id && void onDelete(item.id)}
              trailing={
                <>
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setSelectedItem(item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t("ভিউ", "View")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => downloadSummary(item)}>
                    <Download className="mr-2 h-4 w-4" />
                    {t("ডাউনলোড", "Download")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => printSummary(item)}>
                    <Printer className="mr-2 h-4 w-4" />
                    {t("প্রিন্ট", "Print")}
                  </Button>
                </>
              }
            >
              <div className="space-y-1 font-bengali text-sm text-muted-foreground">
                <p>{t("পিতা", "Father")}: {item.fatherNameBn || item.fatherName} • {item.fatherPhone}</p>
                <p>{t("মাতা", "Mother")}: {item.motherNameBn || item.motherName} • {item.motherPhone}</p>
                <p>{t("ঠিকানা", "Address")}: {item.presentAddressBn || item.presentAddress}</p>
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-3xl">
          {selectedItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-bengali text-2xl">{selectedItem.studentNameBn || selectedItem.studentName}</DialogTitle>
                <DialogDescription className="font-bengali text-sm">
                  {t("ভর্তি আবেদন ফর্মের সম্পূর্ণ সারাংশ", "Full admission application summary")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                  <h3 className="mb-3 font-bengali text-base font-semibold">{t("শিক্ষার্থীর তথ্য", "Student information")}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">{t("নাম", "Name")}:</span> {selectedItem.studentNameBn || selectedItem.studentName}</p>
                    <p><span className="font-medium text-foreground">{t("নাম (ইংরেজি)", "Name (English)")}:</span> {selectedItem.studentName}</p>
                    <p><span className="font-medium text-foreground">{t("জন্ম তারিখ", "Birth date")}:</span> {selectedItem.birthDate || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("লিঙ্গ", "Gender")}:</span> {selectedItem.gender || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("ধর্ম", "Religion")}:</span> {selectedItem.religion || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("শ্রেণি", "Class")}:</span> {selectedItem.class || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("ক্যাম্পাস", "Campus")}:</span> {selectedItem.campus || "-"}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                  <h3 className="mb-3 font-bengali text-base font-semibold">{t("অভিভাবকের তথ্য", "Guardian information")}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">{t("পিতা", "Father")}:</span> {selectedItem.fatherNameBn || selectedItem.fatherName}</p>
                    <p><span className="font-medium text-foreground">{t("পিতার ফোন", "Father's phone")}:</span> {selectedItem.fatherPhone || "-"}</p>
                    <p><span className="font-medium text-foreground">{t("মাতা", "Mother")}:</span> {selectedItem.motherNameBn || selectedItem.motherName}</p>
                    <p><span className="font-medium text-foreground">{t("মাতার ফোন", "Mother's phone")}:</span> {selectedItem.motherPhone || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                <h3 className="mb-3 font-bengali text-base font-semibold">{t("ঠিকানা", "Address")}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">{t("বর্তমান ঠিকানা", "Present address")}:</span> {selectedItem.presentAddressBn || selectedItem.presentAddress || "-"}</p>
                  <p><span className="font-medium text-foreground">{t("স্থায়ী ঠিকানা", "Permanent address")}:</span> {selectedItem.permanentAddressBn || selectedItem.permanentAddress || "-"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background p-5">
                <pre className="whitespace-pre-wrap font-bengali text-sm leading-7 text-muted-foreground">{selectedSummary}</pre>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="outline" className="rounded-2xl" onClick={() => downloadSummary(selectedItem)}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("ডাউনলোড", "Download")}
                </Button>
                <Button className="rounded-2xl" onClick={() => printSummary(selectedItem)}>
                  <Printer className="mr-2 h-4 w-4" />
                  {t("প্রিন্ট", "Print")}
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
};
export const FeesManagerPage = ({
  items,
  onSave,
  onDelete,
}: {
  items: FeeRecord[];
  onSave: (record: FeeRecord) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<FeeRecord>({
    id: crypto.randomUUID(),
    title: "",
    amount: 0,
    dueDate: new Date().toISOString().slice(0, 10),
    campus: "both",
    status: "draft",
    note: "",
    createdAt: Date.now(),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
    setForm({ id: crypto.randomUUID(), title: "", amount: 0, dueDate: new Date().toISOString().slice(0, 10), campus: "both", status: "draft", note: "", createdAt: Date.now() });
  };

  return (
    <ModuleShell title={t("à¦«à¦¿ à¦®à§à¦¯à¦¾à¦¨à§‡à¦œà¦®à§‡à¦¨à§à¦Ÿ", "Fees Management")} description={t("à¦®à¦¾à¦¸à¦¿à¦• à¦«à¦¿, à¦¬à¦¿à¦¶à§‡à¦· à¦šà¦¾à¦°à§à¦œ à¦“ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¸à¦¾à¦°à§à¦•à§à¦²à¦¾à¦° à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦•à¦°à§à¦¨", "Manage monthly fees and payment circulars")} icon={<FileText className="h-5 w-5" />}>
      <FormCard onSubmit={submit}>
        <Field label={t("à¦«à¦¿ à¦¶à¦¿à¦°à§‹à¦¨à¦¾à¦®", "Fee title")}><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="rounded-2xl" /></Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("à¦ªà¦°à¦¿à¦®à¦¾à¦£", "Amount")}><Input type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} className="rounded-2xl" /></Field>
          <Field label={t("à¦¡à¦¿à¦‰ à¦¤à¦¾à¦°à¦¿à¦–", "Due date")}><Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className="rounded-2xl" /></Field>
          <Field label={t("à¦¸à§à¦Ÿà§à¦¯à¦¾à¦Ÿà¦¾à¦¸", "Status")}>
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FeeRecord["status"] }))} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
              <option value="draft">{t("à¦¡à§à¦°à¦¾à¦«à¦Ÿ", "Draft")}</option>
              <option value="published">{t("à¦ªà¦¾à¦¬à¦²à¦¿à¦¶à¦¡", "Published")}</option>
              <option value="closed">{t("à¦•à§à¦²à§‹à¦œà¦¡", "Closed")}</option>
            </select>
          </Field>
        </div>
        <Field label={t("à¦¨à§‹à¦Ÿ", "Note")}><Textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="rounded-2xl" rows={3} /></Field>
      </FormCard>

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("à¦à¦–à¦¨à¦“ à¦•à§‹à¦¨à§‹ à¦«à¦¿ à¦°à§‡à¦•à¦°à§à¦¡ à¦¨à§‡à¦‡", "No fee records yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={item.title} meta={`à§³${item.amount} â€¢ ${item.status}`} onDelete={() => onDelete(item.id)}>
              <p className="font-bengali text-sm text-muted-foreground">{item.note || t("à¦•à§‹à¦¨à§‹ à¦¨à§‹à¦Ÿ à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿", "No note added")}</p>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const AttendanceManagerPage = ({
  items,
  onSave,
  onDelete,
}: {
  items: AttendanceRecord[];
  onSave: (record: AttendanceRecord) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<AttendanceRecord>({
    id: crypto.randomUUID(),
    label: "",
    date: new Date().toISOString().slice(0, 10),
    campus: "both",
    presentCount: 0,
    absentCount: 0,
    createdAt: Date.now(),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
    setForm({ id: crypto.randomUUID(), label: "", date: new Date().toISOString().slice(0, 10), campus: "both", presentCount: 0, absentCount: 0, createdAt: Date.now() });
  };

  return (
    <ModuleShell title={t("à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦®à§à¦¯à¦¾à¦¨à§‡à¦œà¦®à§‡à¦¨à§à¦Ÿ", "Attendance Management")} description={t("à¦¦à§ˆà¦¨à¦¿à¦• à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿à¦° à¦¸à¦¾à¦°à¦¾à¦‚à¦¶ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦“ à¦ªà¦°à§à¦¯à¦¾à¦²à§‹à¦šà¦¨à¦¾ à¦•à¦°à§à¦¨", "Store and review daily attendance summaries")} icon={<UserCheck className="h-5 w-5" />}>
      <FormCard onSubmit={submit}>
        <Field label={t("à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦¶à¦¿à¦°à§‹à¦¨à¦¾à¦®", "Report label")}><Input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} className="rounded-2xl" /></Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("à¦¤à¦¾à¦°à¦¿à¦–", "Date")}><Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="rounded-2xl" /></Field>
          <Field label={t("à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤", "Present")}><Input type="number" value={form.presentCount} onChange={(event) => setForm((current) => ({ ...current, presentCount: Number(event.target.value) }))} className="rounded-2xl" /></Field>
          <Field label={t("à¦…à¦¨à§à¦ªà¦¸à§à¦¥à¦¿à¦¤", "Absent")}><Input type="number" value={form.absentCount} onChange={(event) => setForm((current) => ({ ...current, absentCount: Number(event.target.value) }))} className="rounded-2xl" /></Field>
        </div>
      </FormCard>

      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("à¦à¦–à¦¨à¦“ à¦•à§‹à¦¨à§‹ à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦°à§‡à¦•à¦°à§à¦¡ à¦¨à§‡à¦‡", "No attendance records yet")} /> : items.map((item) => (
            <ItemCard key={item.id} title={item.label} meta={item.date} onDelete={() => onDelete(item.id)}>
              <div className="flex gap-2">
                <Badge variant="secondary" className="rounded-full">{t("à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤", "Present")}: {item.presentCount}</Badge>
                <Badge variant="secondary" className="rounded-full">{t("à¦…à¦¨à§à¦ªà¦¸à§à¦¥à¦¿à¦¤", "Absent")}: {item.absentCount}</Badge>
              </div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const GuardianRequestsPage = ({
  items,
  onSave,
  onDelete,
}: {
  items: GuardianRequest[];
  onSave: (record: GuardianRequest) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useLanguage();

  return (
    <ModuleShell title={t("à¦—à¦¾à¦°à§à¦¡à¦¿à§Ÿà¦¾à¦¨ à¦°à¦¿à¦•à§‹à§Ÿà§‡à¦¸à§à¦Ÿ", "Guardian Requests")} description={t("à¦—à¦¾à¦°à§à¦¡à¦¿à§Ÿà¦¾à¦¨à¦¦à§‡à¦° à¦¸à¦¾à¦ªà§‹à¦°à§à¦Ÿ, à¦«à¦²à¦¾à¦«à¦², à¦«à¦¿ à¦“ à¦…à¦¨à§à¦¯à¦¾à¦¨à§à¦¯ à¦…à¦¨à§à¦°à§‹à¦§à¦—à§à¦²à§‹ à¦…à¦¨à§à¦¸à¦°à¦£ à¦•à¦°à§à¦¨", "Track guardian support and service requests")} icon={<Users className="h-5 w-5" />}>
      <Card className={shellCardClass}>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? <EmptyState text={t("à¦•à§‹à¦¨à§‹ à¦—à¦¾à¦°à§à¦¡à¦¿à§Ÿà¦¾à¦¨ à¦°à¦¿à¦•à§‹à§Ÿà§‡à¦¸à§à¦Ÿ à¦¨à§‡à¦‡", "No guardian requests")} /> : items.map((item) => (
            <ItemCard
              key={item.id}
              title={`${item.guardianName} â€¢ ${item.studentName}`}
              meta={item.topic}
              onDelete={() => onDelete(item.id)}
              trailing={
                <select
                  value={item.status}
                  onChange={(event) => onSave({ ...item, status: event.target.value as GuardianRequest["status"] })}
                  className="h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none"
                >
                  <option value="pending">{t("à¦ªà§‡à¦¨à§à¦¡à¦¿à¦‚", "Pending")}</option>
                  <option value="in-review">{t("à¦°à¦¿à¦­à¦¿à¦‰à¦¤à§‡", "In review")}</option>
                  <option value="resolved">{t("à¦¸à¦®à¦¾à¦§à¦¾à¦¨", "Resolved")}</option>
                </select>
              }
            >
              <p className="font-bengali text-sm text-muted-foreground">{item.message}</p>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
};

export const SettingsPage = ({
  settings,
  onSave,
}: {
  settings: DashboardSettings;
  onSave: (settings: DashboardSettings) => void;
}) => {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(draft);
  };

  return (
    <ModuleShell
      title={t("সেটিংস", "Settings")}
      description={t("ড্যাশবোর্ডের সাধারণ কনফিগারেশন ও সাপোর্ট তথ্য এখান থেকে আপডেট করুন", "Update the dashboard configuration and support information from here")}
      icon={<Users className="h-5 w-5" />}
    >
      <FormCard onSubmit={submit} submitLabel={t("সেটিংস সংরক্ষণ", "Save settings")}>
        <Field label={t("প্রতিষ্ঠানের নাম", "Institution name")}><Input value={draft.institutionName} onChange={(event) => setDraft((current) => ({ ...current, institutionName: event.target.value }))} className="rounded-2xl" /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("সাপোর্ট ইমেইল", "Support email")}><Input value={draft.supportEmail} onChange={(event) => setDraft((current) => ({ ...current, supportEmail: event.target.value }))} className="rounded-2xl" /></Field>
          <Field label={t("সাপোর্ট ফোন", "Support phone")}><Input value={draft.supportPhone} onChange={(event) => setDraft((current) => ({ ...current, supportPhone: event.target.value }))} className="rounded-2xl" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleRow label={t("ম্যানেজার ইমেইল নোটিফিকেশন", "Manager email notifications")} checked={draft.notifyManagersByEmail} onCheckedChange={(checked) => setDraft((current) => ({ ...current, notifyManagersByEmail: checked }))} />
          <ToggleRow label={t("ভর্তি চালু", "Admissions open")} checked={draft.admissionsOpen} onCheckedChange={(checked) => setDraft((current) => ({ ...current, admissionsOpen: checked }))} />
        </div>
      </FormCard>
    </ModuleShell>
  );
};









