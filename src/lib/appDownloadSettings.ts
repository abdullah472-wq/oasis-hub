import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface AppDownloadSettings {
  enabled: boolean;
  apkUrl: string;
  version: string;
  releaseNotesBn: string;
  releaseNotesEn: string;
  fileName: string;
  fileSizeLabel: string;
  updatedAt: number;
}

const SETTINGS_DOC = doc(db, "site_settings", "app_download");
const APP_DOWNLOAD_CACHE_KEY = "oasis_app_download_settings_v1";

const normalizeAppDownloadSettings = (
  value?: Partial<AppDownloadSettings>,
): AppDownloadSettings => ({
  enabled: value?.enabled ?? false,
  apkUrl: value?.apkUrl?.trim() || "",
  version: value?.version?.trim() || "",
  releaseNotesBn: value?.releaseNotesBn?.trim() || "",
  releaseNotesEn: value?.releaseNotesEn?.trim() || "",
  fileName: value?.fileName?.trim() || "",
  fileSizeLabel: value?.fileSizeLabel?.trim() || "",
  updatedAt: Number(value?.updatedAt ?? 0),
});

const readCache = (): AppDownloadSettings | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(APP_DOWNLOAD_CACHE_KEY);
    if (!raw) return null;
    return normalizeAppDownloadSettings(JSON.parse(raw) as Partial<AppDownloadSettings>);
  } catch {
    return null;
  }
};

const writeCache = (value: AppDownloadSettings) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_DOWNLOAD_CACHE_KEY, JSON.stringify(value));
};

export const getAppDownloadSettings = async (): Promise<AppDownloadSettings> => {
  try {
    const snapshot = await getDoc(SETTINGS_DOC);
    if (snapshot.exists()) {
      const settings = normalizeAppDownloadSettings(snapshot.data() as Partial<AppDownloadSettings>);
      writeCache(settings);
      return settings;
    }
  } catch {
    const cached = readCache();
    if (cached) return cached;
  }

  return readCache() ?? normalizeAppDownloadSettings();
};

export const saveAppDownloadSettings = async (
  value: Omit<AppDownloadSettings, "updatedAt"> & { updatedAt?: number },
): Promise<AppDownloadSettings> => {
  const normalized = normalizeAppDownloadSettings({
    ...value,
    updatedAt: value.updatedAt ?? Date.now(),
  });

  await setDoc(SETTINGS_DOC, normalized, { merge: true });
  writeCache(normalized);
  return normalized;
};
