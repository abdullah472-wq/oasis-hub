import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";

export interface NewsPost {
  id?: string;
  titleBn: string;
  titleEn: string;
  excerptBn: string;
  excerptEn: string;
  date: string;
  imageUrl?: string;
  category?: string;
  embedCode?: string;
  createdAt: number;
}

const NEWS_COLLECTION = "news";
const NEWS_CACHE_KEY = "oasis_news_cache_v2";

export const defaultNewsPosts: NewsPost[] = [
  {
    id: "news-1",
    titleBn: "২০২৬ শিক্ষাবর্ষে নূরানী, নাজেরা ও হিফজ শাখায় ভর্তি কার্যক্রম চলছে",
    titleEn: "Admission open for Nurani, Nazara and Hifz sections for 2026 academic year",
    excerptBn: "আননূর শিক্ষা পরিবারের উভয় ক্যাম্পাসে নতুন শিক্ষাবর্ষে সীমিত আসনে ছাত্র-ছাত্রী ভর্তি কার্যক্রম চলছে। আধুনিক প্রযুক্তিনির্ভর দ্বীনি ও সাধারণ শিক্ষার সমন্বয়ে পরিচালিত এই প্রতিষ্ঠানে আপনার সন্তানকে ভর্তি করাতে যোগাযোগ করুন।",
    excerptEn: "Admission is open for limited seats in both campuses of Annoor Education Family. Contact our admission office for modern Islamic and general integrated schooling.",
    date: "2026-01-05",
    imageUrl: "/hero-campus.jpg",
    category: "ভর্তি",
    createdAt: Date.now() - 300000,
  },
  {
    id: "news-2",
    titleBn: "জাতীয় হিফজুল কুরআন প্রতিযোগিতায় আননূরের শিক্ষার্থীদের গৌরবোজ্জ্বল সাফল্য",
    titleEn: "Annoor students achieve outstanding success in National Hifzul Quran Competition",
    excerptBn: "রাজধানীতে আয়োজিত জাতীয় হিফজুল কুরআন প্রতিযোগিতায় আমাদের মাদরাসার ৩ জন শিক্ষার্থী সেরা দশের মধ্যে স্থান অর্জন করে সনদ ও ক্রেস্ট লাভ করেছে। সকল শিক্ষক ও অভিভাবকদের আন্তরিক মোবারকবাদ।",
    excerptEn: "Three students from our madrasa secured positions in the top 10 at the National Hifzul Quran Competition held in the capital, receiving certificates and crests.",
    date: "2026-02-12",
    imageUrl: "/hero-campus.jpg",
    category: "সাফল্য",
    createdAt: Date.now() - 200000,
  },
  {
    id: "news-3",
    titleBn: "পবিত্র মাহে রমজানের বিশেষ হিফজ রিভিশন ও তারাবীহ প্রশিক্ষণ কোর্স শুরু",
    titleEn: "Special Ramadan Hifz Revision & Tarawih Training Course Launched",
    excerptBn: "পবিত্র রমজানুল মুবারক উপলক্ষে অত্র মাদরাসায় হাফেজ শিক্ষার্থীদের জন্য ৩০ পারা কুরআন রিভিশন ও খতমে তারাবীহ তেলাওয়াতের বিশেষ প্রশিক্ষণ কর্মশালা শুরু হয়েছে।",
    excerptEn: "A dedicated 30-para Quran revision and Khatm-e-Tarawih recitation preparation workshop has been launched for our Hifz students during holy Ramadan.",
    date: "2026-02-28",
    imageUrl: "/hero-campus.jpg",
    category: "একাডেমিক",
    createdAt: Date.now() - 100000,
  },
];

const readNewsCache = (): NewsPost[] => {
  if (typeof window === "undefined") {
    return defaultNewsPosts;
  }
  try {
    const raw = window.localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) {
      writeNewsCache(defaultNewsPosts);
      return defaultNewsPosts;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultNewsPosts;
  } catch {
    return defaultNewsPosts;
  }
};

const writeNewsCache = (items: NewsPost[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("oasis-news-updated", { detail: items }));
  } catch {
    // ignore
  }
};

export const saveNewsToFirestore = async (
  post: Omit<NewsPost, "id" | "createdAt">
): Promise<NewsPost> => {
  const newPost: NewsPost = {
    ...post,
    id: `news-${Date.now()}`,
    createdAt: Date.now(),
  };

  try {
    if (db) {
      const docRef = await addDoc(collection(db, NEWS_COLLECTION), {
        ...post,
        createdAt: newPost.createdAt,
      });
      newPost.id = docRef.id;
    }
  } catch (error) {
    console.warn("Firestore save news fallback to local cache:", error);
  }

  // Update local cache and broadcast
  const cached = readNewsCache();
  const updated = [newPost, ...cached.filter((item) => item.id !== newPost.id)];
  writeNewsCache(updated);

  return newPost;
};

export const getNewsFromFirestore = async (): Promise<NewsPost[]> => {
  try {
    if (db) {
      const q = query(collection(db, NEWS_COLLECTION), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const items = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as NewsPost[];

        if (items.length > 0) {
          writeNewsCache(items);
          return items;
        }
      }
    }
  } catch (error) {
    console.warn("Firestore get news failed, using cache:", error);
  }

  return readNewsCache();
};

export const deleteNewsFromFirestore = async (id: string): Promise<void> => {
  try {
    if (db) {
      await deleteDoc(doc(db, NEWS_COLLECTION, id));
    }
  } catch (error) {
    console.warn("Firestore delete news fallback to local cache:", error);
  }

  const cached = readNewsCache();
  const updated = cached.filter((item) => item.id !== id);
  writeNewsCache(updated);
};

export const updateNewsInFirestore = async (
  id: string,
  payload: Partial<Omit<NewsPost, "id" | "createdAt">>
): Promise<void> => {
  try {
    if (db) {
      await updateDoc(doc(db, NEWS_COLLECTION, id), {
        ...payload,
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.warn("Firestore update news fallback to local cache:", error);
  }

  const cached = readNewsCache();
  const updated = cached.map((item) =>
    item.id === id ? { ...item, ...payload, updatedAt: Date.now() } : item
  );
  writeNewsCache(updated);
};
