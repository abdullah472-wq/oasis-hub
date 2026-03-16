import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

export interface VirtualTour {
  id?: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: number;
}

const VIRTUAL_TOURS_COLLECTION = "virtual_tours";

export const addVirtualTour = async (tour: Omit<VirtualTour, "id" | "createdAt">): Promise<VirtualTour> => {
  const docRef = await addDoc(collection(db, VIRTUAL_TOURS_COLLECTION), {
    ...tour,
    createdAt: Date.now(),
  });
  return { ...tour, id: docRef.id, createdAt: Date.now() };
};

export const getVirtualTours = async (): Promise<VirtualTour[]> => {
  const q = query(collection(db, VIRTUAL_TOURS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as VirtualTour[];
};

export const deleteVirtualTour = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, VIRTUAL_TOURS_COLLECTION, id));
};
