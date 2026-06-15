import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createClientId } from "@/lib/uuid";
import { logActivity } from "@/lib/adminDashboard";
import type { Subject, SubjectCategory } from "./subjects";

export interface SubjectGroup {
  id: string;
  nameBn: string;
  nameEn: string;
  description?: string;
  color?: string;
  categories: SubjectCategory[];
  orderIndex: number;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

const SUBJECT_GROUPS_COLLECTION = "subject_groups";
const SUBJECT_GROUPS_CACHE_KEY = "oasis_subject_groups_v1";

const normalizeGroup = (item: Partial<SubjectGroup>, index: number): SubjectGroup => ({
  id: String(item.id || createClientId()),
  nameBn: String(item.nameBn || ""),
  nameEn: String(item.nameEn || ""),
  description: item.description ? String(item.description) : undefined,
  color: item.color || "#10b981",
  categories: Array.isArray(item.categories) ? item.categories : [],
  orderIndex: typeof item.orderIndex === "number" ? item.orderIndex : index,
  tenantId: String(item.tenantId || "default"),
  createdAt: Number(item.createdAt || Date.now()),
  updatedAt: Number(item.updatedAt || Date.now()),
});

const isPermissionError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeCode = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const maybeMessage = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return maybeCode.includes("permission-denied") || maybeMessage.includes("Missing or insufficient permissions");
};

const readCache = (): SubjectGroup[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUBJECT_GROUPS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<SubjectGroup>>;
    return Array.isArray(parsed) ? parsed.map((item, index) => normalizeGroup(item, index)) : [];
  } catch {
    return [];
  }
};

const writeCache = (items: SubjectGroup[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUBJECT_GROUPS_CACHE_KEY, JSON.stringify(items));
};

const toGroup = (snapshot: QueryDocumentSnapshot<DocumentData>): SubjectGroup => {
  return normalizeGroup(snapshot.data() as Partial<SubjectGroup>, 0);
};

export const listSubjectGroups = async (tenantId = "default"): Promise<SubjectGroup[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, SUBJECT_GROUPS_COLLECTION), orderBy("orderIndex", "asc"), orderBy("nameBn", "asc")),
    );
    const items = snapshot.docs
      .map((doc) => normalizeGroup({ id: doc.id, ...doc.data() }, 0))
      .filter((group) => group.tenantId === tenantId);
    writeCache(items);
    return items;
  } catch {
    return readCache().filter((group) => group.tenantId === tenantId);
  }
};

export const saveSubjectGroup = async (payload: Omit<SubjectGroup, "createdAt" | "updatedAt"> & { id?: string }): Promise<SubjectGroup> => {
  const groupId = payload.id?.trim() || createClientId();
  const now = Date.now();
  const nextGroup = normalizeGroup({ ...payload, id: groupId, createdAt: now, updatedAt: now }, 0);

  try {
    await setDoc(
      doc(db, SUBJECT_GROUPS_COLLECTION, groupId),
      {
        nameBn: nextGroup.nameBn,
        nameEn: nextGroup.nameEn,
        description: nextGroup.description || "",
        color: nextGroup.color || "#10b981",
        categories: nextGroup.categories,
        orderIndex: nextGroup.orderIndex,
        tenantId: nextGroup.tenantId,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }

  const cachedItems = readCache();
  writeCache([...cachedItems.filter((item) => item.id !== groupId), nextGroup]);

  logActivity({
    title: payload.id ? "Subject group updated" : "Subject group created",
    detail: nextGroup.nameBn,
    module: "subject-groups",
  });

  return nextGroup;
};

export const deleteSubjectGroup = async (id: string, tenantId = "default"): Promise<void> => {
  try {
    await deleteDoc(doc(db, SUBJECT_GROUPS_COLLECTION, id));
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }

  const cachedItems = readCache().filter((item) => item.tenantId === tenantId);
  writeCache(cachedItems.filter((item) => item.id !== id));

  logActivity({
    title: "Subject group deleted",
    detail: id,
    module: "subject-groups",
  });
};
