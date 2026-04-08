import type { FeeStatus } from "@/lib/feeEntries";

export const pickGuardianText = (
  t: (bn: string, en: string) => string,
  bangla?: string | null,
  english?: string | null,
  fallback = "",
) => {
  const safeBn = bangla?.trim() || fallback;
  const safeEn = english?.trim() || fallback;
  return t(safeBn, safeEn);
};

export const formatGuardianFeeStatus = (
  t: (bn: string, en: string) => string,
  status: FeeStatus,
) => {
  switch (status) {
    case "paid":
      return t("পরিশোধিত", "Paid");
    case "partial":
      return t("আংশিক", "Partial");
    case "unpaid":
    default:
      return t("বকেয়া", "Unpaid");
  }
};

export const formatGuardianDateTime = (value: number | string, locale: "bn-BD" | "en-US") => {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(locale);
};
