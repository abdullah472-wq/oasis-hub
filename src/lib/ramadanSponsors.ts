import { db } from "./firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";

export type RamadanSponsorStatus = "pending" | "approved" | "rejected";

export interface RamadanSponsor {
  id?: string;
  name: string;
  phone: string;
  day: number;
  percentage: number;
  amount: number;
  comment?: string;
  studentId?: string;
  status: RamadanSponsorStatus;
  adminNote?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RamadanSponsorUpdateInput {
  name: string;
  phone: string;
  day: number;
  percentage: number;
  amount: number;
  comment?: string;
  studentId?: string;
  status: RamadanSponsorStatus;
  adminNote?: string;
}

const SPONSORS_COLLECTION = "ramadan_sponsors";

const normalizeSponsor = (input: Partial<RamadanSponsor> & { id?: string }): RamadanSponsor => ({
  id: input.id,
  name: input.name || "",
  phone: input.phone || "",
  day: Number(input.day || 1),
  percentage: Number(input.percentage || 0),
  amount: Number(input.amount || 0),
  comment: input.comment || "",
  studentId: input.studentId || "",
  status: (input.status as RamadanSponsorStatus) || "approved",
  adminNote: input.adminNote || "",
  createdAt: Number(input.createdAt || Date.now()),
  updatedAt: Number(input.updatedAt || input.createdAt || Date.now()),
});

export const addRamadanSponsor = async (
  sponsor: Omit<RamadanSponsor, "id" | "createdAt" | "updatedAt" | "status" | "adminNote">,
): Promise<RamadanSponsor> => {
  const timestamp = Date.now();
  const payload = {
    ...sponsor,
    status: "pending" as RamadanSponsorStatus,
    adminNote: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, SPONSORS_COLLECTION), payload);
  return normalizeSponsor({ id: docRef.id, ...payload });
};

export const listRamadanSponsorRequests = async (): Promise<RamadanSponsor[]> => {
  const q = query(collection(db, SPONSORS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => normalizeSponsor({ id: item.id, ...(item.data() as Partial<RamadanSponsor>) }));
};

export const getRamadanSponsors = async (): Promise<RamadanSponsor[]> => {
  const allSponsors = await listRamadanSponsorRequests();
  return allSponsors.filter((item) => item.status === "approved");
};

export const updateRamadanSponsor = async (id: string, payload: RamadanSponsorUpdateInput) => {
  const nextPayload = {
    ...payload,
    comment: payload.comment || "",
    studentId: payload.studentId || "",
    adminNote: payload.adminNote || "",
    updatedAt: Date.now(),
  };
  await updateDoc(doc(db, SPONSORS_COLLECTION, id), nextPayload);
  return normalizeSponsor({ id, ...nextPayload });
};

export const deleteRamadanSponsor = async (id: string) => {
  await deleteDoc(doc(db, SPONSORS_COLLECTION, id));
};
