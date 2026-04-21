import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { uploadDocument } from "./upload";

export interface Result {
  id?: string;
  exam: string;
  examEn: string;
  className: string;
  classNameEn: string;
  campus: "boys" | "girls" | "both";
  entryType?: "pdf" | "manual";
  studentId?: string;
  studentName?: string;
  section?: string;
  roll?: number;
  position?: number;
  totalMarks?: number;
  obtainedMarks?: number;
  gpa?: number;
  grade?: string;
  remarksBn?: string;
  remarksEn?: string;
  pdfUrl?: string;
  createdAt: number;
}

const LEGACY_RESULTS_COLLECTION = "results";
const PDF_RESULTS_COLLECTION = "results_pdf";
const MANUAL_RESULTS_ROOT_COLLECTION = "results_manual_classes";
const MANUAL_RESULTS_SUBCOLLECTION = "items";

const cleanPayload = <T extends object>(payload: T): T =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as T;

const toClassKey = (value: string) => {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return key || "uncategorized";
};

const buildManualResultId = (classKey: string, docId: string) => `manual::${classKey}::${docId}`;
const buildPdfResultId = (docId: string) => `pdf::${docId}`;
const buildLegacyResultId = (docId: string) => `legacy::${docId}`;

export const saveResult = async (result: Omit<Result, "id" | "createdAt">): Promise<Result> => {
  const cleanResult = cleanPayload(result);
  const createdAt = Date.now();

  if ((cleanResult.entryType ?? "manual") === "manual") {
    const classKey = toClassKey(cleanResult.className);
    const docRef = await addDoc(
      collection(db, MANUAL_RESULTS_ROOT_COLLECTION, classKey, MANUAL_RESULTS_SUBCOLLECTION),
      {
        ...cleanResult,
        entryType: "manual",
        classKey,
        createdAt,
      },
    );

    return {
      ...cleanResult,
      entryType: "manual",
      id: buildManualResultId(classKey, docRef.id),
      createdAt,
    };
  }

  const pdfDocRef = await addDoc(collection(db, PDF_RESULTS_COLLECTION), {
    ...cleanResult,
    entryType: "pdf",
    createdAt,
  });

  return {
    ...cleanResult,
    entryType: "pdf",
    id: buildPdfResultId(pdfDocRef.id),
    createdAt,
  };
};

export const getResults = async (): Promise<Result[]> => {
  const [legacySnapshot, pdfSnapshot, manualClassSnapshot] = await Promise.all([
    getDocs(query(collection(db, LEGACY_RESULTS_COLLECTION), orderBy("createdAt", "desc"))).catch(() => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>),),
    getDocs(query(collection(db, PDF_RESULTS_COLLECTION), orderBy("createdAt", "desc"))).catch(() => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>),),
    getDocs(collection(db, MANUAL_RESULTS_ROOT_COLLECTION)).catch(() => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>),),
  ]);

  const manualResultsNested = await Promise.all(
    manualClassSnapshot.docs.map(async (classDoc) => {
      const classKey = classDoc.id;
      const snapshot = await getDocs(
        query(collection(db, MANUAL_RESULTS_ROOT_COLLECTION, classKey, MANUAL_RESULTS_SUBCOLLECTION), orderBy("createdAt", "desc")),
      ).catch(() => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>));

      return snapshot.docs.map((item) => ({
        id: buildManualResultId(classKey, item.id),
        ...(item.data() as Omit<Result, "id">),
      }));
    }),
  );

  const pdfResults = pdfSnapshot.docs.map((item) => ({
    id: buildPdfResultId(item.id),
    ...(item.data() as Omit<Result, "id">),
  }));

  const legacyResults = legacySnapshot.docs.map((item) => ({
    id: buildLegacyResultId(item.id),
    ...(item.data() as Omit<Result, "id">),
  }));

  return [...manualResultsNested.flat(), ...pdfResults, ...legacyResults].sort(
    (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0),
  ) as Result[];
};

export const deleteResult = async (id: string): Promise<void> => {
  const normalized = String(id || "").trim();

  if (normalized.startsWith("manual::")) {
    const [, classKey, docId] = normalized.split("::");
    if (classKey && docId) {
      await deleteDoc(doc(db, MANUAL_RESULTS_ROOT_COLLECTION, classKey, MANUAL_RESULTS_SUBCOLLECTION, docId));
      return;
    }
  }

  if (normalized.startsWith("pdf::")) {
    const [, docId] = normalized.split("::");
    if (docId) {
      await deleteDoc(doc(db, PDF_RESULTS_COLLECTION, docId));
      return;
    }
  }

  if (normalized.startsWith("legacy::")) {
    const [, docId] = normalized.split("::");
    if (docId) {
      await deleteDoc(doc(db, LEGACY_RESULTS_COLLECTION, docId));
      return;
    }
  }

  await deleteDoc(doc(db, LEGACY_RESULTS_COLLECTION, normalized));
};

export const uploadResultPdf = async (file: File): Promise<string> => {
  return uploadDocument(file);
};
