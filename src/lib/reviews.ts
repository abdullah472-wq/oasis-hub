import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where, updateDoc } from "firebase/firestore";

export interface Review {
  id?: string;
  name: string;
  relation: string;
  review: string;
  reviewEn?: string;
  approved: boolean;
  createdAt: number;
}

const REVIEWS_COLLECTION = "reviews";

export const submitReview = async (review: Omit<Review, "id" | "approved" | "createdAt">): Promise<Review> => {
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...review,
    approved: false,
    createdAt: Date.now(),
  });
  return { ...review, id: docRef.id, approved: false, createdAt: Date.now() };
};

export const getApprovedReviews = async (): Promise<Review[]> => {
  const q = query(collection(db, REVIEWS_COLLECTION), where("approved", "==", true), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Review[];
};

export const getAllReviews = async (): Promise<Review[]> => {
  const q = query(collection(db, REVIEWS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Review[];
};

export const approveReview = async (id: string): Promise<void> => {
  await updateDoc(doc(db, REVIEWS_COLLECTION, id), { approved: true });
};

export const deleteReview = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, REVIEWS_COLLECTION, id));
};
