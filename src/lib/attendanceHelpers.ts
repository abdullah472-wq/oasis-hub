import type { StudentRecord } from "@/lib/students";
import type { AttendanceRecord, AttendanceSheetRowInput, AttendanceStatus } from "@/lib/attendanceService";

export interface AttendanceMonthlySummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  attendancePercent: number;
}

export interface AttendanceSheetSummary extends AttendanceMonthlySummary {
  totalStudents: number;
}

export const attendanceStatusOptions: Array<{
  value: AttendanceStatus;
  labelBn: string;
  labelEn: string;
  tone: string;
}> = [
  { value: "present", labelBn: "উপস্থিত", labelEn: "Present", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "absent", labelBn: "অনুপস্থিত", labelEn: "Absent", tone: "border-rose-200 bg-rose-50 text-rose-700" },
  { value: "late", labelBn: "বিলম্ব", labelEn: "Late", tone: "border-amber-200 bg-amber-50 text-amber-700" },
  { value: "leave", labelBn: "ছুটি", labelEn: "Leave", tone: "border-sky-200 bg-sky-50 text-sky-700" },
];

export const createAttendanceRow = (
  student: StudentRecord,
  date: string,
  record?: AttendanceRecord,
): AttendanceSheetRowInput => ({
  recordId: record?.id,
  studentId: student.studentId,
  guardianUid: student.guardianUid,
  studentName: student.studentName,
  className: student.className,
  section: student.section,
  roll: student.roll,
  date,
  status: record?.status ?? "present",
  remark: record?.remark ?? "",
  createdAt: record?.createdAt,
});

export const buildAttendanceSheetRows = ({
  students,
  records,
  date,
  className,
  section,
}: {
  students: StudentRecord[];
  records: AttendanceRecord[];
  date: string;
  className?: string;
  section?: string;
}) => {
  const recordsByStudent = new Map(records.filter((item) => item.date === date).map((item) => [item.studentId, item] as const));

  return students
    .filter((student) => {
      if (className && className !== "all" && student.className !== className) return false;
      if (section && section !== "all" && student.section !== section) return false;
      return true;
    })
    .map((student) => createAttendanceRow(student, date, recordsByStudent.get(student.studentId)));
};

export const calculateAttendanceMonthlySummary = (records: AttendanceRecord[]): AttendanceMonthlySummary => {
  const summary = records.reduce(
    (acc, item) => {
      acc.totalDays += 1;
      if (item.status === "present") acc.presentDays += 1;
      if (item.status === "absent") acc.absentDays += 1;
      if (item.status === "late") acc.lateDays += 1;
      if (item.status === "leave") acc.leaveDays += 1;
      return acc;
    },
    {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leaveDays: 0,
      attendancePercent: 0,
    } satisfies AttendanceMonthlySummary,
  );

  const attendedDays = summary.presentDays + summary.lateDays + summary.leaveDays;

  return {
    ...summary,
    attendancePercent: summary.totalDays === 0 ? 0 : Math.round((attendedDays / summary.totalDays) * 100),
  };
};

export const calculateAttendanceSheetSummary = (rows: AttendanceSheetRowInput[]): AttendanceSheetSummary => {
  const monthly = calculateAttendanceMonthlySummary(
    rows.map((item) => ({
      id: item.recordId ?? `${item.studentId}-${item.date}`,
      studentId: item.studentId,
      guardianUid: item.guardianUid,
      studentName: item.studentName,
      className: item.className,
      section: item.section,
      roll: item.roll,
      date: item.date,
      month: item.date.slice(0, 7),
      status: item.status,
      remark: item.remark,
      markedBy: "",
      createdAt: item.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    })),
  );

  return {
    ...monthly,
    totalStudents: rows.length,
  };
};

export const buildClassOptions = (students: StudentRecord[]) => Array.from(new Set(students.map((item) => item.className).filter(Boolean))).sort((a, b) => a.localeCompare(b));

export const buildSectionOptions = (students: StudentRecord[], className: string) =>
  Array.from(
    new Set(
      students
        .filter((item) => !className || className === "all" || item.className === className)
        .map((item) => item.section)
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

export const getRecentAttendanceFromRecords = (records: AttendanceRecord[], limit = 7) =>
  [...records].sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt).slice(0, limit);
