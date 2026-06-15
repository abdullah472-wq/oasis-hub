import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface GradeBand {
  minPercent: number;
  maxPercent: number;
  grade: string;
  gpa: number;
  point: number;
}

export interface GradingSystem {
  id: string;
  name: string;
  nameEn: string;
  isDefault: boolean;
  bands: GradeBand[];
  createdAt: number;
  updatedAt: number;
}

const COLLECTION = "grading_systems";
const CACHE_KEY = "oasis_grading_systems_v1";

const DEFAULT_SYSTEM: GradingSystem = {
  id: "default",
  name: "ডিফল্ট গ্রেডিং সিস্টেম",
  nameEn: "Default Grading System",
  isDefault: true,
  bands: [
    { minPercent: 80, maxPercent: 100, grade: "A+", gpa: 5, point: 5 },
    { minPercent: 70, maxPercent: 79, grade: "A", gpa: 4, point: 4 },
    { minPercent: 60, maxPercent: 69, grade: "A-", gpa: 3.5, point: 3.5 },
    { minPercent: 50, maxPercent: 59, grade: "B", gpa: 3, point: 3 },
    { minPercent: 40, maxPercent: 49, grade: "C", gpa: 2, point: 2 },
    { minPercent: 33, maxPercent: 39, grade: "D", gpa: 1, point: 1 },
    { minPercent: 0, maxPercent: 32, grade: "F", gpa: 0, point: 0 },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const readCache = (): GradingSystem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [DEFAULT_SYSTEM];
  } catch {
    return [DEFAULT_SYSTEM];
  }
};

const writeCache = (items: GradingSystem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(items));
};

export const listGradingSystems = async (): Promise<GradingSystem[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "asc")));
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GradingSystem));
    writeCache(items);
    return items.length > 0 ? items : [DEFAULT_SYSTEM];
  } catch {
    return readCache();
  }
};

export const saveGradingSystem = async (system: Omit<GradingSystem, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<GradingSystem> => {
  const id = system.id || `grade-${Date.now()}`;
  const now = Date.now();
  const next: GradingSystem = { ...system, id, createdAt: now, updatedAt: now } as GradingSystem;

  try {
    await setDoc(doc(db, COLLECTION, id), next);
  } catch {
    /* offline fallback */
  }

  const cached = readCache().filter((g) => g.id !== id);
  writeCache([...cached, next]);
  return next;
};

export const deleteGradingSystem = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch {
    /* offline fallback */
  }
  writeCache(readCache().filter((g) => g.id !== id));
};

export const getGradeFromPercentage = (percentage: number, systems: GradingSystem[]): { grade: string; gpa: number } => {
  const system = systems.find((s) => s.isDefault) || systems[0] || DEFAULT_SYSTEM;
  const band = [...system.bands]
    .sort((a, b) => b.minPercent - a.minPercent)
    .find((b) => percentage >= b.minPercent && percentage <= b.maxPercent);
  return band ? { grade: band.grade, gpa: band.gpa } : { grade: "F", gpa: 0 };
};

export const calculateResult = (
  subjects: { obtained: number; max: number }[],
  systems: GradingSystem[],
): { totalMarks: number; obtainedMarks: number; percentage: number; gpa: number; grade: string; hasFailed: boolean } => {
  const totalMarks = subjects.reduce((s, subj) => s + subj.max, 0);
  const obtainedMarks = subjects.reduce((s, subj) => s + subj.obtained, 0);
  const hasFailed = subjects.some((subj) => subj.max > 0 && (subj.obtained / subj.max) * 100 < 33);
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const { grade, gpa } = hasFailed ? { grade: "F", gpa: 0 } : getGradeFromPercentage(percentage, systems);
  return { totalMarks, obtainedMarks, percentage, gpa, grade, hasFailed };
};

export { DEFAULT_SYSTEM };
