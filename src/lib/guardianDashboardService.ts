import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import type { Event } from "@/lib/events";
import { getEvents } from "@/lib/events";
import { db } from "@/lib/firebase";
import { getNotices, type Notice } from "@/lib/notices";
import { listGuardianFeeEntries, type FeeEntry } from "@/lib/feeEntries";
import { calculateFeeSummary, type FeeSummary } from "@/lib/feeHelpers";
import { listGuardianAttendanceRecords, type AttendanceRecord } from "@/lib/attendanceService";
import { calculateAttendanceMonthlySummary, getRecentAttendanceFromRecords, type AttendanceMonthlySummary } from "@/lib/attendanceHelpers";
import { getResults, type Result } from "@/lib/results";
import { listGuardianRequestsByGuardian } from "@/lib/guardianRequests";
import type { GuardianRequest } from "@/lib/adminDashboard";

const GUARDIANS_COLLECTION = "guardians";

export interface GuardianProfile {
  uid: string;
  fullName: string;
  phone: string;
  email: string;
  relationship: string;
  address?: string;
  nid?: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  roll: number;
  status: "pending" | "active" | "inactive";
  createdAt?: unknown;
}

export interface GuardianDashboardData {
  guardianProfile: GuardianProfile;
  notices: Notice[];
  todaysNotice: Notice | null;
  feeEntries: FeeEntry[];
  feeSummary: FeeSummary;
  currentMonthFees: FeeEntry[];
  attendanceRecords: AttendanceRecord[];
  attendanceSummary: AttendanceMonthlySummary;
  recentAttendance: AttendanceRecord[];
  todayAttendance: AttendanceRecord | null;
  results: Result[];
  upcomingExam: Event | null;
  requests: GuardianRequest[];
}

const toGuardianProfile = (uid: string, data: Record<string, unknown>): GuardianProfile => ({
  uid,
  fullName: String(data.fullName ?? ""),
  phone: String(data.phone ?? ""),
  email: String(data.email ?? ""),
  relationship: String(data.relationship ?? "Guardian"),
  address: data.address ? String(data.address) : undefined,
  nid: data.nid ? String(data.nid) : undefined,
  studentId: String(data.studentId ?? ""),
  studentName: String(data.studentName ?? ""),
  className: String(data.className ?? ""),
  section: String(data.section ?? ""),
  roll: Number(data.roll ?? 0),
  status: (data.status as GuardianProfile["status"]) ?? "pending",
  createdAt: data.createdAt,
});

const matchesGuardianResult = (result: Result, profile: GuardianProfile) => {
  const resultWithStudent = result as Result & { studentId?: string; section?: string };

  if (resultWithStudent.studentId) {
    return resultWithStudent.studentId === profile.studentId;
  }

  if (result.className !== profile.className) return false;
  if (resultWithStudent.section && resultWithStudent.section !== profile.section) return false;
  return true;
};

const matchesGuardianExam = (event: Event, profile: GuardianProfile) => {
  const eventWithClass = event as Event & { className?: string; section?: string };
  if (event.type !== "exam") return false;
  if (event.startDate < new Date().toISOString().slice(0, 10)) return false;
  if (eventWithClass.className && eventWithClass.className !== profile.className) return false;
  if (eventWithClass.section && eventWithClass.section !== profile.section) return false;
  return true;
};

export const getGuardianProfile = async (uid: string): Promise<GuardianProfile | null> => {
  const snapshot = await getDoc(doc(db, GUARDIANS_COLLECTION, uid));
  if (snapshot.exists()) {
    return toGuardianProfile(snapshot.id, snapshot.data());
  }

  const fallback = await getDocs(query(collection(db, GUARDIANS_COLLECTION), where("uid", "==", uid)));
  const first = fallback.docs[0];
  return first ? toGuardianProfile(first.id, first.data()) : null;
};

export const getGuardianDashboardData = async (uid: string): Promise<GuardianDashboardData | null> => {
  const guardianProfile = await getGuardianProfile(uid);
  if (!guardianProfile) return null;

  const [notices, feeEntries, attendanceRecords, results, events, requests] = await Promise.all([
    getNotices().catch(() => []),
    listGuardianFeeEntries(uid).catch(() => []),
    listGuardianAttendanceRecords(uid).catch(() => []),
    getResults().catch(() => []),
    getEvents().catch(() => []),
    listGuardianRequestsByGuardian(uid).catch(() => []),
  ]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthFees = feeEntries.filter((item) => item.billingMonth === currentMonth);
  const feeSummary = calculateFeeSummary(feeEntries, currentMonth);
  const currentMonthAttendance = attendanceRecords.filter(
    (item) => item.studentId === guardianProfile.studentId && item.month === currentMonth,
  );
  const attendanceSummary = calculateAttendanceMonthlySummary(currentMonthAttendance);
  const studentAttendanceRecords = attendanceRecords.filter((item) => item.studentId === guardianProfile.studentId);
  const recentAttendance = getRecentAttendanceFromRecords(studentAttendanceRecords, 7);
  const todayAttendance = studentAttendanceRecords.find((item) => item.date === new Date().toISOString().slice(0, 10)) ?? null;
  const filteredResults = results.filter((item) => matchesGuardianResult(item, guardianProfile)).sort((a, b) => b.createdAt - a.createdAt);
  const upcomingExam = events.filter((item) => matchesGuardianExam(item, guardianProfile)).sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;
  const sortedNotices = [...notices].sort((a, b) => b.createdAt - a.createdAt);
  const todaysNotice = sortedNotices[0] ?? null;

  return {
    guardianProfile,
    notices: sortedNotices,
    todaysNotice,
    feeEntries,
    feeSummary,
    currentMonthFees,
    attendanceRecords: studentAttendanceRecords,
    attendanceSummary,
    recentAttendance,
    todayAttendance,
    results: filteredResults,
    upcomingExam,
    requests,
  };
};
