/**
 * build_resume.js
 *
 * Standalone resume generator. Pulls base facts (experience, skills,
 * industries, author/contact info) straight from this site's own
 * Jekyll data files, so the resume never drifts out of sync with
 * jordanread.com/resume/. Per-application tailoring (which posting
 * you're targeting, which bullets to foreground, extra emphasis
 * lines) lives in the TAILORING block below — edit that per job,
 * leave the data-loading code alone.
 *
 * Colors match the site's live "Ember & Fog" palette (_sass/_theme.scss,
 * light-mode values) so the resume stays visually in sync with
 * jordanread.com/resume/ rather than drifting to its own scheme.
 *
 * Contact details (email/phone) are NOT stored in this file, so they
 * never end up in git history. They're read from tools/resume.local.json
 * (gitignored) if present — copy tools/resume.local.example.json to
 * tools/resume.local.json and fill it in. Falls back to _config.yml's
 * author.email/author.phone (usually blank on the public site) if that
 * file doesn't exist.
 *
 * Usage:
 *   node build_resume.js [--site ../..] [--out ./out]
 *
 * --site   Path to the jr.com repo root (must contain _config.yml and
 *          _data/). Defaults to the parent of this script's folder,
 *          which is correct if this lives in a `tools/` folder at the
 *          repo root (and tools/ is excluded from Jekyll's build via
 *          `exclude:` in _config.yml).
 * --out    Output directory for the .pdf. Defaults to ./out
 *
 * The header logo is read from assets/images-raw/favicon.png (the site's
 * source art, not the small pre-cropped assets/images/favicon.png used for
 * web favicons) and auto-trimmed to its non-transparent bounding box at
 * build time — see trimTransparentPadding() — so there's no separate
 * export step to remember if the source art changes.
 *
 * Requires: npm install pdfmake js-yaml pngjs
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const pdfMake = require("pdfmake");
const { PNG } = require("pngjs");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function getArg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const SITE_DIR = path.resolve(__dirname, getArg("--site", ".."));
const OUT_DIR = path.resolve(__dirname, getArg("--out", "./out"));

// ---------------------------------------------------------------------------
// Local contact info (gitignored — see header comment)
// ---------------------------------------------------------------------------

function loadLocalContact() {
  const p = path.join(__dirname, "resume.local.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const localContact = loadLocalContact();

// ---------------------------------------------------------------------------
// TAILORING — edit this block per job application. Everything else in
// this file is generic plumbing that shouldn't need to change.
// ---------------------------------------------------------------------------

const TAILORING = {
  fileSlug: "Jordan_Read_Resume_Senior_.NET_Developer",

  headline: "Senior .NET Developer  |  Azure Solution Architect",

  // Falls back to author.description from _config.yml if left blank.
  summary:
    "Senior software engineer and solution architect with 17+ years of hands-on delivery across the .NET and Microsoft Azure stack, including C#, .NET Core, ASP.NET Core, Azure App Service-hosted enterprise systems, and Azure Service Bus. Extensive experience building service-oriented integrations and messaging-driven architectures (Service Bus, WCF, ActiveMQ, protobuf) for organizations managing sensitive financial, payment, and transactional data, plus prior experience on a U.S. government sustainment contract. Comfortable owning problems end-to-end — from architecture through security-conscious implementation, CI/CD automation, and production support — inside complex, partially documented enterprise environments. Seeking to bring deep .NET/Azure expertise and a track record in regulated, data-sensitive, and government domains to a long-term enterprise application initiative.",

  // location is fine to keep here since it isn't sensitive and can
  // legitimately vary per application (e.g. "Remote, United States"
  // vs. a specific city). email/phone come from resume.local.json —
  // see header comment — and are NOT set here on purpose.
  contact: {
    location: "Remote, United States",
  },

  // Rename/reorder skill groups from _data/skills.yml here if you
  // want a different label order for this application. Leave empty
  // to use the groups/order exactly as they appear in skills.yml.
  skillGroupOrder: ["Cloud & DevOps", "Data & Integration", "Backend & APIs", "Practices", "Frontend"],

  // Extra bullet lines injected at the START of a given group (by
  // its `group` name in skills.yml). Use this for job-specific
  // emphasis that doesn't belong permanently in the site's data.
  skillGroupExtras: {
    "Data & Integration": [
      "Azure Service Bus (extensive) — messaging patterns also transferable to Azure Event Grid",
    ],
  },

  // Per-company overrides, keyed by the exact `company` value in
  // _data/experience.yml. `highlights` replaces that job's bullets
  // entirely; `maxHighlights` trims the (possibly overridden) list.
  experienceOverrides: {
    "National Seating & Mobility": {
      highlights: [
        "Worked within a non-documented Dynamics 365 system of record built on an Azure App Service-hosted n-tier architecture, becoming the go-to engineer for stabilizing undocumented enterprise integrations.",
        "Used Azure Service Bus extensively to build and maintain asynchronous, message-driven integrations between enterprise systems.",
        "Applied TDD and CI/CD discipline to stabilize and extend a production .NET Core Web API and Angular stack backed by SQL Server, reducing regression risk in a business-critical enterprise application.",
        "Designed and implemented versioning for a RESTful .NET Core API, and contributed to a geographic exclusivity system governing protected product data.",
        "Advised leadership on DevOps pipeline design, security posture, and architecture requirements for deployments and planned product replacements.",
      ],
    },
    "Ektello (Allegion)": {
      maxHighlights: 2,
    },
    "Veteran Engineering & Technology": {
      highlights: [
        "Sustained and extended a U.S. military training application (ASP.NET Web Forms, custom plugin architecture) under a formal U.S. government sustainment contract.",
        "Identified, duplicated, documented, and resolved issues within the existing framework and plugin-based architecture.",
      ],
    },
    "I3 Verticals (Data Business Systems)": { maxHighlights: 1 },
    "WideOpenWest": { maxHighlights: 2 },
  },

  // Merge same-company multi-stint entries (e.g. two Cypress Inland
  // rows for consecutive years) into one block before any other
  // tailoring runs. List company names verbatim from experience.yml.
  mergeSameCompany: ["Cypress Inland (Yardview)"],

  // Combine several older/less-relevant roles into a single
  // "Additional Experience" block to save space. Companies must
  // match `company` values in experience.yml exactly. Set to null
  // to disable combining and show every role individually.
  combineIntoOne: {
    label: "Additional Enterprise Engineering Experience",
    companies: [
      "Veteran Engineering & Technology",
      "I3 Verticals (Data Business Systems)",
      "WideOpenWest",
    ],
    location: "Colorado · United States",
  },

  // Extra industries to append beyond what's in industries.yml.
  industriesExtra: ["Government / Military Sustainment"],
};

// ---------------------------------------------------------------------------
// Load site data
// ---------------------------------------------------------------------------

function loadYaml(relPath) {
  const full = path.join(SITE_DIR, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`Expected data file not found: ${full}\nCheck --site points at the jr.com repo root.`);
  }
  return yaml.load(fs.readFileSync(full, "utf8"));
}

const config = loadYaml("_config.yml");
const experience = loadYaml("_data/experience.yml");
const skills = loadYaml("_data/skills.yml");
const industries = loadYaml("_data/industries.yml");

const author = config.author || {};
const resumeMeta = config.resume || {};

// Fail fast with a clear message naming the offending entry, rather than a
// cryptic error deep in the render code the first time a role is missing a
// field (e.g. a new _data/experience.yml entry added without `location`).
const REQUIRED_JOB_FIELDS = ["company", "role", "dates", "location", "highlights"];
experience.forEach((job, i) => {
  const missing = REQUIRED_JOB_FIELDS.filter((key) => {
    const value = job[key];
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "string") return value.trim() === "";
    return false;
  });
  if (missing.length) {
    throw new Error(
      `_data/experience.yml entry #${i + 1} (company: "${job.company || "?"}") is missing: ${missing.join(", ")}`
    );
  }
});

// ---------------------------------------------------------------------------
// Apply tailoring
// ---------------------------------------------------------------------------

function mergeSameCompany(jobs) {
  const names = TAILORING.mergeSameCompany || [];
  if (!names.length) return jobs;

  const result = [];
  const seen = {};
  jobs.forEach((job) => {
    if (!names.includes(job.company)) {
      result.push(job);
      return;
    }
    if (seen[job.company] != null) {
      const existing = result[seen[job.company]];
      const years = ([existing.dates, job.dates].join(" ").match(/\d{4}/g) || []).map(Number);
      if (years.length) {
        existing.dates = `${Math.min(...years)} – ${Math.max(...years)}`;
      }
      existing.highlights = [...existing.highlights, ...job.highlights];
      return;
    }
    seen[job.company] = result.length;
    result.push({ ...job });
  });
  return result;
}

function applyExperienceTailoring(jobs) {
  return jobs.map((job) => {
    const ov = TAILORING.experienceOverrides[job.company];
    if (!ov) return job;
    let highlights = ov.highlights || job.highlights;
    if (ov.maxHighlights) highlights = highlights.slice(0, ov.maxHighlights);
    return { ...job, highlights };
  });
}

function combineJobs(jobs) {
  const cfg = TAILORING.combineIntoOne;
  if (!cfg) return jobs;

  const toCombine = jobs.filter((j) => cfg.companies.includes(j.company));
  const rest = jobs.filter((j) => !cfg.companies.includes(j.company));
  if (toCombine.length === 0) return jobs;

  // Preserve original relative order: insert combined block where the
  // first matched job used to be.
  const firstIndex = jobs.findIndex((j) => cfg.companies.includes(j.company));

  const years = toCombine
    .flatMap((j) => (j.dates.match(/\d{4}/g) || []).map(Number));
  const dates = years.length ? `${Math.min(...years)} – ${Math.max(...years)}` : "";

  const combined = {
    company: cfg.companies.join(" · "),
    role: cfg.label,
    dates,
    location: cfg.location || toCombine[0].location,
    highlights: toCombine.flatMap((j) =>
      j.highlights.map((h) => `${h.replace(/\.$/, "")} — ${j.company}.`)
    ),
  };

  const result = rest.slice();
  result.splice(firstIndex, 0, combined);
  return result;
}

const tailoredExperience = combineJobs(applyExperienceTailoring(mergeSameCompany(experience)));

function tailoredSkillGroups() {
  const byName = {};
  skills.forEach((g) => (byName[g.group] = g.items.slice()));

  const order = TAILORING.skillGroupOrder.length
    ? TAILORING.skillGroupOrder
    : skills.map((g) => g.group);

  return order
    .filter((name) => byName[name])
    .map((name) => {
      const extras = TAILORING.skillGroupExtras[name] || [];
      return { group: name, items: [...extras, ...byName[name]] };
    });
}

const tailoredIndustries = [...industries, ...(TAILORING.industriesExtra || [])];

// ---------------------------------------------------------------------------
// pdfmake building blocks
// ---------------------------------------------------------------------------

// "Ember & Fog" — the site's live light-mode palette (_sass/_theme.scss),
// so the resume never drifts from jordanread.com's actual look.
const ACCENT = "#e4572e"; // --accent
const TEXT = "#24211d"; // --text
const MUTED = "#6b655a"; // --text-muted
const RULE = "#e4dfd3"; // --border

const PAGE_WIDTH = 522; // LETTER (612pt) minus 45pt left/right margins

// ---------------------------------------------------------------------------
// Header logo
// ---------------------------------------------------------------------------

// Crops a PNG buffer down to the bounding box of its non-transparent
// pixels (plus a small margin), so a source image with lots of transparent
// padding (e.g. a square favicon/app-icon export) doesn't render as a tiny
// mark lost inside an oversized invisible box.
function trimTransparentPadding(buffer, margin = 8) {
  const png = PNG.sync.read(buffer);
  const { width, height, data } = png;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(width * y + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null; // fully transparent — nothing to trim

  minX = Math.max(0, minX - margin);
  minY = Math.max(0, minY - margin);
  maxX = Math.min(width - 1, maxX + margin);
  maxY = Math.min(height - 1, maxY + margin);

  const outW = maxX - minX + 1;
  const outH = maxY - minY + 1;
  const out = new PNG({ width: outW, height: outH });
  PNG.bitblt(png, out, minX, minY, outW, outH, 0, 0);
  return { dataUrl: `data:image/png;base64,${PNG.sync.write(out).toString("base64")}`, width: outW, height: outH };
}

function loadHeaderLogo() {
  const logoPath = path.join(SITE_DIR, "assets/images-raw/favicon.png");
  if (!fs.existsSync(logoPath)) return null;
  return trimTransparentPadding(fs.readFileSync(logoPath));
}

const headerLogo = loadHeaderLogo();

const hr = (color = RULE) => ({
  canvas: [{ type: "line", x1: 0, y1: 0, x2: PAGE_WIDTH, y2: 0, lineWidth: 0.75, lineColor: color }],
  margin: [0, 2, 0, 10],
});

const sectionHeading = (text) => ({
  stack: [
    { text: text.toUpperCase(), bold: true, color: ACCENT, fontSize: 10.5 },
    hr(ACCENT),
  ],
  margin: [0, 12, 0, 0],
});

const bulletList = (items) => ({
  ul: items.map((h) => ({ text: h, fontSize: 10, color: TEXT })),
  margin: [0, 0, 0, 2],
});

const jobHeader = (title, company, dates) => ({
  columns: [
    {
      width: "*",
      text: [
        { text: title, bold: true, color: ACCENT, fontSize: 11 },
        { text: `  |  ${company}`, bold: true, color: TEXT, fontSize: 11 },
      ],
    },
    { width: "auto", text: dates, bold: true, color: MUTED, fontSize: 10, alignment: "right" },
  ],
  margin: [0, 7, 0, 1],
});

const jobSubheader = (location) => ({
  text: location,
  italics: true,
  color: MUTED,
  fontSize: 9,
  margin: [0, 0, 0, 4],
});

const skillCategory = (label, items) => ({
  text: [
    { text: `${label}: `, bold: true, color: ACCENT, fontSize: 10 },
    { text: items.join(", "), color: TEXT, fontSize: 10 },
  ],
  margin: [0, 0, 0, 4],
});

// ---------------------------------------------------------------------------
// Assemble document
// ---------------------------------------------------------------------------

const content = [];

const contactLine = [
  TAILORING.contact.location,
  localContact.phone || author.phone,
  localContact.email || author.email,
  (config.url || "").replace(/^https?:\/\//, ""),
  author.linkedin,
].filter(Boolean).join("   •   ");

const nameBlock = {
  stack: [
    { text: (author.name || "").toUpperCase(), bold: true, color: ACCENT, fontSize: 20, margin: [0, 0, 0, 1] },
    { text: TAILORING.headline || author.job_title || "", bold: true, color: TEXT, fontSize: 12, margin: [0, 0, 0, 5] },
    { text: contactLine, color: MUTED, fontSize: 9 },
  ],
};

if (headerLogo) {
  // Fit within a small box next to the name/headline rather than a fixed
  // width/height, so the logo's own aspect ratio (from trimTransparentPadding)
  // is preserved instead of stretching it.
  const LOGO_BOX = 64;
  content.push({
    columns: [
      nameBlock,
      { image: headerLogo.dataUrl, fit: [LOGO_BOX, LOGO_BOX], alignment: "right", width: "auto" },
    ],
    margin: [0, 0, 0, 3],
  });
} else {
  content.push(nameBlock);
}
content.push(hr());

content.push(sectionHeading("Professional Summary"));
content.push({
  text: TAILORING.summary || author.description || "",
  color: TEXT,
  fontSize: 10,
  margin: [0, 6, 0, 4],
});

content.push(sectionHeading("Core Technical Skills"));
tailoredSkillGroups().forEach((g) => content.push({ ...skillCategory(g.group, g.items), margin: [0, 6, 0, 4] }));

content.push(sectionHeading("Professional Experience"));
tailoredExperience.forEach((job) => {
  content.push(jobHeader(job.role, job.company, job.dates));
  content.push(jobSubheader(job.location));
  content.push(bulletList(job.highlights));
});

content.push(sectionHeading("Industries & Focus Areas"));
content.push({
  text: tailoredIndustries.join("  •  "),
  color: TEXT,
  fontSize: 10,
  margin: [0, 6, 0, 0],
});

const docDefinition = {
  pageSize: "LETTER",
  pageMargins: [45, 36, 45, 36],
  defaultStyle: { font: "Roboto", fontSize: 10, color: TEXT },
  content,
};

// ---------------------------------------------------------------------------
// Fonts — pdfmake's bundled Roboto, embedded directly in the PDF. Unlike a
// Word-style Calibri reference, this renders identically everywhere (no
// LibreOffice/Word font-substitution differences between machines).
// ---------------------------------------------------------------------------

const ROBOTO_DIR = path.join(path.dirname(require.resolve("pdfmake/package.json")), "fonts", "Roboto");

pdfMake.addFonts({
  Roboto: {
    normal: path.join(ROBOTO_DIR, "Roboto-Regular.ttf"),
    bold: path.join(ROBOTO_DIR, "Roboto-Medium.ttf"),
    italics: path.join(ROBOTO_DIR, "Roboto-Italic.ttf"),
    bolditalics: path.join(ROBOTO_DIR, "Roboto-MediumItalic.ttf"),
  },
});
pdfMake.setLocalAccessPolicy((p) => p.startsWith(ROBOTO_DIR));
pdfMake.setUrlAccessPolicy(() => false);

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, `${TAILORING.fileSlug}.pdf`);

pdfMake.createPdf(docDefinition).write(outPath).then(() => {
  console.log(`Wrote ${outPath}`);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
