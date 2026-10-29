import { writeFile } from "node:fs/promises";
import path from "node:path";
import { routes, SITE_URL } from "./routes-metadata.mjs";

export function buildSitemapXml(baseUrl = SITE_URL) {
  const today = new Date().toISOString().split("T")[0];

  const xmlEntries = routes
    .map((r) => {
      // Root URL should strictly end with trailing slash according to canonical standard
      const loc = `${baseUrl}${r.path === "/" ? "/" : r.path}`;
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
