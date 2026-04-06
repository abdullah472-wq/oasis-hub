import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { RunningNoticeItem } from "./adminDashboard";

export interface RunningNoticeSettings {
  runningNoticeEnabled: boolean;
  runningNotices: RunningNoticeItem[];
  updatedAt: number;
}

const SETTINGS_DOC = doc(db, "site_settings", "running_notice_bar");

const createDefaultRunningNotices = (): RunningNoticeItem[] => [
  {
    id: crypto.randomUUID(),
    textBn: "ভর্তি চলছে ২০২৬ শিক্ষাবর্ষের জন্য। বিস্তারিত জানতে অফিসে যোগাযোগ করুন।",
    textEn: "Admissions are now open for the 2026 academic year. Contact the office for details.",
    link: "/admission",
    publishDate: new Date().toISOString().slice(0, 10),
    priority: 1,
    active: true,
  },
];

const normalizeRunningNoticeSettings = (
  data?: Partial<RunningNoticeSettings>,
): RunningNoticeSettings => {
  const items = (data?.runningNotices?.length ? data.runningNotices : createDefaultRunningNotices()).map(
    (item, index) => ({
      id: item.id || crypto.randomUUID(),
      textBn: item.textBn || "",
      textEn: item.textEn || "",
      link: item.link || "",
      publishDate: item.publishDate || new Date().toISOString().slice(0, 10),
      priority: typeof item.priority === "number" ? item.priority : index + 1,
      active: item.active ?? true,
    }),
  );

  return {
    runningNoticeEnabled: data?.runningNoticeEnabled ?? true,
    runningNotices: items,
    updatedAt: typeof data?.updatedAt === "number" ? data.updatedAt : Date.now(),
  };
};

export const getRunningNoticeSettings = async (): Promise<RunningNoticeSettings> => {
  const snapshot = await getDoc(SETTINGS_DOC);

  if (!snapshot.exists()) {
    const initial = normalizeRunningNoticeSettings();
    await setDoc(SETTINGS_DOC, initial, { merge: true });
    return initial;
  }

  return normalizeRunningNoticeSettings(snapshot.data() as Partial<RunningNoticeSettings>);
};

export const saveRunningNoticeSettings = async (
  settings: Pick<RunningNoticeSettings, "runningNoticeEnabled" | "runningNotices">,
): Promise<RunningNoticeSettings> => {
  const next = normalizeRunningNoticeSettings({
    runningNoticeEnabled: settings.runningNoticeEnabled,
    runningNotices: settings.runningNotices,
    updatedAt: Date.now(),
  });

  await setDoc(SETTINGS_DOC, next, { merge: true });
  return next;
};
