import { describe, it, expect, vi } from "vitest";

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

describe("Firebase Upload", () => {
  it("should upload image and return URL", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ secure_url: "https://example.com/uploaded.jpg" }),
      } as Response),
    ));

    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "demo-cloud");
    vi.stubEnv("VITE_CLOUDINARY_UPLOAD_PRESET", "demo-preset");

    const { uploadImage } = await import("../lib/upload");
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const url = await uploadImage(file);
    expect(url).toBe("https://example.com/uploaded.jpg");
  });
});
