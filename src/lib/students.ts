import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getAdmissions } from "@/lib/admission";
import { db } from "@/lib/firebase";

export interface StudentRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  roll: number;
  guardianUid: string;
  guardianName?: string;
  guardianPhone?: string;
  status: "active" | "inactive";
}

const STUDENTS_COLLECTION = "students";
const GUARDIANS_COLLECTION = "guardians";
const ATTENDANCE_COLLECTION = "attendance_records";
const USERS_COLLECTION = "users";
const STUDENT_LINKS_COLLECTION = "student_guardian_links";

const toStudentRecord = (snapshot: QueryDocumentSnapshot<DocumentData>): StudentRecord => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    studentId: String(data.studentId ?? snapshot.id),
    studentName: String(data.studentName ?? ""),
    className: String(data.className ?? ""),
    section: String(data.section ?? ""),
    roll: Number(data.roll ?? 0),
    guardianUid: String(data.guardianUid ?? ""),
    guardianName: data.guardianName ? String(data.guardianName) : undefined,
    guardianPhone: data.guardianPhone ? String(data.guardianPhone) : undefined,
    status: (data.status as StudentRecord["status"]) ?? "inactive",
  };
};

const sortStudents = (items: StudentRecord[]) =>
  [...items].sort(
    (a, b) =>
      a.className.localeCompare(b.className) ||
      a.section.localeCompare(b.section) ||
      a.studentId.localeCompare(b.studentId) ||
      a.studentName.localeCompare(b.studentName),
  );

const mergeStudentRecords = (items: StudentRecord[]) => {
  const map = new Map<string, StudentRecord>();

  items.forEach((item) => {
    const key = item.studentId || item.id;
    const current = map.get(key);

    if (!current) {
      map.set(key, item);
      return;
    }

    map.set(key, {
      ...current,
      ...item,
      guardianUid: item.guardianUid || current.guardianUid,
      guardianName: item.guardianName || current.guardianName,
      guardianPhone: item.guardianPhone || current.guardianPhone,
      section: item.section || current.section,
      roll: item.roll || current.roll,
      status: item.status === "active" || current.status === "active" ? "active" : "inactive",
    });
  });

  return sortStudents(Array.from(map.values()).filter((item) => item.status === "active"));
};

const buildFallbackStudents = async (): Promise<StudentRecord[]> => {
  const admissions = await getAdmissions().catch(() => []);

  return mergeStudentRecords(
    admissions
      .filter((item) => item.id && item.status !== "rejected")
      .map((item, index) => ({
        id: item.id!,
        studentId: item.id!,
        studentName: item.studentNameBn || item.studentName,
        className: item.class,
        section: "",
        roll: index + 1,
        guardianUid: "",
        status: "active" as const,
      })),
  );
};

const buildStudentsFromGuardians = async (): Promise<StudentRecord[]> => {
  const snapshot = await getDocs(collection(db, GUARDIANS_COLLECTION));

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      const status = String(data.status ?? "inactive");

      return {
        id: String(data.studentId ?? item.id),
        studentId: String(data.studentId ?? item.id),
        studentName: String(data.studentName ?? ""),
        className: String(data.className ?? ""),
        section: String(data.section ?? ""),
        roll: Number(data.roll ?? 0),
        guardianUid: String(data.uid ?? item.id),
        guardianName: String(data.fullName ?? ""),
        guardianPhone: data.phone ? String(data.phone) : undefined,
        status: status === "inactive" ? "inactive" : "active",
      } satisfies StudentRecord;
    })
    .filter((item) => item.studentId);
};

const buildStudentsFromAttendanceRecords = async (): Promise<StudentRecord[]> => {
  const snapshot = await getDocs(query(collection(db, ATTENDANCE_COLLECTION), orderBy("date", "desc")));
  const seen = new Set<string>();

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      const studentId = String(data.studentId ?? "").trim();

      if (!studentId || seen.has(studentId)) {
        return null;
      }

      seen.add(studentId);

      return {
        id: studentId,
        studentId,
        studentName: String(data.studentName ?? ""),
        className: String(data.className ?? ""),
        section: String(data.section ?? ""),
        roll: Number(data.roll ?? 0),
        guardianUid: String(data.guardianUid ?? "").trim(),
        status: "active",
      } satisfies StudentRecord;
    })
    .filter((item): item is StudentRecord => Boolean(item));
};

export const listStudents = async (): Promise<StudentRecord[]> => {
  const [snapshot, guardianStudents, attendanceStudents, fallbackStudents] = await Promise.all([
    getDocs(collection(db, STUDENTS_COLLECTION)).catch(() => ({ docs: [] } as Awaited<ReturnType<typeof getDocs>>)),
    buildStudentsFromGuardians().catch(() => []),
    buildStudentsFromAttendanceRecords().catch(() => []),
    buildFallbackStudents().catch(() => []),
  ]);

  const students = snapshot.docs.map(toStudentRecord).filter((item) => item.status === "active");

  return mergeStudentRecords([...students, ...guardianStudents, ...attendanceStudents, ...fallbackStudents]);
};

export const listStudentsByGuardian = async (guardianUid: string): Promise<StudentRecord[]> => {
  if (!guardianUid.trim()) return [];

  const snapshot = await getDocs(query(collection(db, STUDENTS_COLLECTION), where("guardianUid", "==", guardianUid.trim())));
  const students = sortStudents(snapshot.docs.map(toStudentRecord).filter((item) => item.status === "active"));

  if (students.length > 0) {
    return students;
  }

  const guardianDoc = await getDoc(doc(db, GUARDIANS_COLLECTION, guardianUid.trim())).catch(() => null);
  if (!guardianDoc?.exists()) return [];

  const data = guardianDoc.data();
  if (String(data.status ?? "inactive") !== "active") return [];

  return [
    {
      id: String(data.studentId ?? guardianUid),
      studentId: String(data.studentId ?? guardianUid),
      studentName: String(data.studentName ?? ""),
      className: String(data.className ?? ""),
      section: String(data.section ?? ""),
      roll: Number(data.roll ?? 0),
      guardianUid: guardianUid.trim(),
      guardianName: String(data.fullName ?? ""),
      guardianPhone: data.phone ? String(data.phone) : undefined,
      status: "active",
    },
  ];
};

export interface SyncStudentInput {
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  roll: number;
  guardianUid: string;
  guardianName?: string;
  guardianPhone?: string;
  status: "active" | "inactive";
}

export const syncStudentRecord = async (payload: SyncStudentInput) => {
  await setDoc(
    doc(db, STUDENTS_COLLECTION, payload.studentId.trim()),
    {
      studentId: payload.studentId.trim(),
      studentName: payload.studentName.trim(),
      className: payload.className.trim(),
      section: payload.section.trim(),
      roll: Number(payload.roll || 0),
      guardianUid: payload.guardianUid.trim(),
      guardianName: payload.guardianName?.trim() || "",
      guardianPhone: payload.guardianPhone?.trim() || "",
      status: payload.status,
    },
    { merge: true },
  );
};

export const deleteStudentRecord = async (studentId: string) => {
  await deleteDoc(doc(db, STUDENTS_COLLECTION, studentId.trim()));
};

export const deleteStudentGuardianLink = async (studentId: string) => {
  await deleteDoc(doc(db, STUDENT_LINKS_COLLECTION, studentId.trim()));
};

export const deleteGuardianProfileRecord = async (guardianUid: string) => {
  await deleteDoc(doc(db, GUARDIANS_COLLECTION, guardianUid.trim()));
};

export const deleteGuardianUserRecord = async (guardianUid: string) => {
  await deleteDoc(doc(db, USERS_COLLECTION, guardianUid.trim()));
};
