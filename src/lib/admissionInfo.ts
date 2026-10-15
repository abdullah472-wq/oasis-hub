import { supabase, logAdminActivity } from "@/lib/supabase/client";
import type { FeeStructureItem, AdmissionRuleItem } from "@/types/cms";

export type { FeeStructureItem, AdmissionRuleItem };

const FEES_CACHE_KEY = "oasis_admission_fees_cache_v1";
const RULES_CACHE_KEY = "oasis_admission_rules_cache_v1";

export const defaultFeeItems: FeeStructureItem[] = [
  {
    id: "fee-tuition-day",
    type_bn: "মাসিক টিউশন (অনাবাসিক)",
    type_en: "Monthly Tuition (Non-residential)",
    amount_bn: "৳১,০০০ — ৳২,৫০০",
    amount_en: "৳1,000 — ৳2,500",
    note_bn: "ক্লাস অনুযায়ী",
    note_en: "Varies by class and grade",
    category: "tuition",
    highlight: false,
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fee-tuition-board",
    type_bn: "মাসিক টিউশন (আবাসিক)",
    type_en: "Monthly Tuition (Residential / Boarding)",
    amount_bn: "৳৫,০০০ — ৳৯,০০০",
    amount_en: "৳5,000 — ৳9,000",
    note_bn: "আবাসিক সুবিধাসহ",
    note_en: "Includes 3 wholesome meals & boarding",
    category: "tuition",
    highlight: true,
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fee-admission",
    type_bn: "ভর্তি ফি",
    type_en: "Admission Fee",
    amount_bn: "৳৩,০০০",
    amount_en: "৳3,000",
    note_bn: "এককালীন",
    note_en: "One-time at enrollment",
    category: "admission",
    highlight: false,
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fee-exam",
    type_bn: "পরীক্ষা ফি",
    type_en: "Exam Fee",
    amount_bn: "৳৮০ — ৳৫০০",
    amount_en: "৳80 — ৳500",
    note_bn: "প্রতি পরীক্ষায়, ক্লাস অনুযায়ী",
    note_en: "Per exam term, varies by class",
    category: "exam",
    highlight: false,
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "fee-other",
    type_bn: "অন্যান্য",
    type_en: "Other Expenses",
    amount_bn: "প্রযোজ্য",
    amount_en: "Applicable",
    note_bn: "বই, ড্রেস, পরিবহন",
    note_en: "Books, uniform dress, transportation",
    category: "other",
    highlight: false,
    order_index: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const defaultAdmissionRules: AdmissionRuleItem[] = [
  {
    id: "rule-exam",
    rule_bn: "শিক্ষার্থীকে অবশ্যই ভর্তি পরীক্ষায় উত্তীর্ণ হতে হবে",
    rule_en: "Student must pass the mandatory admission test",
    type: "rule",
    is_required: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-cert",
    rule_bn: "পূর্ববর্তী শ্রেণির সনদপত্র প্রয়োজন (যদি থাকে)",
    rule_en: "Previous class certificate / transfer certificate required (if available)",
    type: "document",
    is_required: false,
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-photo",
    rule_bn: "শিক্ষার্থীর ২ কপি পাসপোর্ট সাইজ ছবি",
    rule_en: "2 passport-size color photographs of the student",
    type: "document",
    is_required: true,
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-birth-cert",
    rule_bn: "জন্ম নিবন্ধন সনদের কপি",
    rule_en: "Copy of student's official digital birth certificate",
    type: "document",
    is_required: true,
    order_index: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-guardian-nid",
    rule_bn: "অভিভাবকের জাতীয় পরিচয়পত্রের কপি ও ২ কপি পাসপোর্ট সাইজ ছবি",
    rule_en: "Copy of guardian's National ID (NID) and 2 passport-size photos",
    type: "document",
    is_required: true,
    order_index: 5,
    created_at: new Date().toISOString(),
  },
];

// Local cache helpers
const getCachedFees = (): FeeStructureItem[] => {
  if (typeof window === "undefined") return defaultFeeItems;
  try {
    const raw = localStorage.getItem(FEES_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(FEES_CACHE_KEY, JSON.stringify(defaultFeeItems));
      return defaultFeeItems;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultFeeItems;
  } catch (err) {
    console.warn("Failed to read fees from cache:", err);
    return defaultFeeItems;
  }
};

const saveFeesToCache = (items: FeeStructureItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FEES_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to write fees to cache:", err);
  }
};

const getCachedRules = (): AdmissionRuleItem[] => {
  if (typeof window === "undefined") return defaultAdmissionRules;
  try {
    const raw = localStorage.getItem(RULES_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(RULES_CACHE_KEY, JSON.stringify(defaultAdmissionRules));
      return defaultAdmissionRules;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAdmissionRules;
  } catch (err) {
    console.warn("Failed to read admission rules from cache:", err);
    return defaultAdmissionRules;
  }
};

const saveRulesToCache = (items: AdmissionRuleItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RULES_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to write admission rules to cache:", err);
  }
};

// ================= FEE ITEMS API =================

export async function getFeeItems(): Promise<FeeStructureItem[]> {
  try {
    const { data, error } = await supabase
      .from("fee_structures")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) {
      return getCachedFees();
    }

    const mapped: FeeStructureItem[] = data.map((item: any, idx: number) => ({
      id: item.id || `fee-${idx}`,
      type_bn: item.type_bn || "",
      type_en: item.type_en || "",
      amount_bn: item.amount_bn || "",
      amount_en: item.amount_en || "",
      note_bn: item.note_bn || "",
      note_en: item.note_en || "",
      category: item.category || "tuition",
      highlight: Boolean(item.highlight),
      order_index: item.order_index ?? idx + 1,
      is_active: item.is_active ?? true,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    saveFeesToCache(mapped);
    return mapped;
  } catch (err) {
    console.warn("Using fallback cached fee items:", err);
    return getCachedFees();
  }
}

export async function saveFeeItem(
  item: Omit<FeeStructureItem, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<FeeStructureItem> {
  const current = getCachedFees();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `fee-${Date.now()}`;

  const prepared: FeeStructureItem = {
    ...item,
    id: targetId,
    order_index: item.order_index ?? (current.length + 1),
    is_active: item.is_active ?? true,
    updated_at: new Date().toISOString(),
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
  };

  try {
    await supabase.from("fee_structures").upsert({
      id: prepared.id,
      type_bn: prepared.type_bn,
      type_en: prepared.type_en,
      amount_bn: prepared.amount_bn,
      amount_en: prepared.amount_en,
      note_bn: prepared.note_bn,
      note_en: prepared.note_en,
      category: prepared.category,
      highlight: prepared.highlight,
      order_index: prepared.order_index,
      is_active: prepared.is_active,
      updated_at: prepared.updated_at,
    });
  } catch (err) {
    console.warn("Supabase upsert fee error, relying on cache:", err);
  }

  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [...current, prepared];

  saveFeesToCache(updatedList);
  await logAdminActivity(
    isEditing ? "UPDATE" : "CREATE",
    "fee_structures",
    `${isEditing ? "Updated" : "Added"} fee: ${prepared.type_bn}`
  );

  return prepared;
}

export async function deleteFeeItem(id: string): Promise<void> {
  const current = getCachedFees();
  const deletedItem = current.find((c) => c.id === id);

  try {
    await supabase.from("fee_structures").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete fee error, relying on cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveFeesToCache(filtered);

  await logAdminActivity(
    "DELETE",
    "fee_structures",
    `Deleted fee item: ${deletedItem?.type_bn || id}`
  );
}

// ================= ADMISSION RULES API =================

export async function getAdmissionRules(): Promise<AdmissionRuleItem[]> {
  try {
    const { data, error } = await supabase
      .from("admission_rules")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) {
      return getCachedRules();
    }

    const mapped: AdmissionRuleItem[] = data.map((item: any, idx: number) => ({
      id: item.id || `rule-${idx}`,
      rule_bn: item.rule_bn || "",
      rule_en: item.rule_en || "",
      type: item.type || "rule",
      is_required: item.is_required ?? true,
      order_index: item.order_index ?? idx + 1,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    saveRulesToCache(mapped);
    return mapped;
  } catch (err) {
    console.warn("Using fallback cached admission rules:", err);
    return getCachedRules();
  }
}

export async function saveAdmissionRule(
  item: Omit<AdmissionRuleItem, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<AdmissionRuleItem> {
  const current = getCachedRules();
  const isEditing = Boolean(item.id);
  const targetId = item.id || `rule-${Date.now()}`;

  const prepared: AdmissionRuleItem = {
    ...item,
    id: targetId,
    order_index: item.order_index ?? (current.length + 1),
    is_required: item.is_required ?? true,
    updated_at: new Date().toISOString(),
    created_at: isEditing
      ? current.find((c) => c.id === targetId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
  };

  try {
    await supabase.from("admission_rules").upsert({
      id: prepared.id,
      rule_bn: prepared.rule_bn,
      rule_en: prepared.rule_en,
      type: prepared.type,
      is_required: prepared.is_required,
      order_index: prepared.order_index,
      updated_at: prepared.updated_at,
    });
  } catch (err) {
    console.warn("Supabase upsert admission rule error, relying on cache:", err);
  }

  const updatedList = isEditing
    ? current.map((c) => (c.id === targetId ? prepared : c))
    : [...current, prepared];

  saveRulesToCache(updatedList);
  await logAdminActivity(
    isEditing ? "UPDATE" : "CREATE",
    "admission_rules",
    `${isEditing ? "Updated" : "Added"} admission rule: ${prepared.rule_bn.slice(0, 30)}...`
  );

  return prepared;
}

export async function deleteAdmissionRule(id: string): Promise<void> {
  const current = getCachedRules();
  const deletedItem = current.find((c) => c.id === id);

  try {
    await supabase.from("admission_rules").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete admission rule error, relying on cache:", err);
  }

  const filtered = current.filter((c) => c.id !== id);
  saveRulesToCache(filtered);

  await logAdminActivity(
    "DELETE",
    "admission_rules",
    `Deleted admission rule: ${deletedItem?.rule_bn.slice(0, 30) || id}`
  );
}
