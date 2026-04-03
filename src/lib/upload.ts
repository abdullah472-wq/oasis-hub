const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();

type CloudinaryResourceType = "image" | "raw" | "auto";

const isPdfFile = (file: File): boolean => {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
};

const uploadToCloudinary = async (file: File, resourceType: CloudinaryResourceType): Promise<string> => {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText || response.statusText}`);
  }

  const payload = await response.json() as { secure_url?: string };
  if (!payload.secure_url) {
    throw new Error("Cloudinary upload failed: missing secure URL in response.");
  }

  return payload.secure_url;
};

export const uploadFile = async (file: File): Promise<string> => uploadToCloudinary(file, "auto");

export const uploadImage = async (file: File): Promise<string> => uploadToCloudinary(file, "image");

export const uploadDocument = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, isPdfFile(file) ? "image" : "raw");
};

export const getDownloadUrl = (url: string): string => {
  if (!url.includes("/res.cloudinary.com/") || !url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", "/upload/fl_attachment/");
};
