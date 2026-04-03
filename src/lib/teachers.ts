import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { uploadImage } from "./upload";

export interface Teacher {
  id?: string;
  name: string;
  nameEn: string;
  designation: string;
  designationEn: string;
  campus: "boys" | "girls";
  imageUrl?: string;
  createdAt: number;
}

const TEACHERS_COLLECTION = "teachers";

export const addTeacher = async (teacher: Omit<Teacher, "id" | "createdAt">): Promise<Teacher> => {
  const docRef = await addDoc(collection(db, TEACHERS_COLLECTION), {
    ...teacher,
    createdAt: Date.now(),
  });
  return { ...teacher, id: docRef.id, createdAt: Date.now() };
};

export const getTeachers = async (): Promise<Teacher[]> => {
  const q = query(collection(db, TEACHERS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Teacher[];
};

export const deleteTeacher = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, TEACHERS_COLLECTION, id));
};

export const uploadTeacherImage = async (file: File): Promise<string> => {
  return uploadImage(file);
};
