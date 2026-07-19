# jordanread.com

Personal site for Jordan Read — portfolio, resume, blog, and a media/poetry/photography/code-project log. Built with [Jekyll](https://jekyllrb.com/) and deployed to GitHub Pages.

- **Live site:** https://jordanread.com
- **Engine:** Jekyll (`kramdown` markdown, `pretty` permalinks)
- **Hosting:** GitHub Pages, via GitHub Actions (`.github/workflows/deploy.yml`)

---

## Table of contents

- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Site configuration (`_config.yml`)](#site-configuration-_configyml)
- [Content collections](#content-collections)
  - [Blog posts (`_posts`, `_drafts`)](#blog-posts-_posts-_drafts)
  - [Media log (`_media`)](#media-log-_media)
  - [Poems (`_poems`)](#poems-_poems)
  - [Poetry collections (`_poetry_collections`)](#poetry-collections-_poetry_collections)
  - [Photo albums (`_photo_albums`)](#photo-albums-_photo_albums)
  - [Code projects (`_code_projects`)](#code-projects-_code_projects)
- [Data files (`_data`)](#data-files-_data)
- [Pages](#pages)
- [Layouts](#layouts)
- [The splash intro overlay](#the-splash-intro-overlay)
- [Theming (light/dark)](#theming-lightdark)
- [Styling (`_sass`)](#styling-_sass)
- [JavaScript (`assets/js`)](#javascript-assetsjs)
- [The `/now/` page](#the-now-page)
- [SEO, feed & sitemap](#seo-feed--sitemap)
- [Deployment](#deployment)
- [Common tasks](#common-tasks)
- [Standalone demo/reference pages](#standalone-demoreference-pages)

---

## Quick start

Requires Ruby and Bundler.

```bash
bundle install
bundle exec jekyll serve
```

Then visit `http://localhost:4000`.

Useful variants:

```bash
# Include unpublished drafts from _drafts/
bundle exec jekyll serve --drafts

# Include content with `published: false` in its front matter
bundle exec jekyll serve --unpublished

# One-off production build (output in ./_site)
JEKYLL_ENV=production bundle exec jekyll build
```

**Note on `_config.yml`:** unlike `_data`, `_includes`, and pages, Jekyll only reads `_config.yml` once at server start. Editing it while `jekyll serve` is running won't take effect until you stop and restart the server. Everything else (front matter, `_data/*.yml`, includes, layouts, sass) is picked up automatically on save — just refresh the browser.

---

## Project structure

```
_code_projects/     Collection: open-source/personal code projects
_config.yml         Site-wide configuration (see below)
_data/               YAML data files powering various sections (see below)
_drafts/             Unpublished blog posts (not built unless --drafts is passed)
_includes/           Reusable HTML partials, included from layouts/pages
_layouts/            Page templates
_media/              Collection: movies/TV/books/games log
_photo_albums/       Collection: photography albums
_poems/               Collection: individual poems
_poetry_collections/ Collection: curated poem groupings
_posts/               Blog posts (YYYY-MM-DD-slug.md), created as needed
_sass/                SCSS partials, imported by assets/css/main.scss
assets/
  css/                main.scss (compiled to main.css) + splash.css
  images/              Site images (favicons, photos, covers, etc.)
  images-raw/          Unprocessed/source images, not necessarily referenced by the site
  js/                  Vanilla JS: nav, theme toggle, lightbox, splash, media filter
blog/index.html      Blog listing page
media/index.html     Media log listing page
now/index.html       "Now" page
projects/            Projects landing + poetry/photography/code sub-sections
resume.html          Resume page
index.html           Homepage
comparison.html      Standalone splash style-comparison reference (layout: null)
demo.html            Standalone splash preview, no Jekyll needed (plain HTML)
site.webmanifest     PWA manifest
Gemfile              Ruby gem dependencies
.github/workflows/   GitHub Actions deploy workflow
```

---

## Site configuration (`_config.yml`)

Key sections:

- **`title` / `description` / `url` / `baseurl`** — standard Jekyll site metadata, also used by `jekyll-seo-tag` and `jekyll-sitemap`.
- **`author`** — name, job title, contact links (`email`, `phone`, `linkedin`, `github`), and `home_base` (shown in the homepage hero — deliberately not a specific city). `email` and `phone` are optional; templates that reference them (header, hero, contact section) guard with `{% if %}`, so leaving either blank just hides that element instead of breaking the page.
- **`resume`** — fields used *only* by the resume page and its includes (`resume-hero.html`, `about.html`, `skills.html`, `experience.html`, `industries.html`, `contact.html`): `resume_pdf`, `current_focus`, `recent_roles`, `experience_since`. Kept separate from `author` intentionally — this is recruiter-facing copy and should never leak into the homepage. If a new template wants one of these fields, that's a signal it belongs under `/resume/`, not that the field should move into `author`.
- **`nav`** — drives the header navigation. Each entry has `title` and `anchor`; entries can optionally have `children` (used for the "Projects" dropdown — Poetry/Photography/Code). Add/remove/reorder nav items here.
- **`collections`** — registers the five custom collections (see below), each with `output: true` and a `permalink` pattern.
- **`defaults`** — assigns a default `layout` per collection/page type so individual files don't need to repeat `layout:` in front matter (see [Layouts](#layouts)).
- **`plugins`** — `jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`. All three are on GitHub Pages' safe-plugin allowlist. Only add more plugins here if building/deploying outside GitHub Pages' own build pipeline (they won't be available there otherwise).
- **`exclude`** — files Jekyll shouldn't copy into `_site` (`Gemfile`, `Gemfile.lock`, `README.md`, `node_modules`, `vendor`).

---

## Content collections

Every collection lives in a `_<name>/` folder, is registered in `_config.yml` under `collections:`, and gets a default `layout` via the `defaults:` block — so a new file in that folder just needs its content-specific front matter, not `layout:`.

Every example/stub file mentioned below currently exists in the repo as a working reference (either directly, or as one of the files fleshed out in the media log). Delete or repurpose examples freely — filenames don't matter beyond producing a reasonable slug (Jekyll uses the filename, minus extension, as the default slug).

Any file's front matter can include `published: false` to keep it out of the build entirely (won't render, won't appear in listings) — useful for stubs and in-progress drafts. Run with `--unpublished` to preview it locally anyway.

### Blog posts (`_posts`, `_drafts`)

Not a custom collection — this is Jekyll's built-in `posts`.

- **Location:** `_posts/YYYY-MM-DD-slug.md`. Filename date is required.
- **Layout:** `post` (assigned via `defaults`).
- **Front matter:**
  - `title` (required)
  - `description` — optional one-liner. Shown on the `/blog/` listing and used as the meta description. If omitted, the listing falls back to the post's excerpt (see below).
  - `tags` — optional list, rendered as pills on the listing and post page.
- **Excerpt:** everything above the `<!--more-->` marker becomes the excerpt used on `/blog/` when `description` isn't set (`excerpt_separator: <!--more-->` in `_config.yml`).
- **Drafts:** put unfinished posts in `_drafts/<slug>.md` (no date prefix). They're excluded from `site.posts` and the build unless you run `jekyll serve --drafts` / `jekyll build --drafts`. Move a draft into `_posts/` with a `YYYY-MM-DD-` prefix once ready to publish.
- **Where it shows:** `/blog/` (full list) and the homepage (latest 3, via `_includes/projects-teaser.html`-adjacent block in `index.html`).

### Media log (`_media`)

A running log of movies, TV, books, and games.

- **Location:** `_media/<slug>.md`
- **Permalink:** `/media/entry/:slug/`
- **Layout:** `media-entry`
- **Front matter:**
  - `title` (required)
  - `type` (required) — free-text (`book`, `game`, `movie`, `tv`, etc.). Drives the filter pills on `/media/` — a new `type` value automatically gets its own pill, no code changes needed.
  - `date` (required) — doubles as "date finished" for finished entries and "date started" for in-progress ones. This is what the feed sorts by, not necessarily a claim about which milestone it marks.
  - `status` — optional, defaults in effect to "finished" (no badge shown). Set to `in-progress`, `dropped`, `on-hold`, etc. to show a status badge. **`status: in-progress` is what automatically surfaces an entry on `/now/`** — no separate now-page editing needed. When you finish something, flip `status` to `finished` (or remove it) and update `date` — it moves into the regular reverse-chronological `/media/` feed and drops off `/now/`.
  - `rating` — optional, 1–5. Rendered as a star row.
  - `description` — one or two sentences shown on the `/media/` feed card and at the top of the entry page.
  - `cover` — optional path to a cover image.
  - `external_url` — optional link (e.g. to a store page, IMDb, etc.) rendered as a "More info" button on the entry page.
  - Any additional fields (e.g. `author`, `developer`, `published`, `pages`, `platforms`, `released`) are freely supported — they just won't render anywhere unless you add them to the body markdown yourself (see the existing entries for the convention of listing them as **bold-label** lines in the body).
- **Body:** optional freeform Markdown. Leave it empty and only the `description` blurb shows — no empty content section is rendered either way.
- **Where it shows:** `/media/` (full log with type filter pills), `/now/` (only `status: in-progress` entries, grouped by `type`), and its own page at `/media/entry/<slug>/`.

### Poems (`_poems`)

- **Location:** `_poems/<slug>.md`
- **Permalink:** `/projects/poetry/poem/:slug/`
- **Layout:** `poem`
- **Front matter:**
  - `title` (required)
  - `date` (required)
  - `description` — optional, shown on the `/projects/poetry/` index card. Omit it and the card just shows title + date.
  - `series` — optional. Set this to the filename/slug of a `_poetry_collections` entry to group this poem into that collection (e.g. `series: lighthouse-keeper` pairs with `_poetry_collections/lighthouse-keeper.md`). Every poem lives at the same `/projects/poetry/poem/<slug>/` URL regardless of whether it's standalone or part of a series — `series` controls grouping, not the URL.
  - `series_part` — optional, used alongside `series` to order poems within a collection (both on the collection's landing page and for prev/next navigation at the bottom of the poem itself).
- **Body:** standard Markdown. To keep line breaks within a stanza, end each line with two trailing spaces so Markdown renders a real `<br>` instead of merging lines into one paragraph. A blank line between stanzas works like a normal paragraph break.
- **Where it shows:** standalone poems (no `series`) appear under "Poems" on `/projects/poetry/`; poems with `series` appear only inside their collection's page and the collection's entry on `/projects/poetry/`, plus get prev/next links to sibling poems in the same series.

### Poetry collections (`_poetry_collections`)

- **Location:** `_poetry_collections/<slug>.md`
- **Permalink:** `/projects/poetry/:slug/`
- **Layout:** `poetry-collection`
- **Front matter:**
  - `title` (required)
  - `date` (required)
  - `description` — optional intro blurb, shown on both the `/projects/poetry/` index card and the top of the collection's own landing page.
  - `status` — optional free text (`"Idea"`, `"In progress"`, `"Complete"`, whatever fits — not a fixed enum). Shown as a pill next to the title on `/projects/poetry/`. Most useful for a collection you're starting before any poems exist yet.
- **Body:** optional freeform Markdown (intro, backstory) rendered above the auto-generated poem list. Can be left blank.
- **Linking poems in:** a poem joins this collection by setting `series: <this-file's-slug>` in its own front matter — there's no separate ID list to maintain here. If you rename this file, update the matching poems' `series:` value at the same time.
- **Where it shows:** `/projects/poetry/` (collection cards) and its own page listing every poem with that `series`, ordered by `series_part`.

### Photo albums (`_photo_albums`)

- **Location:** `_photo_albums/<slug>.md`
- **Permalink:** `/projects/photography/album/:slug/`
- **Layout:** `photo-album`
- **Front matter:**
  - `title` (required)
  - `date` (required)
  - `description` — optional intro shown on the `/projects/photography/` card and at the top of the album page.
  - `cover` — path to the cover image used on the index card.
  - `status` — optional free text pill (same convention as poetry collections — `"Idea"`, `"In progress"`, etc.), useful for an album you're starting before any photos are picked.
  - `images` — required list, each item:
    - `src` (required) — image path
    - `alt` (required for accessibility) — description of what's in the image
    - `caption` — optional, shown in the lightbox under the image
- **Body:** optional freeform Markdown intro above the thumbnail grid (theme, story, technical notes). Leave blank and the grid starts right under the title.
- **Behavior:** clicking a thumbnail opens the shared lightbox (`_includes/lightbox.html` / `assets/js/lightbox.js`), with prev/next navigation between images in the album.
- **Note:** keep `published: false` until `cover` and every `images[].src` point at real files under `assets/images/` — the example album ships with placeholder paths that don't exist yet.

**Bespoke photography pieces:** not every visual piece fits the album template — fully custom scrollytelling pages (own HTML/CSS/JS) aren't a collection item, they're just standalone pages. List them in `_data/photo_features.yml` instead (see [Data files](#data-files-_data)) so they still appear alongside albums on `/projects/photography/`.

### Code projects (`_code_projects`)

- **Location:** `_code_projects/<slug>.md`
- **Permalink:** `/projects/code/:slug/`
- **Layout:** `code-project`
- **Front matter:**
  - `title` (required)
  - `date` (required) — used for sorting, both on `/projects/code/` and in the homepage teaser.
  - `description` — shown on cards and the project page.
  - `status` — free-text string, not a fixed enum (`"Idea"`, `"Early development"`, `"Work in progress"`, `"Shipped"`, etc.).
  - `stack` — short list of tech tags, rendered as pills.
  - `repo_url` — optional. When present, adds a "View repo" button on the project page. Deliberately optional — a project can exist here with just a title, description, and status before any code exists at all.
- **Body:** optional freeform Markdown write-up.
- **Where it shows:** `/projects/code/` (full list), the homepage teaser (`_includes/projects-teaser.html`, latest 2 by `date`), and its own page.

---

## Data files (`_data`)

Plain YAML, no front matter needed. Edited files are picked up live by `jekyll serve` — no restart required.

| File | Used by | Purpose |
|---|---|---|
| `splash.yml` | `_includes/splash.html` (fallback) | The splash overlay's actual site-wide default phrase list — used when a page's `splash:` front matter doesn't set its own `taglines:`. Every page currently using the `splash` layout sets explicit per-page `taglines:`, so this fallback isn't hit anywhere live today, but it's what a new `layout: splash` page would get if it left `taglines:` unset. |
| `taglines.yml` | `comparison.html` only (currently) | A separate phrase list. **Not** wired into the live `_includes/splash.html` fallback (that reads `site.data.splash`, i.e. `splash.yml`, not this file) — only `comparison.html` reads it directly today. `demo.html`'s inline comments describe this file as the conceptual source for its hardcoded preview array, but the real splash include doesn't consume it, so editing it won't change the live overlay on any page. |
| `asides.yml` | `_includes/asides.html` (homepage) | The "Asides" teaser grid. Each item: `title`, `tag` (optional pill), `body`, `link` (optional, `text` + `url`). Meant to be short — link out to a blog post or `/now/` for anything that deserves more room. |
| `skills.yml` | `_includes/skills.html` (resume page) | Grouped skill lists: each item is `group` (heading) + `items` (list of strings). |
| `experience.yml` | `_includes/experience.html` (resume page) | Work history timeline. Each entry: `company`, `dates`, `role`, `location`, `highlights` (list of bullet strings). |
| `industries.yml` | `_includes/industries.html` (resume page) | Flat list of industry/focus-area strings, rendered as pills. |
| `project_categories.yml` | `projects/index.html` | Category cards on `/projects/`. Each entry: `title`, `tag`, `description`, `url`. Should stay in sync with the "Projects" nav children in `_config.yml` — if you add/rename a category in one place, update the other. |
| `photo_features.yml` | `projects/photography/index.html` | Bespoke standalone scrollytelling photo pages (not `_photo_albums` entries). Each entry: `title`, `description`, `cover`, `url`. Empty (`[]`) until a first one exists. |

---

## Pages

Top-level, non-collection pages (each is its own `.html` file with Jekyll front matter unless noted otherwise):

| Path | File | Notes |
|---|---|---|
| `/` | `index.html` | Homepage: hero, asides, code-project teaser (latest 2), recent blog posts (latest 3). |
| `/blog/` | `blog/index.html` | Full reverse-chronological post listing. |
| `/media/` | `media/index.html` | Full media log with type-filter pills (JS-driven, `assets/js/media-filter.js`). |
| `/now/` | `now/index.html` | Snapshot page + auto-generated "Currently" section from in-progress media. See [The `/now/` page](#the-now-page). |
| `/resume/` | `resume.html` | Recruiter-facing page: hero, about, skills, experience, industries, contact. Pulls from `site.resume` and the resume-specific `_data` files. |
| `/projects/` | `projects/index.html` | Category cards (from `project_categories.yml`) linking to poetry/photography/code. |
| `/projects/poetry/` | `projects/poetry/index.html` | Poetry collections + standalone poems. |
| `/projects/photography/` | `projects/photography/index.html` | Photo albums + bespoke features. |
| `/projects/code/` | `projects/code/index.html` | All code projects. |
| — | `comparison.html` | Standalone splash-style visual reference/comparison tool. `layout: null` — self-contained HTML, not part of site navigation. |
| — | `demo.html` | Splash overlay preview. Plain HTML, no Jekyll templating — open directly in a browser without a server running. Uses a hardcoded phrase array instead of `_data/taglines.yml`. |

Most pages set `splash:` front matter (see [The splash intro overlay](#the-splash-intro-overlay)) to customize the intro overlay per-page.

---

## Layouts

All in `_layouts/`, applied either via each collection's `defaults:` entry in `_config.yml` or a page's own `layout:` front matter.

- **`default.html`** — the base shell: `<head>` (via `head.html`), header, `<main>{{ content }}</main>`, footer, and the shared lightbox markup/script. Applied to anything that doesn't set its own layout.
- **`splash.html`** — same shell as `default`, but also injects the splash intro overlay (`splash-head.html` in `<head>`, `splash.html` include right after `<body>`). Use this layout on any page that should play the intro.
- **`post.html`** — blog post: date + tags meta, title, description, content, "back to all posts" footer link.
- **`poem.html`** — poem: series breadcrumb (if in a collection) + part number, title, date, description, body (with stanza-friendly line breaks), prev/next series navigation if applicable, "back to all poetry" link.
- **`poetry-collection.html`** — collection landing page: title, description, optional intro body, then the auto-generated numbered poem list (or an empty-state card if no poems yet).
- **`photo-album.html`** — album: title, description, optional intro body, thumbnail grid wired to the lightbox, "back to photography" link.
- **`media-entry.html`** — media entry: type + status pills, date, title, star rating (if set), description, optional cover image, optional body, optional external-link button, "back to media" link.
- **`code-project.html`** — code project: "Project" label, title, status pill, description, stack pills, optional body, optional "View repo" button, "back to code" link.

---

## The splash intro overlay

A short animated phrase sequence that plays before a page reveals itself — the `README.md` originally shipped with this repo (now folded into this section) documents it in the most detail, since it started life as a portable/drop-in component.

### How it's wired in

- `_includes/splash-head.html` — goes as early as possible in `<head>` (already placed there by `_layouts/splash.html`). Adds a `js` class to `<html>`, checks `localStorage` for whether the splash was already seen **for this specific page path** (tracked per-path, not as one site-wide flag — skipping the splash on one page doesn't skip it everywhere), and preloads the Archivo font + `splash.css`.
- `_includes/splash.html` — the overlay markup itself, plus the phrase data and timing config, placed right after `<body>`. Only pages using the `splash` layout (or including it manually) get this.

### Enabling it on a page

Set `layout: splash` in that page's front matter instead of `default`.

### Customizing per-page

Each page can override the phrase list and timing via a `splash:` front matter block:

```yaml
splash:
  taglines:
    - "Consumed"
    - "As I go"
  hold: 1200
```

Recognized keys (all optional, with defaults):
- `taglines` — list of phrases to cycle through. Falls back to `site.data.splash` (i.e. `_data/splash.yml`) if omitted — see the note on `_data/taglines.yml` vs `_data/splash.yml` under [Data files](#data-files-_data), since the two are easy to confuse.
- `enter` — ms for a phrase's enter animation (default `450`)
- `hold` — ms a phrase stays fully visible (default `900`)
- `exit` — ms for a phrase's exit animation (default `350`)
- `overlay_exit` — ms for the whole overlay's exit transition (default `500`)

### Editing phrases

Every page currently sets its own `splash.taglines` list directly in front matter (see `blog/index.html`, `media/index.html`, `now/index.html`, and the `/projects/` sub-pages for examples) — edit the list under that page's `splash:` block to change what it shows. To change the site-wide fallback used by any future `splash`-layout page that doesn't set its own list, edit `_data/splash.yml` instead. Either way, `jekyll serve` picks up front matter and `_data` changes automatically — no restart needed, just refresh. Keep phrases short (1–4 words) so they read well at large display size on mobile; see `assets/css/splash.css` if longer phrases need the `clamp()` font-sizing retuned.

### Previewing without Jekyll

Open `demo.html` directly in a browser (double-click it, no server needed) — it's the real `splash.css`/`splash.js` running against mock page content and a hardcoded phrase array. The "Replay splash" button reloads the page so you can re-watch it. `comparison.html` is a separate, self-contained style-comparison reference for the splash visuals.

### Replay button

`_includes/footer.html` conditionally renders a "↺ Replay intro" button when `page.layout == "splash"`, wired to `assets/js/splash.js`.

### Retheming

Color tokens and the font-size `clamp()` are flagged with `NOTE:` comments at the top of `assets/css/splash.css` — swap `--splash-bg` / `--splash-fg` / `--splash-accent` to match the site palette.

---

## Theming (light/dark)

- A theme toggle button lives in the header (`_includes/theme-toggle.html`, `assets/js/theme-toggle.js`), letting visitors switch between light and dark.
- The chosen theme is persisted to `localStorage` (`theme` key) and re-applied to `<html data-theme="...">` before first paint via an inline script in `_includes/head.html` (avoids a flash of the wrong theme). Falls back to `prefers-color-scheme` if `localStorage` is unavailable or unset.
- Color tokens are CSS custom properties defined in `_sass/_theme.scss`; the rest of the SCSS partials consume short Sass aliases defined in `_sass/_variables.scss` (`$bg`, `$text`, `$accent`, etc.) rather than the raw custom properties directly — to retheme, edit the tokens in `_theme.scss`, not `_variables.scss`.

---

## Styling (`_sass`)

`assets/css/main.scss` is the entry point that imports every partial in `_sass/`. One partial per concern:

`_base.scss` (resets/global), `_variables.scss` (Sass aliases to theme tokens), `_theme.scss` (light/dark CSS custom properties), `_header.scss`, `_hero.scss`, `_blog.scss`, `_projects.scss`, `_poetry.scss`, `_photography.scss`, `_media.scss`, `_experience.scss`, `_skills.scss`, `_contact.scss`, `_asides.scss`, `_lightbox.scss`, `_responsive.scss` (breakpoints, imported last).

`assets/css/splash.css` is separate and self-contained by design (see [The splash intro overlay](#the-splash-intro-overlay)) — it doesn't depend on anything else in the site's stylesheets, which is what makes `demo.html` able to preview it standalone.

---

## JavaScript (`assets/js`)

All vanilla JS, no build step or bundler — each file is loaded directly via `<script src="..." defer>` from the relevant include:

- **`nav.js`** — mobile hamburger menu toggle and dropdown behavior for the "Projects" nav item (loaded from `header.html`).
- **`theme-toggle.js`** — light/dark switch logic + `localStorage` persistence (loaded from `theme-toggle.html`).
- **`lightbox.js`** — powers the shared lightbox modal (open/close, prev/next) used by photo albums (loaded from `lightbox.html`, included in `default.html`).
- **`media-filter.js`** — client-side filter-pill behavior on `/media/`, toggling visibility of cards by `data-type` to match the active filter pill (loaded from `media/index.html`).
- **`splash.js`** — drives the splash overlay animation cycle, timing, skip button, and the per-page-path "seen" flag in `localStorage` (loaded from `splash.html`).

---

## The `/now/` page

A [now page](https://nownownow.com/about) — a snapshot of current status, manually updated whenever. Two parts:

1. A static intro blurb (edit directly in `now/index.html`).
2. An auto-generated **"Currently"** section, built from every `_media` entry with `status: in-progress`, grouped by `type` and sorted by `date`. This section requires no manual editing — set an entry's `status` to `in-progress` in its front matter and it appears here automatically; flip it to `finished` (or remove `status`) and it disappears from here and moves into the regular `/media/` feed instead.

---

## SEO, feed & sitemap

Handled by the three allowlisted plugins (see `_config.yml`):

- **`jekyll-seo-tag`** — outputs meta tags via `{% seo %}` in `_includes/head.html`. Reads `page.title`/`page.description` (falling back to site-wide `title`/`description`), plus `site.url`.
- **`jekyll-sitemap`** — generates `/sitemap.xml` automatically at build time.
- **`jekyll-feed`** — generates `/feed.xml` (Atom) for blog posts automatically at build time.

`_includes/json-ld.html` additionally emits a `Person` schema.org JSON-LD block (name, contact links, `knowsAbout`, occupation) for richer search-engine understanding — update the `knowsAbout` skill list and `occupationLocation` there directly if they drift from reality.

---

## Deployment

Deployed to GitHub Pages via `.github/workflows/deploy.yml`:

- **Trigger:** any push to `main`, or manually via `workflow_dispatch`.
- **Build:** Ruby 3.3, `bundle exec jekyll build --destination ./_site` with `JEKYLL_ENV=production`.
- **Publish:** uploads `_site` as a Pages artifact and deploys via `actions/deploy-pages`.

Because this builds through a GitHub Actions workflow (not GitHub Pages' own legacy Jekyll build), the plugin allowlist restriction is somewhat moot in practice — but the `plugins:` list in `_config.yml` is still deliberately kept to the three that are on GitHub Pages' safe list, per the comment there, in case that ever changes.

No manual deploy steps needed — merging to `main` (or pushing directly) triggers a rebuild and redeploy.

---

## Common tasks

**Add a blog post**
Create `_posts/YYYY-MM-DD-my-slug.md` with `title` (and optionally `description`/`tags`) in front matter; everything above `<!--more-->` becomes the fallback excerpt.

**Log something in the media feed**
Create `_media/<slug>.md`. Minimum front matter: `title`, `type`, `date`. Add `status: in-progress` while working through it (auto-appears on `/now/`); remove/flip to `finished` and set the real `date` when done.

**Start a new poem**
Create `_poems/<slug>.md` with `title` + `date`. Leave `series` unset for a standalone poem, or set `series: <collection-slug>` + `series_part: N` to add it into an existing `_poetry_collections` entry.

**Start a new poetry collection**
Create `_poetry_collections/<slug>.md` with `title` + `date`; have poems reference it via `series: <slug>`.

**Add a photo album**
Create `_photo_albums/<slug>.md`, point `cover` and every `images[].src` at real files under `assets/images/`, then remove `published: false`.

**Add a code project**
Create `_code_projects/<slug>.md` with `title`, `date`, `description`, `status`, and optionally `stack` + `repo_url`.

**Update the resume**
Edit `_data/experience.yml` (work history), `_data/skills.yml` (skill groups), `_data/industries.yml` (focus-area pills), and the `resume:` block in `_config.yml` (current focus, recent roles). Contact details live under `author:` in `_config.yml`, shared with the rest of the site.

**Change the nav**
Edit `nav:` in `_config.yml`. Requires a server restart to see locally (`_config.yml` changes aren't hot-reloaded).

**Retheme colors**
Edit the CSS custom property values in `_sass/_theme.scss` (light/dark tokens). For the splash overlay specifically, edit `--splash-bg`/`--splash-fg`/`--splash-accent` in `assets/css/splash.css`.

---

## Standalone demo/reference pages

Two pages intentionally sit outside the normal Jekyll templating flow:

- **`demo.html`** — plain HTML/CSS/JS, no Jekyll front matter processing needed. Open it directly in a browser to preview the splash overlay in isolation, with a hardcoded tagline array standing in for `_data/taglines.yml`.
- **`comparison.html`** — `layout: null`, fully self-contained `<html>` document used as a visual reference/comparison tool for splash styling variants.

Neither is linked from site navigation and neither should need Jekyll's data layer to be useful for quick iteration on the splash visuals.
