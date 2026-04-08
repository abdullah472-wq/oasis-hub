import { db } from "./firebase";
import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";

export interface Subscriber {
  id?: string;
  email: string;
  phone?: string;
  name?: string;
  createdAt: number;
}

const SUBSCRIBERS_COLLECTION = "subscribers";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizePhone = (phone?: string) => phone?.trim() || "";
const normalizeName = (name?: string) => name?.trim() || "";

export const subscribeToNews = async (subscriber: Omit<Subscriber, "id" | "createdAt">): Promise<Subscriber> => {
  const email = normalizeEmail(subscriber.email);
  const payload = {
    email,
    phone: normalizePhone(subscriber.phone),
    name: normalizeName(subscriber.name),
    createdAt: Date.now(),
  };

  try {
    const existing = await getDocs(query(collection(db, SUBSCRIBERS_COLLECTION), where("email", "==", email)));

    if (!existing.empty) {
      throw new Error("already-subscribed");
    }

    const docRef = await addDoc(collection(db, SUBSCRIBERS_COLLECTION), payload);
    return { ...payload, id: docRef.id };
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (code === "permission-denied") {
      throw new Error("permission-denied");
    }

    throw error;
  }
};

export const getSubscribers = async (): Promise<Subscriber[]> => {
  const snapshot = await getDocs(query(collection(db, SUBSCRIBERS_COLLECTION), orderBy("createdAt", "desc")));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Subscriber[];
};
