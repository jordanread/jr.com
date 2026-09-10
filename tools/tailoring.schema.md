# TAILORING schema

This document is the single source of truth for what a `tailoring.json`
file is allowed to contain and how to fill it out well. It's read by two
different audiences:

1. **A human** (Jordan) hand-editing `tailoring.json` for a specific job
   application.
2. **A local LLM**, via `generate_tailoring.js`, which reads this entire
   file and uses it as its system prompt when asked to draft a
   `tailoring.json` from a pasted job description.

Because both audiences read the same document, there's no separate
"prompt" to keep in sync with the "real" schema docs — this is both.
Keep it that way: if you change what a field means, update it here, not
in a comment somewhere else.

## Hard rules (apply to both a human editor and the model)

- **Never invent facts.** Every company name, date range, and location
  must come from `_data/experience.yml` verbatim. Every skill-group name
  must come from `_data/skills.yml` verbatim. Every industry must come
  from `_data/industries.yml`. This file only selects, reorders, trims,
  and *rephrases* real content — it never adds a claim, metric, or
  responsibility that isn't already supported by the source data.
- **Rephrasing is fine; fabricating specifics is not.** "Became the
  primary technical authority for X" is a legitimate rephrase of
  "worked within X, becoming the go-to engineer." Adding a headcount,
  dollar figure, or scope that isn't in the source bullet is not.
- **Output must be valid JSON.** No comments, no trailing commas, no JS
  expressions (no template literals, no `new Date()` — see `fileSlug`
  below for how dates are actually handled).
- **A KNOWN LIMITATION TO RESPECT:** `experienceOverrides` is keyed by
  company name only. `"Synergy UpLink"` appears TWICE in
  `_data/experience.yml` — the current Director role and a much earlier
  (2006–2019) founder-era role. Setting `experienceOverrides["Synergy
  UpLink"]` applies identically to BOTH entries; there is no way to
  target just one. If both entries' *default* experience.yml bullets
  already work for the target role, the safest move is to leave
  `"Synergy UpLink"` out of `experienceOverrides` entirely, rather than
  write an override intended for one that will silently also rewrite the
  other. (This is a real limitation in `build_resume.js` itself, not
  just a documentation note — worth fixing there eventually by keying on
  something more specific than company name.)

## Fields

### `fileSlug` (string, required)

A short, filesystem-safe label for this application — no spaces, no
punctuation beyond `_` and `-`. Used to build the output filename:
`Jordan_Read_Resume_<fileSlug>_<year>-<month>.pdf`, where the date part
is added automatically by `build_resume.js` — do NOT include a date or
any JS expression here, just a plain string like `"Director"` or
`"Backend_Platform_Lead"`.

### `headline` (string, required)

The line under the name on the resume. Falls back to nothing meaningful
if left blank, so always set it. Can be a single title or a
pipe-separated dual title (e.g. `"Director, Software Engineering  |
Senior Manager, Software Architecture"`) when the target role could
plausibly be titled either way — this is a deliberate, existing pattern
in this resume, not a mistake to "fix" into one title.

### `summary` (string, required)

The professional-summary paragraph. Falls back to `author.description`
from `_config.yml` if omitted — but that fallback is a one-line
personal tagline ("Coder, Writer, Photographer. Human."), not a resume
summary, so always write a real one here. Should read as one cohesive
paragraph, roughly 90–130 words, grounded in the actual roles in
`_data/experience.yml` — not a generic template with the job title
swapped in.

### `contact.location` (string, required)

Fine to vary per application (e.g. `"Remote, United States"` vs. a
specific city) — this is not sensitive, unlike `email`/`phone`, which
deliberately do NOT live here (see `resume.local.json` /
`resume.local.example.json` — real contact info is gitignored and never
touches this file or git history).

### `skillGroupOrder` (array of strings)

Reorders (and optionally drops) skill groups from `_data/skills.yml`.
Every string here must be an EXACT group name from that file — check it
before assuming a name is right. An empty array falls back to
`skills.yml`'s own order.

### `skillGroupExtras` (object: group name → array of strings)

Extra bullet lines injected at the START of a named group — for
job-specific emphasis that doesn't belong permanently in `skills.yml`.
Keys must be exact group names from `skills.yml`. These extra lines
follow the same "no invented facts" rule as everything else — they
should describe something genuinely true of Jordan's experience, just
not something that belongs as permanent site content.

### `experienceOverrides` (object: company name → override)

Keys must be an EXACT `company` value from `_data/experience.yml` (see
the Synergy UpLink limitation above). Each value is one of:

- `{ "highlights": [...] }` — replaces that job's bullets entirely.
  Every bullet must be a legitimate rephrase of something already in
  that job's `highlights` in `_data/experience.yml` — check the source
  entry before writing a replacement bullet, don't paraphrase from
  memory/assumption.
- `{ "maxHighlights": N }` — keeps that job's original bullets from
  `_data/experience.yml`, trimmed to the first N. Use this (rather than
  a full `highlights` override) when the existing top bullets already
  fit — it's a smaller, safer change since it can't put words in
  Jordan's mouth that don't already exist verbatim in the source data.
- Both keys together — `highlights` REPLACES the list first, then
  `maxHighlights` trims that replaced list.

### `mergeSameCompany` (array of company names)

Merges multiple `_data/experience.yml` entries that share a company name
(e.g. two consecutive-year stints at the same place) into one combined
date range before any other tailoring runs. Rarely needs to change
between applications — check `_data/experience.yml` for repeated company
names before touching this.

### `combineIntoOne` (object or `null`)

Folds several less-relevant roles into one "Additional Experience"
block to save space — useful for older, less-directly-relevant stints
when the target role doesn't need that era spelled out job-by-job.
`companies` must be exact `_data/experience.yml` company values.
Consider pairing each combined company with an `experienceOverrides`
entry (usually `maxHighlights: 1`) so the combined block doesn't balloon
into every bullet from every folded-in job. Set to `null` (not omitted)
to disable combining entirely and show every role individually.

### `industriesExtra` (array of strings, optional)

Extra industry/focus-area tags appended after everything in
`_data/industries.yml`. Leave as `[]` (or omit) when the role doesn't
call for anything beyond what's already there — don't add a tag just to
fill space.

## What a generated `tailoring.json` should optimize for

Given a job description, the model should:

1. Read the job description for its actual title, seniority level, and
   the 3–5 things it emphasizes most (people leadership? deep technical
   ownership? a specific domain like healthcare or fintech? scale?).
2. Pick a `headline` and `summary` that speak to those things using only
   real facts from `_data/experience.yml` and `_data/skills.yml` —
   rephrasing and reprioritizing what's already there, never inventing
   new claims.
3. Decide which `_data/experience.yml` entries deserve full bullets,
   which deserve a trimmed `maxHighlights`, and which belong folded into
   `combineIntoOne` — based on relevance to THIS posting, not a fixed
   rule.
4. Leave `experienceOverrides` empty for a company/role whose default
   `_data/experience.yml` bullets already fit — a smaller diff from the
   source data is better than rewriting something that didn't need it.
