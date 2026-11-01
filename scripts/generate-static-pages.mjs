import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { routes, SITE_URL, INSTITUTION_NAME_BN, INSTITUTION_NAME_EN } from "./routes-metadata.mjs";

function getPageSpecificHtml(route) {
  const p = route.path;

  if (p === "/") {
    return `
      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">আমাদের মূল শিক্ষা বিভাগসমূহ</h2>
        <ul style="text-align:left;max-width:720px;margin:0 auto 1.5rem;line-height:1.8;color:#334155;">
          <li><strong>নূরানী বিভাগ:</strong> বিশুদ্ধ কুরআন তিলাওয়াত, মাসনূন দোয়া, জরুরি মাসআলা ও দ্বীনি শিক্ষার বুনিয়াদ গঠন।</li>
          <li><strong>নাজেরা বিভাগ:</strong> তাজবীদ সহকারে বিশুদ্ধ উচ্চারণে সম্পূর্ণ কুরআনুল কারীম পাঠ সমাপ্তিকরণ।</li>
          <li><strong>আন্তর্জাতিক মানের হিফজুল কুরআন:</strong> অভিজ্ঞ ও আন্তর্জাতিক মানের হাফেজ শিক্ষকমণ্ডলীর তত্ত্বাবধানে পূর্ণাঙ্গ হিফজ সমাপ্তি।</li>
          <li><strong>সমন্বিত আধুনিক জেনারেল একাডেমি:</strong> নূরানী ও হিফজের পাশাপাশি বাংলা, ইংরেজি, গণিত, বিজ্ঞান ও কম্পিউটার শিক্ষার আধুনিক পাঠদান।</li>
        </ul>
      </section>

      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">নতুন শিক্ষাবর্ষে ভর্তি তথ্য ও সেশন ২০২৬</h2>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1rem;">
          ২০২৬ শিক্ষাবর্ষে নূরানী, নাজেরা ও হিফজ শাখায় আবাসিক, অনাবাসিক ও ডে-কেয়ার সুবিধাসহ সীমিত আসনে ভর্তি চলছে।
          অনলাইনে ঘরে বসেই ভর্তির আবেদন ফরম পূরণ করে আবেদন ট্র্যাকিং কোড সংগ্রহ করা যায়।
        </p>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1.5rem;">
          <strong>ফি কাঠামো:</strong> অনাবাসিক মাসিক ফি ১,০০০ — ২,৫০০ টাকা | আবাসিক মাসিক ফি ৫,০০০ — ৯,০০০ টাকা (তিন বেলা পুষ্টিকর খাবারসহ) | এককালীন ভর্তি ফি ৩,০০০ টাকা।
        </p>
      </section>

      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">মাদরাসার প্রধান বৈশিষ্ট্য ও সুযোগ-সুবিধা</h2>
        <ul style="text-align:left;max-width:720px;margin:0 auto 1.5rem;line-height:1.8;color:#334155;">
          <li>শীতাতপ নিয়ন্ত্রিত (AC) আধুনিক হিফজখানা ও নিরিবিলি পাঠোপযোগী পরিবেশ।</li>
          <li>দক্ষ, আন্তর্জাতিক সনদপ্রাপ্ত ক্বারী ও নিবেদিতপ্রাণ শিক্ষক মণ্ডলী।</li>
          <li>স্বাস্থ্যসম্মত পুষ্টিকর খাবার ও উন্নত আবাসিক হোস্টেল ব্যবস্থা।</li>
          <li>সার্বক্ষণিক সিসিটিভি ক্যামেরা ও কঠোর নিরাপত্তা নজরদারি।</li>
          <li>নিয়মিত স্বাস্থ্য পরীক্ষা ও সার্বক্ষণিক প্রাথমিক চিকিৎসা সেবা।</li>
        </ul>
      </section>

      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">স্বীকৃত শিক্ষা বোর্ডসমূহ</h2>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1.5rem;">
          বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (বেফাক) • হুফ্ফাজুল কুরআন ফাউন্ডেশন বাংলাদেশ • নূরানী তা'লীমুল কুরআন বোর্ড বাংলাদেশ।
        </p>
      </section>
    `;
  }

  if (p === "/admission" || p === "/admission-form") {
    return `
      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">ভর্তি নির্দেশিকা ও ফি কাঠামো (২০২৬ শিক্ষাবর্ষ)</h2>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1rem;">
          স্বচ্ছ ফি নীতি ও সুশৃঙ্খল ভর্তি প্রক্রিয়ায় অংশ নিন। অনলাইন অথবা মাদরাসা অফিসে সরাসরি উপস্থিত হয়ে ভর্তি সম্পন্ন করা যাবে।
        </p>
        <ul style="text-align:left;max-width:720px;margin:0 auto 1.5rem;line-height:1.8;color:#334155;">
          <li><strong>এককালীন ভর্তি ফি:</strong> ৳৩,০০০ (ভর্তির সময় প্রযোজ্য)</li>
          <li><strong>অনাবাসিক মাসিক বেতন:</strong> ৳১,০০০ — ৳২,৫০০ (শ্রেণিভেদে)</li>
          <li><strong>আবাসিক মাসিক বেতন:</strong> ৳৫,০০০ — ৳৯,০০০ (আবাসন ও তিন বেলা মানসম্মত পুষ্টিকর খাবারসহ)</li>
        </ul>
        <h3 style="font-size:1.25rem;font-weight:600;color:#0c4a3e;margin-bottom:0.5rem;">প্রয়োজনীয় কাগজপত্র:</h3>
        <ul style="text-align:left;max-width:720px;margin:0 auto 1.5rem;line-height:1.8;color:#334155;">
          <li>শিক্ষার্থীর ডিজিটাল অনলাইন জন্মনিবন্ধন সনদের ফটোকপি।</li>
          <li>পাসপোর্ট সাইজের রঙিন ছবি (৪ কপি)।</li>
          <li>পিতা ও মাতার জাতীয় পরিচয়পত্রের (NID) ফটোকপি।</li>
          <li>পূর্ববর্তী মাদরাসা বা স্কুলের ছাড়পত্র/প্রত্যয়নপত্র (প্রযোজ্য ক্ষেত্রে)।</li>
        </ul>
      </section>
    `;
  }

  if (p === "/about") {
    return `
      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">আমাদের লক্ষ্য ও প্রাতিষ্ঠানিক পরিচিতি</h2>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1rem;">
          আননূর তাহফিজুল কুরআন মাদরাসা গাজীপুর জেলার কাপাসিয়ায় অবস্থিত একটি আদর্শ ও আধুনিক ইসলামিক শিক্ষা প্রতিষ্ঠান।
          এখানে পবিত্র কুরআনের বিশুদ্ধ হিফজ ও সুন্নাহভিত্তিক চরিত্র গঠনের পাশাপাশি জাতীয় শিক্ষাক্রমের আধুনিক জ্ঞান অর্জনের সমন্বিত সুযোগ রয়েছে।
        </p>
        <ul style="text-align:left;max-width:720px;margin:0 auto 1.5rem;line-height:1.8;color:#334155;">
          <li><strong>মূলনীতি:</strong> একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে।</li>
          <li><strong>ভিশন:</strong> প্রতিটি শিক্ষার্থীকে আদর্শ হাফেজে কুরআন এবং আধুনিক যুগের চ্যালেঞ্জ মোকাবিলার যোগ্য নাগরিক হিসেবে গড়ে তোলা।</li>
          <li><strong>অবস্থান:</strong> প্রধান ক্যাম্পাস — কাপাসিয়া বাজার রোড, কাপাসিয়া, গাজীপুর।</li>
        </ul>
      </section>
    `;
  }

  if (p === "/curriculum") {
    return `
      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">সমন্বিত শিক্ষা কারিকুলাম ও সিলেবাস</h2>
        <ul style="text-align:left;max-width:720px;margin:0 auto 1.5rem;line-height:1.8;color:#334155;">
          <li><strong>নূরানী বিভাগ (প্লে — ৩য় শ্রেণি সমমান):</strong> নুরানী তালীমুল কুরআন বোর্ডের নিয়মে সহজ পদ্ধতিতে কোরআন রিডিং, সুন্দর হস্তলিপি, দোয়া ও বাংলা-ইংরেজি-গণিত।</li>
          <li><strong>নাজেরা বিভাগ:</strong> আন্তর্জাতিক মানের তিলাওয়াত ও মাখরাজ-সিফাত অনুযায়ী বিশুদ্ধ উচ্চারণ অনুশীলন।</li>
          <li><strong>হিফজুল কুরআন বিভাগ:</strong> বিশেষ স্মৃতিবর্ধক বৈজ্ঞানিক পদ্ধতিতে প্রতিদিনের ছবক, সাত ছবক ও আমোখতা তদারকি।</li>
          <li><strong>জেনারেল একাডেমি:</strong> বাংলা, ইংরেজি গ্রামার, গণিত, বিজ্ঞান ও কম্পিউটার বেসিক শিক্ষা।</li>
        </ul>
      </section>
    `;
  }

  if (p === "/contact") {
    return `
      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">যোগাযোগ ও দিকনির্দেশনা</h2>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1rem;">
          <strong>ক্যাম্পাস ঠিকানা:</strong> আননূর তাহফিজুল কুরআন মাদরাসা, কাপাসিয়া বাজার রোড, কাপাসিয়া, গাজীপুর, ঢাকা।
        </p>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1rem;">
          <strong>হটলাইন ও ফোন:</strong> <a href="tel:01820811511" style="color:#0c4a3e;font-weight:bold;">01820-811511</a>, <a href="tel:01581818368" style="color:#0c4a3e;font-weight:bold;">01581-818368</a>
        </p>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1.5rem;">
          <strong>ইমেইল:</strong> info@annoor.edu.bd | <strong>অফিস সময়:</strong> প্রতিদিন সকাল ৮:০০টা — রাত ৮:০০টা
        </p>
      </section>
    `;
  }

  if (p === "/teachers") {
    return `
      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">অভিজ্ঞ ও দক্ষ শিক্ষকমণ্ডলী</h2>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1.5rem;">
          আন্তর্জাতিক মানের হাফেজ, সনদপ্রাপ্ত ক্বারী ও স্নাতক ডিগ্রিধারী অভিজ্ঞ শিক্ষকমণ্ডলীর সার্বক্ষণিক তত্ত্বাবধানে পাঠদান পরিচালিত হয়।
          শিক্ষক ও শিক্ষার্থীর নিবিড় সম্পর্কের মাধ্যমে প্রতিটি শিশুর মেধা বিকাশে যত্ন নেওয়া হয়।
        </p>
      </section>
    `;
  }

  if (p === "/huffaz") {
    return `
      <section style="margin-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">গৌরবোজ্জ্বল কৃতি হাফেজবৃন্দ</h2>
        <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1.5rem;">
          আলহামদুলিল্লাহ, আননূর তাহফিজুল কুরআন মাদরাসা থেকে প্রতি বছর বহু শিক্ষার্থী অত্যন্ত অল্প সময়ে সম্পূর্ণ কুরআন মাজীদ হিফজ সম্পন্ন করে
          জাতীয় ও আন্তর্জাতিক হিফজুল কুরআন প্রতিযোগিতায় অংশ নিয়ে গৌরব বয়ে আনছে।
        </p>
      </section>
    `;
  }

  return `
    <section style="margin-top:2rem;">
      <h2 style="font-size:1.5rem;font-weight:700;color:#0c4a3e;margin-bottom:0.75rem;">${route.heading}</h2>
      <p style="color:#334155;line-height:1.7;max-width:720px;margin:0 auto 1.5rem;">
        ${route.descBn}
      </p>
    </section>
  `;
}

function buildRichSemanticHtml(route) {
  const heading = route.heading || route.titleBn;
  const description = route.descBn;
  const pageSpecific = getPageSpecificHtml(route);

  return `<div id="root">
  <header style="background:#0c4a3e;color:#ffffff;padding:1rem 1.5rem;border-bottom:3px solid #16a34a;font-family:'Noto Serif Bengali',serif,system-ui;">
    <div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;">
      <div>
        <a href="/" style="color:#ffffff;text-decoration:none;font-size:1.25rem;font-weight:700;">${INSTITUTION_NAME_BN}</a>
        <p style="margin:0.25rem 0 0;font-size:0.8rem;color:#a7f3d0;">একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে</p>
      </div>
      <nav style="display:flex;flex-wrap:wrap;gap:0.75rem;font-size:0.875rem;">
        <a href="/" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;border-radius:0.375rem;background:rgba(255,255,255,0.1);">হোম</a>
        <a href="/about" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">আমাদের সম্পর্কে</a>
        <a href="/admission" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">ভর্তি তথ্য</a>
        <a href="/curriculum" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">কারিকুলাম</a>
        <a href="/teachers" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">শিক্ষকবৃন্দ</a>
        <a href="/huffaz" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">কৃতি হাফেজ</a>
        <a href="/notices" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">নোটিশ</a>
        <a href="/gallery" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">গ্যালারি</a>
        <a href="/media" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">মিডিয়া</a>
        <a href="/downloads" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">ডাউনলোড</a>
        <a href="/contact" style="color:#ffffff;text-decoration:none;padding:0.25rem 0.5rem;">যোগাযোগ</a>
      </nav>
    </div>
  </header>

  <main style="min-height:70vh;padding:3rem 1.5rem;font-family:'Noto Serif Bengali',serif,system-ui;background:#f8fafc;color:#0f172a;">
    <div style="max-width:900px;margin:0 auto;text-align:center;">
      <h1 style="font-size:2.2rem;font-weight:700;color:#0c4a3e;margin-bottom:1rem;line-height:1.3;">${heading}</h1>
      <p style="font-size:1.15rem;line-height:1.75;color:#334155;max-width:760px;margin:0 auto 1.5rem;">${description}</p>
      
      <div style="display:inline-flex;align-items:center;gap:0.75rem;padding:0.5rem 1.25rem;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:9999px;font-size:0.9rem;color:#065f46;margin-bottom:2rem;">
        <span>${INSTITUTION_NAME_BN}</span> • <span>কাপাসিয়া, গাজীপুর</span> • <span>হটলাইন: 01820811511</span>
      </div>

      ${pageSpecific}

      <div style="margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid #e2e8f0;display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;">
        <a href="/admission-form" style="display:inline-block;padding:0.6rem 1.25rem;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600;border-radius:9999px;">অনলাইন ভর্তি আবেদন</a>
        <a href="/contact" style="display:inline-block;padding:0.6rem 1.25rem;background:#0c4a3e;color:#ffffff;text-decoration:none;font-weight:600;border-radius:9999px;">সরাসরি যোগাযোগ করুন</a>
      </div>
    </div>
  </main>

  <footer style="background:#0f172a;color:#94a3b8;padding:2.5rem 1.5rem;font-family:'Noto Serif Bengali',serif,system-ui;font-size:0.875rem;border-top:1px solid #334155;">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:2rem;">
      <div>
        <h3 style="color:#ffffff;font-size:1.1rem;margin-bottom:0.75rem;">${INSTITUTION_NAME_BN}</h3>
        <p style="line-height:1.6;margin:0 0 0.5rem;">একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে। নূরানী, নাজেরা ও আন্তর্জাতিক হিফজ প্রতিষ্ঠান।</p>
        <p style="margin:0;">কাপাসিয়া বাজার রোড, কাপাসিয়া, গাজীপুর।</p>
      </div>
      <div>
        <h4 style="color:#ffffff;font-size:1rem;margin-bottom:0.75rem;">গুরুত্বপূর্ণ লিংক</h4>
        <ul style="list-style:none;padding:0;margin:0;line-height:2;">
          <li><a href="/about" style="color:#cbd5e1;text-decoration:none;">আমাদের সম্পর্কে</a></li>
          <li><a href="/admission" style="color:#cbd5e1;text-decoration:none;">ভর্তি নির্দেশিকা ও ফি</a></li>
          <li><a href="/curriculum" style="color:#cbd5e1;text-decoration:none;">শিক্ষা কারিকুলাম</a></li>
          <li><a href="/notices" style="color:#cbd5e1;text-decoration:none;">নোটিশ বোর্ড</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color:#ffffff;font-size:1rem;margin-bottom:0.75rem;">যোগাযোগ ও হটলাইন</h4>
        <p style="margin:0 0 0.5rem;color:#cbd5e1;">ফোন: 01820811511 / 01581818368</p>
        <p style="margin:0 0 0.5rem;color:#cbd5e1;">ইমেইল: info@annoor.edu.bd</p>
        <p style="margin:0;color:#cbd5e1;">ওয়েবসাইট: https://annoor.readiin.com</p>
      </div>
    </div>
    <div style="max-width:1100px;margin:2rem auto 0;padding-top:1.5rem;border-top:1px solid #1e293b;text-align:center;color:#64748b;font-size:0.8rem;">
      © 2026 ${INSTITUTION_NAME_BN}। সর্বস্বত্ব সংরক্ষিত।
    </div>
  </footer>
</div>`;
}

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

    // 6. Inject Rich Pre-Render Semantic HTML inside <div id="root"></div>
    // When someone views page source (Ctrl+U) or a search crawler indexes the page,
    // they get complete semantic HTML with headers, nav links, detailed sections, and footers.
    // React hydrate/createRoot replaces this content automatically when mounted in the browser.
    const richFallback = buildRichSemanticHtml(route);

    pageHtml = pageHtml.replace(
      /<div\s+id=["']root["']>[\s\S]*?<\/div>/i,
      richFallback
    );

    if (isRoot) {
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

  console.log(`[static-gen] Successfully generated rich pre-rendered static HTML for ${generatedCount} routes in dist/.`);
}

generateStaticPages().catch((err) => {
  console.error("[static-gen] Static page generation failed:", err);
  process.exit(1);
});
