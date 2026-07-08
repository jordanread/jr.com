---
title: "Example Album — delete or repurpose me"
date: 2026-07-05
description: >-
  Optional intro shown on the /projects/photography/ card and at the top of
  the album page.
cover: /assets/images/albums/example/cover.jpg
#published: false
# Optional. Free text, not a fixed set of choices — "Idea", "In
# progress", "Complete", whatever fits. Shown as a pill next to the
# type pill on /projects/photography/. Most useful on an album you're
# starting before there's a single photo picked for it yet.
#status: "Idea"
images:
  - src: /assets/images/albums/example/01.jpg
    alt: "Describe what's actually in this image for accessibility"
    caption: "Optional caption shown in the lightbox, under the image"
  - src: /assets/images/albums/example/02.jpg
    alt: "Second image description"
  - src: /assets/images/albums/example/03.jpg
    alt: "Third image description"
    caption: "captions are optional per image"
---

Free-form Markdown here becomes the intro text above the thumbnail
grid — theme/story behind the album, technical notes, whatever fits.
Leave it blank and the grid just starts right under the title.

`published: false` keeps this out of the build (and out of
`/projects/photography/`) since the image paths above are placeholders that
don't exist yet. Point `cover` and each `images[].src` at real files
under `assets/images/` before flipping this to `published: true`.
