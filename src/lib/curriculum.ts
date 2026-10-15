import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { CurriculumProgram } from "@/types/cms";

export type { CurriculumProgram };

const CURRICULUM_CACHE_KEY = "oasis_curriculum_cache_v1";

export const defaultCurriculums: CurriculumProgram[] = [
  {
    id: "curr-nurani",
    department_bn: "নূরানী বিভাগ (প্লে - ২য় শ্রেণি)",
    department_en: "Nurani Section (Play - Grade 2)",
    category: "nurani",
    age_group_bn: "৪ - ৭ বছর",
    age_group_en: "4 - 7 Years",
    duration_bn: "৩ বছর মেয়াদী",
    duration_en: "3 Years Course",
    description_bn:
      "কোমলমতি শিশুদের শৈশবেই পবিত্র কুরআনুল কারীমের সহীহ তেলাওয়াত, মাখরাজ ও তাজবীদের বুনিয়াদ গঠনের সাথে আধুনিক বাংলা, ইংরেজি, গণিত ও নৈতিক আদব-আখলাকের সমন্বিত পাঠদান।",
    description_en:
      "Providing young learners with correct Quranic pronunciation and Tajweed foundations integrated with modern Bengali, English, mathematics, and Islamic character building.",
    subjects_bn: [
      "নূরানী কায়দা ও আমপারা সহীহ মাখরাজ",
      "তাজবীদ ও মাসনূন দু'আ",
      "বাংলা বর্ণ ও প্রাথমিক শব্দ গঠন",
      "ইংরেজি বর্ণমালা ও বেসিক Spoken",
      "প্রাথমিক সংখ্যা গণনা ও গণিত",
      "আদব, আখলাক ও ইসলামিক সাধারণ জ্ঞান",
    ],
    subjects_en: [
      "Nurani Qaida & Ampara with accurate Makhraj",
      "Tajweed and Daily Masnoon Duas",
      "Bengali Alphabets & Word Formation",
      "English Alphabets & Basic Spoken English",
      "Elementary Numeracy & Mathematics",
      "Manners, Ethics & Islamic General Knowledge",
    ],
    features_bn: [
      "ক্লাসের পড়া ক্লাসেই সম্পূর্ণ মুখস্থ ও আদায়",
      "খেলার ছলে আনন্দঘন ও মমতাময় পাঠদান পরিবেশ",
      "হাতের লেখা সুন্দরকরণে বিশেষ হ্যান্ডরাইটিং প্রশিক্ষণ",
      "সম্পূর্ণ শারীরিক ও মানসিক নির্যাতনমুক্ত আধুনিক ক্লাসরুম",
    ],
    features_en: [
      "Lessons completed and memorized entirely in class",
      "Joyful and caring play-based learning environment",
      "Special handwriting improvement training",
      "Completely abuse-free and nurturing atmosphere",
    ],
    order_index: 1,
    is_active: true,
    created_at: new Date(Date.now() - 1000000).toISOString(),
  },
  {
    id: "curr-nazara",
    department_bn: "নাজেরা ও কিরাত বিভাগ",
    department_en: "Nazara & Qirat Section",
    category: "nazara",
    age_group_bn: "৬ - ১০ বছর",
    age_group_en: "6 - 10 Years",
    duration_bn: "১ - ২ বছর মেয়াদী",
    duration_en: "1 - 2 Years Course",
    description_bn:
      "পূর্ণাঙ্গ ৩০ পারা কুরআন মাজিদ সহীহ লাহনে দ্রুত, সাবলীল ও নির্ভুলভাবে তিলাওয়াত প্রশিক্ষণ এবং আন্তর্জাতিক ক্বারীদের পদ্ধতিতে মাখরাজ ও সুরচর্চা।",
    description_en:
      "Fluency training for reciting the entire 30 paras of the Quran accurately with sweet melody according to classical Tajweed principles.",
    subjects_bn: [
      "পূর্ণাঙ্গ ৩০ পারা কুরআনুল কারীম নাজেরা",
      "তাজবীদের গভীর ব্যবহারিক অনুশীলন",
      "কিরাত ও আন্তর্জাতিক সুর প্রশিক্ষণ",
      "ফরজ ও ওয়াজিব নামাজ-রোজার আহকাম শিক্ষা",
      "দৈনন্দিন হাদিস ও শিষ্টাচার চর্চা",
    ],
    subjects_en: [
      "Complete 30 Paras Quran Nazara Recitation",
      "Deep Practical Application of Tajweed",
      "Melodious Recitation & Qirat Training",
      "Core Islamic Jurisprudence (Fiqh Basics)",
      "Daily Hadith & Character Practices",
    ],
    features_bn: [
      "আন্তর্জাতিক ক্বারীদের পদ্ধতিতে শুদ্ধ উচ্চারণ আয়ত্তকরণ",
      "জাতীয় ও আন্তর্জাতিক কিরাত প্রতিযোগিতার প্রস্তুতি",
      "নিয়মিত তিলাওয়াত অডিও রেকর্ডিং ও পর্যবেক্ষণ",
      "হিফজ বিভাগে উত্তীর্ণের জন্য বিশেষ প্রস্তুতিমূলক গাইডেন্স",
    ],
    features_en: [
      "Mastery of pure classical Arabic phonetic articulation",
      "Preparation for national & international Qirat competitions",
      "Regular audio recording and recitation refinement",
      "Special fast-track preparatory guidance for Hifz section",
    ],
    order_index: 2,
    is_active: true,
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "curr-hifz",
    department_bn: "আন্তর্জাতিক হিফজুল কুরআন বিভাগ",
    department_en: "International Hifzul Quran Section",
    category: "hifz",
    age_group_bn: "৭ - ১৪ বছর",
    age_group_en: "7 - 14 Years",
    duration_bn: "২ - ৩ বছর মেয়াদী",
    duration_en: "2 - 3 Years Course",
    description_bn:
      "আধুনিক ও মনস্তাত্ত্বিক বৈজ্ঞানিক পদ্ধতিতে স্বল্প সময়ে পূর্ণ কুরআন মুখস্থকরণ এবং আজীবন স্মৃতিতে সুরক্ষিত রাখার জন্য বিশেষ দাওর (রিভিশন) ও শুনানির সার্বক্ষণিক ব্যবস্থা।",
    description_en:
      "Advanced and psychologically paced memorization of the Holy Quran with intensive revision cycles ensuring lifetime retention.",
    subjects_bn: [
      "হিফজুল কুরআন (দৈনিক নতুন সবক)",
      "সবকপারা (সাম্প্রতিক ৫-১০ পারার রিভিশন)",
      "আমপারা ও আমদাওর (পূর্ববর্তী সম্পূর্ণ পারার শুনানি)",
      "হুদুর ও তারতীল সহকারে তিলাওয়াত",
      "স্পোকেন আরবি ও ইংরেজি কথোপকথন",
      "জরুরি দ্বীনি মাসায়েল ও আকাইদ",
    ],
    subjects_en: [
      "Hifz (Daily new memorization lesson)",
      "Sabaq Para (Recent portions revision)",
      "Am Dour (Full-course continuous revision)",
      "Recitation with Tartil and presence of mind",
      "Spoken Arabic & Spoken English",
      "Essential Islamic Creed & Practical Rulings",
    ],
    features_bn: [
      "দৈনিক ৩ বেলা নির্দিষ্ট সময়ে সবক ও নিয়মিত শুনানি",
      "অভিজ্ঞ আন্তর্জাতিক মানের হাফেজ শিক্ষকদের সার্বক্ষণিক তত্ত্বাবধান",
      "জাতীয় ও আন্তর্জাতিক হিফজ প্রতিযোগিতায় অংশগ্রহণ ও পুরস্কার অর্জন",
      "প্রতি বছর নতুন হাফেজ শিক্ষার্থীদের রাজকীয় পাগড়ী ও সম্মাননা প্রদান",
    ],
    features_en: [
      "3-tier structured daily recitation and listening checkpoints",
      "Round-the-clock guidance by experienced certified Huffaz teachers",
      "Participation in prestigious national & global Quran contests",
      "Annual grand convocation and turban honor for graduating Huffaz",
    ],
    order_index: 3,
    is_active: true,
    created_at: new Date(Date.now() - 800000).toISOString(),
  },
  {
    id: "curr-general",
    department_bn: "জেনারেল সমন্বিত শিক্ষা বিভাগ (দ্বিমুখী কারিকুলাম)",
    department_en: "Integrated General Education Section",
    category: "general",
    age_group_bn: "৬ - ১২ বছর",
    age_group_en: "6 - 12 Years",
    duration_bn: "শ্রেণিভিত্তিক (১ম - ৫ম শ্রেণি)",
    duration_en: "Grade-wise (Class 1 - Class 5)",
    description_bn:
      "জাতীয় শিক্ষাক্রমের আলোকে বাংলা, ইংরেজি, গণিত ও বিজ্ঞানের সাথে দ্বীনি শিক্ষার যুগোপযোগী অপূর্ব মেলবন্ধন, যাতে শিক্ষার্থীরা দ্বীন ও আধুনিক উভয় শিক্ষায় সমানভাবে পারদর্শী হয়।",
    description_en:
      "Bridging the national primary curriculum (Bengali, English, Math, Science) with Islamic values to cultivate well-rounded leadership.",
    subjects_bn: [
      "বাংলা সাহিত্য, ব্যাকরণ ও রচনা লিখন",
      "English for Today & Communicative Spoken English",
      "প্রাথমিক গণিত ও জ্যামিতি ধারণা",
      "বাংলাদেশ ও বিশ্বপরিচয় এবং প্রাথমিক বিজ্ঞান",
      "প্রাথমিক কম্পিউটার ও আইসিটি ধারণা",
      "ইসলাম ও নৈতিক শিক্ষা",
    ],
    subjects_en: [
      "Bengali Literature, Grammar & Writing Skills",
      "English for Today & Communicative Spoken English",
      "Mathematics & Foundational Geometry",
      "General Science & Bangladesh Studies",
      "Basic Computer & Digital Literacy",
      "Islamic Studies & Moral Education",
    ],
    features_bn: [
      "স্পোকেন ইংলিশ ও স্পোকেন আরবি নিয়মিত বিশেষ ক্লাস",
      "কোনো প্রাইভেট টিউশনি বা আলাদা কোচিংয়ের প্রয়োজন নেই",
      "সৃজনশীল মেধা বিকাশ, সাধারণ জ্ঞান কুইজ ও বিতর্ক প্রতিযোগিতা",
      "বার্ষিক বিজ্ঞান মেলা ও শিক্ষাসফরে অংশগ্রহণ",
    ],
    features_en: [
      "Dedicated spoken English and Arabic interactive sessions",
      "Complete tutoring in-house with zero external coaching needed",
      "Creative talent development, quizzes, and debate competitions",
      "Annual science exhibition and educational exposure tours",
    ],
    order_index: 4,
    is_active: true,
    created_at: new Date(Date.now() - 700000).toISOString(),
  },
  {
    id: "curr-tarbiya",
    department_bn: "তারবিয়াত, আদব ও শিষ্টাচার বিভাগ",
    department_en: "Tarbiya & Character Excellence Section",
    category: "tarbiya",
    age_group_bn: "সকল শ্রেণির শিক্ষার্থীদের জন্য",
    age_group_en: "For all enrolled students",
    duration_bn: "সার্বক্ষণিক নিয়মিত অনুশীলন",
    duration_en: "Continuous Daily Practice",
    description_bn:
      "সুন্নতী পোশাক, মার্জিত ভাষা, পিতা-মাতা ও শিক্ষকের প্রতি অকৃত্রিম শ্রদ্ধা, সময়ানুবর্তিতা এবং উন্নত চরিত্রের অধিকারী সোনার মানুষ হিসেবে গড়ে তোলার বিশেষ চারিত্রিক প্রশিক্ষণ।",
    description_en:
      "Nurturing courteous behavior, prophetic manners, punctuality, and deep respect for parents and teachers to build exemplary citizens.",
    subjects_bn: [
      "সুন্নতি জীবনযাপন ও দৈনন্দিন আদব-শিষ্টাচার",
      "তাহাজ্জুদ, পাঁচ ওয়াক্ত জামাতে নামাজ ও জিকির-আজকার",
      "উত্তম চরিত্র ও রাসূলুল্লাহ (সা.)-এর জীবনী (সীরাত)",
      "পরিচ্ছন্নতা, স্বাস্থ্যবিধি ও প্রাথমিক ফার্স্ট এইড",
      "সামাজিক দায়িত্ববোধ ও পরোপকার",
    ],
    subjects_en: [
      "Prophetic Lifestyle & Daily Etiquettes",
      "Congregational Prayers, Tahajjud & Remembrance of Allah",
      "Noble Character & Seerah of Prophet Muhammad (PBUH)",
      "Personal Hygiene, Cleanliness & Health Habits",
      "Social Responsibility & Civic Consciousness",
    ],
    features_bn: [
      "সার্বক্ষণিক সুন্নতি আমল ও আধ্যাত্মিক পরিবেশ",
      "শিক্ষক-শিক্ষার্থীর অত্যন্ত সৌহার্দ্যপূর্ণ ও আন্তরিক সম্পর্ক",
      "মোবাইল ও ক্ষতিকর সোশ্যাল মিডিয়া মুক্ত আনন্দময় শৈশব",
      "দৈনিক বিকেলে শিক্ষক তত্ত্বাবধানে স্বাস্থ্যসম্মত খেলাধুলা",
    ],
    features_en: [
      "Vibrant spiritual atmosphere guided by Sunnah values",
      "Warm mentorship and affectionate student-teacher bonds",
      "Screen-free, healthy and wholesome childhood environment",
      "Supervised afternoon sports for physical vitality",
    ],
    order_index: 5,
    is_active: true,
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
];

const readCurriculumCache = (): CurriculumProgram[] => {
  if (typeof window === "undefined") {
    return defaultCurriculums;
  }
  try {
    const raw = window.localStorage.getItem(CURRICULUM_CACHE_KEY);
    if (!raw) {
      writeCurriculumCache(defaultCurriculums);
      return defaultCurriculums;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCurriculums;
  } catch {
    return defaultCurriculums;
  }
};

const writeCurriculumCache = (items: CurriculumProgram[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CURRICULUM_CACHE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("oasis-curriculum-updated", { detail: items }));
  } catch {
    // ignore
  }
};

export const getCurriculums = async (): Promise<CurriculumProgram[]> => {
  try {
    const { data, error } = await supabase
      .from("curriculum")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: CurriculumProgram[] = data.map((row: any) => ({
        id: String(row.id),
        department_bn: row.department_bn || row.title_bn || "",
        department_en: row.department_en || row.title_en || "",
        category: row.category || "general",
        age_group_bn: row.age_group_bn || "",
        age_group_en: row.age_group_en || "",
        duration_bn: row.duration_bn || "",
        duration_en: row.duration_en || "",
        description_bn: row.description_bn || "",
        description_en: row.description_en || "",
        subjects_bn: Array.isArray(row.subjects_bn) ? row.subjects_bn : [],
        subjects_en: Array.isArray(row.subjects_en) ? row.subjects_en : [],
        features_bn: Array.isArray(row.features_bn) ? row.features_bn : [],
        features_en: Array.isArray(row.features_en) ? row.features_en : [],
        order_index: Number(row.order_index) || 0,
        is_active: row.is_active !== false,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at,
      }));
      writeCurriculumCache(mapped);
      return mapped;
    }
  } catch {
    // fallback to cache
  }

  return readCurriculumCache().sort((a, b) => a.order_index - b.order_index);
};

export const saveCurriculum = async (
  item: Omit<CurriculumProgram, "id" | "created_at"> & { id?: string }
): Promise<CurriculumProgram> => {
  const current = readCurriculumCache();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `curr-${Date.now()}`;

  const savedItem: CurriculumProgram = {
    ...item,
    id: targetId,
    order_index: item.order_index || (isEditing ? item.order_index : current.length + 1),
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const payload = {
      department_bn: savedItem.department_bn,
      department_en: savedItem.department_en,
      category: savedItem.category,
      age_group_bn: savedItem.age_group_bn,
      age_group_en: savedItem.age_group_en,
      duration_bn: savedItem.duration_bn,
      duration_en: savedItem.duration_en,
      description_bn: savedItem.description_bn,
      description_en: savedItem.description_en,
      subjects_bn: savedItem.subjects_bn,
      subjects_en: savedItem.subjects_en,
      features_bn: savedItem.features_bn,
      features_en: savedItem.features_en,
      order_index: savedItem.order_index,
      is_active: savedItem.is_active,
      updated_at: new Date().toISOString(),
    };

    if (isEditing) {
      const { data, error } = await supabase
        .from("curriculum")
        .update(payload)
        .eq("id", targetId)
        .select()
        .maybeSingle();

      if (!error && data) {
        savedItem.id = String(data.id);
      }
    } else {
      const { data, error } = await supabase
        .from("curriculum")
        .insert([payload])
        .select()
        .maybeSingle();

      if (!error && data) {
        savedItem.id = String(data.id);
      }
    }

    void logAdminActivity(
      isEditing ? "UPDATE" : "CREATE",
      "curriculum",
      `${isEditing ? "কারিকুলাম আপডেট" : "নতুন কারিকুলাম যুক্ত"}: "${savedItem.department_bn}"`
    );
  } catch {
    // fallback cache handled below
  }

  let updatedList: CurriculumProgram[];
  if (isEditing) {
    updatedList = current.map((c) => (c.id === targetId ? savedItem : c));
  } else {
    updatedList = [...current, savedItem];
  }

  writeCurriculumCache(updatedList);
  return savedItem;
};

export const deleteCurriculum = async (id: string): Promise<boolean> => {
  const current = readCurriculumCache();
  const deletedItem = current.find((c) => c.id === id);

  try {
    const { error } = await supabase.from("curriculum").delete().eq("id", id);
    if (!error && deletedItem) {
      void logAdminActivity(
        "DELETE",
        "curriculum",
        `কারিকুলাম মুছে ফেলা: "${deletedItem.department_bn}"`
      );
    }
  } catch {
    // fallback
  }

  const updatedList = current.filter((c) => c.id !== id);
  writeCurriculumCache(updatedList);
  return true;
};

export const toggleCurriculumStatus = async (id: string, isActive: boolean): Promise<boolean> => {
  const current = readCurriculumCache();
  const target = current.find((c) => c.id === id);
  if (!target) return false;

  const updatedItem: CurriculumProgram = {
    ...target,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };

  try {
    await supabase
      .from("curriculum")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);
  } catch {
    // fallback
  }

  const updatedList = current.map((c) => (c.id === id ? updatedItem : c));
  writeCurriculumCache(updatedList);
  return true;
};
