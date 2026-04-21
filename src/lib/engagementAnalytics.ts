import { collection, doc, getDocs, increment, query, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface DailyEngagement {
  dateKey: string;
  websiteVisitors: number;
  appOpens: number;
}

const ANALYTICS_COLLECTION = "analytics_daily";
const DEFAULT_TIMEZONE = "Asia/Dhaka";

const getDateKey = (date = new Date(), timeZone = DEFAULT_TIMEZONE) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const getDocRefForToday = () => doc(db, ANALYTICS_COLLECTION, getDateKey());

export const getTodayDateKey = () => getDateKey();

export const trackWebsiteDailyVisitor = async () => {
  const dateKey = getTodayDateKey();
  await setDoc(
    getDocRefForToday(),
    {
      dateKey,
      websiteVisitors: increment(1),
      updatedAt: Date.now(),
    },
    { merge: true },
  );
};

export const trackAppDailyOpen = async () => {
  const dateKey = getTodayDateKey();
  await setDoc(
    getDocRefForToday(),
    {
      dateKey,
      appOpens: increment(1),
      updatedAt: Date.now(),
    },
    { merge: true },
  );
};

export const listDailyEngagement = async (): Promise<DailyEngagement[]> => {
  const snapshot = await getDocs(query(collection(db, ANALYTICS_COLLECTION)));

  return snapshot.docs
    .map((item) => {
      const data = item.data() as Partial<DailyEngagement>;
      return {
        dateKey: String(data.dateKey ?? item.id),
        websiteVisitors: Number(data.websiteVisitors ?? 0),
        appOpens: Number(data.appOpens ?? 0),
      };
    })
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
};
