import { useEffect, useMemo, useState } from "react";
import { CreditCard, Download, FileSpreadsheet, Loader2, Plus, Printer } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildFeeEntryUpdatePayload, calculateFeeSummary, matchesFeeSearch } from "@/lib/feeHelpers";
import type { FeeBatchDraft, FeeCategory, FeeEntry, FeeEntryUpdateInput, FeeStatus, FeeStudentOption } from "@/lib/feeEntries";
import { downloadFeeLedgerExcel, downloadFeeLedgerPdf, printFeeLedger } from "@/lib/feeLedgerExport";
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
import FeeLedgerTable, { type FeeLedgerRow } from "./FeeLedgerTable";
import FeeSummaryCards from "./FeeSummaryCards";

interface FeesPageProps {
  entries: FeeEntry[];
  students: FeeStudentOption[];
  onCreateBatch: (draft: FeeBatchDraft) => Promise<void>;
  onCreateBulk: (drafts: FeeBatchDraft[]) => Promise<void>;
  onUpdateEntry: (id: string, payload: FeeEntryUpdateInput) => Promise<void>;
  onUpdatePayment: (id: string, paidAmount: number) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

type PaymentTarget =
  | { type: "entry"; entries: [FeeEntry] }
  | { type: "group"; entries: FeeEntry[] };

type FeeViewMode = "entries" | "ledger";
type LedgerActionState = "pdf" | "excel" | "print" | null;

const formatLedgerDate = (timestamp?: number) => {
  if (!timestamp || Number.isNaN(timestamp)) return "";

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const FeesPage = ({ entries, students, onCreateBatch, onCreateBulk, onUpdateEntry, onUpdatePayment, onDeleteEntry }: FeesPageProps) => {
  const { t } = useLanguage();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [searchValue, setSearchValue] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [status, setStatus] = useState<FeeStatus | "all">("all");
  const [category, setCategory] = useState<FeeCategory | "all">("all");
  const [viewMode, setViewMode] = useState<FeeViewMode>("entries");
  const [ledgerAction, setLedgerAction] = useState<LedgerActionState>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FeeEntry | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("0");
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedSummaryKey, setSelectedSummaryKey] = useState("");
  const [monthTouched, setMonthTouched] = useState(false);

  const latestBillingMonth = useMemo(() => {
    const months = entries
      .map((entry) => entry.billingMonth)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => b.localeCompare(a));

    return months[0] ?? currentMonth;
  }, [currentMonth, entries]);

  useEffect(() => {
    if (monthTouched || entries.length === 0) return;
    if (entries.some((entry) => entry.billingMonth === month)) return;
    setMonth(latestBillingMonth);
  }, [entries, latestBillingMonth, month, monthTouched]);

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

  const ledgerSummaryEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (!matchesFeeSearch(entry, searchValue)) return false;
        if (month && entry.billingMonth !== month) return false;
        return true;
      }),
    [entries, month, searchValue],
  );

  const summaryEntries = viewMode === "ledger" ? ledgerSummaryEntries : filteredEntries;
  const summary = useMemo(() => calculateFeeSummary(summaryEntries, month), [summaryEntries, month]);
  const allTimeDue = useMemo(() => entries.reduce((sum, item) => sum + item.dueAmount, 0), [entries]);
  const guardianSummaryOptions = useMemo(() => buildGuardianMonthlySummaryOptions(filteredEntries), [filteredEntries]);

  const ledgerRows = useMemo<FeeLedgerRow[]>(() => {
    const query = searchValue.trim().toLowerCase();
    const monthEntries = entries.filter((entry) => entry.billingMonth === month);

    return students
      .filter((student) => {
        if (!query) return true;

        return [
          student.studentId,
          student.studentName,
          student.className,
          student.guardianName,
          student.guardianUid,
        ].some((value) => value.toLowerCase().includes(query));
      })
      .map((student) => {
        const studentEntries = monthEntries.filter((entry) => entry.studentId === student.studentId);
        const latestTimestamp = studentEntries.reduce((latest, entry) => {
          const candidate = Math.max(entry.updatedAt || 0, entry.createdAt || 0);
          return candidate > latest ? candidate : latest;
        }, 0);

        return {
          studentId: student.studentId,
          studentName: student.studentName,
          className: student.className,
          dateLabel: formatLedgerDate(latestTimestamp),
          monthlyAmount: studentEntries
            .filter((entry) => entry.category === "monthly")
            .reduce((sum, entry) => sum + entry.amount, 0),
          othersAmount: studentEntries
            .filter((entry) => entry.category !== "monthly")
            .reduce((sum, entry) => sum + entry.amount, 0),
          dueAmount: studentEntries.reduce((sum, entry) => sum + entry.dueAmount, 0),
          totalAmount: studentEntries.reduce((sum, entry) => sum + entry.amount, 0),
        };
      })
      .sort((a, b) => {
        const classComparison = a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: "base" });
        if (classComparison !== 0) return classComparison;

        const nameComparison = a.studentName.localeCompare(b.studentName, undefined, { sensitivity: "base" });
        if (nameComparison !== 0) return nameComparison;

        return a.studentId.localeCompare(b.studentId, undefined, { numeric: true, sensitivity: "base" });
      });
  }, [entries, month, searchValue, students]);

  const openEntryPayment = (entry: FeeEntry) => {
    setPaymentTarget({ type: "entry", entries: [entry] });
    setPaymentAmount(String(entry.paidAmount));
  };

  const openGroupPayment = (groupEntries: FeeEntry[]) => {
    setPaymentTarget({ type: "group", entries: groupEntries });
    setPaymentAmount(String(groupEntries.reduce((sum, entry) => sum + entry.paidAmount, 0)));
  };

  const handleDeleteGroup = async (groupEntries: FeeEntry[]) => {
    await Promise.all(groupEntries.map((entry) => onDeleteEntry(entry.id)));
  };

  const handlePaymentSave = async () => {
    if (!paymentTarget) return;

    setUpdatingPayment(true);
    try {
      const nextPaidAmount = Math.max(0, Number(paymentAmount || 0));

      if (paymentTarget.type === "entry") {
        await onUpdatePayment(paymentTarget.entries[0].id, nextPaidAmount);
      } else {
        let remainingPaid = nextPaidAmount;

        for (const entry of paymentTarget.entries) {
          const assignedPaid = Math.min(entry.amount, Math.max(0, remainingPaid));
          await onUpdatePayment(entry.id, assignedPaid);
          remainingPaid -= assignedPaid;
        }
      }

      setPaymentTarget(null);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const paymentPreview = useMemo(() => {
    if (!paymentTarget) return null;

    if (paymentTarget.type === "entry") {
      const paymentEntry = paymentTarget.entries[0];

      return {
        ...buildFeeEntryUpdatePayload({
          title: paymentEntry.title,
          category: paymentEntry.category,
          amount: paymentEntry.amount,
          paidAmount: Number(paymentAmount || 0),
          billingMonth: paymentEntry.billingMonth,
          note: paymentEntry.note || "",
        }),
        studentName: paymentEntry.studentName,
        title: paymentEntry.title,
      };
    }

    const totalAmount = paymentTarget.entries.reduce((sum, entry) => sum + entry.amount, 0);
    const normalizedPaid = Math.min(totalAmount, Math.max(0, Number(paymentAmount || 0)));
    const dueAmount = Math.max(0, totalAmount - normalizedPaid);
    const nextStatus = normalizedPaid <= 0 ? "unpaid" : dueAmount <= 0 ? "paid" : "partial";

    return {
      amount: totalAmount,
      paidAmount: normalizedPaid,
      dueAmount,
      status: nextStatus,
      studentName: paymentTarget.entries[0]?.studentName || "",
      title: t("সব আইটেম", "All Items"),
    };
  }, [paymentAmount, paymentTarget, t]);

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

  const handleLedgerPdfDownload = async () => {
    setLedgerAction("pdf");
    try {
      await downloadFeeLedgerPdf(ledgerRows, month, t);
    } finally {
      setLedgerAction(null);
    }
  };

  const handleLedgerExcelDownload = async () => {
    setLedgerAction("excel");
    try {
      await Promise.resolve(downloadFeeLedgerExcel(ledgerRows, month, t));
    } finally {
      setLedgerAction(null);
    }
  };

  const handleLedgerPrint = async () => {
    setLedgerAction("print");
    try {
      await printFeeLedger(ledgerRows, month, t);
    } finally {
      setLedgerAction(null);
    }
  };

  return (
    <ModuleShell
      title={t("ফি ম্যানেজমেন্ট", "Fees Management")}
      description={t("শিক্ষার্থীভিত্তিক মাল্টি-আইটেম ফি, পেমেন্ট এবং ডিউ ট্র্যাক করুন", "Track student-wise multi-item fees, payments, and dues")}
      actionLabel={t("নতুন ফি এন্ট্রি", "New Fee Entry")}
      onAction={() => setCreateOpen(true)}
      icon={<CreditCard className="h-5 w-5" />}
    >
      <FeeSummaryCards summary={summary} allTimeDue={allTimeDue} />

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant={viewMode === "entries" ? "default" : "outline"}
          className="rounded-2xl font-bengali"
          onClick={() => setViewMode("entries")}
        >
          {t("এন্ট্রি ভিউ", "Entries View")}
        </Button>
        <Button
          type="button"
          variant={viewMode === "ledger" ? "default" : "outline"}
          className="rounded-2xl font-bengali"
          onClick={() => setViewMode("ledger")}
        >
          {t("লেজার ভিউ", "Ledger View")}
        </Button>
      </div>

      <FeeFilters
        searchValue={searchValue}
        status={status}
        category={category}
        month={month}
        showStatusCategory={viewMode === "entries"}
        onSearchChange={setSearchValue}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
        onMonthChange={(value) => {
          setMonthTouched(true);
          setMonth(value);
        }}
      />

      {viewMode === "entries" ? (
        <Card className="rounded-3xl border-border/60 bg-white/95 shadow-[0_20px_60px_-40px_rgba(16,24,40,0.25)]">
          <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="font-bengali text-xl">{t("ফি এন্ট্রি তালিকা", "Fee Entries")}</CardTitle>
              <CardDescription className="font-bengali">
                {t("আইটেমভিত্তিক বকেয়া, পরিশোধিত এবং শিক্ষার্থীভিত্তিক বিলিং হিসাব", "Item-wise due, paid, and student-specific billing records")}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
              <Button type="button" className="w-full rounded-2xl font-bengali sm:w-auto" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("ফি যোগ করুন", "Add Fees")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl font-bengali sm:w-auto"
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
            <FeeEntriesTable
              entries={filteredEntries}
              onEdit={setEditingEntry}
              onPayment={openEntryPayment}
              onPaymentGroup={openGroupPayment}
              onDelete={onDeleteEntry}
              onDeleteGroup={handleDeleteGroup}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              className="rounded-2xl font-bengali sm:w-auto"
              onClick={() => void handleLedgerPdfDownload()}
              disabled={ledgerRows.length === 0 || ledgerAction !== null}
            >
              {ledgerAction === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {t("PDF ডাউনলোড", "Download PDF")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl font-bengali sm:w-auto"
              onClick={() => void handleLedgerExcelDownload()}
              disabled={ledgerRows.length === 0 || ledgerAction !== null}
            >
              {ledgerAction === "excel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
              {t("Excel এক্সপোর্ট", "Export Excel")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl font-bengali sm:w-auto"
              onClick={() => void handleLedgerPrint()}
              disabled={ledgerRows.length === 0 || ledgerAction !== null}
            >
              {ledgerAction === "print" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
              {t("প্রিন্ট", "Print")}
            </Button>
          </div>
          <FeeLedgerTable rows={ledgerRows} month={month} />
        </div>
      )}

      <FeeEntryForm
        open={createOpen}
        mode="create"
        students={students}
        onOpenChange={setCreateOpen}
        onCreate={onCreateBatch}
        onCreateBulk={onCreateBulk}
        onUpdate={onUpdateEntry}
      />

      <FeeEntryForm
        open={Boolean(editingEntry)}
        mode="edit"
        students={students}
        initialEntry={editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        onCreate={onCreateBatch}
        onCreateBulk={onCreateBulk}
        onUpdate={onUpdateEntry}
      />

      <Dialog open={Boolean(paymentTarget)} onOpenChange={(open) => !open && setPaymentTarget(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">{t("পেমেন্ট আপডেট", "Update Payment")}</DialogTitle>
          </DialogHeader>

          {paymentTarget && paymentPreview && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-muted/20 p-4">
                <p className="font-bengali text-base font-semibold text-foreground">{paymentPreview.studentName}</p>
                <p className="font-bengali text-sm text-muted-foreground">
                  {paymentTarget.type === "group" ? t("সব আইটেম পেমেন্ট", "All Items Payment") : paymentPreview.title}
                </p>
                <p className="mt-2 font-display text-lg font-semibold">৳{paymentPreview.amount.toLocaleString("en-US")}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-bengali">
                  {t(
                    paymentTarget.type === "group" ? "সব আইটেমে মোট পরিশোধিত" : "মোট পরিশোধিত",
                    paymentTarget.type === "group" ? "Total paid across all items" : "Total paid amount",
                  )}
                </Label>
                <Input type="number" min="0" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className="rounded-2xl" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <MetaCard label={t("বাকি", "Due")} value={`৳${paymentPreview.dueAmount.toLocaleString("en-US")}`} />
                <MetaCard
                  label={t("স্ট্যাটাস", "Status")}
                  value={t(
                    paymentPreview.status === "paid" ? "পরিশোধিত" : paymentPreview.status === "partial" ? "আংশিক" : "বাকি",
                    paymentPreview.status,
                  )}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={() => setPaymentTarget(null)}>
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
            <DialogTitle className="font-bengali text-xl">{t("গার্ডিয়ান মাসিক সামারি ডাউনলোড", "Download Guardian Monthly Summary")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="font-bengali text-sm text-muted-foreground">{t("নির্বাচিত মাস", "Selected month")}</p>
              <p className="font-display text-lg font-semibold text-foreground">{month}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bengali">{t("গার্ডিয়ান / শিক্ষার্থী নির্বাচন", "Select guardian / student")}</Label>
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
