import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};

export const uploadImage = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  const ext = file.name.split(".").pop();
  const path = `images/${timestamp}.${ext}`;
  return uploadFile(file, path);
};

export const uploadResult = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  const ext = file.name.split(".").pop();
  const path = `results/${timestamp}.${ext}`;
  return uploadFile(file, path);
};
