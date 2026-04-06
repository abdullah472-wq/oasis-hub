import { collection, getDocs, query, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
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
  status: "active" | "inactive";
}

const STUDENTS_COLLECTION = "students";

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
    status: (data.status as StudentRecord["status"]) ?? "inactive",
  };
};

const sortStudents = (items: StudentRecord[]) =>
  [...items].sort(
    (a, b) =>
      a.className.localeCompare(b.className) ||
      a.section.localeCompare(b.section) ||
      a.roll - b.roll ||
      a.studentName.localeCompare(b.studentName),
  );

const buildFallbackStudents = async (): Promise<StudentRecord[]> => {
  const admissions = await getAdmissions().catch(() => []);

  return sortStudents(
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

export const listStudents = async (): Promise<StudentRecord[]> => {
  const snapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
  const students = sortStudents(snapshot.docs.map(toStudentRecord).filter((item) => item.status === "active"));

  if (students.length > 0) {
    return students;
  }

  return buildFallbackStudents();
};

export const listStudentsByGuardian = async (guardianUid: string): Promise<StudentRecord[]> => {
  if (!guardianUid.trim()) return [];

  const snapshot = await getDocs(query(collection(db, STUDENTS_COLLECTION), where("guardianUid", "==", guardianUid.trim())));
  return sortStudents(snapshot.docs.map(toStudentRecord).filter((item) => item.status === "active"));
};
