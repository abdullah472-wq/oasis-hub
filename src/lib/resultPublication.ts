import { collection, doc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { createClientId } from "./uuid";

export type PublishStatus = "draft" | "review" | "published";

export interface Publication {
  id: string;
  examName: string;
  className: string;
  section: string;
  campus: string;
  status: PublishStatus;
  publishedAt: number | null;
  publishedBy: string;
  resultCount: number;
  studentIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ResultActivityLog {
  id: string;
  action: "marks-entry" | "marks-update" | "result-publish" | "result-delete" | "result-download";
  examName: string;
  className: string;
  studentName: string;
  userId: string;
  userName: string;
  ipAddress: string;
  details: string;
  createdAt: number;
}

const PUBLICATIONS_COLLECTION = "result_publications";
const ACTIVITY_LOGS_COLLECTION = "result_activity_logs";

export const savePublication = async (pub: Omit<Publication, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Publication> => {
  const id = pub.id || createClientId();
  const now = Date.now();
  const next: Publication = { ...pub, id, createdAt: now, updatedAt: now } as Publication;
  await setDoc(doc(db, PUBLICATIONS_COLLECTION, id), next);
  return next;
};

export const updatePublicationStatus = async (id: string, status: PublishStatus, publishedBy: string): Promise<void> => {
  const now = Date.now();
  const patch: Partial<Publication> = { status, updatedAt: now, publishedBy };
  if (status === "published") patch.publishedAt = now;
  await updateDoc(doc(db, PUBLICATIONS_COLLECTION, id), patch);
};

export const listPublications = async (): Promise<Publication[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, PUBLICATIONS_COLLECTION), orderBy("createdAt", "desc")));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Publication));
  } catch {
    return [];
  }
};

export const logResultActivity = async (log: Omit<ResultActivityLog, "id" | "createdAt">): Promise<void> => {
  const id = createClientId();
  const entry: ResultActivityLog = { ...log, id, createdAt: Date.now() };
  try {
    await setDoc(doc(db, ACTIVITY_LOGS_COLLECTION, id), entry);
  } catch {
    /* silent */
  }
};

export const getResultActivityLogs = async (examName?: string): Promise<ResultActivityLog[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, ACTIVITY_LOGS_COLLECTION), orderBy("createdAt", "desc")));
    let logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ResultActivityLog));
    if (examName) logs = logs.filter((l) => l.examName === examName);
    return logs.slice(0, 100);
  } catch {
    return [];
  }
};

export const PUBLISH_STATUS_OPTIONS: { key: PublishStatus; labelBn: string; labelEn: string; color: string }[] = [
  { key: "draft", labelBn: "খসড়া", labelEn: "Draft", color: "text-gray-600 bg-gray-100" },
  { key: "review", labelBn: "পর্যালোচনা", labelEn: "Review", color: "text-amber-600 bg-amber-100" },
  { key: "published", labelBn: "প্রকাশিত", labelEn: "Published", color: "text-emerald-600 bg-emerald-100" },
];
