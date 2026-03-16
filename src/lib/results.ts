import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface Result {
  id?: string;
  exam: string;
  examEn: string;
  className: string;
  classNameEn: string;
  campus: "boys" | "girls" | "both";
  pdfUrl?: string;
  createdAt: number;
}

const RESULTS_COLLECTION = "results";

export const saveResult = async (result: Omit<Result, "id" | "createdAt">): Promise<Result> => {
  const docRef = await addDoc(collection(db, RESULTS_COLLECTION), {
    ...result,
    createdAt: Date.now(),
  });
  return { ...result, id: docRef.id, createdAt: Date.now() };
};

export const getResults = async (): Promise<Result[]> => {
  const q = query(collection(db, RESULTS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Result[];
};

export const deleteResult = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, RESULTS_COLLECTION, id));
};

export const uploadResultPdf = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `results/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
