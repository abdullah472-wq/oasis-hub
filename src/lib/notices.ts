import { supabase, uploadCmsFile } from "@/lib/supabase/client";

export interface Notice {
  id?: string;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  pdfUrl?: string;
  createdAt: number;
}

const NOTICE_CACHE_KEY = "oasis_public_notices_v1";

const readNoticeCache = (): Notice[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(NOTICE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Notice[];
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => b.createdAt - a.createdAt)
      : [];
  } catch {
    return [];
  }
};

const writeNoticeCache = (items: Notice[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    NOTICE_CACHE_KEY,
    JSON.stringify(items.slice().sort((a, b) => b.createdAt - a.createdAt)),
  );
};

export const getNotices = async (): Promise<Notice[]> => {
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("is_published", true)
      .order("priority", { ascending: false })
      .order("published_at", { ascending: false });

    if (error) throw error;

    const mapped: Notice[] = (data || []).map((row: any) => ({
      id: row.id,
      titleBn: row.title_bn,
      titleEn: row.title_en || row.title_bn,
      descriptionBn: row.content_bn,
      descriptionEn: row.content_en || row.content_bn,
      pdfUrl: row.pdf_url || undefined,
      createdAt: new Date(row.published_at || row.created_at).getTime(),
    }));

    writeNoticeCache(mapped);
    return mapped;
  } catch (error) {
    console.warn("Falling back to cached notices:", error);
    return readNoticeCache();
  }
};

export const saveNotice = async (notice: Omit<Notice, "id" | "createdAt">): Promise<Notice> => {
  const payload = {
    title_bn: notice.titleBn,
    title_en: notice.titleEn || null,
    content_bn: notice.descriptionBn || "",
    content_en: notice.descriptionEn || null,
    pdf_url: notice.pdfUrl || null,
    is_published: true,
    published_at: new Date().toISOString().split("T")[0],
  };

  const { data, error } = await supabase.from("notices").insert([payload]).select().single();
  if (error) throw error;

  const saved: Notice = {
    id: data.id,
    titleBn: data.title_bn,
    titleEn: data.title_en || data.title_bn,
    descriptionBn: data.content_bn,
    descriptionEn: data.content_en || data.content_bn,
    pdfUrl: data.pdf_url || undefined,
    createdAt: new Date(data.created_at).getTime(),
  };

  writeNoticeCache([saved, ...readNoticeCache()]);
  return saved;
};

export const deleteNotice = async (id: string): Promise<void> => {
  await supabase.from("notices").delete().eq("id", id);
  writeNoticeCache(readNoticeCache().filter((item) => item.id !== id));
};

export const uploadPdf = async (file: File): Promise<string> => {
  return uploadCmsFile("cms-notices", file);
};

