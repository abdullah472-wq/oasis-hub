import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { GuardianRequest } from "@/lib/adminDashboard";

const GUARDIAN_REQUESTS_COLLECTION = "guardian_requests";

const toMillis = (value: unknown) => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return Date.now();
};

const toGuardianRequest = (snapshot: QueryDocumentSnapshot<DocumentData>): GuardianRequest => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    guardianUid: data.guardianUid ? String(data.guardianUid) : undefined,
    studentId: data.studentId ? String(data.studentId) : undefined,
    guardianName: String(data.guardianName ?? ""),
    studentName: String(data.studentName ?? ""),
    topic: String(data.topic ?? ""),
    message: String(data.message ?? ""),
    status: (data.status as GuardianRequest["status"]) ?? "pending",
    createdAt: toMillis(data.createdAt),
  };
};

export interface CreateGuardianRequestInput {
  guardianUid: string;
  studentId: string;
  guardianName: string;
  studentName: string;
  topic: string;
  message: string;
}

export interface CreateGuardianRequestByAdminInput {
  guardianUid?: string;
  studentId?: string;
  guardianName: string;
  studentName: string;
  topic: string;
  message: string;
  status?: GuardianRequest["status"];
}

export const listGuardianRequests = async (): Promise<GuardianRequest[]> => {
  const snapshot = await getDocs(query(collection(db, GUARDIAN_REQUESTS_COLLECTION), orderBy("createdAt", "desc")));
  return snapshot.docs.map(toGuardianRequest);
};

export const subscribeGuardianRequests = (callback: (items: GuardianRequest[]) => void) =>
  onSnapshot(
    query(collection(db, GUARDIAN_REQUESTS_COLLECTION), orderBy("createdAt", "desc")),
    (snapshot) => {
      callback(snapshot.docs.map(toGuardianRequest));
    },
  );

export const listGuardianRequestsByGuardian = async (guardianUid: string): Promise<GuardianRequest[]> => {
  const snapshot = await getDocs(
    query(collection(db, GUARDIAN_REQUESTS_COLLECTION), where("guardianUid", "==", guardianUid)),
  );
  return snapshot.docs.map(toGuardianRequest).sort((a, b) => b.createdAt - a.createdAt);
};

export const subscribeGuardianRequestsByGuardian = (
  guardianUid: string,
  callback: (items: GuardianRequest[]) => void,
) =>
  onSnapshot(
    query(collection(db, GUARDIAN_REQUESTS_COLLECTION), where("guardianUid", "==", guardianUid)),
    (snapshot) => {
      const items = snapshot.docs.map(toGuardianRequest).sort((a, b) => b.createdAt - a.createdAt);
      callback(items);
    },
  );

export const createGuardianRequest = async (
  payload: CreateGuardianRequestInput,
): Promise<GuardianRequest> => {
  const request = {
    guardianUid: payload.guardianUid,
    studentId: payload.studentId,
    guardianName: payload.guardianName.trim(),
    studentName: payload.studentName.trim(),
    topic: payload.topic.trim(),
    message: payload.message.trim(),
    status: "pending" as GuardianRequest["status"],
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, GUARDIAN_REQUESTS_COLLECTION), request);

  return {
    id: ref.id,
    ...request,
    createdAt: Date.now(),
  };
};

export const createGuardianRequestByAdmin = async (
  payload: CreateGuardianRequestByAdminInput,
): Promise<GuardianRequest> => {
  const request = {
    guardianUid: payload.guardianUid?.trim() || null,
    studentId: payload.studentId?.trim() || null,
    guardianName: payload.guardianName.trim(),
    studentName: payload.studentName.trim(),
    topic: payload.topic.trim(),
    message: payload.message.trim(),
    status: payload.status ?? ("pending" as GuardianRequest["status"]),
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, GUARDIAN_REQUESTS_COLLECTION), request);

  return {
    id: ref.id,
    guardianUid: request.guardianUid ?? undefined,
    studentId: request.studentId ?? undefined,
    guardianName: request.guardianName,
    studentName: request.studentName,
    topic: request.topic,
    message: request.message,
    status: request.status,
    createdAt: Date.now(),
  };
};

export const updateGuardianRequest = async (
  id: string,
  payload: Pick<GuardianRequest, "topic" | "message" | "status">,
) => {
  await updateDoc(doc(db, GUARDIAN_REQUESTS_COLLECTION, id), {
    topic: payload.topic.trim(),
    message: payload.message.trim(),
    status: payload.status,
  });
};

export const deleteGuardianRequest = async (id: string) => {
  await deleteDoc(doc(db, GUARDIAN_REQUESTS_COLLECTION, id));
};
