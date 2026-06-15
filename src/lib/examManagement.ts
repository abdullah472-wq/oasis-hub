import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export type ExamStatus = "draft" | "ongoing" | "completed" | "published";
export type ExamType =
  | "monthly"
  | "1st-samoyik"
  | "2nd-samoyik"
  | "half-yearly"
  | "annual"
  | "hifz-assessment"
  | "nazera-assessment"
  | "qirat-assessment"
  | "custom";

export interface ExamMarksConfig {
  totalMarks: number;
  passMarks: number;
  subjectWeight: number;
  practicalWeight: number;
  oralWeight: number;
  writtenWeight: number;
}

export interface Exam {
  id?: string;
  name: string;
  nameEn: string;
  examType: ExamType;
  academicYear: string;
  session: string;
  className: string;
  section: string;
  examStartDate: string;
  examEndDate: string;
  resultPublishDate: string;
  status: ExamStatus;
  marksConfig?: ExamMarksConfig;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

const EXAMS_COLLECTION = "exams";

const cleanPayload = <T extends object>(payload: T): T =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as T;

const normalizeExam = (id: string, data: Partial<Exam>): Exam => ({
  id,
  name: String(data.name ?? ""),
  nameEn: String(data.nameEn ?? ""),
  examType: (data.examType as ExamType) || "custom",
  academicYear: String(data.academicYear ?? ""),
  session: String(data.session ?? ""),
  className: String(data.className ?? ""),
  section: String(data.section ?? ""),
  examStartDate: String(data.examStartDate ?? ""),
  examEndDate: String(data.examEndDate ?? ""),
  resultPublishDate: String(data.resultPublishDate ?? ""),
  status: (data.status as ExamStatus) || "draft",
  marksConfig: data.marksConfig,
  createdBy: String(data.createdBy ?? ""),
  createdAt: Number(data.createdAt ?? Date.now()),
  updatedAt: Number(data.updatedAt ?? Date.now()),
});

export const saveExam = async (exam: Omit<Exam, "id" | "createdAt" | "updatedAt">): Promise<Exam> => {
  const now = Date.now();
  const payload = { ...cleanPayload(exam), createdAt: now, updatedAt: now };
  const docRef = await addDoc(collection(db, EXAMS_COLLECTION), payload);
  return normalizeExam(docRef.id, payload);
};

export const updateExam = async (id: string, patch: Partial<Exam>): Promise<void> => {
  await updateDoc(doc(db, EXAMS_COLLECTION, id), { ...cleanPayload(patch), updatedAt: Date.now() });
};

export const getExams = async (): Promise<Exam[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, EXAMS_COLLECTION), orderBy("createdAt", "desc")));
    return snapshot.docs.map((d) => normalizeExam(d.id, d.data() as Partial<Exam>));
  } catch {
    return [];
  }
};

export const deleteExam = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, EXAMS_COLLECTION, id));
};

export const EXAM_TYPE_OPTIONS: { key: ExamType; labelBn: string; labelEn: string }[] = [
  { key: "monthly", labelBn: "মাসিক", labelEn: "Monthly" },
  { key: "1st-samoyik", labelBn: "১ম সাময়িক", labelEn: "1st Samoyik" },
  { key: "2nd-samoyik", labelBn: "২য় সাময়িক", labelEn: "2nd Samoyik" },
  { key: "half-yearly", labelBn: "অর্ধ-বার্ষিক", labelEn: "Half Yearly" },
  { key: "annual", labelBn: "বার্ষিক", labelEn: "Annual" },
  { key: "hifz-assessment", labelBn: "হিফজ মূল্যায়ন", labelEn: "Hifz Assessment" },
  { key: "nazera-assessment", labelBn: "নাজেরা মূল্যায়ন", labelEn: "Nazera Assessment" },
  { key: "qirat-assessment", labelBn: "কিরাত মূল্যায়ন", labelEn: "Qirat Assessment" },
  { key: "custom", labelBn: "কাস্টম", labelEn: "Custom" },
];

export const EXAM_STATUS_OPTIONS: { key: ExamStatus; labelBn: string; labelEn: string; color: string }[] = [
  { key: "draft", labelBn: "খসড়া", labelEn: "Draft", color: "bg-gray-100 text-gray-700" },
  { key: "ongoing", labelBn: "চলমান", labelEn: "Ongoing", color: "bg-blue-100 text-blue-700" },
  { key: "completed", labelBn: "সমাপ্ত", labelEn: "Completed", color: "bg-green-100 text-green-700" },
  { key: "published", labelBn: "প্রকাশিত", labelEn: "Published", color: "bg-emerald-100 text-emerald-700" },
];
