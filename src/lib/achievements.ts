import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export interface AchievementItem {
  id?: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  year: string;
  categoryBn?: string;
  categoryEn?: string;
  createdAt: number;
}

const ACHIEVEMENTS_COLLECTION = "achievements";

export const saveAchievement = async (
  payload: Omit<AchievementItem, "id" | "createdAt">,
): Promise<AchievementItem> => {
  const createdAt = Date.now();
  const docRef = await addDoc(collection(db, ACHIEVEMENTS_COLLECTION), {
    ...payload,
    createdAt,
  });

  return {
    ...payload,
    id: docRef.id,
    createdAt,
  };
};

export const getAchievements = async (): Promise<AchievementItem[]> => {
  const q = query(collection(db, ACHIEVEMENTS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as AchievementItem[];
};

export const deleteAchievement = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, ACHIEVEMENTS_COLLECTION, id));
};
