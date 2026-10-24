import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { Achievement } from "@/types/cms";

export type { Achievement, Achievement as AchievementItem };

const ACHIEVEMENTS_CACHE_KEY = "oasis_achievements_cache_v1";

export const defaultAchievements: Achievement[] = [
  {
    id: "ach-1",
    title_bn: "বার্ষিক সেরা প্রতিষ্ঠান সম্মাননা",
    title_en: "Annual Best Institution Award",
    year: "2025",
    category_bn: "প্রাতিষ্ঠানিক স্বীকৃতি",
    description_bn: "শিক্ষার মান, শৃঙ্খলা ও ফলাফলের ধারাবাহিকতার জন্য স্থানীয় পর্যায়ে সম্মাননা লাভ।",
    description_en: "Recognized locally for academic standards, discipline, and consistent outcomes.",
    image_url: null,
    created_at: "2025-01-10T00:00:00.000Z",
  },
  {
    id: "ach-2",
    title_bn: "হিফজ ও কিরাআত সনদ",
    title_en: "Hifz & Qira'at Certification",
    year: "2024",
    category_bn: "ধর্মীয় শিক্ষা",
    description_bn: "হিফজ সমাপনকারী ও কিরাআতে দক্ষ শিক্ষার্থীদের জন্য সনদ প্রদান।",
    description_en: "Awarded to graduating Huffaz and students excelling in Quran recitation.",
    image_url: null,
    created_at: "2024-11-20T00:00:00.000Z",
  },
  {
    id: "ach-3",
    title_bn: "শিক্ষক প্রশিক্ষণ অংশগ্রহণ সনদ",
    title_en: "Teacher Training Excellence Sanad",
    year: "2024",
    category_bn: "শিক্ষক উন্নয়ন",
    description_bn: "আধুনিক পাঠদান পদ্ধতি ও তারবিয়াতভিত্তিক প্রশিক্ষণে অংশগ্রহণের স্বীকৃতি।",
    description_en: "Recognition for participating in modern pedagogy and Tarbiyyah training.",
    image_url: null,
    created_at: "2024-05-15T00:00:00.000Z",
  },
  {
    id: "ach-4",
    title_bn: "বিভিন্ন শিক্ষা ও সাংস্কৃতিক প্রতিযোগিতায় সাফল্য",
    title_en: "Inter-Madrasa Competition Trophies",
    year: "2023",
    category_bn: "শিক্ষার্থী অর্জন",
    description_bn: "শিক্ষার্থীরা তিলাওয়াত, হামদ-নাত, সাধারণ জ্ঞান ও একাডেমিক প্রতিযোগিতায় কৃতিত্ব অর্জন করেছে।",
    description_en: "Students earned top prizes in regional Tilawat, Hamd-Naat, and knowledge contests.",
    image_url: null,
    created_at: "2023-12-01T00:00:00.000Z",
  },
];

export const getCachedAchievements = (): Achievement[] => {
  if (typeof window === "undefined") return defaultAchievements;
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(ACHIEVEMENTS_CACHE_KEY, JSON.stringify(defaultAchievements));
      return defaultAchievements;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAchievements;
  } catch (err) {
    console.warn("Failed to read achievements from cache:", err);
    return defaultAchievements;
  }
};

export const saveAchievementsToCache = (items: Achievement[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACHIEVEMENTS_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to save achievements to cache:", err);
  }
};

export async function getAchievementsList(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("year", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: Achievement[] = data.map((item: any, idx: number) => ({
        id: item.id || `ach-${idx}`,
        title_bn: item.title_bn || "",
        title_en: item.title_en || null,
        year: String(item.year || "2025"),
        category_bn: item.category_bn || null,
        description_bn: item.description_bn || "",
        description_en: item.description_en || null,
        image_url: item.image_url || null,
        created_at: item.created_at || new Date().toISOString(),
      }));

      saveAchievementsToCache(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase fetch achievements warning, falling back to cache:", err);
  }

  return getCachedAchievements();
}

/**
 * Backwards compatibility helper for public Achievements page
 */
export async function getAchievements(): Promise<any[]> {
  const list = await getAchievementsList();
  return list.map((item) => ({
    ...item,
    titleBn: item.title_bn,
    titleEn: item.title_en || "",
    descriptionBn: item.description_bn,
    descriptionEn: item.description_en || "",
    categoryBn: item.category_bn || "",
  }));
}

export async function saveAchievement(
  item: Omit<Achievement, "id" | "created_at"> & { id?: string }
): Promise<Achievement> {
  const current = getCachedAchievements();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `ach-${Date.now()}`;

  const prepared: Achievement = {
    ...item,
    id: targetId,
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
  };

  // Try Supabase first
  try {
    const payload = {
      title_bn: prepared.title_bn,
      title_en: prepared.title_en || null,
      year: prepared.year,
      category_bn: prepared.category_bn || null,
      description_bn: prepared.description_bn,
      description_en: prepared.description_en || null,
      image_url: prepared.image_url || null,
    };

    if (isEditing) {
      const { error } = await supabase.from("achievements").update(payload).eq("id", targetId);
      if (error && error.code !== "PGRST205") {
        console.warn("Supabase update achievement warning:", error);
      }
    } else {
      const { error } = await supabase.from("achievements").insert([{ id: targetId, ...payload }]);
      if (error && error.code !== "PGRST205") {
        console.warn("Supabase insert achievement warning:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase save achievement error, saving to local cache:", err);
  }

  // Update local cache
  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [prepared, ...current];

  saveAchievementsToCache(updatedList);

  try {
    await logAdminActivity(
      isEditing ? "UPDATE" : "CREATE",
      "achievements",
      `${isEditing ? "অর্জন আপডেট" : "নতুন অর্জন যুক্ত"}: "${prepared.title_bn}" (${prepared.year})`
    );
  } catch {
    // ignore
  }

  return prepared;
}

export async function deleteAchievement(id: string): Promise<void> {
  const current = getCachedAchievements();
  const target = current.find((c) => c.id === id);

  try {
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error && error.code !== "PGRST205") {
      console.warn("Supabase delete achievement warning:", error);
    }
  } catch (err) {
    console.warn("Supabase delete achievement error, falling back to cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveAchievementsToCache(filtered);

  try {
    await logAdminActivity(
      "DELETE",
      "achievements",
      `অর্জন মুছে ফেলা: "${target?.title_bn || id}"`
    );
  } catch {
    // ignore
  }
}
