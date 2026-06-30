# Splash overlay — integration

## 1. Preview it first
Open `demo.html` directly in a browser (just double-click it, no server
needed). That's the real splash.css/splash.js running, just with mock
page content behind it and a hardcoded phrase array instead of Jekyll's
data layer. "Replay splash" reloads the page so you can re-watch it.

## 2. Drop the files in
Copy into your Jekyll project, preserving the folder structure:

    _data/taglines.yml          -> _data/taglines.yml
    _includes/splash-head.html  -> _includes/splash-head.html
    _includes/splash.html       -> _includes/splash.html
    assets/css/splash.css       -> assets/css/splash.css
    assets/js/splash.js         -> assets/js/splash.js

If you already have files at any of those asset paths, just merge —
splash.css and splash.js are self-contained and don't depend on
anything else in your site.

## 3. Wire it into your layout
In your main layout (likely `_layouts/default.html`):

```html
<head>
  {% include splash-head.html %}
  <!-- ...your existing <head> content... -->
</head>
<body>
  {% include splash.html %}
  <!-- ...your existing page content... -->
</body>
```

`splash-head.html` should go as early as possible in `<head>` — it's
what prevents a flash of the overlay for anyone without JS.
`splash.html` should be the first thing inside `<body>`.

## 4. Edit phrases
Just edit `_data/taglines.yml` and refresh your browser. `jekyll serve`
picks up `_data` changes automatically — no restart required, which was
the whole point.

## 5. Retheme
Color tokens and the font-size clamp are flagged with `NOTE:` comments
at the top of `splash.css`. Swap `--splash-bg` / `--splash-fg` /
`--splash-accent` to match whatever palette you land on for the
portfolio redesign.
