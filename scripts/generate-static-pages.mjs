import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { routes, SITE_URL, INSTITUTION_NAME_BN } from "./routes-metadata.mjs";

async function generateStaticPages() {
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, "dist");
  const templatePath = path.join(distDir, "index.html");

  let baseHtml;
  try {
    baseHtml = await readFile(templatePath, "utf-8");
  } catch (err) {
    console.error("[static-gen] dist/index.html not found. Run vite build first.", err);
    process.exit(1);
  }

  let generatedCount = 0;

  for (const route of routes) {
    const isRoot = route.path === "/";
    const canonicalUrl = `${SITE_URL}${isRoot ? "/" : route.path}`;
    const fullTitle = isRoot
      ? "আননূর তাহফিজুল কুরআন মাদরাসা | Annoor Tahfizul Quran Madrasa"
      : `${route.titleBn} | ${INSTITUTION_NAME_BN}`;
    const description = route.descBn;
    const heading = route.heading || route.titleBn;

    let pageHtml = baseHtml;

    // 1. Replace Title
    pageHtml = pageHtml.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${fullTitle}</title>`
    );

    // 2. Replace Meta Description
    pageHtml = pageHtml.replace(
      /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="description" content="${description}" />`
    );

    // 3. Replace Canonical Link
    if (pageHtml.includes('rel="canonical"')) {
      pageHtml = pageHtml.replace(
        /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );
    } else {
      pageHtml = pageHtml.replace(
        /<\/head>/i,
        `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`
      );
    }

    // 4. Replace Open Graph Tags
    pageHtml = pageHtml.replace(
      /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:title" content="${fullTitle}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:description" content="${description}" />`
    );

    if (pageHtml.includes('property="og:url"')) {
      pageHtml = pageHtml.replace(
        /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );
    } else {
      pageHtml = pageHtml.replace(
        /<\/head>/i,
        `  <meta property="og:url" content="${canonicalUrl}" />\n</head>`
      );
    }

    // 5. Replace Twitter Tags
    pageHtml = pageHtml.replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="twitter:title" content="${fullTitle}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="twitter:description" content="${description}" />`
    );

    // 6. Inject Semantic Pre-Render Fallback inside <div id="root"></div>
    // This allows search crawlers (Google, Bingbot, Yandex) to index rich text even without waiting for JS execution.
    // React hydrate/createRoot seamlessly replaces this content when it mounts.
    const crawlableFallback = `<div id="root"><main style="min-height:80vh;padding:3rem 1.5rem;font-family:'Noto Serif Bengali',serif,system-ui;background:#f8fafc;color:#0f172a;"><div style="max-width:800px;margin:0 auto;text-align:center;"><h1 style="font-size:2rem;font-weight:700;color:#0c4a3e;margin-bottom:1rem;">${heading}</h1><p style="font-size:1.1rem;line-height:1.7;color:#334155;max-width:680px;margin:0 auto 1.5rem;">${description}</p><div style="display:inline-flex;align-items:center;gap:0.75rem;padding:0.5rem 1rem;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:9999px;font-size:0.875rem;color:#065f46;"><span>${INSTITUTION_NAME_BN}</span> • <span>কাপাসিয়া, গাজীপুর</span></div></div></main></div>`;

    pageHtml = pageHtml.replace(
      /<div\s+id=["']root["']>\s*<\/div>/i,
      crawlableFallback
    );

    if (isRoot) {
      // Overwrite dist/index.html with the normalized root canonical
      await writeFile(templatePath, pageHtml, "utf-8");
      generatedCount++;
    } else {
      const cleanSubPath = route.path.replace(/^\/+/, "");

      // 1. Write dist/<route>.html (for direct server rewrite e.g. /about -> /about.html)
      const flatHtmlPath = path.join(distDir, `${cleanSubPath}.html`);
      await writeFile(flatHtmlPath, pageHtml, "utf-8");

      // 2. Write dist/<route>/index.html (for directory-based webservers like Apache DirectoryIndex & static hosts)
      const routeDir = path.join(distDir, cleanSubPath);
      await mkdir(routeDir, { recursive: true });
      const dirHtmlPath = path.join(routeDir, "index.html");
      await writeFile(dirHtmlPath, pageHtml, "utf-8");

      generatedCount++;
    }
  }

  console.log(`[static-gen] Successfully pre-rendered ${generatedCount} static routes in dist/ for SEO crawlers.`);
}

generateStaticPages().catch((err) => {
  console.error("[static-gen] Static page generation failed:", err);
  process.exit(1);
});

