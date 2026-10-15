import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { HafezRecord } from "@/types/cms";

export type { HafezRecord };

const HUFFAZ_CACHE_KEY = "oasis_huffaz_cache_v1";

export const defaultHuffazList: HafezRecord[] = [
  // 2025 Batch
  {
    id: "hfz-2025-1",
    name_bn: "হাফেজ মোঃ তাওহীদুল ইসলাম",
    name_en: "Hafez Md. Tawhidul Islam",
    father_name_bn: "মোঃ রফিকুল ইসলাম",
    father_name_en: "Md. Rafiqul Islam",
    completion_year: "2025",
    duration_bn: "২ বছর ৪ মাস",
    duration_en: "2 Years 4 Months",
    age_at_completion: "১২ বছর",
    campus: "boys",
    teacher_name_bn: "হাফেজ আমানুল্লাহ",
    teacher_name_en: "Hafez Amanullah",
    district_bn: "কাপাসিয়া, গাজীপুর",
    district_en: "Kapasia, Gazipur",
    award_title_bn: "দস্তারবন্দী সম্মাননা পাগড়ী ও মুহতামিম স্বর্ণপদক",
    award_title_en: "Turban of Honor & Principal's Gold Medal",
    is_featured: true,
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "hfz-2025-2",
    name_bn: "হাফেজ মোঃ সালমান ফারসি",
    name_en: "Hafez Md. Salman Farsi",
    father_name_bn: "মাওলানা আব্দুল কাইয়ুম",
    father_name_en: "Mawlana Abdul Qayyum",
    completion_year: "2025",
    duration_bn: "২ বছর ৬ মাস",
    duration_en: "2 Years 6 Months",
    age_at_completion: "১১ বছর",
    campus: "boys",
    teacher_name_bn: "হাফেজ মোঃ ইউসুফ",
    teacher_name_en: "Hafez Md. Yusuf",
    district_bn: "শ্রীপুর, গাজীপুর",
    district_en: "Sreepur, Gazipur",
    award_title_bn: "দস্তারবন্দী সম্মাননা পাগড়ী ও বিশেষ সনদ",
    award_title_en: "Turban of Honor & Sanad",
    is_featured: true,
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "hfz-2025-3",
    name_bn: "হাফেজা জান্নাতুল মাওয়া",
    name_en: "Hafeza Jannatul Mawa",
    father_name_bn: "মোঃ মোজাম্মেল হক",
    father_name_en: "Md. Mozammel Haque",
    completion_year: "2025",
    duration_bn: "২ বছর ৮ মাস",
    duration_en: "2 Years 8 Months",
    age_at_completion: "১৩ বছর",
    campus: "girls",
    teacher_name_bn: "হাফেজা রুকাইয়া ইসলাম",
    teacher_name_en: "Hafeza Rukaiya Islam",
    district_bn: "মনোহরদী, নরসিংদী",
    district_en: "Monohardi, Narsingdi",
    award_title_bn: "হিফজুল কুরআন বিশেষ সনদ ও রৌপ্যপদক",
    award_title_en: "Hifz Special Sanad & Silver Medal",
    is_featured: true,
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },

  // 2024 Batch
  {
    id: "hfz-2024-1",
    name_bn: "হাফেজ মোঃ আব্দুল্লাহ আল নোমান",
    name_en: "Hafez Md. Abdullah Al Noman",
    father_name_bn: "মোঃ ফারুক হোসেন",
    father_name_en: "Md. Faruk Hossain",
    completion_year: "2024",
    duration_bn: "২ বছর ৯ মাস",
    duration_en: "2 Years 9 Months",
    age_at_completion: "১২ বছর",
    campus: "boys",
    teacher_name_bn: "হাফেজ আমানুল্লাহ",
    teacher_name_en: "Hafez Amanullah",
    district_bn: "কাপাসিয়া, গাজীপুর",
    district_en: "Kapasia, Gazipur",
    award_title_bn: "প্রথম স্থান ও সম্মাননা পাগড়ী",
    award_title_en: "First Position & Turban of Honor",
    is_featured: true,
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "hfz-2024-2",
    name_bn: "হাফেজ মোঃ মুস্তাফিজুর রহমান",
    name_en: "Hafez Md. Mustafizur Rahman",
    father_name_bn: "মোঃ আলমগীর হোসেন",
    father_name_en: "Md. Alamgir Hossain",
    completion_year: "2024",
    duration_bn: "২ বছর ৮ মাস",
    duration_en: "2 Years 8 Months",
    age_at_completion: "১১ বছর",
    campus: "boys",
    teacher_name_bn: "হাফেজ মোঃ ইউসুফ",
    teacher_name_en: "Hafez Md. Yusuf",
    district_bn: "কালীগঞ্জ, গাজীপুর",
    district_en: "Kaliganj, Gazipur",
    award_title_bn: "দস্তারবন্দী সম্মাননা পাগড়ী",
    award_title_en: "Turban of Honor",
    is_featured: false,
    order_index: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "hfz-2024-3",
    name_bn: "হাফেজা উম্মে সালমা",
    name_en: "Hafeza Umme Salma",
    father_name_bn: "মোঃ আনোয়ার হোসেন",
    father_name_en: "Md. Anwar Hossain",
    completion_year: "2024",
    duration_bn: "২ বছর ৬ মাস",
    duration_en: "2 Years 6 Months",
    age_at_completion: "১২ বছর",
    campus: "girls",
    teacher_name_bn: "হাফেজা রুকাইয়া ইসলাম",
    teacher_name_en: "Hafeza Rukaiya Islam",
    district_bn: "কাপাসিয়া বাজার, গাজীপুর",
    district_en: "Kapasia, Gazipur",
    award_title_bn: "হিফজ সমাপন কৃতি সনদ",
    award_title_en: "Hifz Completion Sanad",
    is_featured: false,
    order_index: 6,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "hfz-2024-4",
    name_bn: "হাফেজ মোঃ আহমাদ উল্লাহ",
    name_en: "Hafez Md. Ahmad Ullah",
    father_name_bn: "মোঃ দেলোয়ার হোসেন",
    father_name_en: "Md. Delowar Hossain",
    completion_year: "2024",
    duration_bn: "৩ বছর",
    duration_en: "3 Years",
    age_at_completion: "১৩ বছর",
    campus: "boys",
    teacher_name_bn: "হাফেজ আমানুল্লাহ",
    teacher_name_en: "Hafez Amanullah",
    district_bn: "উত্তরা, ঢাকা",
    district_en: "Uttara, Dhaka",
    award_title_bn: "দস্তারবন্দী সম্মাননা পাগড়ী",
    award_title_en: "Turban of Honor",
    is_featured: false,
    order_index: 7,
    is_active: true,
    created_at: new Date().toISOString(),
  },

  // 2023 Batch
  {
    id: "hfz-2023-1",
    name_bn: "হাফেজ মোঃ তানজীমুল হাসান",
    name_en: "Hafez Md. Tanjimul Hasan",
    father_name_bn: "হাফেজ হাবিবুর রহমান",
    father_name_en: "Hafez Habibur Rahman",
    completion_year: "2023",
    duration_bn: "২ বছর ১০ মাস",
    duration_en: "2 Years 10 Months",
    age_at_completion: "১২ বছর",
    campus: "boys",
    teacher_name_bn: "হাফেজ মোঃ ইউসুফ",
    teacher_name_en: "Hafez Md. Yusuf",
    district_bn: "শ্রীপুর, গাজীপুর",
    district_en: "Sreepur, Gazipur",
    award_title_bn: "দস্তারবন্দী সম্মাননা ও ক্রেস্ট",
    award_title_en: "Honor Crest & Turban",
    is_featured: false,
    order_index: 8,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "hfz-2023-2",
    name_bn: "হাফেজা খাদিজাতুল কুবরা",
    name_en: "Hafeza Khadijatul Kubra",
    father_name_bn: "মাওলানা সিরাজুল ইসলাম",
    father_name_en: "Mawlana Sirajul Islam",
    completion_year: "2023",
    duration_bn: "২ বছর ১০ মাস",
    duration_en: "2 Years 10 Months",
    age_at_completion: "১৩ বছর",
    campus: "girls",
    teacher_name_bn: "হাফেজা রুকাইয়া ইসলাম",
    teacher_name_en: "Hafeza Rukaiya Islam",
    district_bn: "শিবপুর, নরসিংদী",
    district_en: "Shibpur, Narsingdi",
    award_title_bn: "হিফজুল কুরআন বিশেষ অ্যাওয়ার্ড",
    award_title_en: "Hifzul Quran Special Award",
    is_featured: false,
    order_index: 9,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "hfz-2023-3",
    name_bn: "হাফেজ মোঃ ওমর ফারুক",
    name_en: "Hafez Md. Omar Faruk",
    father_name_bn: "মোঃ শাহজাহান মিয়া",
    father_name_en: "Md. Shahjahan Mia",
    completion_year: "2023",
    duration_bn: "৩ বছর",
    duration_en: "3 Years",
    age_at_completion: "১৪ বছর",
    campus: "boys",
    teacher_name_bn: "হাফেজ আমানুল্লাহ",
    teacher_name_en: "Hafez Amanullah",
    district_bn: "কাপাসিয়া, গাজীপুর",
    district_en: "Kapasia, Gazipur",
    award_title_bn: "দস্তারবন্দী সম্মাননা পাগড়ী",
    award_title_en: "Turban of Honor",
    is_featured: false,
    order_index: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Local cache helpers
const getCachedHuffaz = (): HafezRecord[] => {
  if (typeof window === "undefined") return defaultHuffazList;
  try {
    const raw = localStorage.getItem(HUFFAZ_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(HUFFAZ_CACHE_KEY, JSON.stringify(defaultHuffazList));
      return defaultHuffazList;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultHuffazList;
  } catch (err) {
    console.warn("Failed to read huffaz from cache:", err);
    return defaultHuffazList;
  }
};

const saveHuffazToCache = (items: HafezRecord[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HUFFAZ_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to save huffaz to cache:", err);
  }
};

// ================= HUFFAZ API =================

export async function getHuffazList(): Promise<HafezRecord[]> {
  try {
    const { data, error } = await supabase
      .from("wall_of_huffaz")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) {
      return getCachedHuffaz();
    }

    const mapped: HafezRecord[] = data.map((item: any, idx: number) => ({
      id: item.id || `hfz-${idx}`,
      name_bn: item.name_bn || "",
      name_en: item.name_en || "",
      father_name_bn: item.father_name_bn || null,
      father_name_en: item.father_name_en || null,
      completion_year: item.completion_year || "2025",
      duration_bn: item.duration_bn || null,
      duration_en: item.duration_en || null,
      age_at_completion: item.age_at_completion || null,
      campus: item.campus || "boys",
      teacher_name_bn: item.teacher_name_bn || null,
      teacher_name_en: item.teacher_name_en || null,
      district_bn: item.district_bn || null,
      district_en: item.district_en || null,
      award_title_bn: item.award_title_bn || null,
      award_title_en: item.award_title_en || null,
      image_url: item.image_url || null,
      is_featured: Boolean(item.is_featured),
      order_index: item.order_index ?? idx + 1,
      is_active: item.is_active ?? true,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    saveHuffazToCache(mapped);
    return mapped;
  } catch (err) {
    console.warn("Using cached huffaz list:", err);
    return getCachedHuffaz();
  }
}

export async function saveHafezRecord(
  item: Omit<HafezRecord, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<HafezRecord> {
  const current = getCachedHuffaz();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `hfz-${Date.now()}`;

  const prepared: HafezRecord = {
    ...item,
    id: targetId,
    order_index: item.order_index ?? (current.length + 1),
    is_active: item.is_active ?? true,
    updated_at: new Date().toISOString(),
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
  };

  try {
    await supabase.from("wall_of_huffaz").upsert({
      id: prepared.id,
      name_bn: prepared.name_bn,
      name_en: prepared.name_en,
      father_name_bn: prepared.father_name_bn,
      father_name_en: prepared.father_name_en,
      completion_year: prepared.completion_year,
      duration_bn: prepared.duration_bn,
      duration_en: prepared.duration_en,
      age_at_completion: prepared.age_at_completion,
      campus: prepared.campus,
      teacher_name_bn: prepared.teacher_name_bn,
      teacher_name_en: prepared.teacher_name_en,
      district_bn: prepared.district_bn,
      district_en: prepared.district_en,
      award_title_bn: prepared.award_title_bn,
      award_title_en: prepared.award_title_en,
      image_url: prepared.image_url,
      is_featured: prepared.is_featured,
      order_index: prepared.order_index,
      is_active: prepared.is_active,
      updated_at: prepared.updated_at,
    });
  } catch (err) {
    console.warn("Supabase upsert huffaz error, relying on cache:", err);
  }

  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [...current, prepared];

  saveHuffazToCache(updatedList);
  await logAdminActivity(
    isEditing ? "UPDATE" : "CREATE",
    "wall_of_huffaz",
    `${isEditing ? "Updated" : "Added"} Hafez: ${prepared.name_bn} (${prepared.completion_year})`
  );

  return prepared;
}

export async function deleteHafezRecord(id: string): Promise<void> {
  const current = getCachedHuffaz();
  const deletedItem = current.find((c) => c.id === id);

  try {
    await supabase.from("wall_of_huffaz").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete huffaz error, relying on cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveHuffazToCache(filtered);

  await logAdminActivity(
    "DELETE",
    "wall_of_huffaz",
    `Deleted Hafez record: ${deletedItem?.name_bn || id}`
  );
}
