import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";

export type MobileNotificationAudience = "all" | "boys" | "girls" | "class-section" | "guardian";

export interface MobileAppNotification {
  id: string;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  audience: MobileNotificationAudience;
  guardianUid?: string;
  guardianName?: string;
  studentId?: string;
  className?: string;
  section?: string;
  createdAt: number;
  createdBy: string;
}

const MOBILE_NOTIFICATIONS_COLLECTION = "mobile_app_notifications";

const toMobileAppNotification = (
  item: { id: string; data: () => Record<string, unknown> },
): MobileAppNotification => {
  const data = item.data();

  return {
    id: item.id,
    titleBn: String(data.titleBn ?? ""),
    titleEn: String(data.titleEn ?? ""),
    messageBn: String(data.messageBn ?? ""),
    messageEn: String(data.messageEn ?? ""),
    audience: (data.audience as MobileNotificationAudience) ?? "all",
    guardianUid: data.guardianUid ? String(data.guardianUid) : undefined,
    guardianName: data.guardianName ? String(data.guardianName) : undefined,
    studentId: data.studentId ? String(data.studentId) : undefined,
    className: data.className ? String(data.className) : undefined,
    section: data.section ? String(data.section) : undefined,
    createdAt: Number(data.createdAt ?? 0),
    createdBy: String(data.createdBy ?? ""),
  };
};

const buildCampusFromProfile = (className: string, section: string) => {
  const source = `${className} ${section}`.toLowerCase();

  if (/(girls|girl|female|balika|বালিকা|ছাত্রী)/.test(source)) return "girls";
  if (/(boys|boy|male|balok|বালক|ছাত্র)/.test(source)) return "boys";
  return "unknown";
};

export const listMobileAppNotifications = async (): Promise<MobileAppNotification[]> => {
  const snapshot = await getDocs(
    query(collection(db, MOBILE_NOTIFICATIONS_COLLECTION), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map(toMobileAppNotification);
};

export const subscribeMobileAppNotifications = (
  callback: (items: MobileAppNotification[]) => void,
) =>
  onSnapshot(
    query(collection(db, MOBILE_NOTIFICATIONS_COLLECTION), orderBy("createdAt", "desc")),
    (snapshot) => {
      callback(snapshot.docs.map(toMobileAppNotification));
    },
  );

export const createMobileAppNotification = async (
  payload: Omit<MobileAppNotification, "id" | "createdAt">,
): Promise<MobileAppNotification> => {
  const createdAt = Date.now();
  const audience = payload.audience ?? "all";
  const guardianUid = audience === "guardian" ? payload.guardianUid?.trim() || "" : "";
  const guardianName = audience === "guardian" ? payload.guardianName?.trim() || "" : "";
  const studentId = audience === "guardian" ? payload.studentId?.trim() || "" : "";
  const className = audience === "class-section" ? payload.className?.trim() || "" : "";
  const section = audience === "class-section" ? payload.section?.trim() || "" : "";

  const docRef = await addDoc(collection(db, MOBILE_NOTIFICATIONS_COLLECTION), {
    titleBn: payload.titleBn.trim(),
    titleEn: payload.titleEn.trim(),
    messageBn: payload.messageBn.trim(),
    messageEn: payload.messageEn.trim(),
    audience,
    guardianUid,
    guardianName,
    studentId,
    className,
    section,
    createdAt,
    createdBy: payload.createdBy.trim(),
  });

  return {
    id: docRef.id,
    titleBn: payload.titleBn.trim(),
    titleEn: payload.titleEn.trim(),
    messageBn: payload.messageBn.trim(),
    messageEn: payload.messageEn.trim(),
    audience,
    guardianUid: guardianUid || undefined,
    guardianName: guardianName || undefined,
    studentId: studentId || undefined,
    className: className || undefined,
    section: section || undefined,
    createdAt,
    createdBy: payload.createdBy.trim(),
  };
};

export const deleteMobileAppNotification = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, MOBILE_NOTIFICATIONS_COLLECTION, id));
};

export const matchesMobileAppNotificationAudience = (
  item: MobileAppNotification,
  profile: { className: string; section: string; guardianUid?: string; studentId?: string },
) => {
  if (item.audience === "all") return true;

  if (item.audience === "guardian") {
    const notificationGuardianUid = item.guardianUid?.trim() || "";
    const notificationStudentId = item.studentId?.trim() || "";
    const profileGuardianUid = profile.guardianUid?.trim() || "";
    const profileStudentId = profile.studentId?.trim() || "";

    return Boolean(
      (notificationGuardianUid && notificationGuardianUid === profileGuardianUid) ||
      (notificationStudentId && notificationStudentId === profileStudentId),
    );
  }

  if (item.audience === "class-section") {
    const notificationClass = item.className?.trim().toLowerCase() || "";
    const notificationSection = item.section?.trim().toLowerCase() || "";
    const profileClass = profile.className.trim().toLowerCase();
    const profileSection = profile.section.trim().toLowerCase();
    const classMatched = !notificationClass || notificationClass === profileClass;
    const sectionMatched = !notificationSection || notificationSection === profileSection;
    return classMatched && sectionMatched;
  }

  const campus = buildCampusFromProfile(profile.className, profile.section);
  return campus === item.audience;
};
