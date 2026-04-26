import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface RamadanSettings {
  isPublic: boolean;
  updatedAt: number;
}

const SETTINGS_DOC = doc(db, "site_settings", "ramadan");
const RAMADAN_SETTINGS_CACHE_KEY = "oasis_ramadan_settings_v1";

const defaultSettings = (): RamadanSettings => ({
  isPublic: true,
  updatedAt: Date.now(),
});

const normalizeRamadanSettings = (data?: Partial<RamadanSettings>): RamadanSettings => ({
  isPublic: data?.isPublic ?? true,
  updatedAt: typeof data?.updatedAt === "number" ? data.updatedAt : Date.now(),
});

const readRamadanSettingsCache = (): RamadanSettings | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(RAMADAN_SETTINGS_CACHE_KEY);
    if (!raw) return null;
    return normalizeRamadanSettings(JSON.parse(raw) as Partial<RamadanSettings>);
  } catch {
    return null;
  }
};

const writeRamadanSettingsCache = (settings: RamadanSettings) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RAMADAN_SETTINGS_CACHE_KEY, JSON.stringify(settings));
};

const dispatchRamadanSettingsUpdated = (settings: RamadanSettings) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ramadan-settings-updated", { detail: settings }));
};

export const getRamadanSettings = async (): Promise<RamadanSettings> => {
  try {
    const snapshot = await getDoc(SETTINGS_DOC);
    if (!snapshot.exists()) {
      const initial = defaultSettings();
      writeRamadanSettingsCache(initial);

      try {
        await setDoc(SETTINGS_DOC, initial, { merge: true });
      } catch {
        // Public visitors may not have write access to seed defaults.
      }

      return initial;
    }

    const settings = normalizeRamadanSettings(snapshot.data() as Partial<RamadanSettings>);
    writeRamadanSettingsCache(settings);
    return settings;
  } catch (error) {
    const cached = readRamadanSettingsCache();
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const saveRamadanSettings = async (settings: Pick<RamadanSettings, "isPublic">): Promise<RamadanSettings> => {
  const next = normalizeRamadanSettings({
    isPublic: settings.isPublic,
    updatedAt: Date.now(),
  });

  await setDoc(SETTINGS_DOC, next, { merge: true });
  writeRamadanSettingsCache(next);
  dispatchRamadanSettingsUpdated(next);
  return next;
};
