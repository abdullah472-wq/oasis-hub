import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { uploadDocument } from "./upload";

export interface Notice {
  id?: string;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  pdfUrl?: string;
  createdAt: number;
}

const NOTICES_COLLECTION = "notices";
const NOTICE_CACHE_KEY = "oasis_public_notices_v1";

const readNoticeCache = (): Notice[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(NOTICE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Notice[];
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => b.createdAt - a.createdAt)
      : [];
  } catch {
    return [];
  }
};

const writeNoticeCache = (items: Notice[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    NOTICE_CACHE_KEY,
    JSON.stringify(items.slice().sort((a, b) => b.createdAt - a.createdAt)),
  );
};

export const saveNotice = async (notice: Omit<Notice, "id" | "createdAt">): Promise<Notice> => {
  const createdAt = Date.now();
  const docRef = await addDoc(collection(db, NOTICES_COLLECTION), {
    ...notice,
    createdAt,
  });
  const saved = { ...notice, id: docRef.id, createdAt };
  writeNoticeCache([saved, ...readNoticeCache()]);
  return saved;
};

export const getNotices = async (): Promise<Notice[]> => {
  try {
    const q = query(collection(db, NOTICES_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const notices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notice[];
    writeNoticeCache(notices);
    return notices;
  } catch (error) {
    const cached = readNoticeCache();
    if (cached.length > 0) {
      return cached;
    }
    throw error;
  }
};

export const deleteNotice = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, NOTICES_COLLECTION, id));
  writeNoticeCache(readNoticeCache().filter((item) => item.id !== id));
};

export const uploadPdf = async (file: File): Promise<string> => {
  return uploadDocument(file);
};
