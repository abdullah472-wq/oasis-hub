import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { calculateAttendanceMonthlySummary, getRecentAttendanceFromRecords, type AttendanceMonthlySummary } from "@/lib/attendanceHelpers";
import type { StudentRecord } from "@/lib/students";
import { db } from "@/lib/firebase";

export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  guardianUid: string;
  studentName: string;
  className: string;
  section: string;
  roll: number;
  date: string;
  month: string;
  status: AttendanceStatus;
  remark?: string;
  markedBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface AttendanceSheetRowInput extends Pick<StudentRecord, "studentId" | "guardianUid" | "studentName" | "className" | "section" | "roll"> {
  recordId?: string;
  date: string;
  status: AttendanceStatus;
  remark: string;
  createdAt?: number;
}

const ATTENDANCE_COLLECTION = "attendance_records";

const toMillis = (value: unknown) => {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return Date.now();
};

const toAttendanceRecord = (snapshot: QueryDocumentSnapshot<DocumentData>): AttendanceRecord => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    studentId: String(data.studentId ?? ""),
    guardianUid: String(data.guardianUid ?? ""),
    studentName: String(data.studentName ?? ""),
    className: String(data.className ?? ""),
    section: String(data.section ?? ""),
    roll: Number(data.roll ?? 0),
    date: String(data.date ?? ""),
    month: String(data.month ?? ""),
    status: (data.status as AttendanceStatus) ?? "present",
    remark: data.remark ? String(data.remark) : "",
    markedBy: String(data.markedBy ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
};

export const buildAttendanceRecordId = (studentId: string, date: string) => `${encodeURIComponent(studentId)}__${date}`;

export const listAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const snapshot = await getDocs(query(collection(db, ATTENDANCE_COLLECTION), orderBy("date", "desc")));
  return snapshot.docs.map(toAttendanceRecord);
};

export const listGuardianAttendanceRecords = async (guardianUid: string): Promise<AttendanceRecord[]> => {
  if (!guardianUid.trim()) return [];
  const snapshot = await getDocs(query(collection(db, ATTENDANCE_COLLECTION), where("guardianUid", "==", guardianUid.trim())));
  return snapshot.docs.map(toAttendanceRecord).sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt);
};

export const saveAttendanceSheet = async (rows: AttendanceSheetRowInput[], markedBy: string): Promise<AttendanceRecord[]> => {
  const batch = writeBatch(db);
  const savedAt = Date.now();

  const sanitizedRows = rows.map((row) => {
    const id = row.recordId || buildAttendanceRecordId(row.studentId, row.date);
    const docRef = doc(db, ATTENDANCE_COLLECTION, id);
    const payload = {
      studentId: row.studentId,
      guardianUid: row.guardianUid.trim(),
      studentName: row.studentName.trim(),
      className: row.className.trim(),
      section: row.section.trim(),
      roll: Number(row.roll || 0),
      date: row.date,
      month: row.date.slice(0, 7),
      status: row.status,
      remark: row.remark.trim(),
      markedBy,
      createdAt: row.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    batch.set(docRef, payload, { merge: true });

    return {
      id,
      studentId: payload.studentId,
      guardianUid: payload.guardianUid,
      studentName: payload.studentName,
      className: payload.className,
      section: payload.section,
      roll: payload.roll,
      date: payload.date,
      month: payload.month,
      status: payload.status,
      remark: payload.remark,
      markedBy: payload.markedBy,
      createdAt: row.createdAt ?? savedAt,
      updatedAt: savedAt,
    } satisfies AttendanceRecord;
  });

  await batch.commit();
  return sanitizedRows;
};

export const getMonthlySummary = async (studentId: string, month: string): Promise<AttendanceMonthlySummary> => {
  const snapshot = await getDocs(query(collection(db, ATTENDANCE_COLLECTION), where("studentId", "==", studentId)));
  const records = snapshot.docs.map(toAttendanceRecord).filter((item) => item.month === month);
  return calculateAttendanceMonthlySummary(records);
};

export const getRecentAttendance = async (studentId: string, limit = 7): Promise<AttendanceRecord[]> => {
  const snapshot = await getDocs(query(collection(db, ATTENDANCE_COLLECTION), where("studentId", "==", studentId)));
  return getRecentAttendanceFromRecords(snapshot.docs.map(toAttendanceRecord), limit);
};
