import { useMemo, useState } from "react";
import { CreditCard, Download, Loader2, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildFeeEntryUpdatePayload, calculateFeeSummary } from "@/lib/feeHelpers";
import type { FeeBatchDraft, FeeCategory, FeeEntry, FeeEntryUpdateInput, FeeStatus, FeeStudentOption } from "@/lib/feeEntries";
import { matchesFeeSearch } from "@/lib/feeHelpers";
import {
  buildGuardianMonthlySummaryOptions,
  downloadGuardianMonthlySummary,
  printGuardianMonthlySummary,
} from "@/lib/feeSummaryExport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModuleShell } from "@/components/admin/AdminPagePrimitives";
import FeeEntriesTable from "./FeeEntriesTable";
import FeeEntryForm from "./FeeEntryForm";
import FeeFilters from "./FeeFilters";
import FeeSummaryCards from "./FeeSummaryCards";

interface FeesPageProps {
  entries: FeeEntry[];
  students: FeeStudentOption[];
  onCreateBatch: (draft: FeeBatchDraft) => Promise<void>;
  onUpdateEntry: (id: string, payload: FeeEntryUpdateInput) => Promise<void>;
  onUpdatePayment: (id: string, paidAmount: number) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

const FeesPage = ({ entries, students, onCreateBatch, onUpdateEntry, onUpdatePayment, onDeleteEntry }: FeesPageProps) => {
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState<FeeStatus | "all">("all");
  const [category, setCategory] = useState<FeeCategory | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FeeEntry | null>(null);
  const [paymentEntry, setPaymentEntry] = useState<FeeEntry | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("0");
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedSummaryKey, setSelectedSummaryKey] = useState("");

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (!matchesFeeSearch(entry, searchValue)) return false;
        if (month && entry.billingMonth !== month) return false;
        if (status !== "all" && entry.status !== status) return false;
        if (category !== "all" && entry.category !== category) return false;
        return true;
      }),
    [category, entries, month, searchValue, status],
  );

  const summary = useMemo(() => calculateFeeSummary(filteredEntries, month), [filteredEntries, month]);
  const guardianSummaryOptions = useMemo(() => buildGuardianMonthlySummaryOptions(filteredEntries), [filteredEntries]);

  const handlePaymentSave = async () => {
    if (!paymentEntry) return;

    setUpdatingPayment(true);
    try {
      await onUpdatePayment(paymentEntry.id, Number(paymentAmount || 0));
      setPaymentEntry(null);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const paymentPreview = paymentEntry
    ? buildFeeEntryUpdatePayload({
        title: paymentEntry.title,
        category: paymentEntry.category,
        amount: paymentEntry.amount,
        paidAmount: Number(paymentAmount || 0),
        billingMonth: paymentEntry.billingMonth,
        note: paymentEntry.note || "",
      })
    : null;

  const handleDownloadSummary = () => {
    const selectedOption = guardianSummaryOptions.find((item) => item.key === selectedSummaryKey);
    if (!selectedOption) return;

    const entriesForGuardian = filteredEntries.filter(
      (entry) =>
        `${entry.guardianUid || "no-guardian"}::${entry.studentId}` === selectedOption.key &&
        entry.billingMonth === month,
    );

    if (entriesForGuardian.length === 0) return;

    downloadGuardianMonthlySummary(entriesForGuardian, selectedOption, month);
    setSummaryOpen(false);
  };

  const handlePrintSummary = () => {
    const selectedOption = guardianSummaryOptions.find((item) => item.key === selectedSummaryKey);
    if (!selectedOption) return;

    const entriesForGuardian = filteredEntries.filter(
      (entry) =>
        `${entry.guardianUid || "no-guardian"}::${entry.studentId}` === selectedOption.key &&
        entry.billingMonth === month,
    );

    if (entriesForGuardian.length === 0) return;

    printGuardianMonthlySummary(entriesForGuardian, selectedOption, month);
  };

  return (
    <ModuleShell
      title={t("ফি ম্যানেজমেন্ট", "Fees Management")}
      description={t("শিক্ষার্থীভিত্তিক মাল্টি-আইটেম ফি, পেমেন্ট এবং ডিউ ট্র্যাক করুন", "Track student-wise multi-item fees, payments, and dues")}
      actionLabel={t("নতুন ফি এন্ট্রি", "New Fee Entry")}
      onAction={() => setCreateOpen(true)}
      icon={<CreditCard className="h-5 w-5" />}
    >
      <FeeSummaryCards summary={summary} />

      <FeeFilters searchValue={searchValue} status={status} category={category} month={month} onSearchChange={setSearchValue} onStatusChange={setStatus} onCategoryChange={setCategory} onMonthChange={setMonth} />

      <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="font-bengali text-xl">{t("ফি এন্ট্রি তালিকা", "Fee Entries")}</CardTitle>
            <CardDescription className="font-bengali">{t("আইটেমভিত্তিক বকেয়া, পরিশোধিত এবং শিক্ষার্থীভিত্তিক বিলিং হিসাব", "Item-wise due, paid, and student-specific billing records")}</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            <Button type="button" className="rounded-2xl font-bengali w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("ফি যোগ করুন", "Add Fees")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl font-bengali w-full sm:w-auto"
              onClick={() => {
                setSelectedSummaryKey(guardianSummaryOptions[0]?.key || "");
                setSummaryOpen(true);
              }}
              disabled={guardianSummaryOptions.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("মাসিক সামারি", "Monthly Summary")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="grid gap-3 border-b border-border/60 px-6 py-4 md:grid-cols-2">
            <MetaCard label={t("ফিল্টার করা এন্ট্রি", "Filtered entries")} value={String(filteredEntries.length)} />
            <MetaCard label={t("অনিষ্পন্ন আইটেম", "Unsettled items")} value={String(filteredEntries.filter((item) => item.status !== "paid").length)} />
          </div>
          <FeeEntriesTable entries={filteredEntries} onEdit={setEditingEntry} onPayment={(entry) => { setPaymentEntry(entry); setPaymentAmount(String(entry.paidAmount)); }} onDelete={onDeleteEntry} />
        </CardContent>
      </Card>

      <FeeEntryForm open={createOpen} mode="create" students={students} onOpenChange={setCreateOpen} onCreate={onCreateBatch} onUpdate={onUpdateEntry} />

      <FeeEntryForm open={Boolean(editingEntry)} mode="edit" students={students} initialEntry={editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)} onCreate={onCreateBatch} onUpdate={onUpdateEntry} />

      <Dialog open={Boolean(paymentEntry)} onOpenChange={(open) => !open && setPaymentEntry(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">{t("পেমেন্ট আপডেট", "Update Payment")}</DialogTitle>
          </DialogHeader>

          {paymentEntry && paymentPreview && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-muted/20 p-4">
                <p className="font-bengali text-base font-semibold text-foreground">{paymentEntry.studentName}</p>
                <p className="font-bengali text-sm text-muted-foreground">{paymentEntry.title}</p>
                <p className="mt-2 font-display text-lg font-semibold">৳{paymentEntry.amount.toLocaleString("en-US")}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">{t("মোট পরিশোধিত", "Total paid amount")}</Label>
                <Input type="number" min="0" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className="rounded-2xl" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <MetaCard label={t("বাকি", "Due")} value={`৳${paymentPreview.dueAmount.toLocaleString("en-US")}`} />
                <MetaCard label={t("স্ট্যাটাস", "Status")} value={t(paymentPreview.status === "paid" ? "পরিশোধিত" : paymentPreview.status === "partial" ? "আংশিক" : "বাকি", paymentPreview.status)} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setPaymentEntry(null)}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="button" className="rounded-2xl font-bengali" onClick={() => void handlePaymentSave()} disabled={updatingPayment}>
              {updatingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("পেমেন্ট সংরক্ষণ", "Save Payment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">{t("গার্ডিয়ান মাসিক সামারি ডাউনলোড", "Download Guardian Monthly Summary")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="font-bengali text-sm text-muted-foreground">{t("নির্বাচিত মাস", "Selected month")}</p>
              <p className="font-display text-lg font-semibold text-foreground">{month}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bengali">{t("গার্ডিয়ান / শিক্ষার্থী নির্বাচন", "Select guardian / student")}</Label>
              <select
                value={selectedSummaryKey}
                onChange={(event) => setSelectedSummaryKey(event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("একজন নির্বাচন করুন", "Choose one")}</option>
                {guardianSummaryOptions.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.studentName} - {item.guardianName} - {item.className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setSummaryOpen(false)}>
              {t("বাতিল", "Cancel")}
            </Button>
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={handlePrintSummary} disabled={!selectedSummaryKey}>
              {t("প্রিন্ট", "Print")}
            </Button>
            <Button type="button" className="rounded-2xl font-bengali" onClick={handleDownloadSummary} disabled={!selectedSummaryKey}>
              <Download className="mr-2 h-4 w-4" />
              {t("ডাউনলোড", "Download")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
};

const MetaCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
    <p className="font-bengali text-xs text-muted-foreground">{label}</p>
    <p className="font-display text-2xl font-semibold">{value}</p>
  </div>
);

export default FeesPage;
