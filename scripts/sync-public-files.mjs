import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const distDir = path.join(rootDir, "dist");

const sync = async () => {
  await mkdir(path.join(distDir, "downloads"), { recursive: true });
  await copyFile(path.join(publicDir, ".htaccess"), path.join(distDir, ".htaccess"));
  await copyFile(path.join(publicDir, "_redirects"), path.join(distDir, "_redirects"));
  await copyFile(path.join(publicDir, "sitemap.xml"), path.join(distDir, "sitemap.xml"));
  await copyFile(path.join(publicDir, "robots.txt"), path.join(distDir, "robots.txt"));
};

await sync();
