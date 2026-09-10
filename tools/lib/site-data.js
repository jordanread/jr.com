/**
 * site-data.js
 *
 * Shared loader for the site's own Jekyll data — _config.yml plus
 * _data/experience.yml, skills.yml, and industries.yml. Both
 * build_resume.js (renders the PDF) and generate_tailoring.js (asks a
 * local model to draft a TAILORING object from a job description) import
 * this, so both scripts see exactly the same facts about Jordan. Neither
 * one gets its own copy that could quietly drift from the other.
 *
 * Also runs the field-validation on experience.yml both scripts rely on:
 * fail fast with a clear message naming the offending entry, rather than
 * a cryptic error deep inside either script's own logic the first time a
 * role is missing a field.
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const REQUIRED_JOB_FIELDS = ["company", "role", "dates", "location", "highlights"];

function loadYaml(siteDir, relPath) {
  const full = path.join(siteDir, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`Expected data file not found: ${full}\nCheck --site points at the jr.com repo root.`);
  }
  return yaml.load(fs.readFileSync(full, "utf8"));
}

function validateExperience(experience) {
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
}

// siteDir: absolute path to the jr.com repo root (must contain
// _config.yml and _data/).
function loadSiteData(siteDir) {
  const config = loadYaml(siteDir, "_config.yml");
  const experience = loadYaml(siteDir, "_data/experience.yml");
  const skills = loadYaml(siteDir, "_data/skills.yml");
  const industries = loadYaml(siteDir, "_data/industries.yml");

  validateExperience(experience);

  return {
    config,
    experience,
    skills,
    industries,
    author: config.author || {},
    resumeMeta: config.resume || {},
  };
}

module.exports = { loadSiteData, REQUIRED_JOB_FIELDS };
