import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export interface RamadanSponsor {
  id?: string;
  name: string;
  phone: string;
  day: number;
  percentage: number;
  amount: number;
  comment?: string;
  studentId?: string;
  createdAt: number;
}

const SPONSORS_COLLECTION = "ramadan_sponsors";

export const addRamadanSponsor = async (sponsor: Omit<RamadanSponsor, "id" | "createdAt">): Promise<RamadanSponsor> => {
  const docRef = await addDoc(collection(db, SPONSORS_COLLECTION), {
    ...sponsor,
    createdAt: Date.now(),
  });
  return { ...sponsor, id: docRef.id, createdAt: Date.now() };
};

export const getRamadanSponsors = async (): Promise<RamadanSponsor[]> => {
  const q = query(collection(db, SPONSORS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RamadanSponsor[];
};
