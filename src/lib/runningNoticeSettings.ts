import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { RunningNoticeItem } from "./adminDashboard";
import { getSiteDateInputValue } from "./siteDate";
import { createClientId } from "./uuid";

export interface RunningNoticeSettings {
  runningNoticeEnabled: boolean;
  runningNotices: RunningNoticeItem[];
  updatedAt: number;
}

const SETTINGS_DOC = doc(db, "site_settings", "running_notice_bar");
const RAMADAN_SETTINGS_DOC = doc(db, "site_settings", "ramadan");
const LEGACY_SETTINGS_DOC = doc(db, "site_settings", "ramadan", "running_notice_bar", "running_notice_bar");
const RUNNING_NOTICE_CACHE_KEY = "oasis_running_notice_settings_v1";

const createDefaultRunningNotices = (): RunningNoticeItem[] => [
  {
    id: createClientId(),
    textBn: "ভর্তি চলছে ২০২৬ শিক্ষাবর্ষের জন্য। বিস্তারিত জানতে অফিসে যোগাযোগ করুন।",
    textEn: "Admissions are now open for the 2026 academic year. Contact the office for details.",
    link: "/admission",
    publishDate: getSiteDateInputValue(),
    priority: 1,
    active: true,
  },
];

const normalizeRunningNoticeSettings = (
  data?: Partial<RunningNoticeSettings>,
): RunningNoticeSettings => {
  const items = (data?.runningNotices?.length ? data.runningNotices : createDefaultRunningNotices()).map(
    (item, index) => ({
      id: item.id || createClientId(),
      textBn: item.textBn || "",
      textEn: item.textEn || "",
      link: item.link || "",
      publishDate: item.publishDate || getSiteDateInputValue(),
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

const readRunningNoticeCache = (): RunningNoticeSettings | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(RUNNING_NOTICE_CACHE_KEY);
    if (!raw) return null;
    return normalizeRunningNoticeSettings(JSON.parse(raw) as Partial<RunningNoticeSettings>);
  } catch {
    return null;
  }
};

const writeRunningNoticeCache = (settings: RunningNoticeSettings) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RUNNING_NOTICE_CACHE_KEY, JSON.stringify(settings));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractRunningNoticeSettings = (value: unknown): Partial<RunningNoticeSettings> | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  if ("runningNoticeEnabled" in value || "runningNotices" in value) {
    return value as Partial<RunningNoticeSettings>;
  }

  const nested = value.running_notice_bar;
  if (isRecord(nested) && ("runningNoticeEnabled" in nested || "runningNotices" in nested)) {
    return nested as Partial<RunningNoticeSettings>;
  }

  return undefined;
};

export const getRunningNoticeSettings = async (): Promise<RunningNoticeSettings> => {
  try {
    const [primarySnapshot, ramadanSnapshot, legacySnapshot] = await Promise.all([
      getDoc(SETTINGS_DOC),
      getDoc(RAMADAN_SETTINGS_DOC),
      getDoc(LEGACY_SETTINGS_DOC),
    ]);

    const primaryData = primarySnapshot.exists() ? extractRunningNoticeSettings(primarySnapshot.data()) : undefined;
    if (primaryData) {
      const settings = normalizeRunningNoticeSettings(primaryData);
      writeRunningNoticeCache(settings);
      return settings;
    }

    const ramadanData = ramadanSnapshot.exists() ? extractRunningNoticeSettings(ramadanSnapshot.data()) : undefined;
    if (ramadanData) {
      const settings = normalizeRunningNoticeSettings(ramadanData);
      writeRunningNoticeCache(settings);
      return settings;
    }

    const legacyData = legacySnapshot.exists() ? extractRunningNoticeSettings(legacySnapshot.data()) : undefined;
    if (legacyData) {
      const settings = normalizeRunningNoticeSettings(legacyData);
      writeRunningNoticeCache(settings);
      return settings;
    }
  } catch (error) {
    const cached = readRunningNoticeCache();
    if (cached) {
      return cached;
    }
    throw error;
  }

  return readRunningNoticeCache() ?? normalizeRunningNoticeSettings();
};

export const saveRunningNoticeSettings = async (
  settings: Pick<RunningNoticeSettings, "runningNoticeEnabled" | "runningNotices">,
): Promise<RunningNoticeSettings> => {
  const next = normalizeRunningNoticeSettings({
    runningNoticeEnabled: settings.runningNoticeEnabled,
    runningNotices: settings.runningNotices,
    updatedAt: Date.now(),
  });

  await Promise.all([
    setDoc(SETTINGS_DOC, next, { merge: true }),
    setDoc(
      RAMADAN_SETTINGS_DOC,
      {
        ...next,
        running_notice_bar: next,
      },
      { merge: true },
    ),
    setDoc(LEGACY_SETTINGS_DOC, next, { merge: true }),
  ]);
  writeRunningNoticeCache(next);
  return next;
};
