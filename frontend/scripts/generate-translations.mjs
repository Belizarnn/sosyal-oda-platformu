import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TRANSLATIONS_DIR = path.join(ROOT, "src", "i18n", "translations");
const TR_PATH = path.join(TRANSLATIONS_DIR, "tr.json");
const CATALOG_PATH = path.join(__dirname, "locale-catalog.json");

const TARGET_LOCALES = [
  "en",
  "de",
  "zh",
  "es",
  "hi",
  "pt",
  "ru",
  "ja",
  "ko",
  "id",
  "fr",
  "it",
  "fa",
];

const LOCALE_CODES = {
  en: "en",
  de: "de",
  zh: "zh-CN",
  es: "es",
  hi: "hi",
  pt: "pt",
  ru: "ru",
  ja: "ja",
  ko: "ko",
  id: "id",
  fr: "fr",
  it: "it",
  fa: "fa",
};

/** Professional copy overrides (placeholders preserved). */
const OVERRIDES = {
  en: {
    "common.brandName": "Platform",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin",
    "common.brandFull": "Social Room Platform",
    "common.brandTagline": "Social Room",
    "landing.hero.badge": "Cozy digital social space",
    "auth.fields.handle": "Handle",
    "rooms.watchParty": "Watch Party",
  },
  de: {
    "common.brandFull": "Social-Room-Plattform",
    "common.brandTagline": "Social Room",
    "rooms.watchParty": "Watch Party",
    "auth.fields.handle": "Handle",
    "nav.dashboard": "Dashboard",
  },
  fr: {
    "common.brandFull": "Plateforme Social Room",
    "rooms.watchParty": "Watch Party",
    "auth.fields.handle": "Handle",
    "nav.dashboard": "Tableau de bord",
  },
  es: {
    "common.brandFull": "Plataforma Social Room",
    "rooms.watchParty": "Watch Party",
    "auth.fields.handle": "Handle",
  },
  pt: {
    "common.brandFull": "Plataforma Social Room",
    "rooms.watchParty": "Watch Party",
    "auth.fields.handle": "Handle",
  },
  it: {
    "common.brandFull": "Piattaforma Social Room",
    "rooms.watchParty": "Watch Party",
    "auth.fields.handle": "Handle",
  },
  ja: {
    "rooms.watchParty": "ウォッチパーティ",
    "auth.fields.handle": "ハンドル",
  },
  ko: {
    "rooms.watchParty": "Watch Party",
    "auth.fields.handle": "핸들",
  },
};

async function googleTranslate(text, from, to) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    encodeURIComponent(from) +
    "&tl=" +
    encodeURIComponent(to) +
    "&dt=t&q=" +
    encodeURIComponent(text);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translate HTTP ${response.status}`);
  }
  const data = await response.json();
  return data[0].map((part) => part[0]).join("");
}

async function mapPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let index = 0;

  async function runWorker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, runWorker));
  return results;
}

async function rebuildCatalog(keys, tr) {
  const catalog = { tr: { ...tr } };

  for (const locale of TARGET_LOCALES) {
    const code = LOCALE_CODES[locale];
    console.log(`Rebuilding catalog locale ${locale} (${code})...`);

    const entries = await mapPool(
      keys,
      async (key) => [key, await googleTranslate(tr[key], "tr", code)],
      10,
    );

    catalog[locale] = Object.fromEntries(entries);
  }

  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify({ keys, catalog }, null, 2)}\n`, "utf8");
  console.log(`Saved catalog: ${CATALOG_PATH}`);
}

function orderedFromCatalog(keys, localeMap, locale) {
  const overrides = OVERRIDES[locale] ?? {};
  const out = {};

  for (const key of keys) {
    if (!(key in localeMap)) {
      throw new Error(`Missing key "${key}" for locale "${locale}" in locale-catalog.json`);
    }
    out[key] = overrides[key] ?? localeMap[key];
  }

  return out;
}

async function main() {
  if (!fs.existsSync(TR_PATH)) {
    throw new Error(`Source file not found: ${TR_PATH}`);
  }

  const tr = JSON.parse(fs.readFileSync(TR_PATH, "utf8"));
  const keys = Object.keys(tr);

  if (process.argv.includes("--rebuild-catalog")) {
    await rebuildCatalog(keys, tr);
  }

  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(
      `Missing ${CATALOG_PATH}. Run: node scripts/generate-translations.mjs --rebuild-catalog`,
    );
  }

  const { catalog } = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  console.log(`Read tr.json (${keys.length} keys)`);

  for (const locale of TARGET_LOCALES) {
    if (!catalog[locale]) {
      throw new Error(`Catalog missing locale: ${locale}`);
    }

    const ordered = orderedFromCatalog(keys, catalog[locale], locale);
    const outPath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
    console.log(`Wrote ${path.relative(ROOT, outPath)}`);
  }

  const allFiles = ["tr.json", ...TARGET_LOCALES.map((l) => `${l}.json`)];
  const report = allFiles.map((fileName) => {
    const filePath = path.join(TRANSLATIONS_DIR, fileName);
    const exists = fs.existsSync(filePath);
    const count = exists ? Object.keys(JSON.parse(fs.readFileSync(filePath, "utf8"))).length : 0;
    return { fileName, exists, count };
  });

  const counts = report.map((row) => row.count);
  const sameCount = new Set(counts).size === 1;
  const allExist = report.every((row) => row.exists);

  console.log("\nVerification:");
  for (const row of report) {
    console.log(`  ${row.fileName}: ${row.exists ? row.count : "MISSING"} keys`);
  }

  if (!allExist || !sameCount || counts[0] !== keys.length) {
    throw new Error("Verification failed: expected 14 files with identical key counts.");
  }

  console.log(`\nVerification PASSED: 14 JSON files, ${counts[0]} keys each.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
