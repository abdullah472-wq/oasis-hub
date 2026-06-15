import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createClientId } from "@/lib/uuid";
import { logActivity } from "@/lib/adminDashboard";

export type SubjectStatus = "active" | "inactive";
export type AcademicLevel =
  | "general"
  | "hifz"
  | "nazera"
  | "qirat"
  | "dars-e-nizami"
  | "custom";
export type SubjectCategory =
  | "bangla"
  | "english"
  | "mathematics"
  | "science"
  | "ict"
  | "quran"
  | "hadith"
  | "fiqh"
  | "aqidah"
  | "arabic"
  | "hifz-memorization"
  | "hifz-revision"
  | "hifz-sabak"
  | "hifz-manzil"
  | "tajweed"
  | "tilawah"
  | "qirat-performance"
  | "nahwu"
  | "sarf"
  | "balagah"
  | "mantiq"
  | "tafsir"
  | "custom";

export interface SubjectMarkConfig {
  fullMarks: number;
  passMarks: number;
  testMarks?: number;
  semesterMarks?: number;
  writtenMarks?: number;
  oralMarks?: number;
  practicalMarks?: number;
  assignmentMarks?: number;
}

export interface SubjectGpaConfig {
  includeInGpa: boolean;
}

export interface SubjectCreditConfig {
  creditHours: number;
  weightage: number;
}

export interface Subject {
  id: string;
  nameBn: string;
  nameEn: string;
  code: string;
  category: SubjectCategory;
  description?: string;
  academicLevel: AcademicLevel;
  status: SubjectStatus;
  markConfig?: SubjectMarkConfig;
  gpaConfig?: SubjectGpaConfig;
  creditConfig?: SubjectCreditConfig;
  orderIndex: number;
  dependencyCount: number;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

const SUBJECTS_COLLECTION = "subjects";
const SUBJECTS_CACHE_KEY = "oasis_subjects_v1";

const normalizeSubject = (item: Partial<Subject>, index: number): Subject => ({
  id: String(item.id || createClientId()),
  nameBn: String(item.nameBn || ""),
  nameEn: String(item.nameEn || ""),
  code: String(item.code || "").trim().toUpperCase(),
  category: (item.category as SubjectCategory) || "custom",
  description: item.description ? String(item.description) : undefined,
  academicLevel: (item.academicLevel as AcademicLevel) || "general",
  status: (item.status as SubjectStatus) || "active",
  markConfig: item.markConfig,
  gpaConfig: item.gpaConfig,
  creditConfig: item.creditConfig,
  orderIndex: typeof item.orderIndex === "number" ? item.orderIndex : index,
  dependencyCount: typeof item.dependencyCount === "number" ? item.dependencyCount : 0,
  tenantId: String(item.tenantId || "default"),
  createdAt: Number(item.createdAt || Date.now()),
  updatedAt: Number(item.updatedAt || Date.now()),
});

const isPermissionError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeCode = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const maybeMessage = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return maybeCode.includes("permission-denied") || maybeMessage.includes("Missing or insufficient permissions");
};

const readCache = (): Subject[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUBJECTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<Subject>>;
    return Array.isArray(parsed) ? parsed.map((item, index) => normalizeSubject(item, index)) : [];
  } catch {
    return [];
  }
};

const writeCache = (items: Subject[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUBJECTS_CACHE_KEY, JSON.stringify(items));
};

const toSubject = (snapshot: QueryDocumentSnapshot<DocumentData>): Subject => {
  const data = snapshot.data();
  return normalizeSubject(data as Partial<Subject>, 0);
};

export const listSubjects = async (tenantId = "default"): Promise<Subject[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, SUBJECTS_COLLECTION), orderBy("orderIndex", "asc"), orderBy("nameBn", "asc")),
    );
    const items = snapshot.docs
      .map((doc) => normalizeSubject({ ...doc.data(), id: doc.id }, 0))
      .filter((subject) => subject.tenantId === tenantId);
    writeCache(items);
    return items;
  } catch {
    return readCache().filter((subject) => subject.tenantId === tenantId);
  }
};

export const getSubjectByCode = async (code: string, tenantId = "default"): Promise<Subject | null> => {
  const subjects = await listSubjects(tenantId);
  return subjects.find((subject) => subject.code === code.toUpperCase()) || null;
};

export const saveSubject = async (payload: Omit<Subject, "createdAt" | "updatedAt" | "id"> & { id?: string }): Promise<Subject> => {
  const subjectId = payload.id?.trim() || createClientId();
  const now = Date.now();
  const nextSubject: Subject = {
    ...normalizeSubject(
      {
        ...payload,
        id: subjectId,
      },
      0,
    ),
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(
      doc(db, SUBJECTS_COLLECTION, subjectId),
      {
        nameBn: nextSubject.nameBn,
        nameEn: nextSubject.nameEn,
        code: nextSubject.code,
        category: nextSubject.category,
        description: nextSubject.description || "",
        academicLevel: nextSubject.academicLevel,
        status: nextSubject.status,
        markConfig: nextSubject.markConfig || {},
        gpaConfig: nextSubject.gpaConfig || {},
        creditConfig: nextSubject.creditConfig || {},
        orderIndex: nextSubject.orderIndex,
        dependencyCount: nextSubject.dependencyCount,
        tenantId: nextSubject.tenantId,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }

  const cachedItems = readCache();
  const nextItems = [...cachedItems.filter((item) => item.id !== subjectId), nextSubject].sort((a, b) => a.orderIndex - b.orderIndex);
  writeCache(nextItems);

  const action = payload.id ? "Subject updated" : "Subject created";
  const detail = `${nextSubject.nameBn} / ${nextSubject.nameEn}`;
  logActivity({ title: action, detail, module: "subjects" });

  return nextSubject;
};

export const updateSubjectStatus = async (id: string, status: SubjectStatus, tenantId = "default"): Promise<void> => {
  const now = Date.now();
  try {
    await updateDoc(doc(db, SUBJECTS_COLLECTION, id), {
      status,
      updatedAt: now,
    });
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }

  const cachedItems = readCache().filter((item) => item.tenantId === tenantId);
  const nextItems = cachedItems.map((item) => (item.id === id ? { ...item, status, updatedAt: now } : item));
  writeCache(nextItems);

  logActivity({
    title: "Subject status changed",
    detail: `${id} → ${status}`,
    module: "subjects",
  });
};

export const updateSubjectOrder = async (subjects: Subject[], tenantId = "default"): Promise<void> => {
  const ordered = subjects.map((subject, index) => ({ ...subject, orderIndex: index }));
  try {
    await Promise.all(
      ordered.map((subject) =>
        updateDoc(doc(db, SUBJECTS_COLLECTION, subject.id), {
          orderIndex: subject.orderIndex,
          updatedAt: Date.now(),
        }),
      ),
    );
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }

  writeCache(ordered);
  logActivity({
    title: "Subject order updated",
    detail: `${ordered.length} subjects reordered`,
    module: "subjects",
  });
};

export const deleteSubject = async (id: string, tenantId = "default"): Promise<void> => {
  try {
    await deleteDoc(doc(db, SUBJECTS_COLLECTION, id));
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }

  const cachedItems = readCache().filter((item) => item.tenantId === tenantId);
  const nextItems = cachedItems.filter((item) => item.id !== id);
  writeCache(nextItems);

  logActivity({
    title: "Subject deleted",
    detail: id,
    module: "subjects",
  });
};

export const bulkDeleteSubjects = async (ids: string[], tenantId = "default"): Promise<void> => {
  await Promise.all(ids.map((id) => deleteSubject(id, tenantId)));
};

const CATEGORY_LABELS: Record<SubjectCategory, { bn: string; en: string }> = {
  bangla: { bn: "বাংলা", en: "Bangla" },
  english: { bn: "ইংরেজি", en: "English" },
  mathematics: { bn: "গণিত", en: "Mathematics" },
  science: { bn: "বিজ্ঞান", en: "Science" },
  ict: { bn: "আইসিটি", en: "ICT" },
  quran: { bn: "কোরআন", en: "Quran" },
  hadith: { bn: "হাদিস", en: "Hadith" },
  fiqh: { bn: "ফিকহ", en: "Fiqh" },
  aqidah: { bn: "আকিদা", en: "Aqidah" },
  arabic: { bn: "আরবি", en: "Arabic" },
  "hifz-memorization": { bn: "হিফজ মুখস্থ", en: "Hifz Memorization" },
  "hifz-revision": { bn: "হিফজ পরীক্ষা", en: "Hifz Revision" },
  "hifz-sabak": { bn: "সবক", en: "Sabak" },
  "hifz-manzil": { bn: "মঞ্জিল", en: "Manzil" },
  tajweed: { bn: "তাজবিদ", en: "Tajweed" },
  tilawah: { bn: "তিলাওয়াত", en: "Tilawah" },
  "qirat-performance": { bn: "কিরাত পারফরম্যান্স", en: "Qirat Performance" },
  nahwu: { bn: "নাহু", en: "Nahwu" },
  sarf: { bn: "সরফ", en: "Sarf" },
  balagah: { bn: "বলাগাহ", en: "Balagah" },
  mantiq: { bn: "মান্তিক", en: "Mantiq" },
  tafsir: { bn: "তাফসির", en: "Tafsir" },
  custom: { bn: "কাস্টম", en: "Custom" },
};

export const getCategoryLabel = (category: SubjectCategory, lang = "bn"): string => {
  return CATEGORY_LABELS[category]?.[lang as "bn" | "en"] || category;
};

export const ACADEMIC_LEVEL_LABELS: Record<AcademicLevel, { bn: string; en: string }> = {
  general: { bn: "সাধারণ শিক্ষা", en: "General Education" },
  hifz: { bn: "হিফজ", en: "Hifz" },
  nazera: { bn: "নাজেরা", en: "Nazera" },
  qirat: { bn: "কিরাত", en: "Qirat" },
  "dars-e-nizami": { bn: "দারসে নিজামি", en: "Dars-e-Nizami" },
  custom: { bn: "কাস্টম", en: "Custom" },
};

export const getAcademicLevelLabel = (level: AcademicLevel, lang = "bn"): string => {
  return ACADEMIC_LEVEL_LABELS[level]?.[lang as "bn" | "en"] || level;
};

export const allCategories = Object.keys(CATEGORY_LABELS) as SubjectCategory[];
export const allAcademicLevels = Object.keys(ACADEMIC_LEVEL_LABELS) as AcademicLevel[];

export const isMarkDistributionValid = (markConfig: SubjectMarkConfig | undefined): boolean => {
  if (!markConfig) return true;
  const fullMarks = markConfig.fullMarks || 0;
  const passMarks = markConfig.passMarks || 0;
  if (passMarks > fullMarks) return false;

  if (typeof markConfig.testMarks === "number" && typeof markConfig.semesterMarks === "number") {
    return markConfig.testMarks + markConfig.semesterMarks === fullMarks;
  }
  const written = markConfig.writtenMarks || 0;
  const oral = markConfig.oralMarks || 0;
  const practical = markConfig.practicalMarks || 0;
  const assignment = markConfig.assignmentMarks || 0;
  const total = written + oral + practical + assignment;
  return total === fullMarks;
};

export const validateSubjectCodeUnique = async (code: string, excludeId?: string, tenantId = "default"): Promise<boolean> => {
  const subjects = await listSubjects(tenantId);
  return !subjects.some((subject) => subject.code === code.toUpperCase() && subject.id !== excludeId);
};

export const countSubjectsByStatus = (subjects: Subject[]): { active: number; inactive: number } => {
  return {
    active: subjects.filter((subject) => subject.status === "active").length,
    inactive: subjects.filter((subject) => subject.status === "inactive").length,
  };
};

export const countSubjectsByCategory = (subjects: Subject[]): Record<SubjectCategory, number> => {
  return subjects.reduce(
    (acc, subject) => {
      acc[subject.category] = (acc[subject.category] || 0) + 1;
      return acc;
    },
    {} as Record<SubjectCategory, number>,
  );
};
