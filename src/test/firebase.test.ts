import { describe, it, expect, vi } from "vitest";

vi.mock("firebase/storage", () => ({
  ref: vi.fn(() => ({ storage: {}, path: "test" })),
  uploadBytes: vi.fn(() => Promise.resolve({})),
  getDownloadURL: vi.fn(() => Promise.resolve("https://example.com/uploaded.jpg")),
  getStorage: vi.fn(() => ({})),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

describe("Firebase Upload", () => {
  it("should upload image and return URL", async () => {
    const { uploadImage } = await import("../lib/upload");
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const url = await uploadImage(file);
    expect(url).toBe("https://example.com/uploaded.jpg");
  });
});
