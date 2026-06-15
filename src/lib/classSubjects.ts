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
import { logActivity } from "@/lib/adminDashboard";

export interface SubjectMarkComponents {
  writtenMarks: number;
  oralMarks: number;
  practicalMarks: number;
  assignmentMarks: number;
  attendanceMarks: number;
  testMarks: number;
  semesterMarks: number;
}

export const DEFAULT_MARK_COMPONENTS: SubjectMarkComponents = {
  writtenMarks: 50,
  oralMarks: 10,
  practicalMarks: 10,
  assignmentMarks: 10,
  attendanceMarks: 5,
  testMarks: 25,
  semesterMarks: 90,
};

export interface ClassSubjectItem {
  id: string;
  name: string;
  nameEn?: string;
  subjectCode?: string;
  category?: string;
  testMark: number;
  semesterMark: number;
  markComponents?: SubjectMarkComponents;
  orderIndex: number;
}

export interface ClassSubjectConfig {
  id: string;
  className: string;
  classNameEn?: string;
  academicYear?: string;
  subjects: ClassSubjectItem[];
  session?: string;
  createdAt: number;
  updatedAt: number;
}

const CLASS_SUBJECTS_COLLECTION = "class_subject_configs";
const CLASS_SUBJECTS_CACHE_KEY = "oasis_class_subject_configs_v2";

const toConfigId = (className: string, academicYear?: string) => {
  const base = String(className || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[\/?#\[\]]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const year = academicYear ? academicYear.trim().toLowerCase().replace(/\s+/g, "-") : "";
  return year ? `${base}--${year}` : base || `class-${Date.now()}`;
};

const normalizeMarkComponents = (input: Partial<SubjectMarkComponents> | undefined): SubjectMarkComponents => ({
  writtenMarks: Math.max(0, Number(input?.writtenMarks ?? DEFAULT_MARK_COMPONENTS.writtenMarks)),
  oralMarks: Math.max(0, Number(input?.oralMarks ?? DEFAULT_MARK_COMPONENTS.oralMarks)),
  practicalMarks: Math.max(0, Number(input?.practicalMarks ?? DEFAULT_MARK_COMPONENTS.practicalMarks)),
  assignmentMarks: Math.max(0, Number(input?.assignmentMarks ?? DEFAULT_MARK_COMPONENTS.assignmentMarks)),
  attendanceMarks: Math.max(0, Number(input?.attendanceMarks ?? DEFAULT_MARK_COMPONENTS.attendanceMarks)),
  testMarks: Math.max(0, Number(input?.testMarks ?? DEFAULT_MARK_COMPONENTS.testMarks)),
  semesterMarks: Math.max(0, Number(input?.semesterMarks ?? DEFAULT_MARK_COMPONENTS.semesterMarks)),
});

const normalizeSubject = (item: Partial<ClassSubjectItem>, index: number): ClassSubjectItem => ({
  id: String(item.id || `subject-${index + 1}`),
  name: String(item.name || ""),
  nameEn: item.nameEn ? String(item.nameEn) : undefined,
  subjectCode: item.subjectCode ? String(item.subjectCode) : undefined,
  category: item.category ? String(item.category) : undefined,
  testMark: Math.max(0, Number(item.testMark ?? 25)),
  semesterMark: Math.max(0, Number(item.semesterMark ?? 75)),
  markComponents: item.markComponents ? normalizeMarkComponents(item.markComponents) : undefined,
  orderIndex: typeof item.orderIndex === "number" ? item.orderIndex : index,
});

const isPermissionError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeCode = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const maybeMessage = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return maybeCode.includes("permission-denied") || maybeMessage.includes("Missing or insufficient permissions");
};

const readCache = (): ClassSubjectConfig[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CLASS_SUBJECTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<ClassSubjectConfig>>;
    return Array.isArray(parsed)
      ? parsed.map((item, index) => ({
          id: String(item.id || `cached-class-${index + 1}`),
          className: String(item.className || ""),
          classNameEn: item.classNameEn ? String(item.classNameEn) : undefined,
          academicYear: item.academicYear ? String(item.academicYear) : undefined,
          session: item.session ? String(item.session) : undefined,
          subjects: Array.isArray(item.subjects)
            ? item.subjects.map((subject, subjectIndex) => normalizeSubject(subject, subjectIndex)).filter((subject) => subject.name.trim())
            : [],
          createdAt: Number(item.createdAt ?? Date.now()),
          updatedAt: Number(item.updatedAt ?? Date.now()),
        }))
      : [];
  } catch {
    return [];
  }
};

const writeCache = (items: ClassSubjectConfig[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLASS_SUBJECTS_CACHE_KEY, JSON.stringify(items));
};

const toConfig = (snapshot: QueryDocumentSnapshot<DocumentData>): ClassSubjectConfig => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    className: String(data.className ?? ""),
    classNameEn: data.classNameEn ? String(data.classNameEn) : undefined,
    academicYear: data.academicYear ? String(data.academicYear) : undefined,
    session: data.session ? String(data.session) : undefined,
    subjects: Array.isArray(data.subjects)
      ? data.subjects.map((item: Partial<ClassSubjectItem>, index: number) => normalizeSubject(item, index)).filter((item) => item.name.trim())
      : [],
    createdAt: Number(data.createdAt ?? Date.now()),
    updatedAt: Number(data.updatedAt ?? Date.now()),
  };
};

export const listClassSubjectConfigs = async (): Promise<ClassSubjectConfig[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, CLASS_SUBJECTS_COLLECTION), orderBy("className", "asc")));
    const items = snapshot.docs.map(toConfig);
    writeCache(items);
    return items;
  } catch {
    return readCache();
  }
};

export const getConfigByClassAndYear = async (className: string, academicYear?: string): Promise<ClassSubjectConfig | null> => {
  const configs = await listClassSubjectConfigs();
  return configs.find(
    (c) => c.className.toLowerCase() === className.toLowerCase() && (academicYear ? c.academicYear === academicYear : true),
  ) || null;
};

export const saveClassSubjectConfig = async (
  payload: Omit<ClassSubjectConfig, "createdAt" | "updatedAt">,
): Promise<ClassSubjectConfig> => {
  const className = payload.className.trim();
  const academicYear = payload.academicYear?.trim();
  const configId = payload.id?.trim() || toConfigId(className, academicYear);
  const now = Date.now();
  const subjects = payload.subjects
    .map((item, index) => normalizeSubject(item, index))
    .filter((item) => item.name.trim());

  const nextConfig: ClassSubjectConfig = {
    id: configId,
    className,
    classNameEn: payload.classNameEn?.trim() || undefined,
    academicYear: academicYear || undefined,
    session: payload.session?.trim() || undefined,
    subjects,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(
      doc(db, CLASS_SUBJECTS_COLLECTION, configId),
      {
        className: nextConfig.className,
        classNameEn: nextConfig.classNameEn || "",
        academicYear: nextConfig.academicYear || "",
        session: nextConfig.session || "",
        subjects: nextConfig.subjects,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }

  const cachedItems = readCache();
  const nextItems = [...cachedItems.filter((item) => item.id !== nextConfig.id), nextConfig].sort((a, b) =>
    a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: "base" }),
  );
  writeCache(nextItems);

  logActivity({
    title: "Class subject config saved",
    detail: `${nextConfig.className}${academicYear ? ` (${academicYear})` : ""}`,
    module: "class-subjects",
  });

  return nextConfig;
};

export const deleteClassSubjectConfig = async (id: string) => {
  try {
    await deleteDoc(doc(db, CLASS_SUBJECTS_COLLECTION, id.trim()));
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }
  writeCache(readCache().filter((item) => item.id !== id.trim()));
  logActivity({
    title: "Class subject config deleted",
    detail: id,
    module: "class-subjects",
  });
};

export const calculateFullMarks = (components: SubjectMarkComponents): number => {
  return components.writtenMarks + components.oralMarks + components.practicalMarks + components.assignmentMarks + components.attendanceMarks;
};

export const getSubjectFullMarks = (subject: ClassSubjectItem): number => {
  if (subject.markComponents) {
    return calculateFullMarks(subject.markComponents);
  }
  return subject.testMark + subject.semesterMark;
};

export const validateMarkComponents = (components: SubjectMarkComponents, expectedFullMarks?: number): { valid: boolean; total: number; message?: string } => {
  const total = calculateFullMarks(components);
  if (typeof expectedFullMarks === "number" && total !== expectedFullMarks) {
    return { valid: false, total, message: `Total marks ${total} does not match expected ${expectedFullMarks}` };
  }
  return { valid: true, total };
};
