import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";

export interface NewsPost {
  id?: string;
  titleBn: string;
  titleEn: string;
  excerptBn: string;
  excerptEn: string;
  date: string;
  imageUrl?: string;
  createdAt: number;
}

const NEWS_COLLECTION = "news";

export const saveNewsToFirestore = async (post: Omit<NewsPost, "id" | "createdAt">): Promise<NewsPost> => {
  const docRef = await addDoc(collection(db, NEWS_COLLECTION), {
    ...post,
    createdAt: Date.now(),
  });
  return { ...post, id: docRef.id, createdAt: Date.now() };
};

export const getNewsFromFirestore = async (): Promise<NewsPost[]> => {
  const q = query(collection(db, NEWS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as NewsPost[];
};

export const deleteNewsFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, NEWS_COLLECTION, id));
};

export const updateNewsInFirestore = async (
  id: string,
  payload: Partial<Omit<NewsPost, "id" | "createdAt">>,
): Promise<void> => {
  await updateDoc(doc(db, NEWS_COLLECTION, id), {
    ...payload,
    createdAt: Date.now(),
  });
};
