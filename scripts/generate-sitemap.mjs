import { writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = (process.env.VITE_SITE_URL || "https://oasis-hub-eight.vercel.app").replace(/\/+$/, "");

const routes = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about", priority: "0.9", changefreq: "weekly" },
  { path: "/admission", priority: "0.9", changefreq: "weekly" },
  { path: "/admission-form", priority: "0.9", changefreq: "weekly" },
  { path: "/curriculum", priority: "0.8", changefreq: "weekly" },
  { path: "/notices", priority: "0.9", changefreq: "daily" },
  { path: "/teachers", priority: "0.8", changefreq: "monthly" },
  { path: "/huffaz", priority: "0.8", changefreq: "monthly" },
  { path: "/achievements", priority: "0.8", changefreq: "monthly" },
  { path: "/news", priority: "0.8", changefreq: "daily" },
  { path: "/events", priority: "0.8", changefreq: "weekly" },
  { path: "/gallery", priority: "0.7", changefreq: "weekly" },
  { path: "/media", priority: "0.7", changefreq: "weekly" },
  { path: "/downloads", priority: "0.8", changefreq: "weekly" },
  { path: "/virtual-tour", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/sitemap", priority: "0.6", changefreq: "monthly" },
];

export function buildSitemapXml(baseUrl = SITE_URL) {
  const today = new Date().toISOString().split("T")[0];

  const xmlEntries = routes
    .map((r) => {
      const loc = `${baseUrl}${r.path === "/" ? "" : r.path}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlEntries}
</urlset>
`;
}

async function run() {
  const rootDir = process.cwd();
  const targetPath = path.join(rootDir, "public", "sitemap.xml");
  const xmlContent = buildSitemapXml();

  await writeFile(targetPath, xmlContent, "utf-8");
  console.log(`[sitemap] Generated sitemap.xml with ${routes.length} routes at ${targetPath}`);
}

run().catch((err) => {
  console.error("[sitemap] Failed to generate sitemap:", err);
  process.exit(1);
});
