import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore";

export interface AdmissionForm {
  id?: string;
  studentName: string;
  studentNameBn: string;
  birthDate: string;
  gender: string;
  religion: string;
  fatherName: string;
  fatherNameBn: string;
  fatherPhone: string;
  motherName: string;
  motherNameBn: string;
  motherPhone: string;
  presentAddress: string;
  presentAddressBn: string;
  permanentAddress: string;
  permanentAddressBn: string;
  class: string;
  campus: string;
  residencyType?: "residential" | "non-residential" | "day-care" | "";
  interviewReferences?: Array<{
    name: string;
    relation: string;
    mobile: string;
  }>;
  imageUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

const ADMISSIONS_COLLECTION = "admissions";

export const submitAdmission = async (form: Omit<AdmissionForm, "id" | "status" | "createdAt">): Promise<AdmissionForm> => {
  const docRef = await addDoc(collection(db, ADMISSIONS_COLLECTION), {
    ...form,
    status: "pending",
    createdAt: Date.now(),
  });
  return { ...form, id: docRef.id, status: "pending", createdAt: Date.now() };
};

export const getAdmissions = async (): Promise<AdmissionForm[]> => {
  const q = query(collection(db, ADMISSIONS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AdmissionForm[];
};

export const updateAdmissionStatus = async (id: string, status: "approved" | "rejected"): Promise<void> => {
  await doc(db, ADMISSIONS_COLLECTION, id);
};

export const deleteAdmission = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, ADMISSIONS_COLLECTION, id));
};
