import { supabase } from "@/lib/supabase/client";

export interface Review {
  id?: string;
  name: string;
  relation: string;
  review: string;
  reviewEn?: string;
  approved: boolean;
  createdAt: number;
}

export const submitReview = async (review: Omit<Review, "id" | "approved" | "createdAt">): Promise<Review> => {
  const payload = {
    author_name: review.name,
    relation_title_bn: review.relation,
    review_text_bn: review.review,
    review_text_en: review.reviewEn || null,
    rating: 5,
    is_approved: false,
  };

  const { data, error } = await supabase.from("testimonials").insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    name: data.author_name,
    relation: data.relation_title_bn,
    review: data.review_text_bn,
    reviewEn: data.review_text_en || undefined,
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

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.author_name,
      relation: row.relation_title_bn,
      review: row.review_text_bn,
      reviewEn: row.review_text_en || undefined,
      approved: row.is_approved,
      createdAt: new Date(row.created_at).getTime(),
    }));
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

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.author_name,
      relation: row.relation_title_bn,
      review: row.review_text_bn,
      reviewEn: row.review_text_en || undefined,
      approved: row.is_approved,
      createdAt: new Date(row.created_at).getTime(),
    }));
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
