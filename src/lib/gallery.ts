import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

export interface GalleryImage {
  id?: string;
  src: string;
  titleBn: string;
  titleEn: string;
  category: string;
  createdAt: number;
}

const GALLERY_COLLECTION = "gallery";

export const saveGalleryImage = async (image: Omit<GalleryImage, "id" | "createdAt">): Promise<GalleryImage> => {
  const docRef = await addDoc(collection(db, GALLERY_COLLECTION), {
    ...image,
    createdAt: Date.now(),
  });
  return { ...image, id: docRef.id, createdAt: Date.now() };
};

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  const q = query(collection(db, GALLERY_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GalleryImage[];
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, GALLERY_COLLECTION, id));
};
