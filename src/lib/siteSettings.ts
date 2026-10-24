import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types/cms";

const SETTINGS_CACHE_KEY = "oasis_site_settings_cache_v4";
const LEGACY_CACHE_KEYS = ["oasis_site_settings_cache_v3", "oasis_site_settings_cache_v2", "oasis_site_settings_cache_v1"];

export const defaultSiteSettings: SiteSettings = {
  id: 1,
  institution_name_bn: "আননূর তাহফিজুল কুরআন মাদরাসা",
  institution_name_en: "Annoor Tahfizul Quran Madrasa",
  tagline_bn: "একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে",
  tagline_en: "Building Faith, Knowledge & Character Together",
  emis_code: "",
  founding_year: "2021",
  phone_primary: "01820811511",
  phone_secondary: "01581818368",
  whatsapp_number: "01581818368",
  email_primary: "info@annoor.edu.bd",
  website_url: "https://annoor.edu.bd",
  admission_status: "open",
  address_boys_campus_bn: "আননূর তাহফিজুল কুরআন মাদরাসা, কাপাসিয়া বাজার রোড, কাপাসিয়া, গাজীপুর",
  address_boys_campus_en: "Annoor Tahfizul Quran Madrasa, Kapasia Bazar Road, Kapasia, Gazipur",
  address_girls_campus_bn: null,
  address_girls_campus_en: null,
  google_maps_url:
    "https://www.google.com/maps/place/%E0%A6%86%E0%A6%A8%E0%A6%A8%E0%A7%82%E0%A6%B0+%E0%A6%A4%E0%A6%BE%E0%A6%B9%E0%A6%AB%E0%A6%BF%E0%A6%9C%E0%A7%81%E0%A6%B2+%E0%A6%95%E0%A7%81%E0%A6%B0%E0%A6%86%E0%A6%A8+%E0%A6%AE%E0%A6%BE%E0%A6%A6%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A6%BE+%E0%A6%93+%E0%A6%AE%E0%A6%A1%E0%A7%87%E0%A6%B2+%E0%A6%8F%E0%A6%95%E0%A6%BE%E0%A6%A1%E0%A7%87%E0%A6%AE%E0%A7%80/@24.1119189,90.5677945,21z/data=!4m6!3m5!1s0x3755d59d76b2ffd9:0xde5de9aa6b8378aa!8m2!3d24.1118467!4d90.5680587!16s%2Fg%2F11khdsnx7w?entry=ttu&g_ep=EgoyMDI2MDMzMS4wIKXMDSoASAFQAw%3D%3D",
  facebook_url: "https://www.facebook.com/profile.php?id=61595529418669",
  facebook_group_url: "https://www.facebook.com/share/g/1Pg8FaZjsn/",
  youtube_url: "https://www.youtube.com/@ANNOORMADRASA",
  logo_url: "/site-logo.png",
  favicon_url: "/favicon.ico",
  hero_image_url: null,

  // Banking & Payment
  bank_name_bn: "ইসলামী ব্যাংক বাংলাদেশ পিএলসি",
  bank_name_en: "Islami Bank Bangladesh PLC",
  bank_account_name: "Annoor Tahfizul Quran Madrasa",
  bank_account_no: "20503760201161316",
  bank_branch_bn: "কাপাসিয়া শাখা, গাজীপুর",
  bank_branch_en: "Kapasia Branch, Gazipur",
  bank_routing_no: "125271874",
  bkash_number: "01820811511",
  bkash_type: "personal",
  nagad_number: "01581818368",
  nagad_type: "personal",
  rocket_number: "",
  rocket_type: "personal",
  payment_instructions_bn:
    "ক্যাম্পাস ক্যাশ কাউন্টার ছাড়াও বিকাশ, নগদ, রকেট ও নির্ধারিত ব্যাংক অ্যাকাউন্টের মাধ্যমে অফিসিয়াল রসিদ সহ ফি প্রদান করা যায়। ট্রানজাকশনের রেফারেন্সে শিক্ষার্থীর রোল/নাম লিখুন এবং হিসাব শাখায় অবহিত করুন।",
  payment_instructions_en:
    "Fees can be paid at campus accounts counters or through bKash, Nagad, Rocket, and designated bank accounts with official receipts. Please include student roll/name in payment reference.",
  payment_accounts: [],

  // Leadership & Administration
  founder_name_bn: "মুফতি আব্দুল্লাহ আল মামুন",
  founder_name_en: "Mufti Abdullah Al Mamon",
  founder_title_bn: "ম্যানেজার ও প্রতিষ্ঠাতা পরিচালক",
  founder_title_en: "Manager & Founding Director",
  founder_message_bn:
    "শিক্ষা শুধু বইয়ের পাতার মুখস্থ নয়, এটি শিশুর চিন্তা ও চরিত্রের আত্মিক পরিশুদ্ধি। আননূর শিক্ষা পরিবারে আমরা প্রতিটি সন্তানকে আন্তরিক ভালোবাসা ও দায়িত্বশীলতার সাথে গড়ে তুলি।",
  founder_message_en:
    "Education is not mere textbook cramming; it is the spiritual and intellectual purification of a child's character with deep love and institutional care.",
  founder_image_url: "/abdullah.png",
  founder_phone: "01312200043",

  principal_name_bn: "হাফেজ আমানউল্লাহ",
  principal_name_en: "Hafez Amanullah",
  principal_title_bn: "প্রধান শিক্ষক ও হিফজ প্রধান",
  principal_title_en: "Principal & Head of Hifz",
  principal_message_bn:
    "কুরআন হলো জীবনের হেদায়েতের নূর। আমরা চাই আমাদের শিক্ষার্থীরা বিশুদ্ধ কুরআন বক্ষে ধারণ করে ডাক্তার, ইঞ্জিনিয়ার, অধ্যাপক বা আদর্শ আলেম হয়ে জাতির মুখ উজ্জ্বল করুক।",
  principal_message_en:
    "The Quran is the light of guidance. We strive for students who hold the Quran in their hearts while excelling as doctors, engineers, professors, or noble scholars.",
  principal_image_url: "/gallery/campus_main.jpg",
  principal_phone: "01820811511",
  principal_email: "principal@annoor.edu.bd",

  vice_principal_name_bn: "মুফতি মাহমুদুল হাসান",
  vice_principal_name_en: "Mufti Mahmudul Hasan",
  vice_principal_title_bn: "সহকারী প্রধান শিক্ষক (একাডেমিক)",
  vice_principal_title_en: "Vice Principal (Academic)",
  vice_principal_message_bn:
    "নিয়মিত পাঠদান ও নিবিড় পরিচর্যার মাধ্যমেই প্রতিটি শিক্ষার্থীর মেধার সর্বোচ্চ বিকাশ সম্ভব।",
  vice_principal_message_en:
    "Through consistent guidance and compassionate mentorship, every student's latent potential can truly flourish.",
  vice_principal_image_url: null,
  vice_principal_phone: "01581818368",
  vice_principal_email: "academic@annoor.edu.bd",

  updated_at: new Date().toISOString(),
};

export const SETTINGS_UPDATED_EVENT = "oasis_site_settings_updated";

/**
 * Format registration / EMIS code cleanly for display.
 * Avoids prepending duplicate prefixes if user input already includes 'রেজি' or 'Reg'.
 */
export function formatRegistrationNumber(
  emisCode: string | null | undefined,
  lang: "bn" | "en" = "bn"
): string {
  if (!emisCode || !emisCode.trim() || emisCode === "12345678") return "";
  const trimmed = emisCode.trim();
  if (/^(রেজি|রেজিস্ট্রেশন|reg|reg\.|regno|reg no)/i.test(trimmed)) {
    return trimmed;
  }
  return lang === "bn" ? `রেজি: নং. ${trimmed}` : `Reg. No: ${trimmed}`;
}

/**
 * Helper to sanitize legacy hardcoded strings so old cache or outdated defaults
 * don't contaminate fresh UI state.
 */
function sanitizeSettingsObject(obj: Partial<SiteSettings>): Partial<SiteSettings> {
  const sanitized = { ...obj };
  if (
    sanitized.institution_name_bn === "আননূর তাহফিজুল কুরআন মাদরাসা ও মডেল একাডেমী" ||
    sanitized.institution_name_bn === "আননূর তাহফিজুল কুরআন মাদরাসা ও মডেল একাডেমি"
  ) {
    sanitized.institution_name_bn = defaultSiteSettings.institution_name_bn;
  }
  if (
    sanitized.institution_name_en === "Annoor Tahfizul Quran Madrasa & Model Academy" ||
    sanitized.institution_name_en === "Annoor Tahfizul Quran Madrasha & Model Academy"
  ) {
    sanitized.institution_name_en = defaultSiteSettings.institution_name_en;
  }
  if (sanitized.emis_code === "12345678") {
    sanitized.emis_code = "";
  }
  return sanitized;
}

export function getCachedSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSiteSettings;
  try {
    // Purge legacy caches if present
    for (const legacyKey of LEGACY_CACHE_KEYS) {
      if (localStorage.getItem(legacyKey)) {
        try {
          localStorage.removeItem(legacyKey);
        } catch {}
      }
    }

    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return defaultSiteSettings;
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeSettingsObject(parsed);
    return { ...defaultSiteSettings, ...sanitized };
  } catch {
    return defaultSiteSettings;
  }
}

export function saveSiteSettingsToCache(settings: Partial<SiteSettings>): SiteSettings {
  const current = getCachedSiteSettings();
  const sanitizedInput = sanitizeSettingsObject(settings);
  const updated = { ...current, ...sanitizedInput, updated_at: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to cache site settings:", err);
    }
  }
  return updated;
}

// In-flight fetch deduplication to prevent duplicate concurrent network requests
let activeFetchPromise: Promise<SiteSettings> | null = null;
let lastFetchTimestamp = 0;
const CACHE_REVALIDATE_TTL_MS = 30 * 1000; // 30 seconds soft TTL

/**
 * Broadcast settings update across all open components and browser tabs.
 */
export function broadcastSiteSettingsUpdated(settings: Partial<SiteSettings>): SiteSettings {
  // Invalidate any in-flight or cached promise
  activeFetchPromise = null;
  lastFetchTimestamp = 0;

  const merged = saveSiteSettingsToCache(settings);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: merged }));
    try {
      localStorage.setItem("oasis_settings_sync_trigger", Date.now().toString());
    } catch {}
    window.dispatchEvent(new Event("storage"));
  }
  return merged;
}

export async function fetchSiteSettings(forceFresh = false): Promise<SiteSettings> {
  const now = Date.now();
  if (!forceFresh && activeFetchPromise && now - lastFetchTimestamp < CACHE_REVALIDATE_TTL_MS) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        if (error) console.warn("Could not fetch remote site_settings:", error);
        return getCachedSiteSettings();
      }

      const sanitizedRemote = sanitizeSettingsObject(data);

      const merged: SiteSettings = {
        ...defaultSiteSettings,
        ...sanitizedRemote,
        institution_name_bn: sanitizedRemote.institution_name_bn || defaultSiteSettings.institution_name_bn,
        institution_name_en: sanitizedRemote.institution_name_en || defaultSiteSettings.institution_name_en,
        emis_code: sanitizedRemote.emis_code === "12345678" ? "" : (sanitizedRemote.emis_code ?? ""),
        logo_url: data.logo_url || defaultSiteSettings.logo_url,
        favicon_url: data.favicon_url || defaultSiteSettings.favicon_url,
        hero_image_url: data.hero_image_url || defaultSiteSettings.hero_image_url,
        facebook_url: data.facebook_url || defaultSiteSettings.facebook_url,
        youtube_url: data.youtube_url || defaultSiteSettings.youtube_url,
        google_maps_url: data.google_maps_url || defaultSiteSettings.google_maps_url,
        payment_accounts: Array.isArray(data.payment_accounts)
          ? data.payment_accounts
          : (Array.isArray(sanitizedRemote.payment_accounts) ? sanitizedRemote.payment_accounts : []),
      };

      lastFetchTimestamp = Date.now();
      saveSiteSettingsToCache(merged);
      return merged;
    } catch (err) {
      console.warn("Could not fetch remote site_settings, using fallback:", err);
      return getCachedSiteSettings();
    }
  })();

  return activeFetchPromise;
}

/**
 * React hook to access institutional settings across all public & admin pages in real-time.
 */
export function useSiteSettings(): { settings: SiteSettings; loading: boolean } {
  const [settings, setSettings] = useState<SiteSettings>(getCachedSiteSettings);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const handleSync = () => {
      if (mounted) {
        const latest = getCachedSiteSettings();
        setSettings(latest);

        // Update favicon dynamically if customized
        if (
          latest.favicon_url &&
          latest.favicon_url !== defaultSiteSettings.favicon_url &&
          typeof document !== "undefined"
        ) {
          let faviconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
          if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.rel = "icon";
            document.getElementsByTagName("head")[0].appendChild(faviconLink);
          }
          faviconLink.href = latest.favicon_url;
        }
      }
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSync);
    window.addEventListener("storage", handleSync);

    void (async () => {
      const remote = await fetchSiteSettings();
      if (mounted) {
        setSettings(remote);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  return { settings, loading };
}
