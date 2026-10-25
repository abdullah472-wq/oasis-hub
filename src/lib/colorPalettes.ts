export interface PaletteTokens {
  primary: string; // Space-separated H S% L%, e.g. "228 84% 19%"
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  sidebarPrimary?: string;
  sidebarRing?: string;
}

export interface ColorPalette {
  id: string;
  nameBn: string;
  nameEn: string;
  badgeBn: string;
  badgeEn: string;
  descriptionBn: string;
  descriptionEn: string;
  category: "girls" | "default" | "madrasa" | "modern" | "regal";
  preview: {
    primaryHex: string;
    accentHex: string;
    sampleBg: string;
  };
  tokens: {
    light: PaletteTokens;
    dark: PaletteTokens;
  };
}

/**
 * Standard Institutional Color Palettes
 */
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "rose-girls",
    nameBn: "রোজ অ্যান্ড পিংক (মহিলা ও বালিকা শাখা)",
    nameEn: "Rose & Blush (Girls & Women Campus)",
    badgeBn: "মহিলা ও বালিকা শাখা",
    badgeEn: "Girls Campus",
    descriptionBn: "মহিলা মাদরাসা ও বালিকা শাখার জন্য বিশেষায়িত মার্জিত রোজ ও সফট পিংক থিম।",
    descriptionEn: "Specially crafted elegant rose & blush palette for girls and women madrasa campuses.",
    category: "girls",
    preview: {
      primaryHex: "#9F1239", // Rose 800
      accentHex: "#FB7185",  // Rose 400
      sampleBg: "bg-rose-50",
    },
    tokens: {
      light: {
        primary: "343 79% 35%", // Deep elegant rose
        primaryForeground: "0 0% 100%",
        accent: "350 89% 60%", // Soft warm pink accent
        accentForeground: "0 0% 100%",
        ring: "343 79% 35%",
        sidebarPrimary: "343 79% 35%",
        sidebarRing: "350 89% 60%",
      },
      dark: {
        primary: "343 85% 65%",
        primaryForeground: "343 80% 12%",
        accent: "350 89% 65%",
        accentForeground: "0 0% 100%",
        ring: "343 85% 65%",
        sidebarPrimary: "343 85% 65%",
        sidebarRing: "350 89% 65%",
      },
    },
  },
  {
    id: "royal-navy",
    nameBn: "রয়্যাল নেভি ও ফ্লেম অরেঞ্জ (মূল ডিফল্ট)",
    nameEn: "Royal Navy & Flame Orange (Default)",
    badgeBn: "মূল ডিফল্ট",
    badgeEn: "Default",
    descriptionBn: "আননূর মাদরাসার মূল অফিশিয়াল ব্র্যান্ড নেভি ব্লু ও ফ্লেম অরেঞ্জ অ্যাকসেন্ট থিম।",
    descriptionEn: "Official brand deep royal navy blue with energetic flame orange accent.",
    category: "default",
    preview: {
      primaryHex: "#08185A",
      accentHex: "#F15A24",
      sampleBg: "bg-blue-50",
    },
    tokens: {
      light: {
        primary: "228 84% 19%",
        primaryForeground: "0 0% 100%",
        accent: "16 88% 54%",
        accentForeground: "0 0% 100%",
        ring: "228 84% 19%",
        sidebarPrimary: "228 84% 19%",
        sidebarRing: "16 88% 54%",
      },
      dark: {
        primary: "228 80% 65%",
        primaryForeground: "228 84% 12%",
        accent: "16 88% 54%",
        accentForeground: "0 0% 100%",
        ring: "16 88% 54%",
        sidebarPrimary: "16 88% 54%",
        sidebarRing: "16 88% 54%",
      },
    },
  },
  {
    id: "islamic-emerald",
    nameBn: "ইসলামিক এমারেল্ড ও রয়্যাল গোল্ড",
    nameEn: "Islamic Emerald & Royal Gold",
    badgeBn: "ক্লাসিক দ্বীনি",
    badgeEn: "Islamic Heritage",
    descriptionBn: "ঐতিহ্যবাহী দ্বীনি মাদরাসা ও হিফজ প্রতিষ্ঠানের জন্য প্রশান্তিময় সবুজ ও গোল্ডেন আভা।",
    descriptionEn: "Serene deep emerald green with warm royal gold accent for traditional Islamic academies.",
    category: "madrasa",
    preview: {
      primaryHex: "#064E3B", // Emerald 900
      accentHex: "#D97706",  // Amber 600
      sampleBg: "bg-emerald-50",
    },
    tokens: {
      light: {
        primary: "166 85% 17%", // Deep forest emerald
        primaryForeground: "0 0% 100%",
        accent: "37 91% 44%",  // Royal Gold Amber
        accentForeground: "0 0% 100%",
        ring: "166 85% 17%",
        sidebarPrimary: "166 85% 17%",
        sidebarRing: "37 91% 44%",
      },
      dark: {
        primary: "160 84% 45%",
        primaryForeground: "166 85% 10%",
        accent: "45 93% 58%",
        accentForeground: "0 0% 100%",
        ring: "160 84% 45%",
        sidebarPrimary: "160 84% 45%",
        sidebarRing: "45 93% 58%",
      },
    },
  },
  {
    id: "ocean-teal",
    nameBn: "ওশান টিল ও কোরাল সানসেট",
    nameEn: "Ocean Teal & Coral Sunset",
    badgeBn: "আধুনিক একাডেমি",
    badgeEn: "Modern Educational",
    descriptionBn: "আধুনিক সমন্বিত স্কুল ও মাদরাসার জন্য গভীর টিল ও সতেজ কোরাল কালার কম্বিনেশন।",
    descriptionEn: "Sophisticated ocean teal paired with vibrant coral for contemporary integrated academies.",
    category: "modern",
    preview: {
      primaryHex: "#0F4C5C",
      accentHex: "#E36414",
      sampleBg: "bg-teal-50",
    },
    tokens: {
      light: {
        primary: "192 72% 21%",
        primaryForeground: "0 0% 100%",
        accent: "23 83% 48%",
        accentForeground: "0 0% 100%",
        ring: "192 72% 21%",
        sidebarPrimary: "192 72% 21%",
        sidebarRing: "23 83% 48%",
      },
      dark: {
        primary: "187 85% 55%",
        primaryForeground: "192 72% 10%",
        accent: "27 96% 61%",
        accentForeground: "0 0% 100%",
        ring: "187 85% 55%",
        sidebarPrimary: "187 85% 55%",
        sidebarRing: "27 96% 61%",
      },
    },
  },
  {
    id: "deep-maroon",
    nameBn: "ডিপ মেরুন ও গোল্ডেন অ্যাম্বার",
    nameEn: "Deep Maroon & Golden Amber",
    badgeBn: "ঐতিহ্যবাহী আভিজাত্য",
    badgeEn: "Traditional Regal",
    descriptionBn: "আভিজাত্যপূর্ণ গাঢ় মেরুন ও সোনালী অ্যাকসেন্ট, যা প্রতিষ্ঠানকে দেয় অনন্য গাম্ভীর্য।",
    descriptionEn: "Regal deep maroon combined with rich golden amber for prestigious historical institutions.",
    category: "regal",
    preview: {
      primaryHex: "#7F1D1D", // Red 900
      accentHex: "#F59E0B",  // Amber 500
      sampleBg: "bg-red-50",
    },
    tokens: {
      light: {
        primary: "0 63% 31%",
        primaryForeground: "0 0% 100%",
        accent: "38 92% 50%",
        accentForeground: "0 0% 100%",
        ring: "0 63% 31%",
        sidebarPrimary: "0 63% 31%",
        sidebarRing: "38 92% 50%",
      },
      dark: {
        primary: "0 74% 65%",
        primaryForeground: "0 63% 12%",
        accent: "38 92% 50%",
        accentForeground: "0 0% 100%",
        ring: "0 74% 65%",
        sidebarPrimary: "0 74% 65%",
        sidebarRing: "38 92% 50%",
      },
    },
  },
  {
    id: "royal-purple",
    nameBn: "রয়্যাল পার্পল ও ওয়ার্ম গোল্ড",
    nameEn: "Royal Purple & Warm Gold",
    badgeBn: "প্রিমিয়াম এক্সক্লুসিভ",
    badgeEn: "Premium Prestige",
    descriptionBn: "স্বতন্ত্র প্রিমিয়াম পার্পল ও উজ্জ্বল গোল্ডেন টাচ, যা ওয়েবসাইটে আনে আধুনিক নান্দনিকতা।",
    descriptionEn: "Exclusive deep royal purple accented by warm luminous gold for distinguished elegance.",
    category: "regal",
    preview: {
      primaryHex: "#4C1D95", // Violet 900
      accentHex: "#EAB308",  // Yellow 500
      sampleBg: "bg-purple-50",
    },
    tokens: {
      light: {
        primary: "263 67% 35%",
        primaryForeground: "0 0% 100%",
        accent: "48 89% 50%",
        accentForeground: "0 0% 100%",
        ring: "263 67% 35%",
        sidebarPrimary: "263 67% 35%",
        sidebarRing: "48 89% 50%",
      },
      dark: {
        primary: "263 70% 65%",
        primaryForeground: "263 67% 12%",
        accent: "48 89% 55%",
        accentForeground: "0 0% 100%",
        ring: "263 70% 65%",
        sidebarPrimary: "263 70% 65%",
        sidebarRing: "48 89% 55%",
      },
    },
  },
  {
    id: "classic-sapphire",
    nameBn: "ক্লাসিক স্যাফায়ার ও স্কাই ব্লু",
    nameEn: "Classic Sapphire & Sky Blue",
    badgeBn: "আন্তর্জাতিক স্ট্যান্ডার্ড",
    badgeEn: "International Standard",
    descriptionBn: "আন্তর্জাতিক মানের বিশ্ববিদ্যালয় ও মডেল শিক্ষা প্রতিষ্ঠানের ক্লাসিক ব্লু থিম।",
    descriptionEn: "Authoritative classic sapphire blue paired with crisp sky blue accents.",
    category: "default",
    preview: {
      primaryHex: "#1E3A8A", // Blue 900
      accentHex: "#0284C7",  // Sky 600
      sampleBg: "bg-sky-50",
    },
    tokens: {
      light: {
        primary: "224 64% 33%",
        primaryForeground: "0 0% 100%",
        accent: "199 89% 48%",
        accentForeground: "0 0% 100%",
        ring: "224 64% 33%",
        sidebarPrimary: "224 64% 33%",
        sidebarRing: "199 89% 48%",
      },
      dark: {
        primary: "217 91% 65%",
        primaryForeground: "224 64% 12%",
        accent: "199 89% 55%",
        accentForeground: "0 0% 100%",
        ring: "217 91% 65%",
        sidebarPrimary: "217 91% 65%",
        sidebarRing: "199 89% 55%",
      },
    },
  },
];

/**
 * Convert Hex code (#RRGGBB) to Tailwind HSL space-separated string (e.g. "228 84% 19%")
 */
export function hexToHsl(hex: string): string {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return "228 84% 19%"; // fallback default

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

/**
 * Generate dark variant from light HSL
 */
export function getDarkHslFromLight(hslStr: string): string {
  const parts = hslStr.split(" ");
  if (parts.length < 3) return hslStr;
  const h = parts[0];
  const s = parts[1];
  // Brighten for dark mode (between 55% - 70% lightness)
  return `${h} ${s} 65%`;
}

/**
 * Apply dynamic color palette tokens across the document
 */
export function applyColorPalette(
  paletteId = "royal-navy",
  customPrimary?: string | null,
  customAccent?: string | null
): void {
  if (typeof document === "undefined") return;

  let lightTokens: PaletteTokens;
  let darkTokens: PaletteTokens;

  const matched = COLOR_PALETTES.find((p) => p.id === paletteId);

  if (paletteId === "custom" && customPrimary && customAccent) {
    const primaryHsl = hexToHsl(customPrimary);
    const accentHsl = hexToHsl(customAccent);
    const primaryDarkHsl = getDarkHslFromLight(primaryHsl);
    const accentDarkHsl = getDarkHslFromLight(accentHsl);

    lightTokens = {
      primary: primaryHsl,
      primaryForeground: "0 0% 100%",
      accent: accentHsl,
      accentForeground: "0 0% 100%",
      ring: primaryHsl,
      sidebarPrimary: primaryHsl,
      sidebarRing: accentHsl,
    };

    darkTokens = {
      primary: primaryDarkHsl,
      primaryForeground: "0 0% 10%",
      accent: accentDarkHsl,
      accentForeground: "0 0% 100%",
      ring: primaryDarkHsl,
      sidebarPrimary: primaryDarkHsl,
      sidebarRing: accentDarkHsl,
    };
  } else if (matched) {
    lightTokens = matched.tokens.light;
    darkTokens = matched.tokens.dark;
  } else {
    // Default Royal Navy
    const def = COLOR_PALETTES.find((p) => p.id === "royal-navy")!;
    lightTokens = def.tokens.light;
    darkTokens = def.tokens.dark;
  }

  // Create or update inline style tag
  let styleEl = document.getElementById("dynamic-theme-palette") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "dynamic-theme-palette";
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    :root {
      --primary: ${lightTokens.primary} !important;
      --primary-foreground: ${lightTokens.primaryForeground} !important;
      --accent: ${lightTokens.accent} !important;
      --accent-foreground: ${lightTokens.accentForeground} !important;
      --ring: ${lightTokens.ring} !important;
      --sidebar-primary: ${lightTokens.sidebarPrimary || lightTokens.primary} !important;
      --sidebar-ring: ${lightTokens.sidebarRing || lightTokens.accent} !important;
    }
    .dark {
      --primary: ${darkTokens.primary} !important;
      --primary-foreground: ${darkTokens.primaryForeground} !important;
      --accent: ${darkTokens.accent} !important;
      --accent-foreground: ${darkTokens.accentForeground} !important;
      --ring: ${darkTokens.ring} !important;
      --sidebar-primary: ${darkTokens.sidebarPrimary || darkTokens.primary} !important;
      --sidebar-ring: ${darkTokens.sidebarRing || darkTokens.accent} !important;
    }
  `;
}
