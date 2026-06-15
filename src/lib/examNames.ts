import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export interface ExamName {
  id?: string;
  nameBn: string;
  nameEn: string;
  createdAt: number;
}

const EXAM_NAMES_COLLECTION = "exam_names";

const cleanPayload = <T extends object>(payload: T): T =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as T;

const normalizeExamName = (id: string, data: Partial<ExamName>): ExamName => ({
  id,
  nameBn: String(data.nameBn ?? "").trim(),
  nameEn: String(data.nameEn ?? "").trim(),
  createdAt: Number(data.createdAt ?? Date.now()),
});

export const saveExamName = async (examName: Omit<ExamName, "id" | "createdAt">): Promise<ExamName> => {
  const cleanExamName = cleanPayload(examName);
  const createdAt = Date.now();

  try {
    const docRef = await addDoc(collection(db, EXAM_NAMES_COLLECTION), {
      ...cleanExamName,
      createdAt,
    });
    return normalizeExamName(docRef.id, { ...cleanExamName, createdAt });
  } catch (error) {
    console.error("Error saving exam name:", error);
    throw error;
  }
};

export const getExamNames = async (): Promise<ExamName[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, EXAM_NAMES_COLLECTION), orderBy("createdAt", "desc")),
    );
    return snapshot.docs.map((doc) =>
      normalizeExamName(doc.id, doc.data() as Partial<ExamName>),
    );
  } catch (error) {
    console.error("Error fetching exam names:", error);
    return [];
  }
};

export const deleteExamName = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EXAM_NAMES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting exam name:", error);
    throw error;
  }
};
