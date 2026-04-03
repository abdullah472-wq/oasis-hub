import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { uploadDocument } from "./upload";

export interface Notice {
  id?: string;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  pdfUrl?: string;
  createdAt: number;
}

const NOTICES_COLLECTION = "notices";

export const saveNotice = async (notice: Omit<Notice, "id" | "createdAt">): Promise<Notice> => {
  const docRef = await addDoc(collection(db, NOTICES_COLLECTION), {
    ...notice,
    createdAt: Date.now(),
  });
  return { ...notice, id: docRef.id, createdAt: Date.now() };
};

export const getNotices = async (): Promise<Notice[]> => {
  const q = query(collection(db, NOTICES_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Notice[];
};

export const deleteNotice = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, NOTICES_COLLECTION, id));
};

export const uploadPdf = async (file: File): Promise<string> => {
  return uploadDocument(file);
};
