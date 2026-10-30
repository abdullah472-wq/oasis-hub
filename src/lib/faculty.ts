import { supabase, logAdminActivity, ensureSupabaseAdminAuth } from "@/lib/supabase/client";
import type { FacultyMember, FacultyRoleCategory, CampusType } from "@/types/cms";

export type { FacultyMember, FacultyRoleCategory, CampusType };

/**
 * Auto-generates Teacher ID according to institutional formula:
 * Format: AT-[YY]-[NID]
 * A = Annoor, T = Tahfiz, YY = last two digits of join year, NID = National ID Card number
 * Example: AT-24-1235468452
 */
export const generateTeacherId = (
  joiningYear: string | number | undefined,
  nid: string | undefined
): string => {
  const cleanNid = (nid || "").replace(/\D/g, "").trim();
  const rawYear = String(joiningYear || new Date().getFullYear()).trim();
  const shortYear = rawYear.length >= 2 ? rawYear.slice(-2) : rawYear.padStart(2, "0");
  if (!cleanNid) {
    return `AT-${shortYear}-...`;
  }
  return `AT-${shortYear}-${cleanNid}`;
};

const FACULTY_CACHE_KEY = "oasis_faculty_cache_v2";

export const defaultFacultyList: FacultyMember[] = [
  // ================= MANAGEMENT & GOVERNING BODY =================
  {
    id: "fac-mgmt-1",
    name_bn: "মুফতি আব্দুল্লাহ আল মামুন",
    name_en: "Mufti Abdullah Al Mamon",
    designation_bn: "ম্যানেজার ও প্রতিষ্ঠাতা পরিচালক",
    designation_en: "Manager & Founding Director",
    category: "management",
    campus: "both",
    qualification_bn: "দাওরায়ে হাদিস ও উচ্চতর ইফতা, শিক্ষাবিদ ও ইসলামিক গবেষক",
    qualification_en: "Dawra-e-Hadith & Higher Ifta, Islamic Scholar",
    subject_bn: "সার্বিক প্রতিষ্ঠান ব্যবস্থাপনা ও পরিকল্পনা",
    subject_en: "Institutional Management & Planning",
    experience_bn: "১৫+ বছর শিক্ষা ব্যবস্থাপনা",
    experience_en: "15+ Years Education Administration",
    order_index: 1,
    is_active: true,
    phone: "01312200043",
    email: "manager@annoor.edu.bd",
    image_url: "/abdullah.png",
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-mgmt-2",
    name_bn: "হাফেজ আমানুল্লাহ",
    name_en: "Hafez Amanullah",
    designation_bn: "প্রধান শিক্ষক ও হিফজ প্রধান",
    designation_en: "Principal & Head of Hifz",
    category: "management",
    campus: "both",
    qualification_bn: "সনদপ্রাপ্ত আন্তর্জাতিক ক্বারী ও অভিজ্ঞ হাফেজে কুরআন",
    qualification_en: "Certified Qari & Senior Hafez-e-Quran",
    subject_bn: "শিক্ষা পরিচালনা ও হিফজ তত্ত্বাবধান",
    subject_en: "Academic Leadership & Hifz Care",
    experience_bn: "১৪+ বছর পাঠদান ও হিফজ পরিচালনা",
    experience_en: "14+ Years Academic Leadership",
    order_index: 2,
    is_active: true,
    phone: "01820-811511",
    email: "principal@annoor.edu.bd",
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-mgmt-3",
    name_bn: "প্রকৌশলী মোঃ সাজ্জাদ হোসেন",
    name_en: "Engr. Md. Sajjad Hossain",
    designation_bn: "মহাসচিব ও সহ-সভাপতি",
    designation_en: "Secretary General & Vice President",
    category: "management",
    campus: "both",
    qualification_bn: "বি.এসসি ইঞ্জিনিয়ার (বুয়েট), ম্যানেজমেন্ট উপদেষ্টা",
    qualification_en: "B.Sc. Engineering (BUET), Management Advisor",
    subject_bn: "ক্যাম্পাস অবকাঠামো ও প্রাতিষ্ঠানিক পলিসি",
    subject_en: "Campus Infrastructure & Policy",
    experience_bn: "১২+ বছর প্রাতিষ্ঠানিক উন্নয়ন",
    experience_en: "12+ Years Development",
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-mgmt-4",
    name_bn: "মাওলানা রফিকুল ইসলাম",
    name_en: "Mawlana Rafiqul Islam",
    designation_bn: "ভাইস প্রিন্সিপাল (শিক্ষা শাখা)",
    designation_en: "Vice Principal (Academic)",
    category: "management",
    campus: "both",
    qualification_bn: "দাওরায়ে হাদিস ও এম.এ (ইসলামিক স্টাডিজ, চ.বি)",
    qualification_en: "Dawra-e-Hadith & M.A. in Islamic Studies",
    subject_bn: "শিক্ষা কারিকুলাম ও শিক্ষক সমন্বয়",
    subject_en: "Curriculum & Faculty Coordination",
    experience_bn: "১০+ বছর শিক্ষক প্রশিক্ষণ",
    experience_en: "10+ Years Teacher Training",
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },

  // ================= BOYS CAMPUS TEACHERS =================
  {
    id: "fac-teach-b1",
    name_bn: "হাফেজ ক্বারী মোঃ ইউসুফ",
    name_en: "Hafez Qari Md. Yusuf",
    designation_bn: "প্রধান হিফজ প্রশিক্ষক (মুআল্লিমুল কুরআন)",
    designation_en: "Head of Quranic Hifz Section",
    category: "teacher",
    campus: "boys",
    qualification_bn: "আন্তর্জাতিক সনদপ্রাপ্ত হাফেজ ও ক্বারী, ক্বিরাত আসেমী",
    qualification_en: "Internationally Certified Hafez & Qari",
    subject_bn: "হিফজুল কুরআন ও তাজবীদ",
    subject_en: "Quran Hifz & Tajweed",
    experience_bn: "৯ বছর হিফজ প্রশিক্ষণ",
    experience_en: "9 Years Hifz Mentorship",
    order_index: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-teach-b2",
    name_bn: "মাওলানা মোঃ আব্দুল করিম",
    name_en: "Mawlana Md. Abdul Karim",
    designation_bn: "সিনিয়র শিক্ষক (আরবি ভাষা ও কিতাব)",
    designation_en: "Senior Teacher (Arabic & Literature)",
    category: "teacher",
    campus: "boys",
    qualification_bn: "দাওরায়ে হাদিস ও এম.এ (আরবি সাহিত্য, ঢা.বি)",
    qualification_en: "Dawra-e-Hadith & M.A. in Arabic (DU)",
    subject_bn: "আরবি ভাষা, ব্যাকরণ ও আদব",
    subject_en: "Arabic Language & Grammar",
    experience_bn: "৮ বছর পাঠদান",
    experience_en: "8 Years Teaching",
    order_index: 6,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-teach-b3",
    name_bn: "মোঃ হাসান আলী",
    name_en: "Md. Hasan Ali",
    designation_bn: "সিনিয়র গণিত শিক্ষক",
    designation_en: "Senior Mathematics Teacher",
    category: "teacher",
    campus: "boys",
    qualification_bn: "এম.এসসি (ফলিত গণিত), বি.এড",
    qualification_en: "M.Sc. in Applied Mathematics, B.Ed",
    subject_bn: "জেনারেল গণিত ও প্রাথমিক অলিম্পিয়াড",
    subject_en: "Mathematics & Math Olympiad",
    experience_bn: "৭ বছর পাঠদান",
    experience_en: "7 Years Teaching",
    order_index: 7,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-teach-b4",
    name_bn: "মোঃ তারেক আহমেদ",
    name_en: "Md. Tarek Ahmed",
    designation_bn: "ইংরেজি প্রভাষক ও Spoken English ট্রেইনার",
    designation_en: "English Lecturer & Spoken English Trainer",
    category: "teacher",
    campus: "boys",
    qualification_bn: "এম.এ (ইংরেজি ভাষা ও সাহিত্য), টিইএসওএল সার্টিফায়েড",
    qualification_en: "M.A. in English Literature, TESOL Certified",
    subject_bn: "ইংরেজি পাঠ্যক্রম ও যোগাযোগ দক্ষতা",
    subject_en: "English Grammar & Spoken Skills",
    experience_bn: "৬ বছর পাঠদান",
    experience_en: "6 Years Teaching",
    order_index: 8,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-teach-b5",
    name_bn: "মাওলানা মোঃ ফারুক হোসেন",
    name_en: "Mawlana Md. Faruk Hossain",
    designation_bn: "প্রধান নূরানী মোয়াল্লিম",
    designation_en: "Head of Nurani Section",
    category: "teacher",
    campus: "boys",
    qualification_bn: "কেন্দ্রীয় নূরানী প্রশিক্ষণপ্রাপ্ত সিনিয়র মোয়াল্লিম",
    qualification_en: "Centrally Certified Nurani Instructor",
    subject_bn: "নূরানী কায়দা, মাখরাজ ও বাংলা সাহিত্য",
    subject_en: "Nurani Basics, Makhraj & Bengali",
    experience_bn: "১০ বছর নূরানী শিক্ষকতা",
    experience_en: "10 Years Experience",
    order_index: 9,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-teach-b6",
    name_bn: "মোঃ রাশেদ ইসলাম",
    name_en: "Md. Rashed Islam",
    designation_bn: "সহকারী শিক্ষক (বিজ্ঞান ও আইসিটি)",
    designation_en: "Assistant Teacher (Science & ICT)",
    category: "teacher",
    campus: "boys",
    qualification_bn: "বি.এসসি (পদার্থবিজ্ঞান ও কম্পিউটার সায়েন্স)",
    qualification_en: "B.Sc. in Physics & Computer Science",
    subject_bn: "সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি",
    subject_en: "General Science & ICT",
    experience_bn: "৫ বছর পাঠদান",
    experience_en: "5 Years Teaching",
    order_index: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },



  // ================= ADMINISTRATIVE & SUPPORT STAFF =================
  {
    id: "fac-staff-1",
    name_bn: "মোঃ আশরাফুল আলম",
    name_en: "Md. Ashraful Alam",
    designation_bn: "প্রধান হিসাবরক্ষণ কর্মকর্তা (Accounts & Finance)",
    designation_en: "Chief Accounts & Finance Officer",
    category: "staff",
    campus: "both",
    qualification_bn: "এম.বি.এ (অ্যাকাউন্টিং অ্যান্ড ইনফরমেশন সিস্টেমস)",
    qualification_en: "M.B.A in Accounting & Information Systems",
    subject_bn: "ফি গ্রহণ, বেতন ও আর্থিক হিসাব ব্যবস্থাপনা",
    subject_en: "Student Fees & Financial Accounting",
    experience_bn: "৮ বছর অভিজ্ঞতা",
    experience_en: "8 Years Experience",
    order_index: 17,
    is_active: true,
    email: "accounts@annoor.edu.bd",
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-staff-2",
    name_bn: "মোঃ তানভীর হাসান",
    name_en: "Md. Tanvir Hasan",
    designation_bn: "আইটি ও অফিস নির্বাহী (IT & Admission Support)",
    designation_en: "IT & Admission Support Executive",
    category: "staff",
    campus: "both",
    qualification_bn: "বি.এসসি ইন সিএসই, ডেটা ম্যানেজমেন্ট এক্সপার্ট",
    qualification_en: "B.Sc. in CSE, Database Management Expert",
    subject_bn: "ওয়েবসাইট, অনলাইন ভর্তি ও ডিজিটাল রেকর্ড",
    subject_en: "Portal, Online Admission & Digital Records",
    experience_bn: "৪ বছর অভিজ্ঞতা",
    experience_en: "4 Years Experience",
    order_index: 18,
    is_active: true,
    email: "it@annoor.edu.bd",
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-staff-3",
    name_bn: "মাওলানা মোঃ জহিরুল হক",
    name_en: "Mawlana Md. Zahirul Haque",
    designation_bn: "হোস্টেল সুপার ও আবাসন তত্ত্বাবধায়ক",
    designation_en: "Hostel Super & Residential Warden",
    category: "staff",
    campus: "boys",
    qualification_bn: "দাওরায়ে হাদিস, আবাসিক ছাত্র কল্যাণ তত্ত্বাবধায়ক",
    qualification_en: "Dawra-e-Hadith, Student Welfare In-Charge",
    subject_bn: "আবাসিক ছাত্রদের খাদ্য, শয্যা ও স্বাস্থ্যসেবা পর্যবেক্ষণ",
    subject_en: "Boarding Care, Meals & Health Discipline",
    experience_bn: "৭ বছর অভিজ্ঞতা",
    experience_en: "7 Years Experience",
    order_index: 19,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fac-staff-4",
    name_bn: "মোঃ নুরুল ইসলাম",
    name_en: "Md. Nurul Islam",
    designation_bn: "লজিস্টিকস ও নিরাপত্তা প্রধান",
    designation_en: "Logistics & Campus Security Chief",
    category: "staff",
    campus: "both",
    qualification_bn: "সার্টিফায়েড সিকিউরিটি অ্যান্ড সেফটি প্রফেশনাল",
    qualification_en: "Certified Safety & Security Professional",
    subject_bn: "ক্যাম্পাস নিরাপত্তা, সিসিটিভি ও পরিবহন পর্যবেক্ষণ",
    subject_en: "Campus Safety, CCTV & Transport",
    experience_bn: "১০ বছর অভিজ্ঞতা",
    experience_en: "10 Years Experience",
    order_index: 20,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Local cache helpers
const getCachedFaculty = (): FacultyMember[] => {
  if (typeof window === "undefined") return defaultFacultyList;
  try {
    const raw = localStorage.getItem(FACULTY_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(FACULTY_CACHE_KEY, JSON.stringify(defaultFacultyList));
      return defaultFacultyList;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultFacultyList;
  } catch (err) {
    console.warn("Failed to read faculty from cache:", err);
    return defaultFacultyList;
  }
};

export const FACULTY_UPDATED_EVENT = "oasis_faculty_updated";

const saveFacultyToCache = (items: FacultyMember[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FACULTY_CACHE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(FACULTY_UPDATED_EVENT, { detail: items }));
    window.dispatchEvent(new StorageEvent("storage", { key: FACULTY_CACHE_KEY }));
  } catch (err) {
    console.warn("Failed to save faculty to cache:", err);
  }
};

// ================= FACULTY API =================

export async function getFacultyList(): Promise<FacultyMember[]> {
  try {
    const cached = getCachedFaculty();
    const cachedMap = new Map(cached.map((c) => [c.id, c]));

    const { data, error } = await supabase
      .from("faculty_members")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) {
      return cached;
    }

    const seenIds = new Set<string>();
    const mapped: FacultyMember[] = data.map((item: any, idx: number) => {
      seenIds.add(item.id);
      const existing = cachedMap.get(item.id);

      // If local cache has a newer update timestamp than DB (e.g. recent edit), preserve local edit
      if (existing?.updated_at && item.updated_at) {
        const cachedTime = new Date(existing.updated_at).getTime();
        const remoteTime = new Date(item.updated_at).getTime();
        if (cachedTime > remoteTime) {
          return existing;
        }
      }

      return {
        id: item.id || `fac-${idx}`,
        teacher_id:
          item.teacher_id ||
          existing?.teacher_id ||
          (existing?.nid ? generateTeacherId(existing?.joining_year, existing?.nid) : undefined),
        nid: item.nid || existing?.nid || undefined,
        joining_year: item.joining_year || existing?.joining_year || undefined,
        name_bn: item.name_bn || "",
        name_en: item.name_en || "",
        designation_bn: item.designation_bn || "",
        designation_en: item.designation_en || "",
        category: item.category === "teachers" ? "teacher" : (item.category || "teacher"),
        campus: item.campus || "both",
        qualification_bn: item.qualification_bn || "",
        qualification_en: item.qualification_en || "",
        subject_bn: item.subject_bn || "",
        subject_en: item.subject_en || "",
        experience_bn: item.experience_bn || "",
        experience_en: item.experience_en || "",
        image_url:
          item.image_url && !item.image_url.includes("example.com")
            ? item.image_url
            : (item.id === "fac-mgmt-1" || item.name_bn?.includes("আব্দুল্লাহ"))
              ? "/abdullah.png"
              : item.image_url || null,
        phone: item.phone || null,
        email: item.email || null,
        bio_bn: item.bio_bn || null,
        bio_en: item.bio_en || null,
        order_index: item.order_index ?? idx + 1,
        is_active: item.is_active ?? true,
        created_at: item.created_at || existing?.created_at,
        updated_at: item.updated_at || existing?.updated_at,
      };
    });

    // Also preserve any locally added members not yet synced to remote
    for (const localItem of cached) {
      if (!seenIds.has(localItem.id)) {
        mapped.push(localItem);
      }
    }

    saveFacultyToCache(mapped);
    return mapped;
  } catch (err) {
    console.warn("Using cached faculty list:", err);
    return getCachedFaculty();
  }
}

export async function saveFacultyMember(
  item: Omit<FacultyMember, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<FacultyMember> {
  const current = getCachedFaculty();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `fac-${Date.now()}`;

  const computedTeacherId =
    item.teacher_id?.trim() ||
    (item.nid ? generateTeacherId(item.joining_year, item.nid) : undefined);

  const nowIso = new Date().toISOString();
  const prepared: FacultyMember = {
    ...item,
    id: targetId,
    teacher_id: computedTeacherId,
    nid: item.nid?.trim() || undefined,
    joining_year: item.joining_year?.trim() || undefined,
    order_index: item.order_index ?? (current.length + 1),
    is_active: item.is_active ?? true,
    updated_at: nowIso,
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || nowIso
      : nowIso,
  };

  // 1. Instantly update local cache and broadcast update so page updates immediately
  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [...current, prepared];
  saveFacultyToCache(updatedList);

  // 2. Map 'teacher' in frontend to 'teachers' for DB schema check constraint
  const dbCategory = prepared.category === "teacher" ? "teachers" : prepared.category;

  const dbPayload = {
    id: prepared.id,
    name_bn: prepared.name_bn,
    name_en: prepared.name_en || null,
    designation_bn: prepared.designation_bn,
    designation_en: prepared.designation_en || null,
    category: dbCategory,
    campus: prepared.campus || "both",
    qualification_bn: prepared.qualification_bn || null,
    qualification_en: prepared.qualification_en || null,
    subject_bn: prepared.subject_bn || null,
    subject_en: prepared.subject_en || null,
    experience_bn: prepared.experience_bn || null,
    experience_en: prepared.experience_en || null,
    image_url: prepared.image_url || null,
    phone: prepared.phone || null,
    email: prepared.email || null,
    order_index: prepared.order_index,
    is_active: prepared.is_active,
    updated_at: prepared.updated_at,
  };

  // 3. Ensure authenticated session for Supabase RLS
  await ensureSupabaseAdminAuth();

  try {
    let { error: upsertError } = await supabase
      .from("faculty_members")
      .upsert(dbPayload);

    // If RLS permission error (42501), retry after explicitly re-authenticating
    if (upsertError && upsertError.code === "42501") {
      const authed = await ensureSupabaseAdminAuth();
      if (authed) {
        const retry = await supabase.from("faculty_members").upsert(dbPayload);
        upsertError = retry.error;
      }
    }

    if (upsertError) {
      console.error("Supabase upsert faculty error:", upsertError);
      throw new Error(upsertError.message || "ডাটাবেজে সেভ করতে সমস্যা হয়েছে");
    }
  } catch (err: any) {
    console.error("Failed to save faculty to Supabase:", err);
    throw err;
  }

  void logAdminActivity(
    isEditing ? "UPDATE" : "CREATE",
    "faculty_members",
    `${isEditing ? "Updated" : "Added"} member: ${prepared.name_bn} (${prepared.designation_bn})`
  );

  return prepared;
}

export async function deleteFacultyMember(id: string): Promise<void> {
  const current = getCachedFaculty();
  const deletedItem = current.find((c) => c.id === id);

  // 1. Immediately update local cache
  const filtered = current.filter((c) => c.id !== id);
  saveFacultyToCache(filtered);

  // 2. Ensure admin auth and delete from database
  await ensureSupabaseAdminAuth();

  try {
    let { error } = await supabase.from("faculty_members").delete().eq("id", id);
    if (error && error.code === "42501") {
      const authed = await ensureSupabaseAdminAuth();
      if (authed) {
        const retry = await supabase.from("faculty_members").delete().eq("id", id);
        error = retry.error;
      }
    }
    if (error) {
      console.error("Supabase delete faculty error:", error);
      throw new Error(error.message || "Failed to delete member");
    }
  } catch (err: any) {
    console.error("Delete faculty error:", err);
    throw err;
  }

  void logAdminActivity(
    "DELETE",
    "faculty_members",
    `Deleted member: ${deletedItem?.name_bn || id}`
  );
}
