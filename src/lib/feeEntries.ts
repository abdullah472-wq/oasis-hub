import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type FeeCategory = "monthly" | "admission" | "exam" | "supplies" | "transport" | "other";
export type FeeStatus = "unpaid" | "paid" | "partial";

export interface FeeEntry {
  id: string;
  studentId: string;
  guardianUid: string;
  guardianName: string;
  guardianPhone?: string;
  studentName: string;
  className: string;
  title: string;
  category: FeeCategory;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: FeeStatus;
  billingMonth: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface FeeStudentOption {
  studentId: string;
  guardianUid: string;
  guardianName: string;
  guardianPhone?: string;
  studentName: string;
  className: string;
}

export interface FeeItemDraft {
  title: string;
  category: FeeCategory;
  amount: number;
  note: string;
}

export interface FeeBatchDraft {
  studentId: string;
  guardianUid: string;
  guardianName: string;
  guardianPhone?: string;
  studentName: string;
  className: string;
  billingMonth: string;
  items: FeeItemDraft[];
}

export interface FeeEntryUpdateInput {
  title: string;
  category: FeeCategory;
  amount: number;
  paidAmount: number;
  billingMonth: string;
  note: string;
}

const FEE_ENTRIES_COLLECTION = "fee_entries";

const toMillis = (value: unknown) => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  return Date.now();
};

const toFeeEntry = (snapshot: QueryDocumentSnapshot<DocumentData>): FeeEntry => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    studentId: String(data.studentId ?? ""),
    guardianUid: String(data.guardianUid ?? ""),
    guardianName: String(data.guardianName ?? ""),
    guardianPhone: data.guardianPhone ? String(data.guardianPhone) : undefined,
    studentName: String(data.studentName ?? ""),
    className: String(data.className ?? ""),
    title: String(data.title ?? ""),
    category: (data.category as FeeCategory) ?? "other",
    amount: Number(data.amount ?? 0),
    paidAmount: Number(data.paidAmount ?? 0),
    dueAmount: Number(data.dueAmount ?? 0),
    status: (data.status as FeeStatus) ?? "unpaid",
    billingMonth: String(data.billingMonth ?? ""),
    note: data.note ? String(data.note) : undefined,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    createdBy: String(data.createdBy ?? ""),
  };
};

export const listFeeEntries = async (): Promise<FeeEntry[]> => {
  const snapshot = await getDocs(query(collection(db, FEE_ENTRIES_COLLECTION), orderBy("createdAt", "desc")));
  return snapshot.docs.map(toFeeEntry);
};

export const listGuardianFeeEntries = async (guardianUid: string): Promise<FeeEntry[]> => {
  const snapshot = await getDocs(query(collection(db, FEE_ENTRIES_COLLECTION), where("guardianUid", "==", guardianUid)));
  return snapshot.docs.map(toFeeEntry).sort((a, b) => b.createdAt - a.createdAt);
};

export const createFeeEntriesBatch = async (draft: FeeBatchDraft, createdBy: string): Promise<FeeEntry[]> => {
  const sanitizedItems = draft.items
    .map((item) => ({
      ...item,
      title: item.title.trim(),
      amount: Number(item.amount || 0),
      note: item.note.trim(),
    }))
    .filter((item) => item.title && item.amount > 0);

  const results = await Promise.all(
    sanitizedItems.map(async (item) => {
      const ref = doc(collection(db, FEE_ENTRIES_COLLECTION));
      const payload = {
        studentId: draft.studentId,
        guardianUid: draft.guardianUid.trim(),
        guardianName: draft.guardianName.trim(),
        guardianPhone: draft.guardianPhone?.trim() || "",
        studentName: draft.studentName.trim(),
        className: draft.className.trim(),
        title: item.title,
        category: item.category,
        amount: item.amount,
        paidAmount: 0,
        dueAmount: item.amount,
        status: "unpaid" as FeeStatus,
        billingMonth: draft.billingMonth,
        note: item.note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy,
      };

      await setDoc(ref, payload);

      return {
        id: ref.id,
        ...payload,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }),
  );

  return results.sort((a, b) => b.createdAt - a.createdAt);
};

export const updateFeeEntry = async (id: string, payload: FeeEntryUpdateInput & Pick<FeeEntry, "dueAmount" | "status">) => {
  await updateDoc(doc(db, FEE_ENTRIES_COLLECTION, id), {
    title: payload.title.trim(),
    category: payload.category,
    amount: payload.amount,
    paidAmount: payload.paidAmount,
    dueAmount: payload.dueAmount,
    status: payload.status,
    billingMonth: payload.billingMonth,
    note: payload.note.trim(),
    updatedAt: serverTimestamp(),
  });
};

export const updateFeeEntryPayment = async (id: string, payload: Pick<FeeEntry, "paidAmount" | "dueAmount" | "status">) => {
  await updateDoc(doc(db, FEE_ENTRIES_COLLECTION, id), {
    paidAmount: payload.paidAmount,
    dueAmount: payload.dueAmount,
    status: payload.status,
    updatedAt: serverTimestamp(),
  });
};

export const deleteFeeEntry = async (id: string) => {
  await deleteDoc(doc(db, FEE_ENTRIES_COLLECTION, id));
};
