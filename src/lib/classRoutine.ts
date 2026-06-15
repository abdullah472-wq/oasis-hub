import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ClassRoutineItem {
  id: string;
  day: string;
  dayBn?: string;
  periodName: string;
  subjectName: string;
  subjectNameEn?: string;
  teacherName?: string;
  location?: string;
}

export interface ClassRoutineConfig {
  id: string;
  className: string;
  classNameEn?: string;
  routine: ClassRoutineItem[];
  createdAt: number;
  updatedAt: number;
}

const CLASS_ROUTINE_COLLECTION = "class_routine_configs";
const CLASS_ROUTINE_CACHE_KEY = "oasis_class_routine_configs_v1";

const toConfigId = (value: string) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[\/#?\[\]]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `class-routine-${Date.now()}`;
};

const normalizeRoutineItem = (item: Partial<ClassRoutineItem>, index: number): ClassRoutineItem => ({
  id: String(item.id || `routine-${index + 1}`),
  day: String(item.day || "Saturday"),
  dayBn: item.dayBn ? String(item.dayBn) : undefined,
  periodName: String(item.periodName || `Period ${index + 1}`),
  subjectName: String(item.subjectName || ""),
  subjectNameEn: item.subjectNameEn ? String(item.subjectNameEn) : undefined,
  teacherName: item.teacherName ? String(item.teacherName) : undefined,
  location: item.location ? String(item.location) : undefined,
});

const isPermissionError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeCode = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const maybeMessage = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";

  return maybeCode.includes("permission-denied") || maybeMessage.includes("Missing or insufficient permissions");
};

const readCache = (): ClassRoutineConfig[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CLASS_ROUTINE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<ClassRoutineConfig>>;

    return Array.isArray(parsed)
      ? parsed.map((item, index) => ({
          id: String(item.id || `cached-class-routine-${index + 1}`),
          className: String(item.className || ""),
          classNameEn: item.classNameEn ? String(item.classNameEn) : undefined,
          routine: Array.isArray(item.routine)
            ? item.routine
                .map((subject, subjectIndex) => normalizeRoutineItem(subject, subjectIndex))
                .filter((subject) => subject.subjectName.trim())
            : [],
          createdAt: Number(item.createdAt ?? Date.now()),
          updatedAt: Number(item.updatedAt ?? Date.now()),
        }))
      : [];
  } catch {
    return [];
  }
};

const writeCache = (items: ClassRoutineConfig[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLASS_ROUTINE_CACHE_KEY, JSON.stringify(items));
};

const toConfig = (snapshot: QueryDocumentSnapshot<DocumentData>): ClassRoutineConfig => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    className: String(data.className ?? ""),
    classNameEn: data.classNameEn ? String(data.classNameEn) : undefined,
    routine: Array.isArray(data.routine)
      ? data.routine
          .map((item: Partial<ClassRoutineItem>, index: number) => normalizeRoutineItem(item, index))
          .filter((item) => item.subjectName.trim())
      : [],
    createdAt: Number(data.createdAt ?? Date.now()),
    updatedAt: Number(data.updatedAt ?? Date.now()),
  };
};

export const listClassRoutineConfigs = async (): Promise<ClassRoutineConfig[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, CLASS_ROUTINE_COLLECTION), orderBy("className", "asc")));
    const items = snapshot.docs.map(toConfig);
    writeCache(items);
    return items;
  } catch {
    return readCache();
  }
};

export const saveClassRoutineConfig = async (
  payload: Omit<ClassRoutineConfig, "createdAt" | "updatedAt">,
): Promise<ClassRoutineConfig> => {
  const className = payload.className.trim();
  const configId = payload.id?.trim() || toConfigId(className);
  const now = Date.now();
  const routine = payload.routine
    .map((item, index) => normalizeRoutineItem(item, index))
    .filter((item) => item.subjectName.trim());

  const nextConfig: ClassRoutineConfig = {
    id: configId,
    className,
    classNameEn: payload.classNameEn?.trim() || undefined,
    routine,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(
      doc(db, CLASS_ROUTINE_COLLECTION, configId),
      {
        className: nextConfig.className,
        classNameEn: nextConfig.classNameEn || "",
        routine: nextConfig.routine,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  } catch (error) {
    if (!isPermissionError(error)) {
      throw error;
    }
  }

  const cachedItems = readCache();
  const nextItems = [...cachedItems.filter((item) => item.id !== nextConfig.id), nextConfig].sort((a, b) =>
    a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: "base" }),
  );
  writeCache(nextItems);

  return nextConfig;
};

export const deleteClassRoutineConfig = async (id: string) => {
  try {
    await deleteDoc(doc(db, CLASS_ROUTINE_COLLECTION, id.trim()));
  } catch (error) {
    if (!isPermissionError(error)) {
      throw error;
    }
  }

  writeCache(readCache().filter((item) => item.id !== id.trim()));
};
