import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const distDir = path.join(rootDir, "dist");

const sync = async () => {
  await mkdir(path.join(distDir, "downloads"), { recursive: true });
  await copyFile(path.join(publicDir, ".htaccess"), path.join(distDir, ".htaccess"));
};

await sync();
