import { supabase, ensureSupabaseAdminAuth, logAdminActivity } from "./supabase/client";

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

const NEWS_CACHE_KEY = "oasis_news_cache_v2";
const EMBED_DELIMITER_REGEX = /<!--embed:([\s\S]*?)-->/;

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
    window.dispatchEvent(new StorageEvent("storage", { key: NEWS_CACHE_KEY }));
  } catch {
    // ignore
  }
};

function mapRowToNewsPost(row: any): NewsPost {
  let embedCode: string | undefined = undefined;
  let cleanContentBn = row.content_bn || "";
  let cleanContentEn = row.content_en || "";

  const matchEn = cleanContentEn.match(EMBED_DELIMITER_REGEX);
  if (matchEn) {
    embedCode = matchEn[1];
    cleanContentEn = cleanContentEn.replace(EMBED_DELIMITER_REGEX, "").trim();
  }

  const matchBn = cleanContentBn.match(EMBED_DELIMITER_REGEX);
  if (matchBn) {
    if (!embedCode) embedCode = matchBn[1];
    cleanContentBn = cleanContentBn.replace(EMBED_DELIMITER_REGEX, "").trim();
  }

  const rawDate = row.published_at || row.created_at || new Date().toISOString();
  const dateStr = typeof rawDate === "string" ? rawDate.split("T")[0] : new Date(rawDate).toISOString().split("T")[0];
  const createdAtMs = row.created_at ? new Date(row.created_at).getTime() : Date.now();

  return {
    id: row.id,
    titleBn: row.title_bn || "",
    titleEn: row.title_en || row.title_bn || "",
    excerptBn: cleanContentBn,
    excerptEn: cleanContentEn || cleanContentBn,
    date: dateStr,
    imageUrl: row.image_url || "/hero-campus.jpg",
    category: row.category || "সাধারণ",
    embedCode: embedCode || undefined,
    createdAt: createdAtMs,
  };
}

function mapNewsPostToDb(post: Partial<NewsPost>) {
  let contentEn = (post.excerptEn || post.excerptBn || "").trim();
  if (post.embedCode && post.embedCode.trim()) {
    contentEn = `${contentEn}\n<!--embed:${post.embedCode.trim()}-->`;
  }

  let publishedAt = new Date().toISOString();
  if (post.date) {
    const parsed = new Date(post.date);
    if (!isNaN(parsed.getTime())) {
      publishedAt = parsed.toISOString();
    }
  }

  return {
    title_bn: (post.titleBn || "").trim(),
    title_en: (post.titleEn || post.titleBn || "").trim(),
    content_bn: (post.excerptBn || "").trim(),
    content_en: contentEn,
    category: post.category || "সাধারণ",
    image_url: post.imageUrl || "/hero-campus.jpg",
    is_published: true,
    published_at: publishedAt,
  };
}

export const saveNewsToFirestore = async (
  post: Omit<NewsPost, "id" | "createdAt">
): Promise<NewsPost> => {
  await ensureSupabaseAdminAuth();

  const dbPayload = mapNewsPostToDb(post);

  let newPost: NewsPost = {
    ...post,
    id: `news-${Date.now()}`,
    createdAt: Date.now(),
  };

  try {
    let { data, error } = await supabase
      .from("news")
      .insert([dbPayload])
      .select()
      .single();

    if (error && error.code === "42501") {
      const authed = await ensureSupabaseAdminAuth();
      if (authed) {
        const retry = await supabase
          .from("news")
          .insert([dbPayload])
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      console.error("Supabase news insert error:", error);
      throw new Error(error.message || "সংবাদ সংরক্ষণ করতে ব্যর্থ হয়েছে");
    }

    if (data) {
      newPost = mapRowToNewsPost(data);
    }
  } catch (err: any) {
    console.error("News save error:", err);
    throw err;
  }

  // Update local cache and broadcast update
  const cached = readNewsCache();
  const updated = [newPost, ...cached.filter((item) => item.id !== newPost.id)];
  writeNewsCache(updated);

  void logAdminActivity(
    "CREATE",
    "news",
    `Published news: ${newPost.titleBn}`
  );

  return newPost;
};

export const getNewsFromFirestore = async (): Promise<NewsPost[]> => {
  try {
    const cached = readNewsCache();

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase get news warning:", error);
      return cached.length > 0 ? cached : defaultNewsPosts;
    }

    if (data && data.length > 0) {
      const mapped = data.map(mapRowToNewsPost);

      // Preserve any recently saved local posts not yet reflected
      const seenIds = new Set(mapped.map((m) => m.id));
      for (const localItem of cached) {
        if (localItem.id && !seenIds.has(localItem.id)) {
          if (Date.now() - (localItem.createdAt || 0) < 5 * 60 * 1000) {
            mapped.unshift(localItem);
          }
        }
      }

      writeNewsCache(mapped);
      return mapped;
    }

    return cached.length > 0 ? cached : defaultNewsPosts;
  } catch (err) {
    console.warn("Failed to load news, falling back to cache:", err);
    return readNewsCache();
  }
};

export const deleteNewsFromFirestore = async (id: string): Promise<void> => {
  await ensureSupabaseAdminAuth();

  try {
    let { error } = await supabase.from("news").delete().eq("id", id);
    if (error && error.code === "42501") {
      const authed = await ensureSupabaseAdminAuth();
      if (authed) {
        const retry = await supabase.from("news").delete().eq("id", id);
        error = retry.error;
      }
    }
    if (error) {
      console.error("Supabase news delete error:", error);
      throw new Error(error.message || "Failed to delete news from database");
    }
  } catch (err) {
    console.error("News delete error:", err);
    throw err;
  }

  const cached = readNewsCache();
  const updated = cached.filter((item) => item.id !== id);
  writeNewsCache(updated);

  void logAdminActivity(
    "DELETE",
    "news",
    `Deleted news item: ${id}`
  );
};

export const updateNewsInFirestore = async (
  id: string,
  payload: Partial<Omit<NewsPost, "id" | "createdAt">>
): Promise<void> => {
  await ensureSupabaseAdminAuth();

  const dbPayload = mapNewsPostToDb(payload);

  try {
    let { error } = await supabase
      .from("news")
      .update(dbPayload)
      .eq("id", id);

    if (error && error.code === "42501") {
      const authed = await ensureSupabaseAdminAuth();
      if (authed) {
        const retry = await supabase
          .from("news")
          .update(dbPayload)
          .eq("id", id);
        error = retry.error;
      }
    }

    if (error) {
      console.error("Supabase news update error:", error);
      throw new Error(error.message || "Failed to update news in database");
    }
  } catch (err) {
    console.error("News update error:", err);
    throw err;
  }

  const cached = readNewsCache();
  const updated = cached.map((item) =>
    item.id === id ? { ...item, ...payload, updatedAt: Date.now() } : item
  );
  writeNewsCache(updated);

  void logAdminActivity(
    "UPDATE",
    "news",
    `Updated news: ${payload.titleBn || id}`
  );
};

// Aliases for modern naming
export const getNewsList = getNewsFromFirestore;
export const saveNewsPost = saveNewsToFirestore;
export const updateNewsPost = updateNewsInFirestore;
export const deleteNewsPost = deleteNewsFromFirestore;
