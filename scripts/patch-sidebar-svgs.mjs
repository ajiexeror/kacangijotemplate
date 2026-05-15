/**
 * One-off: replace sidebar Bootstrap icons + old Kelas SVG with Heroicons-style SVGs.
 * Run: node scripts/patch-sidebar-svgs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const BRAND_SVG = `          <span class="sidebar-brand-icon d-inline-flex align-items-center justify-content-center rounded-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sidebar-brand-svg" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
            </svg>
          </span>`;

const OLD_BRAND = `          <span class="sidebar-brand-icon d-inline-flex align-items-center justify-content-center rounded-3">
            <i class="bi bi-mortarboard-fill"></i>
          </span>`;

const DASHBOARD_PATH =
  'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25A2.25 2.25 0 0 1 8.25 10.5H6A2.25 2.25 0 0 1 3.75 8.25V6zM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25zM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 8.25h-2.25A2.25 2.25 0 0 1 13.5 6zM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25z';

const OLD_KELAS_BLOCK = `                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" class="sidebar-nav-icon" aria-hidden="true">
                  <path
                    d="M192 448C245 448 288 491 288 544C288 561.7 273.7 576 256 576L32 576C14.3 576 0 561.7 0 544C0 491 43 448 96 448L192 448zM544 96C579.3 96 608 124.7 608 160L608 448C608 481.1 582.8 508.4 550.5 511.7L544 512L332.9 512C327.8 487.8 316.6 465.9 300.8 448L352 448L352 416C352 398.3 366.3 384 384 384L480 384C497.7 384 512 398.3 512 416L512 448L544 448L544 160L192 160L192 217.3C177.2 211.3 161 208 144 208C138.6 208 133.2 208.3 128 209L128 160C128 124.7 156.7 96 192 96L544 96zM144 416C99.8 416 64 380.2 64 336C64 291.8 99.8 256 144 256C188.2 256 224 291.8 224 336C224 380.2 188.2 416 144 416z"
                  />
                </svg>`;

const NEW_KELAS_SVG = `                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sidebar-nav-icon" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h9.75A2.25 2.25 0 0 1 20.25 6v.878m-12-.84v9.568c0 .414.336.75.75.75h9.75a.75.75 0 0 0 .75-.75V6.038m-12-.84A2.25 2.25 0 0 1 5.25 2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v12.84m-17.25 0h17.25" />
                </svg>`;

const icon = (pathD) =>
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sidebar-nav-icon" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="${pathD}" /></svg>`;

const REPLACEMENTS = [
  ["<i class=\"bi bi-people\"></i>", icon("M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z")],
  ["<i class=\"bi bi-person-badge\"></i>", icon("M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z")],
  ["<i class=\"bi bi-receipt\"></i>", icon("M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z")],
  ["<i class=\"bi bi-credit-card\"></i>", icon("M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z")],
  ["<i class=\"bi bi-calendar-check\"></i>", icon("M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12V15Zm3 0h.008v.008H15V15Zm-6 6h.008v.008H12V21Zm3 0h.008v.008H15V21Z")],
  ["<i class=\"bi bi-shield-lock\"></i>", icon("M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.763-.59-3.849a6.086 6.086 0 0 0-2.357-.464 6.086 6.086 0 0 0-2.357.464 12.732 12.732 0 0 0-.59 3.849Z")],
  [
    "<i class=\"bi bi-key\"></i>",
    icon(
      "M15.75 8.25a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm1.5 0c0 2.556-1.875 4.875-4.5 4.875V18a2.25 2.25 0 0 1-2.25 2.25H9.75A2.25 2.25 0 0 1 7.5 18v-.75c0-.621.504-1.125 1.125-1.125h2.625a1.125 1.125 0 0 0 1.125-1.125v-1.5A3.375 3.375 0 0 1 15.75 8.25Z"
    ),
  ],
  ["<i class=\"bi bi-person-lines-fill\"></i>", icon("M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 11.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z")],
];

const GEAR_PATHS = [
  "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.437.613-.431.992a6.932 6.932 0 0 1 0 .255c-.006.378.138.75.431.99l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z",
  "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
];

const GEAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sidebar-nav-icon" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="${GEAR_PATHS[0]}" /><path stroke-linecap="round" stroke-linejoin="round" d="${GEAR_PATHS[1]}" /></svg>`;

const files = fs.readdirSync(root).filter((f) => f.endsWith(".html"));

const GURU_USER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sidebar-nav-icon" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`;

for (const f of files) {
  const fp = path.join(root, f);
  let s = fs.readFileSync(fp, "utf8");
  if (!s.includes("sidebar-nav")) continue;

  const hadCRLF = s.includes("\r\n");
  if (hadCRLF) s = s.replace(/\r\n/g, "\n");

  s = s.replace(OLD_BRAND, BRAND_SVG);
  s = s.replace(OLD_KELAS_BLOCK, NEW_KELAS_SVG);

  // Normalize dashboard icon path (Heroicons squares-2x2)
  s = s.replace(
    /<path stroke-linecap="round" stroke-linejoin="round" d="M3\.75 6A2\.25 2\.25 0 0 1 6 3\.75h2\.25A2\.25 2\.25 0 0 1 10\.5 6v2\.25a2\.25 2\.25 0 0 1-2\.25 2\.25H6a2\.25 2\.25 0 0 1-2\.25-2\.25V6ZM3\.75 15\.75A2\.25 2\.25 0 0 1 6 13\.5h2\.25a2\.25 2\.25 0 0 1 2\.25 2\.25V18a2\.25 2\.25 0 0 1-2\.25 2\.25H6A2\.25 2\.25 0 0 1 3\.75 18v-2\.25ZM13\.5 6a2\.25 2\.25 0 0 1 2\.25-2\.25H18A2\.25 2\.25 0 0 1 20\.25 6v2\.25A2\.25 2\.25 0 0 1 18 10\.5h-2\.25a2\.25 2\.25 0 0 1-2\.25-2\.25V6ZM13\.5 15\.75a2\.25 2\.25 0 0 1 2\.25-2\.25H18a2\.25 2\.25 0 0 1 2\.25 2\.25V18A2\.25 2\.25 0 0 1 18 20\.25h-2\.25A2\.25 2\.25 0 0 1 13\.5 18v-2\.25Z" \/>/g,
    `<path stroke-linecap="round" stroke-linejoin="round" d="${DASHBOARD_PATH}" />`
  );
  s = s.replace(
    /<path stroke-linecap="round" stroke-linejoin="round" d="M3\.75 6A2\.25 2\.25 0 0 1 6 3\.75h2\.25A2\.25 2\.25 0 0 1 10\.5 6v2\.25A2\.25 2\.25 0 0 1 8\.25 10\.5H6A2\.25 2\.25 0 0 1 3\.75 8\.25V6zM3\.75 15\.75A2\.25 2\.25 0 0 1 6 13\.5h2\.25a2\.25 2\.25 0 0 1 2\.25 2\.25V18a2\.25 2\.25 0 0 1-2\.25 2\.25H6A2\.25 2\.25 0 0 1 3\.75 18v-2\.25zM13\.5 6a2\.25 2\.25 0 0 1 2\.25-2\.25H18A2\.25 2\.25 0 0 1 20\.25 6v2\.25A2\.25 2\.25 0 0 1 18 8\.25h-2\.25A2\.25 2\.25 0 0 1 13\.5 6zM13\.5 15\.75a2\.25 2\.25 0 0 1 2\.25-2\.25H18a2\.25 2\.25 0 0 1 2\.25 2\.25V18A2\.25 2\.25 0 0 1 18 20\.25h-2\.25A2\.25 2\.25 0 0 1 13\.5 18v-2\.25z" \/>/g,
    `<path stroke-linecap="round" stroke-linejoin="round" d="${DASHBOARD_PATH}" />`
  );

  for (const [from, to] of REPLACEMENTS) {
    if (!s.includes(from)) continue;
    s = s.split(from).join(to);
  }

  s = s.replace("<i class=\"bi bi-gear\"></i>", GEAR_SVG);

  s = s.replace(
    /(href="guru\.html"[^>]*>)\s*<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" fill="none" viewBox="0 0 24 24" stroke-width="1\.5" stroke="currentColor" class="sidebar-nav-icon" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4\.26 10\.147[^"]+" \/><\/svg>/g,
    `$1${GURU_USER_SVG}`
  );

  if (hadCRLF) s = s.replace(/\n/g, "\r\n");

  fs.writeFileSync(fp, s, "utf8");
  console.log("patched", f);
}
