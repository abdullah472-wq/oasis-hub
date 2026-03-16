import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

export interface Event {
  id?: string;
  titleBn: string;
  titleEn: string;
  startDate: string;
  endDate?: string;
  type: "exam" | "holiday" | "event" | "other";
  descriptionBn?: string;
  descriptionEn?: string;
  createdAt: number;
}

const EVENTS_COLLECTION = "events";

export const saveEvent = async (event: Omit<Event, "id" | "createdAt">): Promise<Event> => {
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
    ...event,
    createdAt: Date.now(),
  });
  return { ...event, id: docRef.id, createdAt: Date.now() };
};

export const getEvents = async (): Promise<Event[]> => {
  const q = query(collection(db, EVENTS_COLLECTION), orderBy("startDate", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
};

export const deleteEvent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, EVENTS_COLLECTION, id));
};
