import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type {
  ChartOfAccount,
  JournalEntry,
  DonationRecord,
  BankAccount,
  JournalLine,
  AccountType,
  VoucherType,
  VoucherStatus,
  DonationType,
  FundCode,
} from "@/lib/accounting";
import { computeDashboardStats } from "@/lib/accounting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import FeesPage from "@/components/admin/fees/FeesPage";
import type { FeeBatchDraft, FeeEntry, FeeEntryUpdateInput, FeeStudentOption } from "@/lib/feeEntries";

type AccountSavePayload = {
  id?: string;
  code: string;
  name: string;
  nameEn?: string;
  type: AccountType;
  openingBalance: number;
};

type JournalSavePayload = {
  id?: string;
  voucherType: VoucherType;
  date: string;
  description: string;
  reference: string;
  fundCode: FundCode;
  lines: JournalLine[];
  status: "draft";
  createdBy: "admin";
};

type DonationSavePayload = {
  id?: string;
  donorName: string;
  phone?: string;
  address?: string;
  donationType: DonationType;
  amount: number;
  paymentMethod: string;
  purpose?: string;
};

type BankSavePayload = {
  id?: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountTitle?: string;
  openingBalance: number;
};

interface AccountingPageProps {
  accounts: ChartOfAccount[];
  journals: JournalEntry[];
  donations: DonationRecord[];
  bankAccounts: BankAccount[];
  feeEntries: FeeEntry[];
  feeStudents: FeeStudentOption[];
  initialTab?: AccountingTab;
  onSaveAccount: (payload: AccountSavePayload) => Promise<AccountSavePayload>;
  onDeleteAccount: (id: string) => Promise<void>;
  onSaveJournal: (payload: JournalSavePayload) => Promise<JournalSavePayload>;
  onDeleteJournal: (id: string) => Promise<void>;
  onUpdateJournalStatus: (id: string, status: VoucherStatus) => Promise<void>;
  onSaveDonation: (payload: DonationSavePayload) => Promise<DonationSavePayload>;
  onSaveBank: (payload: BankSavePayload) => Promise<BankSavePayload>;
  onDeleteBank: (id: string) => Promise<void>;
  onCreateFeeBatch: (draft: FeeBatchDraft) => Promise<void>;
  onCreateFeeBulk: (drafts: FeeBatchDraft[]) => Promise<void>;
  onUpdateFeeEntry: (id: string, payload: FeeEntryUpdateInput) => Promise<void>;
  onUpdateFeePayment: (id: string, paidAmount: number) => Promise<void>;
  onDeleteFeeEntry: (id: string) => Promise<void>;
}

export type AccountingTab = "dashboard" | "accounts" | "journal" | "donations" | "banks" | "fees";

const EMPTY_LINE: JournalLine = { id: `line-${Date.now()}`, accountId: "", accountName: "", accountType: "asset", debit: 0, credit: 0, description: "", reference: "" };

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; labelBn: string; labelEn: string }[] = [
  { value: "asset", labelBn: "সম্পত্তি", labelEn: "Asset" },
  { value: "liability", labelBn: "দায়িত্ব", labelEn: "Liability" },
  { value: "equity", labelBn: "ইক্যুইটি", labelEn: "Equity" },
  { value: "income", labelBn: "আয়", labelEn: "Income" },
  { value: "expense", labelBn: "ব্যয়", labelEn: "Expense" },
];

const DONATION_TYPE_OPTIONS: { value: DonationType; labelBn: string; labelEn: string }[] = [
  { value: "general", labelBn: "সাধারণ দান", labelEn: "General Donation" },
  { value: "zakat", labelBn: "যাকাত", labelEn: "Zakat" },
  { value: "sadaqah", labelBn: "সদকাহ", labelEn: "Sadaqah" },
  { value: "lillah", labelBn: "লিল্লাহ", labelEn: "Lillah" },
  { value: "mosque", labelBn: "মসজিদ দান", labelEn: "Mosque Donation" },
  { value: "orphan", labelBn: "অনাথ তহবিল", labelEn: "Orphan Fund" },
  { value: "building", labelBn: "বিল্ডিং ফান্ড", labelEn: "Building Fund" },
];

const AccountingPage = ({
  accounts,
  journals,
  donations,
  bankAccounts,
  feeEntries,
  feeStudents,
  initialTab,
  onSaveAccount,
  onDeleteAccount,
  onSaveJournal,
  onDeleteJournal,
  onUpdateJournalStatus,
  onSaveDonation,
  onSaveBank,
  onDeleteBank,
  onCreateFeeBatch,
  onCreateFeeBulk,
  onUpdateFeeEntry,
  onUpdateFeePayment,
  onDeleteFeeEntry,
}: AccountingPageProps) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<AccountingTab>(initialTab ?? "dashboard");
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [journalFormOpen, setJournalFormOpen] = useState(false);
  const [donationFormOpen, setDonationFormOpen] = useState(false);
  const [bankFormOpen, setBankFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [accountForm, setAccountForm] = useState({ code: "", name: "", nameEn: "", type: "asset" as AccountType, openingBalance: 0 });
  const [journalLines, setJournalLines] = useState<JournalLine[]>([{ ...EMPTY_LINE }]);
  const [journalMeta, setJournalMeta] = useState({ voucherType: "journal" as VoucherType, date: new Date().toISOString().slice(0, 10), description: "", reference: "", fundCode: "general" as FundCode });
  const [donationForm, setDonationForm] = useState({ donorName: "", phone: "", address: "", donationType: "general" as DonationType, amount: 0, paymentMethod: "cash", purpose: "" });
  const [bankForm, setBankForm] = useState({ bankName: "", branch: "", accountNumber: "", accountTitle: "", openingBalance: 0 });

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  const stats = useMemo(() => computeDashboardStats(journals, accounts, donations), [journals, accounts, donations]);

  const updateLine = (index: number, patch: Partial<JournalLine>) => setJournalLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  const addLine = () => setJournalLines((current) => [...current, { ...EMPTY_LINE, id: `line-${Date.now()}` }]);
  const removeLine = (index: number) => setJournalLines((current) => current.filter((_, i) => i !== index));

  const handleSaveAccount = async () => {
    if (!accountForm.code || !accountForm.name) {
      toast.error(t("অ্যাকাউন্ট কোড ও নাম required", "Account code and name required"));
      return;
    }
    setSaving(true);
    try {
      await onSaveAccount({ ...accountForm, openingBalance: Number(accountForm.openingBalance || 0) });
      toast.success(t("অ্যাকাউন্ট সংরক্ষণ হয়েছে", "Account saved"));
      setAccountFormOpen(false);
      setAccountForm({ code: "", name: "", nameEn: "", type: "asset", openingBalance: 0 });
    } catch {
      toast.error(t("সংরক্ষণ সমস্যা", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveJournal = async () => {
    const validLines = journalLines.filter((line) => line.accountId && (line.debit > 0 || line.credit > 0));
    if (validLines.length < 2) {
      toast.error(t("কমপক্ষে ২ টি লাইন লাগবে", "At least 2 lines required"));
      return;
    }
    const totalDebit = validLines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = validLines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 1) {
      toast.error(t("ডেবিট ও ক্রেডিট সমান নেই", "Debit and credit not equal"));
      return;
    }
    setSaving(true);
    try {
      await onSaveJournal({ ...journalMeta, lines: validLines, status: "draft", createdBy: "admin" });
      toast.success(t("জার্নাল সংরক্ষণ হয়েছে", "Journal saved"));
      setJournalFormOpen(false);
      setJournalLines([{ ...EMPTY_LINE, id: `line-${Date.now()}` }]);
    } catch {
      toast.error(t("সংরক্ষণ সমস্যা", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDonation = async () => {
    if (!donationForm.donorName || !donationForm.amount) {
      toast.error(t("দাতার নাম ও পরিমাণ required", "Donor name and amount required"));
      return;
    }
    setSaving(true);
    try {
      await onSaveDonation({ ...donationForm, amount: Number(donationForm.amount || 0) });
      toast.success(t("দান রেকর্ড সংরক্ষণ হয়েছে", "Donation saved"));
      setDonationFormOpen(false);
      setDonationForm({ donorName: "", phone: "", address: "", donationType: "general", amount: 0, paymentMethod: "cash", purpose: "" });
    } catch {
      toast.error(t("সংরক্ষণ সমস্যা", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBank = async () => {
    if (!bankForm.bankName || !bankForm.accountNumber) {
      toast.error(t("ব্যাংক নাম ও অ্যাকাউন্ট নম্বর required", "Bank name and account number required"));
      return;
    }
    setSaving(true);
    try {
      await onSaveBank({ ...bankForm, openingBalance: Number(bankForm.openingBalance || 0) });
      toast.success(t("ব্যাংক অ্যাকাউন্ট সংরক্ষণ হয়েছে", "Bank account saved"));
      setBankFormOpen(false);
      setBankForm({ bankName: "", branch: "", accountNumber: "", accountTitle: "", openingBalance: 0 });
    } catch {
      toast.error(t("সংরক্ষণ সমস্যা", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="font-bengali text-2xl font-semibold text-foreground">{t("অ্যাকাউন্টিং ড্যাশবোর্ড", "Accounting Dashboard")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {[
          { label: t("আজকের আয়", "Income Today"), value: `৳${stats.totalIncomeToday.toLocaleString("en-US")}` },
          { label: t("আজকের ব্যয়", "Expense Today"), value: `৳${stats.totalExpenseToday.toLocaleString("en-US")}` },
          { label: t("এই মাসের আয়", "Income This Month"), value: `৳${stats.totalIncomeThisMonth.toLocaleString("en-US")}` },
          { label: t("এই মাসের ব্যয়", "Expense This Month"), value: `৳${stats.totalExpenseThisMonth.toLocaleString("en-US")}` },
          { label: t("নিট লাভ/ক্ষতি", "Net Profit/Loss"), value: `৳${stats.netProfit.toLocaleString("en-US")}` },
          { label: t("হাতে নগদ", "Cash in Hand"), value: `৳${stats.cashInHand.toLocaleString("en-US")}` },
          { label: t("ব্যাংক ব্যালেন্স", "Bank Balance"), value: `৳${stats.bankBalance.toLocaleString("en-US")}` },
          { label: t("মোট লেনদেন", "Total Transactions"), value: String(stats.transactionCount) },
          { label: t("অনুমোদন মুলতুবি", "Pending Approvals"), value: String(stats.pendingApprovals) },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border-border/60 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="font-bengali text-xs text-muted-foreground">{item.label}</p>
              <p className="font-display text-xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bengali text-lg font-semibold">{t("চার্ট অফ অ্যাকাউন্টস", "Chart of Accounts")}</h3>
        <Button className="rounded-2xl font-bengali" onClick={() => setAccountFormOpen(true)}>{t("অ্যাকাউন্ট যোগ করুন", "Add Account")}</Button>
      </div>
      <Card className="rounded-2xl border-border/60 bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_100px_100px_100px] gap-3 border-b border-border/60 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase min-w-0">
            <span className="min-w-0">{t("অ্যাকাউন্ট", "Account")}</span>
            <span>{t("কোড", "Code")}</span>
            <span>{t("টাইপ", "Type")}</span>
            <span>{t("ব্যালেন্স", "Balance")}</span>
          </div>
          {accounts.map((account) => (
            <div key={account.id} className="grid grid-cols-[1fr_100px_100px_100px] gap-3 px-4 py-2 border-b border-border/30 items-center text-sm">
              <div className="min-w-0 truncate">{t(account.name, account.nameEn || account.name)}</div>
              <span className="truncate">{account.code}</span>
              <Badge variant="outline" className="rounded-full text-[11px]">{account.type}</Badge>
              <span className="font-medium">৳{account.currentBalance.toLocaleString("en-US")}</span>
            </div>
          ))}
          {accounts.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t("কোনো অ্যাকাউন্ট নেই", "No accounts")}</p>}
        </CardContent>
      </Card>
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bengali text-lg font-semibold">{t("জার্নাল এন্ট্রি", "Journal Entries")}</h3>
        <Button className="rounded-2xl font-bengali" onClick={() => setJournalFormOpen(true)}>{t("নতুন এন্ট্রি", "New Entry")}</Button>
      </div>
      <Card className="rounded-2xl border-border/60 bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-3 border-b border-border/60 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase min-w-0">
            <span>{t("ভাউচার", "Voucher")}</span>
            <span>{t("তারিখ", "Date")}</span>
            <span>{t("স্ট্যাটাস", "Status")}</span>
            <span>{t("লাইন", "Lines")}</span>
          </div>
          {journals.map((journal) => (
            <div key={journal.id} className="grid grid-cols-[1fr_1fr_100px_100px] gap-3 px-4 py-2 border-b border-border/30 items-center text-sm">
              <div className="min-w-0 truncate">{journal.voucherNumber}</div>
              <span>{journal.date}</span>
              <Badge variant="outline" className="rounded-full text-[11px]">{journal.status}</Badge>
              <span>{journal.lines.length}</span>
            </div>
          ))}
          {journals.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t("কোনো এন্ট্রি নেই", "No entries")}</p>}
        </CardContent>
      </Card>
    </div>
  );

  const renderDonations = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bengali text-lg font-semibold">{t("দান", "Donations")}</h3>
        <Button className="rounded-2xl font-bengali" onClick={() => setDonationFormOpen(true)}>{t("নতুন দান", "New Donation")}</Button>
      </div>
      <Card className="rounded-2xl border-border/60 bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_100px_100px] gap-3 border-b border-border/60 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase min-w-0">
            <span>{t("দাতা", "Donor")}</span>
            <span>{t("পরিমাণ", "Amount")}</span>
            <span>{t("তারিখ", "Date")}</span>
          </div>
          {donations.map((donation) => (
            <div key={donation.id} className="grid grid-cols-[1fr_100px_100px] gap-3 px-4 py-2 border-b border-border/30 items-center text-sm">
              <div className="min-w-0 truncate">{donation.donorName}</div>
              <span className="font-medium">৳{donation.amount.toLocaleString("en-US")}</span>
              <span>{new Date(donation.createdAt).toLocaleDateString("en-GB")}</span>
            </div>
          ))}
          {donations.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t("কোনো দান নেই", "No donations")}</p>}
        </CardContent>
      </Card>
    </div>
  );

  const renderBanks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bengali text-lg font-semibold">{t("ব্যাংক অ্যাকাউন্ট", "Bank Accounts")}</h3>
        <Button className="rounded-2xl font-bengali" onClick={() => setBankFormOpen(true)}>{t("অ্যাকাউন্ট যোগ", "Add Account")}</Button>
      </div>
      <Card className="rounded-2xl border-border/60 bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-3 border-b border-border/60 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase min-w-0">
            <span>{t("ব্যাংক", "Bank")}</span>
            <span>{t("অ্যাকাউন্ট", "Account")}</span>
            <span>{t("ব্যালেন্স", "Balance")}</span>
            <span />
          </div>
          {bankAccounts.map((bank) => (
            <div key={bank.id} className="grid grid-cols-[1fr_1fr_100px_100px] gap-3 px-4 py-2 border-b border-border/30 items-center text-sm">
              <div className="min-w-0 truncate">{bank.bankName}</div>
              <span className="truncate">{bank.accountNumber}</span>
              <span className="font-medium">৳{bank.currentBalance.toLocaleString("en-US")}</span>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-red-500" onClick={() => onDeleteBank(bank.id)}>{t("মুছুন", "Delete")}</Button>
            </div>
          ))}
          {bankAccounts.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t("কোনো ব্যাংক অ্যাকাউন্ট নেই", "No bank accounts")}</p>}
        </CardContent>
      </Card>
    </div>
  );

  const renderFees = () => (
    <FeesPage
      entries={feeEntries}
      students={feeStudents}
      onCreateBatch={onCreateFeeBatch}
      onCreateBulk={onCreateFeeBulk}
      onUpdateEntry={onUpdateFeeEntry}
      onUpdatePayment={onUpdateFeePayment}
      onDeleteEntry={onDeleteFeeEntry}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {([
          { key: "dashboard", labelBn: "ড্যাশবোর্ড", labelEn: "Dashboard" },
          { key: "accounts", labelBn: "অ্যাকাউন্ট", labelEn: "Accounts" },
          { key: "journal", labelBn: "জার্নাল", labelEn: "Journal" },
          { key: "donations", labelBn: "দান", labelEn: "Donations" },
          { key: "banks", labelBn: "ব্যাংক", labelEn: "Banks" },
          { key: "fees", labelBn: "ফি", labelEn: "Fees" },
        ] as const).map((item) => (
          <Button key={item.key} variant={tab === item.key ? "default" : "outline"} className="rounded-2xl font-bengali" onClick={() => setTab(item.key)}>
            {t(item.labelBn, item.labelEn)}
          </Button>
        ))}
      </div>

      {tab === "dashboard" && renderDashboard()}
      {tab === "accounts" && renderAccounts()}
      {tab === "journal" && renderJournal()}
      {tab === "donations" && renderDonations()}
      {tab === "banks" && renderBanks()}
      {tab === "fees" && renderFees()}

      <Dialog open={accountFormOpen} onOpenChange={setAccountFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("অ্যাকাউন্ট যোগ করুন", "Add Account")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("অ্যাকাউন্ট কোড", "Account Code")}</Label>
                <Input value={accountForm.code} onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })} />
              </div>
              <div>
                <Label>{t("অ্যাকাউন্ট টাইপ", "Account Type")}</Label>
                <Select value={accountForm.type} onValueChange={(v) => setAccountForm({ ...accountForm, type: v as AccountType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{t(opt.labelBn, opt.labelEn)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("অ্যাকাউন্ট নাম (বাংলা)", "Account Name (Bn)")}</Label>
              <Input value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} />
            </div>
            <div>
              <Label>{t("অ্যাকাউন্ট নাম (ইংরেজি)", "Account Name (En)")}</Label>
              <Input value={accountForm.nameEn} onChange={(e) => setAccountForm({ ...accountForm, nameEn: e.target.value })} />
            </div>
            <div>
              <Label>{t("খুলনা ব্যালেন্স", "Opening Balance")}</Label>
              <Input type="number" value={accountForm.openingBalance} onChange={(e) => setAccountForm({ ...accountForm, openingBalance: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveAccount} disabled={saving}>{t("সংরক্ষণ করুন", "Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={journalFormOpen} onOpenChange={setJournalFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("নতুন জার্নাল এন্ট্রি", "New Journal Entry")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{t("ভাউচার টাইপ", "Voucher Type")}</Label>
                <Select value={journalMeta.voucherType} onValueChange={(v) => setJournalMeta({ ...journalMeta, voucherType: v as VoucherType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">{t("জার্নাল", "Journal")}</SelectItem>
                    <SelectItem value="payment">{t("পেমেন্ট", "Payment")}</SelectItem>
                    <SelectItem value="receipt">{t("রিসিট", "Receipt")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("তারিখ", "Date")}</Label>
                <Input type="date" value={journalMeta.date} onChange={(e) => setJournalMeta({ ...journalMeta, date: e.target.value })} />
              </div>
              <div>
                <Label>{t("রেফারেন্স", "Reference")}</Label>
                <Input value={journalMeta.reference} onChange={(e) => setJournalMeta({ ...journalMeta, reference: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>{t("বর্ণনা", "Description")}</Label>
              <Textarea value={journalMeta.description} onChange={(e) => setJournalMeta({ ...journalMeta, description: e.target.value })} />
            </div>
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{t("লাইন আইটেম", "Line Items")}</h4>
                <Button size="sm" onClick={addLine}>{t("লাইন যোগ", "Add Line")}</Button>
              </div>
              {journalLines.map((line, i) => (
                <div key={line.id} className="grid grid-cols-6 gap-2 mb-2 items-end">
                  <Select value={line.accountId} onValueChange={(v) => updateLine(i, { accountId: v, accountName: accounts.find((a) => a.id === v)?.name || "", accountType: accounts.find((a) => a.id === v)?.type || "asset" })}>
                    <SelectTrigger className="col-span-2"><SelectValue placeholder={t("অ্যাকাউন্ট", "Account")} /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{t(a.name, a.nameEn || a.name)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder={t("ডেবিট", "Debit")} value={line.debit} onChange={(e) => updateLine(i, { debit: Number(e.target.value) })} />
                  <Input type="number" placeholder={t("ক্রেডিট", "Credit")} value={line.credit} onChange={(e) => updateLine(i, { credit: Number(e.target.value) })} />
                  <Input placeholder={t("বর্ণনা", "Description")} value={line.description} onChange={(e) => updateLine(i, { description: e.target.value })} />
                  <Button variant="ghost" size="sm" onClick={() => removeLine(i)} disabled={journalLines.length <= 1}>{t("সরান", "Remove")}</Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveJournal} disabled={saving}>{t("সংরক্ষণ করুন", "Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={donationFormOpen} onOpenChange={setDonationFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("নতুন দান", "New Donation")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>{t("দাতার নাম", "Donor Name")}</Label>
              <Input value={donationForm.donorName} onChange={(e) => setDonationForm({ ...donationForm, donorName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("ফোন", "Phone")}</Label>
                <Input value={donationForm.phone} onChange={(e) => setDonationForm({ ...donationForm, phone: e.target.value })} />
              </div>
              <div>
                <Label>{t("পরিমাণ", "Amount")}</Label>
                <Input type="number" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>{t("দানের ধরন", "Donation Type")}</Label>
              <Select value={donationForm.donationType} onValueChange={(v) => setDonationForm({ ...donationForm, donationType: v as DonationType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DONATION_TYPE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{t(opt.labelBn, opt.labelEn)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("উদ্দেশ্য", "Purpose")}</Label>
              <Input value={donationForm.purpose} onChange={(e) => setDonationForm({ ...donationForm, purpose: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveDonation} disabled={saving}>{t("সংরক্ষণ করুন", "Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bankFormOpen} onOpenChange={setBankFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ব্যাংক অ্যাকাউন্ট যোগ", "Add Bank Account")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>{t("ব্যাংকের নাম", "Bank Name")}</Label>
              <Input value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} />
            </div>
            <div>
              <Label>{t("শাখা", "Branch")}</Label>
              <Input value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} />
            </div>
            <div>
              <Label>{t("অ্যাকাউন্ট নম্বর", "Account Number")}</Label>
              <Input value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} />
            </div>
            <div>
              <Label>{t("অ্যাকাউন্ট টাইটেল", "Account Title")}</Label>
              <Input value={bankForm.accountTitle} onChange={(e) => setBankForm({ ...bankForm, accountTitle: e.target.value })} />
            </div>
            <div>
              <Label>{t("খুলনা ব্যালেন্স", "Opening Balance")}</Label>
              <Input type="number" value={bankForm.openingBalance} onChange={(e) => setBankForm({ ...bankForm, openingBalance: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveBank} disabled={saving}>{t("সংরক্ষণ করুন", "Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountingPage;