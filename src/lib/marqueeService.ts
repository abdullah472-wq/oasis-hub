import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { MarqueeNotice } from "@/types/cms";

const MARQUEE_CACHE_KEY = "oasis_marquee_notices_cache_v1";

export const defaultMarqueeNotices: MarqueeNotice[] = [
  {
    id: "marquee-default-1",
    text_bn: "২০২৬ শিক্ষাবর্ষে নূরানী, নাজেরা ও হিফজ শাখায় ভর্তি চলছে। বিস্তারিত জানতে অফিসে যোগাযোগ করুন।",
    text_en: "Admissions open for Nurani, Nazara and Hifz sections for 2026 academic year. Contact office for details.",
    link_url: "/admission",
    is_active: true,
    priority: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "marquee-default-2",
    text_bn: "আননূর তাহফিজুল কুরআন মাদরাসার উভয় ক্যাম্পাসে আধুনিক দ্বীনি ও সাধারণ শিক্ষার সমন্বিত পাঠদান পরিচালিত হচ্ছে।",
    text_en: "Annoor Tahfizul Quran Madrasa provides integrated Islamic and modern general education.",
    link_url: "/about",
    is_active: true,
    priority: 2,
    created_at: new Date().toISOString(),
  },
];

export const getCachedMarqueeNotices = (): MarqueeNotice[] => {
  if (typeof window === "undefined") return defaultMarqueeNotices;
  try {
    const raw = localStorage.getItem(MARQUEE_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(MARQUEE_CACHE_KEY, JSON.stringify(defaultMarqueeNotices));
      return defaultMarqueeNotices;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMarqueeNotices;
  } catch (err) {
    console.warn("Failed to read marquee notices from cache:", err);
    return defaultMarqueeNotices;
  }
};

export const saveMarqueeNoticesToCache = (items: MarqueeNotice[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MARQUEE_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to save marquee notices to cache:", err);
  }
};

export async function getMarqueeList(): Promise<MarqueeNotice[]> {
  try {
    const { data, error } = await supabase
      .from("marquee_notices")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: MarqueeNotice[] = data.map((item: any, idx: number) => ({
        id: item.id || `mq-${idx}`,
        text_bn: item.text_bn || "",
        text_en: item.text_en || null,
        link_url: item.link_url || null,
        priority: Number(item.priority) || 1,
        is_active: item.is_active ?? true,
        created_at: item.created_at || new Date().toISOString(),
      }));

      saveMarqueeNoticesToCache(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase fetch marquee warning, falling back to cache:", err);
  }

  return getCachedMarqueeNotices();
}

export async function saveMarqueeNotice(
  item: Omit<MarqueeNotice, "id" | "created_at"> & { id?: string }
): Promise<MarqueeNotice> {
  const current = getCachedMarqueeNotices();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `mq-${Date.now()}`;

  const prepared: MarqueeNotice = {
    ...item,
    id: targetId,
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
  };

  try {
    const payload = {
      text_bn: prepared.text_bn,
      text_en: prepared.text_en || null,
      link_url: prepared.link_url || null,
      priority: prepared.priority,
      is_active: prepared.is_active,
    };

    if (isEditing) {
      const { error } = await supabase.from("marquee_notices").update(payload).eq("id", targetId);
      if (error && error.code !== "PGRST205") {
        console.warn("Supabase update marquee warning:", error);
      }
    } else {
      const { error } = await supabase.from("marquee_notices").insert([{ id: targetId, ...payload }]);
      if (error && error.code !== "PGRST205") {
        console.warn("Supabase insert marquee warning:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase save marquee error, saving to local cache:", err);
  }

  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [prepared, ...current];

  saveMarqueeNoticesToCache(updatedList);

  try {
    await logAdminActivity(
      isEditing ? "UPDATE" : "CREATE",
      "marquee_notices",
      `${isEditing ? "মারকুই নোটিশ আপডেট" : "নতুন মারকুই নোটিশ তৈরি"}: "${prepared.text_bn.slice(0, 30)}..."`
    );
  } catch {
    // ignore
  }

  return prepared;
}

export async function toggleMarqueeActive(id: string, is_active: boolean): Promise<void> {
  const current = getCachedMarqueeNotices();
  const target = current.find((c) => c.id === id);

  try {
    const { error } = await supabase.from("marquee_notices").update({ is_active }).eq("id", id);
    if (error && error.code !== "PGRST205") {
      console.warn("Supabase toggle marquee warning:", error);
    }
  } catch (err) {
    console.warn("Supabase toggle marquee error, falling back to cache:", err);
  }

  const updatedList = current.map((c) => (c.id === id ? { ...c, is_active } : c));
  saveMarqueeNoticesToCache(updatedList);

  try {
    await logAdminActivity(
      "UPDATE",
      "marquee_notices",
      `মারকুই নোটিশ স্ট্যাটাস পরিবর্তন: "${(target?.text_bn || id).slice(0, 30)}" -> ${is_active ? "Active" : "Inactive"}`
    );
  } catch {
    // ignore
  }
}

export async function deleteMarqueeNotice(id: string): Promise<void> {
  const current = getCachedMarqueeNotices();
  const target = current.find((c) => c.id === id);

  try {
    const { error } = await supabase.from("marquee_notices").delete().eq("id", id);
    if (error && error.code !== "PGRST205") {
      console.warn("Supabase delete marquee warning:", error);
    }
  } catch (err) {
    console.warn("Supabase delete marquee error, falling back to cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveMarqueeNoticesToCache(filtered);

  try {
    await logAdminActivity(
      "DELETE",
      "marquee_notices",
      `মারকুই নোটিশ মুছে ফেলা: "${(target?.text_bn || id).slice(0, 30)}"`
    );
  } catch {
    // ignore
  }
}
