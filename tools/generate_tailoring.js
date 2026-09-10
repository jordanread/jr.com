/**
 * generate_tailoring.js
 *
 * Drafts a tailoring.json (see tailoring.schema.md) from a pasted job
 * description, using a local Ollama model — no job-description text or
 * resume content ever leaves the machine.
 *
 * This is a DRAFTING tool, not an autopilot: it validates its own output
 * structurally (every company/group name it used actually exists in
 * _data/*.yml) but can't verify the WRITING is good, or that a model
 * didn't quietly invent a claim despite being told not to. Always read
 * what it produces before pointing build_resume.js at it — that's also
 * why the default --out is tailoring.generated.json, a review file, NOT
 * the tailoring.json build_resume.js actually uses. Rename/copy it once
 * you've checked it.
 *
 * Setup (one-time):
 *   1. Install Ollama: https://ollama.com/download
 *   2. Pull a model, e.g.: ollama pull qwen2.5:14b-instruct
 *   3. Make sure the Ollama server is running (it starts automatically
 *      on most installs; `ollama serve` if not).
 *
 * Usage:
 *   node generate_tailoring.js --jd path/to/job-description.txt
 *   pbpaste | node generate_tailoring.js          # macOS: paste from clipboard
 *   node generate_tailoring.js                    # paste into the terminal, then Ctrl-D
 *
 * --jd         Path to a text file with the job description. If omitted,
 *              reads from stdin instead (so you can pipe or paste one in).
 * --out        Where to write the generated JSON, relative to this
 *              script's folder. Defaults to tailoring.generated.json —
 *              see the review-file note above.
 * --model      Ollama model tag. Defaults to $OLLAMA_MODEL if set, else
 *              "qwen2.5:14b-instruct". See the model-choice note below.
 * --host       Ollama API base URL. Defaults to $OLLAMA_HOST if set, else
 *              http://localhost:11434 (Ollama's own default).
 * --site       Path to the jr.com repo root — same meaning as in
 *              build_resume.js. Defaults to the parent of this folder.
 *
 * On model choice: this needs decent instruction-following and JSON
 * reliability, not raw coding ability — it's reading a job description
 * and reorganizing real facts, not generating code. qwen2.5:14b-instruct
 * is a solid default for that if the machine can run a ~14B model
 * comfortably; qwen2.5:7b-instruct or llama3.1:8b are lighter fallbacks
 * if not. Bigger/smarter models (llama3.1:70b, qwen2.5:32b+) will likely
 * do a better job of tasteful rephrasing if the hardware supports them —
 * this is a case where model quality genuinely shows up in output
 * quality, unlike simpler extraction tasks.
 *
 * Requires: npm install js-yaml (already a devDependency for build_resume.js)
 */

const fs = require("fs");
const path = require("path");
const { loadSiteData, REQUIRED_JOB_FIELDS } = require("./lib/site-data");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function getArg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const SITE_DIR = path.resolve(__dirname, getArg("--site", ".."));
const JD_PATH = getArg("--jd", null);
const OUT_PATH = path.join(__dirname, getArg("--out", "tailoring.generated.json"));
const MODEL = getArg("--model", process.env.OLLAMA_MODEL || "qwen2.5:14b-instruct");
const OLLAMA_HOST = getArg("--host", process.env.OLLAMA_HOST || "http://localhost:11434");

// ---------------------------------------------------------------------------
// Gather inputs
// ---------------------------------------------------------------------------

function readJobDescription() {
  if (JD_PATH) {
    const full = path.resolve(process.cwd(), JD_PATH);
    if (!fs.existsSync(full)) throw new Error(`--jd file not found: ${full}`);
    return fs.readFileSync(full, "utf8").trim();
  }
  if (process.stdin.isTTY) {
    console.error("Paste the job description, then press Ctrl-D (or Ctrl-Z on Windows) when done:\n");
  }
  // Node's synchronous stdin read — fine here since this script does
  // nothing useful until it has the whole job description anyway.
  const text = fs.readFileSync(0, "utf8").trim();
  if (!text) throw new Error("No job description provided (empty --jd file or empty stdin).");
  return text;
}

const jobDescription = readJobDescription();
const { experience, skills, industries, author } = loadSiteData(SITE_DIR);
const schemaDoc = fs.readFileSync(path.join(__dirname, "tailoring.schema.md"), "utf8");

// ---------------------------------------------------------------------------
// Build the prompt
// ---------------------------------------------------------------------------

// The schema doc IS the system prompt — see its own header comment for
// why that's deliberate (one document, two audiences, never drifts).
const systemPrompt = schemaDoc;

// Reference data the model must draw from and MUST NOT contradict or
// invent beyond. Sent as plain JSON rather than the original YAML mainly
// because it's a more compact, unambiguous representation for a model to
// quote back from — not for any deep reason.
const referenceData = JSON.stringify(
  {
    author: { name: author.name, job_title: author.job_title },
    experience,
    skills,
    industries,
  },
  null,
  2
);

const userPrompt = `Here is the job description to tailor a resume for:

---
${jobDescription}
---

Here is the real, ground-truth data you must draw from (do not invent
anything beyond this — see the hard rules above):

${referenceData}

Respond with ONLY a single JSON object matching the tailoring.json schema
above. No markdown code fences, no explanation before or after — just the
JSON object itself.`;

// ---------------------------------------------------------------------------
// Call Ollama
// ---------------------------------------------------------------------------

async function callOllama() {
  const url = `${OLLAMA_HOST.replace(/\/$/, "")}/api/chat`;
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        format: "json",
        stream: false,
        options: { temperature: 0.2 },
      }),
    });
  } catch (err) {
    throw new Error(
      `Couldn't reach Ollama at ${url} (${err.message}).\n` +
      `Is Ollama installed and running? Try: ollama serve`
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 404) {
      throw new Error(
        `Ollama returned 404 for model "${MODEL}". Have you pulled it?\n` +
        `Try: ollama pull ${MODEL}`
      );
    }
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}\n${body}`);
  }

  const data = await response.json();
  const content = data && data.message && data.message.content;
  if (!content) {
    throw new Error(`Unexpected Ollama response shape: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return content;
}

// ---------------------------------------------------------------------------
// Validate the model's output before trusting it with anything
// ---------------------------------------------------------------------------

// Structural checks only — this can catch a hallucinated company name or
// a malformed shape, but it can't judge whether the writing is actually
// good or whether a rephrase quietly drifted from what the source bullet
// actually supports. That part still needs a human read.
function validateTailoring(t) {
  const errors = [];
  const companies = new Set(experience.map((j) => j.company));
  const groups = new Set(skills.map((g) => g.group));

  const REQUIRED_TOP_LEVEL = ["fileSlug", "headline", "summary", "contact", "skillGroupOrder", "skillGroupExtras", "experienceOverrides"];
  for (const key of REQUIRED_TOP_LEVEL) {
    if (!(key in t)) errors.push(`Missing required top-level field: "${key}"`);
  }
  if (errors.length) return errors; // no point checking deeper if the shape's already wrong

  if (typeof t.fileSlug !== "string" || !/^[A-Za-z0-9_-]+$/.test(t.fileSlug)) {
    errors.push(`"fileSlug" must be a plain string using only letters, numbers, "_" and "-" (got: ${JSON.stringify(t.fileSlug)})`);
  }
  if (typeof t.headline !== "string" || !t.headline.trim()) errors.push(`"headline" must be a non-empty string`);
  if (typeof t.summary !== "string" || t.summary.trim().length < 40) errors.push(`"summary" looks too short to be a real paragraph`);
  if (!t.contact || typeof t.contact.location !== "string") errors.push(`"contact.location" must be a string`);

  if (!Array.isArray(t.skillGroupOrder)) {
    errors.push(`"skillGroupOrder" must be an array`);
  } else {
    for (const name of t.skillGroupOrder) {
      if (!groups.has(name)) errors.push(`skillGroupOrder references unknown skill group: "${name}"`);
    }
  }

  if (typeof t.skillGroupExtras !== "object" || t.skillGroupExtras === null) {
    errors.push(`"skillGroupExtras" must be an object`);
  } else {
    for (const name of Object.keys(t.skillGroupExtras)) {
      if (!groups.has(name)) errors.push(`skillGroupExtras references unknown skill group: "${name}"`);
    }
  }

  if (typeof t.experienceOverrides !== "object" || t.experienceOverrides === null) {
    errors.push(`"experienceOverrides" must be an object`);
  } else {
    for (const name of Object.keys(t.experienceOverrides)) {
      if (!companies.has(name)) errors.push(`experienceOverrides references unknown company: "${name}"`);
      const ov = t.experienceOverrides[name];
      if (ov.highlights && !Array.isArray(ov.highlights)) errors.push(`experienceOverrides["${name}"].highlights must be an array`);
      if (ov.maxHighlights != null && typeof ov.maxHighlights !== "number") errors.push(`experienceOverrides["${name}"].maxHighlights must be a number`);
    }
    // The known Synergy UpLink collision (see tailoring.schema.md) is a
    // warning, not a hard error — it's sometimes fine (e.g. if both
    // entries' defaults already work, the model correctly left it out;
    // this only fires if it went ahead and set an override anyway).
    if ("Synergy UpLink" in t.experienceOverrides) {
      const count = experience.filter((j) => j.company === "Synergy UpLink").length;
      if (count > 1) {
        console.warn(
          `\n⚠ WARNING: experienceOverrides["Synergy UpLink"] is set, but that company name matches ` +
          `${count} entries in experience.yml. This override will apply to ALL of them identically. ` +
          `See the known-limitation note in tailoring.schema.md.\n`
        );
      }
    }
  }

  if (t.mergeSameCompany && !Array.isArray(t.mergeSameCompany)) {
    errors.push(`"mergeSameCompany" must be an array if present`);
  }

  if (t.combineIntoOne) {
    if (!Array.isArray(t.combineIntoOne.companies)) {
      errors.push(`"combineIntoOne.companies" must be an array`);
    } else {
      for (const name of t.combineIntoOne.companies) {
        if (!companies.has(name)) errors.push(`combineIntoOne.companies references unknown company: "${name}"`);
      }
    }
    if (typeof t.combineIntoOne.label !== "string" || !t.combineIntoOne.label.trim()) {
      errors.push(`"combineIntoOne.label" must be a non-empty string`);
    }
  }

  if (t.industriesExtra && !Array.isArray(t.industriesExtra)) {
    errors.push(`"industriesExtra" must be an array if present`);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Asking ${MODEL} (via ${OLLAMA_HOST}) to draft a tailoring.json...`);
  const raw = await callOllama();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Model did not return valid JSON. Raw response:\n");
    console.error(raw);
    process.exit(1);
  }

  const errors = validateTailoring(parsed);
  if (errors.length) {
    console.error(`\n${MODEL}'s output failed validation — nothing was written:\n`);
    errors.forEach((e) => console.error(`  - ${e}`));
    console.error(`\nRaw output has been left below in case it's fixable by hand:\n`);
    console.error(JSON.stringify(parsed, null, 2));
    process.exit(1);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(parsed, null, 2) + "\n");

  const overriddenCompanies = Object.keys(parsed.experienceOverrides || {});
  const combinedCompanies = (parsed.combineIntoOne && parsed.combineIntoOne.companies) || [];
  console.log(`\nWrote ${OUT_PATH}\n`);
  console.log(`  headline: ${parsed.headline}`);
  console.log(`  fileSlug: ${parsed.fileSlug}`);
  console.log(`  companies overridden: ${overriddenCompanies.length ? overriddenCompanies.join(", ") : "(none)"}`);
  console.log(`  companies combined:   ${combinedCompanies.length ? combinedCompanies.join(", ") : "(none)"}`);
  console.log(`\nThis is a draft — read it (and the summary especially) before using it.`);
  console.log(`Once you're happy with it:`);
  console.log(`  cp ${path.relative(__dirname, OUT_PATH)} tailoring.json && npm run resume`);
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  process.exit(1);
});
