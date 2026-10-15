import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { DownloadItem } from "@/types/cms";

export type { DownloadItem };

const DOWNLOADS_CACHE_KEY = "oasis_downloads_cache_v2";

export const defaultDownloadsList: DownloadItem[] = [
  // ================= 1. SYLLABUS =================
  {
    id: "dl-syl-1",
    title_bn: "নূরানী ও নাজেরা বিভাগ বার্ষিক সিলেবাস ২০২৬",
    title_en: "Nurani & Nazara Annual Syllabus 2026",
    description_bn:
      "কোমলমতি শিশুদের নূরানী কায়দা, আমপারা, তাজবীদ, হস্তলিপি ও প্রাথমিক বাংলা, ইংরেজি, গণিত সমন্বিত সিলেবাস।",
    description_en:
      "Complete curriculum breakdown for Nurani Qaida, Ampara, Makhraj, and foundational primary subjects.",
    category: "syllabus",
    file_url: "/documents/nurani_syllabus_2026.pdf",
    file_size_label: "1.8 MB",
    file_type: "PDF",
    download_count: 142,
    is_active: true,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dl-syl-2",
    title_bn: "হিফজুল কুরআন বিভাগ পাঠ্যক্রম ও সবক রুটিন ২০২৬",
    title_en: "Hifzul Quran Department Curriculum & Sabaq Routine 2026",
    description_bn:
      "হিফজ নতুন সবক, সবকপারা এবং দাওর চক্রের দৈনিক ও মাসিক সময়তালিকা ও সিলেবাস নির্দেশিকা।",
    description_en:
      "Comprehensive guidelines for new Quranic lessons, revision tiers, and Tajweed evaluation.",
    category: "syllabus",
    file_url: "/documents/hifz_syllabus_2026.pdf",
    file_size_label: "1.4 MB",
    file_type: "PDF",
    download_count: 198,
    is_active: true,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dl-syl-3",
    title_bn: "জেনারেল ও সমন্বিত প্রাথমিক শিক্ষা সিলেবাস (প্লে - ৫ম শ্রেণি)",
    title_en: "General Integrated Primary Syllabus (Play - Grade 5)",
    description_bn:
      "জাতীয় শিক্ষাক্রমের সাথে সমন্বিত বাংলা, ইংরেজি, গণিত, বিজ্ঞান, সাধারণ জ্ঞান ও স্পোকেন ইংলিশ সিলেবাস।",
    description_en:
      "Integrated national curriculum syllabus covering English, Math, Science, and Islamic Studies.",
    category: "syllabus",
    file_url: "/documents/primary_general_syllabus_2026.pdf",
    file_size_label: "2.5 MB",
    file_type: "PDF",
    download_count: 220,
    is_active: true,
    order_index: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ================= 2. ROUTINE =================
  {
    id: "dl-rtn-1",
    title_bn: "বালক ও বালিকা ক্যাম্পাস বার্ষিক মাস্টার ক্লাস রুটিন ২০২৬",
    title_en: "Boys & Girls Campus Master Class Routine 2026",
    description_bn:
      "উভয় ক্যাম্পাসের সকল বিভাগ ও শ্রেণির দৈনিক পিরিয়ডভিত্তিক ক্লাসের পূর্ণাঙ্গ সময়সূচি।",
    description_en:
      "Full period-by-period daily schedule across all sections of both campuses.",
    category: "routine",
    file_url: "/documents/master_class_routine_2026.pdf",
    file_size_label: "980 KB",
    file_type: "PDF",
    download_count: 310,
    is_active: true,
    order_index: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dl-rtn-2",
    title_bn: "১ম সাময়িক ও ত্রৈমাসিক পরীক্ষা সময়সূচি ২০২৬",
    title_en: "First Term & Quarterly Examination Routine 2026",
    description_bn:
      "শ্রেণিভিত্তিক লিখিত ও মৌখিক পরীক্ষার তারিখ, সময় এবং হল নির্দেশিকা।",
    description_en:
      "Dates, times, and exam hall regulations for upcoming first-term assessments.",
    category: "routine",
    file_url: "/documents/exam_routine_2026.pdf",
    file_size_label: "620 KB",
    file_type: "PDF",
    download_count: 425,
    is_active: true,
    order_index: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dl-rtn-3",
    title_bn: "আবাসিক শিক্ষার্থীদের দৈনিক তারবিয়াত ও হিফজ সময়সূচি",
    title_en: "Residential Students Daily Tarbiya & Hifz Schedule",
    description_bn:
      "তাহাজ্জুদ, ফজর, সকাল-সন্ধ্যা সবক, পুষ্টিকর খাবার, খেলাধুলা ও ঘুমের পূর্ণাঙ্গ দৈনিক রুটিন।",
    description_en:
      "24-hour routine covering prayers, lessons, nutrition, recreation, and sleep.",
    category: "routine",
    file_url: "/documents/boarding_routine_2026.pdf",
    file_size_label: "750 KB",
    file_type: "PDF",
    download_count: 180,
    is_active: true,
    order_index: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ================= 3. ADMISSION & PROSPECTUS =================
  {
    id: "dl-adm-1",
    title_bn: "আননূর শিক্ষা পরিবার পূর্ণাঙ্গ প্রাতিষ্ঠানিক প্রসপেক্টাস ২০২৬",
    title_en: "Annoor Education Family Institutional Prospectus 2026",
    description_bn:
      "প্রতিষ্ঠানের লক্ষ্য, বৈশিষ্ট্য, বালক-বালিকা ক্যাম্পাস সুবিধা, পরিবেশ ও সার্বিক তথ্যাবলী।",
    description_en:
      "Full institutional prospectus featuring campus facilities, educational vision, and policies.",
    category: "admission",
    file_url: "/documents/annoor_prospectus_2026.pdf",
    file_size_label: "4.2 MB",
    file_type: "PDF",
    download_count: 540,
    is_active: true,
    order_index: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dl-adm-2",
    title_bn: "অফলাইন ভর্তি আবেদন ফরম ২০২৬ (প্রিন্ট কপি)",
    title_en: "Printable Offline Admission Application Form 2026",
    description_bn:
      "সরাসরি অফিসে জমা দেওয়ার উপযোগী পূর্ণাঙ্গ রঙিন ভর্তি আবেদন ফরম।",
    description_en:
      "High-resolution printable admission application form for in-person submission.",
    category: "admission",
    file_url: "/documents/admission_form_printable_2026.pdf",
    file_size_label: "850 KB",
    file_type: "PDF",
    download_count: 360,
    is_active: true,
    order_index: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ================= 4. CALENDAR & OTHERS =================
  {
    id: "dl-cal-1",
    title_bn: "বার্ষিক একাডেমিক ক্যালেন্ডার ও সরকারি-ইসলামি ছুটির তালিকা ২০২৬",
    title_en: "Annual Academic Calendar & Holiday Schedule 2026",
    description_bn:
      "ক্লাস শুরু, সাময়িক ও বার্ষিক পরীক্ষা, মাহে রমজান, ঈদুল ফিতর ও ঈদুল আযহার ছুটির তালিকা।",
    description_en:
      "Complete calendar marking term exams, Ramadan, Eid holidays, and seasonal breaks.",
    category: "calendar",
    file_url: "/documents/academic_calendar_2026.pdf",
    file_size_label: "1.2 MB",
    file_type: "PDF",
    download_count: 280,
    is_active: true,
    order_index: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Local cache helpers
const getCachedDownloads = (): DownloadItem[] => {
  if (typeof window === "undefined") return defaultDownloadsList;
  try {
    const raw = localStorage.getItem(DOWNLOADS_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(DOWNLOADS_CACHE_KEY, JSON.stringify(defaultDownloadsList));
      return defaultDownloadsList;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultDownloadsList;
  } catch (err) {
    console.warn("Failed to read downloads from cache:", err);
    return defaultDownloadsList;
  }
};

const saveDownloadsToCache = (items: DownloadItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOWNLOADS_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to save downloads to cache:", err);
  }
};

// ================= DOWNLOADS API =================

export async function getDownloadsList(): Promise<DownloadItem[]> {
  try {
    const { data, error } = await supabase
      .from("downloads")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getCachedDownloads();
    }

    const mapped: DownloadItem[] = data.map((item: any, idx: number) => ({
      id: item.id || `dl-${idx}`,
      title_bn: item.title_bn || "",
      title_en: item.title_en || "",
      description_bn: item.description_bn || null,
      description_en: item.description_en || null,
      category: item.category || "syllabus",
      file_url: item.file_url || "",
      file_size_label: item.file_size_label || "1.0 MB",
      file_type: item.file_type || "PDF",
      download_count: item.download_count ?? 0,
      is_active: item.is_active ?? true,
      order_index: item.order_index ?? idx + 1,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    }));

    saveDownloadsToCache(mapped);
    return mapped;
  } catch (err) {
    console.warn("Using cached downloads list:", err);
    return getCachedDownloads();
  }
}

export async function saveDownloadItem(
  item: Omit<DownloadItem, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<DownloadItem> {
  const current = getCachedDownloads();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `dl-${Date.now()}`;

  const prepared: DownloadItem = {
    ...item,
    id: targetId,
    order_index: item.order_index ?? (current.length + 1),
    download_count: item.download_count ?? 0,
    is_active: item.is_active ?? true,
    updated_at: new Date().toISOString(),
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
  };

  try {
    await supabase.from("downloads").upsert({
      id: prepared.id,
      title_bn: prepared.title_bn,
      title_en: prepared.title_en,
      description_bn: prepared.description_bn,
      description_en: prepared.description_en,
      category: prepared.category,
      file_url: prepared.file_url,
      file_size_label: prepared.file_size_label,
      file_type: prepared.file_type,
      download_count: prepared.download_count,
      is_active: prepared.is_active,
      order_index: prepared.order_index,
      updated_at: prepared.updated_at,
    });
  } catch (err) {
    console.warn("Supabase upsert downloads error, relying on cache:", err);
  }

  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [...current, prepared];

  saveDownloadsToCache(updatedList);
  await logAdminActivity(
    isEditing ? "UPDATE" : "CREATE",
    "downloads",
    `${isEditing ? "Updated" : "Added"} file: ${prepared.title_bn}`
  );

  return prepared;
}

export async function deleteDownloadItem(id: string): Promise<void> {
  const current = getCachedDownloads();
  const deletedItem = current.find((c) => c.id === id);

  try {
    await supabase.from("downloads").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete download error, relying on cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveDownloadsToCache(filtered);

  await logAdminActivity(
    "DELETE",
    "downloads",
    `Deleted download file: ${deletedItem?.title_bn || id}`
  );
}

export async function incrementDownloadCounter(id: string): Promise<void> {
  const current = getCachedDownloads();
  const target = current.find((c) => c.id === id);
  if (!target) return;

  const updatedCount = (target.download_count || 0) + 1;
  const updatedList = current.map((c) =>
    c.id === id ? { ...c, download_count: updatedCount } : c
  );
  saveDownloadsToCache(updatedList);

  try {
    await supabase
      .from("downloads")
      .update({ download_count: updatedCount })
      .eq("id", id);
  } catch (err) {
    // silent fallback
  }
}
