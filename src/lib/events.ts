import { supabase } from "@/lib/supabase/client";

export interface Event {
  id?: string;
  titleBn: string;
  titleEn: string;
  startDate: string;
  endDate?: string;
  type: "exam" | "holiday" | "event" | "other";
  descriptionBn?: string;
  descriptionEn?: string;
  createdAt: number;
}

const EVENTS_CACHE_KEY = "oasis_events_cache_v2";

const defaultEvents: Event[] = [
  {
    id: "evt-1",
    titleBn: "পবিত্র মাহে রমজান ও ঈদুল ফিতরের ছুটি",
    titleEn: "Holy Ramadan & Eid-ul-Fitr Vacation",
    startDate: "2026-03-01",
    endDate: "2026-03-25",
    type: "holiday",
    descriptionBn: "পবিত্র মাহে রমজান ও ঈদুল ফিতর উপলক্ষে মাদরাসার সকল শিক্ষা কার্যক্রম ছুটি থাকবে।",
    descriptionEn: "All academic activities will remain suspended for holy Ramadan and Eid-ul-Fitr.",
    createdAt: Date.now() - 100000,
  },
  {
    id: "evt-2",
    titleBn: "বার্ষিক হিফজ সমাপনী ও পাগড়ী প্রদান অনুষ্ঠান",
    titleEn: "Annual Hifz Graduation & Turban Awarding Ceremony",
    startDate: "2026-04-10",
    endDate: "2026-04-10",
    type: "event",
    descriptionBn: "হিফজুল কুরআন সম্পন্নকারী শিক্ষার্থীদের সম্মাননা পাগড়ী ও সনদ প্রদান করা হবে।",
    descriptionEn: "Turban and completion certificates will be presented to new Huffaz students.",
    createdAt: Date.now() - 90000,
  },
  {
    id: "evt-3",
    titleBn: "অর্ধবার্ষিক মূল্যায়ন পরীক্ষা ২০২৬",
    titleEn: "Half-Yearly Evaluation Exam 2026",
    startDate: "2026-05-15",
    endDate: "2026-05-28",
    type: "exam",
    descriptionBn: "নূরানী, নাজেরা ও সাধারণ শিক্ষার সকল শ্রেণির প্রথম পর্বের মূল্যায়ন পরীক্ষা অনুষ্ঠিত হবে।",
    descriptionEn: "First term assessment exams for all Nurani, Nazara, and general education classes.",
    createdAt: Date.now() - 80000,
  },
  {
    id: "evt-4",
    titleBn: "বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক উৎসব",
    titleEn: "Annual Sports & Cultural Festival",
    startDate: "2026-06-20",
    endDate: "2026-06-21",
    type: "event",
    descriptionBn: "উভয় ক্যাম্পাসের শিক্ষার্থীদের অংশগ্রহণে বার্ষিক ক্রীড়া ও কেরাত-হামদ-নাত প্রতিযোগিতা।",
    descriptionEn: "Annual sports and Quran recitation/Hamd-Naat competition for students of both campuses.",
    createdAt: Date.now() - 70000,
  },
];

const readEventsCache = (): Event[] => {
  if (typeof window === "undefined") {
    return defaultEvents;
  }
  try {
    const raw = window.localStorage.getItem(EVENTS_CACHE_KEY);
    if (!raw) {
      writeEventsCache(defaultEvents);
      return defaultEvents;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultEvents;
  } catch {
    return defaultEvents;
  }
};

const writeEventsCache = (items: Event[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("oasis-events-updated", { detail: items }));
  } catch {
    // ignore
  }
};

export const getEvents = async (): Promise<Event[]> => {
  try {
    // Try Supabase first if events table is available
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: Event[] = data.map((row: any) => ({
        id: String(row.id),
        titleBn: row.title_bn || row.title || "",
        titleEn: row.title_en || row.title || "",
        startDate: row.start_date || row.startDate || "",
        endDate: row.end_date || row.endDate || undefined,
        type: (row.type as Event["type"]) || "event",
        descriptionBn: row.description_bn || row.description || "",
        descriptionEn: row.description_en || "",
        createdAt: new Date(row.created_at || Date.now()).getTime(),
      }));
      writeEventsCache(mapped);
      return mapped;
    }
  } catch {
    // fallback to cache
  }

  return readEventsCache().sort((a, b) => a.startDate.localeCompare(b.startDate));
};

export const saveEvent = async (event: Omit<Event, "id" | "createdAt">): Promise<Event> => {
  const newId = "evt-" + Date.now();
  const newEvent: Event = {
    ...event,
    id: newId,
    createdAt: Date.now(),
  };

  try {
    const payload = {
      title_bn: event.titleBn,
      title_en: event.titleEn || event.titleBn,
      start_date: event.startDate,
      end_date: event.endDate || null,
      type: event.type,
      description_bn: event.descriptionBn || "",
      description_en: event.descriptionEn || "",
      is_published: true,
    };

    const { data, error } = await supabase
      .from("events")
      .insert([payload])
      .select()
      .maybeSingle();

    if (!error && data) {
      newEvent.id = String(data.id);
    }
  } catch (err) {
    console.warn("Supabase event insert failed, falling back to local cache:", err);
  }

  const current = readEventsCache();
  const updated = [...current.filter((e) => e.id !== newEvent.id), newEvent].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  writeEventsCache(updated);
  return newEvent;
};

export const updateEvent = async (id: string, updates: Partial<Omit<Event, "id">>): Promise<Event> => {
  const current = readEventsCache();
  const existing = current.find((e) => e.id === id);
  if (!existing) {
    throw new Error("Event not found");
  }

  const updatedEvent: Event = {
    ...existing,
    ...updates,
  };

  try {
    const payload: Record<string, any> = {};
    if (updates.titleBn !== undefined) payload.title_bn = updates.titleBn;
    if (updates.titleEn !== undefined) payload.title_en = updates.titleEn;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate;
    if (updates.endDate !== undefined) payload.end_date = updates.endDate || null;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.descriptionBn !== undefined) payload.description_bn = updates.descriptionBn;
    if (updates.descriptionEn !== undefined) payload.description_en = updates.descriptionEn;

    await supabase.from("events").update(payload).eq("id", id);
  } catch (err) {
    console.warn("Supabase event update failed, updating local cache:", err);
  }

  const updatedList = current.map((e) => (e.id === id ? updatedEvent : e)).sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  writeEventsCache(updatedList);
  return updatedEvent;
};

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await supabase.from("events").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase event delete failed:", err);
  }

  const current = readEventsCache();
  const filtered = current.filter((e) => e.id !== id);
  writeEventsCache(filtered);
};
