import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";
export type AccountCategory =
  | "cash"
  | "bank"
  | "receivable"
  | "fixed-asset"
  | "payable"
  | "loan"
  | "deposit"
  | "capital"
  | "retained-earnings"
  | "student-fees"
  | "admission-fees"
  | "donation"
  | "hostel-income"
  | "transport-income"
  | "other-income"
  | "salary"
  | "utilities"
  | "rent"
  | "maintenance"
  | "food"
  | "stationery"
  | "internet"
  | "miscellaneous";

export type VoucherType = "receipt" | "payment" | "journal" | "contra" | "adjustment";
export type VoucherStatus = "draft" | "pending" | "approved" | "rejected" | "cancelled";
export type DonationType =
  | "general"
  | "zakat"
  | "sadaqah"
  | "lillah"
  | "mosque"
  | "orphan"
  | "building";
export type FundCode = "general" | "mosque" | "orphan" | "building" | "scholarship";

export interface ChartOfAccount {
  id: string;
  tenantId: string;
  branchId?: string;
  code: string;
  name: string;
  nameEn?: string;
  type: AccountType;
  category: AccountCategory;
  parentId?: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  openingBalance: number;
  currentBalance: number;
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface JournalEntry {
  id: string;
  tenantId: string;
  branchId?: string;
  voucherType: VoucherType;
  voucherNumber: string;
  date: string;
  description?: string;
  reference?: string;
  fundCode?: FundCode;
  status: VoucherStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: number;
  transactionId?: string;
  createdAt: number;
  updatedAt: number;
  lines: JournalLine[];
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  description?: string;
  reference?: string;
}

export interface DonationRecord {
  id: string;
  tenantId: string;
  branchId?: string;
  donorName: string;
  phone?: string;
  address?: string;
  purpose?: string;
  donationType: DonationType;
  amount: number;
  paymentMethod: string;
  accountId?: string;
  voucherId?: string;
  receiptNumber: string;
  note?: string;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BankAccount {
  id: string;
  tenantId: string;
  branchId?: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountTitle?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CashBookEntry {
  id: string;
  tenantId: string;
  branchId?: string;
  date: string;
  type: "in" | "out";
  accountId?: string;
  amount: number;
  description?: string;
  reference?: string;
  voucherId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BudgetPlan {
  id: string;
  tenantId: string;
  branchId?: string;
  year: number;
  month?: number;
  accountId: string;
  amount: number;
  createdAt: number;
  updatedAt: number;
}

export interface FixedAsset {
  id: string;
  tenantId: string;
  branchId?: string;
  name: string;
  category: string;
  purchaseDate: string;
  cost: number;
  currentValue: number;
  depreciation: number;
  accountId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  module: string;
  action: string;
  recordId?: string;
  recordType?: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  device?: string;
  createdAt: number;
}

export type AccountSnapshot = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  balance: number;
  parentId?: string;
};

export type LedgerEntry = {
  id: string;
  date: string;
  voucherType: VoucherType;
  voucherNumber: string;
  description?: string;
  debit: number;
  credit: number;
  balance: number;
};

export const ACCOUNTS_COLLECTION = "chart_of_accounts";
export const JOURNAL_COLLECTION = "journal_entries";
export const DONATIONS_COLLECTION = "donations";
export const BANKS_COLLECTION = "bank_accounts";
export const CASH_COLLECTION = "cash_book";
export const BUDGET_COLLECTION = "budgets";
export const ASSETS_COLLECTION = "fixed_assets";
export const AUDIT_COLLECTION = "audit_logs";

const toMillis = (value: unknown) => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toMillis" in value && typeof (value as { toMillis: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  return Date.now();
};

export const normalizeAccount = (snapshot: QueryDocumentSnapshot<DocumentData>): ChartOfAccount => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    tenantId: String(data.tenantId ?? "default"),
    branchId: data.branchId ? String(data.branchId) : undefined,
    code: String(data.code ?? ""),
    name: String(data.name ?? ""),
    nameEn: data.nameEn ? String(data.nameEn) : undefined,
    type: (data.type as ChartOfAccount["type"]) ?? "asset",
    category: (data.category as AccountCategory) ?? "cash",
    parentId: data.parentId ? String(data.parentId) : undefined,
    description: data.description ? String(data.description) : undefined,
    isSystem: Boolean(data.isSystem),
    isActive: Boolean(data.isActive ?? true),
    openingBalance: Number(data.openingBalance ?? 0),
    currentBalance: Number(data.currentBalance ?? 0),
    orderIndex: Number(data.orderIndex ?? 0),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
};

export const normalizeJournal = (snapshot: QueryDocumentSnapshot<DocumentData>): JournalEntry => {
  const data = snapshot.data();
  const lines = Array.isArray(data.lines)
    ? data.lines.map((line: DocumentData, index: number) => ({
        id: String(line.id ?? `line-${index}`),
        accountId: String(line.accountId ?? ""),
        accountName: String(line.accountName ?? ""),
        accountType: (line.accountType as JournalLine["accountType"]) ?? "asset",
        debit: Number(line.debit ?? 0),
        credit: Number(line.credit ?? 0),
        description: line.description ? String(line.description) : undefined,
        reference: line.reference ? String(line.reference) : undefined,
      }))
    : [];

  return {
    id: snapshot.id,
    tenantId: String(data.tenantId ?? "default"),
    branchId: data.branchId ? String(data.branchId) : undefined,
    voucherType: (data.voucherType as JournalEntry["voucherType"]) ?? "journal",
    voucherNumber: String(data.voucherNumber ?? ""),
    date: String(data.date ?? ""),
    description: data.description ? String(data.description) : undefined,
    reference: data.reference ? String(data.reference) : undefined,
    fundCode: data.fundCode ? (data.fundCode as FundCode) : undefined,
    status: (data.status as JournalEntry["status"]) ?? "draft",
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
    approvedBy: data.approvedBy ? String(data.approvedBy) : undefined,
    approvedAt: data.approvedAt ? toMillis(data.approvedAt) : undefined,
    transactionId: data.transactionId ? String(data.transactionId) : undefined,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    lines,
  };
};

export const listAccounts = async (tenantId = "default"): Promise<ChartOfAccount[]> => {
  const records = await getDocs(query(collection(db, ACCOUNTS_COLLECTION), where("tenantId", "==", tenantId), orderBy("orderIndex", "asc")));
  return records.docs.map(normalizeAccount);
};

export const listJournals = async (tenantId = "default"): Promise<JournalEntry[]> => {
  const records = await getDocs(query(collection(db, JOURNAL_COLLECTION), where("tenantId", "==", tenantId), orderBy("date", "desc"), orderBy("createdAt", "desc")));
  return records.docs.map(normalizeJournal);
};

export const listDonations = async (tenantId = "default"): Promise<DonationRecord[]> => {
  const records = await getDocs(query(collection(db, DONATIONS_COLLECTION), where("tenantId", "==", tenantId), orderBy("createdAt", "desc")));
  return records.docs.map((snapshot) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      tenantId: String(data.tenantId ?? "default"),
      branchId: data.branchId ? String(data.branchId) : undefined,
      donorName: String(data.donorName ?? ""),
      phone: data.phone ? String(data.phone) : undefined,
      address: data.address ? String(data.address) : undefined,
      purpose: data.purpose ? String(data.purpose) : undefined,
      donationType: (data.donationType as DonationType) ?? "general",
      amount: Number(data.amount ?? 0),
      paymentMethod: String(data.paymentMethod ?? "cash"),
      accountId: data.accountId ? String(data.accountId) : undefined,
      voucherId: data.voucherId ? String(data.voucherId) : undefined,
      receiptNumber: String(data.receiptNumber ?? ""),
      note: data.note ? String(data.note) : undefined,
      createdBy: data.createdBy ? String(data.createdBy) : undefined,
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
    };
  });
};

export const createChartOfAccount = async (payload: Omit<ChartOfAccount, "id" | "createdAt" | "updatedAt" | "currentBalance" | "orderIndex"> & { id?: string }) => {
  const id = payload.id?.trim() || `coa-${new Date().getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  const snapshot = await setDoc(doc(db, ACCOUNTS_COLLECTION, id), {
    ...payload,
    currentBalance: payload.openingBalance,
    orderIndex: now,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id, createdAt: now, updatedAt: now };
};

export const updateChartOfAccount = async (id: string, patch: Partial<Pick<ChartOfAccount, "name" | "nameEn" | "description" | "isActive" | "openingBalance"> & Record<string, unknown>>) => {
  await updateDoc(doc(db, ACCOUNTS_COLLECTION, id), { ...patch, updatedAt: serverTimestamp() });
};

export const deleteChartOfAccount = async (id: string) => {
  await deleteDoc(doc(db, ACCOUNTS_COLLECTION, id));
};

export const createJournal = async (payload: Omit<JournalEntry, "id" | "createdAt" | "updatedAt" | "voucherNumber"> & { id?: string }) => {
  const id = payload.id?.trim() || `journal-${new Date().getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const voucherNumber = payload.voucherNumber || `V-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const now = Date.now();

  await runTransaction(db, async (tx) => {
    const accountRefs = payload.lines.map((line) => doc(db, ACCOUNTS_COLLECTION, line.accountId));
    const accountSnaps = await Promise.all(accountRefs.map((ref) => tx.get(ref)));
    const accounts = accountSnaps.map((snap) => snap.data() as DocumentData | undefined);

    payload.lines.forEach((line, index) => {
      const account = accounts[index];
      if (!account) return;

      const balanceChange = line.debit - line.credit;
      const currentBalance = Number(account.currentBalance ?? 0);
      const nextBalance = currentBalance + balanceChange;

      tx.update(accountRefs[index], { currentBalance: nextBalance, updatedAt: serverTimestamp() });
    });

    tx.set(doc(db, JOURNAL_COLLECTION, id), {
      ...payload,
      voucherNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return { id, voucherNumber, createdAt: now, updatedAt: now };
};

export const updateJournalStatus = async (id: string, status: JournalEntry["status"], approvedBy?: string) => {
  const patch: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if (approvedBy) patch.approvedBy = approvedBy;
  if (status === "approved") patch.approvedAt = serverTimestamp();
  await updateDoc(doc(db, JOURNAL_COLLECTION, id), patch);
};

export const deleteJournal = async (id: string) => {
  await deleteDoc(doc(db, JOURNAL_COLLECTION, id));
};

export const createDonation = async (payload: Omit<DonationRecord, "id" | "createdAt" | "updatedAt" | "receiptNumber"> & { id?: string }) => {
  const id = payload.id?.trim() || `donation-${new Date().getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const receiptNumber = `RCP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const now = Date.now();
  await setDoc(doc(db, DONATIONS_COLLECTION, id), { ...payload, receiptNumber, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id, receiptNumber, createdAt: now, updatedAt: now };
};

export const createBankAccount = async (payload: Omit<BankAccount, "id" | "createdAt" | "updatedAt" | "currentBalance"> & { id?: string }) => {
  const id = payload.id?.trim() || `bank-${new Date().getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  await setDoc(doc(db, BANKS_COLLECTION, id), { ...payload, currentBalance: payload.openingBalance, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id, createdAt: now, updatedAt: now };
};

export const listBankAccounts = async (tenantId = "default"): Promise<BankAccount[]> => {
  const records = await getDocs(query(collection(db, BANKS_COLLECTION), where("tenantId", "==", tenantId)));
  return records.docs.map((snapshot) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      tenantId: String(data.tenantId ?? "default"),
      branchId: data.branchId ? String(data.branchId) : undefined,
      bankName: String(data.bankName ?? ""),
      branch: data.branch ? String(data.branch) : undefined,
      accountNumber: String(data.accountNumber ?? ""),
      accountTitle: data.accountTitle ? String(data.accountTitle) : undefined,
      openingBalance: Number(data.openingBalance ?? 0),
      currentBalance: Number(data.currentBalance ?? 0),
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
    };
  });
};

export const updateBankAccount = async (id: string, patch: Partial<BankAccount>) => {
  await updateDoc(doc(db, BANKS_COLLECTION, id), { ...patch, updatedAt: serverTimestamp() });
};

export const deleteBankAccount = async (id: string) => {
  await deleteDoc(doc(db, BANKS_COLLECTION, id));
};

export const createCashEntry = async (payload: Omit<CashBookEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
  const id = payload.id?.trim() || `cash-${new Date().getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  await setDoc(doc(db, CASH_COLLECTION, id), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id, createdAt: now, updatedAt: now };
};

export const deleteCashEntry = async (id: string) => {
  await deleteDoc(doc(db, CASH_COLLECTION, id));
};

export const createBudgetPlan = async (payload: Omit<BudgetPlan, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
  const id = payload.id?.trim() || `budget-${new Date().getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  await setDoc(doc(db, BUDGET_COLLECTION, id), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id, createdAt: now, updatedAt: now };
};

export const createFixedAsset = async (payload: Omit<FixedAsset, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
  const id = payload.id?.trim() || `asset-${new Date().getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  await setDoc(doc(db, ASSETS_COLLECTION, id), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id, createdAt: now, updatedAt: now };
};

export const addAuditLog = async (entry: Omit<AuditLogEntry, "id" | "createdAt"> & { id?: string }) => {
  const id = entry.id?.trim() || `audit-${new Date().getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  await setDoc(doc(db, AUDIT_COLLECTION, id), { ...entry, createdAt: serverTimestamp() });
  return id;
};

export const buildGeneralLedger = (journals: JournalEntry[], accounts: ChartOfAccount[]): Map<string, LedgerEntry[]> => {
  const map = new Map<string, LedgerEntry[]>();
  const accountMap = new Map(accounts.map((account) => [account.id, account]));

  journals.forEach((journal) => {
    if (journal.status !== "approved") return;

    journal.lines.forEach((line) => {
      const current = map.get(line.accountId) || [];
      const account = accountMap.get(line.accountId);
      const runningBalance = current.length === 0 ? (account?.currentBalance ?? 0) : current[current.length - 1].balance + line.debit - line.credit;

      current.push({
        id: line.id,
        date: journal.date,
        voucherType: journal.voucherType,
        voucherNumber: journal.voucherNumber,
        description: line.description || journal.description,
        debit: line.debit,
        credit: line.credit,
        balance: runningBalance,
      });

      map.set(line.accountId, current);
    });
  });

  return map;
};

export const buildIncomeStatement = (journals: JournalEntry[], accounts: ChartOfAccount[]) => {
  const incomeAccounts = accounts.filter((account) => account.type === "income");
  const expenseAccounts = accounts.filter((account) => account.type === "expense");

  const calculateTotal = (targetAccounts: ChartOfAccount[]) =>
    journals
      .filter((journal) => journal.status === "approved")
      .reduce((sum, journal) => {
        const relevantLines = journal.lines.filter((line) => targetAccounts.some((account) => account.id === line.accountId));
        const totalDebit = relevantLines.reduce((s, line) => s + line.debit, 0);
        const totalCredit = relevantLines.reduce((s, line) => s + line.credit, 0);
        return sum + (targetAccounts[0]?.type === "income" ? totalCredit - totalDebit : totalDebit - totalCredit);
      }, 0);

  const totalIncome = calculateTotal(incomeAccounts);
  const totalExpense = calculateTotal(expenseAccounts);
  const netProfit = totalIncome - totalExpense;

  return { incomeAccounts, expenseAccounts, totalIncome, totalExpense, netProfit };
};

export const buildTrialBalance = (accounts: ChartOfAccount[]) => {
  const debits = accounts.filter((account) => account.type === "asset" || account.type === "expense").reduce((sum, account) => sum + account.currentBalance, 0);
  const credits = accounts.filter((account) => account.type === "liability" || account.type === "equity" || account.type === "income").reduce((sum, account) => sum + account.currentBalance, 0);
  return { debits, credits, accounts };
};

export const buildBalanceSheet = (accounts: ChartOfAccount[]) => {
  const assets = accounts.filter((account) => account.type === "asset").reduce((sum, account) => sum + account.currentBalance, 0);
  const liabilities = accounts.filter((account) => account.type === "liability").reduce((sum, account) => sum + account.currentBalance, 0);
  const equity = accounts.filter((account) => account.type === "equity").reduce((sum, account) => sum + account.currentBalance, 0);
  return { assets, liabilities, equity };
};

export const computeDashboardStats = (journals: JournalEntry[], accounts: ChartOfAccount[], donations: DonationRecord[]) => {
  const approved = journals.filter((journal) => journal.status === "approved");
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const todayIncome = approved
    .filter((journal) => journal.date === today)
    .reduce((sum, journal) => sum + journal.lines.filter((line) => line.credit > 0).reduce((s, line) => s + line.credit, 0) - journal.lines.filter((line) => line.debit > 0).reduce((s, line) => s + line.debit, 0), 0);

  const todayExpense = approved
    .filter((journal) => journal.date === today)
    .reduce((sum, journal) => sum + journal.lines.filter((line) => line.debit > 0).reduce((s, line) => s + line.debit, 0) - journal.lines.filter((line) => line.credit > 0).reduce((s, line) => s + line.credit, 0), 0);

  const monthIncome = approved
    .filter((journal) => journal.date.startsWith(thisMonth))
    .reduce((sum, journal) => sum + journal.lines.filter((line) => line.credit > 0).reduce((s, line) => s + line.credit, 0) - journal.lines.filter((line) => line.debit > 0).reduce((s, line) => s + line.debit, 0), 0);

  const monthExpense = approved
    .filter((journal) => journal.date.startsWith(thisMonth))
    .reduce((sum, journal) => sum + journal.lines.filter((line) => line.debit > 0).reduce((s, line) => s + line.debit, 0) - journal.lines.filter((line) => line.credit > 0).reduce((s, line) => s + line.credit, 0), 0);

  const cashAccount = accounts.find((account) => account.category === "cash");
  const bankAccount = accounts.find((account) => account.category === "bank");

  return {
    totalIncomeToday: todayIncome,
    totalExpenseToday: todayExpense,
    totalIncomeThisMonth: monthIncome,
    totalExpenseThisMonth: monthExpense,
    netProfit: monthIncome - monthExpense,
    cashInHand: cashAccount?.currentBalance ?? 0,
    bankBalance: bankAccount?.currentBalance ?? 0,
    outstandingReceivables: 0,
    outstandingPayables: 0,
    transactionCount: approved.length,
    pendingApprovals: journals.filter((journal) => journal.status === "pending").length,
    donationTotal: donations.reduce((sum, item) => sum + item.amount, 0),
  };
};
