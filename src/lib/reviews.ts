import { supabase } from "@/lib/supabase/client";
import type { ReviewPlatform } from "@/types/cms";

export type { ReviewPlatform };

export interface Review {
  id?: string;
  name: string;
  nameEn?: string;
  relation: string;
  relationEn?: string;
  review: string;
  reviewEn?: string;
  rating?: number;
  platform?: ReviewPlatform;
  approved: boolean;
  createdAt: number;
}

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: "default-1",
    name: "মোঃ রহিম উদ্দিন",
    nameEn: "Md. Rahim Uddin",
    relation: "অভিভাবক · হিফজ বিভাগ",
    relationEn: "Guardian · Hifz Dept",
    review: "আমার সন্তান এই মাদরাসায় পড়ার পর খুবই ভালো পরিবর্তন দেখতে পাচ্ছি। সে এখন নামাজ পড়ে, কোরআন পড়ে এবং আগের চেয়ে অনেক বেশি বিনয়ী ও দায়িত্ববান।",
    reviewEn: "I have seen great changes in my child since joining this madrasha. Now he prays, reads the Quran, and is much more polite and responsible.",
    rating: 5,
    platform: "google",
    approved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "default-2",
    name: "মুহাম্মদ রফিকুল ইসলাম",
    nameEn: "Muhammad Rafiqul Islam",
    relation: "অভিভাবক · ৬ষ্ঠ শ্রেণি",
    relationEn: "Guardian · Class 6",
    review: "এই প্রতিষ্ঠানের শিক্ষকরা খুবই আদর স্নেহের সাথে পড়াশোনা করান। সুশৃঙ্খল ও আন্তরিক পরিবেশে সন্তান খুব আনন্দের সাথে সহীহ কোরআন ও প্রাতিষ্ঠানিক শিক্ষা শিখছে।",
    reviewEn: "The teachers here teach with great care and dedication. In a disciplined and warm environment, my child is happily learning the Quran and academic education.",
    rating: 5,
    platform: "facebook",
    approved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "default-3",
    name: "আব্দুল করিম",
    nameEn: "Abdul Karim",
    relation: "অভিভাবক · নূরানী বিভাগ",
    relationEn: "Guardian · Noorani Dept",
    review: "মাদরাসার জেনারেল ও হিফজ সমন্বিত পাঠ্যক্রম অত্যন্ত প্রশংসনীয়। সন্তানকে এখানে রেখে আমি নিশ্চিত যে সে সঠিক ইসলামিক ও প্রাতিষ্ঠানিক শিক্ষা পাচ্ছে।",
    reviewEn: "The integrated general and Hifz curriculum is commendable. I am confident that my child is receiving proper Islamic and formal schooling.",
    rating: 5,
    platform: "google",
    approved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: "default-4",
    name: "সালমা আক্তার",
    nameEn: "Salma Akter",
    relation: "অভিভাবক · হিফজ সমাপনী",
    relationEn: "Guardian · Hifz Graduate",
    review: "আমার ছেলে এখান থেকে অল্প সময়ে অত্যন্ত সুনামের সাথে হিফজ সম্পন্ন করেছে। শিক্ষকদের নিবিড় তত্ত্বাবধানে সে সহীহ তাজবীদে কুরআন মুখস্থ করেছে। আমরা গর্বিত।",
    reviewEn: "My son completed his Hifz here with distinction. Under the close care of the teachers, he memorized the Quran with proper Tajweed. We are proud.",
    rating: 5,
    platform: "trustpilot",
    approved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
  {
    id: "default-5",
    name: "ইঞ্জিনিয়ার তানভীর আহমেদ",
    nameEn: "Engr. Tanvir Ahmed",
    relation: "অভিভাবক ও শুভানুধ্যায়ী",
    relationEn: "Guardian & Well-wisher",
    review: "মাদরাসার নিজস্ব ৫ তলা সুরম্য ভবন, সিসিটিভি নিরাপত্তা ও স্বাস্থ্যসম্মত পরিবেশ দেখে অত্যন্ত সন্তুষ্ট হয়েছি। বর্তমান সময়ে এমন আদর্শ ইসলামিক বিদ্যাপীঠ সত্যিই বিরল।",
    reviewEn: "Very impressed by the institution's own 5-story modern building, CCTV security, and hygienic environment. Truly a standout modern Islamic academy.",
    rating: 5,
    platform: "facebook",
    approved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: "default-6",
    name: "মাওলানা মুস্তাফিজুর রহমান",
    nameEn: "Mawlana Mustafizur Rahman",
    relation: "স্থানীয় বাসিন্দা ও অভিভাবক",
    relationEn: "Local Resident & Guardian",
    review: "ওস্তাদদের সুন্দর আখলাক এবং ছাত্রদের নিয়মিত তিলাওয়াত শুনলে মন জুড়িয়ে যায়। এলাকার সেরা ও বিশ্বস্ত মাদরাসা হিসেবে আননূর শিক্ষা পরিবার শীর্ষস্থানে রয়েছে।",
    reviewEn: "The exemplary character of the teachers and beautiful recitation of the students is truly inspiring. Annoor is undoubtedly the top trusted madrasa in the area.",
    rating: 5,
    platform: "google",
    approved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: "default-7",
    name: "ফারহানা ইয়াসমিন",
    nameEn: "Farhana Yasmin",
    relation: "হিফজ ও ইসলামিক শিক্ষা অভিভাবক",
    relationEn: "Hifz & Islamic Guardian",
    review: "মাদরাসার ওয়েবসাইট থেকে সরাসরি আবেদন করে ও যোগাযোগ করে খুবই চমৎকার অভিজ্ঞতা পেয়েছি। ভর্তি প্রক্রিয়া, নিয়মিত অগ্রগতি ও শিক্ষকদের সার্বক্ষণিক সহযোগিতা প্রশংসনীয়।",
    reviewEn: "A wonderful experience applying directly through the madrasa website. The transparent admission system and continuous care from teachers are truly commendable.",
    rating: 5,
    platform: "website",
    approved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: "default-8",
    name: "মাসুদ রানা",
    nameEn: "Masud Rana",
    relation: "অভিভাবক · নূরানী ও নাজেরা শাখা",
    relationEn: "Guardian · Noorani & Nazera",
    review: "অনলাইনে নিয়মিত পরীক্ষার রেজাল্ট, বার্ষিক সিলেবাস ও নোটিশ পাওয়া যায় যা আমাদের মতো কর্মজীবী অভিভাবকদের জন্য অনেক বড় স্বস্তি। আননূর শিক্ষা পরিবারের সফলতা কামনা করি।",
    reviewEn: "Getting exam results, syllabus, and notices directly online is a huge relief for working parents like us. Wishing Annoor continued success.",
    rating: 5,
    platform: "website",
    approved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
];

export const parsePlatformAndRelation = (
  relationEn?: string | null,
  relationBn?: string | null
): { platform: ReviewPlatform; relationEn: string; relationBn: string } => {
  const enStr = (relationEn || "").trim();
  const bnStr = (relationBn || "").trim();

  // Check prefix e.g. "google||Guardian"
  if (enStr.includes("||")) {
    const [p, ...rest] = enStr.split("||");
    const validPlatforms: ReviewPlatform[] = ["google", "facebook", "trustpilot", "website"];
    const platform = validPlatforms.includes(p.toLowerCase() as ReviewPlatform)
      ? (p.toLowerCase() as ReviewPlatform)
      : "google";
    return { platform, relationEn: rest.join("||").trim(), relationBn: bnStr };
  }

  // Fallback checks for keywords
  const combined = `${enStr} ${bnStr}`.toLowerCase();
  if (combined.includes("facebook") || combined.includes("ফেসবুক")) {
    return { platform: "facebook", relationEn: enStr || "Facebook Review", relationBn: bnStr || "ফেসবুক ব্যবহারকারী" };
  }
  if (combined.includes("trustpilot") || combined.includes("ট্রাস্টপাইলট")) {
    return { platform: "trustpilot", relationEn: enStr || "Trustpilot Review", relationBn: bnStr || "ট্রাস্টপাইলট ব্যবহারকারী" };
  }
  if (combined.includes("website") || combined.includes("ওয়েবসাইট")) {
    return { platform: "website", relationEn: enStr || "Direct Review", relationBn: bnStr || "সরাসরি মতামত" };
  }

  return { platform: "google", relationEn: enStr || "Guardian", relationBn: bnStr || "অভিভাবক" };
};

export const formatPlatformAndRelation = (platform: ReviewPlatform, relationEn: string): string => {
  return `${platform}||${relationEn || "Guardian"}`;
};

const REVIEWS_CACHE_KEY = "oasis_testimonials_cache";

export const getCachedReviews = (): Review[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REVIEWS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const setCachedReviews = (reviews: Review[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn("Failed to save reviews to localStorage", e);
  }
};

export const submitReview = async (review: Omit<Review, "id" | "approved" | "createdAt">): Promise<Review> => {
  const platform = review.platform || "website";
  const relationEnFormatted = formatPlatformAndRelation(platform, review.relationEn || "Guardian");

  const newReview: Review = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: review.name.trim(),
    relation: review.relation.trim(),
    relationEn: review.relationEn || "Guardian",
    review: review.review.trim(),
    reviewEn: review.reviewEn?.trim() || undefined,
    rating: review.rating || 5,
    platform,
    approved: false,
    createdAt: Date.now(),
  };

  // 1. Save to local storage cache so user submissions never get lost
  try {
    const cached = getCachedReviews();
    setCachedReviews([newReview, ...cached]);
  } catch (e) {
    console.warn("Local review caching failed:", e);
  }

  // 2. Insert into Supabase if available (do not chain .select().single() due to RLS unapproved restriction)
  try {
    const payload = {
      author_name: newReview.name,
      relation_title_bn: newReview.relation,
      relation_title_en: relationEnFormatted,
      review_text_bn: newReview.review,
      review_text_en: newReview.reviewEn || null,
      rating: newReview.rating,
      is_approved: false,
    };

    const { error } = await supabase.from("testimonials").insert([payload]);
    if (error) {
      console.warn("Supabase insert warning (cached locally):", error.message);
    }
  } catch (err) {
    console.warn("Supabase insert network/schema error:", err);
  }

  return newReview;
};

export const getApprovedReviews = async (): Promise<Review[]> => {
  let supabaseReviews: Review[] = [];
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      supabaseReviews = data.map((row: any) => {
        const parsed = parsePlatformAndRelation(row.relation_title_en, row.relation_title_bn);
        return {
          id: row.id,
          name: row.author_name,
          relation: row.relation_title_bn,
          relationEn: parsed.relationEn,
          review: row.review_text_bn,
          reviewEn: row.review_text_en || undefined,
          rating: row.rating || 5,
          platform: parsed.platform,
          approved: row.is_approved,
          createdAt: new Date(row.created_at).getTime(),
        };
      });
    }
  } catch (error) {
    console.warn("Failed to fetch testimonials from Supabase:", error);
  }

  const cachedApproved = getCachedReviews().filter((r) => r.approved);
  const existingIds = new Set(supabaseReviews.map((r) => r.id));
  const uniqueCached = cachedApproved.filter((r) => !existingIds.has(r.id));

  return [...supabaseReviews, ...uniqueCached];
};

export const getAllReviews = async (): Promise<Review[]> => {
  let supabaseReviews: Review[] = [];
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      supabaseReviews = data.map((row: any) => {
        const parsed = parsePlatformAndRelation(row.relation_title_en, row.relation_title_bn);
        return {
          id: row.id,
          name: row.author_name,
          relation: row.relation_title_bn,
          relationEn: parsed.relationEn,
          review: row.review_text_bn,
          reviewEn: row.review_text_en || undefined,
          rating: row.rating || 5,
          platform: parsed.platform,
          approved: row.is_approved,
          createdAt: new Date(row.created_at).getTime(),
        };
      });
    }
  } catch (error) {
    console.warn("Failed to fetch all reviews from Supabase:", error);
  }

  const cached = getCachedReviews();
  const existingIds = new Set(supabaseReviews.map((r) => r.id));
  const uniqueCached = cached.filter((r) => !existingIds.has(r.id));

  return [...supabaseReviews, ...uniqueCached];
};

export const approveReview = async (id: string): Promise<void> => {
  try {
    await supabase.from("testimonials").update({ is_approved: true }).eq("id", id);
  } catch (e) {
    console.warn("Supabase approve error:", e);
  }
  const cached = getCachedReviews();
  const updated = cached.map((r) => (r.id === id ? { ...r, approved: true } : r));
  setCachedReviews(updated);
};

export const deleteReview = async (id: string): Promise<void> => {
  try {
    await supabase.from("testimonials").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase delete error:", e);
  }
  const cached = getCachedReviews();
  const updated = cached.filter((r) => r.id !== id);
  setCachedReviews(updated);
};
