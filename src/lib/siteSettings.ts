import { useEffect, useState } from "react";
import { supabase, ensureSupabaseAdminAuth } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types/cms";
import { applyColorPalette } from "@/lib/colorPalettes";

const SETTINGS_CACHE_KEY = "oasis_site_settings_cache_v4";
const LEGACY_CACHE_KEYS = ["oasis_site_settings_cache_v3", "oasis_site_settings_cache_v2", "oasis_site_settings_cache_v1"];
export const EXT_SETTINGS_PREFIX = "__EXT_SETTINGS_V1__";

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
  instagram_url: null,
  tiktok_url: null,
  twitter_url: null,
  logo_url: "/site-logo.png",
  favicon_url: "/favicon.ico",
  hero_image_url: null,
  color_palette: "royal-navy",
  primary_color: null,
  accent_color: null,

  // Board Affiliations & Registrations
  befaq_name: "বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (বেফাক)",
  befaq_reg_no: "",
  befaq_cert_no: "",
  huffaz_name: "হুফ্ফাজুল কুরআন ফাউন্ডেশন বাংলাদেশ",
  huffaz_reg_no: "",
  huffaz_cert_no: "",
  nurani_name: "নূরানী তা'লীমুল কুরআন বোর্ড বাংলাদেশ",
  nurani_reg_no: "",
  nurani_cert_no: "",
  trade_license_no: "",

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
 * Extracts the primary registration / affiliation number from settings.
 * Checks emis_code first, then falls back to board registration numbers (Befaq, Nurani, Huffaz, Trade License).
 */
export function getPrimaryRegistrationNumber(settings: SiteSettings | null | undefined): string {
  if (!settings) return "";
  if (settings.emis_code && settings.emis_code.trim() && settings.emis_code !== "12345678") {
    return settings.emis_code.trim();
  }
  if (settings.befaq_reg_no && settings.befaq_reg_no.trim()) {
    return settings.befaq_reg_no.trim();
  }
  if (settings.nurani_reg_no && settings.nurani_reg_no.trim()) {
    return settings.nurani_reg_no.trim();
  }
  if (settings.huffaz_reg_no && settings.huffaz_reg_no.trim()) {
    return settings.huffaz_reg_no.trim();
  }
  if (settings.trade_license_no && settings.trade_license_no.trim()) {
    return settings.trade_license_no.trim();
  }
  return "";
}

/**
 * Format registration / EMIS / Board code cleanly for display.
 * Avoids prepending duplicate prefixes if user input already includes 'রেজি' or 'Reg'.
 * Accepts either a raw string or full SiteSettings object.
 */
export function formatRegistrationNumber(
  input: string | SiteSettings | null | undefined,
  lang: "bn" | "en" = "bn"
): string {
  let emisCode: string | null | undefined;
  if (typeof input === "object" && input !== null) {
    emisCode = getPrimaryRegistrationNumber(input);
  } else {
    emisCode = input;
  }
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
  applyColorPalette(merged.color_palette || "royal-navy", merged.primary_color, merged.accent_color);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: merged }));
    try {
      localStorage.setItem("oasis_settings_sync_trigger", Date.now().toString());
    } catch {}
    window.dispatchEvent(new Event("storage"));
  }
  return merged;
}

/**
 * Resilient remote updater for site_settings.
 * 1. Immediately updates localStorage cache and broadcasts the full payload so UI is instant and persistent.
 * 2. Authenticates admin session to satisfy Supabase RLS.
 * 3. Packages extended settings (board affiliations, registrations, etc.) into an ultra-reliable JSON payload.
 * 4. Upserts to Supabase with auto-retry and schema resilience.
 */
export async function updateSiteSettingsRemote(payload: Partial<SiteSettings>): Promise<{ success: boolean; data: SiteSettings; error?: any }> {
  // 1. Immediately broadcast and save to cache
  const merged = broadcastSiteSettingsUpdated(payload);

  // 2. Ensure admin auth session for Supabase RLS
  await ensureSupabaseAdminAuth();

  // 3. Package all extended fields that are not native columns in site_settings table
  const extFields: Record<string, any> = {
    tagline_bn: merged.tagline_bn,
    tagline_en: merged.tagline_en,
    befaq_name: merged.befaq_name,
    befaq_reg_no: merged.befaq_reg_no,
    befaq_cert_no: merged.befaq_cert_no,
    huffaz_name: merged.huffaz_name,
    huffaz_reg_no: merged.huffaz_reg_no,
    huffaz_cert_no: merged.huffaz_cert_no,
    nurani_name: merged.nurani_name,
    nurani_reg_no: merged.nurani_reg_no,
    nurani_cert_no: merged.nurani_cert_no,
    trade_license_no: merged.trade_license_no,
    color_palette: merged.color_palette,
    primary_color: merged.primary_color,
    accent_color: merged.accent_color,
    bank_name_bn: merged.bank_name_bn,
    bank_name_en: merged.bank_name_en,
    bank_account_name: merged.bank_account_name,
    bank_account_no: merged.bank_account_no,
    bank_branch_bn: merged.bank_branch_bn,
    bank_branch_en: merged.bank_branch_en,
    bank_routing_no: merged.bank_routing_no,
    bkash_number: merged.bkash_number,
    bkash_type: merged.bkash_type,
    nagad_number: merged.nagad_number,
    nagad_type: merged.nagad_type,
    rocket_number: merged.rocket_number,
    rocket_type: merged.rocket_type,
    payment_instructions_bn: merged.payment_instructions_bn,
    payment_instructions_en: merged.payment_instructions_en,
    payment_accounts: merged.payment_accounts,
    founder_name_bn: merged.founder_name_bn,
    founder_name_en: merged.founder_name_en,
    founder_title_bn: merged.founder_title_bn,
    founder_title_en: merged.founder_title_en,
    founder_message_bn: merged.founder_message_bn,
    founder_message_en: merged.founder_message_en,
    founder_image_url: merged.founder_image_url,
    founder_phone: merged.founder_phone,
    principal_name_bn: merged.principal_name_bn,
    principal_name_en: merged.principal_name_en,
    principal_title_bn: merged.principal_title_bn,
    principal_title_en: merged.principal_title_en,
    principal_message_bn: merged.principal_message_bn,
    principal_message_en: merged.principal_message_en,
    principal_image_url: merged.principal_image_url,
    principal_phone: merged.principal_phone,
    principal_email: merged.principal_email,
    vice_principal_name_bn: merged.vice_principal_name_bn,
    vice_principal_name_en: merged.vice_principal_name_en,
    vice_principal_title_bn: merged.vice_principal_title_bn,
    vice_principal_title_en: merged.vice_principal_title_en,
    vice_principal_message_bn: merged.vice_principal_message_bn,
    vice_principal_message_en: merged.vice_principal_message_en,
    vice_principal_image_url: merged.vice_principal_image_url,
    vice_principal_phone: merged.vice_principal_phone,
    vice_principal_email: merged.vice_principal_email,
  };

  const extPayloadString = EXT_SETTINGS_PREFIX + JSON.stringify(extFields);

  // 4. Remote payload keeping standard columns + storing extended fields in address_girls_campus_en
  let remotePayload: Record<string, any> = {
    id: 1,
    institution_name_bn: merged.institution_name_bn,
    institution_name_en: merged.institution_name_en,
    emis_code: merged.emis_code || null,
    founding_year: merged.founding_year || null,
    phone_primary: merged.phone_primary || null,
    phone_secondary: merged.phone_secondary || null,
    whatsapp_number: merged.whatsapp_number || null,
    email_primary: merged.email_primary || null,
    admission_status: merged.admission_status || "open",
    address_boys_campus_bn: merged.address_boys_campus_bn || null,
    address_boys_campus_en: merged.address_boys_campus_en || null,
    address_girls_campus_bn: merged.address_girls_campus_bn || null,
    address_girls_campus_en: extPayloadString,
    google_maps_url: merged.google_maps_url || null,
    facebook_url: merged.facebook_url || null,
    youtube_url: merged.youtube_url || null,
    logo_url: merged.logo_url || null,
    favicon_url: merged.favicon_url || null,
    updated_at: new Date().toISOString(),
  };

  let attempts = 0;
  const maxAttempts = 6;
  while (attempts < maxAttempts) {
    attempts++;
    let { error } = await supabase
      .from("site_settings")
      .upsert(remotePayload, { onConflict: "id" });

    // Handle RLS permission error 42501 by re-authenticating as admin
    if (error && error.code === "42501") {
      const authed = await ensureSupabaseAdminAuth(true);
      if (authed) {
        const retry = await supabase
          .from("site_settings")
          .upsert(remotePayload, { onConflict: "id" });
        error = retry.error;
      }
    }

    if (!error) {
      break;
    }

    const msg = error.message || "";
    const match =
      msg.match(/Could not find the '([^']+)' column/i) ||
      msg.match(/column "?([^"\s]+)"? (?:of relation )?does not exist/i);

    if (match && match[1] && match[1] in remotePayload) {
      console.warn(`Supabase schema cache missing column '${match[1]}'. Stripping from remote payload and retrying...`);
      delete remotePayload[match[1]];
      continue;
    }

    console.warn("Supabase site_settings upsert error:", error);
    break;
  }

  return { success: true, data: merged };
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

      // Check for packed extended settings in address_girls_campus_en
      let extSettings: Record<string, any> = {};
      if (
        data.address_girls_campus_en &&
        typeof data.address_girls_campus_en === "string" &&
        data.address_girls_campus_en.startsWith(EXT_SETTINGS_PREFIX)
      ) {
        try {
          extSettings = JSON.parse(data.address_girls_campus_en.slice(EXT_SETTINGS_PREFIX.length));
        } catch (e) {
          console.warn("Failed to parse extended site settings JSON:", e);
        }
      }

      const cached = getCachedSiteSettings();
      const sanitizedRemote = sanitizeSettingsObject(data);

      const merged: SiteSettings = {
        ...defaultSiteSettings,
        ...cached,
        ...sanitizedRemote,
        ...extSettings,
        address_girls_campus_en: null,
        institution_name_bn: sanitizedRemote.institution_name_bn || cached.institution_name_bn || defaultSiteSettings.institution_name_bn,
        institution_name_en: sanitizedRemote.institution_name_en || cached.institution_name_en || defaultSiteSettings.institution_name_en,
        emis_code: sanitizedRemote.emis_code === "12345678" ? (cached.emis_code === "12345678" ? "" : cached.emis_code) : (sanitizedRemote.emis_code ?? cached.emis_code ?? ""),
        logo_url: data.logo_url || cached.logo_url || defaultSiteSettings.logo_url,
        favicon_url: data.favicon_url || cached.favicon_url || defaultSiteSettings.favicon_url,
        hero_image_url: data.hero_image_url || cached.hero_image_url || defaultSiteSettings.hero_image_url,
        facebook_url: data.facebook_url ?? extSettings.facebook_url ?? sanitizedRemote.facebook_url ?? defaultSiteSettings.facebook_url,
        facebook_group_url: data.facebook_group_url ?? extSettings.facebook_group_url ?? sanitizedRemote.facebook_group_url ?? defaultSiteSettings.facebook_group_url,
        youtube_url: data.youtube_url ?? extSettings.youtube_url ?? sanitizedRemote.youtube_url ?? defaultSiteSettings.youtube_url,
        instagram_url: data.instagram_url ?? extSettings.instagram_url ?? sanitizedRemote.instagram_url ?? defaultSiteSettings.instagram_url,
        tiktok_url: data.tiktok_url ?? extSettings.tiktok_url ?? sanitizedRemote.tiktok_url ?? defaultSiteSettings.tiktok_url,
        twitter_url: data.twitter_url ?? extSettings.twitter_url ?? sanitizedRemote.twitter_url ?? defaultSiteSettings.twitter_url,
        google_maps_url: data.google_maps_url ?? extSettings.google_maps_url ?? defaultSiteSettings.google_maps_url,
        payment_accounts: Array.isArray(extSettings.payment_accounts)
          ? extSettings.payment_accounts
          : (Array.isArray(data.payment_accounts)
            ? data.payment_accounts
            : (Array.isArray(sanitizedRemote.payment_accounts) ? sanitizedRemote.payment_accounts : [])),
        color_palette: extSettings.color_palette || data.color_palette || cached.color_palette || defaultSiteSettings.color_palette,
        primary_color: extSettings.primary_color ?? data.primary_color ?? sanitizedRemote.primary_color ?? null,
        accent_color: extSettings.accent_color ?? data.accent_color ?? sanitizedRemote.accent_color ?? null,
        befaq_name: extSettings.befaq_name ?? data.befaq_name ?? cached.befaq_name ?? defaultSiteSettings.befaq_name,
        befaq_reg_no: extSettings.befaq_reg_no ?? data.befaq_reg_no ?? cached.befaq_reg_no ?? defaultSiteSettings.befaq_reg_no,
        befaq_cert_no: extSettings.befaq_cert_no ?? data.befaq_cert_no ?? cached.befaq_cert_no ?? defaultSiteSettings.befaq_cert_no,
        huffaz_name: extSettings.huffaz_name ?? data.huffaz_name ?? cached.huffaz_name ?? defaultSiteSettings.huffaz_name,
        huffaz_reg_no: extSettings.huffaz_reg_no ?? data.huffaz_reg_no ?? cached.huffaz_reg_no ?? defaultSiteSettings.huffaz_reg_no,
        huffaz_cert_no: extSettings.huffaz_cert_no ?? data.huffaz_cert_no ?? cached.huffaz_cert_no ?? defaultSiteSettings.huffaz_cert_no,
        nurani_name: extSettings.nurani_name ?? data.nurani_name ?? cached.nurani_name ?? defaultSiteSettings.nurani_name,
        nurani_reg_no: extSettings.nurani_reg_no ?? data.nurani_reg_no ?? cached.nurani_reg_no ?? defaultSiteSettings.nurani_reg_no,
        nurani_cert_no: extSettings.nurani_cert_no ?? data.nurani_cert_no ?? cached.nurani_cert_no ?? defaultSiteSettings.nurani_cert_no,
        trade_license_no: extSettings.trade_license_no ?? data.trade_license_no ?? cached.trade_license_no ?? defaultSiteSettings.trade_license_no,
        tagline_bn: extSettings.tagline_bn ?? data.tagline_bn ?? cached.tagline_bn ?? defaultSiteSettings.tagline_bn,
        tagline_en: extSettings.tagline_en ?? data.tagline_en ?? cached.tagline_en ?? defaultSiteSettings.tagline_en,
      };

      lastFetchTimestamp = Date.now();
      saveSiteSettingsToCache(merged);
      applyColorPalette(merged.color_palette || "royal-navy", merged.primary_color, merged.accent_color);
      return merged;
    } catch (err) {
      console.warn("Could not fetch remote site_settings, using fallback:", err);
      const cached = getCachedSiteSettings();
      applyColorPalette(cached.color_palette || "royal-navy", cached.primary_color, cached.accent_color);
      return cached;
    }
  })();

  return activeFetchPromise;
}

/**
 * React hook to access institutional settings across all public & admin pages in real-time.
 */
export function useSiteSettings(): { settings: SiteSettings; loading: boolean } {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const cached = getCachedSiteSettings();
    if (typeof window !== "undefined") {
      applyColorPalette(cached.color_palette || "royal-navy", cached.primary_color, cached.accent_color);
    }
    return cached;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const handleSync = () => {
      if (mounted) {
        const latest = getCachedSiteSettings();
        setSettings(latest);
        applyColorPalette(latest.color_palette || "royal-navy", latest.primary_color, latest.accent_color);

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
