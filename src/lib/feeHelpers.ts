import type { AdmissionForm } from "@/lib/admission";
import type {
  FeeBatchDraft,
  FeeCategory,
  FeeEntry,
  FeeEntryUpdateInput,
  FeeItemDraft,
  FeeStatus,
  FeeStudentOption,
} from "@/lib/feeEntries";
import type { StudentRecord } from "@/lib/students";

export const feeCategoryOptions: Array<{ value: FeeCategory; labelBn: string; labelEn: string }> = [
  { value: "monthly", labelBn: "মাসিক", labelEn: "Monthly" },
  { value: "admission", labelBn: "ভর্তি", labelEn: "Admission" },
  { value: "exam", labelBn: "পরীক্ষা", labelEn: "Exam" },
  { value: "supplies", labelBn: "স্টেশনারি", labelEn: "Supplies" },
  { value: "transport", labelBn: "পরিবহন", labelEn: "Transport" },
  { value: "other", labelBn: "অন্যান্য", labelEn: "Other" },
];

export const feeStatusOptions: Array<{ value: FeeStatus; labelBn: string; labelEn: string }> = [
  { value: "unpaid", labelBn: "বাকি", labelEn: "Unpaid" },
  { value: "partial", labelBn: "আংশিক", labelEn: "Partial" },
  { value: "paid", labelBn: "পরিশোধিত", labelEn: "Paid" },
];

export interface FeeSummary {
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  unpaidItems: number;
  thisMonthAmount: number;
}

export const createEmptyFeeItem = (): FeeItemDraft => ({
  title: "",
  category: "monthly",
  amount: 0,
  note: "",
});

export const createEmptyFeeBatchDraft = (): FeeBatchDraft => ({
  studentId: "",
  guardianUid: "",
  guardianName: "",
  guardianPhone: "",
  studentName: "",
  className: "",
  billingMonth: new Date().toISOString().slice(0, 7),
  items: [createEmptyFeeItem()],
});

export const normalizePaidAmount = (amount: number, paidAmount: number) => {
  if (!Number.isFinite(paidAmount) || paidAmount <= 0) return 0;
  return Math.min(Number(amount || 0), Number(paidAmount || 0));
};

export const calculateFeeStatus = (amount: number, paidAmount: number): FeeStatus => {
  const normalizedPaid = normalizePaidAmount(amount, paidAmount);

  if (normalizedPaid <= 0) return "unpaid";
  if (normalizedPaid >= Number(amount || 0)) return "paid";
  return "partial";
};

export const buildFeeEntryUpdatePayload = (draft: FeeEntryUpdateInput) => {
  const amount = Math.max(0, Number(draft.amount || 0));
  const paidAmount = normalizePaidAmount(amount, draft.paidAmount);
  const dueAmount = Math.max(0, amount - paidAmount);

  return {
    ...draft,
    amount,
    paidAmount,
    dueAmount,
    status: calculateFeeStatus(amount, paidAmount),
  };
};

export const calculateFeeSummary = (entries: FeeEntry[], billingMonth?: string): FeeSummary => ({
  totalAmount: entries.reduce((sum, item) => sum + item.amount, 0),
  totalPaid: entries.reduce((sum, item) => sum + item.paidAmount, 0),
  totalDue: entries.reduce((sum, item) => sum + item.dueAmount, 0),
  unpaidItems: entries.filter((item) => item.status !== "paid").length,
  thisMonthAmount: entries
    .filter((item) => item.billingMonth === (billingMonth ?? new Date().toISOString().slice(0, 7)))
    .reduce((sum, item) => sum + item.amount, 0),
});

export const buildFeeStudentOptions = (students: StudentRecord[], admissions: AdmissionForm[]): FeeStudentOption[] => {
  const map = new Map<string, FeeStudentOption>();

  students.forEach((item) => {
    if (!item.studentId || !item.guardianUid) return;

    map.set(item.studentId, {
      studentId: item.studentId,
      guardianUid: item.guardianUid,
      guardianName: item.guardianName || "",
      guardianPhone: item.guardianPhone || "",
      studentName: item.studentName,
      className: item.className,
    });
  });

  admissions.forEach((item) => {
    if (!item.id) return;

    const current = map.get(item.id);

    map.set(item.id, {
      studentId: item.id,
      guardianUid: current?.guardianUid || "",
      guardianName:
        current?.guardianName ||
        item.fatherNameBn ||
        item.fatherName ||
        item.motherNameBn ||
        item.motherName ||
        "",
      guardianPhone: current?.guardianPhone || item.fatherPhone || item.motherPhone || "",
      studentName: item.studentNameBn || item.studentName,
      className: item.class,
    });
  });

  return Array.from(map.values())
    .filter((item) => item.studentId.trim())
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
};

export const matchesFeeSearch = (entry: FeeEntry, term: string) => {
  const query = term.trim().toLowerCase();
  if (!query) return true;

  return [
    entry.studentName,
    entry.studentId,
    entry.guardianName,
    entry.guardianUid,
    entry.className,
    entry.title,
    entry.billingMonth,
  ].some((value) => value.toLowerCase().includes(query));
};
