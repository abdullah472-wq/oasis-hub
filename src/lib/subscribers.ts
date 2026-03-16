import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export interface Subscriber {
  id?: string;
  email: string;
  phone?: string;
  name?: string;
  createdAt: number;
}

const SUBSCRIBERS_COLLECTION = "subscribers";

export const subscribeToNews = async (subscriber: Omit<Subscriber, "id" | "createdAt">): Promise<Subscriber> => {
  const q = query(collection(db, SUBSCRIBERS_COLLECTION), where("email", "==", subscriber.email));
  const existing = await getDocs(q);
  
  if (!existing.empty) {
    throw new Error("Already subscribed");
  }
  
  const docRef = await addDoc(collection(db, SUBSCRIBERS_COLLECTION), {
    ...subscriber,
    createdAt: Date.now(),
  });
  return { ...subscriber, id: docRef.id, createdAt: Date.now() };
};

export const getSubscribers = async (): Promise<Subscriber[]> => {
  const snapshot = await getDocs(collection(db, SUBSCRIBERS_COLLECTION));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Subscriber[];
};
