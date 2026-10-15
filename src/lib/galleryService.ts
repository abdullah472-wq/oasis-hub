import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { GalleryItem, GalleryCategory } from "@/types/cms";

export type { GalleryItem, GalleryCategory };

const GALLERY_CACHE_KEY = "oasis_gallery_cache_v2";

export const defaultGalleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title_bn: "পবিত্র কুরআন তিলাওয়াত ও হিফজ সবক সেশন",
    title_en: "Holy Quran Recitation & Hifz Lesson Session",
    caption_bn: "হিফজুল কুরআন বিভাগের শিক্ষার্থীগণ গভীর মনোযোগ ও তাজবীদের সাথে পবিত্র কুরআন তেলাওয়াত ও মুখস্থকরণে রত।",
    caption_en: "Students of Hifz department memorizing and reciting the Holy Quran with Tajweed precision.",
    image_url: "/gallery/quran_class.jpg",
    category: "academic",
    date_label: "মার্চ ২০২৬",
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "gal-2",
    title_bn: "কৃতি হাফেজ শিক্ষার্থীদের গৌরবময় দস্তারবন্দী সমাবর্তন",
    title_en: "Honorable Dastarbandi Convocation of Huffaz",
    caption_bn: "কুরআনে কারীম হিফজ সম্পন্নকারী সম্মানিত হাফেজ শিক্ষার্থীদের মাথায় শ্রদ্ধা ও ভালোবাসার সম্মানসূচক পাগড়ি পরিয়ে দিচ্ছেন বরেণ্য ওলামায়ে কেরাম।",
    caption_en: "Graduating Huffaz honored with traditional Dastar (turban) in the presence of distinguished scholars.",
    image_url: "/gallery/dastarbandi.jpg",
    category: "event",
    date_label: "ফেব্রুয়ারি ২০২৬",
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "gal-3",
    title_bn: "আধুনিক ডিজিটাল স্মার্ট ক্লাসরুম ও সমন্বিত পাঠদান",
    title_en: "Modern Digital Smart Classroom & Integrated Learning",
    caption_bn: "জেনারেল শিক্ষা পাঠ্যক্রমের আওতায় মাল্টিমিডিয়া প্রজেক্টর ও ইন্টারেক্টিভ বোর্ডে বিজ্ঞান, ইংরেজি ও গণিত পাঠদান।",
    caption_en: "Integrated national curriculum education with interactive digital smart boards and computers.",
    image_url: "/gallery/smart_classroom.jpg",
    category: "academic",
    date_label: "জানুয়ারি ২০২৬",
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "gal-4",
    title_bn: "বার্ষিক ক্রীড়া প্রতিযোগিতা ও পুরস্কার বিতরণী উৎসব",
    title_en: "Annual Sports Day & Grand Championship Ceremony",
    caption_bn: "শিক্ষার্থীদের শারীরিক সুস্থতা ও মেধা বিকাশে অনুষ্ঠিত বার্ষিক ক্রীড়া উৎসবে বিজয়ীদের মাঝে ট্রফি ও মেডেল বিতরণ।",
    caption_en: "Annual sports day celebration and trophy presentation for outstanding student champions.",
    image_url: "/gallery/sports_awards.jpg",
    category: "achievement",
    date_label: "জানুয়ারি ২০২৬",
    order_index: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "gal-5",
    title_bn: "কেন্দ্রীয় কুতুবখানা ও গবেষণা পাঠাগার",
    title_en: "Central Islamic Library & Research Corner",
    caption_bn: "হাদিস, তাফসির, ফিকহ ও জেনারেল জ্ঞানের সমৃদ্ধ সংগ্রহশালায় শিক্ষার্থীদের জ্ঞানচর্চার শান্ত মনোরম পরিবেশ।",
    caption_en: "Well-equipped library offering rich Islamic literature, Hadith collections, and general knowledge books.",
    image_url: "/gallery/library.jpg",
    category: "campus",
    date_label: "নভেম্বর ২০২৫",
    order_index: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "gal-6",
    title_bn: "হস্তলিপি ও আরবি ক্যালিগ্রাফি প্রশিক্ষণ কর্মশালা",
    title_en: "Handwriting & Arabic Calligraphy Art Workshop",
    caption_bn: "কোমলমতি শিক্ষার্থীদের সুন্দর হস্তাক্ষর ও শাস্ত্রীয় আরবি ক্যালিগ্রাফি দক্ষতায় গড়ে তোলার বিশেষ প্রশিক্ষণ সেশন।",
    caption_en: "Special workshop for artistic Arabic calligraphy and handwriting refinement.",
    image_url: "/gallery/calligraphy.jpg",
    category: "academic",
    date_label: "ডিসেম্বর ২০২৫",
    order_index: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: "gal-7",
    title_bn: "আননূর শিক্ষা পরিবার প্রধান ক্যাম্পাস ভবন",
    title_en: "Annoor Education Family Main Campus Building",
    caption_bn: "গাজীপুরের কাপাসিয়া বাজারের কেন্দ্রস্থলে অবস্থিত আননূর শিক্ষা পরিবারের বহুতল আধুনিক ও সুপরিকল্পিত ক্যাম্পাস।",
    caption_en: "Modern and well-planned campus infrastructure situated at Main Road, Kapasia Bazar, Gazipur.",
    image_url: "/gallery/campus_main.jpg",
    category: "campus",
    date_label: "২০২৫-২০২৬",
    order_index: 7,
    created_at: new Date().toISOString(),
  },
];

export const getCachedGallery = (): GalleryItem[] => {
  try {
    const raw = localStorage.getItem(GALLERY_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read gallery from cache:", err);
  }
  return defaultGalleryItems;
};

export const saveGalleryToCache = (items: GalleryItem[]): void => {
  try {
    localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to write gallery to cache:", err);
  }
};

export async function getGalleryList(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getCachedGallery();
    }

    const mapped: GalleryItem[] = data.map((item: any, idx: number) => ({
      id: item.id || `gal-${idx}`,
      title_bn: item.title_bn || "",
      title_en: item.title_en || null,
      caption_bn: item.caption_bn || null,
      caption_en: item.caption_en || null,
      image_url: item.image_url || "/gallery/campus_main.jpg",
      thumbnail_url: item.thumbnail_url || null,
      category: (item.category as GalleryCategory) || "campus",
      date_label: item.date_label || null,
      order_index: item.order_index ?? idx + 1,
      created_at: item.created_at || new Date().toISOString(),
    }));

    saveGalleryToCache(mapped);
    return mapped;
  } catch (err) {
    console.warn("Using cached gallery list:", err);
    return getCachedGallery();
  }
}

export async function saveGalleryItem(
  item: Omit<GalleryItem, "id" | "created_at"> & { id?: string }
): Promise<GalleryItem> {
  const current = getCachedGallery();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `gal-${Date.now()}`;

  const prepared: GalleryItem = {
    ...item,
    id: targetId,
    order_index: item.order_index ?? current.length + 1,
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
  };

  try {
    await supabase.from("gallery_items").upsert({
      id: prepared.id,
      title_bn: prepared.title_bn,
      title_en: prepared.title_en,
      caption_bn: prepared.caption_bn,
      caption_en: prepared.caption_en,
      image_url: prepared.image_url,
      thumbnail_url: prepared.thumbnail_url,
      category: prepared.category,
      date_label: prepared.date_label,
      order_index: prepared.order_index,
    });
  } catch (err) {
    console.warn("Supabase upsert gallery error, relying on cache:", err);
  }

  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [...current, prepared];

  saveGalleryToCache(updatedList);
  await logAdminActivity(
    isEditing ? "UPDATE" : "CREATE",
    "gallery_items",
    `${isEditing ? "Updated" : "Added"} gallery photo: ${prepared.title_bn}`
  );

  return prepared;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const current = getCachedGallery();
  const deletedItem = current.find((c) => c.id === id);

  try {
    await supabase.from("gallery_items").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete gallery error, relying on cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveGalleryToCache(filtered);

  await logAdminActivity(
    "DELETE",
    "gallery_items",
    `Deleted gallery photo: ${deletedItem?.title_bn || id}`
  );
}
