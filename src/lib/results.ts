import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "./firebase";
import { uploadDocument } from "./upload";

export interface Result {
  id?: string;
  exam: string;
  examEn: string;
  className: string;
  classNameEn: string;
  campus: "boys" | "girls" | "both";
  resultType?: "personal" | "group";
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

const PERSONAL_RESULTS_COLLECTION = "personal_results";
const GROUP_RESULTS_COLLECTION = "group_results";
const LEGACY_RESULTS_COLLECTION = "results";
const LEGACY_PDF_RESULTS_COLLECTION = "results_pdf";
const LEGACY_MANUAL_RESULTS_ROOT_COLLECTION = "results_manual_classes";
const LEGACY_MANUAL_RESULTS_SUBCOLLECTION = "items";

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

const buildPersonalResultId = (docId: string) => `personal::${docId}`;
const buildGroupResultId = (docId: string) => `group::${docId}`;
const buildLegacyManualResultId = (classKey: string, docId: string) => `legacy-manual::${classKey}::${docId}`;
const buildLegacyPdfResultId = (docId: string) => `legacy-pdf::${docId}`;
const buildLegacyResultId = (docId: string) => `legacy::${docId}`;

const isPermissionError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeCode = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const maybeMessage = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return (
    maybeCode.includes("permission-denied") ||
    maybeMessage.includes("Missing or insufficient permissions")
  );
};

const normalizeResult = (id: string, data: Partial<Result>): Result => {
  const resultType =
    data.resultType ??
    (data.pdfUrl || data.entryType === "pdf" ? "group" : "personal");
  const entryType =
    data.entryType ??
    (resultType === "group" || data.pdfUrl ? "pdf" : "manual");

  return {
    id,
    exam: String(data.exam ?? ""),
    examEn: String(data.examEn ?? data.exam ?? ""),
    className: String(data.className ?? ""),
    classNameEn: String(data.classNameEn ?? data.className ?? ""),
    campus: (data.campus === "boys" || data.campus === "girls" || data.campus === "both" ? data.campus : "both"),
    resultType,
    entryType,
    studentId: data.studentId ? String(data.studentId) : undefined,
    studentName: data.studentName ? String(data.studentName) : undefined,
    section: data.section ? String(data.section) : undefined,
    roll: typeof data.roll === "number" ? data.roll : Number(data.roll ?? 0) || undefined,
    position: typeof data.position === "number" ? data.position : Number(data.position ?? 0) || undefined,
    totalMarks: typeof data.totalMarks === "number" ? data.totalMarks : Number(data.totalMarks ?? 0) || undefined,
    obtainedMarks: typeof data.obtainedMarks === "number" ? data.obtainedMarks : Number(data.obtainedMarks ?? 0) || undefined,
    gpa: typeof data.gpa === "number" ? data.gpa : Number(data.gpa ?? 0) || undefined,
    grade: data.grade ? String(data.grade) : undefined,
    remarksBn: data.remarksBn ? String(data.remarksBn) : undefined,
    remarksEn: data.remarksEn ? String(data.remarksEn) : undefined,
    pdfUrl: data.pdfUrl ? String(data.pdfUrl) : undefined,
    createdAt: Number(data.createdAt ?? Date.now()),
  };
};

export const saveResult = async (result: Omit<Result, "id" | "createdAt">): Promise<Result> => {
  const cleanResult = cleanPayload(result);
  const createdAt = Date.now();
  const resultType =
    cleanResult.resultType ??
    ((cleanResult.entryType ?? (cleanResult.pdfUrl ? "pdf" : "manual")) === "pdf" ? "group" : "personal");

  if (resultType === "personal") {
    const personalPayload = {
      ...cleanResult,
      entryType: "manual" as const,
      resultType: "personal" as const,
      createdAt,
    };

    try {
      const docRef = await addDoc(collection(db, PERSONAL_RESULTS_COLLECTION), personalPayload);
      return normalizeResult(buildPersonalResultId(docRef.id), personalPayload);
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }

      const classKey = toClassKey(cleanResult.className);
      const legacyDocRef = await addDoc(
        collection(db, LEGACY_MANUAL_RESULTS_ROOT_COLLECTION, classKey, LEGACY_MANUAL_RESULTS_SUBCOLLECTION),
        {
          ...personalPayload,
          classKey,
        },
      );

      return normalizeResult(buildLegacyManualResultId(classKey, legacyDocRef.id), personalPayload);
    }
  }

  const groupPayload = {
    ...cleanResult,
    entryType: "pdf" as const,
    resultType: "group" as const,
    createdAt,
  };

  try {
    const docRef = await addDoc(collection(db, GROUP_RESULTS_COLLECTION), groupPayload);
    return normalizeResult(buildGroupResultId(docRef.id), groupPayload);
  } catch (error) {
    if (!isPermissionError(error)) {
      throw error;
    }

    const legacyDocRef = await addDoc(collection(db, LEGACY_PDF_RESULTS_COLLECTION), groupPayload);
    return normalizeResult(buildLegacyPdfResultId(legacyDocRef.id), groupPayload);
  }
};

export const getResults = async (): Promise<Result[]> => {
  const [personalSnapshot, groupSnapshot, legacySnapshot, legacyPdfSnapshot, legacyManualClassSnapshot] = await Promise.all([
    getDocs(query(collection(db, PERSONAL_RESULTS_COLLECTION), orderBy("createdAt", "desc"))).catch(
      () => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>),
    ),
    getDocs(query(collection(db, GROUP_RESULTS_COLLECTION), orderBy("createdAt", "desc"))).catch(
      () => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>),
    ),
    getDocs(query(collection(db, LEGACY_RESULTS_COLLECTION), orderBy("createdAt", "desc"))).catch(
      () => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>),
    ),
    getDocs(query(collection(db, LEGACY_PDF_RESULTS_COLLECTION), orderBy("createdAt", "desc"))).catch(
      () => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>),
    ),
    getDocs(collection(db, LEGACY_MANUAL_RESULTS_ROOT_COLLECTION)).catch(
      () => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>),
    ),
  ]);

  const legacyManualResultsNested = await Promise.all(
    legacyManualClassSnapshot.docs.map(async (classDoc) => {
      const classKey = classDoc.id;
      const snapshot = await getDocs(
        query(collection(db, LEGACY_MANUAL_RESULTS_ROOT_COLLECTION, classKey, LEGACY_MANUAL_RESULTS_SUBCOLLECTION), orderBy("createdAt", "desc")),
      ).catch(() => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>));

      return snapshot.docs.map((item) =>
        normalizeResult(buildLegacyManualResultId(classKey, item.id), {
          ...(item.data() as Omit<Result, "id">),
          resultType: "personal",
          entryType: "manual",
        }),
      );
    }),
  );

  const personalResults = personalSnapshot.docs.map((item) =>
    normalizeResult(buildPersonalResultId(item.id), {
      ...(item.data() as Omit<Result, "id">),
      resultType: "personal",
      entryType: "manual",
    }),
  );

  const groupResults = groupSnapshot.docs.map((item) =>
    normalizeResult(buildGroupResultId(item.id), {
      ...(item.data() as Omit<Result, "id">),
      resultType: "group",
      entryType: "pdf",
    }),
  );

  const legacyResults = legacySnapshot.docs.map((item) =>
    normalizeResult(buildLegacyResultId(item.id), item.data() as Omit<Result, "id">),
  );

  const legacyPdfResults = legacyPdfSnapshot.docs.map((item) =>
    normalizeResult(buildLegacyPdfResultId(item.id), {
      ...(item.data() as Omit<Result, "id">),
      resultType: "group",
      entryType: "pdf",
    }),
  );

  return [
    ...personalResults,
    ...groupResults,
    ...legacyManualResultsNested.flat(),
    ...legacyPdfResults,
    ...legacyResults,
  ].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
};

export const deleteResult = async (id: string): Promise<void> => {
  const normalized = String(id || "").trim();

  if (normalized.startsWith("personal::")) {
    const [, docId] = normalized.split("::");
    if (docId) {
      await deleteDoc(doc(db, PERSONAL_RESULTS_COLLECTION, docId));
      return;
    }
  }

  if (normalized.startsWith("group::")) {
    const [, docId] = normalized.split("::");
    if (docId) {
      await deleteDoc(doc(db, GROUP_RESULTS_COLLECTION, docId));
      return;
    }
  }

  if (normalized.startsWith("legacy-manual::")) {
    const [, classKey, docId] = normalized.split("::");
    if (classKey && docId) {
      await deleteDoc(doc(db, LEGACY_MANUAL_RESULTS_ROOT_COLLECTION, classKey, LEGACY_MANUAL_RESULTS_SUBCOLLECTION, docId));
      return;
    }
  }

  if (normalized.startsWith("legacy-pdf::")) {
    const [, docId] = normalized.split("::");
    if (docId) {
      await deleteDoc(doc(db, LEGACY_PDF_RESULTS_COLLECTION, docId));
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

export const uploadResultPdf = async (file: File): Promise<string> => uploadDocument(file);
