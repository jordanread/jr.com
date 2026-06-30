# Jordan Read — Jekyll Site

A Jekyll port of the original single-file HTML resume site. Same look and
markup, but split into layouts, includes, Sass partials, and YAML data files
so content can be edited without touching templates.

## Structure

```
.
├── _config.yml          # Site title, author info, nav — edit this for most text changes
├── Gemfile
├── index.html            # Homepage, just assembles includes via the default layout
├── _layouts/
│   └── default.html      # <html>/<head>/<body> shell shared by all pages
├── _includes/
│   ├── head.html          # <head>, favicons, stylesheet link, SEO tag
│   ├── json-ld.html       # schema.org Person structured data
│   ├── header.html        # Top nav, driven by site.nav in _config.yml
│   ├── hero.html          # Name/title/summary + at-a-glance card
│   ├── about.html
│   ├── skills.html        # Loops over _data/skills.yml
│   ├── experience.html    # Loops over _data/experience.yml
│   ├── industries.html    # Loops over _data/industries.yml
│   ├── contact.html
│   └── footer.html
├── _data/
│   ├── skills.yml         # Grouped skill lists
│   ├── experience.yml     # Work history, one entry per role
│   └── industries.yml     # Industry/focus pills
├── _sass/
│   ├── _variables.scss    # Colors, fonts, breakpoints (was :root in the original)
│   ├── _base.scss         # Reset, page shell, buttons, pills, section card
│   ├── _header.scss
│   ├── _hero.scss
│   ├── _skills.scss
│   ├── _experience.scss
│   ├── _contact.scss      # Contact grid + footer
│   └── _responsive.scss   # Tablet breakpoint + print styles
└── assets/
    └── css/
        └── main.scss      # Entry point, imports partials in cascade order
```

## Editing content

You shouldn't need to touch any HTML/Liquid for routine updates:

- **Name, tagline, nav, social links, resume PDF path** → `_config.yml`
  (`author:` and `nav:` blocks).
- **Work history** → `_data/experience.yml`. Add a new entry at the top of
  the list for a new role; each entry is `company`, `dates`, `role`,
  `location`, `highlights` (list).
- **Skills** → `_data/skills.yml`, grouped under `group:`/`items:`.
- **Industries/focus pills** → `_data/industries.yml`, a flat list.
- **About copy, contact intro** → `_includes/about.html` and
  `_includes/contact.html`.

Email/phone/resume link are commented out in `_config.yml` by default
(`# email:`, `# phone:`, `# resume_pdf:`), matching the original file. Add a
real value and uncomment to make them appear in the hero card and contact
section — `email`/`phone` will also render in `contact.html` automatically
once set, no template edits needed. Same for `github:` — leave it `""` to
hide the GitHub link, or fill it in to show it.

## Styling

Colors, fonts, and spacing live in `_sass/_variables.scss` as Sass
variables (ported 1:1 from the original CSS custom properties). Change a
variable there and it cascades through every partial.

`assets/css/main.scss` is the only file Jekyll compiles directly — it just
`@import`s the partials in order. If you add a new partial, add the
`@import` line there too.

## Running locally

```bash
bundle install
bundle exec jekyll serve
```

Then visit `http://localhost:4000`.

## Building for production

```bash
bundle exec jekyll build
```

Output goes to `_site/`, ready to deploy to GitHub Pages, Netlify, or any
static host.

## Notes on what changed vs. the original

- Inline `<style>` and the inline JSON-LD `<script>` were extracted into
  Sass partials and a Liquid include, respectively.
- Hardcoded job/skill/industry markup became YAML data files looped over
  with Liquid `{% for %}` tags — same rendered HTML and classes, so the
  existing visual design carries over unchanged.
- `jekyll-seo-tag` and `jekyll-sitemap` are wired up in `_config.yml` for
  better default meta tags and an auto-generated `sitemap.xml`. Remove them
  from the `plugins:` list and `Gemfile` if you don't want them.
- Favicon links in `head.html` still point at `/apple-touch-icon.png`,
  `/favicon-32x32.png`, etc. — drop the actual icon files into the project
  root (or move them to `assets/` and update the paths) since they weren't
  included in the original source.
