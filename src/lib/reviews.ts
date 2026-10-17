import { supabase } from "@/lib/supabase/client";
import type { ReviewPlatform } from "@/types/cms";

export type { ReviewPlatform };

export interface Review {
  id?: string;
  name: string;
  relation: string;
  relationEn?: string;
  review: string;
  reviewEn?: string;
  rating?: number;
  platform?: ReviewPlatform;
  approved: boolean;
  createdAt: number;
}

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

export const submitReview = async (review: Omit<Review, "id" | "approved" | "createdAt">): Promise<Review> => {
  const platform = review.platform || "website";
  const relationEnFormatted = formatPlatformAndRelation(platform, review.relationEn || "Guardian");

  const payload = {
    author_name: review.name,
    relation_title_bn: review.relation,
    relation_title_en: relationEnFormatted,
    review_text_bn: review.review,
    review_text_en: review.reviewEn || null,
    rating: review.rating || 5,
    is_approved: false,
  };

  const { data, error } = await supabase.from("testimonials").insert([payload]).select().single();
  if (error) throw error;

  const parsed = parsePlatformAndRelation(data.relation_title_en, data.relation_title_bn);

  return {
    id: data.id,
    name: data.author_name,
    relation: data.relation_title_bn,
    relationEn: parsed.relationEn,
    review: data.review_text_bn,
    reviewEn: data.review_text_en || undefined,
    rating: data.rating || 5,
    platform: parsed.platform,
    approved: data.is_approved,
    createdAt: new Date(data.created_at).getTime(),
  };
};

export const getApprovedReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => {
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
  } catch (error) {
    console.warn("Failed to fetch testimonials from Supabase:", error);
    return [];
  }
};

export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => {
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
  } catch (error) {
    console.warn("Failed to fetch all reviews:", error);
    return [];
  }
};

export const approveReview = async (id: string): Promise<void> => {
  await supabase.from("testimonials").update({ is_approved: true }).eq("id", id);
};

export const deleteReview = async (id: string): Promise<void> => {
  await supabase.from("testimonials").delete().eq("id", id);
};
