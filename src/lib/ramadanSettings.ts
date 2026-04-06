import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface RamadanSettings {
  isPublic: boolean;
  updatedAt: number;
}

const SETTINGS_DOC = doc(db, "site_settings", "ramadan");

const defaultSettings = (): RamadanSettings => ({
  isPublic: true,
  updatedAt: Date.now(),
});

export const getRamadanSettings = async (): Promise<RamadanSettings> => {
  const snapshot = await getDoc(SETTINGS_DOC);
  if (!snapshot.exists()) {
    const initial = defaultSettings();
    await setDoc(SETTINGS_DOC, initial, { merge: true });
    return initial;
  }

  const data = snapshot.data() as Partial<RamadanSettings>;
  return {
    isPublic: data.isPublic ?? true,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : Date.now(),
  };
};

export const saveRamadanSettings = async (settings: Pick<RamadanSettings, "isPublic">): Promise<RamadanSettings> => {
  const next = {
    isPublic: settings.isPublic,
    updatedAt: Date.now(),
  };
  await setDoc(SETTINGS_DOC, next, { merge: true });
  return next;
};
