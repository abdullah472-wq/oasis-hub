import { db } from "./firebase";
import { supabase } from "./supabase/client";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";

export type AdmissionStatus = "pending" | "approved" | "rejected";

export interface AdmissionForm {
  id?: string;
  trackingId?: string;
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
  approvedStudentId?: string;
  approvedRoll?: number;
  approvedClass?: string;
  approvedSection?: string;
  approvedMonthlyFee?: number;
  adminNotes?: string;
  status: AdmissionStatus;
  createdAt: number;
}

const ADMISSIONS_COLLECTION = "admissions";
const ADMISSIONS_CACHE_KEY = "oasis_admissions_cache_v2";

export const defaultAdmissions: AdmissionForm[] = [
  {
    id: "adm-101",
    trackingId: "ANN-2026-1042",
    studentName: "Abdullah Al Mahi",
    studentNameBn: "আবদুল্লাহ আল মাহী",
    birthDate: "2017-04-12",
    gender: "male",
    religion: "Islam",
    fatherName: "Md. Rafiqul Islam",
    fatherNameBn: "মোঃ রফিকুল ইসলাম",
    fatherPhone: "01711223344",
    motherName: "Fatema Begum",
    motherNameBn: "ফাতেমা বেগম",
    motherPhone: "01911223344",
    presentAddress: "Kapasia Bazar, Gazipur",
    presentAddressBn: "কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর",
    permanentAddress: "Kapasia Bazar, Gazipur",
    permanentAddressBn: "কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর",
    class: "হিফজুল কুরআন",
    campus: "বালক শাখা (কাপাসিয়া বাজার)",
    residencyType: "residential",
    approvedStudentId: "STD-2026-089",
    approvedRoll: 12,
    approvedClass: "হিফজুল কুরআন",
    approvedSection: "আলিফ",
    approvedMonthlyFee: 6500,
    status: "approved",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "adm-102",
    trackingId: "ANN-2026-1085",
    studentName: "Khadija Akter",
    studentNameBn: "খাদিজা আক্তার",
    birthDate: "2019-08-20",
    gender: "female",
    religion: "Islam",
    fatherName: "Maulana Abdul Karim",
    fatherNameBn: "মাওলানা আব্দুল করিম",
    fatherPhone: "01819876543",
    motherName: "Ayesha Khatun",
    motherNameBn: "আয়েশা খাতুন",
    motherPhone: "01519876543",
    presentAddress: "College Road, Kapasia",
    presentAddressBn: "কলেজ রোড, বাঁশতলা, কাপাসিয়া",
    permanentAddress: "College Road, Kapasia",
    permanentAddressBn: "কলেজ রোড, বাঁশতলা, কাপাসিয়া",
    class: "নূরানী ১ম শ্রেণি",
    campus: "বালিকা শাখা (বাঁশতলা মোড়)",
    residencyType: "non-residential",
    status: "pending",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "adm-103",
    trackingId: "ANN-2026-1120",
    studentName: "Muhammad Tanvir Hasan",
    studentNameBn: "মুহাম্মদ তানভীর হাসান",
    birthDate: "2018-02-15",
    gender: "male",
    religion: "Islam",
    fatherName: "Engr. Mahmudul Hasan",
    fatherNameBn: "প্রকৌশলী মাহমুদুল হাসান",
    fatherPhone: "01723456789",
    motherName: "Salma Akter",
    motherNameBn: "সালমা আক্তার",
    motherPhone: "01323456789",
    presentAddress: "Thana Road, Kapasia",
    presentAddressBn: "থানা রোড, কাপাসিয়া, গাজীপুর",
    permanentAddress: "Thana Road, Kapasia",
    permanentAddressBn: "থানা রোড, কাপাসিয়া, গাজীপুর",
    class: "৩য় শ্রেণি",
    campus: "বালক শাখা (কাপাসিয়া বাজার)",
    residencyType: "day-care",
    status: "pending",
    createdAt: Date.now() - 3600000 * 5,
  },
];

const readAdmissionsCache = (): AdmissionForm[] => {
  if (typeof window === "undefined") {
    return defaultAdmissions;
  }
  try {
    const raw = window.localStorage.getItem(ADMISSIONS_CACHE_KEY);
    if (!raw) {
      writeAdmissionsCache(defaultAdmissions);
      return defaultAdmissions;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAdmissions;
  } catch {
    return defaultAdmissions;
  }
};

const writeAdmissionsCache = (items: AdmissionForm[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ADMISSIONS_CACHE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("oasis-admissions-updated", { detail: items }));
  } catch {
    // ignore
  }
};

export const submitAdmission = async (
  form: Omit<AdmissionForm, "id" | "status" | "createdAt">
): Promise<AdmissionForm> => {
  const generatedId = "adm-" + Date.now();
  const generatedTracking =
    form.trackingId || `ANN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newAdmission: AdmissionForm = {
    ...form,
    id: generatedId,
    trackingId: generatedTracking,
    status: "pending",
    createdAt: Date.now(),
  };

  try {
    if (db) {
      const docRef = await addDoc(collection(db, ADMISSIONS_COLLECTION), {
        ...newAdmission,
      });
      newAdmission.id = docRef.id;
    }
  } catch (error) {
    console.warn("Firestore submitAdmission fallback to cache:", error);
  }

  // Also try syncing to Supabase if table exists
  try {
    if (supabase) {
      await supabase.from("admissions").insert([
        {
          student_name: newAdmission.studentName,
          student_name_bn: newAdmission.studentNameBn,
          birth_date: newAdmission.birthDate,
          gender: newAdmission.gender,
          father_name: newAdmission.fatherName,
          father_phone: newAdmission.fatherPhone,
          mother_name: newAdmission.motherName,
          applied_class: newAdmission.class,
          campus: newAdmission.campus,
          residency_type: newAdmission.residencyType,
          status: newAdmission.status,
          tracking_id: newAdmission.trackingId,
        },
      ]);
    }
  } catch {
    // ignore
  }

  const cached = readAdmissionsCache();
  const updated = [newAdmission, ...cached.filter((item) => item.id !== newAdmission.id)];
  writeAdmissionsCache(updated);

  return newAdmission;
};

export const getAdmissions = async (): Promise<AdmissionForm[]> => {
  try {
    if (db) {
      const q = query(collection(db, ADMISSIONS_COLLECTION), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const items = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as AdmissionForm[];

        if (items.length > 0) {
          writeAdmissionsCache(items);
          return items;
        }
      }
    }
  } catch (error) {
    console.warn("Firestore getAdmissions fallback to cache:", error);
  }

  return readAdmissionsCache();
};

export const updateAdmission = async (
  id: string,
  updates: Partial<AdmissionForm>
): Promise<AdmissionForm> => {
  const cached = readAdmissionsCache();
  const existing = cached.find((item) => item.id === id);
  if (!existing) {
    throw new Error("Admission application not found");
  }

  const updatedRecord: AdmissionForm = {
    ...existing,
    ...updates,
  };

  try {
    if (db) {
      await updateDoc(doc(db, ADMISSIONS_COLLECTION, id), {
        ...updates,
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.warn("Firestore updateAdmission fallback to cache:", error);
  }

  const updatedList = cached.map((item) => (item.id === id ? updatedRecord : item));
  writeAdmissionsCache(updatedList);

  return updatedRecord;
};

export const updateAdmissionStatus = async (
  id: string,
  status: AdmissionStatus,
  updates?: Partial<
    Pick<
      AdmissionForm,
      "approvedStudentId" | "approvedRoll" | "approvedClass" | "approvedSection" | "approvedMonthlyFee"
    >
  >
): Promise<void> => {
  await updateAdmission(id, {
    status,
    ...(updates ?? {}),
  });
};

export const deleteAdmission = async (id: string): Promise<void> => {
  try {
    if (db) {
      await deleteDoc(doc(db, ADMISSIONS_COLLECTION, id));
    }
  } catch (error) {
    console.warn("Firestore deleteAdmission fallback to cache:", error);
  }

  const cached = readAdmissionsCache();
  const updated = cached.filter((item) => item.id !== id);
  writeAdmissionsCache(updated);
};
