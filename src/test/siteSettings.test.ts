import { describe, it, expect, beforeEach } from "vitest";
import {
  defaultSiteSettings,
  formatRegistrationNumber,
  getCachedSiteSettings,
  saveSiteSettingsToCache,
  broadcastSiteSettingsUpdated,
} from "@/lib/siteSettings";

describe("Site Settings & Dynamic Branding / Registration Info", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("has correct clean default institution name without legacy 'ও মডেল একাডেমী'", () => {
    expect(defaultSiteSettings.institution_name_bn).toBe("আননূর তাহফিজুল কুরআন মাদরাসা");
    expect(defaultSiteSettings.institution_name_en).toBe("Annoor Tahfizul Quran Madrasa");
    expect(defaultSiteSettings.institution_name_bn).not.toContain("ও মডেল একাডেমী");
    expect(defaultSiteSettings.emis_code).toBe("");
  });

  describe("formatRegistrationNumber", () => {
    it("returns empty string for empty, whitespace, null, or dummy 12345678", () => {
      expect(formatRegistrationNumber(null)).toBe("");
      expect(formatRegistrationNumber(undefined)).toBe("");
      expect(formatRegistrationNumber("")).toBe("");
      expect(formatRegistrationNumber("   ")).toBe("");
      expect(formatRegistrationNumber("12345678")).toBe("");
    });

    it("formats Bengali registration numbers properly", () => {
      expect(formatRegistrationNumber("৩৩৮/২০২২", "bn")).toBe("রেজি: নং. ৩৩৮/২০২২");
      expect(formatRegistrationNumber("৫৪০/২০২৪", "bn")).toBe("রেজি: নং. ৫৪০/২০২৪");
    });

    it("formats English registration numbers properly", () => {
      expect(formatRegistrationNumber("338/2022", "en")).toBe("Reg. No: 338/2022");
      expect(formatRegistrationNumber("540/2024", "en")).toBe("Reg. No: 540/2024");
    });

    it("does not duplicate prefix if user input already includes registration prefix", () => {
      expect(formatRegistrationNumber("রেজি: নং. ৩৩৮/২০২২", "bn")).toBe("রেজি: নং. ৩৩৮/২০২২");
      expect(formatRegistrationNumber("Reg. No: 338/2022", "en")).toBe("Reg. No: 338/2022");
      expect(formatRegistrationNumber("রেজিস্ট্রেশন নং ১২৩৪", "bn")).toBe("রেজিস্ট্রেশন নং ১২৩৪");
    });
  });

  describe("Cache & Sanitization", () => {
    it("returns default settings when localStorage is empty", () => {
      const cached = getCachedSiteSettings();
      expect(cached.institution_name_bn).toBe("আননূর তাহফিজুল কুরআন মাদরাসা");
      expect(cached.emis_code).toBe("");
    });

    it("sanitizes legacy cached 'ও মডেল একাডেমী' on retrieval", () => {
      localStorage.setItem(
        "oasis_site_settings_cache_v3",
        JSON.stringify({
          institution_name_bn: "আননূর তাহফিজুল কুরআন মাদরাসা ও মডেল একাডেমী",
          institution_name_en: "Annoor Tahfizul Quran Madrasa & Model Academy",
          emis_code: "12345678",
        })
      );

      const cached = getCachedSiteSettings();
      expect(cached.institution_name_bn).toBe("আননূর তাহফিজুল কুরআন মাদরাসা");
      expect(cached.institution_name_en).toBe("Annoor Tahfizul Quran Madrasa");
      expect(cached.emis_code).toBe("");
    });

    it("saves and broadcasts updated custom institution name immediately", () => {
      const updated = broadcastSiteSettingsUpdated({
        institution_name_bn: "আননূর ইসলামিক ইন্সটিটিউট",
        emis_code: "৭৭৭/২০২৫",
      });

      expect(updated.institution_name_bn).toBe("আননূর ইসলামিক ইন্সটিটিউট");
      expect(updated.emis_code).toBe("৭৭৭/২০২৫");

      const reFetched = getCachedSiteSettings();
      expect(reFetched.institution_name_bn).toBe("আননূর ইসলামিক ইন্সটিটিউট");
      expect(reFetched.emis_code).toBe("৭৭৭/২০২৫");
    });
  });

  describe("Media Center Fast Loading", () => {
    it("returns immediate cached videos with valid category, videoId, and embedUrl", async () => {
      const { getCachedPublishedVideos } = await import("@/lib/mediaCenter");
      const immediateVideos = getCachedPublishedVideos();
      expect(immediateVideos.length).toBeGreaterThan(0);
      expect(immediateVideos[0].title).toBeDefined();
      expect(immediateVideos[0].thumbnailUrl).toContain("youtube.com");
      expect(immediateVideos[0].embedUrl).toContain("youtube.com");
    });
  });
});
