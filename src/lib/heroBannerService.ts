import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { HeroBanner } from "@/types/cms";

const HERO_BANNERS_CACHE_KEY = "oasis_hero_banners_cache_v1";

export const defaultHeroBanners: HeroBanner[] = [
  {
    id: "banner-default-1",
    title_bn: "আধুনিক শিক্ষা ও দ্বীনি শিক্ষার এক অনন্য সমন্বয়",
    title_en: "A Unique Blend of Modern & Islamic Education",
    subtitle_bn: "নূরানী, নাজেরা ও হিফজুল কুরআনের পাশাপাশি আধুনিক ও মানসম্মত পাঠদান",
    subtitle_en: "Excellence in Hifz, Nazara, and contemporary education",
    image_url: "/hero-campus.jpg",
    cta_text_bn: "ভর্তি আবেদন",
    cta_text_en: "Apply Now",
    cta_link: "/admission",
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const getCachedHeroBanners = (): HeroBanner[] => {
  if (typeof window === "undefined") return defaultHeroBanners;
  try {
    const raw = localStorage.getItem(HERO_BANNERS_CACHE_KEY);
    if (raw === null) {
      localStorage.setItem(HERO_BANNERS_CACHE_KEY, JSON.stringify(defaultHeroBanners));
      return defaultHeroBanners;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultHeroBanners;
  } catch (err) {
    console.warn("Failed to read hero banners from cache:", err);
    return defaultHeroBanners;
  }
};

export const saveHeroBannersToCache = (items: HeroBanner[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HERO_BANNERS_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to save hero banners to cache:", err);
  }
};

export async function getHeroBannersList(): Promise<HeroBanner[]> {
  try {
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: HeroBanner[] = data.map((item: any, idx: number) => ({
        id: item.id || `banner-${idx}`,
        title_bn: item.title_bn || "",
        title_en: item.title_en || null,
        subtitle_bn: item.subtitle_bn || null,
        subtitle_en: item.subtitle_en || null,
        image_url: item.image_url || "/hero-campus.jpg",
        cta_text_bn: item.cta_text_bn || null,
        cta_text_en: item.cta_text_en || null,
        cta_link: item.cta_link || null,
        order_index: Number(item.order_index) || idx + 1,
        is_active: item.is_active ?? true,
        created_at: item.created_at || new Date().toISOString(),
      }));

      saveHeroBannersToCache(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase fetch hero banners warning, falling back to cache:", err);
  }

  return getCachedHeroBanners();
}

export async function saveHeroBanner(
  item: Omit<HeroBanner, "id" | "created_at"> & { id?: string }
): Promise<HeroBanner> {
  const current = getCachedHeroBanners();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `banner-${Date.now()}`;

  const prepared: HeroBanner = {
    ...item,
    id: targetId,
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
  };

  try {
    const payload = {
      title_bn: prepared.title_bn,
      title_en: prepared.title_en || null,
      subtitle_bn: prepared.subtitle_bn || null,
      subtitle_en: prepared.subtitle_en || null,
      image_url: prepared.image_url,
      cta_text_bn: prepared.cta_text_bn || null,
      cta_text_en: prepared.cta_text_en || null,
      cta_link: prepared.cta_link || null,
      order_index: prepared.order_index,
      is_active: prepared.is_active,
    };

    if (isEditing) {
      const { error } = await supabase.from("hero_banners").update(payload).eq("id", targetId);
      if (error && error.code !== "PGRST205") {
        console.warn("Supabase update banner warning:", error);
      }
    } else {
      const { error } = await supabase.from("hero_banners").insert([{ id: targetId, ...payload }]);
      if (error && error.code !== "PGRST205") {
        console.warn("Supabase insert banner warning:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase save banner error, saving to local cache:", err);
  }

  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [...current, prepared];

  saveHeroBannersToCache(updatedList);

  try {
    await logAdminActivity(
      isEditing ? "UPDATE" : "CREATE",
      "hero_banners",
      `${isEditing ? "হিরো ব্যানার আপডেট" : "নতুন হিরো ব্যানার তৈরি"}: "${prepared.title_bn}"`
    );
  } catch {
    // ignore
  }

  return prepared;
}

export async function toggleHeroBannerActive(id: string, is_active: boolean): Promise<void> {
  const current = getCachedHeroBanners();
  const target = current.find((c) => c.id === id);

  try {
    const { error } = await supabase.from("hero_banners").update({ is_active }).eq("id", id);
    if (error && error.code !== "PGRST205") {
      console.warn("Supabase toggle banner warning:", error);
    }
  } catch (err) {
    console.warn("Supabase toggle banner error, falling back to cache:", err);
  }

  const updatedList = current.map((c) => (c.id === id ? { ...c, is_active } : c));
  saveHeroBannersToCache(updatedList);

  try {
    await logAdminActivity(
      "UPDATE",
      "hero_banners",
      `হিরো ব্যানার স্ট্যাটাস: "${target?.title_bn || id}" -> ${is_active ? "Active" : "Inactive"}`
    );
  } catch {
    // ignore
  }
}

export async function deleteHeroBanner(id: string): Promise<void> {
  const current = getCachedHeroBanners();
  const target = current.find((c) => c.id === id);

  try {
    const { error } = await supabase.from("hero_banners").delete().eq("id", id);
    if (error && error.code !== "PGRST205") {
      console.warn("Supabase delete banner warning:", error);
    }
  } catch (err) {
    console.warn("Supabase delete banner error, falling back to cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveHeroBannersToCache(filtered);

  try {
    await logAdminActivity(
      "DELETE",
      "hero_banners",
      `হিরো ব্যানার মুছে ফেলা: "${target?.title_bn || id}"`
    );
  } catch {
    // ignore
  }
}
